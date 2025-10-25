"use client";

import * as React from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Participant } from "@/lib/schemas";
import { pusherClient } from "@/lib/pusher";

interface ParticipantListProps {
  roomId: string;
}

interface PresenceMember {
  id: string;
  info: Participant;
}

export function ParticipantList({ roomId }: ParticipantListProps) {
  const [participants, setParticipants] = React.useState<Participant[]>([]);
  const channelName = `presence-room-${roomId}`;

  // Subscribe to presence channel and handle member events
  React.useEffect(() => {
    const channel = pusherClient.subscribe(channelName);

    function handleSubscriptionSucceeded(members: { [id: string]: PresenceMember }) {
      const initialParticipants = Object.values(members).map(member => member.info);
      setParticipants(initialParticipants);
    }

    function handleMemberAdded(member: PresenceMember) {
      setParticipants(prev => {
        // Check if participant already exists (they might be reconnecting)
        const existingIndex = prev.findIndex(p => p.sessionId === member.id);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...member.info,
            status: "connected" as const,
          };
          return updated;
        }
        return [...prev, member.info];
      });
      toast.info(`${member.info.displayName} joined the room`);
    }

    function handleMemberRemoved(member: PresenceMember) {
      setParticipants(prev => {
        // Mark as reconnecting first, start a timeout to remove them
        const updated = prev.map(p =>
          p.sessionId === member.id ? { ...p, status: "reconnecting" as const } : p
        );

        // After 5 seconds, if they haven't reconnected, remove them
        setTimeout(() => {
          setParticipants(current =>
            current.filter(p => p.sessionId !== member.id || p.status === "connected")
          );
        }, 5000);

        return updated;
      });
    }

    function handleConnectionStateChange(states: { previous: string; current: string }) {
      // Update all participants' status based on connection state
      if (states.current === "connecting" || states.current === "unavailable") {
        setParticipants(prev => prev.map(p => ({ ...p, status: "reconnecting" as const })));
      }
    }

    // Set up event handlers for presence events
    channel.bind("pusher:subscription_succeeded", handleSubscriptionSucceeded);
    channel.bind("pusher:member_added", handleMemberAdded);
    channel.bind("pusher:member_removed", handleMemberRemoved);
    pusherClient.connection.bind("state_change", handleConnectionStateChange);

    // Room-level events
    channel.bind("room:closed", (data: any) => {
      toast.error("Room closed by host. Returning to home.");
      setTimeout(() => {
        window.location.href = "/";
      }, 1200);
    });

    channel.bind("host:promoted", (data: any) => {
      const newHostSessionId = data?.newHostSessionId;
      if (newHostSessionId) {
        setParticipants(prev =>
          prev.map(p => ({ ...p, role: p.sessionId === newHostSessionId ? "host" : p.role }))
        );
        toast.success("A new host was promoted");
      }
    });

    // Cleanup subscription on unmount
    return () => {
      channel.unbind_all();
      pusherClient.connection.unbind("state_change", handleConnectionStateChange);
      pusherClient.unsubscribe(channelName);
    };
  }, [roomId, channelName]);

  return (
    <div className="bg-background border rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-4">Participants</h2>
      <div className="space-y-2">
        {participants.map(participant => (
          <div
            key={participant.sessionId}
            className="flex items-center justify-between px-3 py-2 bg-muted rounded"
          >
            <div className="flex items-center gap-2">
              {participant.displayName}
              {participant.role === "host" && <Badge variant="secondary">Host</Badge>}
            </div>
            <div className="text-xs text-muted-foreground">
              {participant.status === "connected" ? "●" : "○"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
