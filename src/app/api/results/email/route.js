import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import QuizResult from "@/models/QuizResult";

export async function POST(request) {
  try {
    await dbConnect();
    const { id, email } = await request.json();

    if (!id || !email) {
      return NextResponse.json({ error: "Result ID and email are required" }, { status: 400 });
    }

    const updated = await QuizResult.findByIdAndUpdate(
      id,
      { email: email.toLowerCase() },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: "Result not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Email update error:", err);
    return NextResponse.json({ error: "Failed to update email" }, { status: 500 });
  }
}
