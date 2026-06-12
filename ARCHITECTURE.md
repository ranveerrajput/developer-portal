# Architecture

## Core Principle

The portal is registry driven and OpenAPI driven. Adding a new API should require only an OpenAPI spec, optional supporting files, and one `API_REGISTRY` entry.

```txt
API_REGISTRY
  -> OpenAPI parser
  -> normalized endpoint model
  -> docs, sandbox, search, analytics, changelog, status
```

## Registry

`src/apis/api-registry.ts` is the source of truth for APIs. It defines:

- API id, name, and version
- OpenAPI spec
- docs file
- changelog entries
- SDK links
- error catalogue entries
- sandbox base URL

The current registry includes `pokeapi` and `stub-payments` to prove multi-API onboarding.

## OpenAPI Rendering

`src/lib/spec-parser.ts` converts OpenAPI 3.x JSON into typed endpoint definitions:

- `EndpointDef`
- `ParameterDef`
- `ResponseDef`
- request body definitions

Documentation and sandbox features consume this normalized model instead of importing API-specific endpoint content.

## State Management

TanStack Query handles async/server-style state:

- parsed documentation loading
- markdown loading
- sandbox request execution
- analytics/status/changelog mock loading

Zustand handles UI/client state:

- theme preference
- selected environment
- command palette open state
- persisted API key records

No data fetching is done with raw `useEffect`.

## Authentication

Supabase Auth provides:

- sign up
- sign in
- sign out
- persisted sessions
- silent refresh
- JWT access token for sandbox auth injection

Protected routes use the auth context and redirect unauthenticated users to sign in.

## Sandbox

The sandbox derives request fields from OpenAPI:

- path params
- query params
- headers
- JSON body editor with CodeMirror

Requests are real `fetch` calls. Responses show status, latency, and formatted JSON. Snippets are generated from the same built request used for execution.

## Extensibility

New API checklist:

1. Add `src/apis/<api-name>/openapi.json`.
2. Optionally add `docs.md` and `changelog.json`.
3. Import those files in `api-registry.ts`.
4. Add one `ApiDefinition`.

No component code should change.

## Known Tradeoffs

- Analytics and status data are deterministic mocks, as allowed by the assignment.
- API key management is client-side demo persistence using Zustand storage.
- The current bundle emits a Vite minified-size warning because Supabase, CodeMirror, and Markdown rendering are in the main bundle. Gzipped output remains below the optional 500 kB threshold.

