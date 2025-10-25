# data-model.md

## Entities

### Room

- id: string (short, alphanumeric, e.g., "AB12") — primary identifier returned to host on creation
- hostSessionId: string — identifies the current host's session (not a persisted user id)
- status: enum ["open","closed"]
- createdAt: ISO8601 timestamp
- closedAt: ISO8601 timestamp | null
- metadata: object (optional) — freeform room-level settings

Validation rules:

- id: non-empty, alphanumeric, length 4-12 (configurable)
- hostSessionId: non-empty when status == "open"

### Participant

- sessionId: string (unique per connection)
- displayName: string (non-empty, max length 64)
- role: enum ["host","guest"]
- connectedAt: ISO8601 timestamp
- status: enum ["connected","reconnecting","disconnected"]

Validation rules:

- displayName must be non-empty and trimmed
- sessionId must be unique per active participant in a room

## Relationships

- Room 1..\* Participant: a room has multiple participants; one participant has role=host

## State transitions

- Room: created -> open -> closed
- Participant: connected -> reconnecting -> connected OR disconnected

## Derived fields / indices

- participantCount: integer (derived) used for UI and thresholding

## Persistence notes

- For MVP, rooms are ephemeral and Pusher presence channels are the canonical source of live membership. The server does not need a dedicated persistent store (Redis) to validate room existence; instead it can check channel existence or rely on the presence-auth flow to validate joins.
- The server MAY keep minimal in-memory metadata for UX conveniences (e.g., room settings), but this is optional and not required for correctness. If long-term persistence is needed later, add a database or Redis-backed store and document migration steps.
