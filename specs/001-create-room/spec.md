# Feature Specification: Room creation and joining

**Feature Branch**: `001-create-room`  
**Created**: 2025-10-25  
**Status**: Draft  
**Input**: User description: "room functionality. Host can create a room. Guests can join a room via a room id. People must enter their name. Once joined in a room, show the other participants and make it clear who is the host of the room."

## User Scenarios & Testing _(mandatory)_

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.

  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - Host creates a room and invites participants (Priority: P1)

As a host, I want to create a new room, get a shareable room ID, and see participants as they join so that I can run a collaborative session and clearly know who I (the host) am.

**Why this priority**: This is the core MVP — without room creation and clear host identification the collaborative experience is not possible.

**Independent Test (Playwright E2E)**: Launch the app, open the "Create Room" flow, enter a host name, confirm a room ID appears, open a new browser context to simulate a guest, navigate to "Join Room", enter the room ID and guest name, assert both contexts show both participants and the host is visually marked.

**Acceptance Scenarios**:

1. **Given** the app is open and I am unauthenticated, **When** I create a room and provide my display name, **Then** I receive a room ID and am placed into a room lobby showing my name as host and an initially empty participant list (except me).
2. **Given** a host-created room with a valid room ID, **When** a guest enters that room ID and a display name, **Then** the guest is added to the participants list in both the host and guest views and the host is visibly labeled as host.

---

### User Story 2 - Guest joins an existing room (Priority: P2)

As a guest, I want to join an existing room by entering the room ID and my display name so I can participate and see who else is in the room.

**Why this priority**: Joining is required for collaboration; after room creation this is the next most critical flow.

**Independent Test (Playwright E2E)**: Start a host session to produce a room ID, open another browser instance, navigate to the join page, enter the provided room ID and a guest name, and assert the participants list and host marker show correctly in both browser instances.

**Acceptance Scenarios**:

1. **Given** a valid room ID and an open join form, **When** the guest submits a display name and the room ID, **Then** the guest enters the room and both host and guest see the updated participants list with the host labeled.

---

### User Story 3 - Host departure and room lifecycle (Priority: P3)

As a participant, I want predictable behavior when the host leaves (either the room closes or a new host is assigned) so that the session does not leave participants in limbo.

**Why this priority**: This affects user experience but is not required for the initial join/create MVP. It should be defined early to avoid ambiguous behaviors.

**Independent Test (Playwright E2E)**: Create a room with a host and a guest. Simulate the host closing their browser (or navigating away). Assert the guest either sees the room closed message or sees a new host indicator depending on chosen behavior.

**Acceptance Scenarios**:

1. **Given** a room with >1 participant, **When** the host intentionally closes the room, **Then** all participants receive a clear message that the room is closed and are returned to the home/join screen.
2. **Given** a room with >1 participant, **When** the host disconnects unexpectedly, **Then** the system automatically promotes another participant to host (see promotion rule below) and all remaining participants see the newly-assigned host and a notification that ownership transferred.

**Host promotion rule**: When the host leaves unexpectedly, the system will deterministically promote the longest-connected participant (i.e., the participant with the earliest connectedAt timestamp) as the new host. If multiple participants share the same connectedAt timestamp, fall back to the earliest join order. If no other participants remain, the room is closed.

**Acceptance Scenarios (host promotion)**:

3. **Given** a room with host H and guests A and B (A joined before B), **When** host H disconnects unexpectedly, **Then** participant A is promoted to host, both A and B receive a notification that A is now host, and the participants list shows A with the host indicator.
4. **Given** a room where the host intentionally closes the room, **When** the host chooses the "Close room" action, **Then** all participants receive a room-closed message and are returned to the home/join screen.

---

[Add more user stories as needed, each with an assigned priority]

### Edge Cases

- Duplicate display names: Two participants choose the same display name. The system should show both entries with a disambiguation (e.g., appended numeric suffix) or allow the UI to show unique session IDs.
- Invalid/expired room ID: Guests retrying with an invalid or expired ID should see a clear error and an option to request a new ID from the host.
- Network disconnects: A transient disconnect should show a reconnecting state and, if reconnect succeeds within a short window, restore presence; if not, the participant is removed from the participant list and a notification is shown to remaining users.
- Simultaneous joins: Multiple guests joining at the same time should be reliably added and reflected in all connected clients.
- Large participant lists: If participant count grows large, the participants UI should remain usable (pagination/scrolling) — define limits in assumptions.
- Host leaves unexpectedly (see User Story 3) — behavior depends on clarification.

## Requirements _(mandatory)_

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: The system MUST allow a user to create a new room by providing a display name and receive a short unique room ID that can be shared with others.
- **FR-002**: The system MUST allow a user to join an existing room by entering a valid room ID and a display name.
- **FR-003**: The system MUST validate and surface errors for invalid or non-existent room IDs during join attempts.
- **FR-004**: The system MUST maintain and broadcast a current participant list to all connected clients in the room, including each participant's display name and an indicator for the host role.
- **FR-005**: The system MUST visibly mark the host in the participants list in all client views.
- **FR-006**: The system MUST require a non-empty display name when creating or joining a room and surface a validation error if omitted.
- **FR-007**: The system MUST handle concurrent joins and ensure eventual consistency of the participants list across clients (joins should not silently overwrite entries).
- **FR-008**: The system MUST support graceful handling of transient network disconnects (show reconnecting state, remove participant only after timeout) and notify remaining participants when someone leaves.
- **FR-009**: The system MUST provide a way for the host to close the room (end session) and for that action to notify all participants and return them to the home/join screen.
- **FR-009**: The system MUST provide a way for the host to close the room (end session) and for that action to notify all participants and return them to the home/join screen.
- **FR-010**: The system MUST automatically promote another participant to host when the current host disconnects unexpectedly, following the deterministic promotion rule (longest-connected / earliest-joined), and notify all participants of the change.

_Notes_: FR-002..FR-009 are written to be implementation-agnostic and testable via E2E flows.

### Key Entities

- **Room**: Represents a live session. Key attributes: room ID (short, shareable), host (participant ID/display name), participant list, createdAt, optional expiry/closed flag.
- **Participant**: Represents a connected person. Key attributes: session ID (unique per connection), display name, role (host|guest), connectedAt, status (connected|reconnecting|disconnected).

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 95% of users (hosts and guests) can create or join a room successfully within 10 seconds of submitting the form.
- **SC-002**: Participants list updates (join/leave) are reflected in all connected clients within 2 seconds under normal network conditions for 95% of events.
- **SC-003**: 99% of attempts to join with a valid room ID succeed (connection established and participant listed); invalid room IDs produce a clear error 100% of the time.
- **SC-004**: Users can identify the host in the participants list at a glance (visual marker) in 100% of room views.
- **SC-005**: When the host closes the room, 100% of connected participants receive a clear message and are returned to the home/join screen.

- **SC-006**: When the host disconnects unexpectedly and another participant exists, 100% of remaining participants see the newly-promoted host and a notification within 2 seconds for 95% of events under normal network conditions.

## Assumptions

- Rooms are ephemeral by default — they exist while at least one participant is active or until the host explicitly closes them.
- No prior authentication is required for MVP; display name is the only identity input required.
- Room IDs are short, shareable strings (alphanumeric) and are user-friendly (not raw database IDs).
- Scalability targets (participant limits, concurrency) are not defined in this spec — the MVP targets small group sizes (up to 20 participants) unless otherwise requested.

## Open Questions / Clarifications

- Q1: Host-leave behavior resolved. Decision: Option B — automatically promote another participant to host (longest-connected / earliest-joined). See User Story 3 and Functional Requirements (FR-010) for details.

## Testing notes (Playwright)

- E2E tests should cover: create room flow (host), join flow (guest), participant list synchronization, host visual indicator, invalid room join attempts, host closes room behavior, and reconnect handling for transient disconnects.

## Example minimal manual test (happy path)

1. Host opens app, enters display name "Alice" and taps Create Room.
2. Host receives room ID "AB12" and sees her name as Host in the participants list.
3. Guest opens a new browser, goes to Join, enters room ID "AB12" and display name "Bob", and joins.
4. Both Alice and Bob see both names in their participants list and Alice is labeled Host.

---

End of spec draft.
