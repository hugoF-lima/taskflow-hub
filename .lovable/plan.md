

## Plan: Fix Task Code Generation & Verify Insert Works

### Problem
The `addTask` function generates task codes using `tasks.length + 1`, which collides with existing seed data codes. The DB has a `UNIQUE` constraint on `tasks.code`, so inserts fail silently with error `23505`.

### Solution
Query the database for the highest existing code number before generating a new one.

### Changes

**File: `src/hooks/useSupabaseData.ts`**

Replace the code generation in `addTask`:

```typescript
// Before (broken):
const code = `GAP-${String(tasks.length + 1).padStart(4, '0')}`;

// After (correct):
const { data: maxCodeRow } = await supabase
  .from('tasks')
  .select('code')
  .order('code', { ascending: false })
  .limit(1)
  .maybeSingle();

const lastNum = maxCodeRow?.code
  ? parseInt(maxCodeRow.code.replace('GAP-', ''), 10)
  : 0;
const code = `GAP-${String(lastNum + 1).padStart(4, '0')}`;
```

This queries the highest existing `GAP-XXXX` code and increments from there, avoiding collisions.

### Technical Detail
- `tasks.length` dependency is also removed from the `useCallback` deps array since it's no longer used
- Uses `maybeSingle()` instead of `single()` to handle empty table gracefully

