import { createServerClient } from "@/lib/crm/supabase/server";

interface LogRequestInput {
  customerId: string;
  dogId: string;
  clinicName: string | null;
  clinicEmail: string | null;
  clinicPhone?: string | null;
  clinicFax?: string | null;
  createdBy: string | null;
}

interface LogRequestResult {
  request: { id: string; follow_up_count: number };
  note: { id: string };
}

export async function logVetRecordsRequest({
  customerId,
  dogId,
  clinicName,
  clinicEmail,
  clinicPhone,
  clinicFax,
  createdBy,
}: LogRequestInput): Promise<LogRequestResult> {
  const supabase = createServerClient();
  const now = new Date().toISOString();

  const { count } = await supabase
    .from("crm_vet_records_requests")
    .select("id", { count: "exact", head: true })
    .eq("contact_id", customerId)
    .eq("dog_id", dogId);

  const requestNumber = (count ?? 0) + 1;

  const { data: request, error: reqErr } = await supabase
    .from("crm_vet_records_requests")
    .insert({
      contact_id: customerId,
      dog_id: dogId,
      vet_clinic_name: clinicName,
      vet_clinic_email: clinicEmail,
      vet_clinic_phone: clinicPhone ?? null,
      vet_clinic_fax: clinicFax ?? null,
      status: "requested",
      requested_at: now,
      follow_up_count: 0,
    })
    .select("id, follow_up_count")
    .single();

  if (reqErr || !request) {
    throw new Error(`Failed to create vet records request: ${reqErr?.message}`);
  }

  const channel = clinicEmail ? "email" : clinicFax ? "fax" : clinicPhone ? "phone" : "unknown";
  const destination = clinicEmail ?? clinicFax ?? clinicPhone ?? "unknown";

  const body = `Vet records request #${requestNumber} — ${channel} to ${destination}${clinicName ? ` (${clinicName})` : ""}`;

  const { data: note, error: noteErr } = await supabase
    .from("crm_notes")
    .insert({
      contact_id: customerId,
      dog_id: dogId,
      body,
      is_pinned: false,
      created_by: createdBy,
      kind: "system",
      event_type: "vet_records_requested",
      metadata: {
        request_id: request.id,
        request_number: requestNumber,
        clinic_name: clinicName,
        clinic_email: clinicEmail,
        clinic_phone: clinicPhone,
        clinic_fax: clinicFax,
        channel,
        destination,
      },
    })
    .select("id")
    .single();

  if (noteErr || !note) {
    throw new Error(`Failed to create system note: ${noteErr?.message}`);
  }

  await supabase
    .from("crm_dogs")
    .update({ vet_records_requested_at: now })
    .eq("id", dogId);

  return { request, note };
}
