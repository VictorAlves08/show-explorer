# TASK-001 — Shared HTTP Infrastructure

## Task

**Title:** Shared HTTP Infrastructure

**Status:** Ready

**Primary feature:** shared infrastructure

---

# 1. Objective

Implement the generic HTTP infrastructure used by feature API modules.

The implementation must provide:

- centralized base URL handling;
- generic JSON requests through native `fetch`;
- HTTP status validation;
- normalized `ApiError`;
- strongly typed generic responses;
- a small reusable API surface for future TVMaze feature integrations.

Do not implement any Show or Episode endpoint in this task.

---

# 2. Required Context

Before modifying code, read:

1. `AGENTS.md`
2. relevant sections of `docs/ARCHITECTURE.md`
3. relevant decisions in `docs/DECISIONS.md`

Especially review:

- HTTP Infrastructure;
- Error Model;
- TVMaze API Boundary;
- Dependency Direction;
- DEC-009 — native `fetch`;
- DEC-010 — response normalization;
- DEC-034 — purpose-driven dependencies.

No feature `SKILL.md` is required as primary context because this task belongs to shared infrastructure.

---

# 3. Inspect Before Editing

Before making changes:

1. inspect `src/lib/api`;
2. inspect existing TypeScript and import conventions;
3. verify whether an HTTP abstraction already exists;
4. preserve the existing `@/*` alias;
5. do not change unrelated project configuration.

---

# 4. Scope

## In Scope

- `ApiError`;
- shared API base URL;
- generic JSON request helper;
- HTTP status handling;
- JSON parsing;
- TypeScript generics;
- tests for the generic HTTP infrastructure.

## Out of Scope

- Shows endpoints;
- Episodes endpoints;
- TVMaze DTOs;
- TVMaze mappers;
- TanStack Query hooks;
- retries owned by TanStack Query;
- UI error presentation;
- authentication;
- request interceptors;
- Axios;
- runtime schema validation;
- caching.

---

# 5. Expected Behavior

The HTTP helper must support usage conceptually equivalent to:

```ts
const data = await request<MyResponse>('/some-path');
```

The helper must:

1. resolve the path against the configured TVMaze base URL;
2. use native `fetch`;
3. accept optional `RequestInit`;
4. throw `ApiError` when the response is not successful;
5. expose the HTTP status on `ApiError`;
6. parse successful JSON responses;
7. return the parsed payload as the requested generic type.

Do not introduce endpoint-specific behavior.

---

# 6. Architecture Constraints

Preserve these rules:

- `src/lib/api` is generic infrastructure;
- `src/lib/api` must not import from `src/features`;
- no Show or Episode types belong in this task;
- infrastructure must not display UI;
- infrastructure must not own retry policy;
- infrastructure must not know about TanStack Query;
- native `fetch` must be used;
- do not introduce Axios;
- no runtime validation library.

---

# 7. Expected Files

Likely files:

```text
src/lib/api/apiError.ts
src/lib/api/httpClient.ts
src/lib/api/httpClient.test.ts
```

A separate constants file may be introduced only if it materially improves clarity.

Do not create unnecessary abstraction layers.

---

# 8. API Base URL

Use a single centralized TVMaze base URL.

Expected value:

```text
https://api.tvmaze.com
```

Do not duplicate this URL across future feature files.

The implementation may keep the base URL private to `httpClient.ts` unless there is a real need to export it.

---

# 9. ApiError

Create a small application-level HTTP error.

Conceptually:

```ts
export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}
```

The final implementation may include small refinements, but keep the error intentionally minimal.

Do not add:

- feature-specific fields;
- UI messages;
- retry counters;
- TanStack Query concepts.

---

# 10. Request Helper

Create a generic request helper.

Conceptual API:

```ts
request<T>(
  path: string,
  init?: RequestInit,
): Promise<T>
```

Requirements:

- path is relative to the configured base URL;
- native `fetch` is used;
- unsuccessful responses throw `ApiError`;
- successful responses parse JSON;
- return value is typed as `T`.

Keep the helper small.

Do not introduce a class-based HTTP client unless clearly required.

---

# 11. Response Handling

Use the standard HTTP success semantics exposed by `Response.ok`.

For unsuccessful responses:

- throw `ApiError`;
- preserve `response.status`.

A generic default message is sufficient.

Do not create product copy at the infrastructure layer.

---

# 12. JSON Parsing

Successful responses should be parsed using:

```ts
response.json();
```

The generic type is a TypeScript contract only.

Do not claim runtime validation is performed.

Do not add unsafe casts throughout the application.

A localized generic conversion at the HTTP boundary is acceptable when necessary to express the `fetch` response contract.

---

# 13. RequestInit

The helper should allow future endpoint modules to pass standard `RequestInit`.

Do not preconfigure:

- authentication headers;
- mutation-specific defaults;
- JSON request bodies;
- interceptors.

The current TVMaze integration is read-oriented and simple.

---

# 14. Error Boundaries

The HTTP layer determines:

```text
request failed
```

Feature/query layers later determine:

```text
what the failure means for the user
```

Do not:

- show alerts;
- show toasts;
- log user-facing errors;
- navigate;
- mutate React state.

---

# 15. Retry Behavior

Do not implement retries in the HTTP helper.

Retry behavior belongs to TanStack Query.

The shared HTTP client must perform one request per invocation.

---

# 16. Testing Requirements

Add focused unit tests.

Required cases:

## Successful response

Verify that:

- `fetch` is called with the expected absolute URL;
- JSON is returned.

## RequestInit forwarding

Verify that provided request options are forwarded.

## HTTP error

Verify that:

- non-success responses throw `ApiError`;
- the error exposes the HTTP status.

## No retry behavior

A failed request should correspond to one fetch invocation from the HTTP helper.

Do not test TanStack Query behavior in this task.

---

# 17. Mocking

Mock the global `fetch` boundary.

Do not make real network requests in unit tests.

Reset mocks between tests.

Tests should verify public behavior rather than private implementation.

---

# 18. TypeScript

Maintain:

- strict TypeScript;
- `noUncheckedIndexedAccess`.

Avoid `any`.

If the Jest `fetch` mock requires a narrow test-only cast, keep it local and explicit rather than weakening production types.

---

# 19. Quality Gates

Before reporting completion, run:

```bash
npm run format:check
npm run lint
npm run typecheck
npm run test:ci
```

If formatting fails:

```bash
npm run format
```

Then rerun the gates.

---

# 20. Dependency Rule

Do not install any dependency for this task.

The existing platform APIs are sufficient.

---

# 21. Prohibited Shortcuts

Do not:

- add Axios;
- add Zod;
- add retries;
- add endpoint-specific methods;
- put TVMaze DTOs in `lib/api`;
- import from `features`;
- add React code;
- add TanStack Query code;
- catch and swallow `ApiError`;
- disable lint/type rules.

---

# 22. Completion Report

When complete, report:

## Changed

- generic HTTP request helper implemented;
- normalized HTTP error implemented.

## Files

List created/modified files.

## Tests

List covered behaviors.

## Validation

```text
format:check — PASS/FAIL
lint         — PASS/FAIL
typecheck    — PASS/FAIL
test:ci      — PASS/FAIL
```

## Notes

Mention only meaningful trade-offs or deviations.

---

# 23. Definition of Done

TASK-001 is complete when:

- the generic HTTP helper exists;
- the TVMaze base URL is centralized;
- non-success responses produce `ApiError`;
- HTTP status is preserved;
- successful JSON responses are returned generically;
- `RequestInit` is supported;
- no feature-specific code is introduced;
- focused tests exist;
- all quality gates pass.
