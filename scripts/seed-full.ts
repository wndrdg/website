// Run with: source .env.local && npx tsx scripts/seed-full.ts
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!url || !key) { console.error("Missing env vars"); process.exit(1); }

const supabase = createClient(url, key);

const FIRST_NAMES = ["Emma","Liam","Olivia","Noah","Ava","Ethan","Sophia","Mason","Isabella","James","Mia","Alexander","Charlotte","Benjamin","Amelia","Daniel","Harper","Henry","Evelyn","Sebastian","Luna","Jack","Ella","Owen","Scarlett","Aiden","Grace","Samuel","Chloe","Lucas","Riley","Carter","Zoey","Jayden","Nora","Dylan","Lily","Luke","Eleanor","Caleb","Hannah","Isaac","Addison","Nathan","Aubrey","Ryan","Stella","Adrian","Natalie","Miles","Savannah","Leo","Brooklyn","Eli","Leah","Mateo","Hazel","Aaron","Violet"];
const LAST_NAMES = ["Smith","Johnson","Williams","Brown","Jones","Garcia","Miller","Davis","Rodriguez","Martinez","Hernandez","Lopez","Wilson","Anderson","Thomas","Taylor","Moore","Jackson","Martin","Lee","Perez","Thompson","White","Harris","Sanchez","Clark","Ramirez","Lewis","Robinson","Walker","Young","Allen","King","Wright","Scott","Torres","Nguyen","Hill","Flores","Green","Adams","Nelson","Baker","Hall","Rivera","Campbell","Mitchell","Carter","Roberts"];
const DOG_NAMES = ["Cooper","Luna","Bella","Max","Daisy","Charlie","Lucy","Buddy","Sadie","Rocky","Molly","Bear","Maggie","Duke","Bailey","Tucker","Sophie","Jack","Chloe","Oliver","Penny","Leo","Rosie","Zeus","Ruby","Milo","Stella","Finn","Lola","Winston","Nala","Murphy","Ellie","Teddy","Willow","Gus","Piper","Louie","Coco","Beau","Hazel","Hank","Pepper","Scout","Olive","Jasper","Pearl","Archie","Maple","Bruno"];
const BREEDS = ["Golden Retriever","Labrador Retriever","French Bulldog","German Shepherd","Poodle","Bulldog","Beagle","Rottweiler","Dachshund","Corgi","Australian Shepherd","Siberian Husky","Boxer","Great Dane","Doberman","Shih Tzu","Bernese Mountain Dog","Cavalier King Charles","Border Collie","Cocker Spaniel","Miniature Schnauzer","Pomeranian","Havanese","Maltese","Boston Terrier"];
const CITIES: [string, string, string][] = [
  ["Los Angeles","CA","90028"],["Santa Monica","CA","90401"],["Silver Lake","CA","90026"],["Venice","CA","90291"],["Culver City","CA","90232"],["Burbank","CA","91502"],["Pasadena","CA","91101"],["Manhattan Beach","CA","90266"],["Echo Park","CA","90026"],["West Hollywood","CA","90069"],
  ["San Francisco","CA","94102"],["Oakland","CA","94612"],["Berkeley","CA","94704"],
  ["Brooklyn","NY","11201"],["Manhattan","NY","10001"],["Williamsburg","NY","11249"],
  ["Austin","TX","78701"],["Dallas","TX","75201"],["Houston","TX","77001"],
  ["Denver","CO","80202"],["Boulder","CO","80301"],
  ["Portland","OR","97201"],["Seattle","WA","98101"],
  ["Chicago","IL","60601"],["Nashville","TN","37201"],["Miami","FL","33101"],["Atlanta","GA","30301"],
];
const SOURCES = ["instagram","referral","tiktok","google","friend","pr","organic","facebook","podcast","vet_referral"];
const VET_CLINICS = ["VCA West LA","Banfield Pet Hospital","BluePearl","Animal Medical Center","City Vet","Pacific Palisades Vet","Downtown Animal Care","Sunset Vet Clinic","Westside Animal Hospital","Happy Paws Vet"];
const CONDITIONS = ["allergies","hip dysplasia","hypothyroidism","arthritis","diabetes","epilepsy","heart murmur","luxating patella","skin issues","anxiety"];
const MEDS = ["apoquel","carprofen","gabapentin","trazodone","methimazole","insulin","phenobarbital","prednisone","rimadyl","bravecto"];
const SUPPLEMENTS = ["fish oil","glucosamine","probiotics","joint support","CoQ10","turmeric","digestive enzymes","CBD oil","multivitamin","omega-3"];
const VITALITY = ["Sprouting","Thriving","Comfort","Vitality","Balanced"];

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}
function rand(min: number, max: number): number { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randDecimal(min: number, max: number): number { return +(min + Math.random() * (max - min)).toFixed(1); }
function pastDate(daysAgo: number): string {
  const d = new Date(); d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
}
function futureDate(daysAhead: number): string {
  const d = new Date(); d.setDate(d.getDate() + daysAhead);
  return d.toISOString().split("T")[0];
}

// Lifecycle stages with rough distribution
const CUSTOMER_STAGES: { stage: string; weight: number }[] = [
  { stage: "activated", weight: 5 },
  { stage: "onboarding", weight: 4 },
  { stage: "dog_added", weight: 6 },
  { stage: "vet_details_added", weight: 5 },
  { stage: "medical_records_uploaded", weight: 4 },
  { stage: "vet_records_requested", weight: 4 },
  { stage: "vet_records_received", weight: 3 },
  { stage: "blood_panel_scheduling", weight: 3 },
  { stage: "blood_panel_scheduled", weight: 4 },
  { stage: "blood_panel_complete_awaiting_labs", weight: 3 },
  { stage: "blood_panel_labs_received_pending_review", weight: 4 },
  { stage: "vet_approved", weight: 3 },
  { stage: "vet_rejected", weight: 2 },
];

function pickWeightedStage(): string {
  const total = CUSTOMER_STAGES.reduce((s, c) => s + c.weight, 0);
  let r = Math.random() * total;
  for (const cs of CUSTOMER_STAGES) {
    r -= cs.weight;
    if (r <= 0) return cs.stage;
  }
  return "activated";
}

async function main() {
  console.log("Clearing existing data...");
  // Delete in order (foreign keys)
  await supabase.from("crm_customer_events").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("crm_notes").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("crm_blood_draws").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("crm_vet_records_requests").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("crm_waitlist").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("crm_dogs").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("crm_customers").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("crm_users").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  console.log("✅ Cleared");

  // CRM User
  const { data: user } = await supabase
    .from("crm_users")
    .insert({ email: "pat@wonder.dog", name: "Patrick Riley", role: "admin" })
    .select().single();
  console.log("✅ CRM User:", user!.name);

  // ─── 50 Customers ───
  const usedNames = new Set<string>();
  const customerRows: any[] = [];

  // Patrick first
  customerRows.push({
    email: "pat@wonder.dog", phone: "+13109685158",
    first_name: "Patrick", last_name: "Riley",
    city: "Los Angeles", state: "CA", zip: "90028",
    lifecycle_stage: "vet_approved", tags: ["founder","beta"],
    assigned_agent_id: user!.id, is_active: true,
    created_at: pastDate(90),
  });
  usedNames.add("Patrick Riley");

  for (let i = 1; i < 50; i++) {
    let fn: string, ln: string;
    do {
      fn = pick(FIRST_NAMES);
      ln = pick(LAST_NAMES);
    } while (usedNames.has(`${fn} ${ln}`));
    usedNames.add(`${fn} ${ln}`);

    const [city, state, zip] = pick(CITIES);
    const stage = pickWeightedStage();
    const tags: string[] = [];
    if (Math.random() < 0.15) tags.push("vip");
    if (Math.random() < 0.2) tags.push("beta");
    if (Math.random() < 0.1) tags.push("influencer");

    customerRows.push({
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}@${pick(["gmail.com","icloud.com","outlook.com","yahoo.com"])}`,
      phone: `+1${rand(200,999)}${rand(200,999)}${rand(1000,9999)}`,
      first_name: fn, last_name: ln,
      city, state, zip,
      lifecycle_stage: stage,
      tags,
      assigned_agent_id: user!.id,
      is_active: true,
      created_at: pastDate(rand(1, 120)),
    });
  }

  const { data: customers, error: custErr } = await supabase.from("crm_customers").insert(customerRows).select();
  if (custErr) { console.error("Customers:", custErr.message); process.exit(1); }
  console.log(`✅ ${customers!.length} customers`);

  // ─── Dogs (one per customer) ───
  const dogRows = customers!.map((c: any) => {
    const stage = c.lifecycle_stage;
    const hasVetDetails = ["vet_details_added","medical_records_uploaded","vet_records_requested","vet_records_received","blood_panel_scheduling","blood_panel_scheduled","blood_panel_complete_awaiting_labs","blood_panel_labs_received_pending_review","vet_approved","vet_rejected"].includes(stage);
    const hasMedRecords = ["medical_records_uploaded","vet_records_requested","vet_records_received","blood_panel_scheduling","blood_panel_scheduled","blood_panel_complete_awaiting_labs","blood_panel_labs_received_pending_review","vet_approved","vet_rejected"].includes(stage);
    const numConditions = Math.random() < 0.3 ? rand(1, 2) : 0;
    const numMeds = numConditions > 0 ? rand(0, 2) : 0;
    const numSupps = Math.random() < 0.5 ? rand(1, 3) : 0;

    return {
      customer_id: c.id,
      name: pick(DOG_NAMES),
      breed: pick(BREEDS),
      age_years: randDecimal(0.5, 14),
      weight_lbs: randDecimal(5, 120),
      sex: pick(["male","female","male_neutered","female_spayed"]),
      vitality_status: hasVetDetails ? pick(VITALITY) : null,
      has_vet_records: hasMedRecords,
      vet_clinic_name: hasVetDetails ? pick(VET_CLINICS) : null,
      vet_clinic_phone: hasVetDetails ? `+1${rand(200,999)}${rand(200,999)}${rand(1000,9999)}` : null,
      known_conditions: pickN(CONDITIONS, numConditions),
      medications: pickN(MEDS, numMeds),
      supplements: pickN(SUPPLEMENTS, numSupps),
      vet_records_requested_at: ["vet_records_requested","vet_records_received","blood_panel_scheduling","blood_panel_scheduled","blood_panel_complete_awaiting_labs","blood_panel_labs_received_pending_review","vet_approved","vet_rejected"].includes(stage) ? pastDate(rand(5, 30)) : null,
      vet_records_received_at: ["vet_records_received","blood_panel_scheduling","blood_panel_scheduled","blood_panel_complete_awaiting_labs","blood_panel_labs_received_pending_review","vet_approved","vet_rejected"].includes(stage) ? pastDate(rand(1, 15)) : null,
    };
  });

  const { data: dogs, error: dogErr } = await supabase.from("crm_dogs").insert(dogRows).select();
  if (dogErr) { console.error("Dogs:", dogErr.message); process.exit(1); }
  console.log(`✅ ${dogs!.length} dogs`);

  // ─── Blood Draws ───
  const bloodDrawCustomers = customers!.filter((c: any) =>
    ["blood_panel_scheduling","blood_panel_scheduled","blood_panel_complete_awaiting_labs","blood_panel_labs_received_pending_review","vet_approved","vet_rejected"].includes(c.lifecycle_stage)
  );
  const bloodDrawRows = bloodDrawCustomers.map((c: any) => {
    const dog = dogs!.find((d: any) => d.customer_id === c.id)!;
    const stage = c.lifecycle_stage;

    let status = "scheduled";
    if (stage === "blood_panel_scheduling") status = "scheduled";
    if (stage === "blood_panel_scheduled") status = "confirmed";
    if (stage === "blood_panel_complete_awaiting_labs") status = "completed";
    if (stage === "blood_panel_labs_received_pending_review") status = "vet_review";
    if (stage === "vet_approved") status = "approved";
    if (stage === "vet_rejected") status = "vet_review"; // stays in review

    return {
      customer_id: c.id,
      dog_id: dog.id,
      status,
      scheduled_date: status === "scheduled" ? futureDate(rand(1, 14)) : pastDate(rand(1, 30)).split("T")[0],
      scheduled_time_start: `${rand(8, 14)}:00`,
      scheduled_time_end: `${rand(15, 18)}:00`,
      scheduled_address: `${rand(100, 9999)} ${pick(["Main St","Oak Ave","Elm Dr","Sunset Blvd","Wilshire Blvd","Highland Ave","Venice Blvd","Melrose Ave"])}`,
      scheduled_city: c.city,
      scheduled_zip: c.zip,
      lab_partner: pick(["antech", "affordable_pet_labs"]),
      draw_completed_at: ["completed","vet_review","approved"].includes(status) ? pastDate(rand(1, 14)) : null,
      lab_results_received_at: ["vet_review","approved"].includes(status) ? pastDate(rand(1, 7)) : null,
      vet_reviewer_id: status === "approved" ? user!.id : null,
      vet_review_completed_at: status === "approved" ? pastDate(rand(0, 3)) : null,
      vet_approved: status === "approved" ? true : (stage === "vet_rejected" ? false : null),
      vet_review_notes: status === "approved" ? "All markers within normal range. Healthy dog." : (stage === "vet_rejected" ? "ALT levels elevated — recommend retest in 2 weeks." : null),
    };
  });

  if (bloodDrawRows.length > 0) {
    const { error: bdErr } = await supabase.from("crm_blood_draws").insert(bloodDrawRows);
    if (bdErr) console.error("Blood draws:", bdErr.message);
    else console.log(`✅ ${bloodDrawRows.length} blood draws`);
  }

  // ─── Vet Records Requests ───
  const vetReqCustomers = customers!.filter((c: any) =>
    ["vet_records_requested","vet_records_received","blood_panel_scheduling","blood_panel_scheduled","blood_panel_complete_awaiting_labs","blood_panel_labs_received_pending_review","vet_approved","vet_rejected"].includes(c.lifecycle_stage)
  );
  const vetReqRows = vetReqCustomers.map((c: any) => {
    const dog = dogs!.find((d: any) => d.customer_id === c.id)!;
    const received = c.lifecycle_stage !== "vet_records_requested";
    return {
      customer_id: c.id,
      dog_id: dog.id,
      vet_clinic_name: dog.vet_clinic_name,
      vet_clinic_phone: dog.vet_clinic_phone,
      status: received ? "received" : pick(["requested", "follow_up"]),
      requested_at: pastDate(rand(10, 40)),
      follow_up_count: rand(0, 3),
      received_at: received ? pastDate(rand(1, 15)) : null,
    };
  });

  if (vetReqRows.length > 0) {
    const { error: vrErr } = await supabase.from("crm_vet_records_requests").insert(vetReqRows);
    if (vrErr) console.error("Vet records requests:", vrErr.message);
    else console.log(`✅ ${vetReqRows.length} vet records requests`);
  }

  // ─── Events ───
  const eventRows: any[] = [];
  for (const c of customers!) {
    eventRows.push({ customer_id: c.id, event_type: "account_created", event_data: {}, created_at: c.created_at });

    const stageIndex = CUSTOMER_STAGES.findIndex(s => s.stage === c.lifecycle_stage);
    if (stageIndex >= 1) eventRows.push({ customer_id: c.id, event_type: "app_downloaded", event_data: {}, created_at: pastDate(rand(30, 80)) });
    if (stageIndex >= 2) {
      const dog = dogs!.find((d: any) => d.customer_id === c.id);
      eventRows.push({ customer_id: c.id, dog_id: dog?.id, event_type: "dog_added", event_data: { dog_name: dog?.name }, created_at: pastDate(rand(20, 60)) });
    }
    if (stageIndex >= 5) eventRows.push({ customer_id: c.id, event_type: "vet_records_requested", event_data: {}, created_at: pastDate(rand(10, 40)) });
    if (stageIndex >= 6) eventRows.push({ customer_id: c.id, event_type: "vet_records_received", event_data: {}, created_at: pastDate(rand(5, 20)) });
    if (stageIndex >= 8) eventRows.push({ customer_id: c.id, event_type: "blood_draw_scheduled", event_data: {}, created_at: pastDate(rand(5, 15)) });
    if (stageIndex >= 9) eventRows.push({ customer_id: c.id, event_type: "blood_draw_completed", event_data: {}, created_at: pastDate(rand(1, 10)) });
    if (stageIndex >= 11) eventRows.push({ customer_id: c.id, event_type: "vet_review_approved", event_data: {}, created_by: user!.id, created_at: pastDate(rand(0, 5)) });
  }

  const { error: evErr } = await supabase.from("crm_customer_events").insert(eventRows);
  if (evErr) console.error("Events:", evErr.message);
  else console.log(`✅ ${eventRows.length} events`);

  // ─── Notes ───
  const noteCustomers = customers!.filter(() => Math.random() < 0.4);
  const noteTexts = [
    "Prefers morning appointments",
    "Very responsive via text",
    "Referred by a friend — give VIP treatment",
    "Dog is anxious at vet visits, needs gentle handling",
    "Follow up next week about blood panel results",
    "Interested in nutrition coaching add-on",
    "Has questions about supplement recommendations",
    "Dog recently switched food — monitor weight",
    "Owner travels frequently, flexible scheduling needed",
    "Previous bad experience with mobile vet — be extra careful",
    "Wants to add second dog to plan next month",
    "Very detail-oriented, likes thorough explanations",
  ];
  const noteRows = noteCustomers.map((c: any) => ({
    customer_id: c.id,
    body: pick(noteTexts),
    is_pinned: Math.random() < 0.3,
    created_by: user!.id,
  }));

  if (noteRows.length > 0) {
    const { error: nErr } = await supabase.from("crm_notes").insert(noteRows);
    if (nErr) console.error("Notes:", nErr.message);
    else console.log(`✅ ${noteRows.length} notes`);
  }

  // ─── 55 Waitlist Entries ───
  const waitlistRows: any[] = [];
  const usedWlNames = new Set<string>();

  for (let i = 0; i < 55; i++) {
    let fn: string, ln: string;
    do {
      fn = pick(FIRST_NAMES);
      ln = pick(LAST_NAMES);
    } while (usedWlNames.has(`${fn} ${ln}`) || usedNames.has(`${fn} ${ln}`));
    usedWlNames.add(`${fn} ${ln}`);

    const [city, , zip] = pick(CITIES);

    waitlistRows.push({
      customer_id: null,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}@${pick(["gmail.com","icloud.com","outlook.com","yahoo.com"])}`,
      phone: `+1${rand(200,999)}${rand(200,999)}${rand(1000,9999)}`,
      first_name: fn, last_name: ln,
      city, zip,
      dog_name: pick(DOG_NAMES),
      dog_breed: pick(BREEDS),
      source: pick(SOURCES),
      position: i + 1,
      status: "waiting",
      created_at: pastDate(rand(1, 60)),
    });
  }

  const { error: wlErr } = await supabase.from("crm_waitlist").insert(waitlistRows);
  if (wlErr) console.error("Waitlist:", wlErr.message);
  else console.log(`✅ ${waitlistRows.length} waitlist entries`);

  console.log("\n🎉 Full dataset loaded!");
}

main().catch(err => { console.error(err); process.exit(1); });
