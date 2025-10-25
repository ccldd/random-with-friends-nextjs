-<!--
Sync Impact Report

- Version change: 0.1.0 -> 1.0.0
- Modified principles:
  - (new) TypeScript First: (n/a -> TypeScript First)
  - (new) Framework & UI Stack: (n/a -> Next.js, shadcn, Tailwind)
  - (new) Library & Dependency Preference: (n/a -> prefer libraries such as pusher-js)
  - (new) Quality & Formatting: (n/a -> Prettier, ESLint, tests)
  - (new) Simplicity & Observability: (n/a -> logging, versioning)
- Added sections: "Technology Constraints" and "Development Workflow & Quality Gates"
- Removed sections: none
- Templates requiring updates: - .specify/templates/plan-template.md ✅ updated - .specify/templates/agent-file-template.md ✅ updated - .specify/templates/spec-template.md ⚠ pending (no breaking mismatches found) - .specify/templates/tasks-template.md ⚠ pending (sample tasks remain - update when generating tasks)
  +- Follow-up TODOs: - (resolved) RATIFICATION_DATE set to 2025-10-25 per maintainer instruction/assumption. If this is incorrect,
  provide the correct original ratification date and the constitution will be updated.
  -->

# random-with-friends-nextjs Constitution

## Core Principles

### TypeScript First

All production code MUST be authored in TypeScript. Type declarations are required for public modules,
and tsconfig.json MUST enforce strict mode. Rationale: Type safety reduces runtime defects and
matches the project's Next.js + TypeScript stack.

### Framework & UI Stack

The project MUST use Next.js for routing and server-side rendering where applicable. The primary
UI primitives are the shadcn component library plus Tailwind CSS. Accessibility and responsive
design are non-negotiable. Rationale: Consistency in UI and framework reduces integration overhead
and accelerates feature delivery.

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

Keep interfaces minimal and explicit; prefer clarity over cleverness. Instrument key flows with
structured logging and attach basic observability (log levels, error context). Versioning follows
semantic versioning for published packages or public APIs. Rationale: Simplicity aids debugging and
reduces long-term maintenance cost.

## Technology Constraints

The constitution mandates the following tech constraints for this repository:

- Language: TypeScript (Node.js / Next.js runtime)
- Framework: Next.js
- UI: shadcn + Tailwind CSS
- Realtime: pusher-js (preferred) or approved alternative
- Realtime: pusher-js (preferred) or approved alternative
- Testing: Playwright (preferred for full-app E2E testing)
- Formatting/Linting: Prettier + ESLint

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

**Version**: 1.0.0 | **Ratified**: 2025-10-25 | **Last Amended**: 2025-10-25
