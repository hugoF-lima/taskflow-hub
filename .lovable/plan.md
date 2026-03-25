## Plan: Polish TaskDetailDialog

### Issues Identified

1. Edit/Delete icons too close to the X close button — collapse them into an arrow button so the user may choose whether to delete or edit the task.
2. No visual separation between sections (task details, feedback history, add feedback)
3. Feedback items are flat/unstyled — reference shows card-like items with left border accent and better spacing
4. "Adicionar Feedback" section title should be styled as a clickable-looking heading (bolder, colored)
5. Overall layout needs better padding, section dividers, and visual hierarchy

### Changes to `src/components/TaskDetailDialog.tsx`

**Header area:**

- Add `mr-8` to the action buttons container so edit/delete icons sit well away from the dialog's built-in close button

**Task details section (view mode):**

- Wrap in a light background card (`bg-muted/30 rounded-lg p-3`) for visual grouping

**Feedback history section:**

- Add a proper `Separator` with spacing before the section
- Style "Feedback (N)" as a bolder heading with the `MessageSquare` icon
- Style each feedback item with a left border accent (`border-l-2 border-primary/30`), slightly more padding, and a subtle background — matching the reference screenshot's card-like look with warm background

**"Adicionar Feedback" section:**

- Use a styled heading (text-sm font-semibold text-primary) matching the reference's blue "Adicionar Feedback" text
- Add a clear `Separator` above it
- Ensure form is fully visible by adjusting `ScrollArea` and giving `pb-6` at the bottom of scroll content

**General:**

- Increase dialog max-width slightly for breathing room
- Ensure `ScrollArea` fills properly so the feedback form is never cut off

### Single file modified

- `src/components/TaskDetailDialog.tsx`