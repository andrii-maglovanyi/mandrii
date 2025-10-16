# Architectural Decision Records (ADR)

This document tracks major architectural and technical decisions made in the Mandrii project, following a lightweight ADR format. Each decision includes the context, the decision itself, rationale, consequences, and alternatives considered.

## Decision Index

### Architecture & Infrastructure
1. [Monorepo with pnpm Workspaces](#adr-001-monorepo-with-pnpm-workspaces)
2. [Next.js 15 with App Router](#adr-002-nextjs-15-with-app-router)
3. [Hasura as GraphQL Backend](#adr-003-hasura-as-graphql-backend)
4. [Separate Python FastAPI Service](#adr-004-separate-python-fastapi-service)
5. [Vercel as Deployment Platform](#adr-005-vercel-as-deployment-platform)

### Authentication & Authorization
6. [NextAuth v5 Beta](#adr-006-nextauth-v5-beta)
7. [JWT-Based Authentication with Hasura](#adr-007-jwt-based-authentication-with-hasura)
8. [Role-Based Access Control (RBAC)](#adr-008-role-based-access-control)

### Frontend Architecture
9. [Apollo Client for GraphQL](#adr-009-apollo-client-for-graphql)
10. [Tailwind CSS v4](#adr-010-tailwind-css-v4)
11. [React Context for Global State](#adr-011-react-context-for-global-state)
12. [Custom Hook Pattern for Data Fetching](#adr-012-custom-hook-pattern-for-data-fetching)

### Data & Content Management
13. [MDX for Content](#adr-013-mdx-for-content)
14. [POEditor for Translations](#adr-014-poeditor-for-translations)
15. [Vercel Blob for File Storage](#adr-015-vercel-blob-for-file-storage)

### Code Quality & Developer Experience
16. [Strict TypeScript Configuration](#adr-016-strict-typescript-configuration)
17. [Centralized Configuration Pattern](#adr-017-centralized-configuration-pattern)
18. [Composable Middleware Stack](#adr-018-composable-middleware-stack)
19. [GraphQL Code Generation](#adr-019-graphql-code-generation)

### Security & Privacy
20. [Content Security Policy Middleware](#adr-020-content-security-policy-middleware)
21. [Google reCAPTCHA v3](#adr-021-google-recaptcha-v3)
22. [Server-Side Environment Variable Validation](#adr-022-server-side-environment-variable-validation)

### Performance Optimization
23. [Mobile Infinite Scroll Pattern](#adr-023-mobile-infinite-scroll-pattern)
24. [API Route In-Memory Caching](#adr-024-api-route-in-memory-caching)
25. [Dynamic Imports for Heavy Dependencies](#adr-025-dynamic-imports-for-heavy-dependencies)

### Testing Strategy
26. [Vitest for Unit Tests](#adr-026-vitest-for-unit-tests)
27. [Playwright for E2E Tests](#adr-027-playwright-for-e2e-tests)

---

## Architecture & Infrastructure

### ADR-001: Monorepo with pnpm Workspaces
**Date**: 2025-07-25 (Project inception)  
**Status**: ✅ Accepted  
**Context**: Need to manage multiple related applications (web frontend, Python services) with shared tooling and dependencies.

**Decision**: Use pnpm workspaces to create a monorepo structure.

**Rationale**:
- **Atomic Changes**: Single commit can update multiple packages
- **Dependency Sharing**: Reduce duplication, ensure version consistency
- **Tooling Efficiency**: Shared linting, testing, and build configurations
- **Developer Experience**: Single repository checkout, unified workflows
- **pnpm Choice**: Faster than npm/yarn, efficient disk space usage, strict dependency resolution

**Consequences**:
- ✅ Simplified dependency management across apps
- ✅ Consistent tooling and code quality enforcement
- ✅ Easier to coordinate changes across frontend/backend
- ⚠️ Increased complexity for CI/CD (need smart caching)
- ⚠️ Larger repository size
- ⚠️ Learning curve for contributors unfamiliar with monorepos

**Alternatives Considered**:
- **Polyrepo**: Separate repositories for each app (rejected: too much tooling duplication)
- **Yarn Workspaces**: Similar features (rejected: pnpm is faster and more strict)
- **Turborepo**: Advanced monorepo tool (deferred: current scale doesn't warrant complexity)

---

### ADR-002: Next.js 15 with App Router
**Date**: 2025-07-25  
**Status**: ✅ Accepted  
**Context**: Need a React framework with SSR, routing, and excellent DX for a multilingual web application.

**Decision**: Adopt Next.js 15 with App Router architecture.

**Rationale**:
- **React Server Components**: Better performance, reduced client bundle
- **Co-located Layouts**: Simplified route structure with shared layouts
- **Streaming SSR**: Progressive page rendering for better UX
- **Built-in Optimizations**: Image optimization, font optimization, bundling
- **Route Groups**: Clean organization without affecting URLs (`(public)`, `(protected)`)
- **Native i18n Support**: Works well with next-intl for locale prefixes
- **Vercel Integration**: First-class deployment platform support

**Consequences**:
- ✅ Improved performance with RSC (React Server Components)
- ✅ Better developer experience with file-based routing
- ✅ Simplified data fetching patterns (async server components)
- ⚠️ Learning curve for team (different from Pages Router)
- ⚠️ Some third-party libraries not yet compatible with App Router
- ⚠️ Newer API means fewer Stack Overflow answers

**Alternatives Considered**:
- **Next.js Pages Router**: Mature, more examples (rejected: missing RSC benefits)
- **Remix**: Modern framework with good DX (rejected: smaller ecosystem)
- **Gatsby**: Static site generator (rejected: need dynamic features)

**Related**: ADR-006 (NextAuth compatibility), ADR-013 (MDX integration)

---

### ADR-003: Hasura as GraphQL Backend
**Date**: 2025-07-25  
**Status**: ✅ Accepted  
**Context**: Need a scalable backend with real-time capabilities, authentication, and minimal custom API code.

**Decision**: Use Hasura Cloud as the primary backend GraphQL engine over PostgreSQL.

**Rationale**:
- **Instant GraphQL API**: Auto-generates queries/mutations from PostgreSQL schema
- **Fine-Grained Permissions**: Row-level security with role-based access
- **Real-Time Subscriptions**: WebSocket support for live data updates
- **JWT Integration**: Native support for custom JWT claims (Hasura headers)
- **Performance**: Compiled to native code, query optimization out-of-the-box
- **Managed Service**: Reduces DevOps burden (backups, scaling, monitoring)
- **Developer Experience**: GraphQL Console for rapid prototyping

**Consequences**:
- ✅ Rapid API development without boilerplate
- ✅ Strong type safety with GraphQL Code Generator
- ✅ Built-in authorization with granular permissions
- ⚠️ Vendor lock-in to Hasura (migration would be significant effort)
- ⚠️ Less control over query optimization (can't write custom SQL easily)
- ⚠️ Cost scales with usage (managed service pricing)
- ⚠️ All developers share cloud database (no local Hasura instance)

**Alternatives Considered**:
- **Custom Node.js API**: Full control (rejected: too much boilerplate for CRUD)
- **Supabase**: Similar features (rejected: less mature GraphQL support)
- **Prisma**: ORM with generated types (rejected: need GraphQL subscriptions)
- **tRPC**: Type-safe RPC (rejected: already committed to GraphQL)

**Related**: ADR-007 (JWT integration), ADR-009 (Apollo Client), ADR-019 (Code generation)

---

### ADR-004: Separate Python FastAPI Service
**Date**: 2025-07-25  
**Status**: 🚧 Partially Implemented  
**Context**: Some tasks (data processing, integrations, potential ML) are better suited for Python than Node.js.

**Decision**: Create a separate FastAPI Python service proxied through Next.js.

**Rationale**:
- **Language Strengths**: Python excels at data processing, scientific computing
- **Future-Proofing**: Easier to add ML models, data pipelines later
- **Separation of Concerns**: Backend tasks independent of frontend lifecycle
- **Performance**: Python for CPU-intensive tasks, Node.js for I/O-bound
- **Ecosystem**: Rich Python ecosystem for integrations (Pandas, NumPy, etc.)

**Consequences**:
- ✅ Flexibility to use best tool for each task
- ✅ Can scale services independently
- ⚠️ Increased deployment complexity (two services)
- ⚠️ Inter-service communication adds latency
- ⚠️ More infrastructure to maintain
- 📝 Currently minimal implementation (single endpoint)

**Implementation Details**:
- **Framework**: FastAPI with uvicorn (modern, async-capable)
- **Package Manager**: uv (faster than pip, like cargo/pnpm for Python)
- **Proxy**: Next.js rewrites `/services/*` → Python service
- **Development**: `pnpm dev` starts both services concurrently

**Alternatives Considered**:
- **Node.js Workers**: Keep everything in Node.js (rejected: language limitations)
- **Separate Microservices**: Split into many services (deferred: premature)
- **Serverless Functions**: Use Vercel Functions (potential future migration)

**Future Plans**:
- Background job processing (venue data enrichment)
- Integration with external APIs (maps, geocoding)
- Potential ML features (recommendation engine)

---

### ADR-005: Vercel as Deployment Platform
**Date**: 2025-07-25  
**Status**: ✅ Accepted  
**Context**: Need a reliable, scalable hosting platform with excellent Next.js support and minimal DevOps.

**Decision**: Deploy to Vercel with automatic preview deployments for pull requests.

**Rationale**:
- **Next.js Native**: Built by the creators of Next.js, first-class support
- **Zero-Config Deployments**: Git push → automatic deployment
- **Preview Deployments**: Every PR gets unique URL for testing
- **Edge Network**: Global CDN for optimal performance
- **Integrated Services**: KV (Redis), Blob (S3-like), Analytics
- **Serverless Functions**: Automatic API route scaling
- **Environment Management**: Web UI for secrets/variables

**Consequences**:
- ✅ Extremely fast deployments (< 2 minutes)
- ✅ No infrastructure management required
- ✅ Automatic HTTPS, caching, compression
- ⚠️ Platform lock-in (uses Vercel-specific features: KV, Blob)
- ⚠️ Cost scales with usage (can get expensive at scale)
- ⚠️ Limited control over infrastructure (can't SSH into servers)
- 📝 Python service deployment not yet implemented

**Alternatives Considered**:
- **AWS Amplify**: Full-featured (rejected: more complex setup)
- **Netlify**: Similar features (rejected: less optimized for Next.js)
- **Self-Hosted**: VPS/containers (rejected: prefer managed service)
- **Railway/Render**: Modern platforms (rejected: less mature)

**Related**: ADR-015 (Vercel Blob), ADR-024 (API caching)

---

## Authentication & Authorization

### ADR-006: NextAuth v5 Beta
**Date**: 2025-07-25  
**Status**: ✅ Accepted (with caution)  
**Context**: Need authentication with multiple providers, sessions, and Hasura integration.

**Decision**: Use NextAuth v5 beta despite being pre-release.

**Rationale**:
- **App Router Compatibility**: v5 designed specifically for Next.js App Router
- **Hasura Adapter**: Official `@auth/hasura-adapter` package available
- **Modern API**: Cleaner, more intuitive than v4
- **Session Strategy**: JWT-based sessions work seamlessly with Hasura
- **Provider Support**: Google OAuth and email magic links
- **Active Development**: Frequent updates, moving toward stable release

**Consequences**:
- ✅ Seamless App Router integration (server components, route handlers)
- ✅ Hasura JWT claims work out-of-the-box
- ⚠️ Beta software means potential breaking changes
- ⚠️ Limited documentation and community examples
- ⚠️ Must stay updated with release notes
- 📝 Plan to migrate to stable v5 once released

**Configuration**:
```typescript
// src/lib/auth.ts
session: { strategy: "jwt" }
adapter: HasuraAdapter({ endpoint, adminSecret })
providers: [Google, Resend({ sendVerificationRequest })]
```

**Alternatives Considered**:
- **NextAuth v4**: Stable (rejected: poor App Router support)
- **Clerk**: Modern auth service (rejected: cost, vendor lock-in)
- **Auth0**: Enterprise-grade (rejected: complexity, cost)
- **Custom Auth**: Build from scratch (rejected: security risks, time)

**Related**: ADR-007 (JWT strategy), ADR-008 (RBAC)

---

### ADR-007: JWT-Based Authentication with Hasura
**Date**: 2025-07-25  
**Status**: ✅ Accepted  
**Context**: Hasura requires authentication mechanism for permission system.

**Decision**: Use JWT tokens with custom Hasura claims for stateless authentication.

**Rationale**:
- **Stateless**: No server-side session storage required
- **Hasura Native**: Built-in support for JWT validation
- **Custom Claims**: Embed user role and ID in token for permissions
- **Security**: Tokens signed with NEXTAUTH_SECRET, short-lived (1 hour)
- **Scalability**: No session store = easier horizontal scaling
- **Edge-Compatible**: Works in serverless/edge environments

**Implementation**:
```typescript
session.accessToken = jwt.sign({
  sub: user.id,
  email: user.email,
  "https://hasura.io/jwt/claims": {
    "x-hasura-user-id": user.id,
    "x-hasura-default-role": user.role,
    "x-hasura-allowed-roles": ["admin", "user"]
  }
}, secret, { algorithm: "HS256", expiresIn: "1h" })
```

**Consequences**:
- ✅ Seamless Hasura permission enforcement
- ✅ No session database required
- ✅ Works with Apollo Client auth link
- ⚠️ Token expiration requires refresh mechanism
- ⚠️ Cannot revoke tokens before expiration (1-hour window)
- 📝 Consider implementing refresh tokens for longer sessions

**Alternatives Considered**:
- **Session Cookies**: Store session in database (rejected: adds complexity)
- **Webhook Auth**: Hasura calls endpoint to validate (rejected: slower, failure point)
- **API Keys**: For service-to-service (rejected: not suitable for user auth)

**Related**: ADR-006 (NextAuth), ADR-003 (Hasura), ADR-008 (RBAC)

---

### ADR-008: Role-Based Access Control (RBAC)
**Date**: 2025-07-25  
**Status**: ✅ Accepted  
**Context**: Need to control data access for different user types (admin, users, anonymous).

**Decision**: Implement RBAC using Hasura permissions and JWT role claims.

**Rationale**:
- **Granular Control**: Row-level security in database layer
- **Hasura Native**: Built-in permission system in Hasura Console
- **Type Safety**: Enforced at database level, not application code
- **Separation of Concerns**: Authorization logic in backend, not frontend
- **Scalable**: Easy to add new roles and permissions

**Role Definitions**:
- **Anonymous**: Read public venues, no write access
- **User**: Read/write own venues, read public venues
- **Admin**: Full access to all tables and operations

**Implementation**:
- JWT contains `x-hasura-allowed-roles` and `x-hasura-default-role`
- Hasura checks JWT claims on every GraphQL request
- Frontend uses `useSession()` to conditionally render UI
- Middleware `withAdmin` protects admin routes

**Consequences**:
- ✅ Security enforced at data layer (can't bypass in UI)
- ✅ Easy to audit permissions in Hasura Console
- ✅ No authorization logic scattered across codebase
- ⚠️ Permissions must be managed in Hasura UI (not version-controlled)
- ⚠️ Debugging requires checking both app and Hasura logs

**Alternatives Considered**:
- **Application-Level Checks**: Check role in API routes (rejected: error-prone)
- **Custom Middleware**: Write own auth layer (rejected: reinventing wheel)
- **OAuth Scopes**: Fine-grained scopes (rejected: overkill for current needs)

**Related**: ADR-007 (JWT claims), ADR-018 (Admin middleware)

---

## Frontend Architecture

### ADR-009: Apollo Client for GraphQL
**Date**: 2025-07-25  
**Status**: ✅ Accepted  
**Context**: Need robust GraphQL client with caching, optimistic updates, and TypeScript support.

**Decision**: Use Apollo Client as the primary GraphQL client library.

**Rationale**:
- **Mature Ecosystem**: Battle-tested in production, extensive documentation
- **Intelligent Caching**: Normalized cache reduces over-fetching
- **TypeScript Support**: Excellent with generated types
- **React Integration**: First-class hooks API
- **Developer Tools**: Apollo DevTools for debugging
- **Custom Policies**: Fine-tune cache behavior per query type

**Cache Configuration**:
```typescript
cache: new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        venues: { keyArgs: ["where", "limit", "offset", "order_by"] },
        venues_aggregate: { keyArgs: ["where"] }
      }
    }
  }
})
```

**Consequences**:
- ✅ Automatic request deduplication and caching
- ✅ Works seamlessly with Next.js App Router
- ✅ Strong TypeScript integration via codegen
- ⚠️ Large bundle size (~40KB gzipped)
- ⚠️ Complex API for advanced use cases
- ⚠️ Learning curve for cache management

**Abstraction Layer**:
Created custom `useGraphApi` hook to:
- Abstract Apollo complexity
- Add mobile infinite scroll behavior
- Handle loading/error states consistently
- Extract aggregate counts automatically

**Alternatives Considered**:
- **urql**: Lighter weight (rejected: less mature, smaller ecosystem)
- **React Query + GraphQL Request**: Simple (rejected: limited caching)
- **Relay**: Powerful (rejected: steep learning curve, opinionated)

**Related**: ADR-003 (Hasura), ADR-012 (Custom hooks), ADR-019 (Code generation)

---

### ADR-010: Tailwind CSS v4
**Date**: 2025-07-25  
**Status**: ✅ Accepted  
**Context**: Need utility-first CSS framework with design system and dark mode support.

**Decision**: Adopt Tailwind CSS v4 (early adoption of next-gen version).

**Rationale**:
- **Utility-First**: Rapid prototyping without leaving HTML
- **Design System**: Custom Ukraine-themed color palette (blue/yellow)
- **Dark Mode**: Class-based dark mode with manual toggle
- **JIT Compilation**: Only generates used classes
- **v4 Features**: Native CSS variables, improved performance, new `@theme` syntax
- **Plugin Ecosystem**: Typography, forms, etc.

**Custom Configuration**:
```css
/* globals.css */
@theme {
  --color-ukraine-blue-500: #336fb0;
  --color-ukraine-yellow-500: #f8d848;
  --color-neutral-*: /* 50-950 scale */
}
```

**Consequences**:
- ✅ Consistent design system across all components
- ✅ Fast development with utility classes
- ✅ Automatic purging of unused CSS
- ⚠️ Bleeding edge (v4 in beta during adoption)
- ⚠️ Learning curve for new v4 syntax
- ⚠️ Larger HTML files (inline utility classes)

**Linting**:
- `eslint-plugin-better-tailwindcss` validates class names
- `stylelint-config-tailwindcss` for CSS files
- Custom `mndr-*` prefix for project-specific utilities

**Alternatives Considered**:
- **Tailwind v3**: Stable (rejected: wanted v4 features)
- **CSS Modules**: Scoped styles (rejected: more verbose)
- **Styled Components**: CSS-in-JS (rejected: runtime cost)
- **Vanilla CSS**: No framework (rejected: no design system)

**Related**: ADR-011 (Theme context), ADR-017 (Color palette)

---

### ADR-011: React Context for Global State
**Date**: 2025-07-25  
**Status**: ✅ Accepted  
**Context**: Need client-side global state for theme, auth, dialogs, and notifications.

**Decision**: Use React Context API for global state management (no external state library).

**Rationale**:
- **Built-in**: No additional dependencies
- **Simple**: Easy to understand and maintain
- **Type-Safe**: Works well with TypeScript
- **Sufficient**: App doesn't need complex state management
- **Server-Client Split**: Most state is server-side (GraphQL cache)

**Contexts Implemented**:
1. **AuthContext**: NextAuth session provider wrapper
2. **ThemeContext**: Dark mode toggle, persists to localStorage
3. **DialogContext**: Modal/dialog management
4. **NotificationsContext**: Toast notifications

**Pattern**:
```typescript
const ThemeContext = createContext<ThemeContextType | null>(null);
export const useTheme = () => useContext(ThemeContext)!;
export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState<boolean>(false);
  // ... implementation
  return <ThemeContext.Provider value={{ isDark, toggleTheme }}>
}
```

**Consequences**:
- ✅ Simple, no over-engineering
- ✅ Easy to debug (React DevTools)
- ✅ No external dependencies to maintain
- ⚠️ Potential re-render issues (mitigated with useMemo)
- ⚠️ Manual optimization required for large contexts

**Alternatives Considered**:
- **Redux Toolkit**: Industry standard (rejected: overkill for app size)
- **Zustand**: Lightweight (rejected: unnecessary dependency)
- **Jotai/Recoil**: Atomic state (rejected: unfamiliar API)

**Related**: ADR-010 (Theme toggle), ADR-012 (Custom hooks)

---

### ADR-012: Custom Hook Pattern for Data Fetching
**Date**: 2025-07-25  
**Status**: ✅ Accepted  
**Context**: Need consistent patterns for API calls, forms, and business logic.

**Decision**: Encapsulate complex logic in custom React hooks with clear naming conventions.

**Rationale**:
- **Reusability**: Logic shared across components
- **Testability**: Hooks can be unit tested independently
- **Separation of Concerns**: Components focus on UI, hooks on logic
- **Consistent API**: Predictable return values and error handling
- **Type Safety**: Generic types for flexibility

**Key Hooks Implemented**:

1. **useForm**: Zod-based validation
   ```typescript
   const { values, errors, getFieldProps, validateForm } = useForm({ schema, initialValues });
   ```

2. **useRestApi**: Generic REST client
   ```typescript
   const { data, loading, error, execute } = useRestApi<T>(endpoint, config);
   ```

3. **useGraphApi**: Apollo wrapper with infinite scroll
   ```typescript
   const { data, loading, hasMore, fetchMore } = useGraphApi(query, variables);
   ```

4. **useVenues**: Domain-specific venue operations
   ```typescript
   const { venues, createVenue, updateVenue, deleteVenue } = useVenues(params);
   ```

**Consequences**:
- ✅ Consistent patterns across codebase
- ✅ Easy to test business logic in isolation
- ✅ Reduced code duplication
- ⚠️ Potential over-abstraction (some hooks are thin wrappers)
- ⚠️ Need to maintain hook documentation

**Guidelines**:
- Prefix with `use` (React convention)
- Return object with clear property names
- Include loading, error states
- Use TypeScript generics for flexibility

**Alternatives Considered**:
- **HOCs**: Higher-order components (rejected: hooks are more composable)
- **Render Props**: Function-as-child (rejected: less clean than hooks)
- **Inline Logic**: No abstraction (rejected: code duplication)

**Related**: ADR-009 (Apollo), ADR-016 (TypeScript), ADR-026 (Testing)

---

## Data & Content Management

### ADR-013: MDX for Content
**Date**: 2025-08-15  
**Status**: ✅ Accepted  
**Context**: Need to manage blog posts and static pages with rich formatting and React components.

**Decision**: Use MDX (Markdown with JSX) for content, stored in repository.

**Rationale**:
- **Markdown Familiarity**: Easy to write, human-readable
- **React Integration**: Can embed interactive components
- **Version Control**: Content changes tracked in Git
- **Type Safety**: Frontmatter validated with TypeScript
- **Fast Builds**: Static content compiled at build time
- **i18n Support**: Content organized by locale (`content/{type}/{locale}/`)

**Structure**:
```
content/
├── posts/{locale}/        # Blog posts
├── about/{locale}/        # About pages
└── cv/{locale}/          # CV/Resume
```

**Frontmatter Schema**:
```yaml
---
title: "Post Title"
date: "2025-08-15"
description: "Brief summary"
---
```

**Consequences**:
- ✅ Content co-located with code (easy to update)
- ✅ Rich formatting with React components
- ✅ Type-safe frontmatter
- ⚠️ Not suitable for user-generated content
- ⚠️ Requires rebuild for content updates
- 📝 May migrate to headless CMS if content volume grows

**Implementation**:
- `@mdx-js/mdx` for compilation
- `gray-matter` for frontmatter parsing
- Custom MDX components for styling
- PDF generation for CV using Puppeteer

**Alternatives Considered**:
- **Contentful/Sanity**: Headless CMS (deferred: overkill for current needs)
- **Notion API**: Popular (rejected: vendor lock-in)
- **Plain Markdown**: No JSX (rejected: want component embedding)

**Related**: ADR-002 (Next.js), ADR-014 (Translations)

---

### ADR-014: POEditor for Translations
**Date**: 2025-07-25  
**Status**: ✅ Accepted  
**Context**: Need translation management for English and Ukrainian locales.

**Decision**: Use POEditor as external translation management platform.

**Rationale**:
- **Collaboration**: Non-technical translators can contribute
- **Context**: Can add screenshots and comments for context
- **Version History**: Track translation changes over time
- **Import/Export**: CLI tools for syncing with codebase
- **Quality**: Translation memory, glossary features

**Workflow**:
1. Extract messages: `pnpm export-messages` → `translations/messages.pot`
2. Upload to POEditor for translation
3. Download translated files: `pnpm import-translations`
4. Commit updated JSON files to repo

**Consequences**:
- ✅ Clean separation: developers write keys, translators add content
- ✅ Professional translation workflow
- ⚠️ External dependency (POEditor outage affects workflow)
- ⚠️ Manual sync process (could be automated with CI)
- 📝 Consider GitHub Actions for automatic sync

**Translation Strategy**:
- Use `next-intl` for runtime translation
- Store translations in `translations/{locale}.json`
- Keys use dot notation: `venue.form.name.label`

**Alternatives Considered**:
- **i18next**: Popular library (rejected: next-intl more Next.js-native)
- **Crowdin**: Translation platform (rejected: POEditor simpler)
- **Manual JSON Files**: No platform (rejected: hard to collaborate)

**Related**: ADR-002 (next-intl), ADR-013 (MDX per locale)

---

### ADR-015: Vercel Blob for File Storage
**Date**: 2025-07-25  
**Status**: ✅ Accepted  
**Context**: Need to store user-uploaded images (venue photos, user avatars).

**Decision**: Use Vercel Blob as object storage for files.

**Rationale**:
- **Vercel Integration**: Native SDK, works with Next.js API routes
- **Serverless-Friendly**: No persistent file system needed
- **CDN Included**: Automatic edge caching via Vercel CDN
- **Simple API**: Upload, download, delete operations
- **Security**: Signed URLs for private files

**Configuration**:
```typescript
// next.config.mjs
images: {
  remotePatterns: [
    { hostname: "yiiprxif648vopwe.public.blob.vercel-storage.com" }
  ]
}
```

**Consequences**:
- ✅ Fast uploads and downloads via CDN
- ✅ No server storage management
- ✅ Next.js Image optimization works seamlessly
- ⚠️ Vendor lock-in to Vercel (migration would require code changes)
- ⚠️ Cost scales with storage and bandwidth
- ⚠️ 100MB file size limit

**Alternatives Considered**:
- **AWS S3**: Industry standard (rejected: more complex setup)
- **Cloudinary**: Image-focused (rejected: cost, unnecessary features)
- **Supabase Storage**: Open-source (rejected: another service to manage)

**Related**: ADR-005 (Vercel platform), ADR-025 (Image optimization)

---

## Code Quality & Developer Experience

### ADR-016: Strict TypeScript Configuration
**Date**: 2025-07-25  
**Status**: ✅ Accepted  
**Context**: Need to catch errors early and improve code quality with type safety.

**Decision**: Enable strict TypeScript mode with no JavaScript allowed.

**Rationale**:
- **Type Safety**: Catch bugs at compile time, not runtime
- **Refactoring Confidence**: Types ensure correctness during changes
- **Documentation**: Types serve as inline documentation
- **IDE Support**: Better autocomplete and IntelliSense
- **Team Consistency**: Enforced patterns, less bike-shedding

**Configuration**:
```json
{
  "strict": true,
  "noImplicitAny": true,
  "strictNullChecks": true,
  "noImplicitThis": true,
  "allowJs": false
}
```

**Consequences**:
- ✅ High code quality, fewer runtime errors
- ✅ Excellent IDE experience
- ✅ Self-documenting code
- ⚠️ More upfront work to type everything
- ⚠️ Learning curve for TypeScript beginners
- ⚠️ Some third-party libraries have poor types

**Conventions**:
- Use `interface` for object shapes, `type` for unions/intersections
- Prefer `unknown` over `any` (safer)
- Use `Readonly<T>` for component props
- Export inferred types from Zod schemas

**Alternatives Considered**:
- **Loose TypeScript**: More permissive (rejected: defeats purpose)
- **JSDoc Comments**: Types in comments (rejected: not enforceable)
- **Flow**: Facebook's type system (rejected: TypeScript is standard)

**Related**: ADR-012 (Custom hooks), ADR-019 (Code generation)

---

### ADR-017: Centralized Configuration Pattern
**Date**: 2025-07-26  
**Status**: ✅ Accepted  
**Context**: Need safe way to access environment variables without exposing secrets to client.

**Decision**: Create centralized `public.ts` and `private.ts` config modules.

**Rationale**:
- **Type Safety**: Strongly typed config objects
- **Validation**: Throw errors for missing required variables
- **Security**: Prevents accidental client-side exposure
- **Single Source of Truth**: All config in one place
- **Documentation**: Config structure is self-documenting

**Implementation**:
```typescript
// src/lib/config/public.ts
export const publicConfig = {
  hasura: { endpoint: process.env.NEXT_PUBLIC_HASURA_GRAPHQL_ENDPOINT },
  maps: { apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY }
};

// src/lib/config/private.ts
export const privateConfig = {
  hasura: { adminSecret: getEnvVar("HASURA_ADMIN_SECRET") },
  email: { resendApiKey: getEnvVar("RESEND_API_KEY") }
};
```

**Consequences**:
- ✅ Compile-time errors for missing config
- ✅ No accidental secret exposure
- ✅ Easy to mock in tests
- ⚠️ Must import config instead of using `process.env` directly
- ⚠️ Two files to maintain (public vs private)

**Rule**: **Never** access `process.env` directly in application code

**Alternatives Considered**:
- **Direct env Access**: Use `process.env` everywhere (rejected: error-prone)
- **t3-env**: Type-safe env library (rejected: unnecessary dependency)
- **Separate Files per Service**: Config split by feature (rejected: harder to find)

**Related**: ADR-022 (Validation), ADR-005 (Vercel env management)

---

### ADR-018: Composable Middleware Stack
**Date**: 2025-07-25  
**Status**: ✅ Accepted  
**Context**: Need multiple middleware functions (auth, i18n, security) to run on every request.

**Decision**: Implement composable middleware pattern with `stackMiddlewares` helper.

**Rationale**:
- **Composability**: Chain multiple middleware functions
- **Separation of Concerns**: Each middleware has single responsibility
- **Order Control**: Explicit execution order
- **Testability**: Each middleware can be tested independently
- **Reusability**: Middleware functions can be shared

**Implementation**:
```typescript
// src/middlewares/stackHandler.ts
export function stackMiddlewares(factories: MiddlewareFactory[]): MiddlewareHandler {
  return factories.reduceRight((next, middleware) => middleware(next), initialHandler);
}

// src/middleware.ts
const middlewares = [withAdmin, withRef, withLanguage, withContentSecurityPolicy];
export default stackMiddlewares(middlewares);
```

**Middleware Stack (execution order)**:
1. `withAdmin`: Admin subdomain → `/admin/*` rewrite
2. `withRef`: Referral tracking cookie
3. `withLanguage`: i18n routing (next-intl)
4. `withContentSecurityPolicy`: Security headers

**Consequences**:
- ✅ Clean, maintainable middleware organization
- ✅ Easy to add/remove middleware
- ✅ Clear execution order
- ⚠️ Debugging can be tricky (need to understand order)
- ⚠️ Performance overhead (each middleware adds latency)

**Alternatives Considered**:
- **Single Large Middleware**: All logic in one file (rejected: unmaintainable)
- **Nested Calls**: Manual composition (rejected: hard to read)
- **Third-Party Library**: Use middleware library (rejected: unnecessary)

**Related**: ADR-020 (CSP middleware), ADR-008 (Admin protection)

---

### ADR-019: GraphQL Code Generation
**Date**: 2025-07-25  
**Status**: ✅ Accepted  
**Context**: Need type-safe GraphQL operations without manual type definitions.

**Decision**: Use GraphQL Code Generator to auto-generate TypeScript types from schema and operations.

**Rationale**:
- **Type Safety**: Queries/mutations have correct types
- **Developer Experience**: Autocomplete for fields
- **Consistency**: Types always match schema
- **Refactoring**: Compile errors when schema changes
- **Documentation**: Generated types are self-documenting

**Configuration**:
```yaml
# codegen.yml
schema:
  - "${NEXT_PUBLIC_HASURA_GRAPHQL_ENDPOINT}":
      headers:
        x-hasura-admin-secret: "${HASURA_ADMIN_SECRET}"
documents: "**/*.ts"
generates:
  src/types/graphql.generated.ts:
    plugins:
      - typescript
      - typescript-operations
      - typescript-react-apollo
```

**Workflow**:
1. Write GraphQL query in hook file with `gql` tag
2. Run `./scripts/graphql-codegen.sh`
3. Import generated types: `GetPublicVenuesQuery`
4. Use in component with full type safety

**Consequences**:
- ✅ Compile-time errors for invalid queries
- ✅ Full autocomplete in IDE
- ✅ Types always in sync with schema
- ⚠️ Manual step after schema changes (could automate)
- ⚠️ Large generated file (~4000 lines)
- 📝 Consider git hooks to run codegen automatically

**Alternatives Considered**:
- **Manual Types**: Write types by hand (rejected: error-prone, tedious)
- **GraphQL Zeus**: Alternative codegen (rejected: less mature)
- **No Types**: Use `any` (rejected: defeats purpose of TypeScript)

**Related**: ADR-003 (Hasura), ADR-009 (Apollo), ADR-016 (TypeScript)

---

## Security & Privacy

### ADR-020: Content Security Policy Middleware
**Date**: 2025-07-25  
**Status**: ✅ Accepted  
**Context**: Need to protect against XSS attacks and other injection vulnerabilities.

**Decision**: Implement strict Content Security Policy via Next.js middleware.

**Rationale**:
- **XSS Protection**: Blocks inline scripts and unsafe evaluations
- **Clickjacking Prevention**: `frame-ancestors 'none'`
- **HTTPS Enforcement**: `upgrade-insecure-requests`
- **Nonce-Based**: Allow specific inline scripts with nonces
- **Defense in Depth**: Multiple security headers

**Headers Applied**:
```typescript
"Content-Security-Policy": "default-src 'self'; script-src 'self' 'nonce-{random}' 'strict-dynamic'",
"Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
"X-Frame-Options": "DENY",
"Cross-Origin-Opener-Policy": "same-origin"
```

**Consequences**:
- ✅ Strong protection against XSS
- ✅ Prevents clickjacking
- ✅ Forces HTTPS
- ⚠️ Breaks some third-party scripts (need to allowlist)
- ⚠️ Nonce must be passed to inline scripts
- 📝 Monitor CSP violation reports

**Implementation**:
- Middleware generates random nonce per request
- Nonce passed via `x-nonce` header
- Scripts must include `nonce={nonce}` attribute

**Alternatives Considered**:
- **Report-Only Mode**: CSP without enforcement (rejected: want real protection)
- **Config-Based CSP**: next.config.mjs headers (rejected: less flexible)
- **No CSP**: Rely on other protections (rejected: insufficient)

**Related**: ADR-018 (Middleware stack), ADR-021 (reCAPTCHA)

---

### ADR-021: Google reCAPTCHA v3
**Date**: 2025-07-25  
**Status**: ✅ Accepted  
**Context**: Need to protect forms (contact, venue submission) from spam and bots.

**Decision**: Implement Google reCAPTCHA v3 with server-side validation.

**Rationale**:
- **Invisible**: No user interaction required (v3 advantage over v2)
- **Score-Based**: Risk analysis instead of binary pass/fail
- **Server Validation**: Token validated on backend (secure)
- **Free Tier**: Sufficient for current traffic
- **Easy Integration**: React library available

**Implementation**:
```typescript
// Client: react-google-recaptcha-v3
<GoogleReCaptchaProvider reCaptchaKey={siteKey}>
  const { executeRecaptcha } = useGoogleReCaptcha();
  const token = await executeRecaptcha('submit_venue');
</GoogleReCaptchaProvider>

// Server: validate in API route
const isValid = await validateCaptcha(token, action);
```

**Consequences**:
- ✅ Effective bot prevention without user friction
- ✅ Adjustable score threshold per action
- ⚠️ Dependency on Google service (privacy concern)
- ⚠️ Requires both site key (public) and secret key (private)
- ⚠️ False positives possible (legitimate users flagged)

**Privacy Considerations**:
- Disclosed in privacy policy
- Only used on specific forms
- Fallback for validation failures

**Alternatives Considered**:
- **hCaptcha**: Privacy-focused (rejected: less accurate)
- **Cloudflare Turnstile**: New option (rejected: Vercel integration unclear)
- **Honeypot Fields**: Simple trick (rejected: bots bypass easily)
- **Rate Limiting**: Throttle requests (implemented as additional layer)

**Related**: ADR-020 (Security), ADR-017 (Config management)

---

### ADR-022: Server-Side Environment Variable Validation
**Date**: 2025-07-26  
**Status**: ✅ Accepted  
**Context**: Missing environment variables cause cryptic runtime errors in production.

**Decision**: Validate all required environment variables at startup with helpful error messages.

**Rationale**:
- **Fail Fast**: Catch config errors before requests processed
- **Clear Errors**: Descriptive messages instead of undefined
- **Production Safety**: Ensures all secrets present before deploy
- **Development Flexibility**: Can disable validation with `UNSET_CONFIG=true`

**Implementation**:
```typescript
// src/lib/config/private.ts
function getEnvVar(name: string, required = true): string {
  const value = process.env[name];
  if (required && !value && process.env.UNSET_CONFIG !== "true") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value || "__UNSET__";
}
```

**Consequences**:
- ✅ Immediate feedback on missing config
- ✅ Prevents silent failures
- ✅ Self-documenting (lists all required vars)
- ⚠️ App won't start if config invalid (good in prod, annoying in dev)
- 📝 Consider using Zod for complex validation

**Alternatives Considered**:
- **Runtime Checks**: Validate when accessed (rejected: fails too late)
- **Build-Time Validation**: Check in next.config.mjs (rejected: doesn't catch runtime-only vars)
- **Third-Party Library**: envalid, t3-env (rejected: prefer minimal dependencies)

**Related**: ADR-017 (Config pattern), ADR-005 (Vercel env management)

---

## Performance Optimization

### ADR-023: Mobile Infinite Scroll Pattern
**Date**: 2025-08-01  
**Status**: ✅ Accepted  
**Context**: Mobile users need seamless browsing experience without pagination buttons.

**Decision**: Implement automatic infinite scroll for mobile devices only.

**Rationale**:
- **Mobile UX**: Natural scrolling behavior on touch devices
- **Desktop Control**: Pagination gives more control (preferred on desktop)
- **Performance**: Load more data on-demand, not upfront
- **GraphQL Efficiency**: Uses `offset`-based pagination from Hasura

**Implementation**:
```typescript
// src/hooks/useGraphApi.ts
const isMobile = useMediaQuery({ query: "(max-width: 768px)" });

useEffect(() => {
  if (!isMobile || !hasMore) return;
  
  const shouldFetchMore = variables.offset > lastFetchedOffset;
  if (shouldFetchMore) {
    await fetchMore({
      variables: { ...variables, offset: items.length },
      updateQuery: (prev, { fetchMoreResult }) => ({
        ...prev,
        [dataKey]: [...prev[dataKey], ...fetchMoreResult[dataKey]]
      })
    });
  }
}, [isMobile, variables.offset]);
```

**Consequences**:
- ✅ Smooth mobile experience (no clicks required)
- ✅ Reduces initial load (only first page)
- ✅ Responsive behavior (desktop uses pagination)
- ⚠️ More complex than simple pagination
- ⚠️ Scroll position management needed
- 📝 Consider adding "Load More" button fallback

**Alternatives Considered**:
- **Pagination Everywhere**: Same UI for all devices (rejected: poor mobile UX)
- **Infinite Scroll Everywhere**: No pagination (rejected: desktop users prefer control)
- **Virtual Scrolling**: Render only visible items (deferred: added complexity)

**Related**: ADR-009 (Apollo cache), ADR-012 (Custom hooks)

---

### ADR-024: API Route In-Memory Caching
**Date**: 2025-07-26  
**Status**: ✅ Accepted  
**Context**: External API calls (geo IP, maps) are slow and cost money.

**Decision**: Implement in-memory caching for API routes with TTL.

**Rationale**:
- **Performance**: Fast response for cached data
- **Cost Reduction**: Fewer external API calls
- **Reliability**: Less dependency on external services
- **Simplicity**: No external cache store needed (Redis)

**Example**:
```typescript
// src/app/api/(public)/geo-ip/route.ts
const CACHE_TTL = 60 * 60 * 1000; // 1 hour
const ipCache = new Map<string, { data: LocationData; expiresAt: number }>();

export async function GET(request: NextRequest) {
  const cached = ipCache.get(ip);
  if (cached && cached.expiresAt > Date.now()) {
    return NextResponse.json(cached.data);
  }
  // ... fetch from external API and cache
}
```

**Consequences**:
- ✅ Significant performance improvement (instant response)
- ✅ Reduced API costs
- ✅ Simple implementation (no external dependencies)
- ⚠️ Memory usage grows with cache size (need monitoring)
- ⚠️ Stale data possible (up to TTL duration)
- ⚠️ Cache lost on server restart (serverless limitation)
- 📝 Consider Redis for persistent cache if traffic grows

**Cache Strategies**:
- **Geo IP**: 1-hour TTL (location rarely changes)
- **Google Maps**: Session-based (autocomplete session token)

**Alternatives Considered**:
- **No Caching**: Always fetch (rejected: slow, expensive)
- **Redis/Vercel KV**: External cache (deferred: overkill for current scale)
- **CDN Caching**: Edge cache (rejected: need cache invalidation)

**Related**: ADR-005 (Vercel), ADR-025 (Optimizations)

---

### ADR-025: Dynamic Imports for Heavy Dependencies
**Date**: 2025-08-15  
**Status**: ✅ Accepted  
**Context**: Some dependencies are large and not needed on all pages.

**Decision**: Use dynamic imports and server-side-only packages for heavy dependencies.

**Rationale**:
- **Bundle Size**: Reduce initial JavaScript payload
- **Faster Load**: Critical CSS/JS loads first
- **Server-Only**: Keep heavy packages server-side only
- **Code Splitting**: Automatic with Next.js dynamic imports

**Heavy Dependencies**:
- **Google Maps** (~200KB): Only load on venue pages
- **Puppeteer** (~170MB): Server-only for PDF generation
- **MDX Compiler**: Server-only for content rendering

**Implementation**:
```typescript
// next.config.mjs
serverExternalPackages: ["@sparticuz/chromium", "puppeteer-core"]

// Component with Maps
const MapComponent = dynamic(() => import("./MapComponent"), {
  ssr: false,
  loading: () => <div>Loading map...</div>
});
```

**Consequences**:
- ✅ Faster initial page load
- ✅ Smaller client-side bundles
- ✅ Better Lighthouse scores
- ⚠️ Slight delay when loading dynamic components
- ⚠️ More complex code organization

**Bundle Analysis**:
- Use `@next/bundle-analyzer` to identify candidates
- Target: Keep initial bundle < 200KB gzipped

**Alternatives Considered**:
- **Import Everything**: Simpler code (rejected: poor performance)
- **Separate Packages**: Split into micro-frontends (rejected: premature)
- **CDN Scripts**: Load from CDN (rejected: lose type safety)

**Related**: ADR-002 (Next.js), ADR-023 (Mobile optimization)

---

## Testing Strategy

### ADR-026: Vitest for Unit Tests
**Date**: 2025-07-25  
**Status**: ✅ Accepted  
**Context**: Need fast unit testing framework for hooks and utilities.

**Decision**: Use Vitest with Testing Library for unit tests.

**Rationale**:
- **Vite-Compatible**: Fast, uses Vite's transform pipeline
- **Jest-Like API**: Familiar API for developers
- **TypeScript Native**: No extra config needed
- **Watch Mode**: Fast re-runs on file changes
- **Coverage**: Built-in coverage with v8

**Test Structure**:
```typescript
// src/hooks/useForm.test.ts
describe("useForm", () => {
  it("validates field on blur", () => {
    const { result } = renderHook(() => useForm({ schema }));
    act(() => result.current.handleBlur("name")());
    expect(result.current.errors.name).toBe("Name required");
  });
});
```

**What to Test**:
- ✅ Custom hooks (useForm, useRestApi, useGraphApi)
- ✅ Utility functions (validation, formatting)
- ❌ Simple presentational components (low value)
- ❌ Next.js pages (use E2E instead)

**Consequences**:
- ✅ Fast test execution (< 1s for most tests)
- ✅ Good TypeScript support
- ✅ Easy to mock modules
- ⚠️ Smaller ecosystem than Jest
- ⚠️ Some Jest plugins incompatible

**Configuration**:
```typescript
// vitest.config.ts
test: {
  environment: "jsdom",
  globals: true,
  setupFiles: ["./vitest.setup.ts"]
}
```

**Alternatives Considered**:
- **Jest**: Industry standard (rejected: slower, more config)
- **Testing Library Alone**: No test runner (rejected: need assertions)
- **Mocha/Chai**: Classic combo (rejected: less modern)

**Related**: ADR-027 (E2E tests), ADR-012 (Custom hooks)

---

### ADR-027: Playwright for E2E Tests
**Date**: 2025-07-25  
**Status**: ✅ Accepted  
**Context**: Need to test critical user flows across browsers.

**Decision**: Use Playwright for end-to-end testing.

**Rationale**:
- **Multi-Browser**: Tests on Chromium, Firefox, WebKit
- **Modern API**: Async/await, auto-wait for elements
- **Fast**: Parallel test execution
- **Debugging**: Time-travel debugging, screenshots, videos
- **CI-Ready**: Works in headless mode

**Critical Flows Tested**:
1. Authentication (sign in, sign out)
2. Venue submission (form, validation, success)
3. Contact form (validation, submission)
4. Theme toggle (persistence)

**Example**:
```typescript
// e2e/authentication.spec.ts
test("user can sign in with email", async ({ page }) => {
  await page.goto("/en/auth/signin");
  await page.fill('input[type="email"]', "user@example.com");
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/verify-request/);
});
```

**Consequences**:
- ✅ Catch integration bugs before production
- ✅ Tests across browsers (not just Chrome)
- ✅ Confidence in critical flows
- ⚠️ Slower than unit tests (minutes vs seconds)
- ⚠️ Can be flaky (network, timing issues)
- 📝 Run in CI on every PR

**Configuration**:
```typescript
// playwright.config.ts
projects: [
  { name: "chromium" },
  { name: "firefox" },
  { name: "webkit" },
  { name: "Mobile Chrome" },
  { name: "Mobile Safari" }
]
```

**Alternatives Considered**:
- **Cypress**: Popular (rejected: Playwright more modern, multi-browser)
- **Selenium**: Classic (rejected: slower, more complex)
- **Puppeteer**: Chrome-only (rejected: need cross-browser)

**Related**: ADR-026 (Unit tests), ADR-002 (Next.js)

---

## Changelog

### 2025-10-16
- Added ADR-023 (Mobile infinite scroll)
- Added ADR-024 (API route caching)
- Documented Sentry integration (instrumentation files)

### 2025-09-12
- Added ADR-025 (Dynamic imports)
- Improved bundle optimization

### 2025-08-15
- Added ADR-013 (MDX content)
- Implemented CV page with PDF generation

### 2025-08-01
- Added ADR-014 (POEditor translations)
- Added deployment info tracking

### 2025-07-26
- Added ADR-017 (Centralized config)
- Added ADR-022 (Env validation)

### 2025-07-25
- Initial project setup
- Core ADRs documented (001-012, 016, 018-021, 026-027)

---

**Maintained By**: Andrii Maglovanyi (andrii.maglovanyi@gmail.com)  
**Related Docs**: `PLANNING.md`, `.github/copilot-instructions.md`, `README.md`  
**Format**: Lightweight ADR (Context → Decision → Rationale → Consequences)
