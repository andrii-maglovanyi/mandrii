# Ticket Learnings & Knowledge Base

**Last Updated**: October 16, 2025

> This document captures key learnings, patterns, and discoveries from completed Linear tickets. It serves as a knowledge base for future development work.

---

## October 2025

### MNDR-005: Replace forEach with for...of

**Date**: October 16, 2025  
**Ticket Folder**: `tickets/archived/MNDR-005/`

#### Technical Learnings

1. **for...of vs forEach Type Safety**
   - `for...of` provides stricter TypeScript type inference than `forEach`
   - This stricter checking can expose hidden type safety issues
   - Example: Revealed that `Alert.test.tsx` was using string literals instead of `ColorVariant` enum
   - **Takeaway**: Stricter type checking is an opportunity to improve code quality, not a problem to work around

2. **Control Flow Differences**
   - `forEach` only supports `return` (which exits the callback, not the parent function)
   - `for...of` supports `break` (exit loop) and `continue` (skip iteration)
   - Example: In `EditVenue.tsx`, had to change `return` to `continue` for proper loop control
   - **Takeaway**: Choose loop construct based on control flow needs

3. **Performance Characteristics**
   - `for...of` has no function call overhead (forEach creates a function scope per iteration)
   - For small arrays (our typical use case), performance difference is negligible
   - Main benefits are code clarity and control flow options
   - **Takeaway**: Readability and correctness > micro-optimizations for typical use cases

#### Git & Tooling Learnings

4. **Pre-commit Hook Maintenance**
   - Pre-commit hooks need updates when core tooling changes
   - ESLint 9 migration deprecated `next lint` command, breaking our lint-staged setup
   - Hooks can silently fail, causing confusion during commits
   - **Takeaway**: After major dependency updates, test git hooks thoroughly

5. **lint-staged Auto-stash Behavior**
   - lint-staged automatically stashes changes before running linters
   - If linters fail, changes remain in stash (not automatically restored)
   - Must manually check `git stash list` and `git stash pop` to recover
   - **Takeaway**: Always check `git status` and `git stash list` after failed commits

6. **Branch Naming Conventions**
   - Husky hooks enforce specific naming patterns
   - Our pattern: `MNDR-XXX_description` with minimum 3 digits
   - `MNDR-5` fails, must be `MNDR-005`
   - **Takeaway**: Learn project's branch naming conventions early to avoid rework

#### Testing & Code Quality

7. **Enum vs String Literals in Tests**
   - Tests should use the same type safety as production code
   - Using string literals in tests can hide type mismatches
   - Example: `["error", "warning"]` vs `[ColorVariant.Error, ColorVariant.Warning]`
   - **Takeaway**: Apply strict typing to test code, not just production code

8. **When to Fix vs Suppress Type Errors**
   - Type errors are opportunities to improve code quality
   - Prefer fixing root cause over type assertions (`as Type`)
   - Type assertions mask problems and reduce type safety
   - **Takeaway**: When TypeScript complains, investigate and fix rather than suppress

---

## Template for Future Entries

### [TICKET-ID]: [Ticket Title]

**Date**: [Date]  
**Ticket Folder**: `tickets/archived/[TICKET-ID]/`

#### [Category Name]

1. **[Learning Title]**
   - [Description of what was learned]
   - Example: [Concrete example from the ticket]
   - **Takeaway**: [Key lesson to remember]

---

## How to Use This Document

1. **When completing a ticket**: Extract key learnings from `tickets/[TICKET-ID]/notes.md` and add them here
2. **When starting new work**: Search this document for relevant learnings before implementing
3. **During code review**: Reference learnings to explain technical decisions
4. **For onboarding**: Share this document with new team members

## Categories for Organizing Learnings

- **Technical Learnings**: Code patterns, language features, framework behaviors
- **Git & Tooling**: Version control, build tools, CI/CD
- **Testing & Code Quality**: Testing strategies, linting, type safety
- **Performance**: Optimization techniques, benchmarking
- **Security**: Security patterns, vulnerability fixes
- **Architecture**: Design patterns, system design decisions
- **Dependencies**: Library usage, integration patterns
- **Debugging**: Problem-solving techniques, troubleshooting

---

**Related Documentation**:
- `COMPLETED.md` - Historical record of completed tasks
- `DECISIONS.md` - Architectural decision records
- `tickets/archived/` - Detailed ticket documentation
