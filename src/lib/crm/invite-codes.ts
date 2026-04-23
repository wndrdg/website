import { unstable_cache, revalidateTag } from "next/cache";
import { list, get } from "@vercel/blob";

export type InviteCodeMeta = {
  description?: string;
  note?: string;
  created?: string;
};

const TAG = "invite-codes";

// Fetches every invite code's metadata from Vercel Blob in one shot, then
// caches the whole map for 5 minutes (or until invalidated). This used to
// run on every /waitlist render — list+get+parse for ~20 blobs adding
// 2-4 seconds of latency. Now: cached, ~0ms after warm-up.
export const getAllInviteCodes = unstable_cache(
  async (): Promise<Record<string, InviteCodeMeta>> => {
    const result: Record<string, InviteCodeMeta> = {};
    try {
      const { blobs } = await list({ prefix: "codes/" });
      await Promise.all(
        blobs.map(async (b) => {
          try {
            const resp = await get(b.url, { access: "private" });
            if (!resp) return;
            const text = await new Response(resp.stream).text();
            const data = JSON.parse(text);
            if (typeof data?.code === "string") {
              result[data.code] = {
                description: data.description,
                note: data.note,
                created: data.created,
              };
            }
          } catch {
            /* skip one bad blob */
          }
        }),
      );
    } catch {
      /* return whatever we got */
    }
    return result;
  },
  ["invite-codes:all"],
  { revalidate: 300, tags: [TAG] },
);

// Call this from any code that mutates an invite code (create/update/delete)
// to drop the cache so the next read sees fresh data.
export function invalidateInviteCodesCache() {
  // Next 16 added a second arg ('max' | 'stale') governing how aggressively
  // to invalidate. 'max' is the strict-purge behavior we want.
  revalidateTag(TAG, "max");
}
