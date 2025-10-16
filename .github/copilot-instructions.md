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

### Task Organization

- **Always check task management files** for the current task list before starting work
- **For Linear tickets**: Check if a ticket folder exists in `/tickets/[TICKET-ID]/` and use the ticket-specific task file
- **When starting work on a new Linear ticket**:
  1. **Fetch latest changes**: `git fetch origin`
  2. **Switch to main branch**: `git checkout main`
  3. **Pull latest**: `git pull origin main`
  4. **Create ticket branch**: `git checkout -b [TICKET-ID]` (e.g., `MNDR-123`)
  5. **Create ticket folder**: `/tickets/[TICKET-ID]/`
  6. **Copy templates**: `cp tickets/templates/* tickets/[TICKET-ID]/` (if templates exist)
  7. **Update ticket task file** with Linear details
  8. **Reference ticket folder** in main task file
- **If a task is not listed**, add it to the appropriate task file with a brief description and date
- **If you discover new tasks while working**, add them to the task file under a "Discovered During Work" section
- **Mark completed tasks** immediately after finishing them

### Task Completion Process

- **Clean up completed work** after completing any section:
  - Move completed tasks (marked with [x]) to historical tracking
  - Remove completed implementation plans and detailed steps
  - Keep active task files focused only on incomplete work
  - Add completion dates when archiving tasks
- **When completing a Linear ticket - ALL finalization work MUST be done BEFORE creating the PR**:
  1. **Complete all implementation and testing work**
  2. **Archive ticket context and preserve knowledge**:
     - Move important discoveries from `tickets/[TICKET-ID]/notes.md` to `docs/ticket-learnings.md`
     - Copy architectural decisions from `tickets/[TICKET-ID]/decisions.md` to main decision records
     - Add comprehensive ticket summary to completed tasks with reference to Linear ticket
     - Preserve any reusable scripts/configs by moving to appropriate `docs/` or project folders
  3. **Clean up project documentation**:
     - Update main task file by removing completed work and marking ticket as done
     - Archive ticket folder to `tickets/archived/[TICKET-ID]/`
     - Update any relevant project documentation with new patterns or processes discovered
  4. **Commit ALL finalization changes as part of the same PR**
  5. **Create single pull request** that includes both implementation and finalization
  6. **Use GitHub's "Squash and merge"** for clean history (if main branch is protected)
- **Always pause before starting a new task** to ensure you have the latest context and requirements
- **If you need to ask questions about a task**, do so before starting work to clarify requirements

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

### 🔧 Usage Instructions

1. Copy this file to your project's `.github/` or `docs/` directory
2. Rename to match your project's naming convention
3. Customize the project-specific sections above
4. Remove this usage section
5. Add any project-specific patterns, conventions, or requirements
6. Reference this file in your project's main documentation
