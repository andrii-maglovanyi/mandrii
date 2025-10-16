# Mandrii - Project Planning & Architecture

## 1. Project Overview and Purpose

**Mandrii** is a bilingual (English/Ukrainian) web platform that serves two primary purposes:

1. **Personal Blog**: A space for sharing travel stories, thoughts, and experiences
2. **Ukrainian Venues Directory**: A comprehensive catalogue of Ukrainian venues (restaurants, cultural centers, shops, etc.) across the world, primarily in Europe

### Core Features
- **Venue Discovery**: Location-based search with Google Maps integration
- **User Reviews & Ratings**: Community-driven venue evaluation
- **Event Listings**: Upcoming events at Ukrainian venues
- **Multi-language Support**: Full English and Ukrainian localization
- **User Authentication**: OAuth (Google) and magic link email authentication
- **Admin Management**: Venue moderation and content management dashboard

### Target Audience
- Ukrainian diaspora seeking community spaces
- Travelers looking for authentic Ukrainian experiences
- Venue owners wanting to promote their businesses

## 2. Technology Stack and Key Dependencies

### Frontend (Next.js 15 App)
- **Framework**: Next.js 15.4.4 with App Router
- **UI Library**: React 19.1.0
- **Styling**: Tailwind CSS v4.1.11 with custom Ukraine-themed colors
- **State Management**: React Context API (Auth, Theme, Dialog, Notifications)
- **Data Fetching**: Apollo Client 3.13.8 for GraphQL, custom REST hooks
- **Forms & Validation**: Zod 4.0.10 with custom `useForm` hook
- **Maps**: @react-google-maps/api 2.20.7
- **Authentication**: NextAuth v5.0.0-beta.28 with Hasura adapter
- **Internationalization**: next-intl 4.3.4
- **Analytics**: Sentry 9.42.0, Mixpanel, Vercel Speed Insights
- **Email**: React Email 4.2.4, Resend 4.7.0
- **Content**: MDX 3.1.0 with gray-matter

### Backend Services
- **Database**: Hasura GraphQL Engine (hosted, not in repo)
- **Python Service**: FastAPI with uvicorn (minimal, future expansion)
- **Storage**: Vercel Blob, Vercel KV
- **Email Provider**: Resend
- **Notifications**: Slack Bolt 4.5.0

### Development Tools
- **Package Manager**: pnpm 10.18.1 (workspace monorepo)
- **Language**: TypeScript 5.8.3 (strict mode)
- **Linting**: ESLint 9.31.0 with Next.js config, perfectionist (import sorting)
- **CSS Linting**: Stylelint 16.22.0 with Tailwind config
- **Testing**: Vitest 3.2.4 (unit), Playwright 1.54.1 (E2E)
- **Code Generation**: GraphQL Code Generator 5.0.7
- **Git Hooks**: Husky 9.1.7, lint-staged 16.1.6

### Python Dependencies
- **Framework**: FastAPI 0.116.1
- **Server**: uvicorn[standard] 0.35.0
- **Linter**: ruff 0.12.11
- **Package Manager**: uv (modern Python dependency manager)

## 3. Architecture Patterns and Design Principles

### Monorepo Structure
- **Pattern**: pnpm workspace with two independent apps
- **Apps**: `apps/web` (Next.js frontend), `apps/services` (Python backend)
- **Communication**: HTTP proxy `/services/*` → localhost:8000 (dev) or production URL

### Next.js App Architecture
- **Routing**: App Router with locale prefixes (`/[locale]/*`)
- **Route Groups**: `(public)` and `(protected)` for pages, `(public)` and `(admin)` for API routes
- **Server/Client Split**: 
  - Server components for data fetching and auth checks
  - Client components marked with `"use client"` directive
  - Contexts for client-side global state

### Data Flow Architecture
```
User → Next.js App → Apollo Client → Hasura GraphQL → PostgreSQL
                   ↓
                   API Routes → External Services (Resend, Google Maps, etc.)
                   ↓
                   Python FastAPI (future background jobs)
```

### Key Design Patterns

#### 1. Custom Hook Pattern
- **Purpose**: Abstract complex logic into reusable hooks
- **Examples**:
  - `useForm`: Zod-based validation with field-level errors, array/file support
  - `useRestApi`: Generic REST client with loading/error states
  - `useGraphApi`: Apollo wrapper with mobile infinite scroll
  - `useVenues`: Domain-specific CRUD operations

#### 2. Composable Middleware Pattern
- **File**: `src/middlewares/stackHandler.ts`
- **Pattern**: Higher-order middleware composition
- **Stack**: Admin subdomain routing → Referral tracking → i18n routing → CSP headers

#### 3. Configuration Splitting Pattern
- **Public Config** (`src/lib/config/public.ts`): Client-safe values (Hasura endpoint, API keys)
- **Private Config** (`src/lib/config/private.ts`): Server-only secrets with validation
- **Rule**: Never access `process.env` directly in application code

#### 4. Component Organization
- **Layout Components** (`src/components/layout/*`): Feature-specific, domain logic
- **UI Primitives** (`src/components/ui/*`): Generic, reusable, no business logic
- **Export Convention**: Named exports for components, default exports only for Next.js pages

#### 5. Type-Safe GraphQL Pattern
1. Write GraphQL queries in hook files using `gql` tag
2. Run `./scripts/graphql-codegen.sh` to generate types
3. Import generated types from `src/types/graphql.generated.ts`
4. Apollo cache configured with custom type policies

#### 6. Validation Schema Pattern
- **Location**: `src/lib/validation/*`
- **Pattern**: Factory functions that accept `i18n` for localized error messages
- **Usage**: Schemas shared between client and server validation

#### 7. Error Handling & Monitoring
- **Sentry Integration**: Client (`instrumentation-client.ts`) and server (`instrumentation.ts`)
- **API Routes**: Consistent error responses with `NextResponse.json({ error: ... }, { status: ... })`
- **Graceful Degradation**: Fallbacks for missing data, loading states

## 4. Directory Structure and Organization

```
mandrii/
├── .github/
│   └── copilot-instructions.md         # AI agent guidance
├── apps/
│   ├── web/                            # Next.js application
│   │   ├── content/                    # MDX content files
│   │   │   ├── about/{locale}/        # About pages per locale
│   │   │   ├── cv/{locale}/           # CV/Resume per locale
│   │   │   └── posts/{locale}/        # Blog posts per locale
│   │   ├── e2e/                       # Playwright E2E tests
│   │   ├── public/static/             # Static assets (images, SVGs)
│   │   ├── scripts/                   # Build/dev scripts
│   │   │   └── graphql-codegen.sh     # GraphQL type generation
│   │   ├── src/
│   │   │   ├── app/                   # Next.js App Router
│   │   │   │   ├── [locale]/         # Locale-based routes
│   │   │   │   │   ├── (protected)/  # Auth-required pages
│   │   │   │   │   └── (public)/     # Public pages
│   │   │   │   ├── admin/            # Admin dashboard
│   │   │   │   └── api/              # API routes
│   │   │   │       ├── (admin)/      # Admin API endpoints
│   │   │   │       └── (public)/     # Public API endpoints
│   │   │   ├── components/
│   │   │   │   ├── layout/           # Feature components
│   │   │   │   │   ├── Auth/        # Authentication forms
│   │   │   │   │   ├── Contact/     # Contact form
│   │   │   │   │   ├── MainLayout/  # App shell (header/footer)
│   │   │   │   │   ├── UserDirectory/ # Venues management
│   │   │   │   │   └── Venues/      # Venue discovery
│   │   │   │   └── ui/              # Reusable UI primitives
│   │   │   │       ├── Button/
│   │   │   │       ├── Input/
│   │   │   │       ├── Modal/
│   │   │   │       ├── Table/
│   │   │   │       └── ...
│   │   │   ├── contexts/            # React Context providers
│   │   │   │   ├── AuthContext.tsx   # NextAuth session
│   │   │   │   ├── DialogContext.tsx # Modal management
│   │   │   │   ├── NotificationsContext.tsx # Toast notifications
│   │   │   │   └── ThemeContext.tsx  # Dark mode toggle
│   │   │   ├── hooks/               # Custom React hooks
│   │   │   ├── i18n/                # Internationalization
│   │   │   ├── lib/                 # Utilities and integrations
│   │   │   │   ├── apollo/          # Apollo Client setup
│   │   │   │   ├── auth/            # NextAuth helpers
│   │   │   │   ├── config/          # Environment config
│   │   │   │   ├── icons/           # SVG icon components
│   │   │   │   ├── utils/           # Helper functions
│   │   │   │   └── validation/      # Zod schemas
│   │   │   ├── middlewares/         # Next.js middleware
│   │   │   └── types/               # TypeScript definitions
│   │   ├── translations/            # i18n JSON files
│   │   ├── codegen.yml              # GraphQL codegen config
│   │   ├── next.config.mjs          # Next.js configuration
│   │   ├── playwright.config.ts     # E2E test config
│   │   ├── tsconfig.json            # TypeScript config
│   │   └── vitest.config.ts         # Unit test config
│   └── services/                    # Python FastAPI service
│       ├── src/
│       │   └── main.py              # FastAPI application
│       ├── Makefile                 # Dev/start commands
│       └── pyproject.toml           # Python dependencies
├── tickets/                         # Project management docs
├── package.json                     # Root monorepo config
├── pnpm-workspace.yaml              # pnpm workspace definition
└── README.md                        # Project documentation
```

### Key Directory Conventions

1. **Route Groups**: Use `(groupName)` for organization without affecting URLs
2. **Locale Prefix**: All user-facing routes under `[locale]` dynamic segment
3. **Type Co-location**: `.d.ts` files alongside related code when extending third-party types
4. **Test Co-location**: `.test.ts` files next to implementation for unit tests
5. **E2E Separation**: Playwright tests in dedicated `e2e/` directory

## 5. Code Conventions and Style Guidelines

### TypeScript
- **Strict Mode**: Enabled with `noImplicitAny`, `strictNullChecks`
- **No JavaScript**: `allowJs: false` - TypeScript only
- **Path Aliases**: `~/` maps to `src/` directory
- **Type Imports**: Use `import type` for type-only imports
- **Enums**: Prefer string unions or `const enum` for better tree-shaking

### React/Next.js
- **Function Style**:
  - Components: Named function declarations (`export function ComponentName() {}`)
  - Utilities: Arrow functions (`export const helperFn = () => {}`)
- **Exports**:
  - Components: Named exports (`export function Button()`)
  - Pages/Routes: Default exports (Next.js requirement)
- **Props**: Use `Readonly<Props>` for component props
- **Async Components**: Server components can be async, leverage this for data fetching
- **Client Directive**: Explicit `"use client"` at top of file when needed

### Styling (Tailwind CSS)
- **Utility-First**: Prefer Tailwind utilities over custom CSS
- **Custom Classes**: Prefix with `mndr-` (e.g., `mndr-button-primary`)
- **Color Tokens**: Use semantic colors from `globals.css` theme
  - Ukraine theme: `ukraine-blue-*`, `ukraine-yellow-*`
  - Neutrals: `neutral-*` (50-950 scale)
- **Dark Mode**: Use `dark:` variant, managed by `.dark` class on `<html>`
- **Responsive**: Mobile-first approach, use `sm:`, `md:`, `lg:` breakpoints
- **Validation**: `better-tailwindcss` ESLint plugin enforces registered classes

### Import Organization
- **Auto-Sorted**: `eslint-plugin-perfectionist` enforces alphabetical order
- **Grouping** (manual convention):
  1. External dependencies
  2. Internal aliases (`~/`)
  3. Relative imports (`./`, `../`)
  4. Type imports

### Naming Conventions
- **Files**: kebab-case (`user-profile.tsx`, `use-venues.ts`)
- **Components**: PascalCase (`UserProfile`, `VenueCard`)
- **Hooks**: camelCase with `use` prefix (`useForm`, `useVenues`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_IMAGES`, `CACHE_TTL`)
- **Types/Interfaces**: PascalCase (`VenueFormData`, `APIParams`)
- **Private Functions**: Leading underscore (`_validateToken`)

### GraphQL Conventions
- **Queries**: UPPER_SNAKE_CASE (`GET_PUBLIC_VENUES`)
- **Generated Types**: Suffix with `Query`/`Mutation` (`GetPublicVenuesQuery`)
- **Fragments**: Not used currently, prefer inline selections
- **Cache Keys**: Defined in Apollo client config (`typePolicies`)

### Validation (Zod)
- **Schema Location**: `src/lib/validation/*.ts`
- **Factory Pattern**: Export functions that accept `i18n` for error messages
- **Reusability**: Compose schemas (e.g., `getEmailFormSchema` omits fields from `getEmailSchema`)
- **Type Export**: Export inferred types (`export type VenueFormData = z.infer<VenueSchema>`)

### Error Handling
- **API Routes**: Return structured errors with appropriate HTTP status codes
```typescript
return NextResponse.json({ error: "Error message" }, { status: 400 });
```
- **Sentry**: Capture exceptions in try/catch blocks, automatically tracked in instrumentation
- **User Feedback**: Use `NotificationsContext` for toast notifications
- **Graceful Degradation**: Always provide fallback UI for loading/error states

### Testing
- **Unit Tests**: Vitest with Testing Library
  - Co-located with implementation (`.test.ts` suffix)
  - Focus on hooks and utility functions
  - Use `describe`/`it` structure
- **E2E Tests**: Playwright
  - Located in `e2e/` directory
  - Test critical user flows (auth, forms, navigation)
  - Run against local dev server

### Git Workflow
- **Branch Naming**: `MNDR-{ticket-number}_{description}` (enforced by pre-commit hook)
- **Commit Messages**: Conventional commits preferred
- **Pre-commit**: Runs lint-staged (linting, formatting)
- **Code Review**: Required for main/preview branches

## 6. Development Workflow and Processes

### Initial Setup
```bash
# Clone repository
git clone https://github.com/andrii-maglovanyi/mandrii.git
cd mandrii

# Install dependencies
pnpm install

# Set up environment variables
cp apps/web/.env.example apps/web/.env.local
# Fill in required values

# Start development servers
pnpm dev  # Starts both web (3000) and services (8000)
```

### Daily Development
```bash
# Start only web app
pnpm dev:web

# Start only Python service
pnpm dev:services
# OR
cd apps/services && make dev

# Run linting
pnpm lint              # ESLint + TypeScript
pnpm --filter web lint:css  # Stylelint
pnpm type-check        # TypeScript only

# Run tests
pnpm --filter web test:unit        # Vitest unit tests
pnpm --filter web test:e2e         # Playwright E2E
pnpm --filter web test:e2e:ui      # Playwright with UI
```

### GraphQL Development Workflow
1. Edit/create GraphQL queries in hook files (e.g., `src/hooks/useVenues.ts`)
2. Run code generation:
   ```bash
   cd apps/web && ./scripts/graphql-codegen.sh
   ```
3. Import generated types from `src/types/graphql.generated.ts`
4. Use in components/hooks

### Translation Workflow
1. Extract messages from code:
   ```bash
   pnpm --filter web export-messages
   ```
2. Sync with POEditor (external service)
3. Import updated translations:
   ```bash
   pnpm --filter web import-translations
   ```

### Content Management (MDX)
- Blog posts: Add to `content/posts/{locale}/`
- Static pages: Edit in `content/about/{locale}/` or `content/cv/{locale}/`
- Frontmatter required: `title`, `date`, `description`

### Deployment Workflow (Vercel)
- **Main Branch**: Auto-deploys to production (mandrii.com)
- **Preview Branch**: Auto-deploys to preview (mandrii.vercel.app)
- **Pull Requests**: Auto-generates preview URLs
- **Environment Variables**: Managed in Vercel dashboard
- **Build Command**: `pnpm build` (runs Next.js build)
- **Python Service**: Separate deployment (not yet implemented)

### Database Migrations (Hasura)
- Schema managed through Hasura Console (not in repo)
- Migrations tracked in Hasura Cloud
- Local development uses cloud database (no local Hasura instance)

### Debugging
- **Next.js**: Use VS Code debugger with launch configs
- **Client-Side**: React DevTools, Apollo DevTools, browser console
- **Server-Side**: Console logs, Sentry for production errors
- **API Routes**: Use Postman/Insomnia or `curl` for testing
- **GraphQL**: Use Apollo Studio or Hasura Console

## 7. Key Constraints and Technical Decisions

### Architectural Decisions

#### 1. Monorepo vs. Polyrepo
- **Decision**: Monorepo with pnpm workspaces
- **Rationale**: Shared tooling, simplified dependency management, atomic changes
- **Trade-off**: Increased build complexity, larger repository size

#### 2. Next.js App Router vs. Pages Router
- **Decision**: App Router (Next.js 13+)
- **Rationale**: Better performance (React Server Components), improved data fetching, co-located layouts
- **Trade-off**: Newer API, less community examples, learning curve

#### 3. NextAuth v5 Beta
- **Decision**: Use beta version despite stability concerns
- **Rationale**: Better App Router integration, Hasura JWT adapter support
- **Trade-off**: Potential breaking changes, limited documentation
- **Constraint**: Must stay updated with NextAuth releases

#### 4. Hasura as Backend
- **Decision**: Use managed Hasura GraphQL Engine instead of custom backend
- **Rationale**: Instant GraphQL API, real-time subscriptions, role-based access control
- **Trade-off**: Vendor lock-in, less control over query optimization, cost at scale
- **Constraint**: GraphQL schema must be designed in Hasura Console

#### 5. Apollo Client vs. urql/React Query
- **Decision**: Apollo Client for GraphQL
- **Rationale**: Robust caching, broad ecosystem, better TypeScript support
- **Trade-off**: Bundle size (~40KB), more complex API
- **Optimization**: Custom `useGraphApi` hook abstracts complexity

#### 6. Tailwind CSS v4
- **Decision**: Adopt Tailwind v4 (early adoption)
- **Rationale**: Better performance, new features, native CSS variables
- **Trade-off**: Bleeding edge, potential compatibility issues
- **Constraint**: Custom configuration in `globals.css` using new `@theme` syntax

#### 7. Python Service (FastAPI)
- **Decision**: Separate Python service for background tasks
- **Status**: Minimal implementation, future expansion planned
- **Rationale**: Node.js limitations for certain tasks (e.g., data processing, ML integration)
- **Trade-off**: Additional deployment complexity, inter-service communication

### Performance Decisions

#### 1. Mobile Infinite Scroll
- **Implementation**: Custom in `useGraphApi` hook
- **Behavior**: Auto-fetches more data as user scrolls (mobile only)
- **Rationale**: Better mobile UX, reduces initial load time
- **Constraint**: Desktop uses pagination for better control

#### 2. Image Optimization
- **Decision**: Use Next.js Image component + Vercel Blob storage
- **Rationale**: Automatic optimization, CDN delivery, responsive images
- **Constraint**: Limited to remote patterns defined in `next.config.mjs`

#### 3. API Route Caching
- **Example**: `geo-ip/route.ts` uses in-memory cache (1-hour TTL)
- **Rationale**: Reduce external API calls, improve response times
- **Trade-off**: Stale data for up to 1 hour, memory usage

#### 4. Bundle Optimization
- **Decision**: Dynamic imports for heavy components (Google Maps, Puppeteer)
- **Rationale**: Reduce initial bundle size, faster page loads
- **Implementation**: `serverExternalPackages` in `next.config.mjs`

### Security Decisions

#### 1. Content Security Policy
- **Implementation**: Middleware (`withContentSecurityPolicy`)
- **Headers**: Strict CSP, HSTS, X-Frame-Options
- **Rationale**: Mitigate XSS, clickjacking attacks

#### 2. Environment Variable Management
- **Decision**: Centralized config files (`public.ts`, `private.ts`)
- **Rationale**: Type safety, validation, prevent accidental client-side exposure
- **Pattern**: Throw errors for missing required variables (except `UNSET_CONFIG=true`)

#### 3. ReCAPTCHA Integration
- **Implementation**: Google reCAPTCHA v3 for forms
- **Rationale**: Bot prevention without user friction
- **Constraint**: Requires server-side validation in API routes

#### 4. JWT Authentication
- **Implementation**: NextAuth with custom Hasura claims
- **Rationale**: Stateless auth, compatible with Hasura permissions
- **Claims Structure**: `x-hasura-user-id`, `x-hasura-default-role`, `x-hasura-allowed-roles`

### Scalability Considerations

#### 1. Database
- **Current**: Hasura managed PostgreSQL
- **Constraint**: No direct access to database, all operations via GraphQL
- **Future**: May need custom database optimizations as data grows

#### 2. Static Content
- **Decision**: MDX files committed to repo
- **Rationale**: Version control, simplicity
- **Limitation**: Not suitable for user-generated content at scale
- **Future**: May migrate to CMS (Contentful, Sanity)

#### 3. File Uploads
- **Decision**: Vercel Blob storage
- **Rationale**: Serverless-friendly, automatic CDN
- **Constraint**: Vercel pricing, 100MB file size limit

#### 4. Analytics
- **Decision**: Multiple providers (Sentry, Mixpanel, Vercel)
- **Rationale**: Different insights (errors, user behavior, performance)
- **Trade-off**: Increased client bundle size, privacy considerations

### Development Experience Decisions

#### 1. Strict TypeScript
- **Decision**: `strict: true`, `noImplicitAny: true`, no `allowJs`
- **Rationale**: Catch errors early, better IDE support, self-documenting
- **Trade-off**: More upfront work, learning curve for contributors

#### 2. Automated Code Quality
- **Tools**: ESLint, Stylelint, Prettier, Husky, lint-staged
- **Enforcement**: Pre-commit hooks block non-compliant code
- **Rationale**: Consistent code style, reduce review friction

#### 3. Testing Philosophy
- **Unit Tests**: Focus on hooks and utilities (high value, low maintenance)
- **E2E Tests**: Cover critical user journeys (auth, venue submission, contact form)
- **Not Tested**: Simple presentational components (diminishing returns)

#### 4. Documentation
- **Inline**: JSDoc for complex functions
- **External**: README.md, PLANNING.md, DECISIONS.md, copilot-instructions.md
- **Pattern**: Document "why", not "what" (code should be self-explanatory)

### Known Limitations

1. **No Local Hasura**: All developers share cloud database (use caution with destructive operations)
2. **POEditor Dependency**: Translation workflow requires external service
3. **Vercel Specifics**: Some features tied to Vercel platform (KV, Blob)
4. **Mobile Performance**: Large bundle size on initial load (opportunity for optimization)
5. **No Offline Support**: Requires internet connection for all features
6. **Single Language per User**: No session-based language preference (uses URL locale)

### Future Considerations

1. **Migrate to Stable NextAuth**: Once v5 reaches stable release
2. **Add Redis Caching**: For frequently accessed data (venue lists, user sessions)
3. **Implement Search**: ElasticSearch or Algolia for full-text venue search
4. **PWA Support**: Service workers for offline capability, push notifications
5. **Micro-frontend**: If admin dashboard grows, consider separate deployment
6. **GraphQL Subscriptions**: Real-time updates for venue changes, new reviews
7. **Internationalization**: Add more languages (Polish, German, etc.)

---

**Last Updated**: October 16, 2025  
**Maintained By**: Andrii Maglovanyi (andrii.maglovanyi@gmail.com)  
**Related Docs**: `.github/copilot-instructions.md`, `DECISIONS.md`, `README.md`
