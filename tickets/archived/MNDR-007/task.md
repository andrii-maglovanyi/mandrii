# MNDR-007: Add generic README description based on the functionality of the website

**Linear Ticket**: https://linear.app/mandrii/issue/MNDR-7/add-generic-readme-description-based-on-the-functionality-of  
**Branch**: `MNDR-007_add-readme-description`  
**Started**: October 18, 2025  
**Status**: In Progress

---

## Ticket Description

Add a comprehensive, generic README description that accurately describes the Mandrii website's functionality, features, and purpose. The description should help new visitors and contributors quickly understand what the project does.

## Acceptance Criteria

- [ ] README includes clear project description
- [ ] Key features are documented
- [ ] Technology stack is listed
- [ ] README is professional and informative
- [ ] Both English and Ukrainian context mentioned

---

## Implementation Plan

### 1. Analysis & Research

- [x] Read current README.md structure
- [x] Identify website features from codebase
- [x] Review PLANNING.md for architecture overview
- [x] List all user-facing features

### 2. Implementation Tasks

- [x] Write project overview section
- [x] Document key features (venues, blog, CV, etc.)
- [x] List technology stack
- [x] Mention bilingual support (EN/UK)
- [x] Keep existing author information

### 3. Testing

- [x] Review README for clarity
- [x] Ensure all mentioned features are accurate
- [x] Check formatting and readability

### 4. Code Quality

- [x] Markdown formatting correct
- [x] Links working (if any added)
- [x] Grammar and spelling check

### 5. Documentation

- [x] Update TASK.md with MNDR-007 reference
- [x] Document completion in notes.md

---

## Files to Modify

- `README.md` - Add comprehensive project description and feature list

---

## Technical Approach

1. Review the current minimal README (only has author info)
2. Analyze the codebase to identify all user-facing features:
   - Venue directory and search
   - User authentication (NextAuth)
   - Bilingual i18n (English/Ukrainian)
   - Blog/posts functionality
   - CV/resume section
   - Contact form
   - PWA support
   - Map integration (Google Maps)
3. Write clear, concise description following good README practices
4. Organize content logically: Overview → Features → Tech Stack → Author

---

## Discovered During Work

[Will add any new tasks or issues discovered while working]

---

## Completion Checklist

- [x] All implementation tasks complete
- [x] README reviewed for accuracy
- [x] Markdown formatting correct
- [x] Documentation updated
- [x] Main `TASK.md` updated
- [x] Ready to commit and create PR

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

- `path/to/file1.ts` - [Description of changes]
- `path/to/file2.tsx` - [Description of changes]

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
