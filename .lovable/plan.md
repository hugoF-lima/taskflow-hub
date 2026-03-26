

## Plan: Add "Acessos existentes" Section to ManageAccessDialog

### Overview

Add a section below the pending registrations in the ManageAccessDialog that lists all registered users with their email, department, and role info.

### Changes

**File:** `src/context/AuthContext.tsx`
- Expose `allUsers` and `credentials` (emails only, via a derived list) on the context so the dialog can display registered users
- Add a `registeredUsers` getter that returns `{ user, email, departmentId, role }[]` by joining `allUsers` with `credentials`

**File:** `src/components/ManageAccessDialog.tsx`
- After the pending registrations section, add a `<Separator />` and an "Acessos existentes" heading
- List each registered user in a compact card showing: name, email, department name, and role badge (admin/user)
- Use `Users` icon for the section header

### Files Changed

| File | Change |
|------|--------|
| `src/context/AuthContext.tsx` | Expose `registeredUsers` derived list on context |
| `src/components/ManageAccessDialog.tsx` | Add "Acessos existentes" section listing all users |

