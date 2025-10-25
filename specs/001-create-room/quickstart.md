# quickstart.md — Create & join a room (using Pusher)

Prerequisites

- Pusher account and app credentials (APP_ID, KEY, SECRET, CLUSTER)
- Environment variables set in Next.js: PUSHER_APP_ID, PUSHER_KEY, PUSHER_SECRET, PUSHER_CLUSTER

## Implementation with App Router

### 1. Create Room (Server Action)

```typescript
// app/room/create/actions.ts
'use server';

export async function createRoom(formData: FormData) {
  const name = formData.get('name');
  const roomId = generateRoomId();
  return {
    roomId,
    channel: `presence-room-${roomId}`,
  };
}
```

### 2. Room Page (Server Component)

```typescript
// app/room/[roomId]/page.tsx
export default async function RoomPage({ params }: { params: { roomId: string } }) {
  return (
    <main>
      <ParticipantList roomId={params.roomId} />
      <RoomActions roomId={params.roomId} />
    </main>
  );
}
```

### 3. Pusher Integration (Client Components)

```typescript
// components/room/participant-list.tsx
'use client';

export function ParticipantList({ roomId }: { roomId: string }) {
  const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    authEndpoint: '/api/pusher/auth',
  });

  const channel = pusher.subscribe(`presence-room-${roomId}`);
  // ... presence handling
}
```

### 4. Pusher Auth (Route Handler)

```typescript
// app/api/pusher/auth/route.ts
import { PusherServer } from '@/lib/pusher';

export async function POST(request: Request) {
  const { socket_id, channel_name, name } = await request.json();

  const auth = PusherServer.authorizeChannel(socket_id, channel_name, {
    user_id: socket_id,
    user_info: { name },
  });

  return Response.json(auth);
}
```

### 5. Room Creation Form (Client Component)

```typescript
// components/room/create-form.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createRoom } from '@/app/room/create/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function CreateRoomForm() {
  const form = useForm({
    resolver: zodResolver(CreateRoomSchema),
  });

  async function onSubmit(data: FormData) {
    const { roomId } = await createRoom(data);
    // Redirect to room
  }

  return (
    <form action={onSubmit}>
      <Input name="name" placeholder="Your name" />
      <Button type="submit">Create Room</Button>
    </form>
  );
}
```

### 6. Pusher Client Setup

```typescript
// lib/pusher.ts
import PusherClient from 'pusher-js';
import PusherServer from 'pusher';

// Client instance
export const pusherClient = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  authEndpoint: '/api/pusher/auth',
});

// Server instance
export const pusherServer = new PusherServer({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});
```

### 7. Participant List Component

```typescript
// components/room/participant-list.tsx
'use client';

import { useEffect, useState } from 'react';
import { pusherClient } from '@/lib/pusher';
import { type Participant } from '@/lib/types';

export function ParticipantList({ roomId }: { roomId: string }) {
  const [participants, setParticipants] = useState<Participant[]>([]);

  useEffect(() => {
    const channel = pusherClient.subscribe(`presence-room-${roomId}`);

    channel.bind('pusher:subscription_succeeded', (members: any) => {
      setParticipants(Object.values(members.members));
    });

    channel.bind('pusher:member_added', (member: any) => {
      setParticipants(prev => [...prev, member.info]);
    });

    channel.bind('pusher:member_removed', (member: any) => {
      setParticipants(prev => prev.filter(p => p.id !== member.id));
    });

    return () => {
      pusherClient.unsubscribe(`presence-room-${roomId}`);
    };
  }, [roomId]);

  return (
    <div className="space-y-2">
      {participants.map(participant => (
        <div key={participant.id} className="flex items-center gap-2">
          <span>{participant.name}</span>
          {participant.isHost && <span className="text-sm text-muted-foreground">(Host)</span>}
        </div>
      ))}
    </div>
  );
}
```

Notes

- For presence channels the server must provide a user_id and user_info when authenticating.
- Use short-lived sessions or cookies to protect auth endpoint from abuse.
- Monitor Pusher usage and set sensible participant limits for rooms to control costs.
