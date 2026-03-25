

## Plan: View Switcher, Eisenhower Colors, Universal Zoom & Search Bar

### 1. Replace ViewSwitcher with a Combobox

**File:** `src/components/ViewSwitcher.tsx`

Replace the `ToggleGroup` with a `Select` (dropdown) showing each view as `Icon + Label`:
- "Card View" + `LayoutGrid`
- "List View" + `List`
- "Eisenhower View" + `Grid2x2`

Each `SelectItem` renders the icon inline next to the text. The trigger shows the currently selected view's icon + name.

### 2. Eisenhower View Background Colors

**File:** `src/components/views/EisenhowerView.tsx`

When Eisenhower view is active, apply dim background tints to each quadrant reflecting the classic diagram:
- **Urgent + Important** (top-left): warm red/orange tint
- **Important + Not Urgent** (top-right): calm blue/green tint
- **Urgent + Not Important** (bottom-left): yellow/amber tint
- **Not Urgent + Not Important** (bottom-right): gray tint

Use inline `style` with low-opacity HSL backgrounds (already partially done — increase opacity slightly and ensure colors match the conceptual model).

### 3. Universal Zoom for All Views

**Files:** `src/components/views/ListView.tsx`, `src/components/views/EisenhowerView.tsx`

Apply the same zoom `transform: scale(zoomLevel/100)` pattern used in `CardView` to ListView and EisenhowerView:
- Read `zoomLevel` from `useAppContext()`
- Wrap content in a container with `transform`, `transform-origin: top left`, and inverse width/height scaling

### 4. Search Bar with Ctrl+F

**Files:**
- `src/context/AppContext.tsx` — add `searchQuery` state and filter logic
- `src/components/SearchBar.tsx` — new component: an icon button (magnifying glass) in the Header that, when clicked, reveals a search input bar between FilterBar and the view. Ctrl+F toggles it.
- `src/components/Header.tsx` — add the search icon button
- `src/pages/Index.tsx` — render `<SearchBar />` between `<FilterBar />` and the view

**Behavior:**
- Icon in Header toggles `searchOpen` state
- `Ctrl+F` / `Cmd+F` keyboard shortcut toggles search (with `e.preventDefault()` to override browser find)
- Search bar slides in below FilterBar, pushing content down (no overlap)
- Filters `filteredTasks` by matching `task.title`, `task.code`, `task.process`, and `task.observations` against the search query (case-insensitive)
- ESC closes the search bar and clears the query

### Summary of Files Changed
| File | Change |
|------|--------|
| `src/components/ViewSwitcher.tsx` | Replace ToggleGroup with Select dropdown |
| `src/components/views/EisenhowerView.tsx` | Add conceptual background colors + zoom |
| `src/components/views/ListView.tsx` | Add zoom support |
| `src/context/AppContext.tsx` | Add `searchQuery`, `setSearchQuery`, filter by search |
| `src/components/SearchBar.tsx` | New search bar component |
| `src/components/Header.tsx` | Add search icon button |
| `src/pages/Index.tsx` | Render SearchBar between FilterBar and view |

