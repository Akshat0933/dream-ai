import { cookies } from "next/headers";
import { dbConnect } from "@/lib/mongodb";
import { parseSessionToken } from "@/lib/auth";
import QuizResult from "@/models/QuizResult";

export async function GET() {
  try {
    await dbConnect();

    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session")?.value;

    if (!sessionCookie) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    const payload = parseSessionToken(sessionCookie);
    if (!payload || !payload.userId) {
      return Response.json({ error: "Invalid session" }, { status: 401 });
    }

    const results = await QuizResult.find({ userId: payload.userId })
      .sort({ createdAt: -1 })
      .lean();

    // Serialize ObjectIds and Map types for JSON
    const serialized = results.map((r) => ({
      _id: r._id.toString(),
      personality: r.personality,
      images: r.images instanceof Map ? Object.fromEntries(r.images) : r.images,
      createdAt: r.createdAt,
    }));

    return Response.json({ results: serialized });
  } catch (err) {
    console.error("Dashboard API error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
