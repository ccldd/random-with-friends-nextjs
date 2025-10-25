import { z } from "zod";

// Room entity validation
export const roomSchema = z.object({
  id: z
    .string()
    .min(4)
    .max(12)
    .regex(/^[A-Za-z0-9]+$/),
  hostSessionId: z.string().min(1),
  status: z.enum(["open", "closed"]),
  createdAt: z.string().datetime(),
  closedAt: z.string().datetime().nullable(),
  metadata: z.record(z.unknown()).optional(),
});

export type Room = z.infer<typeof roomSchema>;

// Participant entity validation
export const participantSchema = z.object({
  sessionId: z.string().min(1),
  displayName: z.string().min(1).max(64).trim(),
  role: z.enum(["host", "guest"]),
  connectedAt: z.string().datetime(),
  status: z.enum(["connected", "reconnecting", "disconnected"]),
});

export type Participant = z.infer<typeof participantSchema>;

// Input validation for forms
export const createRoomSchema = z.object({
  displayName: z.string().min(1, "Display name is required").max(64, "Display name too long"),
});

export const joinRoomSchema = z.object({
  roomId: z
    .string()
    .min(4, "Room ID must be 4 characters")
    .max(12)
    .regex(/^[A-Za-z0-9]+$/, "Invalid room ID format"),
  displayName: z.string().min(1, "Display name is required").max(64, "Display name too long"),
});

export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type JoinRoomInput = z.infer<typeof joinRoomSchema>;
