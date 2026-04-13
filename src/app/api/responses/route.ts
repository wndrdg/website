import { promises as fs } from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "data", "responses.json");

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");

  if (key !== process.env.API_SECRET) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    return Response.json(JSON.parse(raw));
  } catch {
    return Response.json([]);
  }
}
