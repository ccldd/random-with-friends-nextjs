import { ParticipantList } from "@/components/participant-list";
import { RoomConnectionStatus } from "@/components/room-connection-status";

export default async function RoomPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await params
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Room {roomId}</h1>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 bg-card p-6 rounded-lg border">
            {/* Main content area for room activities */}
            <p className="text-muted-foreground">Room content goes here</p>
          </div>

          <div className="lg:col-span-1">
            <ParticipantList roomId={roomId} />
          </div>
        </div>
      </div>

      <RoomConnectionStatus roomId={roomId} />
    </div>
  );
}
