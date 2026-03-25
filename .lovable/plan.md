

## Plan: Interactive LineChart Tooltip with Hover-Focus & Line Highlighting

### Problem
The LineChart tooltip appears too close to the cursor and is not interactive — hovering items inside it doesn't highlight the associated line.

### Approach

**File:** `src/components/ManagerDashboard.tsx`

1. **Add state:** `hoveredTopic: string | null` to track which topic the user is hovering inside the tooltip.

2. **Custom tooltip with offset:** Replace the Recharts `<Tooltip>` on the LineChart with a custom `content` renderer that:
   - Adds `offset={16}` prop to push the tooltip ~16px away from the cursor (Recharts `offset` controls distance from active point)
   - Renders each topic row with `onMouseEnter` / `onMouseLeave` handlers that set `hoveredTopic`
   - When a topic is hovered, all other rows get `opacity: 0.3`
   - Uses `allowEscapeViewBox={{ x: true, y: true }}` and `isAnimationActive={false}` for smooth interaction

3. **Conditional line opacity:** Each `<Line>` component gets a dynamic `strokeOpacity`:
   - If `hoveredTopic` is null → all lines at full opacity (1)
   - If `hoveredTopic` matches → that line at opacity 1, all others at 0.15

### Technical Details

```tsx
// State
const [hoveredTopic, setHoveredTopic] = useState<string | null>(null);

// Custom tooltip content component (inline or extracted)
const CustomTrendTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-card p-2 text-xs shadow-xl"
         style={{ color: 'hsl(var(--foreground))' }}>
      <p className="font-medium mb-1">{label}</p>
      {payload.map(entry => (
        <div key={entry.dataKey}
             onMouseEnter={() => setHoveredTopic(entry.dataKey)}
             onMouseLeave={() => setHoveredTopic(null)}
             className="flex items-center gap-2 px-1 py-0.5 rounded cursor-default transition-opacity"
             style={{ opacity: hoveredTopic && hoveredTopic !== entry.dataKey ? 0.3 : 1 }}>
          <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
          <span>{entry.dataKey}</span>
          <span className="ml-auto font-medium">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

// On <Tooltip>
<Tooltip offset={16} content={<CustomTrendTooltip />} 
         isAnimationActive={false} allowEscapeViewBox={{ x: true, y: true }} />

// On each <Line>
<Line strokeOpacity={hoveredTopic === null || hoveredTopic === topic ? 1 : 0.15} ... />
```

### Files Changed

| File | Change |
|------|--------|
| `src/components/ManagerDashboard.tsx` | Add `hoveredTopic` state, custom tooltip component, dynamic line opacity |

