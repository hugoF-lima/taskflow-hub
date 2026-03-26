## Plan: Add "Resolver Tarefa" Option to Task Detail Dialog

### Overview

Add a "Resolver Tarefa" menu item to the three-dots dropdown in `TaskDetailDialog`. Clicking it opens a confirmation dialog with optional feedback form. Confirming marks the task as completed.

### Changes

**File:** `src/components/TaskDetailDialog.tsx`

1. **New state:** `confirmResolve: boolean` (similar to `confirmDelete`)
2. **New menu item:** Add "Resolver Tarefa" between "Editar" and "Excluir" in the `DropdownMenu`, with a `CheckCircle` icon. Only shown when `!task.completed`.
3. **Resolve confirmation dialog:** A new `AlertDialog` (similar to the delete one) with:
  - Title: "Deseja finalizar chamado?"
  - Embedded feedback form (topic, type, comment, anonymous toggle) — same fields as the existing "Adicionar Feedback" section (ensure same visual formatting).
  - Two buttons: **Sim** (submits optional feedback if filled + marks task complete) and **Não** (cancels)
4. **Handle resolve:** `handleResolve` function that:
  - If feedback fields are filled, calls `addFeedback()`
  - Calls `toggleTaskCompletion(taskId)`
  - Closes the resolve dialog
  - Shows a success toast

### Files Changed


| File                                  | Change                                                                   |
| ------------------------------------- | ------------------------------------------------------------------------ |
| `src/components/TaskDetailDialog.tsx` | Add `confirmResolve` state, menu item, resolve dialog with feedback form |
