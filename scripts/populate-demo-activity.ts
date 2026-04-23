/* eslint-disable no-console */
/**
 * Populate demo activity for the 4 demo customers so the /customers
 * table (which filters out rows with no last_contact_at) renders with
 * realistic UI state. Safe to re-run: deletes existing demo activity
 * for the 4 customers first, then re-inserts.
 */

import postgres from "postgres";

const SUPABASE_DB_URL = process.env.SUPABASE_DB_URL;
if (!SUPABASE_DB_URL) {
  console.error("SUPABASE_DB_URL not set");
  process.exit(1);
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}
function hoursAgo(n: number): Date {
  const d = new Date();
  d.setHours(d.getHours() - n);
  return d;
}

async function main() {
  const sql = postgres(SUPABASE_DB_URL!, { ssl: "require" });

  try {
    // Fetch demo customers + their first dog + a vet tech
    const customers = await sql<
      { id: string; first_name: string; dog_id: string | null; dog_name: string | null; stage: string }[]
    >`
      SELECT
        c.id,
        c.first_name,
        c.lifecycle_stage AS stage,
        (SELECT id FROM crm_dogs WHERE customer_id = c.id ORDER BY created_at LIMIT 1) AS dog_id,
        (SELECT name FROM crm_dogs WHERE customer_id = c.id ORDER BY created_at LIMIT 1) AS dog_name
      FROM crm_customers c
      WHERE c.last_name LIKE '%(demo)%'
      ORDER BY c.created_at
    `;
    console.log(`found ${customers.length} demo customers: ${customers.map((c) => c.first_name).join(", ")}`);

    const techs = await sql<{ id: string }[]>`SELECT id FROM crm_vet_techs LIMIT 1`;
    if (techs.length === 0) {
      console.error("no vet_techs present; bail");
      return;
    }
    const techId = techs[0].id;

    console.log("clearing prior demo activity for these customers…");
    const ids = customers.map((c) => c.id);
    await sql`DELETE FROM crm_sms_messages WHERE customer_id = ANY(${ids})`;
    await sql`DELETE FROM crm_notes WHERE customer_id = ANY(${ids})`;
    await sql`DELETE FROM crm_customer_events WHERE customer_id = ANY(${ids})`;
    await sql`DELETE FROM crm_appointments WHERE customer_id = ANY(${ids})`;
    await sql`DELETE FROM crm_blood_draws WHERE customer_id = ANY(${ids})`;

    let smsCount = 0;
    let noteCount = 0;
    let eventCount = 0;
    let apptCount = 0;
    let drawCount = 0;

    for (let i = 0; i < customers.length; i++) {
      const c = customers[i];
      const dogName = c.dog_name || "their dog";

      // Events
      await sql`
        INSERT INTO crm_customer_events (customer_id, dog_id, event_type, event_data, created_at) VALUES
        (${c.id}, ${c.dog_id}, 'waitlist_signup', ${sql.json({ source: "website" })}, ${daysAgo(14 + i)}),
        (${c.id}, ${c.dog_id}, 'invited',        ${sql.json({})},                  ${daysAgo(7 + i)}),
        (${c.id}, ${c.dog_id}, 'app_onboarded',  ${sql.json({})},                  ${daysAgo(5 + i)})
      `;
      eventCount += 3;

      // Notes (one pinned)
      await sql`
        INSERT INTO crm_notes (customer_id, body, is_pinned, created_at) VALUES
        (${c.id}, ${`(demo) ${c.first_name} is excited about the pilot — follow up weekly.`}, true, ${daysAgo(4)}),
        (${c.id}, ${`(demo) ${dogName} has no known conditions; owner provided clean vet records.`}, false, ${daysAgo(2)})
      `;
      noteCount += 2;

      // SMS thread — 4 messages mixed
      await sql`
        INSERT INTO crm_sms_messages (customer_id, direction, from_number, to_number, body, status, is_automated, created_at) VALUES
        (${c.id}, 'outbound', '+14243534937', '+15555550100', ${`Hi ${c.first_name}! This is Wonderdog. Excited to have ${dogName} joining our pilot.`}, 'delivered', true, ${daysAgo(3)}),
        (${c.id}, 'inbound',  '+15555550100', '+14243534937', ${`Thanks! When can we schedule the blood draw?`}, 'received', false, ${daysAgo(3)}),
        (${c.id}, 'outbound', '+14243534937', '+15555550100', ${`We've got openings this week. Will send booking link shortly.`}, 'delivered', false, ${hoursAgo(30)}),
        (${c.id}, 'inbound',  '+15555550100', '+14243534937', ${`Perfect, thank you!`}, 'received', false, ${hoursAgo(2)})
      `;
      smsCount += 4;

      // Last contact mirrors the most recent inbound
      await sql`
        UPDATE crm_customers
        SET last_contact_at = ${hoursAgo(2)},
            notes_count = 2
        WHERE id = ${c.id}
      `;

      // Give Mason (onboarded) and Nathan (lab_scheduled) an appointment
      if (c.stage === "onboarded" || c.stage === "lab_scheduled") {
        await sql`
          INSERT INTO crm_appointments (customer_id, dog_id, vet_tech_id, appointment_date, start_time, end_time, status, created_at) VALUES
          (${c.id}, ${c.dog_id}, ${techId}, ${daysAgo(-3)}, '10:00', '11:00', 'scheduled', ${daysAgo(1)})
        `;
        apptCount++;
      }

      // Give Jayden (labs_pending) and Ethan (lab_complete) a blood draw in progress or done
      if (c.stage === "labs_pending") {
        await sql`
          INSERT INTO crm_blood_draws (customer_id, dog_id, status, scheduled_date, created_at) VALUES
          (${c.id}, ${c.dog_id}, 'results_processing', ${daysAgo(2)}, ${daysAgo(3)})
        `;
        drawCount++;
      }
      if (c.stage === "lab_complete") {
        await sql`
          INSERT INTO crm_blood_draws (customer_id, dog_id, status, scheduled_date, created_at) VALUES
          (${c.id}, ${c.dog_id}, 'delivered', ${daysAgo(10)}, ${daysAgo(12)})
        `;
        drawCount++;
      }
    }

    console.log(`inserted: ${eventCount} events, ${noteCount} notes, ${smsCount} sms, ${apptCount} appts, ${drawCount} draws`);

    // Summary
    const counts = await sql<{ t: string; c: number }[]>`
      SELECT 'customers' AS t, count(*)::int AS c FROM crm_customers
      UNION ALL SELECT 'customers_with_last_contact', count(*)::int FROM crm_customers WHERE last_contact_at IS NOT NULL
      UNION ALL SELECT 'appointments', count(*)::int FROM crm_appointments
      UNION ALL SELECT 'blood_draws', count(*)::int FROM crm_blood_draws
      UNION ALL SELECT 'notes', count(*)::int FROM crm_notes
      UNION ALL SELECT 'sms_messages', count(*)::int FROM crm_sms_messages
      UNION ALL SELECT 'customer_events', count(*)::int FROM crm_customer_events
    `;
    console.log("\nfinal state:");
    for (const row of counts) console.log(`  ${row.t.padEnd(30)} ${row.c}`);
  } finally {
    await sql.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
