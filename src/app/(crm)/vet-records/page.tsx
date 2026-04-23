import { Card, CardContent, CardHeader, CardTitle } from "@/components/crm/ui/card";

export default function VetRecordsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Vet Records Requests</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">All Requests</CardTitle>
        </CardHeader>
        <CardContent className="h-96 flex items-center justify-center text-muted-foreground text-sm">
          Connect Supabase to populate
        </CardContent>
      </Card>
    </div>
  );
}
