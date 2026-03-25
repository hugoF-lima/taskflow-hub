

## Plan: Fix Dark Theme for Recharts Tooltips in ManagerDashboard

### Problem

The `<Tooltip>` components from Recharts on lines 179 and 194 only set `contentStyle={{ fontSize: 12 }}`, which leaves the tooltip with Recharts' default white background and dark text — ignoring the app's dark theme.

### Fix

**File:** `src/components/ManagerDashboard.tsx`

Update both `<Tooltip>` `contentStyle` props to use the app's CSS variables for background, text color, and border:

```tsx
<Tooltip contentStyle={{
  fontSize: 12,
  backgroundColor: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '8px',
  color: 'hsl(var(--foreground))',
}} />
```

Apply this to both the BarChart tooltip (line 179) and the LineChart tooltip (line 194).

### Files Changed

| File | Change |
|------|--------|
| `src/components/ManagerDashboard.tsx` | Theme-aware `contentStyle` on both `<Tooltip>` components |

