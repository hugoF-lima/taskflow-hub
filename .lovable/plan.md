

## Plan: Fix Feedback Attachments (Upload + Retrieve)

### Problem
The `addFeedback` function in `useSupabaseData.ts` inserts the feedback record but **never uploads attachment files or inserts rows into `feedback_attachments`**. The files are only converted to local blob URLs (`URL.createObjectURL`) in the component, which are ephemeral and lost on reload. Additionally, there is no Supabase Storage bucket for storing these files.

### Solution

**1. Create a Supabase Storage bucket** (SQL migration)
- Create a `feedback-attachments` storage bucket (public or authenticated access)
- Add RLS policies so authenticated users can upload and read

**2. Update `addFeedback` in `src/hooks/useSupabaseData.ts`**
- Accept actual `File` objects (not just metadata) in the feedback submission
- Upload each file to Supabase Storage (`feedback-attachments` bucket)
- Get the public URL for each uploaded file
- Insert rows into `feedback_attachments` table with the feedback ID, file name, URL, type, and size

**3. Update `TaskDetailDialog.tsx`**
- Pass actual `File` objects through to `addFeedback` instead of converting to blob URLs
- Update the `addFeedback` call signature to include files

**4. Update `NewTaskDialog.tsx`** (if it also submits attachments with feedback)
- Same pattern: pass files through for upload

### Technical Details

**Storage bucket creation (migration):**
```sql
INSERT INTO storage.buckets (id, name, public) 
VALUES ('feedback-attachments', 'feedback-attachments', true);

CREATE POLICY "Authenticated can upload" ON storage.objects 
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'feedback-attachments');

CREATE POLICY "Anyone can view" ON storage.objects 
FOR SELECT USING (bucket_id = 'feedback-attachments');
```

**Updated `addFeedback` signature:**
```typescript
const addFeedback = async (
  taskId: string, 
  fb: Omit<Feedback, 'id' | 'taskId' | 'createdAt'>,
  files?: File[]
) => {
  // 1. Insert feedback row, get back the ID
  const { data } = await supabase.from('feedback').insert({...}).select().single();
  
  // 2. Upload each file to storage
  // 3. Insert feedback_attachments rows with storage URLs
};
```

**Component changes:**
- `TaskDetailDialog.tsx`: pass `fbAttachments` (File[]) as third arg to `addFeedback`
- Update `AppContext` to propagate the new signature

