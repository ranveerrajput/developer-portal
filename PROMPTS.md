# Prompt Log

AI tools were used during this assignment.

Tool: Codex
Model: GPT-5

## Entry 001

Goal: Analyze the assignment and produce an implementation plan.

Prompt: Read the attached assignment completely. Do not generate code yet. Analyze the assignment and produce architecture plan, folder structure, state management strategy, API registry design, OpenAPI rendering strategy, authentication strategy, sandbox architecture, testing strategy, CI/CD strategy, and commit plan.

Outcome: Adapted into the implementation sequence.

## Entry 002

Goal: Create repository instructions.

Prompt: Create AGENTS.md in the repository root with project rules for strict TypeScript, TanStack Query, Zustand, OpenAPI rendering, registry architecture, states, Conventional Commits, and checks before commits.

Outcome: Used as repository guidance.

## Entry 003

Goal: Initialize project architecture and tooling.

Prompt: Initialize the entire project with React 18, TypeScript, Vite, Tailwind CSS, React Router, TanStack Query, Zustand, Zod, ESLint, Prettier, Vitest, and React Testing Library.

Outcome: Implemented and committed.

## Entry 004

Goal: Implement API registry.

Prompt: Implement extensible API registry architecture with `ApiDefinition`, `SdkLink`, `ChangelogEntry`, PokeAPI, and stub-payments.

Outcome: Implemented and committed.

## Entry 005

Goal: Implement authentication.

Prompt: Implement Supabase authentication with sign up, sign in, sign out, session persistence, silent refresh, protected routes, auth provider, auth context, `useAuth`, and Zod validation.

Outcome: Implemented and committed.

## Entry 006

Goal: Build portal shell.

Prompt: Create application shell with sidebar, navbar, responsive layout, mobile drawer, required navigation items, and dynamic APIs from registry.

Outcome: Implemented and committed.

## Entry 007

Goal: Build OpenAPI parser.

Prompt: Create `lib/spec-parser.ts` to parse paths, methods, parameters, request bodies, and responses, with unit tests.

Outcome: Implemented and committed.

## Entry 008

Goal: Render documentation.

Prompt: Build documentation module rendered dynamically from parsed OpenAPI, including method badges, paths, descriptions, parameters, request bodies, response schemas, and loading/error/empty states.

Outcome: Implemented and committed.

## Entry 009

Goal: Add search.

Prompt: Implement full text search over endpoint names, descriptions, and parameters, with Ctrl+K/Cmd+K command palette.

Outcome: Implemented and committed.

## Entry 010

Goal: Add markdown quickstarts and SDK/error docs.

Prompt: Implement markdown rendering, SDK links section, and error catalogue with filtering.

Outcome: Implemented and committed as separate feature commits.

## Entry 011

Goal: Build sandbox.

Prompt: Build sandbox request builder, execute real requests, inject auth token, display formatted JSON, latency, status badge, and generate cURL, JavaScript fetch, and Python requests snippets with copy buttons.

Outcome: Implemented and committed as separate feature commits.

## Entry 012

Goal: Build management and dashboard features.

Prompt: Implement API key management, analytics dashboard, status page with global incident banner, changelog, and dark mode.

Outcome: Implemented and committed as separate feature commits.

## Entry 013

Goal: Add CI.

Prompt: Create GitHub Actions CI running lint, type-check, test, and build on push and pull_request.

Outcome: Implemented and committed.

## Entry 014

Goal: Add final submission documentation.

Prompt: Create README.md, ARCHITECTURE.md, .env.example, and PROMPTS.md. README must explain setup, auth, adding new APIs, and architecture.

Outcome: This documentation entry was created for submission.
