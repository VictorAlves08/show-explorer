# TASK-003 — Shows API Integration

## Task

**Title:** Shows API Integration

**Status:** Ready

**Primary feature:** shows

---

# 1. Objective

Implement the TVMaze API integration for the Shows feature using the shared HTTP infrastructure created in TASK-001 and the DTO/mapping contracts created in TASK-002.

The API layer must expose feature-level operations for:

- paginated show browsing;
- show search;
- show detail;
- show episodes.

The API layer must return internal domain models, not raw TVMaze DTOs.

Do not implement TanStack Query hooks in this task.

---

# 2. Required Context

Before modifying code, read:

1. `AGENTS.md`
2. relevant sections of `docs/SPEC.md`
3. relevant sections of `docs/ARCHITECTURE.md`
4. relevant decisions in `docs/DECISIONS.md`
5. `src/features/shows/SKILL.md`
6. existing TASK-001 HTTP infrastructure
7. existing TASK-002 domain, DTO and mapper implementation

Especially review:

- TVMaze API Boundary;
- Response Normalization;
- Browse Architecture;
- Search Architecture;
- Independent Detail Queries;
- HTTP Infrastructure;
- DEC-009;
- DEC-010;
- DEC-012;
- DEC-024.

---

# 3. Inspect Before Editing

Before changing code:

1. inspect `src/lib/api`;
2. inspect `src/features/shows/api`;
3. inspect existing DTO names;
4. inspect mapper names;
5. inspect domain contracts;
6. reuse existing implementation rather than creating parallel types or helpers.

Do not rename working TASK-001 or TASK-002 code unless a real integration issue requires it.

---

# 4. Scope

## In Scope

Implement API operations equivalent to:

```ts
showsApi.list(page);

showsApi.search(query);

showsApi.getById(id);

showsApi.getEpisodes(id);
```

The exact exported shape may be object-based or named functions, provided it remains small and cohesive.

Also include focused unit tests for:

- endpoint construction;
- DTO-to-domain mapping delegation;
- query encoding;
- page parameter behavior.

## Out of Scope

- TanStack Query;
- `useInfiniteQuery`;
- query keys;
- retry policy;
- pagination UI;
- search debounce;
- client-side status/rating filtering;
- episode grouping;
- Favorites;
- UI components;
- real network integration tests.

---

# 5. Official TVMaze Endpoints

Use the following endpoints.

## Browse

```text
GET /shows?page=:num
```

TVMaze uses zero-based page numbers.

The endpoint returns a list of Show DTOs.

Do not invent client-side pagination parameters such as `limit` or `offset`.

---

## Search

```text
GET /search/shows?q=:query
```

The endpoint returns search-result wrappers containing:

```ts
{
  score;
  show;
}
```

The API layer must normalize this result before returning it to consumers.

---

## Show Detail

```text
GET /shows/:id
```

Returns one Show DTO.

---

## Show Episodes

```text
GET /shows/:id/episodes
```

Returns a complete list of episodes for the selected show.

Do not request specials in this task.

Use the endpoint's default behavior.

---

# 6. Expected Public API

A cohesive implementation may look conceptually like:

```ts
export const showsApi = {
  list,
  search,
  getById,
  getEpisodes,
};
```

or equivalent named functions.

Do not build a class-based API client unless the current repository architecture clearly requires it.

---

# 7. Browse API

Implement a function conceptually equivalent to:

```ts
async function list(page: number): Promise<Show[]>;
```

Expected flow:

```text
page
 ↓
/shows?page={page}
 ↓
request<TvMazeShowDto[]>
 ↓
mapShowDto
 ↓
Show[]
```

Requirements:

- page is passed explicitly;
- do not maintain pagination state inside the API layer;
- do not mutate response data;
- return normalized Show domain objects.

---

# 8. Search API

Implement conceptually:

```ts
async function search(query: string): Promise<Show[]>;
```

Expected flow:

```text
query
 ↓
encode URL parameter
 ↓
/search/shows?q=...
 ↓
request<TvMazeSearchResultDto[]>
 ↓
mapSearchResultDto
 ↓
Show[]
```

The query value must be URL encoded correctly.

Prefer platform URL utilities or `URLSearchParams` over manual string replacement.

Do not perform debounce here.

Do not perform local filtering here.

Do not preserve TVMaze `score` in the domain unless the existing canonical domain explicitly requires it.

---

# 9. Show Detail API

Implement conceptually:

```ts
async function getById(id: number): Promise<Show>;
```

Expected flow:

```text
id
 ↓
/shows/{id}
 ↓
request<TvMazeShowDto>
 ↓
mapShowDto
 ↓
Show
```

No episodes should be embedded in this request.

Show detail and episodes remain independent resources.

---

# 10. Episodes API

Implement conceptually:

```ts
async function getEpisodes(showId: number): Promise<Episode[]>;
```

Expected flow:

```text
showId
 ↓
/shows/{showId}/episodes
 ↓
request<TvMazeEpisodeDto[]>
 ↓
mapEpisodeDto
 ↓
Episode[]
```

Do not group episodes by season in this layer.

Do not request:

```text
?specials=1
```

unless canonical requirements are changed.

---

# 11. Mapping Boundary

The API layer is responsible for ensuring consumers receive internal domain models.

Correct:

```text
request DTO
   ↓
map
   ↓
return domain
```

Do not expose:

```ts
Promise<TvMazeShowDto[]>;
```

from the public Shows API.

Expected external contract:

```ts
Promise<Show[]>;
```

and:

```ts
Promise<Episode[]>;
```

---

# 12. Shared HTTP Infrastructure

Use the existing:

```text
src/lib/api/httpClient.ts
```

Do not call `fetch` directly inside the Shows API layer.

Correct:

```ts
request<TvMazeShowDto[]>(...)
```

Forbidden:

```ts
fetch('https://api.tvmaze.com/...');
```

inside `shows.api.ts`.

The base URL already belongs to shared HTTP infrastructure.

Do not duplicate it.

---

# 13. URL Construction

Pass relative paths to the shared HTTP client.

Examples:

```text
/shows?page=0
/search/shows?q=girls
/shows/1
/shows/1/episodes
```

Use a reliable mechanism to construct query parameters.

Search terms may contain:

- spaces;
- punctuation;
- unicode characters.

Do not assume a simple ASCII word.

---

# 14. Input Responsibilities

The API layer accepts already meaningful parameters.

It does not own UI normalization behavior.

For example:

```text
search input trim/debounce
→ caller/query layer responsibility
```

The API layer should still encode whatever query string it receives correctly.

Do not add 350ms debounce here.

---

# 15. Pagination Semantics

The Show Index endpoint is zero-based.

The API layer must not infer or fetch the next page automatically.

It receives a page number and executes exactly one request.

Future TanStack Query code will own:

- initial page;
- next page;
- end detection;
- request lifecycle.

---

# 16. End-of-Pagination Behavior

TVMaze indicates the end of the Show Index by returning HTTP 404 for a page beyond available data.

Do not swallow or convert this behavior inside the generic API layer during this task.

Allow the existing `ApiError` semantics to remain visible to the future query layer.

The pagination/query task will decide how 404 should be interpreted for `hasNextPage`.

Do not return an empty array merely because the response is 404.

---

# 17. Errors

Do not catch `ApiError` only to wrap it in another generic error.

Unless additional context materially improves behavior, allow shared HTTP errors to propagate to the query layer.

Do not:

- show UI;
- log user-facing messages;
- retry;
- convert errors to empty results.

---

# 18. Tests

Mock the shared request boundary or `fetch` boundary according to the smallest stable unit boundary already established in the codebase.

Preferred test focus:

```text
showsApi
→ request called with correct relative path
→ mapper semantics reflected in returned value
```

Do not make real TVMaze requests.

---

# 19. Required Test Cases

## Browse

Verify:

```text
list(0)
→ /shows?page=0
```

and another page such as:

```text
list(2)
→ /shows?page=2
```

Verify DTO results return normalized Shows.

---

## Search

Verify a simple query.

Also verify a query requiring encoding, for example conceptually:

```text
game of thrones
```

The final request must represent the query safely.

Do not assert a brittle implementation detail if URL semantics are equivalent.

---

## Detail

Verify:

```text
getById(42)
→ /shows/42
```

and returns normalized Show.

---

## Episodes

Verify:

```text
getEpisodes(42)
→ /shows/42/episodes
```

and returns normalized Episodes.

Verify no specials parameter is added.

---

# 20. Mapper Reuse

Tests should give confidence that API methods delegate to the established mapper behavior.

Do not duplicate mapping logic in `shows.api.ts` just to make tests easier.

Expected implementation should remain approximately:

```ts
const dtos = await request<TvMazeShowDto[]>(...);

return dtos.map(mapShowDto);
```

and analogous flows.

---

# 21. No New Domain Models

Do not create parallel representations such as:

```text
ApiShow
RemoteShow
SearchShow
BrowseShow
```

unless TASK-002 already established them for a concrete reason.

The purpose of normalization is to converge into the approved domain model.

---

# 22. TypeScript

Maintain strict TypeScript.

Do not use:

```ts
any;
```

Do not use broad casts to bypass existing DTO types.

Reuse the DTO and mapper exports established in TASK-002.

---

# 23. Dependencies

Do not install any new dependency.

The existing:

- shared HTTP helper;
- platform URL utilities;
- TypeScript;

are sufficient.

---

# 24. Expected Files

Primary expected file:

```text
src/features/shows/api/shows.api.ts
```

Likely test:

```text
src/features/shows/api/shows.api.test.ts
```

TASK-002 DTO and mapper files may only be changed if an actual integration defect is discovered.

Do not refactor them merely for style.

---

# 25. Prohibited Shortcuts

Do not:

- call `fetch` directly;
- duplicate TVMaze base URL;
- return DTOs publicly;
- implement TanStack Query;
- implement retries;
- implement debounce;
- implement client filters;
- implement episode grouping;
- catch 404 and silently return `[]`;
- request specials;
- embed episodes into Show Detail;
- add Axios;
- add Zod;
- modify Favorites;
- add UI.

---

# 26. Quality Gates

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

Then rerun all gates.

---

# 27. Completion Report

When complete, report:

## Changed

- browse API implemented;
- remote search API implemented;
- show detail API implemented;
- episodes API implemented;
- results normalized into domain models.

## Files

List created/modified files.

## Tests

List endpoint and mapping behaviors tested.

## Validation

```text
format:check — PASS/FAIL
lint         — PASS/FAIL
typecheck    — PASS/FAIL
test:ci      — PASS/FAIL
```

## Notes

Mention meaningful deviation only.

---

# 28. Definition of Done

TASK-003 is complete when:

- `list(page)` exists;
- `search(query)` exists;
- `getById(id)` exists;
- `getEpisodes(showId)` exists;
- all methods use the shared HTTP helper;
- TVMaze base URL is not duplicated;
- relative endpoint paths are correct;
- search parameters are encoded safely;
- DTOs are normalized before being returned;
- no query/UI/filter/grouping behavior is introduced;
- focused unit tests exist;
- all quality gates pass.
