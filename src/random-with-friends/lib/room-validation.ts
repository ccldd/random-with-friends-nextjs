import { pusherServer } from "./pusher";
import { joinRoomSchema } from "./schemas";

/**
 * Validation result for room join attempts
 */
export interface RoomValidationResult {
  valid: boolean;
  error?: string;
  roomId?: string;
}

/**
 * Validates room join input (roomId format and displayName)
 */
export function validateJoinRoomInput(input: unknown): RoomValidationResult {
  const parsed = joinRoomSchema.safeParse(input);

  if (!parsed.success) {
    const error = parsed.error.issues[0];
    return {
      valid: false,
      error: error.message,
    };
  }

  return {
    valid: true,
    roomId: parsed.data.roomId,
  };
}

/**
 * Checks if a room exists and is active by querying Pusher channel
 */
export async function checkRoomExists(roomId: string): Promise<RoomValidationResult> {
  try {
    const channelName = `presence-room-${roomId}`;
    
    // Query Pusher for channel info
    const response = await pusherServer.get({ path: `/channels/${channelName}` });
    const channelInfo = await response.json();

    // Channel must be occupied (has at least one subscriber)
    if (channelInfo.occupied === true) {
      return {
        valid: true,
        roomId,
      };
    }

    return {
      valid: false,
      error: "Room not found or inactive",
    };
  } catch (error) {
    console.error("Error checking room existence:", error);
    return {
      valid: false,
      error: "Failed to validate room",
    };
  }
}

/**
 * Full validation for room join: validates input format AND checks room existence
 */
export async function validateRoomJoin(input: unknown): Promise<RoomValidationResult> {
  // First validate the input format
  const inputValidation = validateJoinRoomInput(input);
  if (!inputValidation.valid) {
    return inputValidation;
  }

  // Then check if the room actually exists
  return await checkRoomExists(inputValidation.roomId!);
}

/**
 * Validates room ID format only (client-side validation)
 */
export function isValidRoomIdFormat(roomId: string): boolean {
  return /^[A-Za-z0-9]{4,12}$/.test(roomId);
}

/**
 * Validates display name format (client-side validation)
 */
export function isValidDisplayName(displayName: string): boolean {
  const trimmed = displayName.trim();
  return trimmed.length >= 1 && trimmed.length <= 64;
}
