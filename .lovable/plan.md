## Plan: Reorganize Sidebar with Department Groups, Logged User Highlight & Filter Sync

### Overview

Restructure the sidebar to group users under collapsible department headers. The logged-in user appears at the top with the label "Você" and visual distinction. Clicking a department header syncs with the FilterBar's department filter.

### 1. Logged User Section at Top

**File:** `src/components/AppSidebar.tsx`

- Import `useAuth` from `AuthContext` to get `currentUser`
- Before the department groups, render a dedicated section showing the logged user:
  - Avatar with a subtle highlight ring/background (e.g., `ring-2 ring-primary/40` or a brighter background)
  - Name replaced with **"Você"**, department shown as subtitle
  - Same click/double-click behavior as other user items
- Immediately after "Você", show the logged user's department group with their teammates (excluding the logged user to avoid duplication)

### 2. Collapsible Department Groups

**File:** `src/components/AppSidebar.tsx`

- Import `Collapsible`, `CollapsibleTrigger`, `CollapsibleContent` from `@/components/ui/collapsible`
- Import `ChevronDown` icon
- Group `users` by `departmentId`, iterating over `departments`
- Each department renders as a `Collapsible` (default open):
  - **Header/Trigger**: department name + colored dot + chevron icon, clickable to collapse/expand
  - **Content**: list of users in that department (same user item rendering as current)
- The logged user's department appears first (right after "Você"), remaining departments follow in their natural order
- Skip the logged user from their department group (already shown at top)

### 3. Department Header Click → Filter Sync

**File:** `src/components/AppSidebar.tsx`

- When clicking a department header, call `setFilter('departmentId', deptId)` from `useAppContext()`
- If clicking the already-active department filter, toggle it off: `setFilter('departmentId', null)`
- Visually indicate the active department header (e.g., bolder text, accent background) when `filters.departmentId === dept.id`
- This keeps it in sync with the FilterBar's "Todos os setores" dropdown — both read/write the same `filters.departmentId` state

### 4. Layout Preservation

- Keep the "Equipe" header with "Mostrar todos" inline button
- The `SidebarTrigger` and collapsed icon mode continue to work
- User items retain their existing click (highlight) / double-click (isolate) behavior

### Files Changed


| File                            | Change                                                                            |
| ------------------------------- | --------------------------------------------------------------------------------- |
| `src/components/AppSidebar.tsx` | Add "Você" section, collapsible department groups, department click → filter sync |
