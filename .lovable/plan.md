

## Plan: Department Visibility in Sidebar, Star Permission & Dashboard Access

### Overview

Hide departments the logged user cannot see from both the sidebar and the FilterBar department dropdown. Restrict the Star (importance) toggle on cards to users who can act on the task. Keep Dashboard enabled for both users, and keep Feedback free for everyone.

### Changes

**1. Sidebar: filter departments by permission**

**File:** `src/components/AppSidebar.tsx`
- Import `useAuth` and read `permissions.visibleDepartments`
- Filter `sortedDepts` to only include departments the user can see (if not `'all'`)
- The logged user's own department is always included (already guaranteed by the permission config)

**2. FilterBar: filter department dropdown by permission**

**File:** `src/components/FilterBar.tsx`
- Import `useAuth` and read `permissions.visibleDepartments`
- Filter the `departments` list in the "Todos os setores" `<Select>` to only show visible departments

**3. Star toggle: respect `canActOnTask`**

**File:** `src/components/TaskCard.tsx`
- Import `useAuth` and call `canActOnTask(task)`
- Only allow clicking the Star button if `canActOnTask` returns true; otherwise render it as a non-interactive visual indicator

**4. Check button on card: same permission gate**

**File:** `src/components/TaskCard.tsx`
- The complete (check) button should also respect `canActOnTask` — hide or disable it for users who cannot act on the task

**5. Dashboard: keep enabled for both users**

No change needed — both users already have the Dashboard button enabled.

### Files Changed

| File | Change |
|------|--------|
| `src/components/AppSidebar.tsx` | Filter department groups by `visibleDepartments` |
| `src/components/FilterBar.tsx` | Filter department dropdown by `visibleDepartments` |
| `src/components/TaskCard.tsx` | Gate Star and Check buttons behind `canActOnTask` |

