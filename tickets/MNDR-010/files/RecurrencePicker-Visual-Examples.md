# RecurrencePicker Component - Visual Examples

## Component Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Recurrence Pattern                                          │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ┌─────────────────────┐ ┌─────────────────────┐         │ │
│ │ │ Frequency           │ │ Every               │         │ │
│ │ │ ▼ Weekly            │ │ [1]                 │         │ │
│ │ └─────────────────────┘ └─────────────────────┘         │ │
│ │                                                           │ │
│ │ Repeat on                                                 │ │
│ │ ┌────┐┌────┐┌────┐┌────┐┌────┐┌────┐┌────┐             │ │
│ │ │ Mo ││ Tu ││ We ││ Th ││ Fr ││ Sa ││ Su │             │ │
│ │ │ 🔵 ││    ││ 🔵 ││    ││ 🔵 ││    ││    │             │ │
│ │ └────┘└────┘└────┘└────┘└────┘└────┘└────┘             │ │
│ │                                                           │ │
│ │ ┌─────────────────────┐                                  │ │
│ │ │ Ends                │                                  │ │
│ │ │ ▼ After             │                                  │ │
│ │ └─────────────────────┘                                  │ │
│ │                                                           │ │
│ │ ┌─────────────────────┐                                  │ │
│ │ │ Number of occurrenc │                                  │ │
│ │ │ [10]                │                                  │ │
│ │ └─────────────────────┘                                  │ │
│ │                                                           │ │
│ │ ┌──────────────────────────────────────────────────────┐│ │
│ │ │ 📅 Repeats weekly on Mon, Wed, Fri, 10 times        ││ │
│ │ └──────────────────────────────────────────────────────┘│ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Example Configurations

### Example 1: Weekly Team Meeting

**User Selections:**

- Frequency: Weekly
- Every: 1
- Repeat on: Mon, Wed, Fri (selected)
- Ends: After
- Number of occurrences: 10

**Generated RRULE:**

```
FREQ=WEEKLY;BYDAY=MO,WE,FR;COUNT=10
```

**Human Description:**

```
Repeats weekly on Mon, Wed, Fri, 10 times
```

---

### Example 2: Monthly All-Hands

**User Selections:**

- Frequency: Monthly
- Every: 1
- Ends: Never

**Generated RRULE:**

```
FREQ=MONTHLY
```

**Human Description:**

```
Repeats monthly
```

---

### Example 3: Bi-Weekly Language Class

**User Selections:**

- Frequency: Weekly
- Every: 2
- Repeat on: Sat, Sun (selected)
- Ends: On date
- End date: 2025-12-31

**Generated RRULE:**

```
FREQ=WEEKLY;INTERVAL=2;BYDAY=SA,SU;UNTIL=20251231
```

**Human Description:**

```
Repeats every 2 weeks on Sat, Sun, until 12/31/2025
```

---

### Example 4: Daily Stand-up (Weekdays Only)

**User Selections:**

- Frequency: Weekly
- Every: 1
- Repeat on: Mon, Tue, Wed, Thu, Fri (all selected)
- Ends: Never

**Generated RRULE:**

```
FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR
```

**Human Description:**

```
Repeats weekly on Mon, Tue, Wed, Thu, Fri
```

---

### Example 5: Quarterly Review

**User Selections:**

- Frequency: Monthly
- Every: 3
- Ends: After
- Number of occurrences: 4

**Generated RRULE:**

```
FREQ=MONTHLY;INTERVAL=3;COUNT=4
```

**Human Description:**

```
Repeats every 3 months, 4 times
```

---

## UI States

### Default State (Weekly, No end)

```
Frequency: [Weekly  ▼]    Every: [1]
Repeat on: [ Mo ][ Tu ][ We ][ Th ][ Fr ][ Sa ][ Su ]
Ends: [Never  ▼]
```

### Selected Days (Visual Indicator)

```
Unselected: ┌────────┐     Selected:  ┌────────┐
            │   Mo   │                │   Mo   │
            │        │                │  ✓     │  (blue background)
            └────────┘                └────────┘
```

### End Type: After

```
Ends: [After  ▼]
Number of occurrences: [10]
```

### End Type: On Date

```
Ends: [On date  ▼]
End date: [📅 2025-12-31]
```

### Disabled State

```
All inputs grayed out, no hover effects
Buttons not clickable
Shows disabled cursor
```

## Translation Examples (UK)

### Frequency Options

- Daily → "Щодня"
- Weekly → "Щотижня"
- Monthly → "Щомісяця"
- Yearly → "Щороку"

### Days of Week

- Mon → "Пн"
- Tue → "Вт"
- Wed → "Ср"
- Thu → "Чт"
- Fri → "Пт"
- Sat → "Сб"
- Sun → "Нд"

### End Conditions

- Never → "Ніколи"
- After → "Після"
- On date → "До дати"

### Description Examples (Ukrainian)

```
"Повторюється щотижня у Пн, Ср, Пт, 10 разів"
"Повторюється кожні 2 тижні у Сб, Нд, до 31.12.2025"
"Повторюється щомісяця"
```

## Responsive Design

### Desktop (> 640px)

```
┌────────────────────┐ ┌────────────────────┐
│ Frequency          │ │ Every              │
│ ▼ Weekly           │ │ [1]                │
└────────────────────┘ └────────────────────┘

Day buttons: 7 in a row
```

### Mobile (< 640px)

```
┌───────────────────────────────────┐
│ Frequency                         │
│ ▼ Weekly                          │
└───────────────────────────────────┘
┌───────────────────────────────────┐
│ Every                             │
│ [1]                               │
└───────────────────────────────────┘

Day buttons: Wrap to multiple rows
```

## Accessibility Features

1. **Keyboard Navigation**:

   - Tab through all inputs
   - Space/Enter to toggle day buttons
   - Arrow keys in dropdowns

2. **Screen Readers**:

   - Proper labels for all inputs
   - Button text (not just icons)
   - Description text announces changes

3. **Visual Indicators**:

   - Not color-only (border + background + text)
   - Clear focus states
   - High contrast text

4. **Form Integration**:
   - Disabled state propagates
   - Error states can be shown
   - Value updates parent form

## Performance Characteristics

- **Initial Render**: < 10ms (lightweight component)
- **State Updates**: Immediate (React batching)
- **RRULE Parsing**: < 1ms (simple regex)
- **RRULE Building**: < 1ms (string concatenation)
- **Re-renders**: Only on user interaction (optimized with useCallback/useEffect)

## Common Use Cases

1. **Weekly Classes**: Weekly on specific days, for N weeks
2. **Monthly Meetings**: First/last day of month (use MONTHLY)
3. **Bi-weekly Events**: Every 2 weeks on specific days
4. **Daily Reminders**: Daily for N days
5. **Seasonal Events**: Yearly on same date
6. **Limited Series**: After N occurrences
7. **Summer Program**: Until specific end date

## Integration with EventForm

The RecurrencePicker is shown only when the "This is a recurring event" checkbox is checked:

```tsx
<Checkbox
  label="This is a recurring event"
  {...getFieldProps("is_recurring")}
/>;

{
  values.is_recurring && (
    <div>
      <label>Recurrence Pattern</label>
      <RecurrencePicker
        disabled={isBusy}
        onChange={(value) => {
          setValues((prev) => ({
            ...prev,
            recurrence_rule: value,
          }));
        }}
        value={values.recurrence_rule}
      />
    </div>
  );
}
```

## Data Flow

```
User Interaction
      ↓
   Component State Update (useState)
      ↓
   buildRRule() function
      ↓
   RRULE string generated
      ↓
   onChange() callback
      ↓
   setValues() in parent form
      ↓
   Form values.recurrence_rule updated
      ↓
   Saved to database on form submit
```

## Error Handling

1. **Invalid RRULE on Load**: Falls back to defaults
2. **Missing Required Fields**: Skips optional clauses
3. **Invalid Date Format**: Uses empty string
4. **Negative Intervals**: Enforces minimum of 1
5. **Parsing Errors**: Logs warning, uses defaults
