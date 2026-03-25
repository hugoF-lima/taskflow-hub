

## Plan: Three Changes

### 1. "Nova Atividade" Dropdown + Task Creation Dialog

**Header.tsx**: Replace the single "Nova Atividade" button with a `DropdownMenu` containing two items: "Nova Atividade" and "Novo Processo". Both open the same dialog for now.

**New file `src/components/NewTaskDialog.tsx`**: A Dialog with fields matching the screenshot reference:
- **Codigo** — auto-generated, read-only
- **Responsável** — Select dropdown populated from `users` list (showing "NAME (DEPARTMENT)")
- **Data** — Date picker for deadline
- **Assunto** — Text input for task title
- **Urgência/Prioridade** — Select with color-coded urgency levels (Normal, Média, Crítica, Crítica 24h, Reportar)
- **Processo** — Select from existing process list
- **Descrição/Observações** — Textarea
- **Importante** — Checkbox toggle

On submit, calls a new `addTask` function added to `AppContext`.

**AppContext.tsx**: Add `addTask(task: Omit<Task, 'id' | 'code' | 'createdAt' | 'feedback'>)` that generates an id/code and appends to the tasks array.

### 2. Separate Tooltips on TaskCard

**TaskCard.tsx** — Restructure hover behavior:
- **Title hover** → Tooltip (or HoverCard) showing `task.observations` / description. If empty, show "Sem descrição". Remove the current whole-card HoverCard wrapper.
- **MessageSquare icon hover** → Wrap the feedback button in its own `Tooltip` or `HoverCard` showing latest feedback summary (the content currently on the whole card hover).

This means the card itself no longer has a wrapping HoverCard. Instead, two separate inline tooltips on specific elements.

### 3. Fix CardView Scroll Behavior

**Problem**: The current wheel handler immediately redirects to horizontal scroll when a column hits its scroll boundary, causing erratic jumping.

**Solution in `CardView.tsx`**: Introduce a "mouse dwell" approach:
- Track which column the mouse is currently hovering over using `mouseenter`/`mouseleave` on each column's scroll container.
- Only allow vertical scrolling within a column after the mouse has dwelled inside it for ~150ms (use a ref timer).
- When mouse is NOT dwelling in any column (or hasn't been long enough), all wheel events go to horizontal scroll on the outer container.
- When dwelling IS active and the column has vertical scroll room, let vertical scroll happen naturally. Only redirect to horizontal when the column is at its scroll boundary AND a short debounce timer (e.g. 100ms of no further scroll) passes — preventing the immediate "bounce" to horizontal.

### Files Modified
- `src/components/Header.tsx` — Dropdown menu replacing single button
- `src/components/NewTaskDialog.tsx` — New file, creation form dialog
- `src/context/AppContext.tsx` — Add `addTask` to context
- `src/components/TaskCard.tsx` — Split tooltips (title → description, icon → feedback)
- `src/components/views/CardView.tsx` — Rewrite scroll logic with dwell timer

