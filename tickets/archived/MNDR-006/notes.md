# MNDR-006 - Development Notes

**Ticket**: SonarQube - Move async function 'submitVenue' to the outer scope  
**Date Started**: October 16, 2025  
**Date Completed**: October 16, 2025

---

## Initial Exploration

Found `submitVenue` function defined inside the `EditVenue` component at line 172-180. The function:
- Makes a POST request to `/api/venue/save`
- Accepts `body: FormData` and `locale: string` as parameters
- Returns `{ errors, ok }` object
- Does NOT capture any variables from the component scope
- Is a pure function that can safely be moved to module scope

---

## Implementation

### Simple Move Operation

This was a straightforward refactoring:
1. Added `submitVenue` function to module scope (after existing helper functions)
2. Removed the duplicate function definition from inside the component
3. No changes to function signature or call site needed
4. Function was already properly parameterized

**Location**: Added at line 41 (after `createFilesFromUrls` helper)

---

## Key Learnings

1. **SonarQube Performance Rule**
   - Functions defined in nested scopes are recreated on every render
   - Moving to module scope improves performance and enables V8 optimizations
   - Only safe when function doesn't capture variables from parent scope

2. **Quick Win Refactoring**
   - This was a 5-minute fix with measurable performance benefit
   - No behavior changes, just better structure
   - TypeScript caught any potential issues immediately

3. **Pattern Recognition**
   - Look for functions inside components that only use their parameters
   - Good candidates for extraction to module scope
   - Similar to `createFileFromUrl` and `createFilesFromUrls` already in the file

---

## Problem-Solving Journal

### [Date] - [Topic]

**Problem**: [Describe the problem you encountered]

**Approaches Tried**:

1. [Approach 1] - [Result]
2. [Approach 2] - [Result]

**Solution**: [What ultimately worked]

**Learning**: [What you learned from this]

---

## Code Discoveries

- **File**: `path/to/file.ts`
  - [Interesting finding or pattern]
- **Pattern**: [Pattern name]
  - [How it's used in the codebase]

---

## Useful Resources

- [Link to documentation]
- [Stack Overflow answer that helped]
- [GitHub issue or PR reference]

---

## Questions & Answers

**Q**: [Question you had]  
**A**: [Answer you found]

---

## Performance Considerations

[Any performance-related observations]

---

## Security Considerations

[Any security-related observations]

---

## Future Improvements

[Ideas for future improvements related to this work]

---

## Key Learnings

[Main takeaways from this ticket - these should be moved to `docs/ticket-learnings.md` upon completion]
