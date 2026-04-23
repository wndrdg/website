/* eslint-disable no-console */
/**
 * One-shot migration:
 *  1. Add `sms_consent` column to crm_waitlist (IF NOT EXISTS)
 *  2. Pick 4 demo customers, 2 demo vet_techs, 2 demo vet_records_requests
 *  3. Nuke everything else across crm_appointments, crm_blood_draws,
 *     crm_notes, crm_sms_messages, crm_customer_events, crm_waitlist,
 *     crm_vet_records_requests, crm_customers, crm_vet_techs
 *  4. Append " (demo)" to the retained rows so they're self-labeling
 *  5. Pull every /signups/*.json out of Vercel Blob and INSERT into
 *     crm_waitlist with source='website'
 *
 * Run from the repo root:
 *   npx tsx scripts/migrate-waitlist-to-supabase.ts
 */

import postgres from "postgres";
import { list } from "@vercel/blob";

const SUPABASE_DB_URL = process.env.SUPABASE_DB_URL;
if (!SUPABASE_DB_URL) {
  console.error("SUPABASE_DB_URL not set in env");
  process.exit(1);
}

const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
if (!BLOB_TOKEN) {
  console.error("BLOB_READ_WRITE_TOKEN not set in env");
  process.exit(1);
}

type BlobSignup = {
  email?: string;
  name?: string;
  zip?: string;
  phone?: string;
  smsConsent?: boolean;
  invite_code?: string;
  address?: string;
  addressParts?: {
    street?: string;
    apt?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
  dogs?: Array<{ name?: string; breed?: string; weight?: string; age?: string }>;
  contactPreference?: string;
  date?: string;
};

function splitName(full: string | undefined): { first: string | null; last: string | null } {
  if (!full) return { first: null, last: null };
  const parts = full.trim().split(/\s+/);
  if (parts.length === 0) return { first: null, last: null };
  if (parts.length === 1) return { first: parts[0], last: null };
  return { first: parts[0], last: parts.slice(1).join(" ") };
}

async function main() {
  const sql = postgres(SUPABASE_DB_URL!, { ssl: "require" });

  try {
    console.log("═══════════════════════════════════════════════════════════════");
    console.log("Phase 1: Schema migration");
    console.log("═══════════════════════════════════════════════════════════════");

    await sql`ALTER TABLE crm_waitlist ADD COLUMN IF NOT EXISTS sms_consent BOOLEAN DEFAULT false`;
    console.log("  ✓ crm_waitlist.sms_consent ensured");

    console.log("");
    console.log("═══════════════════════════════════════════════════════════════");
    console.log("Phase 2: Pick retainees");
    console.log("═══════════════════════════════════════════════════════════════");

    // 4 demo customers — pick one each from the most common lifecycle stages if possible
    const stages = await sql<{ lifecycle_stage: string; c: number }[]>`
      SELECT lifecycle_stage, count(*)::int AS c
      FROM crm_customers
      GROUP BY lifecycle_stage
      ORDER BY c DESC
    `;
    console.log(`  stages found: ${stages.map((s) => `${s.lifecycle_stage}(${s.c})`).join(", ")}`);

    const customerIds: string[] = [];
    for (const stage of stages) {
      if (customerIds.length >= 4) break;
      const pick = await sql<{ id: string }[]>`
        SELECT id FROM crm_customers
        WHERE lifecycle_stage = ${stage.lifecycle_stage}
        ORDER BY created_at
        LIMIT 1
      `;
      if (pick.length) customerIds.push(pick[0].id);
    }
    // Top up if we got fewer than 4 (only 2-3 stages exist, say)
    if (customerIds.length < 4) {
      const more = await sql<{ id: string }[]>`
        SELECT id FROM crm_customers
        WHERE id NOT IN ${sql(customerIds.length ? customerIds : ["00000000-0000-0000-0000-000000000000"])}
        ORDER BY created_at
        LIMIT ${4 - customerIds.length}
      `;
      customerIds.push(...more.map((m) => m.id));
    }
    console.log(`  ✓ keeping ${customerIds.length} customers: ${customerIds.join(", ")}`);

    // 2 vet_techs
    const techs = await sql<{ id: string }[]>`SELECT id FROM crm_vet_techs ORDER BY created_at LIMIT 2`;
    const techIds = techs.map((t) => t.id);
    console.log(`  ✓ keeping ${techIds.length} vet_techs: ${techIds.join(", ")}`);

    // 2 vet_records_requests — prefer those tied to kept customers
    const reqsTied = await sql<{ id: string }[]>`
      SELECT id FROM crm_vet_records_requests
      WHERE customer_id = ANY(${customerIds})
      ORDER BY requested_at NULLS LAST
      LIMIT 2
    `;
    let reqIds = reqsTied.map((r) => r.id);
    if (reqIds.length < 2) {
      // Repoint some untied ones to our retained customers so the demo has 2
      const needed = 2 - reqIds.length;
      const orphans = await sql<{ id: string }[]>`
        SELECT id FROM crm_vet_records_requests
        WHERE id <> ALL(${reqIds.length ? reqIds : ["00000000-0000-0000-0000-000000000000"]})
        ORDER BY requested_at NULLS LAST
        LIMIT ${needed}
      `;
      for (let i = 0; i < orphans.length; i++) {
        // Repoint to a retained customer (round-robin among them)
        const targetCustomer = customerIds[i % customerIds.length];
        // Also need to repoint dog_id if the dog belongs to the deleted customer.
        // Pick any dog of the target customer, else NULL (but schema has dog_id references crm_dogs)
        const targetDog = await sql<{ id: string }[]>`
          SELECT id FROM crm_dogs WHERE customer_id = ${targetCustomer} LIMIT 1
        `;
        await sql`
          UPDATE crm_vet_records_requests
          SET customer_id = ${targetCustomer},
              dog_id = ${targetDog[0]?.id || null}
          WHERE id = ${orphans[i].id}
        `;
        reqIds.push(orphans[i].id);
      }
    }
    console.log(`  ✓ keeping ${reqIds.length} vet_records_requests: ${reqIds.join(", ")}`);

    console.log("");
    console.log("═══════════════════════════════════════════════════════════════");
    console.log("Phase 3: Nuke fake data");
    console.log("═══════════════════════════════════════════════════════════════");

    const delAppts = await sql`DELETE FROM crm_appointments`;
    console.log(`  ✓ deleted ${delAppts.count} crm_appointments`);

    const delDraws = await sql`DELETE FROM crm_blood_draws`;
    console.log(`  ✓ deleted ${delDraws.count} crm_blood_draws`);

    const delNotes = await sql`DELETE FROM crm_notes`;
    console.log(`  ✓ deleted ${delNotes.count} crm_notes`);

    const delSms = await sql`DELETE FROM crm_sms_messages`;
    console.log(`  ✓ deleted ${delSms.count} crm_sms_messages`);

    const delEvents = await sql`DELETE FROM crm_customer_events`;
    console.log(`  ✓ deleted ${delEvents.count} crm_customer_events`);

    const delWaitlist = await sql`DELETE FROM crm_waitlist`;
    console.log(`  ✓ deleted ${delWaitlist.count} crm_waitlist`);

    const delReqs = await sql`DELETE FROM crm_vet_records_requests WHERE id <> ALL(${reqIds})`;
    console.log(`  ✓ deleted ${delReqs.count} crm_vet_records_requests (kept ${reqIds.length})`);

    const delCusts = await sql`DELETE FROM crm_customers WHERE id <> ALL(${customerIds})`;
    console.log(`  ✓ deleted ${delCusts.count} crm_customers (kept ${customerIds.length})`);

    const delTechs = await sql`DELETE FROM crm_vet_techs WHERE id <> ALL(${techIds})`;
    console.log(`  ✓ deleted ${delTechs.count} crm_vet_techs (kept ${techIds.length})`);

    console.log("");
    console.log("═══════════════════════════════════════════════════════════════");
    console.log("Phase 4: Label retainees with (demo)");
    console.log("═══════════════════════════════════════════════════════════════");

    await sql`
      UPDATE crm_customers
      SET last_name = last_name || ' (demo)'
      WHERE id = ANY(${customerIds})
        AND (last_name IS NULL OR last_name NOT LIKE '%(demo)%')
    `;
    console.log("  ✓ customers tagged");

    await sql`
      UPDATE crm_vet_techs
      SET name = name || ' (demo)'
      WHERE id = ANY(${techIds})
        AND name NOT LIKE '%(demo)%'
    `;
    console.log("  ✓ vet_techs tagged");

    console.log("");
    console.log("═══════════════════════════════════════════════════════════════");
    console.log("Phase 5: Pull Blob signups and INSERT into crm_waitlist");
    console.log("═══════════════════════════════════════════════════════════════");

    const { blobs } = await list({ prefix: "signups/", token: BLOB_TOKEN });
    console.log(`  found ${blobs.length} blobs`);

    const signups: BlobSignup[] = [];
    for (const b of blobs) {
      const res = await fetch(b.url, {
        headers: { Authorization: `Bearer ${BLOB_TOKEN}` },
      });
      if (!res.ok) {
        console.warn(`  ✗ failed to fetch ${b.pathname}: ${res.status}`);
        continue;
      }
      signups.push((await res.json()) as BlobSignup);
    }
    console.log(`  fetched ${signups.length} signup records`);

    let inserted = 0;
    const skipped: string[] = [];
    for (const s of signups) {
      if (!s.email) {
        skipped.push(`(no email) ${s.date}`);
        continue;
      }
      const { first, last } = splitName(s.name);
      const zip = s.addressParts?.zip || s.zip || null;
      const city = s.addressParts?.city || null;
      const dogName = s.dogs?.[0]?.name || null;
      const dogBreed = s.dogs?.[0]?.breed || null;
      const createdAt = s.date ? new Date(s.date) : new Date();

      await sql`
        INSERT INTO crm_waitlist (
          email, phone, first_name, last_name, zip, city,
          dog_name, dog_breed, source, referral_code,
          sms_consent, created_at, status
        ) VALUES (
          ${s.email}, ${s.phone || null}, ${first}, ${last},
          ${zip}, ${city}, ${dogName}, ${dogBreed},
          'website', ${s.invite_code || null},
          ${!!s.smsConsent}, ${createdAt}, 'waiting'
        )
      `;
      inserted++;
    }
    console.log(`  ✓ inserted ${inserted} waitlist rows`);
    if (skipped.length) {
      console.log(`  ✗ skipped ${skipped.length} malformed: ${skipped.slice(0, 5).join(", ")}${skipped.length > 5 ? "..." : ""}`);
    }

    console.log("");
    console.log("═══════════════════════════════════════════════════════════════");
    console.log("Final state");
    console.log("═══════════════════════════════════════════════════════════════");

    const counts = await sql<{ t: string; c: number }[]>`
      SELECT 'customers' AS t, count(*)::int AS c FROM crm_customers
      UNION ALL SELECT 'dogs', count(*)::int FROM crm_dogs
      UNION ALL SELECT 'vet_techs', count(*)::int FROM crm_vet_techs
      UNION ALL SELECT 'vet_records_requests', count(*)::int FROM crm_vet_records_requests
      UNION ALL SELECT 'appointments', count(*)::int FROM crm_appointments
      UNION ALL SELECT 'blood_draws', count(*)::int FROM crm_blood_draws
      UNION ALL SELECT 'notes', count(*)::int FROM crm_notes
      UNION ALL SELECT 'sms_messages', count(*)::int FROM crm_sms_messages
      UNION ALL SELECT 'customer_events', count(*)::int FROM crm_customer_events
      UNION ALL SELECT 'waitlist', count(*)::int FROM crm_waitlist
    `;
    for (const row of counts) {
      console.log(`  ${row.t.padEnd(22)} ${row.c}`);
    }
  } finally {
    await sql.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
