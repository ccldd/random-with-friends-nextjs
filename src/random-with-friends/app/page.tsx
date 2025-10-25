"use client";

import { useState } from "react";
import { CreateRoomForm } from "@/components/create-room-form";
import { JoinRoomForm } from "@/components/join-room-form";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">Random With Friends</h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Create a room or join an existing one.
          </p>
        </div>

        <div className="bg-card p-6 rounded-lg shadow-sm border">
          <CreateRoomForm />
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">Already have a room code?</p>
          <Button variant="outline" className="w-full" onClick={() => setJoinDialogOpen(true)}>
            Join Room
          </Button>
        </div>
      </div>

      <JoinRoomForm open={joinDialogOpen} onOpenChange={setJoinDialogOpen} />
    </main>
  );
}
