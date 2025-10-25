import { NextResponse } from "next/server";
import { pusherServer } from "@/lib/pusher";

export async function POST(request: Request, { params }: { params: { roomId: string } }) {
  try {
    const { roomId } = params;
    const body = await request.json();
    const requesterSessionId = body?.sessionId as string | undefined;

    if (!requesterSessionId) {
      return NextResponse.json({ error: "sessionId required" }, { status: 400 });
    }

    const channelName = `presence-room-${roomId}`;

    // Fetch channel user list to verify requester is current host
    try {
      const resp = await pusherServer.get({ path: `/channels/${channelName}/users` });
      const users = await resp.json();

      const hostUser = (users.users || []).find((u: any) => u.user_info?.role === "host");
      if (!hostUser || hostUser.user_id !== requesterSessionId) {
        return NextResponse.json({ error: "only host can close room" }, { status: 403 });
      }
    } catch (err) {
      console.error("Failed to verify host:", err);
      // If we cannot verify, deny for safety
      return NextResponse.json({ error: "failed to verify host" }, { status: 500 });
    }

    // Notify channel participants that room is closed
    const payload = { roomId, closedAt: new Date().toISOString() };
    await pusherServer.trigger(`presence-room-${roomId}`, "room:closed", payload);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("room close error:", error);
    return NextResponse.json({ error: "failed to close room" }, { status: 500 });
  }
}
