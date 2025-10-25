"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { pusherClient } from "@/lib/pusher";

export function HostControls({ roomId }: { roomId: string }) {
  const router = useRouter();
  const [isHost, setIsHost] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    try {
      const role = localStorage.getItem("roomRole");
      setIsHost(role === "host");
    } catch (e) {
      // ignore
    }
  }, []);

  async function handleClose() {
    setLoading(true);
    try {
      const sessionId =
        (pusherClient.connection && (pusherClient.connection as any).socket_id) || undefined;
      const res = await fetch(`/api/rooms/${roomId}/close`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });

      if (!res.ok) {
        const json = await res.json();
        toast.error(json?.error || "Failed to close room");
        setLoading(false);
        return;
      }

      toast.success("Room closed");
      router.push("/");
    } catch (err) {
      console.error(err);
      toast.error("Failed to close room");
    } finally {
      setLoading(false);
    }
  }

  if (!isHost) return null;

  return (
    <div className="flex items-center gap-2">
      <Button variant="destructive" onClick={handleClose} disabled={loading}>
        {loading ? "Closing..." : "Close Room"}
      </Button>
    </div>
  );
}
