import { NextRequest, NextResponse } from "next/server";
import { getRoom, joinRoom, makeMove, resetRoom } from "@/lib/roomStore";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const room = getRoom(params.id);
  if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });
  return NextResponse.json(room);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === "join") {
      const result = joinRoom(params.id, body.p2Phone);
      if ("error" in result) return NextResponse.json(result, { status: 400 });
      return NextResponse.json(result);
    }

    if (action === "move") {
      const result = makeMove(params.id, body.cellIndex, body.player);
      if ("error" in result) return NextResponse.json(result, { status: 400 });
      return NextResponse.json(result);
    }

    if (action === "reset") {
      const result = resetRoom(params.id);
      if ("error" in result) return NextResponse.json(result, { status: 400 });
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
