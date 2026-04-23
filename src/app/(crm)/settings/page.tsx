import { Card, CardContent, CardHeader, CardTitle } from "@/components/crm/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/crm/ui/tabs";
import { createServerClient } from "@/lib/crm/supabase/server";
import { AgentSettings } from "@/components/crm/settings/AgentSettings";

// 60s cache; router.refresh() purges on mutations.
export const revalidate = 60;

export default async function SettingsPage() {
  const supabase = createServerClient();
  const { data: config } = await supabase
    .from("crm_agent_config")
    .select("enabled")
    .eq("id", 1)
    .single();

  const agentEnabled = config?.enabled ?? true;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Settings</h1>

      <Tabs defaultValue="agent">
        <TabsList>
          <TabsTrigger value="agent">Agent</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="sms-templates">SMS Templates</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="waitlist">Waitlist</TabsTrigger>
        </TabsList>

        <TabsContent value="agent">
          <AgentSettings initialEnabled={agentEnabled} />
        </TabsContent>

        <TabsContent value="team">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            </CardHeader>
            <CardContent className="h-48 flex items-center justify-center text-muted-foreground text-sm">
              Connect Supabase to populate
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sms-templates">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">SMS Templates</CardTitle>
            </CardHeader>
            <CardContent className="h-48 flex items-center justify-center text-muted-foreground text-sm">
              Connect Supabase to populate
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Integrations</CardTitle>
            </CardHeader>
            <CardContent className="h-48 flex items-center justify-center text-muted-foreground text-sm">
              Twilio, App Store Connect, Supabase status
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="waitlist">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Waitlist Settings</CardTitle>
            </CardHeader>
            <CardContent className="h-48 flex items-center justify-center text-muted-foreground text-sm">
              Default templates, TestFlight group, auto-assign
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
