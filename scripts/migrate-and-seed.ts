// Run with: npx tsx scripts/migrate-and-seed.ts
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join } from "path";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(url, key, {
  db: { schema: "public" },
});

async function runSQL(sql: string): Promise<void> {
  const { error } = await supabase.rpc("exec_sql", { sql_text: sql });
  if (error) {
    // rpc might not exist, try via postgrest
    throw error;
  }
}

async function main() {
  console.log("Running migration via Supabase SQL Editor...");
  console.log("URL:", url);

  // Read migration file
  const migrationPath = join(__dirname, "..", "supabase", "migrations", "001_crm_tables.sql");
  const migrationSQL = readFileSync(migrationPath, "utf-8");

  // Execute via the Supabase Management API (SQL endpoint)
  const res = await fetch(`${url}/rest/v1/rpc/exec_sql`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({ sql_text: migrationSQL }),
  });

  if (!res.ok) {
    console.log("rpc/exec_sql not available, using pg_net or direct approach...");
    console.log("Status:", res.status, await res.text());
    console.log("\n⚠️  You need to run the migration SQL manually.");
    console.log("Go to Supabase Dashboard → SQL Editor → paste the contents of:");
    console.log("  supabase/migrations/001_crm_tables.sql");
    console.log("\nThen re-run this script with: npx tsx scripts/migrate-and-seed.ts --seed-only");

    if (process.argv.includes("--seed-only")) {
      console.log("\n--seed-only flag detected, proceeding to seed...\n");
    } else {
      process.exit(1);
    }
  } else {
    console.log("✅ Migration applied successfully!");
  }

  // Seed data
  console.log("\nSeeding data...");

  // 1. CRM User (you)
  const { data: user, error: userErr } = await supabase
    .from("crm_users")
    .upsert({ email: "pat@wonder.dog", name: "Patrick Riley", role: "admin" }, { onConflict: "email" })
    .select()
    .single();

  if (userErr) {
    console.error("Failed to create CRM user:", userErr.message);
    process.exit(1);
  }
  console.log("✅ CRM User:", user.name, user.id);

  // 2. Customers
  const customers = [
    { first_name: "Patrick", last_name: "Riley", email: "pat@wonder.dog", phone: "+13109685158", city: "Los Angeles", state: "CA", zip: "90028", lifecycle_stage: "dog_added", tags: ["founder", "beta"], assigned_agent_id: user.id },
    { first_name: "Sarah", last_name: "Chen", email: "sarah.chen@gmail.com", phone: "+13105551234", city: "Santa Monica", state: "CA", zip: "90401", lifecycle_stage: "blood_draw_scheduled", tags: ["vip"], assigned_agent_id: user.id },
    { first_name: "Marcus", last_name: "Johnson", email: "marcus.j@outlook.com", phone: "+13235559876", city: "Silver Lake", state: "CA", zip: "90026", lifecycle_stage: "results_delivered", tags: ["beta"], assigned_agent_id: user.id },
    { first_name: "Emily", last_name: "Tanaka", email: "emily.t@icloud.com", phone: "+14155553456", city: "San Francisco", state: "CA", zip: "94102", lifecycle_stage: "onboarding", tags: [], assigned_agent_id: user.id },
    { first_name: "Jake", last_name: "Morrison", email: "jake.m@gmail.com", phone: "+12135557890", city: "Echo Park", state: "CA", zip: "90026", lifecycle_stage: "waitlist", waitlist_position: 1, waitlist_source: "instagram", tags: [], assigned_agent_id: user.id },
    { first_name: "Priya", last_name: "Patel", email: "priya.p@yahoo.com", phone: "+13105554321", city: "Venice", state: "CA", zip: "90291", lifecycle_stage: "waitlist", waitlist_position: 2, waitlist_source: "referral", tags: [], assigned_agent_id: user.id },
    { first_name: "Tom", last_name: "Williams", email: "tom.w@gmail.com", phone: "+18185556789", city: "Burbank", state: "CA", zip: "91502", lifecycle_stage: "invited", tags: [], assigned_agent_id: user.id },
    { first_name: "Rachel", last_name: "Kim", email: "rachel.k@gmail.com", phone: "+13105558765", city: "Culver City", state: "CA", zip: "90232", lifecycle_stage: "vet_records_requested", tags: ["influencer"], assigned_agent_id: user.id },
  ];

  const { data: insertedCustomers, error: custErr } = await supabase
    .from("crm_customers")
    .insert(customers)
    .select();

  if (custErr) {
    console.error("Failed to seed customers:", custErr.message);
    process.exit(1);
  }
  console.log(`✅ ${insertedCustomers.length} customers seeded`);

  // Map customers by last name for linking
  const custMap = Object.fromEntries(insertedCustomers.map((c: any) => [c.last_name, c]));

  // 3. Dogs
  const dogs = [
    { customer_id: custMap.Riley.id, name: "Cooper", breed: "Golden Retriever", age_years: 4, weight_lbs: 72, sex: "male_neutered", vitality_status: "Thriving", has_vet_records: true, known_conditions: [], medications: [], supplements: ["fish oil", "glucosamine"] },
    { customer_id: custMap.Chen.id, name: "Luna", breed: "French Bulldog", age_years: 3, weight_lbs: 24, sex: "female_spayed", vitality_status: "Sprouting", has_vet_records: true, known_conditions: ["allergies"], medications: ["apoquel"], supplements: [] },
    { customer_id: custMap.Johnson.id, name: "Bear", breed: "Bernese Mountain Dog", age_years: 6, weight_lbs: 95, sex: "male_neutered", vitality_status: "Comfort", has_vet_records: true, known_conditions: ["hip dysplasia"], medications: ["carprofen"], supplements: ["joint support"] },
    { customer_id: custMap.Tanaka.id, name: "Mochi", breed: "Shiba Inu", age_years: 2, weight_lbs: 22, sex: "female", vitality_status: null, has_vet_records: false, known_conditions: [], medications: [], supplements: [] },
    { customer_id: custMap.Kim.id, name: "Biscuit", breed: "Corgi", age_years: 5, weight_lbs: 28, sex: "male_neutered", vitality_status: "Thriving", has_vet_records: false, vet_clinic_name: "West LA Vet", vet_clinic_phone: "+13105559999", known_conditions: [], medications: [], supplements: [] },
  ];

  const { data: insertedDogs, error: dogErr } = await supabase
    .from("crm_dogs")
    .insert(dogs)
    .select();

  if (dogErr) {
    console.error("Failed to seed dogs:", dogErr.message);
    process.exit(1);
  }
  console.log(`✅ ${insertedDogs.length} dogs seeded`);

  const dogMap = Object.fromEntries(insertedDogs.map((d: any) => [d.name, d]));

  // 4. Customer events
  const events = [
    { customer_id: custMap.Riley.id, event_type: "waitlist_joined", event_data: { source: "founder" }, created_by: user.id },
    { customer_id: custMap.Riley.id, event_type: "invited", event_data: {}, created_by: user.id },
    { customer_id: custMap.Riley.id, event_type: "app_downloaded", event_data: {}, created_by: null },
    { customer_id: custMap.Riley.id, dog_id: dogMap.Cooper.id, event_type: "dog_added", event_data: { dog_name: "Cooper" }, created_by: null },
    { customer_id: custMap.Chen.id, event_type: "waitlist_joined", event_data: { source: "instagram" }, created_by: null },
    { customer_id: custMap.Chen.id, event_type: "invited", event_data: {}, created_by: user.id },
    { customer_id: custMap.Chen.id, event_type: "app_downloaded", event_data: {}, created_by: null },
    { customer_id: custMap.Chen.id, dog_id: dogMap.Luna.id, event_type: "dog_added", event_data: { dog_name: "Luna" }, created_by: null },
    { customer_id: custMap.Chen.id, dog_id: dogMap.Luna.id, event_type: "blood_draw_scheduled", event_data: { date: "2026-04-02" }, created_by: user.id },
    { customer_id: custMap.Johnson.id, event_type: "results_delivered", event_data: { dog_name: "Bear" }, created_by: user.id },
    { customer_id: custMap.Morrison.id, event_type: "waitlist_joined", event_data: { source: "instagram" }, created_by: null },
    { customer_id: custMap.Patel.id, event_type: "waitlist_joined", event_data: { source: "referral" }, created_by: null },
  ];

  const { error: eventErr } = await supabase.from("crm_customer_events").insert(events);
  if (eventErr) {
    console.error("Failed to seed events:", eventErr.message);
    process.exit(1);
  }
  console.log(`✅ ${events.length} events seeded`);

  // 5. Blood draw for Sarah/Luna
  const { error: drawErr } = await supabase.from("crm_blood_draws").insert({
    customer_id: custMap.Chen.id,
    dog_id: dogMap.Luna.id,
    status: "scheduled",
    scheduled_date: "2026-04-02",
    scheduled_time_start: "09:00",
    scheduled_time_end: "10:00",
    scheduled_address: "123 Ocean Ave",
    scheduled_city: "Santa Monica",
    scheduled_zip: "90401",
    lab_partner: "antech",
  });
  if (drawErr) console.error("Failed to seed blood draw:", drawErr.message);
  else console.log("✅ Blood draw seeded");

  // 6. Waitlist entries
  const waitlistEntries = [
    { customer_id: custMap.Morrison.id, email: "jake.m@gmail.com", phone: "+12135557890", first_name: "Jake", last_name: "Morrison", city: "Echo Park", zip: "90026", dog_name: "Rex", dog_breed: "German Shepherd", source: "instagram", position: 1, status: "waiting" },
    { customer_id: custMap.Patel.id, email: "priya.p@yahoo.com", phone: "+13105554321", first_name: "Priya", last_name: "Patel", city: "Venice", zip: "90291", dog_name: "Kali", dog_breed: "Labrador", source: "referral", position: 2, status: "waiting" },
  ];

  const { error: wlErr } = await supabase.from("crm_waitlist").insert(waitlistEntries);
  if (wlErr) console.error("Failed to seed waitlist:", wlErr.message);
  else console.log("✅ Waitlist entries seeded");

  // 7. Notes
  const { error: noteErr } = await supabase.from("crm_notes").insert([
    { customer_id: custMap.Riley.id, body: "Founder account — priority support", is_pinned: true, created_by: user.id },
    { customer_id: custMap.Chen.id, body: "Luna has seasonal allergies, prefers morning appointments", is_pinned: false, created_by: user.id },
    { customer_id: custMap.Johnson.id, body: "Bear's hip dysplasia is being managed well. Vet says results look stable.", is_pinned: true, created_by: user.id },
  ]);
  if (noteErr) console.error("Failed to seed notes:", noteErr.message);
  else console.log("✅ Notes seeded");

  console.log("\n🎉 Done! Your CRM is loaded with test data.");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
