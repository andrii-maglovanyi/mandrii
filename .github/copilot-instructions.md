# Mandrii AI Coding Agent Instructions

## Project Overview

This is a personal blog and a catalogue of ukrainian venues across the world (primarily Europe) where users can find venues around them, get directions, read/write reviews, and see events.

## Architecture Overview

This is an **pnpm monorepo** with two apps:

- **`apps/web`**: Next.js 15 app with App Router, internationalization (English/Ukrainian), NextAuth, Apollo Client, and Tailwind CSS
- **`apps/services`**: FastAPI Python service using uv for dependency management [not implemented yet]

The web app proxies requests to `/services/*` to the Python backend in development (localhost:8000) and production (not implemented yet). Services will handle background tasks related to API integrations, data processing, etc.

## Project Awareness & Context

- **Always read `PLANNING.md`** at the start of a new conversation to understand the project's architecture, goals, style, and constraints
- **Check `TASK.md`** for active tasks, `COMPLETED.md` for historical tasks, and `DECISIONS.md` for architectural decisions
- **Always gather context first** by reading relevant files and understanding the existing codebase before making changes
- **Use consistent naming conventions, file structure, and architecture patterns** as described in `PLANNING.md` and established in the project
- **Never assume missing context. Ask questions if uncertain.**

## Task Management

### ⚠️ CRITICAL: Always Follow Ticket Workflow - No Exceptions!

**BEFORE starting ANY Linear ticket work, you MUST:**

1. Create ticket folder: `mkdir tickets/[TICKET-ID] && mkdir tickets/[TICKET-ID]/files`
2. Copy templates: `cp tickets/templates/* tickets/[TICKET-ID]/`
3. Fill out `tickets/[TICKET-ID]/task.md` with ticket details BEFORE coding
4. Use ticket files throughout development to document work

**Failure to create ticket folder = Incomplete work. No exceptions.**

### Task Organization

- **Always check task management files** for the current task list before starting work
- **For Linear tickets**: Check if a ticket folder exists in `/tickets/[TICKET-ID]/` and use the ticket-specific task file
- **When starting work on a new Linear ticket - MANDATORY STEPS IN ORDER**:
  1. **Fetch latest changes**: `git fetch origin`
  2. **Switch to main branch**: `git checkout main`
  3. **Pull latest**: `git pull origin main`
  4. **Create ticket branch**: `git checkout -b [TICKET-ID]_description` (e.g., `MNDR-005_replace-foreach`)
     - ⚠️ **Branch naming**: Must be `MNDR-XXX_description` with at least 3 digits (enforced by Husky)
  5. **🚨 CREATE TICKET FOLDER IMMEDIATELY - DO NOT SKIP**:
     ```bash
     mkdir -p tickets/[TICKET-ID]/files
     cp tickets/templates/* tickets/[TICKET-ID]/
     ```
  6. **Fill out ticket task file**: Edit `tickets/[TICKET-ID]/task.md` with Linear ticket details
  7. **Update main TASK.md**: Add reference to ticket folder in "In Progress" section
  8. **NOW you can start coding** - document as you go in ticket files
- **If a task is not listed**, add it to the appropriate task file with a brief description and date
- **If you discover new tasks while working**, add them to `tickets/[TICKET-ID]/notes.md` under "Discovered During Work"
- **Mark completed tasks** immediately after finishing them in the ticket task.md file

### Task Completion Process

- **Clean up completed work** after completing any section:
  - Move completed tasks (marked with [x]) to historical tracking
  - Remove completed implementation plans and detailed steps
  - Keep active task files focused only on incomplete work
  - Add completion dates when archiving tasks

### 🚨 MANDATORY Ticket Completion Checklist - MUST Complete ALL Steps BEFORE PR

**When completing a Linear ticket - ALL finalization work MUST be done BEFORE creating the PR**:

#### Step 1: Complete Implementation

- [ ] All implementation tasks complete
- [ ] All tests passing (or pre-existing failures documented)
- [ ] TypeScript compilation passing
- [ ] Code formatted with Prettier
- [ ] Code linted (ESLint, Stylelint)

#### Step 2: Document Work in Ticket Folder

- [ ] `tickets/[TICKET-ID]/task.md` - Mark all tasks complete, add completion summary
- [ ] `tickets/[TICKET-ID]/notes.md` - Document all key learnings and discoveries
- [ ] `tickets/[TICKET-ID]/decisions.md` - Document all technical decisions made

#### Step 3: Preserve Knowledge (Extract from Ticket Folder)

- [ ] Extract key learnings from `tickets/[TICKET-ID]/notes.md` → `docs/ticket-learnings.md` (create if missing)
- [ ] Copy significant architectural decisions from `tickets/[TICKET-ID]/decisions.md` → main `DECISIONS.md`
- [ ] Move any reusable scripts/configs from `tickets/[TICKET-ID]/files/` → appropriate project folders
- [ ] Update any relevant project documentation with new patterns or processes

#### Step 4: Update Project Documentation

- [ ] Add comprehensive entry to `COMPLETED.md` with:
  - Completion date
  - Ticket summary
  - Key deliverables
  - Files modified
  - Technical impact
  - Challenges overcome
  - Key learnings
  - Reference to ticket folder
- [ ] Update main `TASK.md`:
  - Remove from "In Progress" section
  - Mark as complete with checkmark
  - Remove detailed implementation plans

#### Step 5: Archive Ticket Folder

- [ ] Archive ticket folder: `mv tickets/[TICKET-ID] tickets/archived/[TICKET-ID]`
- [ ] Verify ticket folder is in archived directory

#### Step 6: Commit Finalization Changes

- [ ] Stage all documentation changes: `git add COMPLETED.md TASK.md docs/ tickets/`
- [ ] Commit finalization: `git commit -m "[TICKET-ID] [Docs]: Finalize ticket documentation"`
- [ ] Ensure commit includes:
  - Updated `COMPLETED.md`
  - Updated `TASK.md`
  - Updated `docs/ticket-learnings.md` (if applicable)
  - Updated main `DECISIONS.md` (if applicable)
  - Archived ticket folder moved

#### Step 7: Create Pull Request

- [ ] Push branch: `git push origin [TICKET-ID]_description`
- [ ] Create pull request with:
  - Clear title: `[TICKET-ID]: [Brief description]`
  - Link to Linear ticket
  - Summary of changes
  - Reference to archived ticket folder for details
- [ ] Use GitHub's "Squash and merge" for clean history (if main branch is protected)

### 📋 Post-Merge Cleanup

- [ ] Switch to main: `git checkout main`
- [ ] Pull latest: `git pull origin main`
- [ ] Delete local branch: `git branch -d [TICKET-ID]_description`
- [ ] Verify archived ticket folder exists: `ls tickets/archived/[TICKET-ID]`

---

- **Always pause before starting a new task** to ensure you have the latest context and requirements
- **If you need to ask questions about a task**, do so before starting work to clarify requirements
- **NEVER skip ticket folder creation** - it's mandatory for all Linear tickets, no matter how small

## Best Practices

### 🧱 Code Structure & Modularity

- **Never create a file longer than 500 lines of code.** If a file approaches this limit, refactor by splitting it into modules or helper files
- **Organize code into clearly separated modules**, grouped by feature or responsibility
- **Use clear, consistent imports** (prefer relative imports within packages)

### 📎 Style & Conventions

- **Follow established language style guidelines** (e.g., PEP 8 for Python, ESLint for JavaScript, Stylelint for CSS)
- **Use type hints** where appropriate and supported by the language
- **Format with established formatters** (e.g., `black` for Python, `prettier` for JavaScript)
- Write **docstrings/comments for every function** using the project's established style:

  ```javascript
  /**
   * Brief summary.
   *
   * @param {type} param1 - Description.
   * @returns {type} Description.
   */
  function example(param1) {
    // ...
  }
  ```

  ```python
  def example():
      """
      Brief summary.

      Args:
          param1 (type): Description.

      Returns:
          type: Description.
      """
  ```

- **Keep imports organized and minimal**
- When writing complex logic, **add inline comments** explaining the why, not just the what
- **ALWAYS follow linting rules to avoid commit issues**:
  - Remove unused imports
  - Keep line length within project standards
  - Use consistent string quoting
  - End files with newlines
  - Remove trailing whitespace
  - Run formatters before committing
  - **Use ignore comments sparingly** for unavoidable long lines

### 🧪 Testing & Reliability

- **Always create unit tests for new features** (functions, classes, modules, etc)
- **After updating any logic**, check whether existing tests need to be updated
- **Tests should live in established test directories** mirroring the main project structure
  - Include at least:
    - 1 test for expected use
    - 1 edge case
    - 1 failure case
- **ALWAYS RUN TESTS** if you create or modify any test files. Tests MUST complete successfully before moving forward
- Execute tests using the project's established test runner
- **Mock external dependencies** appropriately
- Test both success and failure scenarios

### 📚 Documentation & Explainability

- **Update README.md** when new features are added, dependencies change, or setup steps are modified
- **Comment non-obvious code** and ensure everything is understandable to a mid-level developer
- **Include documentation for complex functions**
- **Follow the project's documentation structure**:
  - `PLANNING.md` - Architecture and design principles
  - `TASK.md` - Active task tracking
  - `COMPLETED.md` - Historical task records
  - `DECISIONS.md` - Architectural decision records
- **Use established documentation folders** to organize technical documentation
- **Check reference documentation** when you need to look up external APIs, implementation patterns, or other resources

### ⚠️ Common Issues to Avoid

- Don't hardcode connection strings or credentials
- Always validate input parameters and data types
- Be careful with data type mismatches
- Consider timezone handling for timestamp fields
- Ensure proper escaping for special characters
- Follow security best practices for the technology stack

### 🧠 AI Behavior Rules

- **Always check current git branch and status** before starting any work to prevent data loss:
  - Run `git branch --show-current` to see current branch
  - Run `git status` to check for uncommitted changes
  - If already on a ticket branch, create/update the corresponding ticket folder
  - Never assume git state - always verify before proceeding
- **Never assume missing context. Ask questions if uncertain.**
- **Never hallucinate libraries or functions** – only use known, verified packages/modules
- **Always confirm file paths and module names** exist before referencing them in code or tests
- **Never delete or overwrite existing code** unless explicitly instructed to
- **ALWAYS write lint-compliant code to prevent commit failures**:
  - Check for unused imports and remove them immediately
  - Follow line length standards
  - Use proper string quoting consistently
  - Ensure files end with newlines and have no trailing whitespace
  - Run formatters before suggesting commits

### 📤 Version Control Best Practices

- **Branches are named with Linear ticket IDs** (e.g., `TICKET-123`, `PROJ-456`) or follow established naming conventions
- **Always start work with clean git state**:
  - `git fetch origin` - Fetch latest changes
  - `git checkout main` - Switch to main branch (adjust for project)
  - `git pull origin main` - Pull latest
  - `git checkout -b [TICKET-ID]` - Create new ticket branch
- **After completing a task**, recommend committing changes with clear, descriptive commit messages
- **Commit message format**:

  ```
  [TICKET-ID] [Type]: Brief summary of changes

  - Detailed explanation of what was changed
  - Why the change was made (if not obvious)
  - References to relevant requirements or Linear ticket
  ```

- Task types examples: `[Fix]`, `[Feature]`, `[Test]`, `[Refactor]`, `[Docs]`
- **Before pushing changes**:
  - Ensure all tests pass
  - Update relevant documentation
  - Complete ticket checklist in `tickets/[TICKET-ID]/task.md` (if using ticket folders)
- **When ready to create a pull request**:
  1. **Complete all finalization work BEFORE creating the PR**:
     - **Update completed tasks file**: Add comprehensive ticket summary with completion date, key deliverables, technical impact, and learnings
     - **Preserve ticket knowledge**: Extract key learnings from `tickets/[TICKET-ID]/notes.md` → `docs/ticket-learnings.md`
     - **Archive architectural decisions**: Move decisions from `tickets/[TICKET-ID]/decisions.md` → main decision records
     - **Clean up main task file**: Remove completed tasks and mark ticket as done
     - **Archive ticket folder**: Move `tickets/[TICKET-ID]` to `tickets/archived/[TICKET-ID]/`
     - **Update documentation**: Ensure any new patterns or processes are captured in relevant docs
     - **Commit finalization changes**: Include all documentation updates in the same PR
  2. **Fetch latest main**: `git fetch origin`
  3. **Rebase on main**: `git rebase origin/main`
  4. **Resolve any conflicts** if they arise during rebase
  5. **Consider squashing commits** for cleaner history:
     - Use GitHub's "Squash and merge" option (preferred for protected branches)
     - Or manually squash: `git rebase -i HEAD~[number-of-commits]` to interactively squash
     - Create comprehensive commit message that captures all changes including finalization
  6. **Push branch**: `git push origin [TICKET-ID]` (or `git push --force-with-lease` if rebased)
  7. **Create pull request** with reference to Linear ticket
- **After merging pull request** (GitHub will auto-delete remote branch with squash and merge):
  1. **Switch to main and pull**: `git checkout main && git pull origin main`
  2. **Delete local branch**: `git branch -d [TICKET-ID]`
  3. **Verify squashed commit**: `git log --oneline -5` to see clean history
- **Comprehensive squashed commit message format** (includes all work + finalization):

  ```
  [TICKET-ID] [Primary-type]: Complete implementation of [feature/fix]

  Implementation Summary:
  - Feature 1: Description of main feature implemented
  - Feature 2: Description of secondary feature
  - Fix: Description of any bugs fixed
  - Refactor: Description of code improvements
  - Tests: Description of test coverage added

  Finalization Summary:
  - Updated completed tasks with comprehensive project summary
  - Preserved key learnings in docs/ticket-learnings.md
  - Archived architectural decisions to decision records
  - Cleaned up main task file and archived ticket folder
  - Updated project documentation

  Technical Details:
  - Files modified: list of key files changed
  - Database changes: any schema or data changes
  - Dependencies: any new packages or dependencies
  - Documentation: knowledge preservation and cleanup completed

  Linear: [TICKET-ID]
  ```

- Prioritize atomic commits that focus on a single logical change when possible
- Suggest creating a new branch when working on major features or significant refactoring
- Include references to completed tasks from main task file or ticket-specific task file in commit messages

### 📋 Project-Specific Adaptations

When using these instructions, adapt the following to your specific project:

1. **Technology Stack**: Update language-specific guidelines, frameworks, and tools
2. **Branch Strategy**: Adjust git workflow to match your team's branching strategy
3. **Testing Framework**: Replace test commands with your project's testing setup
4. **Documentation Structure**: Modify file names and locations to match your project
5. **Task Management**: Adapt task tracking to your project's system (Linear, GitHub Issues, etc.)
6. **Code Standards**: Update linting rules and formatting standards to match your project
7. **Directory Structure**: Modify paths and folder organization to match your project layout
8. **Dependencies**: Update package managers and dependency management practices
9. **Documentation Files**: Create `PLANNING.md` and `DECISIONS.md` using the provided prompts if they don't exist
