

## Plan: Registration Form & Access Management Dialog

### Overview

Add a "Criar conta" link on the login screen leading to a registration form. Add a "Gerenciar acessos" option in the UserAvatarMenu (admin-only) that opens a dialog to approve pending registrations with department visibility and password assignment.

### Changes

**1. Registration form on Login page**

**File:** `src/pages/Login.tsx`
- Add state to toggle between login and register views
- Register form fields: Nome (text), Departamento (Select from `departments`), Email (email)
- On submit, store the request in a shared state (via AuthContext) and show success message: "Enviamos seu pedido, logo você receberá um retorno por email"
- Blue underlined "Ainda não é usuário? Criar conta" link below the login card; register view has "Já tem conta? Entrar" to go back

**2. Pending registrations state in AuthContext**

**File:** `src/context/AuthContext.tsx`
- Add `PendingRegistration` interface: `{ id, name, email, departmentId, createdAt }`
- Add state `pendingRegistrations` and expose `addRegistration(name, email, departmentId)` and `approveRegistration(id, visibleDepartments, password)` functions
- `approveRegistration` creates a new mock credential + user entry, removes from pending list
- Structure left ready for future email integration (comment placeholders)

**3. "Gerenciar acessos" in UserAvatarMenu**

**File:** `src/components/UserAvatarMenu.tsx`
- Add a "Gerenciar acessos" button (with `Users` icon) above the "Modo escuro" toggle, visible only when `permissions.role === 'admin'`
- Clicking opens a Dialog

**4. Access Management Dialog**

**File:** `src/components/ManageAccessDialog.tsx` (new)
- Lists pending registrations
- Each entry shows: name, email, department
- Checkboxes for which departments the new user will see (pre-check their own department)
- Password field pre-filled with `123newuser`
- "Aprovar Acesso" button calls `approveRegistration()` and shows success toast
- Empty state: "Nenhuma solicitação pendente"

### Files Changed

| File | Change |
|------|--------|
| `src/context/AuthContext.tsx` | Add pending registrations state, `addRegistration`, `approveRegistration` |
| `src/pages/Login.tsx` | Add register form toggle with Nome, Departamento, Email fields |
| `src/components/UserAvatarMenu.tsx` | Add admin-only "Gerenciar acessos" button opening the dialog |
| `src/components/ManageAccessDialog.tsx` | New dialog for reviewing and approving pending registrations |

