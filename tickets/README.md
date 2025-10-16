# JIRA Tickets Workspace

This directory contains ticket-specific task files and documentation organized by Linear ticket ID.

## Structure

```
tickets/
├── [TICKET-ID]
│   ├── task.md         # Ticket-specific tasks and implementation plan
│   ├── notes.md        # Development notes and discoveries
│   ├── decisions.md    # Ticket-specific architectural decisions
│   └── files/          # Any ticket-specific files (scripts, configs, etc.)
├── archived/           # Completed tickets (optional archival)
├── templates/          # Templates for new tickets
└── README.md           # This file
```

## Workflow

### Starting a New Ticket

1. Create branch with ticket ID: `git checkout -b TICKET-123`
2. Create ticket folder: `mkdir tickets/TICKET-123`
3. Copy templates: `cp tickets/templates/* tickets/TICKET-123/`
4. Update `task.md` with Linear ticket details
5. Update main `TASK.md` to reference the ticket folder

### Working on a Ticket

- Use `tickets/TICKET-123/task.md` for ticket-specific tasks
- Use `tickets/TICKET-123/notes.md` for development notes
- Store any ticket-specific files in `tickets/TICKET-123/files/`

### Completing a Ticket

1. Mark tasks complete in ticket folder
2. Update main `COMPLETED.md` with ticket reference
3. **Preserve ticket knowledge**:
   - Extract key learnings from `notes.md` → `docs/ticket-learnings.md`
   - Move architectural decisions from `decisions.md` - main `DECISIONS.md`
   - Save reusable scripts/configs to appropriate project folders
4. **Choose archival method**:
   - **Option A**: Archive to `tickets/archived/[TICKET-ID]/` for future reference
   - **Option B**: Delete ticket folder if all knowledge is fully documented elsewhere
5. Update relevant project documentation with new patterns/processes

### Knowledge Preservation
