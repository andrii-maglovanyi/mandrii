# Ticket Templates

This directory contains templates for creating new Linear ticket folders.

## Templates

- **`task.md`** - Ticket-specific tasks and implementation plan
- **`notes.md`** - Development notes and discoveries
- **`decisions.md`** - Ticket-specific technical decisions

## Usage

When starting a new Linear ticket:

```bash
# 1. Create ticket folder
mkdir tickets/TICKET-ID

# 2. Copy all templates
cp tickets/templates/* tickets/TICKET-ID/

# 3. Create files directory (if needed)
mkdir tickets/TICKET-ID/files

# 4. Update task.md with ticket details
# Edit tickets/TICKET-ID/task.md
```

## Template Customization

Each template includes placeholder text in `[brackets]` that should be replaced with actual content:

- `[TICKET-ID]` - e.g., MNDR-123
- `[Ticket Title]` - Brief description of the ticket
- `[Date]` - Current date in format: October 16, 2025
- `[Link to Linear ticket]` - URL to the Linear ticket

## Best Practices

1. **Fill out task.md first** with ticket details and acceptance criteria
2. **Use notes.md actively** during development to capture learnings
3. **Document decisions.md** when making non-obvious technical choices
4. **Keep files/ organized** with descriptive names for any scripts or configs
5. **Review before completion** to ensure all knowledge is captured

## After Ticket Completion

Before archiving:

1. Extract key learnings from `notes.md` → `docs/ticket-learnings.md`
2. Move architectural decisions from `decisions.md` → main `DECISIONS.md` (if significant)
3. Update main `TASK.md` and `COMPLETED.md`
4. Archive to `tickets/archived/[TICKET-ID]/` or delete if fully documented elsewhere
