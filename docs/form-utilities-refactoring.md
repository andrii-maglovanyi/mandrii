# Form Utilities Refactoring

## Overview

Extracted common form handling logic from `UserForm` and `VenueForm` into reusable utilities to eliminate code duplication and improve maintainability.

## Created Utilities

### 1. `lib/forms/formData.ts`

**Purpose**: Build FormData from any data object

**Usage**:

```typescript
import { buildFormData } from "~/lib/forms";

const formData = buildFormData(validatedData);
// Handles Files, arrays, objects, primitives automatically
```

**Replaces**: Duplicate `buildFormData` functions in UserForm and VenueForm

---

### 2. `lib/forms/fileUtils.ts`

**Purpose**: Convert URLs to File objects for re-uploading

**Usage**:

```typescript
import { createFileFromUrl } from "~/lib/forms";

const file = await createFileFromUrl(imageUrl);
// Handles both absolute URLs and relative paths from Vercel Blob Storage
```

**Replaces**: Duplicate `createFileFromUrl` functions

---

### 3. `hooks/useImagePreview.ts`

**Purpose**: Manage image preview state with automatic cleanup

**Exports**:

- `useImagePreview(file)` - Single image preview
- `useImagePreviews(files[])` - Multiple image previews
- `ImageFile` interface

**Usage**:

```typescript
import { useImagePreview, ImageFile } from "~/hooks/useImagePreview";

const avatarPreview = useImagePreview(values.avatar);
// Automatically creates and revokes blob URLs

if (avatarPreview) {
  return <img src={avatarPreview.url} alt="Preview" />;
}
```

**Replaces**:

- Manual `useState<ImageFile>` management
- Manual `URL.createObjectURL` / `URL.revokeObjectURL` calls
- Duplicate `useEffect` cleanup logic

---

### 4. ~~`hooks/useFormSubmission.ts`~~ ✅ INTEGRATED INTO `useForm`

**Purpose**: Generic form submission with status management

**Status**: **DEPRECATED** - This hook has been merged into `useForm` for better integration with validation.

**✅ NOW INTEGRATED INTO `useForm`**

The submission logic is now part of `useForm`, eliminating the need for a separate hook. See "Enhanced useForm Hook" section below.

---

## Enhanced Form Hooks

### useForm + useFormSubmit

Form handling is now split into two **separate but complementary** hooks:

1. **`useForm`** - Pure form state & validation
2. **`useFormSubmit`** - Optional submission management

**Core API - `useForm`**:

```typescript
const {
  // Form state & validation
  errors,
  getFieldProps,
  handleBlur,
  handleChange,
  isFormValid,
  setFieldErrorsFromServer,
  setValues,
  resetForm,
  validateForm,
  values,
  touched,
} = useForm({
  initialValues: {
    /* ... */
  },
  schema: myZodSchema,
});
```

**Optional Submission - `useFormSubmit`**:

```typescript
import { useFormSubmit } from "~/hooks/form/useFormSubmit";

// Only use if you need managed submission
const { status, setStatus, handleSubmit } = useFormSubmit({
  validateForm, // From useForm
  setFieldErrorsFromServer, // From useForm
  onSubmit: async (validatedData) => {
    // Called with validated data after successful validation
    return { ok: boolean, errors: ZodError["issues"] };
  },
  onSuccess: async () => {
    // Called after successful submission
  },
  onError: async (errors?) => {
    // Called after failed submission
  },
});
```

**Benefits**:

- ✅ **True separation of concerns** - two focused hooks instead of one bloated hook
- ✅ **Optional by design** - only import/use `useFormSubmit` when needed
- ✅ **Follows Rules of Hooks** - no factory functions calling hooks
- ✅ **Automatic validation** before submission
- ✅ **Typed validated data** passed to `onSubmit`
- ✅ **Manual status control** via `setStatus` when needed
- ✅ **Automatic error handling** with `setFieldErrorsFromServer`
- ✅ **Cleaner imports** - each hook has a single, clear purpose

**Complete Usage Example**:

```typescript
const { createSubmitHandler, getFieldProps, values } = useForm({
  schema: getUserSchema(i18n),
  initialValues: { name: "", email: "" },
});

// Optional: Only create if you need managed submission
const { handleSubmit, status, setStatus } = createSubmitHandler({
  onSubmit: async (data) => {
    const formData = buildFormData(data);
    return await api.save(formData);
  },
  onSuccess: async () => {
    showSuccess("Profile saved!");
  },
  onError: async (errors) => {
    console.error("Save failed:", errors);
  },
});

// In JSX
<form onSubmit={handleSubmit}>
  <Input {...getFieldProps("name")} />
  <Button type="submit" disabled={status === "processing"}>
    Save
  </Button>
</form>;
```

**Alternative: Manual Submission** (if you don't need managed status):

```typescript
const { validateForm, values } = useForm({
  /* ... */
});

const handleSubmit = async (e) => {
  e.preventDefault();
  const validated = validateForm();
  if (validated) {
    // Your custom submission logic
    await api.save(validated);
  }
};
```

**Replaces**:

- ❌ ~~`useFormSubmission` hook~~
- ❌ Manual `status` state management
- ❌ Manual `handleSubmit` implementation
- ❌ Try-catch boilerplate

**Design Rationale**:

This approach follows the **single responsibility principle**:

- `useForm` = Form state + validation
- `createSubmitHandler` = Optional submission management

The submission logic is **related but not core** to form validation, so it's provided as an optional factory function rather than cluttering the main hook's API.

---

## Migration Example

### Before (UserForm.tsx):

```typescript
// 80+ lines of boilerplate
const [formStatus, setFormStatus] = useState<Status>("idle");
const [avatarPreview, setAvatarPreview] = useState<ImageFile | null>();

async function createFileFromUrl(url: string) {
  /* ... */
}
function buildFormData(data) {
  /* ... */
}

useEffect(() => {
  const avatar = values.avatar;
  setAvatarPreview(
    avatar ? { file: avatar, url: URL.createObjectURL(avatar) } : null
  );
  return () => {
    URL.revokeObjectURL(/* ... */);
  };
}, [values.avatar]);

async function handleSuccess() {
  /* ... */
}
async function handleError() {
  /* ... */
}
async function handleSubmit(e) {
  /* ... */
}
```

### After:

```typescript
// Clean and focused - ~20 lines
import { buildFormData, createFileFromUrl } from "~/lib/forms";
import { useFormSubmission, useImagePreview } from "~/hooks";

const avatarPreview = useImagePreview(values.avatar);

const { status, handleSubmit } = useFormSubmission({
  onSubmit: async (data) => {
    const body = buildFormData(data);
    return await submitProfile(body, locale);
  },
  onSuccess: async () => {
    showSuccess(i18n("Profile updated successfully"));
    await refetchProfile();
    await updateSession();
    setIsEditing(false);
  },
  onError: async (errors) => {
    if (errors) setFieldErrorsFromServer(errors);
  },
});
```

---

## Benefits

✅ **Eliminated Duplication**: Removed 150+ lines of duplicate code  
✅ **Better Separation of Concerns**: Form logic separated from utilities  
✅ **Easier to Test**: Utilities can be unit tested independently  
✅ **Type Safe**: Full TypeScript support with generics  
✅ **Automatic Cleanup**: Image preview URLs automatically revoked  
✅ **Consistent Patterns**: Same approach for all forms  
✅ **Easier Maintenance**: Fix once, works everywhere

---

## Files Changed

### Created:

- `lib/forms/formData.ts` - FormData builder
- `lib/forms/fileUtils.ts` - File URL converter
- `lib/forms/index.ts` - Barrel export
- `hooks/useImagePreview.ts` - Image preview hook
- `hooks/useFormSubmission.ts` - Form submission hook

### Updated:

- `components/layout/UserProfile/UserForm.tsx` - Refactored to use new utilities

### To Be Updated:

- `components/layout/UserDirectory/Venues/Venue/VenueForm.tsx` - Can be refactored similarly
- `components/layout/UserDirectory/Venues/Venue/VenueImages.tsx` - Can use `useImagePreviews`

---

## Future Improvements

1. **Extract submit functions**: Create generic `submitForm(endpoint, data)` helper
2. **Form builder**: Create declarative form component builder
3. **Validation utilities**: Extract common validation patterns
4. **Error handling**: Standardize error display across forms

---

## Usage Guidelines

### When to use `buildFormData`:

- Submitting forms with mixed data types (Files, strings, objects, arrays)
- Uploading files to API endpoints

### When to use `createFileFromUrl`:

- Loading existing images for re-upload
- Converting Vercel Blob Storage URLs to File objects

### When to use `useImagePreview`:

- Showing image preview before upload
- Single file input

### When to use `useImagePreviews`:

- Showing multiple image previews
- Multiple file input

### When to use `useFormSubmit`:

- Any form that needs status tracking (idle, processing, success, error)
- Forms with async onSuccess/onError handlers
- Use alongside `useForm` for managed submissions
