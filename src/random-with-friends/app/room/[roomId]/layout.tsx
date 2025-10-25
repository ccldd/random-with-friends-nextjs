"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { pusherClient } from "@/lib/pusher";

function setupPusherAuth(displayName: string, role: string) {
  // Add auth headers to all Pusher requests
  pusherClient.config.auth = {
    headers: {
      "x-display-name": displayName,
      "x-room-role": role,
    },
  };
}

export default function RoomLayout({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const displayName = searchParams.get("displayName");
  const role = searchParams.get("role") || "guest";

  React.useEffect(() => {
    if (!displayName) {
      // TODO: Show error or redirect to home
      return;
    }

    setupPusherAuth(displayName, role);

    // Update localStorage with user role to persist between refreshes
    localStorage.setItem("roomRole", role);
  }, [displayName]);

  if (!displayName) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Please enter a display name to join the room</p>
      </div>
    );
  }

  return <>{children}</>;
}
