

## Plan: Add Attachments to Feedback

### Overview

Allow users to attach files (images, documents) when submitting feedback — both in the inline feedback form and the "Resolver Tarefa" dialog. Existing feedbacks with attachments display clickable file links for viewing/downloading.

Since there's no backend, attachments will be stored as in-memory object URLs from `File` objects, with metadata saved on the `Feedback` type.

### Changes

**1. Update `Feedback` type**

**File:** `src/types/index.ts`

Add an `attachments` field to the `Feedback` interface:

```ts
export interface FeedbackAttachment {
  name: string;
  url: string;     // object URL or data URL
  type: string;    // MIME type
  size: number;
}

export interface Feedback {
  // ... existing fields
  attachments?: FeedbackAttachment[];
}
```

**2. Update `addFeedback` in AppContext**

**File:** `src/context/AppContext.tsx`

Update the `Omit` type for `addFeedback` to pass through `attachments`. No logic change needed — it already spreads `...fb` into the new feedback object.

**3. Add attachment UI to TaskDetailDialog**

**File:** `src/components/TaskDetailDialog.tsx`

- **State**: Add `fbAttachments: File[]` and `resolveFbAttachments: File[]`
- **Import**: Add `Paperclip`, `Download`, `FileText`, `Image` from lucide-react
- **Feedback form** (both inline and resolve dialog): Add a paperclip button that triggers a hidden `<input type="file" multiple>`. Show attached file names as removable chips below the comment field.
- **Submit logic**: Convert `File[]` to `FeedbackAttachment[]` using `URL.createObjectURL()` before passing to `addFeedback`.
- **Feedback history**: For each feedback with attachments, render clickable file items (icon + name) that open in a new tab (`window.open(url)`) or trigger download via an `<a download>` link.

### Files Changed

| File | Change |
|------|--------|
| `src/types/index.ts` | Add `FeedbackAttachment` interface and `attachments?` field to `Feedback` |
| `src/context/AppContext.tsx` | Ensure `attachments` passes through in `addFeedback` |
| `src/components/TaskDetailDialog.tsx` | Attachment input, chips, and download links in both feedback forms and history |

