# [TICKET-ID]: [Ticket Title]

**Linear Ticket**: [Link to Linear ticket]  
**Branch**: `[TICKET-ID]_description`  
**Started**: [Date]  
**Status**: In Progress

---

## Ticket Description

[Copy the ticket description from Linear]

## Acceptance Criteria

- [ ] [Criterion 1]
- [ ] [Criterion 2]
- [ ] [Criterion 3]

---

## Implementation Plan

### 1. Analysis & Research

- [ ] Read and understand relevant code
- [ ] Identify files that need to be modified
- [ ] Research any unknown technologies/patterns
- [ ] Review related documentation

### 2. Implementation Tasks

- [x] Create EventForm.tsx with all event fields
- [x] Fix GraphQL field mapping errors in useEvents.ts
- [x] Create event model (saveEvent function)
- [x] Add image upload functionality to EventForm
- [x] Create enhanced EventCard component with proper UI
- [x] Add venue selector dropdown to EventForm
- [x] Implement search and filter functionality (text, date range, type, price, location)
- [x] Add status change UI to EditEvent component
- [x] Create RecurrencePicker visual component for recurring events

### 3. Testing

- [ ] Write/update unit tests
- [ ] Write/update E2E tests (if applicable)
- [ ] Manual testing
- [ ] Test edge cases

### 4. Code Quality

- [ ] TypeScript compilation passes
- [ ] ESLint/Stylelint passes
- [ ] Prettier formatting applied
- [ ] Code review self-check

### 5. Documentation

- [ ] Update relevant documentation
- [ ] Add code comments where needed
- [ ] Update TASK.md if needed

---

## Files to Modify

- `apps/web/src/features/Events/EventCard/CardBase.tsx` - Main event card component with layout variants
- `apps/web/src/features/Events/EventCard/EventsListCard.tsx` - List card wrapper
- `apps/web/src/features/Events/EventCard/Components/CardHeader.tsx` - Card header with event type and actions
- `apps/web/src/features/Events/EventCard/Components/CardFooter.tsx` - Card footer with location and CTA
- `apps/web/src/features/Events/EventCard/Components/CardMetadata.tsx` - Event metadata (date, time, location, price)
- `apps/web/src/features/Events/Events.tsx` - Updated to use EventsListCard component
- `apps/web/src/features/UserDirectory/Events/Event/EventForm.tsx` - Event creation/editing form
- `apps/web/src/hooks/useEvents.ts` - Fixed GraphQL field mapping
- `apps/web/src/lib/models/event.ts` - Event save function

---

## Technical Approach

[Describe your approach to solving this ticket]

---

## Discovered During Work

[Add any new tasks or issues discovered while working on this ticket]

---

## Completion Checklist

- [ ] All implementation tasks complete
- [ ] All tests passing
- [ ] Code formatted and linted
- [ ] Documentation updated
- [ ] Knowledge preserved (move key learnings to `docs/ticket-learnings.md`)
- [ ] Architectural decisions documented (move to main `DECISIONS.md` if applicable)
- [ ] Main `TASK.md` updated
- [ ] Ready to create pull request
