

## Plan: Fix Responsáveis Scroll, 24h Time, and Button Dropdown

### 1. Fix Responsáveis Popover Scrolling

**File:** `src/components/NewTaskDialog.tsx`

Replace `<ScrollArea className="h-60">` with a plain `<div>` using `overflow-y-auto max-h-60`. Radix `ScrollArea` inside Radix `Popover` has a known conflict where the viewport intercepts wheel events. A native scrollable div resolves this.

### 2. Ensure 24h Time Format

**File:** `src/components/NewTaskDialog.tsx`

The native `<input type="time">` renders in 12h or 24h depending on browser locale. To force 24h, add the `lang="pt-BR"` attribute to the time input element — this hints the browser to use 24h format regardless of system locale.

### 3. Rework "Criar Atividade" Button as Split-Button with Dropdown

**File:** `src/components/NewTaskDialog.tsx`

Replace the current dual-button approach with a proper split-button using `DropdownMenu`:

- Main button shows `"Criar Atividade"` by default, or `"Criar Atividade + Nova"` when mode is active
- A small dropdown arrow button sits adjacent (right side), containing one option: `"+ Nova"`
- Clicking `"+ Nova"` from the dropdown toggles `createAndNewMode` to `true`, changing the main button label to `"Criar Atividade + Nova"`
- Clicking the main button when in `createAndNewMode`: creates the task, resets the form, sets `createAndNewMode` back to `false`, keeps dialog open
- Clicking the main button when NOT in `createAndNewMode`: creates the task, closes the dialog

Import `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem` and `ChevronDown` icon.

### Files Changed

| File | Change |
|------|--------|
| `src/components/NewTaskDialog.tsx` | All three fixes |

