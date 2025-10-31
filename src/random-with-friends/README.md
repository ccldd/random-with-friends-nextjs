# Random With Friends - Room Management

A real-time collaborative room system built with Next.js 14, TypeScript, and Pusher Channels. Hosts can create rooms, guests can join via room IDs, and all participants see live updates of who's in the room.

## Features

- **Room Creation**: Hosts create rooms and get shareable room IDs
- **Room Joining**: Guests join existing rooms via room ID
- **Real-time Presence**: Live participant list with automatic updates
- **Host Management**: Clear host indicators and automatic host promotion
- **Connection Handling**: Graceful reconnection and disconnect handling
- **Error Boundaries**: Robust error handling and user-friendly error messages

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.x (strict mode)
- **Real-time**: Pusher Channels (presence channels)
- **UI**: shadcn/ui + Tailwind CSS
- **Validation**: Zod
- **Testing**: Playwright (E2E)

## Prerequisites

- Node.js 18+ and npm
- A Pusher account ([sign up for free](https://pusher.com/))

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Pusher Configuration
NEXT_PUBLIC_PUSHER_KEY=your_pusher_key
NEXT_PUBLIC_PUSHER_CLUSTER=your_pusher_cluster
NEXT_PUBLIC_PUSHER_APP_ID=your_pusher_app_id
NEXT_PUBLIC_PUSHER_SECRET=your_pusher_secret
```

**To get these values:**

1. Go to [pusher.com](https://pusher.com/) and sign up/login
2. Create a new app in your dashboard
3. Go to "App Keys" tab
4. Copy the values to your `.env.local`

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
src/random-with-friends/
├── app/
│   ├── page.tsx                      # Home page (create/join)
│   ├── layout.tsx                    # Root layout
│   ├── room/[roomId]/
│   │   ├── page.tsx                  # Room view
│   │   └── layout.tsx                # Room layout with Pusher
│   └── api/
│       ├── rooms/                    # Room management APIs
│       └── pusher/                   # Pusher auth & webhooks
├── components/
│   ├── create-room-form.tsx          # Room creation form
│   ├── join-room-form.tsx            # Room joining form
│   ├── participant-list.tsx          # Live participant list
│   ├── host-controls.tsx             # Host-only controls
│   ├── error-boundary.tsx            # Error handling
│   └── ui/                           # shadcn components
├── lib/
│   ├── pusher.ts                     # Pusher client/server setup
│   ├── schemas.ts                    # Zod validation schemas
│   ├── room-utils.ts                 # Room ID generation
│   ├── room-validation.ts            # Room join validation
│   ├── host-management.ts            # Host promotion logic
│   └── performance-monitoring.ts     # Success criteria tracking
└── tests/e2e/                        # Playwright E2E tests
```

## Usage

### Creating a Room (Host)

1. Open the app
2. Enter your display name
3. Click "Create Room"
4. Share the generated room ID with participants

### Joining a Room (Guest)

1. Open the app
2. Click "Join Room" tab
3. Enter the room ID and your display name
4. Click "Join Room"

### Host Actions

- **Close Room**: Ends the session and notifies all participants
- **View Participants**: See who's in the room in real-time

### Guest Experience

- See all participants including the host (marked with badge)
- Automatic updates when people join/leave
- Promoted to host if current host leaves

## Testing

### Run E2E Tests

```bash
cd ../../test/e2e
npm install
npm test
```

### Run Specific Test Suite

```bash
npm test room-creation.spec.ts
npm test room-joining.spec.ts
npm test host-management.spec.ts
```

### Run Tests in UI Mode

```bash
npm test -- --ui
```

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_PUSHER_KEY`
   - `NEXT_PUBLIC_PUSHER_CLUSTER`
   - `NEXT_PUBLIC_PUSHER_APP_ID`
   - `NEXT_PUBLIC_PUSHER_SECRET`
4. Deploy!

### Alternative: Manual Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## Performance Monitoring

The app tracks key success criteria metrics:

- **SC-001**: Room creation/joining time (target: <10s)
- **SC-002**: Participant list updates (target: <2s)
- **SC-003**: Join success rate (target: 99%)
- **SC-004**: Host visibility (target: 100%)
- **SC-005**: Room closure notifications (target: 100%)
- **SC-006**: Host promotion latency (target: <2s)

View metrics in browser console (development mode).

## Architecture Decisions

- **Ephemeral Rooms**: No database required; rooms exist only while participants are connected
- **Pusher Presence**: Canonical source of truth for room membership
- **Server Components**: Used for initial page loads
- **Client Components**: Used for real-time interactions
- **Host Promotion**: Deterministic (longest-connected participant)

## Troubleshooting

### Pusher Connection Issues

- Verify environment variables are correct
- Check Pusher dashboard for connection limits (free tier: 100 concurrent)
- Ensure `.env.local` is not committed to git

### Room Not Found Errors

- Room IDs are case-sensitive
- Rooms close when all participants leave
- Check network connectivity

### TypeScript Errors

```bash
# Regenerate types
npm run type-check
```

### Build Errors

```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT

## Support

For issues and questions:
- Check the [GitHub Issues](../../issues)
- Review the [specification](../../specs/001-create-room/)
- Check Pusher [documentation](https://pusher.com/docs)

