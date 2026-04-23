import { list } from "@vercel/blob";

async function main() {
  const t = process.env.BLOB_READ_WRITE_TOKEN!;
  const { blobs } = await list({ prefix: "signups/", token: t });
  let withParts = 0,
    withAddrString = 0,
    withZipOnly = 0,
    withNothing = 0,
    total = 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const byEmail = new Map<string, any>();
  for (const b of blobs) {
    const r = await fetch(b.url, { headers: { Authorization: `Bearer ${t}` } });
    if (!r.ok) continue;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = (await r.json()) as any;
    if (!s.email) continue;
    byEmail.set(s.email.toLowerCase(), s);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const samples: any[] = [];
  for (const [email, s] of byEmail) {
    total++;
    const ap = s.addressParts || {};
    const hasStreet = !!(ap.street && ap.street.trim());
    const hasAddrStr = !!(
      s.address &&
      typeof s.address === "string" &&
      s.address.trim() &&
      s.address.trim() !== (ap.zip || s.zip)
    );
    const hasZip = !!(ap.zip || s.zip);
    if (hasStreet) withParts++;
    else if (hasAddrStr) withAddrString++;
    else if (hasZip) withZipOnly++;
    else withNothing++;
    if (!hasStreet && hasAddrStr && samples.length < 5)
      samples.push({ email, address: s.address, zip: ap.zip || s.zip });
  }
  console.log("total unique signups:", total);
  console.log("  with addressParts.street:", withParts);
  console.log("  with only address string:", withAddrString);
  console.log("  with only zip:           ", withZipOnly);
  console.log("  with nothing:            ", withNothing);
  console.log("\nSamples that had address string but no parts:");
  for (const s of samples) console.log(" ", s);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
