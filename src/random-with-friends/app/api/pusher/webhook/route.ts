import { NextResponse } from "next/server";
import { pusherServer } from "@/lib/pusher";
import { chooseNewHost } from "@/lib/host-management";

/**
 * Pusher webhook handler to react to presence events
 * - When the host disconnects (member_removed and role === 'host'), promote a new host
 * - If no participants remain, broadcast room:closed
 */
export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const events = payload?.events || [];

    for (const ev of events) {
      try {
        const { name, channel, user_id, user_info } = ev;

        if (name === "member_removed" && channel && user_info) {
          // If the removed member was the host, pick a new host
          if (user_info.role === "host") {
            // Query current users on the channel
            try {
              const resp = await pusherServer.get({ path: `/channels/${channel}/users` });
              const data = await resp.json();
              const users = data.users || [];

              if (users.length === 0) {
                // No participants remain -> broadcast room closed
                await pusherServer.trigger(channel, "room:closed", {
                  channel,
                  closedAt: new Date().toISOString(),
                });
                continue;
              }

              // Map users to Participant-like objects (user_info stored on presence)
              const participants = users.map((u: any) => u.user_info).filter(Boolean);

              const newHost = chooseNewHost(participants, user_id);
              if (newHost) {
                await pusherServer.trigger(channel, "host:promoted", {
                  newHostSessionId: newHost.sessionId,
                });
              }
            } catch (err) {
              console.error("Failed to handle member_removed for host promotion:", err);
            }
          }
        }
      } catch (e) {
        console.error("Error processing webhook event", e);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Pusher webhook error:", error);
    return NextResponse.json({ error: "invalid webhook" }, { status: 400 });
  }
}
