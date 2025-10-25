import { Participant } from "./schemas";

/**
 * Promote a new host deterministically based on longest-connected (earliest connectedAt)
 * If timestamps equal, fall back to array order (assumed join order)
 */
export function chooseNewHost(
  participants: Participant[],
  currentHostSessionId?: string
): Participant | null {
  if (!participants || participants.length === 0) return null;

  // Exclude current host
  const others = participants.filter(p => p.sessionId !== currentHostSessionId);
  if (others.length === 0) return null;

  // Sort by connectedAt ascending (earliest first)
  const sorted = [...others].sort((a, b) => {
    const ta = Date.parse(a.connectedAt);
    const tb = Date.parse(b.connectedAt);
    if (ta === tb) return 0; // preserve original order
    return ta - tb;
  });

  return sorted[0] || null;
}

export default { chooseNewHost };
