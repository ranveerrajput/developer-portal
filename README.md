# Developer Portal Assignment

React 18 + TypeScript developer portal for external API partners. The portal includes local authentication, OpenAPI-driven docs, live sandbox requests, API key management, usage analytics, status, changelog, request history, environment switching, and light/dark theme support.

## Prerequisites

- Node.js 20+
- npm 10+

## Run Locally

```bash
npm install
npm run dev
```

Then open the local Vite URL.

## Test User

Use the sign-up flow to create any test user. A convenient demo credential is:

- Email: `reviewer@example.com`
- Password: `Password123`

Auth is implemented as a custom local JWT-style session for the take-home environment: passwords are SHA-256 hashed in browser storage, sessions persist in `localStorage`, bearer tokens include expiry, and the auth provider silently refreshes tokens when they are close to expiry. A hosted provider such as Auth0 or Supabase would be the production replacement; this implementation keeps the assignment runnable without external secrets.

## Add A New API

1. Create `src/apis/<api-name>/openapi.json` with a valid OpenAPI 3.x spec.
2. Optionally add `docs.md` and `changelog.json` beside it.
3. Add one entry to `src/apis/api-registry.ts` with `id`, `name`, `version`, `spec`, `baseUrl`, and optional `docsContent`, `changelog`, and `sdks`.

No component code is required. The sidebar, docs renderer, sandbox, changelog, status page, and analytics fixtures read from the registry dynamically.

## Quality Commands

```bash
npm run lint
npm run type-check
npm run build
npm test -- --run
```

## Bonus Features Attempted

- GitHub Actions CI: lint, type-check, build, and tests.
- Multi-environment switcher.
- Request history.
- Rate-limit visualizer placeholder after sandbox requests.
- Dark/light theme toggle.
