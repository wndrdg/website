import { createBrowserClient } from "./client";
import type { RealtimeChannel } from "@supabase/supabase-js";

const supabase = createBrowserClient();

export function subscribeToInserts(
  channelName: string,
  table: string,
  handler: (payload: { new: Record<string, unknown> }) => void,
  filter?: string,
): RealtimeChannel {
  return supabase
    .channel(channelName)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table, filter } as const,
      handler,
    )
    .subscribe();
}

export function subscribeToUpdates(
  channelName: string,
  table: string,
  handler: (payload: { new: Record<string, unknown>; old: Record<string, unknown> }) => void,
  filter?: string,
): RealtimeChannel {
  return supabase
    .channel(channelName)
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table, filter } as const,
      handler,
    )
    .subscribe();
}

export function unsubscribe(channel: RealtimeChannel) {
  supabase.removeChannel(channel);
}
