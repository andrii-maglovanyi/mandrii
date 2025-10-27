# Venue Cards Refactoring

## Date: 2025-10-26

## Overview

Aligned `BottomCard` and `ListCard` components with the design patterns established in `VenueCardBase` to reduce duplication, improve consistency, and enhance user experience. Created reusable components for shared functionality across all venue card types.

## Changes Made

### 1. Created `VenueCardFooter` Component

**File**: `apps/web/src/features/Venues/VenueCard/VenueCardFooter.tsx`

- **Purpose**: Reusable footer for all venue cards
- **Features**:
  - Shows venue status (e.g., "Pending" with clock icon)
  - "Discover" call-to-action with arrow
  - Supports interactive mode (with hover effects) and static mode
- **Modes**:
  - `interactive={true}`: Opacity transition on group hover (for ListCard)
  - `interactive={false}`: Always visible (for BottomCard)

### 2. Created `VenueQuickInfo` Component _(Optional - Not Currently Used)_

**File**: `apps/web/src/features/Venues/VenueCard/VenueQuickInfo.tsx`

- **Purpose**: Context-aware venue contact information display (available for future use)
- **Variants**:
  - `map`: Shows address and phone
  - `list`: Shows all available information
  - `grid`: Shows website and email
- **Note**: Currently not used in BottomCard or ListCard to maintain consistency with VenueCardBase design (which doesn't show contact details in cards)

### 3. Updated `BottomCard` Component

**File**: `apps/web/src/features/Venues/VenueCard/BottomCard.tsx`

**Added Features**:

- ✅ Category indicator with icon (matching `VenueCardBase`)
- ✅ Verified venue badge (green checkmark for owned venues)
- ✅ Ownership claim button (Crown icon)
- ✅ Edit venue button for owners (PenTool icon)
- ✅ Improved action button layout - all on one line
- ✅ Success notification when sharing venue
- ✅ Consistent locale-based description handling
- ✅ Accessibility improvements (aria-labels)
- ✅ **VenueCardFooter** (static mode for mobile)
- ✅ **Title styling matching VenueCardBase** (font-bold, text-primary, line-clamp-2)
- ✅ **Action buttons always visible** (mobile-first approach)

**Design Alignment**:

- Used same icon colors and hover states as `VenueCardBase`
- Crown icon: amber color scheme with fill on hover
- Share icon: ghost variant button
- Verified badge: green with surface-tint stroke
- **No contact details shown** (matches VenueCardBase pattern)

**Behavior**:

- Remains mobile-only (`md:hidden`)
- Expandable from 33vh to full height minus header
- Smooth transitions and animations
- Auto-scroll to top when expanded

### 4. Updated `ListCard` Component

**File**: `apps/web/src/features/Venues/VenueCard/ListCard.tsx`

**Added Features**:

- ✅ Category indicator with icon (matching `VenueCardBase`)
- ✅ Verified venue badge (green checkmark for owned venues)
- ✅ Ownership claim button (Crown icon)
- ✅ Edit venue button for owners (PenTool icon)
- ✅ Improved action button layout with proper spacing
- ✅ Success notification when sharing venue
- ✅ Consistent locale-based description handling
- ✅ **VenueCardFooter** (interactive mode with hover effects)
- ✅ **Title styling matching VenueCardBase** (font-bold, text-primary, line-clamp-2, underline on hover)
- ✅ **Border and shadow effects** matching VenueCardBase (`border-primary/0`, `hover:border-primary/20`, `hover:shadow-lg`)
- ✅ **Proper padding** (p-5 matching VenueCardBase contentClasses)
- ✅ **Action buttons hidden on desktop, shown on hover** (matches VenueCardBase behavior)
- ✅ **Action buttons always visible on mobile** (md:flex for touch devices)
- ✅ **Description line-clamp-3** (prevents overflow)
- ✅ **No contact details shown** (matches VenueCardBase pattern)

**Design Alignment**:

- Used same rounded corners (`rounded-xl`)
- Background: `bg-surface-tint/50` (matching VenueCardBase)
- Border: starts transparent `border-primary/0`, shows on hover `hover:border-primary/20`
- Shadow: appears on hover `hover:shadow-lg`
- Transition: `transition-all duration-300` for smooth effects
- Crown icon: amber-600/400 color scheme with fill on hover
- Share icon: ghost variant button, hidden until hover on desktop
- Verified badge: green-600/400 with surface-tint stroke
- Category indicator with proper height (`h-8`)

**Behavior**:

- Desktop list view with selection state
- Clickable card with keyboard navigation
- Hover state reveals action buttons and enhances border/shadow
- Visual indicator for selected venue (border-primary/20 shadow-lg)
- "Discover" footer fades in on hover
- Action buttons visible on mobile for touch interaction

## Design Decisions

### Consistency with VenueCardBase

Both `ListCard` and `BottomCard` now match VenueCardBase's design philosophy:

- **No contact details in cards** - keeps cards clean and focused on venue name/description
- **Footer with "Discover" CTA** - consistent call-to-action across all card types
- **Hidden action buttons on desktop** - revealed on hover for cleaner design
- **Visible action buttons on mobile** - always accessible for touch devices

### Reusable Footer Component

**VenueCardFooter** provides consistent "Discover" CTA across all cards:

- **Interactive Mode**: Fades in on hover for grid/list cards
- **Static Mode**: Always visible for mobile/bottom cards
- Shows status information (e.g., "Pending") when applicable

### Consistent Action Buttons

All venue cards now use the same action button patterns:

1. **Share Button**: Ghost variant, Share2 icon, hidden until hover (desktop)
2. **Ownership Claim**: Crown icon in amber, fills on hover, hidden until hover (desktop)
3. **Edit Button** (for owners): PenTool icon, ghost variant, hidden until hover (desktop)
4. **Verified Badge**: BadgeCheck icon in green, always visible
5. **Mobile Override**: Action buttons always visible on mobile (`md:flex`)

### Visual Hierarchy

**BottomCard (Mobile)**:

```
[Collapse/Expand Button]
[Category Icon + Label] ────────────────── [Verified Badge]
[Venue Name] ──────────────────────────── [Edit/Claim] [Share]
[Description]
[Footer: Status | Discover →]
```

**ListCard (Desktop - Default)**:

```
[Category Icon + Label] ────────────────── [Verified Badge]
[Venue Name]
[Description (3 lines max)]
[Footer: Status | Discover → (hidden)]
```

**ListCard (Desktop - On Hover)**:

```
[Category Icon + Label] ──── [Edit/Claim] [Share] [Verified Badge]
[Venue Name (underlined)]
[Description (3 lines max)]
[Footer: Status | Discover →]
+ Border (primary/20)
+ Shadow (shadow-lg)
```

### Color Scheme Alignment

- **Primary Actions**: Default on-surface color
- **Ownership Claim**: Amber (amber-600 dark / amber-400 light)
- **Verified Badge**: Green (green-600 dark / green-400 light)
- **Hover States**: Fill transitions for interactive feedback
- **Border**: Transparent to primary/20 on hover
- **Shadow**: None to shadow-lg on hover

### Accessibility

- All action buttons have proper `aria-label` attributes
- Keyboard navigation support in ListCard
- Tooltips for verified badge
- Clear visual feedback for interactive elements
- Touch-friendly on mobile (always visible action buttons)

## Benefits

### Code Quality

- ✅ Reduced code duplication significantly
- ✅ Shared components for common functionality (VenueCardFooter)
- ✅ Consistent patterns across all venue cards
- ✅ Better type safety with TypeScript
- ✅ Single source of truth for footer display

### User Experience

- ✅ Consistent visual language across mobile and desktop
- ✅ Better information hierarchy - focused on venue name/description
- ✅ More discoverable actions (ownership claim, share) on hover
- ✅ Visual indicators for verified venues
- ✅ Improved feedback (notifications, tooltips)
- ✅ Clear "Discover" call-to-action matching grid cards
- ✅ **Cleaner desktop design** - action buttons hidden until needed
- ✅ **Touch-optimized mobile** - action buttons always accessible
- ✅ **Smooth transitions** - border, shadow, and opacity changes

### Maintainability

- ✅ Reusable `VenueCardFooter` component with interaction modes
- ✅ Aligned with existing `VenueCardBase` patterns
- ✅ Easier to update styling consistently
- ✅ Clear separation of concerns
- ✅ Future-ready with `VenueQuickInfo` available if needed

## Files Changed

1. `apps/web/src/features/Venues/VenueCard/BottomCard.tsx` - Updated
2. `apps/web/src/features/Venues/VenueCard/ListCard.tsx` - Updated
3. `apps/web/src/features/Venues/VenueCard/VenueCardFooter.tsx` - Created
4. `apps/web/src/features/Venues/VenueCard/VenueQuickInfo.tsx` - Created (available for future use)
5. ~~`apps/web/src/features/Venues/VenueCard/VenueMetadata.tsx`~~ - Deprecated (can be removed)

## Dependencies

- Uses existing components: `ActionButton`, `Tooltip`, `RichText`
- Uses existing hooks: `useI18n`, `useDialog`, `useNotifications`, `useUser`
- Uses existing utilities: `getIcon`, `sendToMixpanel`
- Uses existing constants: `constants.categories`
- Uses existing types: `Venue_Status_Enum`

## Testing Recommendations

1. **Mobile Testing** (`BottomCard`):

   - Test expand/collapse functionality
   - Verify action buttons are always visible on mobile
   - Test sharing and ownership claim flows
   - Check verified badge display
   - Verify "Discover" footer is always visible
   - Check that all elements are on proper lines (no wrapping issues)

2. **Desktop Testing** (`ListCard`):

   - Test click and keyboard selection
   - Verify action buttons are hidden by default
   - Verify action buttons appear on hover
   - Test sharing and ownership claim flows
   - Check verified badge is always visible
   - Verify "Discover" footer appears on hover
   - Check border appears on hover (primary/20)
   - Check shadow appears on hover (shadow-lg)
   - Verify selected state shows border and shadow
   - Check description is limited to 3 lines

3. **Responsive Testing**:

   - Verify BottomCard only shows on mobile
   - Verify ListCard works on all desktop sizes
   - Test transitions between breakpoints
   - Verify action buttons switch from hidden to visible at mobile breakpoint

4. **Data Testing**:

   - Test with venues that have all metadata
   - Test with venues missing metadata
   - Test with owned vs non-owned venues
   - Test with verified vs unverified venues
   - Test with venues in "Pending" status
   - Test with long venue names (line-clamp-2)
   - Test with long descriptions (line-clamp-3)

5. **Interaction Testing**:
   - Test hover states on ListCard (footer, title, action buttons, border, shadow)
   - Test click/tap on action buttons
   - Test tooltip displays
   - Test keyboard navigation (Enter/Space to select)

## Future Improvements

1. ✅ ~~Consider creating a shared footer component~~ - **DONE** (`VenueCardFooter`)
2. ✅ ~~Match VenueCardBase styling~~ - **DONE** (borders, shadows, padding, button visibility)
3. **Consider using VenueQuickInfo** if contact details are needed in the future
4. Add unit tests for the new `VenueCardFooter` component
5. Consider adding E2E tests for the ownership claim flow
6. Consider making `VenueMetadata` officially deprecated or removing it if unused
7. Evaluate if any cards need to show contact details (could use VenueQuickInfo then)
