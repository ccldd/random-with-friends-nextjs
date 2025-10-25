import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { pusherServer } from "@/lib/pusher";
import { participantSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const socketId = formData.get("socket_id") as string;
    const channelName = formData.get("channel_name") as string;
    const displayName = request.headers.get("x-display-name");

    if (!socketId || !channelName) {
      return NextResponse.json({ error: "Invalid auth request" }, { status: 400 });
    }

    if (!displayName) {
      return NextResponse.json({ error: "Display name required" }, { status: 401 });
    }

    // For MVP, enforce room size limit
    if (channelName.startsWith("presence-room-")) {
      try {
        const roomId = channelName.replace("presence-room-", "");
        const maxSize = parseInt(process.env.NEXT_PUBLIC_MAX_ROOM_SIZE || "50");

        // Get current channel info from Pusher API
        const response = await pusherServer.get({
          path: `/channels/${channelName}/users`,
        });
        const channelInfo = await response.json();

        if (channelInfo.users?.length >= maxSize) {
          return NextResponse.json({ error: "Room is full" }, { status: 403 });
        }
      } catch (error) {
        console.error("Failed to check room size:", error);
        // Continue - new room or error checking size
      }
    }

    // Get role from request headers
    const role = request.headers.get("x-room-role") || "guest";

    // Validate participant data
    const participant = participantSchema.parse({
      sessionId: socketId, // Use socket ID as unique session ID
      displayName,
      role: role as "host" | "guest",
      connectedAt: new Date().toISOString(),
      status: "connected",
    });

    // Convert to Pusher presence data format
    const presenceData = {
      user_id: participant.sessionId,
      user_info: participant,
    };

    // Authorize the subscription
    const authResponse = pusherServer.authorizeChannel(socketId, channelName, presenceData);

    return NextResponse.json(authResponse);
  } catch (error) {
    console.error("Pusher auth error:", error);
    return NextResponse.json({ error: "Auth failed" }, { status: 500 });
  }
}
