# TASK-004 — Shows Query Keys and Remote Hooks

## Task

**Title:** Shows Query Keys and Remote Hooks

**Status:** Ready

**Primary feature:** shows

---

# 1. Objective

Implement the TanStack Query layer for TVMaze-backed Shows data.

The task must provide:

- centralized Shows query keys;
- infinite browse query;
- remote search query;
- show-detail query;
- episodes query;
- correct query enablement;
- pagination end handling;
- focused tests where valuable.

Do not implement UI, filtering, debounce hooks, Favorites or episode grouping in this task.

---

# 2. Required Context

Before modifying code, read:

1. `AGENTS.md`
2. relevant sections of `docs/SPEC.md`
3. relevant sections of `docs/ARCHITECTURE.md`
4. relevant decisions in `docs/DECISIONS.md`
5. `src/features/shows/SKILL.md`
6. existing TASK-001 HTTP infrastructure
7. existing TASK-002 domain/DTO/mappers
8. existing TASK-003 Shows API

Especially review:

- Remote State
- Query Key Strategy
- Browse Architecture
- Search Architecture
- Independent Detail Queries
- Retry Strategy
- Loading/Error ownership
- DEC-004
- DEC-012
- DEC-024

---

# 3. Inspect Before Editing

Before writing code:

1. inspect `src/features/shows/queries`;
2. inspect `src/features/shows/api/shows.api.ts`;
3. inspect exported domain types;
4. inspect `src/lib/api/apiError.ts`;
5. inspect the global `QueryClient` defaults;
6. preserve existing naming conventions.

Do not duplicate API behavior in query hooks.

---

# 4. Scope

## In Scope

Implement:

```text
show query-key factory
useShows()
useSearchShows(query)
useShow(id)
useEpisodes(id)
```

Also implement the minimal pagination-end handling required by the TVMaze Show Index semantics.

## Out of Scope

- UI;
- FlashList;
- `fetchNextPage` UI handlers;
- search input state;
- debounce implementation;
- status filtering;
- rating filtering;
- episode grouping;
- Favorites;
- prefetching;
- offline persistence;
- React Native focus/online-manager customization;
- DevTools.

---

# 5. TanStack Query Ownership

All TVMaze-backed asynchronous state belongs to TanStack Query.

This task must not duplicate query results into local React state.

Correct:

```text
Shows API
   ↓
TanStack Query
   ↓
consumer
```

Forbidden default pattern:

```text
TanStack Query
   ↓
useEffect
   ↓
useState copy
```

---

# 6. Expected Files

Likely files:

```text
src/features/shows/queries/show.keys.ts
src/features/shows/queries/useShows.ts
src/features/shows/queries/useSearchShows.ts
src/features/shows/queries/useShow.ts
src/features/shows/queries/useEpisodes.ts
```

Tests may be colocated where they add useful confidence.

Do not create additional abstraction layers without a concrete need.

---

# 7. Query Key Factory

Centralize all Shows query keys.

Use readonly tuples where practical.

Conceptually:

```ts
export const showKeys = {
  all: ['shows'] as const,

  lists: () => [...showKeys.all, 'list'] as const,

  browse: () => [...showKeys.lists(), 'browse'] as const,

  searches: () => [...showKeys.all, 'search'] as const,

  search: (query: string) => [...showKeys.searches(), query] as const,

  details: () => [...showKeys.all, 'detail'] as const,

  detail: (id: number) => [...showKeys.details(), id] as const,

  episodes: (id: number) => [...showKeys.detail(id), 'episodes'] as const,
};
```

Small refinements are acceptable if the hierarchy remains explicit.

Do not construct arbitrary keys directly inside components.

---

# 8. Query-Key Semantics

Keys must uniquely represent cached resources.

Required distinctions:

```text
browse
≠ search

search("girls")
≠ search("office")

detail(1)
≠ detail(2)

episodes(1)
≠ episodes(2)
```

Do not include UI-only state such as:

- status filter;
- rating filter;
- accordion state;

in remote query keys.

Those values do not change the underlying server request.

---

# 9. Infinite Browse Hook

Implement:

```ts
useShows();
```

using:

```ts
useInfiniteQuery(...)
```

The initial page must be:

```text
0
```

The query function must delegate to:

```ts
showsApi.list(pageParam);
```

Do not call the HTTP client directly from the hook.

---

# 10. Infinite Query Page Shape

The hook may use the existing:

```ts
Show[]
```

as the page representation.

A wrapper object should only be introduced if it provides concrete value.

Prefer simplicity.

Conceptually:

```text
data.pages
→ Show[][]
```

Future presentation code will flatten the pages.

Do not flatten them inside a custom cache representation merely for UI convenience.

---

# 11. End-of-Pagination Semantics

TVMaze Show Index signals a page beyond the available catalog with HTTP `404`.

TASK-003 intentionally preserves that error.

The browse query layer must translate **only this pagination-specific condition** into natural pagination completion.

Expected behavior:

```text
showsApi.list(nextPage)
        ↓
ApiError status 404
        ↓
browse query translates it
        ↓
empty page
        ↓
getNextPageParam
        ↓
undefined
```

Do not change the generic HTTP layer.

Do not change `showsApi.list()` to return an empty array for every 404.

The interpretation belongs specifically to browse pagination.

---

# 12. Pagination Error Isolation

Only:

```text
ApiError
AND
status === 404
```

should be treated as natural pagination completion.

Other failures must propagate.

Examples:

```text
network failure
→ error

500
→ error

429
→ error/retry according to Query policy

404 while requesting page beyond catalog
→ pagination completion
```

Do not catch every error and return `[]`.

---

# 13. getNextPageParam

Use the current page information to determine the next page.

Conceptually:

```ts
getNextPageParam: (lastPage, allPages) => {
  if (lastPage.length === 0) {
    return undefined;
  }

  return allPages.length;
};
```

Equivalent implementations are acceptable.

The first page is page `0`, therefore:

```text
pages.length === 1
→ next page 1

pages.length === 2
→ next page 2
```

Do not maintain a separate pagination counter in React state.

---

# 14. Optional Early End Optimization

Do not depend on a fixed TVMaze page-size constant unless the existing implementation has a strong reason to do so.

The correctness mechanism is the documented end-of-pagination behavior.

Avoid premature assumptions such as:

```text
items.length < 250
→ definitely end
```

unless intentionally introduced and documented.

Keep TASK-004 simple and robust.

---

# 15. Remote Search Hook

Implement:

```ts
useSearchShows(query: string)
```

using `useQuery`.

The hook delegates to:

```ts
showsApi.search(query);
```

It must not:

- debounce;
- trim input as UI state management;
- filter by status;
- filter by rating.

---

# 16. Search Enablement

A remote search query should execute only when the supplied query represents non-empty search input.

A small defensive normalization for enablement is acceptable:

```ts
const normalizedQuery = query.trim();
```

Use the normalized value consistently for:

- `queryKey`;
- `queryFn`;
- `enabled`.

Conceptually:

```ts
enabled: normalizedQuery.length > 0;
```

This prevents different cache keys for accidental surrounding whitespace.

Do not implement the 350ms debounce here.

The future caller supplies the debounced value.

---

# 17. Search Query Keys

Search query keys must include the normalized query value.

Example:

```text
['shows', 'search', 'breaking bad']
```

Do not use one constant key for all searches.

Otherwise unrelated search results would share a cache entry.

---

# 18. Show Detail Hook

Implement:

```ts
useShow(id: number)
```

using `useQuery`.

Delegate to:

```ts
showsApi.getById(id);
```

Use:

```ts
showKeys.detail(id);
```

Do not request episodes from this hook.

---

# 19. Episodes Hook

Implement:

```ts
useEpisodes(showId: number)
```

using `useQuery`.

Delegate to:

```ts
showsApi.getEpisodes(showId);
```

Use:

```ts
showKeys.episodes(showId);
```

Do not group episodes by season here.

Raw normalized:

```text
Episode[]
```

is the query result.

Grouping belongs to a later pure transformation.

---

# 20. Independent Detail Resources

Maintain:

```text
useShow(id)
```

and:

```text
useEpisodes(id)
```

as independent queries.

Do not create:

```ts
useShowDetailsWithEpisodes(...)
```

using `Promise.all`.

The architecture requires independent:

- caching;
- loading;
- retry;
- failure states.

---

# 21. Retry Behavior

The project already has conservative global TanStack Query defaults.

Do not reproduce retry logic in every hook without need.

However, clearly permanent `404` resource responses should not be retried unnecessarily when an endpoint-specific override is simple and justified.

For:

```text
show detail 404
episodes endpoint 404
```

it is acceptable to disable retry specifically for `ApiError(404)` while preserving the existing limited retry policy for transient failures.

Do not introduce a complex retry framework in this task.

Do not create uncontrolled retries for `429`.

---

# 22. Browse 404 vs Resource 404

Keep these semantics distinct.

```text
browse next-page 404
→ natural pagination completion
```

```text
show detail 404
→ resource error
```

```text
episodes 404
→ resource error
```

Do not globally reinterpret every `404` as empty data.

---

# 23. Loading and Error Presentation

This task exposes TanStack Query state.

It does not render UI.

Future consumers will use values such as:

```text
isPending
isError
error
isFetchingNextPage
hasNextPage
fetchNextPage
refetch
```

Do not wrap the TanStack result into a large custom object merely to rename all fields.

Add abstraction only when it materially clarifies feature semantics.

---

# 24. Search Data Behavior

Search is not infinite pagination.

Use:

```text
useQuery
```

not:

```text
useInfiniteQuery
```

for `/search/shows`.

Do not merge browse and search caches.

---

# 25. Filters

Do not place:

```text
status
minimumRating
```

into query functions or query keys.

Filters operate later on already acquired domain data.

Changing filters must not create a remote request.

---

# 26. Debounce

Do not create `useDebouncedValue` in this task.

That belongs to the future filtering/debounce utility task.

TASK-004 should work with whatever query string its caller provides.

---

# 27. Query Options Helpers

TanStack Query provides helpers such as `queryOptions` for sharing typed query configuration.

Do not introduce them automatically.

For the current small number of hooks, direct `useQuery` configuration is acceptable.

Introduce query-options factories only if they meaningfully improve reuse or type safety in the current implementation.

---

# 28. TypeScript

Maintain strict TypeScript.

Do not use `any`.

Ensure `pageParam` is inferred/handled as a number.

Use the TanStack Query v5 object API.

Do not use deprecated positional hook signatures.

---

# 29. Testing Strategy

Focus tests on behavior that belongs to this layer.

High-value targets include:

- query-key generation;
- initial browse page is `0`;
- browse delegates page parameters correctly;
- browse `404` becomes pagination completion;
- non-404 browse errors remain errors;
- search is disabled for empty input;
- search query key contains normalized query;
- detail and episodes use distinct cache keys.

Avoid writing brittle tests that merely restate TanStack Query internals.

---

# 30. Hook Test Infrastructure

Do not add a new testing dependency solely for hook tests.

Use the existing React Native Testing Library/Jest stack.

If a hook test needs a provider, create the smallest test wrapper with a fresh `QueryClient`.

Test QueryClient configuration should avoid unnecessary retries when asserting failures, so tests remain deterministic.

Do not modify the production QueryClient merely to simplify tests.

---

# 31. QueryClient Isolation in Tests

Each relevant query test should use a fresh QueryClient.

Do not reuse the production singleton across unit tests.

This prevents:

- cache leakage;
- query state leakage;
- test-order dependence.

---

# 32. API Mocking

Mock the Shows API boundary.

Preferred:

```text
query hook
   ↓
mocked showsApi
```

Do not mock:

```text
TanStack Query internals
```

and do not make real TVMaze requests.

TASK-003 already tests endpoint construction.

TASK-004 tests server-state orchestration.

---

# 33. Expected Files

Likely:

```text
src/features/shows/queries/show.keys.ts
src/features/shows/queries/show.keys.test.ts

src/features/shows/queries/useShows.ts
src/features/shows/queries/useShows.test.tsx

src/features/shows/queries/useSearchShows.ts
src/features/shows/queries/useSearchShows.test.tsx

src/features/shows/queries/useShow.ts
src/features/shows/queries/useEpisodes.ts
```

Do not require a test file for every trivial wrapper if meaningful behavior can be tested cohesively without sacrificing clarity.

---

# 34. Dependencies

Do not install new dependencies.

The existing stack already includes:

- TanStack Query;
- Jest;
- React Native Testing Library.

---

# 35. Prohibited Shortcuts

Do not:

- call `fetch` directly;
- call `request<T>()` directly from hooks;
- recreate endpoint URLs;
- copy query data into local state;
- put filters in remote query keys;
- debounce in API functions;
- merge browse and search;
- merge show detail and episodes;
- interpret every 404 as empty data;
- catch every error and return `[]`;
- store Favorites in TanStack Query;
- add Redux or Zustand;
- implement UI;
- install another query library.

---

# 36. Quality Gates

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

Then rerun all quality gates.

---

# 37. Completion Report

When complete, report:

## Changed

- Shows query-key factory implemented;
- infinite browse hook implemented;
- remote search hook implemented;
- detail hook implemented;
- episodes hook implemented;
- pagination completion behavior implemented.

## Files

List important files created/modified.

## Tests

List query-layer behavior covered.

## Validation

```text
format:check — PASS/FAIL
lint         — PASS/FAIL
typecheck    — PASS/FAIL
test:ci      — PASS/FAIL
```

## Notes

Mention only meaningful deviations or trade-offs.

---

# 38. Definition of Done

TASK-004 is complete when:

- Shows query keys are centralized;
- browse uses `useInfiniteQuery`;
- initial browse page is `0`;
- page parameter is delegated to `showsApi.list`;
- pagination-end `404` is translated at the browse-query boundary;
- other browse errors propagate;
- `getNextPageParam` stops after the empty terminal page;
- search uses `useQuery`;
- empty search does not execute remotely;
- normalized query participates in its cache key;
- show detail uses an independent query;
- episodes use an independent query;
- filters are not part of server state;
- no UI/debounce/Favorites behavior is introduced;
- meaningful tests exist;
- all quality gates pass.
