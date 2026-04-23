import { createServerClient } from "@/lib/crm/supabase/server";
import { VetReviewView } from "@/components/crm/vet-review/VetReviewView";

export const dynamic = "force-dynamic";

// Fake lab results per customer
const LAB_RESULTS = [
  {
    summary: "Overall healthy panel. Mild elevation in ALT suggests monitoring liver function. All other markers within normal limits. Weight and hydration status are good.",
    markers: [
      { name: "ALT (Alanine Aminotransferase)", value: "118", unit: "U/L", range: "10-125", status: "normal" },
      { name: "AST (Aspartate Aminotransferase)", value: "42", unit: "U/L", range: "0-50", status: "normal" },
      { name: "ALP (Alkaline Phosphatase)", value: "85", unit: "U/L", range: "23-212", status: "normal" },
      { name: "BUN (Blood Urea Nitrogen)", value: "18", unit: "mg/dL", range: "7-27", status: "normal" },
      { name: "Creatinine", value: "1.2", unit: "mg/dL", range: "0.5-1.8", status: "normal" },
      { name: "Glucose", value: "95", unit: "mg/dL", range: "74-143", status: "normal" },
      { name: "Total Protein", value: "6.8", unit: "g/dL", range: "5.2-8.2", status: "normal" },
      { name: "Albumin", value: "3.4", unit: "g/dL", range: "2.3-4.0", status: "normal" },
      { name: "Calcium", value: "10.2", unit: "mg/dL", range: "7.9-12.0", status: "normal" },
      { name: "Phosphorus", value: "4.5", unit: "mg/dL", range: "2.5-6.8", status: "normal" },
      { name: "WBC (White Blood Cells)", value: "12.5", unit: "K/uL", range: "5.5-16.9", status: "normal" },
      { name: "RBC (Red Blood Cells)", value: "7.2", unit: "M/uL", range: "5.5-8.5", status: "normal" },
      { name: "Hemoglobin", value: "16.8", unit: "g/dL", range: "12-18", status: "normal" },
      { name: "Hematocrit", value: "48", unit: "%", range: "37-55", status: "normal" },
      { name: "Platelet Count", value: "285", unit: "K/uL", range: "175-500", status: "normal" },
    ],
  },
  {
    summary: "Elevated BUN and creatinine levels indicate early kidney stress. Recommend increased hydration monitoring and follow-up panel in 4 weeks. Liver enzymes and CBC within normal limits.",
    markers: [
      { name: "ALT (Alanine Aminotransferase)", value: "72", unit: "U/L", range: "10-125", status: "normal" },
      { name: "AST (Aspartate Aminotransferase)", value: "38", unit: "U/L", range: "0-50", status: "normal" },
      { name: "ALP (Alkaline Phosphatase)", value: "145", unit: "U/L", range: "23-212", status: "normal" },
      { name: "BUN (Blood Urea Nitrogen)", value: "32", unit: "mg/dL", range: "7-27", status: "high" },
      { name: "Creatinine", value: "2.1", unit: "mg/dL", range: "0.5-1.8", status: "high" },
      { name: "Glucose", value: "102", unit: "mg/dL", range: "74-143", status: "normal" },
      { name: "Total Protein", value: "7.1", unit: "g/dL", range: "5.2-8.2", status: "normal" },
      { name: "Albumin", value: "3.0", unit: "g/dL", range: "2.3-4.0", status: "normal" },
      { name: "Calcium", value: "11.1", unit: "mg/dL", range: "7.9-12.0", status: "normal" },
      { name: "Phosphorus", value: "7.2", unit: "mg/dL", range: "2.5-6.8", status: "high" },
      { name: "WBC (White Blood Cells)", value: "10.8", unit: "K/uL", range: "5.5-16.9", status: "normal" },
      { name: "RBC (Red Blood Cells)", value: "6.8", unit: "M/uL", range: "5.5-8.5", status: "normal" },
      { name: "Hemoglobin", value: "15.2", unit: "g/dL", range: "12-18", status: "normal" },
      { name: "Hematocrit", value: "44", unit: "%", range: "37-55", status: "normal" },
      { name: "Platelet Count", value: "310", unit: "K/uL", range: "175-500", status: "normal" },
    ],
  },
  {
    summary: "Slightly low albumin and total protein. Could indicate dietary insufficiency or mild GI absorption issues. Recommend nutritional assessment. All other values unremarkable.",
    markers: [
      { name: "ALT (Alanine Aminotransferase)", value: "55", unit: "U/L", range: "10-125", status: "normal" },
      { name: "AST (Aspartate Aminotransferase)", value: "29", unit: "U/L", range: "0-50", status: "normal" },
      { name: "ALP (Alkaline Phosphatase)", value: "98", unit: "U/L", range: "23-212", status: "normal" },
      { name: "BUN (Blood Urea Nitrogen)", value: "14", unit: "mg/dL", range: "7-27", status: "normal" },
      { name: "Creatinine", value: "0.9", unit: "mg/dL", range: "0.5-1.8", status: "normal" },
      { name: "Glucose", value: "88", unit: "mg/dL", range: "74-143", status: "normal" },
      { name: "Total Protein", value: "4.9", unit: "g/dL", range: "5.2-8.2", status: "low" },
      { name: "Albumin", value: "2.1", unit: "g/dL", range: "2.3-4.0", status: "low" },
      { name: "Calcium", value: "9.5", unit: "mg/dL", range: "7.9-12.0", status: "normal" },
      { name: "Phosphorus", value: "3.8", unit: "mg/dL", range: "2.5-6.8", status: "normal" },
      { name: "WBC (White Blood Cells)", value: "14.2", unit: "K/uL", range: "5.5-16.9", status: "normal" },
      { name: "RBC (Red Blood Cells)", value: "7.0", unit: "M/uL", range: "5.5-8.5", status: "normal" },
      { name: "Hemoglobin", value: "15.8", unit: "g/dL", range: "12-18", status: "normal" },
      { name: "Hematocrit", value: "46", unit: "%", range: "37-55", status: "normal" },
      { name: "Platelet Count", value: "245", unit: "K/uL", range: "175-500", status: "normal" },
    ],
  },
];

export default async function VetReviewPage() {
  const supabase = createServerClient();

  const { data: customers } = await supabase
    .from("crm_customers")
    .select("*, crm_dogs(*)")
    .eq("lifecycle_stage", "labs_need_approval")
    .order("created_at", { ascending: false });

  // Attach fake lab results to each customer
  const customersWithLabs = (customers ?? []).map((c: any, i: number) => ({
    ...c,
    labResults: LAB_RESULTS[i % LAB_RESULTS.length],
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Vet Review</h1>
        <p className="text-sm text-muted-foreground">
          {customersWithLabs.length} pending approval
        </p>
      </div>
      <VetReviewView customers={customersWithLabs} />
    </div>
  );
}
