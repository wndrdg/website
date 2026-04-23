/* eslint-disable no-console */
/**
 * One-shot: applies migration 007 (contact-centric refactor) against the
 * live Supabase, merges crm_waitlist rows into crm_contacts (matching by
 * email), drops crm_waitlist, and seeds one demo vet.
 *
 * Run from repo root:
 *   SUPABASE_DB_URL="…" npx tsx scripts/migrate-to-contacts.ts
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import postgres from "postgres";

const SUPABASE_DB_URL = process.env.SUPABASE_DB_URL;
if (!SUPABASE_DB_URL) {
  console.error("SUPABASE_DB_URL not set");
  process.exit(1);
}

async function main() {
  const sql = postgres(SUPABASE_DB_URL!, { ssl: "require" });

  try {
    console.log("Phase 1: Apply migration 007");
    const migrationSql = readFileSync(
      resolve(process.cwd(), "supabase/migrations/007_contact_centric_refactor.sql"),
      "utf8",
    );
    await sql.unsafe(migrationSql);
    console.log("  ✓ schema applied");

    console.log("\nPhase 2: Merge crm_waitlist rows into crm_contacts");
    const waitlist = await sql<
      Array<{
        id: string;
        email: string;
        phone: string | null;
        first_name: string | null;
        last_name: string | null;
        zip: string | null;
        city: string | null;
        dog_name: string | null;
        dog_breed: string | null;
        source: string | null;
        referral_code: string | null;
        utm_source: string | null;
        utm_medium: string | null;
        utm_campaign: string | null;
        sms_consent: boolean;
        created_at: string;
      }>
    >`SELECT * FROM crm_waitlist`;
    console.log(`  ${waitlist.length} waitlist rows to merge`);

    let updated = 0;
    let inserted = 0;
    for (const w of waitlist) {
      const existing = await sql<{ id: string }[]>`
        SELECT id FROM crm_contacts WHERE lower(email) = lower(${w.email}) LIMIT 1
      `;
      if (existing.length > 0) {
        const id = existing[0].id;
        await sql`
          UPDATE crm_contacts SET
            is_waitlist   = true,
            phone         = COALESCE(phone, ${w.phone}),
            first_name    = COALESCE(first_name, ${w.first_name}),
            last_name     = COALESCE(last_name, ${w.last_name}),
            zip           = COALESCE(zip, ${w.zip}),
            city          = COALESCE(city, ${w.city}),
            dog_name      = COALESCE(dog_name, ${w.dog_name}),
            dog_breed     = COALESCE(dog_breed, ${w.dog_breed}),
            waitlist_source = COALESCE(waitlist_source, ${w.source}),
            referral_code = COALESCE(referral_code, ${w.referral_code}),
            utm_source    = COALESCE(utm_source, ${w.utm_source}),
            utm_medium    = COALESCE(utm_medium, ${w.utm_medium}),
            utm_campaign  = COALESCE(utm_campaign, ${w.utm_campaign}),
            sms_consent   = sms_consent OR ${w.sms_consent}
          WHERE id = ${id}
        `;
        updated++;
      } else {
        await sql`
          INSERT INTO crm_contacts (
            email, phone, first_name, last_name, zip, city,
            dog_name, dog_breed, waitlist_source, referral_code,
            utm_source, utm_medium, utm_campaign, sms_consent,
            lifecycle_stage, is_waitlist, created_at
          ) VALUES (
            ${w.email}, ${w.phone}, ${w.first_name}, ${w.last_name},
            ${w.zip}, ${w.city}, ${w.dog_name}, ${w.dog_breed},
            ${w.source}, ${w.referral_code},
            ${w.utm_source}, ${w.utm_medium}, ${w.utm_campaign},
            ${w.sms_consent}, 'waitlist', true, ${w.created_at}
          )
        `;
        inserted++;
      }
    }
    console.log(`  ✓ merged: ${updated} updated, ${inserted} inserted`);

    console.log("\nPhase 3: Drop crm_waitlist");
    await sql`DROP TABLE crm_waitlist`;
    console.log("  ✓ table dropped");

    console.log("\nPhase 4: Seed a demo vet");
    const vetCount = await sql<{ c: number }[]>`SELECT count(*)::int AS c FROM crm_vets`;
    if (vetCount[0].c === 0) {
      await sql`
        INSERT INTO crm_vets (name, email, phone, license_state, is_active) VALUES
        ('Dr. Elena Reyes (demo)', 'elena.reyes@wonder.dog', '+13105551001', 'CA', true)
      `;
      console.log("  ✓ inserted 1 demo vet");
    } else {
      console.log(`  ✓ crm_vets already has ${vetCount[0].c} rows, skipping`);
    }

    console.log("\nFinal state:");
    const counts = await sql<{ t: string; c: number }[]>`
      SELECT 'contacts (total)'     AS t, count(*)::int AS c FROM crm_contacts
      UNION ALL SELECT 'contacts (is_waitlist)',  count(*)::int FROM crm_contacts WHERE is_waitlist
      UNION ALL SELECT 'contacts (is_customer)',  count(*)::int FROM crm_contacts WHERE is_customer
      UNION ALL SELECT 'contacts (is_beta)',      count(*)::int FROM crm_contacts WHERE is_beta
      UNION ALL SELECT 'contacts (last_contact)', count(*)::int FROM crm_contacts WHERE last_contact_at IS NOT NULL
      UNION ALL SELECT 'dogs',                    count(*)::int FROM crm_dogs
      UNION ALL SELECT 'vets',                    count(*)::int FROM crm_vets
      UNION ALL SELECT 'vet_techs',               count(*)::int FROM crm_vet_techs
      UNION ALL SELECT 'appointments',            count(*)::int FROM crm_appointments
      UNION ALL SELECT 'blood_draws',             count(*)::int FROM crm_blood_draws
      UNION ALL SELECT 'notes',                   count(*)::int FROM crm_notes
      UNION ALL SELECT 'sms_messages',            count(*)::int FROM crm_sms_messages
      UNION ALL SELECT 'customer_events',         count(*)::int FROM crm_customer_events
    `;
    for (const r of counts) console.log(`  ${r.t.padEnd(30)} ${r.c}`);
  } finally {
    await sql.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
