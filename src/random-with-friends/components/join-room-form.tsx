"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { JoinRoomInput, joinRoomSchema } from "@/lib/schemas";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface JoinRoomFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function JoinRoomForm({ open, onOpenChange }: JoinRoomFormProps) {
  const router = useRouter();
  const form = useForm<JoinRoomInput>({
    resolver: zodResolver(joinRoomSchema),
    defaultValues: {
      roomId: "",
      displayName: "",
    },
  });

  async function onSubmit(data: JoinRoomInput) {
    try {
      // Check if room exists via Pusher
      const response = await fetch(`/api/rooms/${data.roomId}/exists`);

      if (!response.ok) {
        if (response.status === 404) {
          toast.error("Room not found");
          return;
        }
        throw new Error("Failed to validate room");
      }

      // Room exists, join
      onOpenChange(false);
      toast.success("Room found!");
      router.push(
        `/room/${data.roomId}?displayName=${encodeURIComponent(data.displayName)}&role=guest`
      );
    } catch (error) {
      toast.error("Failed to join room");
      console.error(error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Join Room</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="roomId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room Code</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter room code" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Checking..." : "Join Room"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
