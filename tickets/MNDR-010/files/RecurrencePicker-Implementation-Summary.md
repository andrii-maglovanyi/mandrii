# RecurrencePicker Implementation Summary

**Date**: November 4, 2025  
**Component**: `apps/web/src/components/ui/RecurrencePicker/RecurrencePicker.tsx`

## Overview

Replaced simple text input for event recurrence with a visual picker component that generates iCalendar RRULE strings.

## Features

### 1. Frequency Selection

- **Options**: Daily, Weekly, Monthly, Yearly
- **Interval Input**: "Every N days/weeks/months/years" with number input
- **UI**: Select dropdown + number input

### 2. Day of Week Selection (Weekly only)

- **Days**: Monday through Sunday
- **UI**: Toggle buttons with visual selection state
- **Behavior**: Multiple days can be selected
- **Format**: Generates BYDAY clause (e.g., BYDAY=MO,WE,FR)

### 3. End Conditions

- **Never**: Infinite recurrence (no UNTIL or COUNT)
- **After N occurrences**: COUNT clause (e.g., COUNT=10)
- **On specific date**: UNTIL clause (e.g., UNTIL=20251231)

### 4. Human-Readable Description

- Real-time description updates as user makes selections
- Examples:
  - "Repeats weekly on Mon, Wed, Fri, 10 times"
  - "Repeats daily, until 12/31/2025"
  - "Repeats every 2 weeks on Sat, Sun"

## Technical Implementation

### RRULE Format

Generates standard iCalendar RRULE strings:

```
FREQ=WEEKLY;INTERVAL=2;BYDAY=MO,WE,FR;COUNT=10
```

### State Management

```typescript
interface RecurrenceState {
  frequency: FrequencyType; // DAILY | WEEKLY | MONTHLY | YEARLY
  interval: number; // 1, 2, 3, etc.
  selectedDays: DayOfWeek[]; // MO, TU, WE, TH, FR, SA, SU
  endType: EndType; // NEVER | COUNT | DATE
  count: number; // For COUNT end type
  endDate: string; // YYYY-MM-DD for DATE end type
}
```

### RRULE Parsing

- Parses existing RRULE strings on component mount
- Extracts FREQ, INTERVAL, BYDAY, COUNT, UNTIL clauses using regex
- Converts to internal state for editing

### RRULE Building

- Constructs RRULE string from state
- Only includes non-default values (e.g., omits INTERVAL=1)
- Converts date format from YYYY-MM-DD to YYYYMMDD for UNTIL

### Form Integration

```typescript
<RecurrencePicker
  disabled={isBusy}
  onChange={(value) => {
    setValues((prev) => ({
      ...prev,
      recurrence_rule: value,
    }));
  }}
  value={values.recurrence_rule as string | null}
/>
```

## UI/UX Improvements

### Before

- Plain text input: "e.g., Every Saturday at 6 PM"
- User had to know format
- No validation
- Error-prone

### After

- Visual selection interface
- Clear options with labels
- Real-time preview of recurrence pattern
- Automatic RRULE generation
- Validation built-in (min values, required fields)

## Translation Support

Added 30+ translation keys for Ukrainian locale:

- Day names (Mon-Sun)
- Frequency options (Daily, Weekly, Monthly, Yearly)
- End conditions (Never, After, On date)
- Pluralization for intervals and counts
- Human-readable descriptions

## Files Modified

1. **Created**:

   - `apps/web/src/components/ui/RecurrencePicker/RecurrencePicker.tsx`
   - `apps/web/src/components/ui/RecurrencePicker/index.ts`

2. **Modified**:
   - `apps/web/src/components/ui/index.ts` - Added RecurrencePicker export
   - `apps/web/src/features/UserDirectory/Events/Event/EventForm.tsx` - Replaced text input with RecurrencePicker
   - `apps/web/translations/uk.json` - Added 30+ translation keys

## Examples

### Daily Event

```
FREQ=DAILY;COUNT=30
→ "Repeats daily, 30 times"
```

### Weekly Event (Multiple Days)

```
FREQ=WEEKLY;BYDAY=MO,WE,FR
→ "Repeats weekly on Mon, Wed, Fri"
```

### Monthly Event with End Date

```
FREQ=MONTHLY;INTERVAL=2;UNTIL=20251231
→ "Repeats every 2 months, until 12/31/2025"
```

### Complex Weekly Pattern

```
FREQ=WEEKLY;INTERVAL=3;BYDAY=SA,SU;COUNT=8
→ "Repeats every 3 weeks on Sat, Sun, 8 times"
```

## Edge Cases Handled

1. **Empty/Null Value**: Initializes with default (Weekly, Never end)
2. **Invalid RRULE**: Falls back to defaults if parsing fails
3. **Minimum Values**: Enforces interval >= 1, count >= 1
4. **Date Validation**: Uses native date picker for proper date selection
5. **Optional Fields**: INTERVAL, BYDAY, COUNT, UNTIL only added when needed

## Future Enhancements

Potential improvements (not implemented):

- Support for BYMONTHDAY (monthly recurrence on specific day number)
- Support for BYSETPOS (first/last Monday of month, etc.)
- Visual calendar preview of occurrences
- Presets (e.g., "Every weekday", "First Monday of month")
- Validation of end date being after start date
- Maximum occurrence limit

## Testing Recommendations

1. **Unit Tests**:

   - RRULE parsing (valid and invalid formats)
   - RRULE building from state
   - State updates on user interaction
   - Translation key coverage

2. **Integration Tests**:

   - Form submission with recurrence rule
   - Edit existing recurring event
   - Switch between recurring and non-recurring
   - Clear recurrence when unchecking "is_recurring"

3. **E2E Tests**:
   - Create recurring event flow
   - Edit recurrence pattern
   - Verify RRULE saved to database

## Performance Considerations

- Uses `useCallback` for RRULE parser/builder to prevent recreation
- `useEffect` with dependency array to avoid infinite loops
- State updates are batched by React
- No external dependencies (pure React + built-in components)

## Accessibility

- All form inputs have proper labels
- Buttons have clear text (not just icons)
- Color is not the only indicator (also uses border/background)
- Keyboard navigation works for all controls
- Disabled state properly applied

## Browser Compatibility

- Uses standard HTML5 date input (good support)
- No custom date picker needed
- Fallback for browsers without native date picker (text input)
- All CSS uses standard properties
