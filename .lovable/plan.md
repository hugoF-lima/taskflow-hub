

## Plan: Image Attachment Preview in Feedback History

### Overview

Replace download-only links for image attachments with inline thumbnail previews. Clicking a thumbnail opens a full-size lightbox overlay. Non-image attachments keep the current download link behavior.

### Changes

**File:** `src/components/TaskDetailDialog.tsx`

1. **Add state:** `previewImage: string | null` for the lightbox URL

2. **Replace attachment rendering** (lines 422-438): For image attachments (`att.type.startsWith('image/')`), render an `<img>` thumbnail (e.g., 64×64, `object-cover`, rounded, cursor-pointer). Clicking sets `previewImage = att.url`. Non-image files keep the existing download link.

3. **Add lightbox dialog:** A simple `Dialog` that shows the full-size image when `previewImage` is set, with a download button. Closing resets `previewImage` to null.

### Files Changed

| File | Change |
|------|--------|
| `src/components/TaskDetailDialog.tsx` | Image thumbnails, lightbox dialog, `previewImage` state |

