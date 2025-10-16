# MNDR-006: SonarQube - Move async function 'submitVenue' to the outer scope

**Linear Ticket**: https://linear.app/mandrii/issue/MNDR-6/sonarqube-move-async-function-submitvenue-to-the-outer-scope  
**Branch**: `MNDR-006_move-submitvenue-to-outer-scope`  
**Started**: October 16, 2025  
**Status**: In Progress

---

## Ticket Description

When functions are defined in nested scopes unnecessarily, it creates several problems:

**Performance Impact**: Functions defined inside other functions are recreated every time the outer function runs. This wastes memory and processing time, especially in frequently called code.

**Engine Optimization**: JavaScript engines like V8 have optimization limits. Functions in nested scopes are harder to optimize, which can slow down your application.

**Code Readability**: Functions at higher scopes are easier to find and understand. When a function doesn't depend on its surrounding context, placing it at the top level makes the code structure clearer.

**Memory Usage**: Each function instance takes up memory. Creating the same function repeatedly in nested scopes increases memory consumption unnecessarily.

The rule identifies functions that capture no variables from their enclosing scope, meaning they can be safely moved to a higher level without changing their behavior.

## Acceptance Criteria

- [x] Move `submitVenue` function from inside `EditVenue` component to module scope
- [x] Ensure function doesn't capture any variables from component scope
- [x] Update function to accept any needed parameters explicitly (already parameterized)
- [x] Verify all tests still pass (no test changes needed)
- [x] Verify TypeScript compilation passes

---

## Implementation Plan

### 1. Analysis & Research

- [ ] Read and understand relevant code
- [ ] Identify files that need to be modified
- [ ] Research any unknown technologies/patterns
- [ ] Review related documentation

### 2. Implementation Tasks

- [ ] [Specific task 1]
- [ ] [Specific task 2]
- [ ] [Specific task 3]

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

- `apps/web/src/components/layout/UserDirectory/Venues/Venue/EditVenue.tsx` - Move `submitVenue` function to module scope

---

## Technical Approach

**Current State** (Line 172-180):

```typescript
// Inside EditVenue component
async function submitVenue(body: FormData, locale: string) {
  const res = await fetch(`/api/venue/save?locale=${locale}`, {
    body,
    method: "POST",
  });
  const result = await res.json();
  return { errors: result.errors, ok: res.ok };
}
```

**Analysis**:

- Function is defined inside the `EditVenue` component
- It captures NO variables from the component scope
- Parameters: `body: FormData`, `locale: string`
- Returns: `{ errors: ZodError["issues"] | undefined, ok: boolean }`
- Called only once at line 135

**Proposed Solution**:

1. Move the function definition to module scope (outside the component)
2. Keep the exact same function signature (no changes needed)
3. Function is already properly parameterized
4. No changes needed to the call site

**Benefits**:

- Function is created once (not recreated on every render)
- Better V8 optimization
- Clearer code structure
- Reduced memory usage

---

## Discovered During Work

[Add any new tasks or issues discovered while working on this ticket]

---

## Completion Checklist

- [x] All implementation tasks complete
- [x] All tests passing (no test changes needed)
- [x] Code formatted and linted
- [ ] Documentation updated
- [ ] Knowledge preserved (move key learnings to `docs/ticket-learnings.md`)
- [ ] Architectural decisions documented (move to main `DECISIONS.md` if applicable)
- [ ] Main `TASK.md` updated
- [ ] Ready to create pull request
