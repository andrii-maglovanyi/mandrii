# Ticket Learnings & Knowledge Base

**Last Updated**: November 4, 2025

> This document captures key learnings, patterns, and discoveries from completed Linear tickets. It serves as a knowledge base for future development work.

---

## November 2025

### MNDR-008: Add Events Database Schema & Hasura Setup

**Date**: November 3-4, 2025  
**Ticket Folder**: `tickets/archived/MNDR-008/`

#### Database Design & PostgreSQL

1. **PostgreSQL ENUMs vs TEXT Foreign Keys**

   - Native PostgreSQL ENUMs provide database-level type validation
   - ENUMs are stored as integers internally (better performance)
   - Invalid values are rejected at DB level before reaching application
   - Example: `event_type public.event_type_enum NOT NULL` vs `event_type TEXT NOT NULL REFERENCES event_type(value)`
   - **Takeaway**: Use PostgreSQL ENUMs for fixed sets of values; reserve foreign keys for dynamic reference data

2. **Hybrid ENUM Pattern**

   - Create both ENUM type AND lookup table: `CREATE TYPE x_enum AS ENUM (...); CREATE TABLE x (value TEXT PRIMARY KEY, description TEXT);`
   - ENUM provides type constraint on main table
   - Lookup table provides human-readable descriptions for UI
   - Best of both worlds: type safety + metadata
   - **Takeaway**: For type-constrained fields that need descriptions, use ENUM + lookup table pattern

3. **Migration Order Dependencies**

   - Helper functions must exist before tables that use them
   - Example: Created `set_current_timestamp_updated_at()` function in migration before events table
   - Otherwise migration fails with "function does not exist"
   - **Takeaway**: Always create utility functions in separate, earlier migrations

4. **TIMESTAMPTZ for All Date/Time Fields**
   - Always use `TIMESTAMPTZ` instead of `TIMESTAMP` for timezone-aware storage
   - Essential for applications with global users or events
   - Prevents timezone bugs and data corruption
   - Example: `start_date TIMESTAMPTZ NOT NULL` for event times
   - **Takeaway**: Never use TIMESTAMP without TZ in PostgreSQL; always use TIMESTAMPTZ

#### Hasura & GraphQL

5. **Relationship Names vs Column Names**

   - Hasura relationship names cannot conflict with column names
   - Example: Column `event_type` conflicted with relationship `event_type`
   - Solution: Use camelCase for relationships (`eventType`) when column uses snake_case
   - Metadata fails to apply with cryptic error about duplicate fields
   - **Takeaway**: Use different naming conventions for columns vs relationships (snake_case vs camelCase)

6. **ENUMs Don't Support Foreign Key Relationships**

   - PostgreSQL ENUM types can't have foreign key constraints
   - Hasura metadata will show "no foreign constraint exists" errors if you try
   - Must remove FK-based relationships from metadata after converting to ENUMs
   - Can't have object/array relationships from ENUM columns
   - **Takeaway**: When using ENUMs, remove any foreign_key_constraint_on relationships from Hasura metadata

7. **Testing Order for Hasura Changes**
   - Apply migrations first → verify tables exist
   - Then apply metadata → verify relationships work
   - Test permissions separately for each role
   - Always reload metadata after schema changes: `hasura metadata reload`
   - **Takeaway**: Incremental testing (migrations → metadata → permissions) catches issues faster

#### Multilingual Data Modeling

8. **Plan Multilingual from the Start**

   - Adding multilingual fields later requires schema migration
   - Example: Had to alter event_tags to add name_en/name_uk after initial creation
   - Better to design with name_en/name_uk from beginning
   - Matches existing venue naming pattern (name_en/name_uk)
   - **Takeaway**: For any user-facing text in a multilingual app, add \_en and \_uk columns from the start

9. **Translating Initial Seed Data**
   - Don't just copy English to Ukrainian - provide real translations
   - Example: "Family Friendly" → "Сімейний", not just copying the English
   - Seed data should demonstrate proper multilingual usage
   - Shows future developers the expected pattern
   - **Takeaway**: Invest time in quality translations for seed data to set the right example

#### Architecture & Design Patterns

10. **Flexible Location Models**

    - Single table can support multiple location types with nullable fields
    - Example: Events can be venue-based (venue_id), custom location (address + geo), or online (is_online)
    - Avoids complex joins or polymorphic associations
    - Simpler queries: `WHERE is_online = true` vs multi-table unions
    - **Takeaway**: For mutually exclusive options, use nullable fields in single table rather than separate tables

11. **Junction Tables for Many-to-Many**

    - Use composite primary key for junction tables: `PRIMARY KEY (event_id, tag_id)`
    - Add CASCADE on deletes to maintain referential integrity
    - Example: `events_event_tags` junction for events ↔ tags
    - Enables flexible tagging without schema changes
    - **Takeaway**: Many-to-many relationships need junction tables with proper foreign key cascades

12. **Status-Based Permission Filtering**
    - Use status field for moderation workflow (DRAFT → PENDING → ACTIVE)
    - Public role: `WHERE status = 'ACTIVE'`
    - User role: `WHERE status = 'ACTIVE' OR user_id = X-Hasura-User-Id`
    - Enables users to see their own unpublished content
    - **Takeaway**: Status + ownership filtering provides flexible permission model

---

## October 2025

### MNDR-006: Move submitVenue function to module scope

**Date**: October 16, 2025  
**Ticket Folder**: `tickets/MNDR-006/`

#### Performance & Optimization

1. **Functions in Nested Scopes - Performance Impact**

   - Functions defined inside React components are recreated on every render
   - This wastes memory and prevents V8 optimization
   - Example: `submitVenue` was being recreated on every EditVenue render
   - **Takeaway**: Extract pure functions (those not capturing component variables) to module scope

2. **Quick Win Refactorings**

   - SonarQube identifies real performance issues, not just style preferences
   - Simple moves to module scope can have measurable impact
   - 5-minute fix with zero behavior changes
   - **Takeaway**: Code quality tools like SonarQube point to legitimate optimizations

3. **Pattern Recognition for Function Extraction**
   - Look for functions that only use their parameters
   - Functions that don't use hooks, props, or state
   - Similar to helper functions like `createFileFromUrl`
   - **Takeaway**: If a function doesn't need component context, move it out

---

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
