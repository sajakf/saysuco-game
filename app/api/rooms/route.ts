import { NextRequest, NextResponse } from "next/server";
import { createRoom } from "@/lib/roomStore";

export async function POST(req: NextRequest) {
  try {
    const { p1Phone } = await req.json();
    if (!p1Phone) return NextResponse.json({ error: "p1Phone required" }, { status: 400 });
    const room = createRoom(p1Phone);
    return NextResponse.json(room);
  } catch {
    return NextResponse.json({ error: "Failed to create room" }, { status: 500 });
  }
}
