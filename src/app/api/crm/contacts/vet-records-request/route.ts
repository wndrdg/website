import { NextRequest, NextResponse } from "next/server";
import { logVetRecordsRequest } from "@/lib/crm/vet-records";

export async function POST(req: NextRequest) {
  try {
    const {
      contact_id,
      dog_id,
      clinic_name,
      clinic_email,
      clinic_phone,
      clinic_fax,
      created_by,
    } = await req.json();

    if (!contact_id || !dog_id) {
      return NextResponse.json({ error: "Missing contact_id or dog_id" }, { status: 400 });
    }

    const result = await logVetRecordsRequest({
      customerId: contact_id,
      dogId: dog_id,
      clinicName: clinic_name ?? null,
      clinicEmail: clinic_email ?? null,
      clinicPhone: clinic_phone ?? null,
      clinicFax: clinic_fax ?? null,
      createdBy: created_by ?? null,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
