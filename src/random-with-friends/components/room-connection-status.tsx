"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { pusherClient } from "@/lib/pusher";
import { cn } from "@/lib/utils";
import * as React from "react";

export function RoomConnectionStatus({ roomId }: { roomId: string }) {
  const [connectionState, setConnectionState] = React.useState(pusherClient.connection.state);
  const [showReconnectingAlert, setShowReconnectingAlert] = React.useState(false);
  const alertTimeout = React.useRef<NodeJS.Timeout | undefined>(undefined);

  React.useEffect(() => {
    function updateState() {
      setConnectionState(pusherClient.connection.state);

      // Show reconnecting alert after a short delay
      if (
        pusherClient.connection.state === "connecting" ||
        pusherClient.connection.state === "unavailable"
      ) {
        alertTimeout.current = setTimeout(() => {
          setShowReconnectingAlert(true);
        }, 2000);
      } else {
        clearTimeout(alertTimeout.current);
        setShowReconnectingAlert(false);
      }
    }

    // Monitor connection state
    pusherClient.connection.bind("state_change", updateState);

    // Cleanup
    return () => {
      clearTimeout(alertTimeout.current);
      pusherClient.connection.unbind("state_change", updateState);
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4">
      {/* Connection indicator dot */}
      <div
        data-testid="connection-status"
        data-status={connectionState}
        className={cn(
          "w-2 h-2 rounded-full",
          connectionState === "connected"
            ? "bg-green-500"
            : connectionState === "connecting"
            ? "bg-yellow-500"
            : "bg-red-500"
        )}
      />

      {/* Reconnecting alert */}
      {showReconnectingAlert && (
        <Alert className="mt-2 bg-card/90 backdrop-blur">
          <AlertTitle>Reconnecting...</AlertTitle>
          <AlertDescription>
            Your connection was interrupted. We&apos;re trying to reconnect you to the room.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
