import { NextResponse } from "next/server";
import { parseSessionToken } from "@/lib/auth";

export async function GET(request) {
  try {
    const sessionCookie = request.cookies.get("session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ user: null });
    }

    const payload = parseSessionToken(sessionCookie);
    if (!payload) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
      user: {
        id: payload.userId,
        email: payload.email,
      },
    });
  } catch (err) {
    console.error("Auth me error:", err);
    return NextResponse.json({ user: null });
  }
}
