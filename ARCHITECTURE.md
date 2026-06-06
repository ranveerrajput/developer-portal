# Architecture Notes

The portal is registry-first. `src/apis/api-registry.ts` is the single source of truth for API families, and feature modules consume `ApiDefinition` objects rather than importing endpoint-specific data.

`src/lib/spec-parser.ts` converts OpenAPI path objects into a typed `EndpointDef` model. Docs and sandbox views only render `EndpointDef`, which is what makes adding another API a registry operation instead of a component change.

`src/lib/snippet-generator.ts` owns URL construction, auth header injection, and cURL/fetch/Python generation. Keeping snippet generation outside React makes it easy to test and reuse.

Auth is intentionally self-contained because the reviewer must run the app without provider setup. The production path would be replacing `features/auth/auth-service.ts` with Auth0, Supabase Auth, or Firebase Auth while keeping the provider interface stable.

With more time, I would add OpenAPI `$ref` dereferencing, richer schema rendering, HAR export for request history, and a backend-backed key store.
