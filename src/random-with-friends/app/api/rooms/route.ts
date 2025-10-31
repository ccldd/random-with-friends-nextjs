import { generateRoomId } from "@/lib/room-utils";
import { createRoomSchema } from "@/lib/schemas";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const { displayName } = createRoomSchema.parse(json);

    // Generate room ID
    const roomId = generateRoomId(4); // TODO: Retry if collision

    // Note: Room channel will be lazily created when first user subscribes
    // No need to pre-trigger an event here

    return NextResponse.json({ roomId });
  } catch (error) {
    console.error("[Room API] Failed to create room:", error);
    return NextResponse.json({ error: "Failed to create room" }, { status: 500 });
  }
}
