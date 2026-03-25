

## Plan: Fix Sidebar Double-Click Index Bug & "Mostrar todos" Layout Shift

### 1. Fix Double-Click Selecting Wrong User

The double-click fires two click events first (selecting/highlighting a user via `handleUserClick`), which can change `selectedUserId` before `handleUserDoubleClick` runs. The single-click handler toggles highlight mode — so by the time the double-click fires, the state may have shifted.

**Fix:** Use a click delay pattern. On `onClick`, set a short timeout (~250ms). If a double-click arrives within that window, cancel the timeout and only run `handleUserDoubleClick`. This prevents `handleUserClick` from interfering.

**File:** `src/components/AppSidebar.tsx`
- Import `useRef, useCallback` from React
- Add a `clickTimerRef = useRef<NodeJS.Timeout | null>(null)`
- On `onClick`: clear any existing timer, set a new 250ms timeout that calls `handleUserClick(user.id)`
- On `onDoubleClick`: clear the timer, call `handleUserDoubleClick(user.id)`

### 2. Fix "Mostrar todos" Causing Layout Shift

Currently the "Mostrar todos" button is a separate block element inside `SidebarHeader` that pushes content down when it appears.

**Fix:** Place "Mostrar todos" inline next to the "Equipe" label in the same flex row, using `ml-auto` to push it to the right. It only renders when `sidebarMode !== 'none'`.

**File:** `src/components/AppSidebar.tsx`
- Move the `Button` inside the same `<div>` that contains the `Users` icon and "Equipe" label
- Add `ml-auto` to the button so it aligns right
- Remove the separate conditional block below

### Files Changed

| File | Change |
|------|--------|
| `src/components/AppSidebar.tsx` | Click/double-click disambiguation + inline "Mostrar todos" |

