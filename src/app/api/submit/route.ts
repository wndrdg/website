import { Resend } from "resend";
import { put } from "@vercel/blob";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const entry = {
      ...body,
      id: Date.now(),
    };

    // Save to Vercel Blob
    const timestamp = new Date().toISOString();
    const safeName = (body.contact?.name || "unknown")
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase();
    const pathname = `vibe-check/${timestamp}-${safeName}.json`;

    try {
      await put(pathname, JSON.stringify(entry, null, 2), {
        access: "private",
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: "application/json",
      });
    } catch (blobErr) {
      console.error("Blob write failed:", blobErr);
    }

    // Send notification email via Resend
    try {
      await resend.emails.send({
        from: "Vibe Check <notifications@wonder.dog>",
        to: "pat@wonder.dog",
        subject: `New vibe check: ${body.contact?.name} (${body.meta?.elapsed_seconds}s)`,
        html: `
          <h2>${body.contact?.name}</h2>
          <p><strong>Email:</strong> ${body.contact?.email}</p>
          <p><strong>Phone:</strong> ${body.contact?.phone}</p>
          <p><strong>Timezone:</strong> ${body.contact?.timezone}</p>
          <p><strong>Text OK:</strong> ${body.contact?.canText}</p>
          <p><strong>Background:</strong> ${body.contact?.background}</p>
          <p><strong>Salary:</strong> ${body.contact?.salary || "\u2014"}</p>
          <p><strong>Completed in:</strong> ${body.meta?.elapsed_seconds} seconds</p>
          <hr>
          <h3>Answers</h3>
          <p><strong>Frontend framework:</strong> ${body.answers?.framework}</p>
          <p><strong>CSS approach:</strong> ${body.answers?.css}</p>
          <p><strong>Component library:</strong> ${body.answers?.components}</p>
          <p><strong>Vibe codes in:</strong> ${body.answers?.tool}</p>
          <p><strong>AI model:</strong> ${body.answers?.model}</p>
          <p><strong>Stuck in loop:</strong> ${body.answers?.stuck}</p>
          <p><strong>RN styling:</strong> ${body.answers?.rn_styling}</p>
          <p><strong>RN iteration:</strong> ${body.answers?.rn_iterate}</p>
        `,
      });
    } catch (emailErr) {
      console.error("Resend error:", emailErr);
    }

    return Response.json({ success: true, id: entry.id });
  } catch {
    return Response.json(
      { error: "Failed to process submission" },
      { status: 500 },
    );
  }
}
