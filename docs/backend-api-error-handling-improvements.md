# Backend API Error Handling & Logging Improvements

**Date:** 2025-11-10

## Overview

Comprehensive review and improvement of error handling and logging across all backend API routes to ensure proper Sentry integration and easier debugging.

## Key Architecture Pattern

The project uses **`withErrorHandling`** wrapper that automatically:

- Catches all errors thrown inside route handlers
- Captures them to Sentry with `captureException`
- Distinguishes between `ApiError` types (4xx/5xx) and unexpected errors
- Adds automatic context tags (`error_code`, `error_type`, `status_code`)
- Sets appropriate Sentry levels (error vs warning)

**Routes using `withErrorHandling` get automatic Sentry capture** - no manual `captureException` needed!

## Files Reviewed & Improved

### Enhanced: `withErrorHandling` wrapper

**Improvements:**

- ✅ Now captures errors with enhanced context automatically
- ✅ Adds tags: `error_code`, `error_type`, `status_code`
- ✅ Sets level based on status code (5xx = error, 4xx = warning)
- ✅ Includes validation errors in extra context
- ✅ Distinguishes between expected (`ApiError`) and unexpected errors

### Routes Using `withErrorHandling` (Automatic Sentry Capture)

These routes already had good error handling and now benefit from enhanced `withErrorHandling`:

✅ `/api/(public)/contact/route.ts`
✅ `/api/(public)/newsletter/subscribe/route.ts`
✅ `/api/(public)/newsletter/unsubscribe/route.ts`
✅ `/api/(public)/newsletter/verify/route.ts`
✅ `/api/(protected)/geocode/route.ts`
✅ `/api/(protected)/event/save/route.ts`
✅ `/api/(protected)/user/save/route.ts`
✅ `/api/(protected)/venue/save/route.ts`
✅ `/api/(protected)/slack-notify/route.ts` - Fixed to avoid duplicate capture

### Routes with Manual Error Handling (Need Explicit Sentry Capture)

These routes don't use `withErrorHandling` and required manual Sentry integration:

### 1. `/api/(public)/captcha/route.ts`

**Improvements:**

- ✅ Added `captureException` with context tags (`api_route: "captcha"`)
- ✅ Added extra metadata (error type, action presence)
- ✅ Added HTTP response validation for reCAPTCHA API
- ✅ Proper error message extraction

### 2. `/api/(public)/geo-ip/route.ts`

**Improvements:**

- ✅ Enhanced existing `captureException` with context tags (`api_route: "geo-ip"`)
- ✅ Added timeout detection in extra metadata
- ✅ Consistent error handling structure

### 3. `/api/(public)/mixpanel/route.ts`

**Improvements:**

- ✅ Enhanced existing `captureException` with context tags (`api_route: "mixpanel"`, `service: "mixpanel"`)
- ✅ Added error type in extra metadata
- ✅ Consistent error handling structure

### 4. `/api/(admin)/ref/route.ts`

**Improvements:**

- ✅ Added `captureException` to all 4 methods (GET, POST, PUT, DELETE)
- ✅ Added operation-specific tags (`operation: "create"`, `"list"`, `"update"`, `"delete"`)
- ✅ Proper error message extraction
- ✅ Consistent error logging across all operations

### Supporting Files

### 5. `/api/(protected)/geocode/geo.ts`

**Improvements:**

- ✅ Enhanced error messages with specific context (address, Google API status)
- ✅ Better error message construction in `geocodeAddress`
- ✅ Improved non-critical error handling for OSM enrichment
- ✅ Consistent error type checking

### 6. `/lib/models/user.ts`

**Improvements:**

- ✅ Separated error handling into specific error types:
  - Network errors → `BadGateway` with context
  - HTTP errors → `BadGateway` with status code
  - JSON parsing errors → `BadGateway` with specific message
  - Constraint violations → `BadRequestError`
  - Permission denied → `UnauthorizedError`
  - Other database errors → `BadGateway` with error message
- ✅ All errors now have descriptive messages for Sentry (via `withErrorHandling`)

### 7. `/lib/utils/images.ts`

**Improvements:**

- ✅ Added `captureException` to `processAndUploadImage` with operation tags
- ✅ Comprehensive error tracking for both:
  - **Complete failures** (all images failed) - `level: error`
  - **Partial failures** (some images failed) - `level: warning`
- ✅ Detailed Sentry metadata including:
  - Total images count
  - Successful/failed counts
  - Individual file errors
  - Prefix path

## Sentry Context Strategy

### For Routes Using `withErrorHandling`

Just throw the appropriate error type - automatic capture with tags:

```typescript
throw new BadRequestError("Invalid input");
throw new NotFoundError("Resource not found");
// Automatically captured with error_code, error_type, status_code tags
```

### For Routes with Manual Error Handling

Use consistent pattern:

```typescript
captureException(error, {
  tags: {
    api_route: "route-name",
    operation: "create|update|...",
    service: "external-service-name",
  },
  level: "error" | "warning",
  extra: {
    // Request-specific context
  },
});
```

## Benefits

1. **Better Debugging:** Every error has detailed context in Sentry
2. **Automatic Capture:** Most routes get Sentry integration for free via `withErrorHandling`
3. **Easier Triage:** Tags allow filtering by route, operation, error type, or status code
4. **Failure Visibility:** Partial failures tracked with warnings
5. **Error Specificity:** Different error types for different failure modes
6. **Production Readiness:** Structured logging makes production debugging easier
7. **No Duplication:** Routes using `withErrorHandling` don't need manual `captureException`

## Testing Recommendations

To verify these improvements work correctly:

1. **Captcha failures** - Try with invalid tokens
2. **Redirect operations** - Test all CRUD operations on `/api/ref`
3. **Geocoding failures** - Try invalid addresses
4. **Image processing** - Test with corrupted images and batch uploads
5. **Database errors** - Simulate connection failures or constraint violations
6. **External service failures** - Test geo-ip, mixpanel with network issues

## Next Steps

Consider adding:

- Rate limiting with proper error responses
- Request ID tracking across the stack
- Performance monitoring for slow API calls
- Automated error alerting thresholds in Sentry
