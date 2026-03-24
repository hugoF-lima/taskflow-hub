

## Updated Plan — Unified Productivity Dashboard

### Changes from Previous Plan

1. **Remove user combobox filter** — No dedicated dropdown for filtering users anywhere. The sidebar IS the user filter.

2. **Sidebar interaction logic updated:**
   - Single click on user → highlights/scrolls to their column in Card View (in List/Eisenhower, highlights their rows)
   - Double click on user → isolates view to only that user's tasks
   - Double click again or click "Show All" button → resets to all users

3. **Filter bar additions:**
   - Add **Task Status** filter: Active / Completed / Overdue (derived from deadline vs current date and completion flag)

4. **User avatars updated:**
   - Circular avatar component with image support + initials fallback (first+last name initials)
   - Thin colored accent border on bottom of avatar circle indicating department color

5. **Dashboard metrics are read-only aggregations:**
   - All charts/heatmaps computed from task feedback data at render time
   - No manual data entry fields in the manager dashboard
   - Metrics recalculate when filters change

6. **Task card hover tooltip:**
   - On hover, show a tooltip with: last feedback date, topic, type, and comment preview (truncated)
   - If no feedback exists, show "Sem feedback ainda"

7. **Feedback-required toggle:**
   - Global settings toggle: "Exigir feedback antes de concluir tarefa"
   - When enabled, the "Complete Task" action checks if at least one feedback entry exists; if not, shows a warning modal prompting the user to add feedback first
   - Toggle stored in app state (mock), visible in a small settings popover in the header

### Technical Approach

**Files to create/modify:**

- `src/data/mockData.ts` — 12 users, 6 departments, ~40 tasks, ~25 feedback entries, department color map
- `src/types/index.ts` — TypeScript interfaces: User, Task, Feedback, Department, UrgencyLevel, FeedbackTopic, FeedbackType, ViewMode, AppSettings
- `src/context/AppContext.tsx` — Global state: selected user, highlight vs isolate mode, active view, filters (department, process, urgency, status, feedback topic, date range), dark mode, manager dashboard toggle, feedback-required setting
- `src/components/AppSidebar.tsx` — User list sidebar using Shadcn Sidebar with single-click highlight / double-click isolate logic, circular avatars with department accent borders
- `src/components/TaskCard.tsx` — Card with urgency badge, feedback counter, hover tooltip (latest feedback summary), feedback button, edit button
- `src/components/FeedbackModal.tsx` — Dialog with topic selector, type selector, comment textarea, anonymous toggle, feedback history timeline, submit handler
- `src/components/FilterBar.tsx` — Dropdowns for department, process, urgency, task status (active/completed/overdue), feedback topic, date range
- `src/components/views/CardView.tsx` — Horizontal scrollable columns per user, highlighted column on single-click
- `src/components/views/ListView.tsx` — Sortable table with row highlighting
- `src/components/views/EisenhowerView.tsx` — 2×2 grid, urgency→urgent axis, importance toggle→important axis
- `src/components/ManagerDashboard.tsx` — Overlay with computed bar chart, donut chart, heatmap matrix, recurring issues summary (all derived from feedback data, no manual input)
- `src/components/ViewSwitcher.tsx` — Toggle between Card/List/Eisenhower
- `src/components/SettingsPopover.tsx` — Contains feedback-required toggle and dark mode toggle
- `src/components/Header.tsx` — App title, view switcher, manager dashboard toggle, settings popover, new task button
- `src/pages/Index.tsx` — Root layout composing SidebarProvider + AppSidebar + Header + main content area
- `src/index.css` — Dark mode CSS variables, color scheme matching navy/blue-gray palette
- `tailwind.config.ts` — Extended with urgency colors, department colors

**Key interaction flows:**

```text
Sidebar Click Flow:
  single-click user → dispatch HIGHLIGHT_USER → CardView scrolls to & outlines column
  double-click user → dispatch ISOLATE_USER → all views show only that user
  double-click again → dispatch CLEAR_FILTER → show all

Task Completion Flow (when feedback-required is ON):
  click "Complete" → check feedbackCount > 0
    yes → mark complete
    no  → show warning "Adicione feedback antes de concluir"

Hover Tooltip:
  mouseEnter card → show HoverCard with last feedback entry
  no feedback → "Sem feedback ainda"

Manager Dashboard:
  toggle ON → render overlay computing aggregations from tasks[].feedback[]
  filters apply → aggregations recompute
```

**Charts:** Use Recharts (already available via shadcn/chart) for bar chart, pie chart. Heatmap built with a CSS grid of colored cells.

**Estimated file count:** ~15 new files, 2 modified files (Index.tsx, index.css, tailwind.config.ts).

