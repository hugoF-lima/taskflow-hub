

## Plan: Track Task Creator, Department Visibility & Permission Scheme

### Overview

Three interconnected features:
1. Track who created each task and display it on cards and detail dialogs
2. Add a permission/visibility scheme per user at login (which departments they can see)
3. Enforce action permissions: users can only edit/resolve tasks they own (created or assigned to)

### 1. Add `createdBy` to Task type and mock data

**File:** `src/types/index.ts`
- Add `createdBy: string` (user ID) to the `Task` interface

**File:** `src/data/mockData.ts`
- Update `makeTask` to accept a `creatorId` parameter (default to the assignee for existing mocks)
- Set `createdBy` on each generated task

### 2. Add user credentials and permission config to AuthContext

**File:** `src/types/index.ts`
- Add `UserPermissions` interface: `{ visibleDepartments: string[] | 'all'; role: 'admin' | 'user' }`

**File:** `src/context/AuthContext.tsx`
- Define a mock credentials map supporting multiple users (e.g., Carlos = admin/all departments, Bruno = user/informatica only)
- Expand `login()` to match against this map
- Expose `permissions: UserPermissions` and a helper `canActOnTask(task: Task): boolean` on the context
  - `canActOnTask`: returns true if user is admin, OR if user is in `task.assigneeIds`, OR if user is `task.createdBy`
- Add a second mock login: `bruno@empresa.com` / `info123` → user `u3` (Bruno Santos, Informática department, visibleDepartments: `['informatica']`)

**File:** `src/pages/Login.tsx`
- Add a second credential hint below the existing one

### 3. Filter tasks by visible departments

**File:** `src/context/AppContext.tsx`
- Import `useAuth` and read `permissions.visibleDepartments`
- In `filteredTasks`, if `visibleDepartments !== 'all'`, pre-filter tasks to only those where at least one assignee belongs to a visible department
- This ensures non-admin users only see tasks from their allowed departments

### 4. Display creator on TaskCard

**File:** `src/components/TaskCard.tsx`
- In the feedback row (next to `task.code`), show the creator's first name: `"GAP-0001 · por Carlos"`
- Look up `users.find(u => u.id === task.createdBy)`

### 5. Display creator in TaskDetailDialog

**File:** `src/components/TaskDetailDialog.tsx`
- Add a "Criado por" field in the detail info grid (alongside Urgência, Processo, etc.)
- Show creator's full name

### 6. Enforce action permissions in TaskDetailDialog

**File:** `src/components/TaskDetailDialog.tsx`
- Import `useAuth` and call `canActOnTask(task)`
- Conditionally show/hide "Editar", "Resolver Tarefa", and "Excluir" menu items based on `canActOnTask`
- Star toggling (importance) remains available to everyone
- Feedback submission remains available to everyone

### 7. Set `createdBy` when creating new tasks

**File:** `src/components/NewTaskDialog.tsx`
- Import `useAuth`, get `currentUser.id`
- Pass `createdBy: currentUser.id` when calling `addTask()`

**File:** `src/context/AppContext.tsx`
- Update `addTask` signature to include `createdBy` in the task data (it already spreads `...taskData`, so no logic change needed)

### Files Changed

| File | Change |
|------|--------|
| `src/types/index.ts` | Add `createdBy` to `Task`, add `UserPermissions` interface |
| `src/data/mockData.ts` | Set `createdBy` on mock tasks |
| `src/context/AuthContext.tsx` | Multi-user login, permissions, `canActOnTask` helper |
| `src/context/AppContext.tsx` | Filter by visible departments |
| `src/components/TaskCard.tsx` | Show creator next to task code |
| `src/components/TaskDetailDialog.tsx` | "Criado por" field, permission-gated menu items |
| `src/components/NewTaskDialog.tsx` | Set `createdBy` from logged user |
| `src/pages/Login.tsx` | Add second credential hint |

