# Mandrii - Active Tasks

**Last Updated**: January 16, 2025  
**Current Branch**: preview

> This file tracks active tasks, improvements, and fixes for the Mandrii project. Tasks are organized by priority and category. For completed tasks, see `COMPLETED.md`. For architectural decisions, see `DECISIONS.md`.

---

## High Priority Tasks

### Critical Infrastructure

- [ ] **Fix Husky Pre-commit Hook**

  - **Issue**: `lint-staged` fails with "next lint: command not found" when running pre-commit hook
  - **Impact**: Developers must use `--no-verify` to commit, bypassing linting
  - **Root Cause**: ESLint 9 migration deprecated `next lint` command
  - **Solution**: Update `.husky/pre-commit` to use `eslint` directly instead of `next lint`
  - **Reference**: Discovered during MNDR-5 commit
  - **Files**: `.husky/pre-commit`, `lint-staged.config.mjs` (if exists)

- [ ] **Fix Pre-existing Test Failures**
  - **Issue 1**: `useForm.test.ts` import resolution error
    - Module `~/lib/validation/email.test` not found
    - May be typo or missing test file
  - **Issue 2**: Tooltip test failures (need to investigate specifics)
  - **Issue 3**: Textarea test failures (need to investigate specifics)
  - **Impact**: CI/CD may be failing, unclear test coverage status
  - **Action**: Run `pnpm --filter web test` to see full error output, then fix

### Backend Services Implementation

- [ ] **Implement FastAPI Services Backend**
  - **Current State**: Minimal FastAPI skeleton exists (`apps/services/src/main.py`)
  - **Status**: Marked as "not implemented yet" in architecture docs
  - **Scope**: Define what services should handle
    - Background job processing?
    - API integrations (external services)?
    - Data processing/transformation?
    - Scheduled tasks (cron jobs)?
  - **Dependencies**:
    - Define service responsibilities (currently unclear)
    - Set up deployment pipeline (Vercel? Separate hosting?)
    - Configure `/services/*` proxy for production
  - **Files**: `apps/services/src/main.py`, `apps/services/README.md` (empty)

---

## Medium Priority Tasks

### Code Quality & Technical Debt

- [ ] **Add Test Coverage for Critical Hooks**

  - **Missing Tests**: Only `useForm.test.ts` exists, but needs fixing
  - **Hooks Needing Tests**:
    - `useRestApi.ts` - Generic REST API client
    - `useGraphApi.ts` - Apollo wrapper with infinite scroll
    - `useVenues.ts` - Venue CRUD operations
    - `useListControls.ts` - List filtering/pagination
    - `useKeyboardNavigation.ts` - Keyboard shortcuts
    - `useNotifications.ts` - Toast notifications
  - **Rationale**: Per `PLANNING.md`, hooks are "high value, low maintenance" test targets
  - **Files**: `apps/web/src/hooks/*.test.ts`

- [ ] **Add Test Coverage for Utility Functions**

  - **Current State**: Limited unit test coverage for utilities
  - **Key Utilities Needing Tests**:
    - `apps/web/src/lib/utils/phone-number.ts` - Phone number validation/formatting
    - `apps/web/src/lib/utils/storage.ts` - localStorage wrapper
    - `apps/web/src/lib/utils/url-helper.ts` - URL manipulation
    - `apps/web/src/lib/validation/*.ts` - Zod schema factories
  - **Action**: Create co-located `.test.ts` files for each utility

- [ ] **Improve Error Handling in API Routes**

  - **Current State**: Basic error handling with structured responses
  - **Issues**:
    - Some routes may not handle all error cases
    - Error messages may leak sensitive information
    - Sentry integration should be verified for all routes
  - **Action**: Audit `apps/web/src/app/api/**/*.ts` routes for:
    - Proper try/catch blocks
    - Consistent error response format
    - Sentry error tracking
    - Security (no sensitive data in error messages)

- [ ] **Add E2E Test Coverage for Admin Features**
  - **Current E2E Tests**: Only public features tested
    - `authentication.spec.ts` - Sign in/out
    - `contact-form.spec.ts` - Contact form submission
    - `home.spec.ts` - Home page rendering
    - `theme-toggle.spec.ts` - Dark mode toggle
  - **Missing Coverage**:
    - Admin dashboard access control
    - Venue moderation workflow
    - User management features
  - **Files**: `apps/web/e2e/*.spec.ts`

### Performance & Optimization

- [ ] **Implement Caching Strategy**

  - **Current State**: No caching layer
  - **Opportunities**:
    - Venue list queries (frequently accessed, changes infrequently)
    - User session data
    - Static content (blog posts, MDX)
  - **Options**: Redis, Vercel KV (already in dependencies)
  - **Reference**: Listed in `PLANNING.md` "Future Considerations"

- [ ] **Optimize Image Loading**

  - **Current State**: Uses Vercel Blob Storage for images
  - **Improvements**:
    - Implement Next.js Image component consistently
    - Add responsive image sizes
    - Lazy load images below the fold
    - Consider WebP/AVIF format support
  - **Impact**: Better Lighthouse scores, faster page loads

- [ ] **Review and Optimize Bundle Size**
  - **Current State**: `unused-javascript` Lighthouse audit allows up to 4 long scripts
  - **Action**:
    - Analyze bundle with `pnpm --filter web analyze` (if script exists)
    - Consider code splitting for large dependencies
    - Tree-shake unused code
    - Dynamic imports for heavy components

### Documentation & Knowledge Management

- [ ] **Complete `apps/services/README.md`**

  - **Current State**: Empty file
  - **Needed**:
    - Service purpose and responsibilities
    - Setup instructions
    - API documentation
    - Deployment guide
    - Development workflow

- [ ] **Create Architecture Diagrams**

  - **Current State**: Architecture described in text in `PLANNING.md`
  - **Action**: Create visual diagrams for:
    - System architecture (monorepo structure, data flow)
    - Authentication flow (NextAuth + Hasura JWT)
    - Venue submission workflow
    - Middleware stack
  - **Tools**: Mermaid.js (can embed in markdown), draw.io, etc.

- [ ] **Document Environment Variables**
  - **Current State**: Environment variables referenced but not centrally documented
  - **Action**: Create `docs/environment-variables.md` with:
    - All required variables
    - Optional variables
    - Development vs production values
    - Where to obtain values (API keys, etc.)

---

## Low Priority Tasks

### Features & Enhancements

- [ ] **Add Search Functionality**

  - **Current State**: No search capability for venues or blog posts
  - **Options**:
    - ElasticSearch for full-text search
    - Algolia for managed search
    - Simple PostgreSQL full-text search via Hasura
  - **Reference**: Listed in `PLANNING.md` "Future Considerations"

- [ ] **Implement PWA Support**

  - **Current State**: Not a Progressive Web App
  - **Benefits**:
    - Offline capability
    - Push notifications
    - App-like experience on mobile
  - **Action**:
    - Add service worker
    - Create manifest.json
    - Implement offline fallback
  - **Reference**: Listed in `PLANNING.md` "Future Considerations"

- [ ] **Add GraphQL Subscriptions for Real-time Updates**

  - **Current State**: Polling for updates (if any)
  - **Use Cases**:
    - Real-time venue changes
    - New reviews notifications
    - Event updates
  - **Technology**: Hasura supports GraphQL subscriptions
  - **Reference**: Listed in `PLANNING.md` "Future Considerations"

- [ ] **Expand Internationalization**
  - **Current State**: English and Ukrainian only
  - **Potential Languages**: Polish, German, Spanish, French (high Ukrainian diaspora)
  - **Action**:
    - Add language to `next-intl` config
    - Create translation files via POEditor workflow
    - Update language selector UI
  - **Reference**: Listed in `PLANNING.md` "Future Considerations"

### Code Improvements

- [ ] **Migrate to Stable NextAuth v5**

  - **Current State**: Using NextAuth v5.0.0-beta.28 (beta)
  - **Action**: Monitor NextAuth releases, upgrade when v5 stable
  - **Testing**: Thoroughly test authentication flows after upgrade
  - **Reference**: Listed in `PLANNING.md` "Future Considerations"

- [ ] **Review and Refactor Large Components**

  - **Current State**: Some components may exceed 500-line guideline
  - **Action**: Search for files >500 lines, refactor into smaller modules
  - **Command**: `find apps/web/src -name "*.tsx" -o -name "*.ts" | xargs wc -l | sort -nr | head -20`
  - **Reference**: `.github/copilot-instructions.md` best practices

- [ ] **Standardize Error Messaging**
  - **Current State**: Error messages may be inconsistent
  - **Action**:
    - Create centralized error message constants
    - Ensure all errors use i18n for localization
    - Consistent error UI across the app

### Development Experience

- [ ] **Add Storybook for Component Development** (Optional)

  - **Current State**: Some components have `.stories.tsx` files but no Storybook setup
  - **Found Stories**: `Input.stories.tsx`, `Textarea.stories.tsx`
  - **Decision**: Determine if Storybook should be added or stories removed
  - **If Adding**:
    - Install Storybook for Next.js
    - Configure with Tailwind CSS
    - Document component library
  - **If Removing**: Clean up existing `.stories.tsx` files

- [ ] **Improve Development Scripts**
  - **Current State**: Basic scripts in root `package.json`
  - **Opportunities**:
    - Add `test:watch` for continuous testing
    - Add `test:coverage` for coverage reports
    - Add `analyze` script for bundle analysis
    - Add `db:migrate` for database migrations (if applicable)

---

## Technical Debt

### Known Issues

- [ ] **Resolve Lighthouse Audit Warnings**

  - **Current State**: Some audits ignored in `lighthouserc.js`:
    - `is-crawlable` - Expected (noindex on preview deployments)
    - `bf-cache` - Expected (no-store on preview deployments)
    - `unused-javascript` - Allowed up to 4 long scripts
  - **Action**: Review production Lighthouse scores, optimize if needed

- [ ] **Review and Update Dependencies**
  - **Current State**: 42 dependencies, 36 devDependencies in web app
  - **Action**:
    - Run `pnpm outdated` to check for updates
    - Test and update dependencies
    - Watch for NextAuth v5 stable release
    - Monitor React 19 ecosystem maturity

### Security & Compliance

- [ ] **Security Audit**

  - **Action**:
    - Run `pnpm audit` for known vulnerabilities
    - Review authentication flows for security issues
    - Check for sensitive data exposure
    - Validate CSP headers configuration

- [ ] **GDPR Compliance Review** (If applicable)
  - **Current State**: Unclear if GDPR requirements are fully met
  - **Action**:
    - Review user data collection and storage
    - Ensure cookie consent (if needed)
    - Privacy policy and terms of service
    - User data deletion capabilities

---

## In Progress

### Linear Tickets

- [x] **MNDR-5: Replace forEach with for...of**
  - **Status**: ✅ Completed
  - **Branch**: `MNDR-005_replace-foreach-with-for-of`
  - **Commit**: `f5518f1`
  - **Files Modified**: 6 files, 9 forEach instances replaced
  - **Next Steps**:
    - Push branch to remote
    - Create pull request
    - Merge to preview branch

---

## Parking Lot (Ideas for Future Consideration)

- Consider micro-frontend architecture for admin dashboard if it grows significantly
- Evaluate ElasticSearch for advanced venue search with filters
- Explore headless CMS for blog content management
- Consider adding user profiles with favorite venues
- Implement venue ownership verification workflow
- Add venue analytics for owners (views, clicks, etc.)
- Consider adding a mobile app (React Native, Flutter)

---

## Notes

### Task Discovery Process

- Analyzed project structure and dependencies
- Reviewed `PLANNING.md` and `DECISIONS.md` for documented gaps
- Searched for TODO/FIXME/HACK markers (mostly false positives - phone number format XXX)
- Examined test coverage (22 test files, mostly UI components)
- Identified incomplete backend services implementation
- Found broken pre-commit hook during MNDR-5 work

### Task Prioritization Criteria

- **High Priority**: Blockers, broken features, critical infrastructure
- **Medium Priority**: Technical debt, missing tests, performance improvements
- **Low Priority**: Enhancements, nice-to-haves, future features

### Project Health Status

- ✅ TypeScript compilation: PASSING
- ⚠️ Tests: Some failures (need investigation)
- ⚠️ Pre-commit hooks: BROKEN (lint-staged issue)
- ✅ Production deployment: Working (Vercel)
- ⚠️ Backend services: NOT IMPLEMENTED

---

**Related Documentation**:

- `.github/copilot-instructions.md` - AI agent guidance
- `PLANNING.md` - Architecture and design
- `DECISIONS.md` - Architectural decisions
- `tickets/README.md` - Linear ticket workflow
