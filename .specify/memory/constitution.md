<!--
Sync Impact Report

- Version change: 1.2.0 -> 1.3.0
- Modified principles:
  - Framework & UI Stack: enhanced with detailed responsive design requirements
  - Simplicity & Observability: expanded with comprehensive logging and monitoring requirements
  - Technology Constraints: added monitoring and responsive design sections
- Added sections:
  - Responsive design requirements (viewport sizes, techniques)
  - Logging and monitoring requirements
  - Performance monitoring requirements
- Removed sections: none
- Templates requiring updates:
  - .specify/templates/plan-template.md ⚠ pending (add responsive and monitoring sections)
  - .specify/templates/spec-template.md ⚠ pending (add responsive design and observability criteria)
  - .specify/templates/tasks-template.md ⚠ pending (add monitoring and responsive testing tasks)
- Follow-up TODOs:
  - Update plan template with monitoring and responsive sections
  - Add responsive design acceptance criteria to spec template
  - Add monitoring setup tasks to task template
  - Create observability and responsive testing guidelines
-->

# random-with-friends-nextjs Constitution

## Core Principles

### TypeScript First

All production code MUST be authored in TypeScript. Type declarations are required for public modules,
and tsconfig.json MUST enforce strict mode. Rationale: Type safety reduces runtime defects and
matches the project's Next.js + TypeScript stack.

### Framework & UI Stack

The project MUST use Next.js with App Router (not Pages Router) for routing and server-side
rendering. The app directory structure MUST follow Next.js 13+ conventions with co-located
components, layouts, and server components. Route handlers MUST be placed in appropriate
app/api routes. The primary UI primitives are the shadcn component library plus Tailwind CSS.
Client and server components MUST be clearly distinguished using the 'use client' directive
where needed.

All UI components MUST be responsive and work seamlessly across:

- Mobile (320px+)
- Tablet (768px+)
- Desktop (1024px+)
- Large Desktop (1440px+)

Responsive requirements:

- Fluid typography using clamp() or responsive type scales
- Mobile-first CSS using min-width media queries
- Touch-friendly tap targets (min 44x44px)
- No horizontal scrolling on mobile
- Responsive images using next/image
- Adaptive layouts using CSS Grid/Flexbox

Accessibility and responsive design are non-negotiable. Rationale: App Router
provides better performance through server components and streaming, while consistent UI patterns
reduce integration overhead and ensure a great user experience across all devices.

### Library & Dependency Preference

Prefer adding well-maintained libraries over reimplementing functionality. For realtime features,
use `pusher-js` (or an approved alternative) rather than building a bespoke websocket layer. Any
new dependency MUST have an open-source license compatible with the project and a maintainer
history. Rationale: Leverage community-tested solutions to reduce maintenance cost and risk.

### Quality & Formatting

All source MUST be formatted with Prettier and linted with ESLint. The repository MUST include
configuration files (.prettierrc, .eslintrc) and CI checks that run formatting and linting. For
testing, end-to-end (E2E) testing of the full Next.js application using Playwright is the REQUIRED
approach for user-facing features; Playwright tests MUST cover primary user journeys and acceptance
criteria. Unit or component tests MAY be added for isolated logic, but they do not replace E2E
coverage. Rationale: E2E tests validate real user flows running in the same environment as users,
reducing integration gaps that component-only tests can miss.

### Simplicity & Observability

Keep interfaces minimal and explicit; prefer clarity over cleverness. All features MUST implement
comprehensive logging and monitoring:

Logging Requirements:

- Structured JSON logging using consistent formats
- Log levels (debug, info, warn, error) properly assigned
- Request context (requestId, user/session info) attached
- Performance metrics for critical paths
- Error stack traces and context preserved

Monitoring Requirements:

- Route performance metrics (server-timing headers)
- Client-side performance metrics (Web Vitals)
- Error tracking and reporting
- Real-time connection status
- API endpoint health/latency

Observability Tools:

- Vercel Analytics for deployment monitoring
- Console logging in development
- Error boundaries with fallback UI
- Loading/error states for all async operations
- Network status indicators

Versioning follows semantic versioning for published packages or public APIs.
Rationale: Proper observability enables proactive issue detection, debugging,
and maintenance while ensuring reliable operations.

## Technology Constraints

The constitution mandates the following tech constraints for this repository:

- Language: TypeScript (Node.js / Next.js runtime)
- Framework: Next.js with App Router
- Project Structure:
  - app/ directory for all routes and layouts
  - components/ for reusable UI components
  - lib/ for utility functions and shared logic
  - styles/ for global styles and Tailwind config
- UI: shadcn + Tailwind CSS
- Routing:
  - Server Components by default
  - 'use client' directive for client components
  - Route handlers in app/api/
  - Layouts and templates in app/ hierarchy
- Realtime: pusher-js (preferred) or approved alternative
- Testing: Playwright (preferred for full-app E2E testing)
- Formatting/Linting: Prettier + ESLint
- Platform: The app MUST be runnable locally for development and deployable on Vercel for production; plans that propose alternative deployment targets MUST include a migration and justification.
- Monitoring:
  - Server-side logging with structured JSON format
  - Client-side error tracking
  - Performance monitoring (Core Web Vitals)
  - Real-time connection status
  - Request/response timing
- Responsive Design:
  - Mobile-first development
  - Fluid typography and spacing
  - Touch-friendly interactions
  - Responsive images and media
  - Cross-device testing

Implementations that materially deviate from these constraints MUST include a documented
technical justification and an explicit migration plan approved via the governance process.

## Development Workflow & Quality Gates

- All changes MUST go through branch-based pull requests and at least one reviewer.
- CI MUST run: TypeScript checks, ESLint, Prettier formatting, and unit tests for changed code.
- New features MUST include a plan.md/spec.md pair and a tasks.md produced from the templates.
- Any breaking changes to public APIs require a MAJOR version bump and a migration guide.

## Governance

Amendments to this constitution require a documented proposal (spec), a rationale, and
an approval by at least one maintainer plus one reviewer familiar with the affected area.
For semantic versioning of the constitution itself:

- MAJOR: Backward‑incompatible governance or principle removals/renames.
- MINOR: New principle/section added or materially expanded guidance.
- PATCH: Wording, typos, formatting, or non-semantic clarifications.

Changes to the constitution MUST be accompanied by:

- A Sync Impact Report (as an HTML comment at the top of the constitution file).
- A short migration checklist for any teams affected.

**Version**: 1.3.0 | **Ratified**: 2025-10-25 | **Last Amended**: 2025-10-25
