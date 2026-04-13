import { Resend } from "resend";
import { promises as fs } from "fs";
import path from "path";

const resend = new Resend(process.env.RESEND_API_KEY);
const DATA_FILE = path.join(process.cwd(), "data", "responses.json");

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Load existing responses
    let responses = [];
    try {
      const raw = await fs.readFile(DATA_FILE, "utf-8");
      responses = JSON.parse(raw);
    } catch {
      // File doesn't exist yet, start fresh
    }

    // Add new response with ID
    const entry = {
      id: responses.length + 1,
      ...body,
    };
    responses.push(entry);

    // Ensure data directory exists, write file
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(responses, null, 2));

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
          <p><strong>Salary:</strong> ${body.contact?.salary || "—"}</p>
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
      // Don't fail the submission if email fails
    }

    return Response.json({ success: true, id: entry.id });
  } catch {
    return Response.json(
      { error: "Failed to process submission" },
      { status: 500 },
    );
  }
}
