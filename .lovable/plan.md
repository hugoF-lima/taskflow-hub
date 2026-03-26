

## Plan: Migrate App from Mock Data to Supabase Backend with Real Auth

### Overview

Replace the in-memory mock data system with real Supabase Auth and database queries. This involves: implementing Supabase Auth (email/password), creating a profile trigger for auto-creation, building data hooks to fetch from Supabase, and updating all 12 components that currently import from `mockData.ts`.

### Database Changes (Migration)

1. **Add INSERT policy on `profiles`** so the trigger can create profiles on signup
2. **Add INSERT/UPDATE policies on `user_roles` and `user_department_visibility`** for admin management
3. **Create trigger** on `auth.users` to auto-create a `profiles` row on signup
4. **Fix the tasks UPDATE RLS policy** — current policy has a bug: `task_assignees.task_id = task_assignees.id` should be `task_assignees.task_id = tasks.id`

### Code Changes

**Phase 1: Auth Layer**

| File | Change |
|------|--------|
| `src/context/AuthContext.tsx` | Replace mock credentials with Supabase Auth (`signInWithPassword`, `signUp`, `signOut`, `onAuthStateChange`). Fetch profile, role, and visible departments from DB. Keep `canActOnTask` logic. |
| `src/pages/Login.tsx` | Call `supabase.auth.signInWithPassword` and `supabase.auth.signUp`. Registration now creates a real auth user + pending_registration row. |
| `src/App.tsx` | Use `onAuthStateChange` listener to gate auth. Set up listener before `getSession()`. |

**Phase 2: Data Hooks**

| File | Change |
|------|--------|
| `src/hooks/useSupabaseData.ts` (new) | Custom hook that fetches departments, profiles, tasks (with assignees and feedback) from Supabase. Exposes `departments`, `users`, `tasks`, `allProcesses`. Includes mutation functions (`addTask`, `updateTask`, `deleteTask`, `toggleCompletion`, `toggleImportance`, `addFeedback`). |
| `src/context/AppContext.tsx` | Replace `initialTasks` and `users` imports with data from `useSupabaseData`. Remove direct state for tasks; delegate mutations to the hook. |

**Phase 3: Update All Components (12 files)**

Every file that imports from `@/data/mockData` will be updated to get data from context or the hook instead:

- `AppSidebar.tsx` — get `users`, `departments` from context
- `TaskCard.tsx` — get `users`, `departments`, `urgencyConfig` from context
- `TaskDetailDialog.tsx` — same
- `NewTaskDialog.tsx` — same
- `FilterBar.tsx` — get `departments`, `allProcesses` from context
- `ManageAccessDialog.tsx` — get `departments` from context; call Supabase for pending registrations and approval
- `UserAvatarMenu.tsx` — get `departments` from context
- `Login.tsx` — fetch departments from Supabase (no auth needed for department list)
- `CardView.tsx` — get from context
- `ListView.tsx` — get from context
- `FeedbackModal.tsx` — already uses context for `addFeedback`

`urgencyConfig` is UI-only config (labels/colors) — keep it as a local constant (move to a shared utils file or keep in mockData as a config-only export).

**Phase 4: ManageAccessDialog — Real Admin Workflow**

- Fetch `pending_registrations` from Supabase
- On approve: call an edge function that creates the auth user (using service role), inserts profile, role, and department visibility rows, then updates the pending_registration status
- List existing users from `profiles` + `user_roles` tables

### Edge Function: `approve-registration`

Needed because creating auth users requires the service role key (cannot be done client-side):
- Receives: `registrationId`, `visibleDepartments[]`, `password`
- Uses `SUPABASE_SERVICE_ROLE_KEY` to call `auth.admin.createUser`
- Inserts into `profiles`, `user_roles`, `user_department_visibility`
- Updates `pending_registrations.status = 'approved'`

### Security Fixes

1. **Tasks UPDATE policy bug**: `task_assignees.task_id = task_assignees.id` → `task_assignees.task_id = tasks.id`
2. **Add missing INSERT policy on `user_department_visibility`** for admin operations
3. **Add missing INSERT policy on `user_roles`** for admin operations
4. **Profiles INSERT policy**: Allow via trigger (service role) or add `WITH CHECK (id = auth.uid())`

### Files Changed Summary

| File | Change |
|------|--------|
| Supabase migration | Fix tasks UPDATE policy, add INSERT policies, create auth trigger |
| `supabase/functions/approve-registration/` | New edge function for admin user creation |
| `src/context/AuthContext.tsx` | Full rewrite: Supabase Auth |
| `src/context/AppContext.tsx` | Use Supabase data instead of mock imports |
| `src/hooks/useSupabaseData.ts` | New: fetch all data from Supabase |
| `src/pages/Login.tsx` | Use Supabase Auth calls |
| `src/App.tsx` | Auth state listener |
| `src/components/AppSidebar.tsx` | Get data from context |
| `src/components/TaskCard.tsx` | Get data from context |
| `src/components/TaskDetailDialog.tsx` | Get data from context |
| `src/components/NewTaskDialog.tsx` | Get data from context |
| `src/components/FilterBar.tsx` | Get data from context |
| `src/components/ManageAccessDialog.tsx` | Supabase queries + edge function call |
| `src/components/UserAvatarMenu.tsx` | Get data from context |
| `src/components/views/CardView.tsx` | Get data from context |
| `src/components/views/ListView.tsx` | Get data from context |
| `src/data/mockData.ts` | Keep only `urgencyConfig` constant; remove everything else |

### Notes

- The 12 seed profiles use deterministic UUIDs not linked to auth.users. After migration, real auth users will be created fresh. The seed data serves as a reference but real usage starts with admin creating accounts via the approval flow.
- `onAuthStateChange` listener is set up BEFORE `getSession()` per Supabase best practices.
- Email confirmation can be disabled initially in Supabase Auth settings for easier testing.

