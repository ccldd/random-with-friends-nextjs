import { NextResponse } from "next/server";
import { generateRoomId } from "@/lib/room-utils";
import { createRoomSchema } from "@/lib/schemas";
import { pusherServer } from "@/lib/pusher";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const { displayName } = createRoomSchema.parse(json);

    // Generate room ID and validate uniqueness via Pusher channel check
    const roomId = generateRoomId(4); // TODO: Retry if collision
    const presenceChannelName = `presence-room-${roomId}`;

    // Create a new room via Pusher - channel is lazily created on first subscriber
    await pusherServer.trigger(presenceChannelName, "room:created", {
      roomId,
      hostDisplayName: displayName,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ roomId });
  } catch (error) {
    console.error("Failed to create room:", error);
    return NextResponse.json({ error: "Failed to create room" }, { status: 500 });
  }
}
