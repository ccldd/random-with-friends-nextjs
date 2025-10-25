# Implementation Plan: Room Creation and Management

**Branch**: `001-create-room` | **Date**: 2025-10-25 | **Spec**: [/specs/001-create-room/spec.md](/specs/001-create-room/spec.md)
**Input**: Feature specification from `/specs/001-create-room/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

**Language/Version**: TypeScript 5.x with strict mode enabled
**Primary Dependencies**:

- Next.js 14.x (App Router)
- pusher-js for realtime presence
- shadcn/ui components
- Tailwind CSS
- Zod for validation

**Project Structure**:

```
app/
├── page.tsx                    # Home page with create/join options
├── layout.tsx                  # Root layout with providers
├── room/
│   ├── create/
│   │   ├── page.tsx           # Create room form
│   │   └── actions.ts         # Server actions for room creation
│   ├── [roomId]/
│   │   ├── page.tsx          # Room view (participants list)
│   │   ├── layout.tsx        # Room layout with Pusher subscription
│   │   └── loading.tsx       # Loading state
│   └── join/
│       ├── page.tsx          # Join room form
│       └── actions.ts        # Server actions for room joining
├── api/
│   └── pusher/
│       ├── auth/route.ts     # Pusher auth endpoint
│       └── webhook/route.ts  # Pusher webhooks
└── globals.css               # Global styles

components/
├── ui/                      # shadcn components
└── room/                    # Room-specific components
    ├── participant-list.tsx
    ├── host-indicator.tsx
    └── room-actions.tsx

lib/
├── pusher.ts               # Pusher client config
├── utils.ts
└── types.ts               # Shared types

types/                     # TypeScript types
```

**Storage**:

- Pusher Channels for presence/realtime
- No persistent storage needed (ephemeral rooms)

**Testing**:

- Playwright for E2E tests
- Jest for utilities (optional)

**Target Platform**:

- Local development
- Vercel deployment
- Modern browsers (Chrome, Firefox, Safari, Edge)

**Project Type**: Next.js web application (App Router)

**Performance Goals**:

- Room join under 2 seconds
- Participant list updates within 1 second
- Support up to 20 concurrent participants per room
- Initial page load under 3 seconds

**Constraints**:

- Pusher free tier limits (100 concurrent connections)
- Client-side bundle size < 200KB (initial)
- Must work on mobile browsers
- No authentication required (display name only)

**Scale/Scope**:

- MVP targeting small group collaboration
- Up to 20 participants per room
- Ephemeral rooms (no persistence)

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

Project plans MUST explicitly verify the following constitution gates before Phase 0 can
proceed. Each gate is a yes/no check with explanation:

### TypeScript First ✅

- Uses TypeScript with strict mode
- All components and utilities in TypeScript
- Type definitions for Pusher events and room state

### Framework & UI Stack ✅

- Next.js 14.x with App Router
- Server Components by default
- Client Components marked with 'use client'
- shadcn/ui components with Tailwind
- Follows App Router conventions:
  - Route handlers in app/api/
  - Layouts and templates in app/ hierarchy
  - Co-located components where appropriate

### Project Structure ✅

- Follows Next.js 13+ conventions:
  - app/ directory for routes
  - components/ for UI components
  - lib/ for utilities
  - Proper route segmentation

### Realtime Integration ✅

- Using pusher-js (preferred solution)
- Presence channels for participant tracking
- Webhooks for connection state

### Platform Requirements ✅

- Local development supported
- Vercel deployment target
- No alternative platforms proposed

### Quality & Testing ✅

- Prettier and ESLint configured
- Playwright E2E tests for all user stories
- Tests cover create/join flows
- Testing real-time interactions

### Observability ✅

- Basic logging for room events
- Error boundaries for client resilience
- Connection state indicators
- Clear error messages for users

All gates PASS - no justifications or exceptions needed.

## Project Structure

### Documentation

```text
specs/001-create-room/
├── plan.md              # This file
├── research.md          # Phase 0: Dependencies research
├── data-model.md        # Phase 1: Room and Participant models
├── quickstart.md        # Phase 1: Setup and run instructions
├── contracts/           # Phase 1: API routes and Pusher events
└── tasks.md            # Phase 2: Implementation tasks
```

### Source Code

Following Next.js 13+ App Router conventions:

```text
src/
├── app/
│   ├── page.tsx                    # Home page (create/join options)
│   ├── layout.tsx                  # Root layout with providers
│   ├── room/
│   │   ├── create/
│   │   │   ├── page.tsx           # Create room form
│   │   │   └── actions.ts         # Server actions
│   │   ├── [roomId]/
│   │   │   ├── page.tsx           # Room view
│   │   │   ├── layout.tsx         # Room layout
│   │   │   └── loading.tsx        # Loading state
│   │   └── join/
│   │       ├── page.tsx           # Join form
│   │       └── actions.ts         # Server actions
│   ├── api/
│   │   └── pusher/
│   │       ├── auth/route.ts      # Pusher auth
│   │       └── webhook/route.ts    # Pusher webhooks
│   └── globals.css                # Global styles
│
├── components/
│   ├── ui/                        # shadcn components
│   └── room/                      # Room components
│       ├── participant-list.tsx   # List with host indicator
│       ├── create-form.tsx        # Room creation form
│       ├── join-form.tsx          # Room joining form
│       └── room-actions.tsx       # Host/guest actions
│
├── lib/
│   ├── pusher.ts                  # Pusher config
│   ├── room.ts                    # Room utilities
│   └── types.ts                   # Shared types
│
└── tests/
    └── e2e/                       # Playwright tests
        ├── room-creation.spec.ts  # Create room tests
        ├── room-joining.spec.ts   # Join room tests
        └── host-leave.spec.ts     # Host scenarios
```

**Structure Decision**: Using Next.js App Router structure with:

- Routes and API endpoints in app/
- Reusable components in components/
- Utilities and types in lib/
- E2E tests in tests/e2e/

This follows the Next.js 13+ conventions with server/client component separation
and proper route organization.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |
