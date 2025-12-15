# Mandrii - Active Tasks

**Last Updated**: December 3, 2025  
**Current Branch**: shop

> This file tracks active tasks, improvements, and fixes for the Mandrii project. Tasks are organized by priority and category. For completed tasks, see `COMPLETED.md`. For architectural decisions, see `DECISIONS.md`.

---

## 🚨 Production Blockers (Must Fix Before Launch)

### Shop Feature - Cannot Go Live Without Checkout

**Status**: ❌ **BLOCKED** - Checkout is completely stubbed

**Current State**:

- ✅ Shop catalog working (products, filtering, search)
- ✅ Product detail pages working (variants, colors, stock indicators)
- ✅ Cart functionality working (add/remove, quantity, currency validation)
- ✅ 121 tests passing (95 unit + 26 e2e)
- ❌ **Checkout button is stubbed** - no payment processing
- ❌ **No server-side validation** - prices/stock can be manipulated
- ❌ **No order creation** - cannot track/fulfill orders

**What's Needed**:

1. Checkout API with server-side price/stock validation
2. Stripe payment integration
3. Order creation and stock decrement
4. Checkout UI flow

**See**: Task "🚨 PRODUCTION BLOCKER: Implement Checkout with Server-Side Validation" below for full details

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

- [ ] **🚨 PRODUCTION BLOCKER: Implement Checkout with Server-Side Validation**

  - **Current State**:
    - ❌ Cart is client-side only (localStorage)
    - ❌ Price and stock stored in CartContext but NOT authoritative
    - ❌ No checkout backend or payment processing
    - ❌ Checkout button is stubbed (CartView.tsx lines 118-133)
    - ⚠️ **SHOP CANNOT GO LIVE WITHOUT THIS**
  - **Why This Is Critical**:
    - Client can manipulate localStorage to change prices/stock
    - No order persistence - cart lost on browser clear
    - No payment processing - cannot accept money
    - No stock management - risk of overselling
  - **Critical Security Requirements**:
    - ⚠️ **Server MUST re-validate all prices** - client priceMinor cannot be trusted
    - ⚠️ **Server MUST check stock availability** - prevent overselling
    - ⚠️ **Server MUST enforce currency consistency** - verify all items use same currency
    - Fetch authoritative product data from database before processing payment
  - **Implementation Steps**:
    1. **Database Schema** (if not exists):
       - `orders` table (id, user_id/email, status, total_minor, currency, created_at)
       - `order_items` table (order_id, product_id, variant_json, quantity, price_minor, name)
    2. **Create Checkout API** (`/api/checkout/route.ts`):
       - Accept: `{ items: [{ productId, variant?, quantity }] }`
       - Validate session/user
       - Query Hasura for current product prices, stock, availability
       - Verify currency consistency across all products
       - Calculate authoritative total server-side
       - Check stock availability (return error if insufficient)
       - Create Stripe Payment Intent with server-calculated total
       - Return client secret + validated cart summary
    3. **Create Payment Confirmation API** (`/api/checkout/confirm/route.ts`):
       - Verify payment succeeded via Stripe webhook or API
       - Create order record in database
       - Decrement stock atomically (use SQL transaction)
       - Send order confirmation email
       - Return order ID and confirmation
    4. **Client Checkout Flow** (`features/Shop/Checkout.tsx`):
       - Call `/api/checkout` to validate cart + get payment intent
       - Handle validation errors (price changed, out of stock, currency mismatch)
       - Show Stripe payment form (CardElement)
       - Submit payment to Stripe
       - Call `/api/checkout/confirm` after payment succeeds
       - Redirect to order confirmation page
    5. **Update CartView.tsx**:
       - Remove stub message (lines 141-144)
       - Wire "Proceed to checkout" button to navigate to `/checkout`
       - Pass cart items as URL params or use CartContext
  - **Priority**: 🔴 **CRITICAL** - required before shop can accept real orders
  - **Estimated Effort**: 2-3 days (backend + frontend + testing)
  - **Blockers**: None - auth system exists, Hasura is configured
  - **Files to Create/Modify**:
    - `apps/web/src/app/api/checkout/route.ts` (new)
    - `apps/web/src/app/api/checkout/confirm/route.ts` (new)
    - `apps/web/src/features/Shop/Checkout.tsx` (new)
    - `apps/web/src/features/Shop/CartView.tsx` (modify - wire button)
    - `apps/web/src/app/[locale]/(public)/checkout/page.tsx` (new)
    - Hasura migrations for orders tables (if not exists)
    - Environment variables for Stripe keys

- [ ] **Convert Shop Features to SSR + Server-Synced Cart**
  - **Current State**:
    - `ShopCatalog` and `ProductView` are client components using Apollo hooks
    - Cart is 100% localStorage (no cross-device sync)
  - **Issues**:
    - No SEO for product pages (client-side data fetching)
    - Cart not synced across devices for logged-in users
    - Cart lost on browser clear/incognito mode
    - Currency mismatch warning only appears after hydration (confusing UX)
  - **Required Changes**:
    1. **SSR Product Pages**: Convert to RSC (React Server Components)
       - Fetch products in server components via Apollo Server Client
       - Pass data as props to client components
       - Improves SEO, eliminates loading states
    2. **Server-Synced Cart**: Hybrid approach
       - **Guest users**: Continue using localStorage (fast, no auth)
       - **Logged-in users**: Sync cart to Hasura DB
       - Cart merge logic on login
       - Optimistic UI updates with background sync
       - Immediate currency validation (before add-to-cart completes)
    3. **Database Schema**: Add cart tables
       - `user_carts` (user_id, currency, created_at, updated_at)
       - `user_cart_items` (cart_id, product_id, variant, quantity, price_minor_cache, etc.)
       - Note: price_minor_cache for display only - NOT authoritative for checkout
  - **Dependencies**:
    - **Requires auth system** (NextAuth fully implemented)
    - Should be done together with checkout implementation
  - **Impact**: Major refactoring - CartContext, all components, tests
  - **Priority**: Defer until auth + checkout backend are built
  - **Files**:
    - `apps/web/src/contexts/CartContext.tsx`
    - `apps/web/src/features/Shop/ShopCatalog.tsx`
    - `apps/web/src/features/Shop/ProductView.tsx`
    - `apps/web/src/app/[locale]/(public)/shop/**/*.tsx`
    - Hasura migrations for cart tables

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

- [x] **MNDR-8: Add Events Database Schema & Hasura Setup**

  - **Status**: ✅ Completed - November 4, 2025
  - **Branch**: `MNDR-008_add-events-database-schema`
  - **Ticket Folder**: `tickets/archived/MNDR-008/`
  - **PR**: Ready to create
  - **Summary**: Implemented complete database schema with 6 tables, PostgreSQL ENUMs, multilingual tags, and Hasura configuration. Deployed to preview and production.
  - **See**: `COMPLETED.md` for full details

- [x] **MNDR-7: Add generic README description based on website functionality**

  - **Status**: ✅ Completed - January 18, 2025
  - **Branch**: `MNDR-007_add-readme-description`
  - **Commit**: `5574566`
  - **Ticket Folder**: `tickets/archived/MNDR-007/`
  - **PR**: Ready to create
  - **Summary**: Added comprehensive README with project overview, 10 key features, and complete tech stack documentation

- [x] **MNDR-6: Move submitVenue function to module scope**
  - **Status**: ✅ Completed
  - **Branch**: `MNDR-006_move-submitvenue-to-outer-scope`
  - **Commit**: `b58ff5b`
  - **Ticket Folder**: `tickets/MNDR-006/`
  - **Files Modified**: 1 file (EditVenue.tsx)
  - **Next Steps**:
    - Finalize documentation
    - Archive ticket folder
    - Push branch to remote
    - Create pull request

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
