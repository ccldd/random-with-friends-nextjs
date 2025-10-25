# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: [e.g., TypeScript 5.x, Node.js version]  
**Primary Dependencies**: [e.g., Next.js version, key libraries]

**UI Framework**:

- Next.js App Router
- shadcn/ui components
- Tailwind CSS
- TypeScript strict mode

**Responsive Requirements**:

- Mobile: 320px - 767px
- Tablet: 768px - 1023px
- Desktop: 1024px - 1439px
- Large Desktop: 1440px+
- Touch targets: min 44x44px
- Fluid typography scales
- Responsive images/media

**Monitoring Stack**:

- Structured JSON logging
- Error tracking
- Performance monitoring
- Web Vitals tracking
- Real-time status
- Request timing

**Testing**:

- Playwright E2E tests
- Responsive testing
- Performance testing
- Unit tests (optional)

**Platform**:

- Local development
- Vercel deployment
- Modern browsers support

**Performance Goals**:

- Load Time: < 3s (desktop), < 5s (mobile)
- First Input Delay: < 100ms
- Cumulative Layout Shift: < 0.1
- First Contentful Paint: < 1.8s

**Scale/Scope**:

- Expected user base
- Concurrent users
- Data volume
- Feature scope

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

Project plans MUST explicitly verify the following constitution gates before Phase 0 can
proceed. Each gate is a yes/no check with explanation:

### TypeScript First

- Code targets TypeScript with strict mode
- Type declarations for public interfaces
- No untyped JavaScript allowed

### Framework & UI Stack

- Next.js App Router implementation
- shadcn + Tailwind CSS for UI
- Server/Client component separation
- Responsive Design Requirements:
  - Mobile-first development (320px+)
  - Tablet support (768px+)
  - Desktop support (1024px+)
  - Fluid typography and spacing
  - Touch-friendly interactions
  - No horizontal overflow
  - Responsive images

### Project Structure

- app/ directory with proper routing
- components/ for UI components
- lib/ for shared utilities
- Proper route segmentation

### Observability & Monitoring

- Structured JSON logging
- Performance monitoring setup
- Error tracking configuration
- Real-time status tracking
- Web Vitals monitoring
- Loading states and error boundaries

### Quality & Testing

- Prettier and ESLint configured
- Playwright E2E tests for user flows
- Responsive design tests
- Performance benchmarks

### Platform & Integration

- Local development support
- Vercel deployment setup
- Realtime features (prefer pusher-js)
- Monitoring integration with Vercel

Plans that cannot meet these gates MUST include an explicit technical justification and an
approval path via governance before research resources are allocated.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
# [REMOVE IF UNUSED] Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [REMOVE IF UNUSED] Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# [REMOVE IF UNUSED] Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure: feature modules, UI flows, platform tests]
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |
