# research.md — Room creation & realtime (Phase 0)

# Room Creation and Real-time Architecture (Phase 0)

## 1. Core Technology Decisions

### Next.js App Router Integration

Decision: Use Next.js App Router with Server Components and Client Components where appropriate.

Rationale:

- Server Components for initial render and static content
- Client Components ('use client') for interactive features
- Route Handlers for API endpoints
- Server Actions for form submissions
- Streaming and Suspense for loading states

Key patterns:

```typescript
// app/room/[roomId]/page.tsx (Server Component)
export default async function RoomPage({ params }: { params: { roomId: string } }) {
  // Validate room exists
  // Render layout and client components
}

// components/room/participant-list.tsx (Client Component)
('use client');
export function ParticipantList({ roomId }: { roomId: string }) {
  // Subscribe to Pusher presence
  // Handle real-time updates
}

// app/room/create/actions.ts (Server Action)
('use server');
export async function createRoom(formData: FormData) {
  // Create room and return ID
}
```

### Pusher Integration

Decision: Use Pusher Channels with App Router architecture.

Rationale:

- Aligns with repository constitution which prefers `pusher-js`
- Perfect fit for presence-based room features
- Easy integration with both Server and Client Components
- Built-in presence channels map directly to requirements
- Reliable event delivery and reconnection handling

Alternatives considered:

- Socket.IO (self-hosted)

  - Pros: full control, easy to integrate with Node servers, room semantics built-in.
  - Cons: Operational burden (scaling, sticky sessions or message broker), reinvents presence management which Pusher already provides.

- Ably

  - Pros: Comparable managed realtime provider with presence and channels.
  - Cons: Additional vendor and billing considerations; project constitution explicitly favors pusher-js unless a strong reason exists.

- Firebase Realtime / Firestore realtime

  - Pros: Simple serverless approach, built-in presence patterns via presence docs.
  - Cons: Tighter coupling to Google's platform and data model; less direct mapping to presence channels; different SDK patterns.

- Custom WebSocket server
  - Pros: Full control, no external vendor costs.
  - Cons: Higher complexity for presence, scaling, and reliability; not aligned with project preference.

Decision details & scope

- Use Pusher Channels and presence channels for participant list synchronization and host/guest presence.
- Server responsibilities:
  - Create and return room metadata (room ID, creation time) via a REST API.
  - Authenticate clients for private/presence channel subscriptions (implement the auth endpoint that pusher-js expects).
  - Send server-originated events as needed (e.g., host-closed, promote-host notification).
- Client responsibilities:
  - Use `pusher-js` to subscribe to a `presence-room-{roomId}` channel.
  - Publish client-originated events via server endpoints (e.g., signalling actions) where appropriate.

Security & privacy notes

- Presence channels require server-side authentication (Pusher auth) — implement `/api/pusher/auth` to validate the request and sign channel subscriptions.
- Display names are not treated as strong authentication — do not consider display names as identity for security-sensitive actions. For MVP, host/guest roles are controlled per-session; further hardening (persistent user accounts) can be added later.

- -Operational notes
-
- Add environment variables: PUSHER_APP_ID, PUSHER_KEY, PUSHER_SECRET, PUSHER_CLUSTER (or PUSHER_URL depending on chosen SDK/config).
- Channel existence and presence checks: The server can validate whether a room is live by querying Pusher's channels REST API or by relying on the auth flow — a dedicated Redis store is optional and not required for MVP.
- Monitor channel usage and set reasonable participant limits per room (e.g., recommend <= 50 for MVP) to avoid unexpected costs.

Conclusion

- Pusher Channels maps cleanly to the project's requirements (presence, quick setup, low ops). It's the chosen approach for Phase 1 design and contracts.
