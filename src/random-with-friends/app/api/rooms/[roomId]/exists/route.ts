import { NextResponse } from "next/server";
import { pusherServer } from "@/lib/pusher";

export async function GET(request: Request, { params }: { params: Promise<{ roomId: string }> }) {
  try {
    const { roomId } = await params;
    const channelName = `presence-room-${roomId}`;

    // Check if channel exists with any subscribers
    const response = await pusherServer.get({ path: `/channels/${channelName}` });
    const channelInfo = await response.json();

    // Channel should exist and have active subscribers
    if (channelInfo.occupied === true) {
      return NextResponse.json({ exists: true });
    }

    // Room doesn't exist or has no participants
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  } catch (error) {
    console.error("Failed to check room:", error);
    return NextResponse.json({ error: "Failed to check room" }, { status: 500 });
  }
}
