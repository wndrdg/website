/* eslint-disable no-console */
/**
 * Backfills street/apt/state/city/zip on crm_contacts from the original
 * Vercel Blob signups/*.json records. Matches by email. Only fills in
 * fields that are currently null/empty on the contact — never overwrites
 * existing data.
 *
 * Run from repo root:
 *   SUPABASE_DB_URL=… BLOB_READ_WRITE_TOKEN=… npx tsx scripts/backfill-contact-addresses.ts
 */

import postgres from "postgres";
import { list } from "@vercel/blob";

const SUPABASE_DB_URL = process.env.SUPABASE_DB_URL;
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
if (!SUPABASE_DB_URL || !BLOB_TOKEN) {
  console.error("SUPABASE_DB_URL and BLOB_READ_WRITE_TOKEN required");
  process.exit(1);
}

type BlobSignup = {
  email?: string;
  name?: string;
  addressParts?: {
    street?: string;
    apt?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
};

async function main() {
  console.log("Phase 1: fetch all signup blobs");
  const { blobs } = await list({ prefix: "signups/", token: BLOB_TOKEN });
  console.log(`  found ${blobs.length} blobs`);

  const signups: BlobSignup[] = [];
  for (const b of blobs) {
    const res = await fetch(b.url, {
      headers: { Authorization: `Bearer ${BLOB_TOKEN}` },
    });
    if (!res.ok) continue;
    signups.push((await res.json()) as BlobSignup);
  }
  console.log(`  fetched ${signups.length} records`);

  // Keep the most recent signup per email (in case of dupes)
  const byEmail = new Map<string, BlobSignup>();
  for (const s of signups) {
    if (!s.email) continue;
    byEmail.set(s.email.toLowerCase(), s);
  }
  console.log(`  unique emails: ${byEmail.size}`);

  const sql = postgres(SUPABASE_DB_URL!, { ssl: "require" });
  try {
    let updated = 0;
    let skippedNoAddress = 0;
    let skippedNoMatch = 0;
    let alreadyHad = 0;

    for (const [email, s] of byEmail) {
      const parts = s.addressParts || {};
      if (!parts.street && !parts.apt && !parts.state) {
        skippedNoAddress++;
        continue;
      }

      // COALESCE so we never overwrite a non-null value already on the row.
      const result = await sql`
        UPDATE crm_contacts SET
          street = COALESCE(street, ${parts.street || null}),
          apt    = COALESCE(apt,    ${parts.apt || null}),
          city   = COALESCE(city,   ${parts.city || null}),
          state  = COALESCE(state,  ${parts.state || null}),
          zip    = COALESCE(zip,    ${parts.zip || null})
        WHERE lower(email) = ${email}
        RETURNING id, street, apt, state
      `;
      if (result.length === 0) {
        skippedNoMatch++;
      } else {
        const r = result[0];
        if (r.street || r.apt || r.state) {
          updated++;
        } else {
          alreadyHad++;
        }
      }
    }

    console.log("\nDone.");
    console.log(`  ${updated} contacts updated`);
    console.log(`  ${alreadyHad} already had address`);
    console.log(`  ${skippedNoMatch} no matching contact`);
    console.log(`  ${skippedNoAddress} signup had no address parts`);

    // Summary of state
    const filled = await sql<{ c: number }[]>`
      SELECT count(*)::int AS c FROM crm_contacts WHERE street IS NOT NULL
    `;
    console.log(`\n  contacts with street now: ${filled[0].c}`);
  } finally {
    await sql.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
