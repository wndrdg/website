import { Card, CardContent, CardHeader, CardTitle } from "@/components/crm/ui/card";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Customer Detail</h1>
      <p className="text-sm text-muted-foreground">ID: {id}</p>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Left — Timeline */}
        <div className="lg:col-span-3 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Timeline</CardTitle>
            </CardHeader>
            <CardContent className="h-96 flex items-center justify-center text-muted-foreground text-sm">
              Connect Supabase to populate
            </CardContent>
          </Card>
        </div>

        {/* Right — Dog, Notes */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Dog Profile</CardTitle>
            </CardHeader>
            <CardContent className="h-32 flex items-center justify-center text-muted-foreground text-sm">
              Connect Supabase to populate
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Notes</CardTitle>
            </CardHeader>
            <CardContent className="h-32 flex items-center justify-center text-muted-foreground text-sm">
              Connect Supabase to populate
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
