# Developer Portal

An extensible API documentation and sandbox portal built with React 18, TypeScript, Vite, React Router, TanStack Query, Zustand, Tailwind CSS, Zod, and Vitest.

The portal is registry driven: API documentation, sandbox endpoints, SDK links, changelog entries, status data, and search all flow from registered API definitions and OpenAPI specs.

## Prerequisites

- Node.js 20+
- npm 10+
- A Supabase project for authentication

## Setup

Install dependencies:

```bash
npm ci
```

Create local environment variables:

```bash
cp .env.example .env
```

Fill in:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_ENABLE_DEMO_AUTH=false
```

For local UI review without a Supabase project, set `VITE_ENABLE_DEMO_AUTH=true`. Demo mode
persists a local browser session and must not be used as production authentication.

Start the app:

```bash
npm run dev
```

Run quality checks:

```bash
npm run lint
npm run type-check
npm test -- --run
npm run build
```

## Authentication

Authentication uses Supabase Auth because it provides production-grade email/password flows, JWT session handling, persisted sessions, and silent token refresh through the official browser SDK.

Required Supabase settings:

- Enable email/password authentication.
- Add the local Vite URL, usually `http://localhost:5173`, to allowed redirect URLs if confirmation redirects are enabled.
- Use the public anon key only. Do not commit service role keys.

To create a test user, open the app, choose `Create account`, and sign up with an email and password of at least eight characters.

Protected routes redirect unauthenticated users to sign in. The sandbox automatically injects the active Supabase access token as a bearer token when a user is signed in.

## Adding New APIs

Add a new API without changing component code:

1. Create a folder under `src/apis/<api-name>/`.
2. Add `openapi.json`, using a valid OpenAPI 3.x document.
3. Optionally add `docs.md` and `changelog.json`.
4. Add one entry to `src/apis/api-registry.ts`.

Example:

```ts
import newApiDocsFile from '@/apis/new-api/docs.md?url';
import newApiChangelog from '@/apis/new-api/changelog.json';
import newApiSpec from '@/apis/new-api/openapi.json';

{
  id: 'new-api',
  name: 'New API',
  version: '1.0.0',
  spec: newApiSpec,
  docsFile: newApiDocsFile,
  changelog: newApiChangelog,
  sdks: [
    {
      lang: 'TypeScript',
      install: 'npm install @example/new-api',
      repo: 'https://github.com/example/new-api',
    },
  ],
  baseUrl: 'https://api.example.test',
}
```

Once registered, the API appears in the sidebar, documentation renderer, sandbox, search, changelog, status, and analytics surfaces.

## Architecture

The app is organized by feature:

- `src/apis`: API registry and per-API assets.
- `src/lib/spec-parser.ts`: OpenAPI 3.x parser that normalizes paths, methods, parameters, request bodies, and responses.
- `src/features/docs`: OpenAPI documentation renderer, markdown quickstarts, SDK resources, and error catalogue.
- `src/features/sandbox`: Request builder, live request execution, auth token injection, and snippet generation.
- `src/features/auth`: Supabase auth provider, protected routes, forms, and `useAuth`.
- `src/features/keys`: API key management demo state.
- `src/features/analytics`, `status`, `changelog`, `search`, `theme`: Portal feature modules.
- `src/store`: Zustand UI/client state.

Server or async state uses TanStack Query. UI state uses Zustand. OpenAPI endpoint data is never hardcoded in JSX.

## CI

GitHub Actions runs on `push` and `pull_request`:

- lint
- type-check
- tests
- build
