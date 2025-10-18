# Мандрій (Mandrii)

A bilingual (English/Ukrainian) web platform combining a personal blog with a comprehensive directory of Ukrainian venues across Europe and the world.

## About

**Mandrii** serves two primary purposes:

1. **Ukrainian Venues Directory**: Discover Ukrainian restaurants, cultural centers, shops, and community spaces worldwide. Browse venues on an interactive map, read reviews, see upcoming events, and connect with the Ukrainian diaspora.

2. **Personal Blog**: Travel stories, experiences, and thoughts shared in both English and Ukrainian.

### Key Features

- 🗺️ **Interactive Map**: Location-based venue discovery with Google Maps integration
- 🔍 **Search & Filter**: Find venues by location, category, and amenities
- ⭐ **Reviews & Ratings**: Community-driven venue evaluation system
- 📅 **Events**: Discover upcoming events at Ukrainian venues
- 🌐 **Bilingual**: Full support for English and Ukrainian languages
- 🔐 **Authentication**: Sign in with Google or magic link email
- 📱 **PWA Support**: Install as a mobile app with crisp home screen icons
- ✍️ **Blog**: Personal travel stories and experiences in MDX format
- 📄 **CV/Resume**: Professional profile section
- 📬 **Contact Form**: Get in touch directly through the website

### Technology Stack

**Frontend**
- [Next.js 15](https://nextjs.org/) with App Router
- [React 19](https://react.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Apollo Client](https://www.apollographql.com/docs/react/) for GraphQL
- [NextAuth v5](https://authjs.dev/) for authentication
- [next-intl](https://next-intl-docs.vercel.app/) for internationalization
- [Google Maps API](https://developers.google.com/maps)

**Backend**
- [Hasura GraphQL Engine](https://hasura.io/) for API and real-time data
- [PostgreSQL](https://www.postgresql.org/) via [Neon](https://neon.tech/)
- [FastAPI](https://fastapi.tiangolo.com/) for background services
- [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) for image storage

**Development**
- [TypeScript](https://www.typescriptlang.org/) (strict mode)
- [Vitest](https://vitest.dev/) for unit testing
- [Playwright](https://playwright.dev/) for end-to-end testing
- [ESLint](https://eslint.org/) & [Prettier](https://prettier.io/) for code quality
- [Sentry](https://sentry.io/) for error tracking
- [pnpm](https://pnpm.io/) workspace monorepo

## Project Structure

```
mandrii/
├── apps/
│   ├── web/          # Next.js 15 frontend application
│   └── services/     # FastAPI Python backend (minimal, future expansion)
├── hasura/           # Database migrations and metadata
├── docs/             # Project documentation
└── tickets/          # Linear ticket tracking and work documentation
```

## Author

**Andrii Maglovanyi**

- Website: [mandrii.com](https://mandrii.com)
- GitHub: [@andrii-maglovanyi](https://github.com/andrii-maglovanyi)
- Email: andrii.maglovanyi@gmail.com
