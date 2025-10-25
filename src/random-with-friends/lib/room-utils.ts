const ROOM_ID_ALPHABET = "ABCDEFGHIJKLMNPQRSTUVWXYZ23456789"; // Omit O,0,1,I for readability

/**
 * Generate a random room ID with the configured length
 */
export function generateRoomId(length = 4): string {
  let result = "";
  const characters = ROOM_ID_ALPHABET;
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
