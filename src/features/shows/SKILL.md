# Shows Feature — Agent Skill

## Purpose

This skill defines the operating rules for AI-assisted work inside the `shows` feature.

It is derived from the canonical project documentation:

1. `docs/SPEC.md`
2. `docs/ARCHITECTURE.md`
3. `docs/DECISIONS.md`

Those documents have higher authority than this file.

If this skill conflicts with canonical documentation, the canonical documentation wins.

This skill must not be used to redefine product behavior or architecture.

---

# 1. Feature Ownership

The `shows` feature owns the TV show and episode domain backed by TVMaze.

Primary location:

```text
src/features/shows/
```

The feature owns:

- TVMaze show DTOs;
- TVMaze episode DTOs;
- TVMaze endpoint integration;
- DTO-to-domain mapping;
- Show domain models;
- Episode domain models;
- Season presentation/domain models;
- remote show queries;
- remote episode queries;
- browse behavior;
- remote show search behavior;
- show filtering logic;
- episode grouping logic;
- show-specific UI components;
- show list presentation;
- show detail presentation building blocks.

The feature does not own:

- Favorites persistence;
- Favorites reactive state;
- AsyncStorage infrastructure;
- application-wide provider composition;
- routing implementation;
- generic UI primitives;
- generic HTTP infrastructure;
- generic debounce behavior.

---

# 2. Canonical Requirements

Before implementing or modifying behavior, consult the relevant requirement in:

```text
docs/SPEC.md
```

Important Shows requirements include:

- infinite show browsing;
- remote name search;
- status filtering;
- minimum-rating filtering;
- Show Detail;
- episode retrieval;
- episodes grouped by season;
- collapsible season sections;
- loading states;
- error states;
- empty states;
- accessibility;
- rate-limit-aware behavior.

Do not infer new product requirements from this skill.

---

# 3. Expected Structure

The feature is expected to evolve approximately as:

```text
src/features/shows/
├── api/
│   ├── shows.api.ts
│   ├── shows.dto.ts
│   └── shows.mappers.ts
│
├── components/
│   ├── ShowCard.tsx
│   ├── ShowList.tsx
│   ├── ShowListSkeleton.tsx
│   ├── ShowFilters.tsx
│   ├── ShowStatusBadge.tsx
│   ├── ShowRating.tsx
│   └── SeasonAccordion.tsx
│
├── domain/
│   ├── show.ts
│   ├── episode.ts
│   └── season.ts
│
├── queries/
│   ├── show.keys.ts
│   ├── useShows.ts
│   ├── useSearchShows.ts
│   ├── useShow.ts
│   └── useEpisodes.ts
│
├── utils/
│   ├── filterShows.ts
│   └── groupEpisodesBySeason.ts
│
└── SKILL.md
```

Do not create files merely to match this tree.

Create a file only when its responsibility is required by the task.

---

# 4. Dependency Rules

The Shows feature may depend on:

```text
src/lib/
src/components/ui/
src/hooks/
src/theme/
```

where appropriate.

The Shows feature must not depend on Favorites implementation.

Forbidden examples:

```ts
import { useFavorites } from '@/features/favorites/hooks/useFavorites';
```

```ts
import { FavoritesProvider } from '@/features/favorites/providers/FavoritesProvider';
```

The direction is intentionally one-way at the product level:

```text
Shows
  ↓
stable domain contracts may be consumed by Favorites
```

Shows must remain functional without knowing Favorites exists.

---

# 5. API Boundary

TVMaze-specific code belongs inside:

```text
src/features/shows/api/
```

Components and screens must not construct TVMaze URLs directly.

Correct direction:

```text
query
  ↓
showsApi
  ↓
generic HTTP client
  ↓
TVMaze
```

Forbidden:

```tsx
fetch('https://api.tvmaze.com/shows?page=0');
```

inside a component, screen or hook outside the API boundary.

---

# 6. DTO Rules

External TVMaze responses must be modeled as DTOs.

DTOs represent the external API contract.

They must not be treated as application domain objects.

Conceptually:

```ts
type TvMazeShowDto = {
  // remote API representation
};
```

DTOs may contain:

- external naming;
- nested external shapes;
- nullable API values;
- response-specific structures.

DTOs must not reach presentation components.

---

# 7. Mapping Rules

Every TVMaze representation used by the application must cross a mapper boundary.

Required direction:

```text
TVMaze response
      ↓
DTO
      ↓
mapper
      ↓
domain model
```

Browse and search return different external shapes.

These differences must end at the mapper/API boundary.

Do not introduce UI logic such as:

```ts
result.show ?? result;
```

to support both endpoints.

Normalize first.

---

# 8. Domain Rules

Domain types belong inside:

```text
src/features/shows/domain/
```

Domain models should describe application concepts, not TVMaze transport structure.

Conceptual Show model:

```ts
type Show = {
  id: number;
  name: string;
  imageUrl: string | null;
  status: ShowStatus;
  rating: number | null;
  genres: string[];
  summary: string | null;
  premieredAt: string | null;
};
```

List presentation may use a smaller projection such as:

```ts
type ShowListItem = Pick<Show, 'id' | 'name' | 'imageUrl' | 'status' | 'rating' | 'genres'>;
```

Do not duplicate equivalent Show representations without a concrete reason.

---

# 9. Show Status

External status values must be normalized.

The application must safely represent unknown external values.

The domain must not assume TVMaze will forever return only the currently expected statuses.

The user-facing filter supports:

- All;
- Running;
- Ended;
- To Be Determined.

An internal unknown state may exist for defensive mapping.

Do not expose raw external status strings throughout the UI.

---

# 10. Rating

Rating is nullable.

Do not transform a missing rating into zero.

These values have different meanings:

```text
0
→ known numeric value

null
→ rating unavailable
```

Minimum-rating filters must exclude unrated shows when a numeric threshold is active.

When `Any` is active, unrated shows remain eligible.

---

# 11. Query Ownership

TanStack Query owns all TVMaze-backed remote state.

Queries in this feature include:

- browse;
- search;
- show detail;
- episodes.

Do not copy query data into `useState` through `useEffect` unless the task requires truly independent mutable state.

Forbidden default pattern:

```ts
const query = useQuery(...);
const [shows, setShows] = useState([]);

useEffect(() => {
  setShows(query.data);
}, [query.data]);
```

Use query data directly or derive presentation data from it.

---

# 12. Query Keys

Query keys must be centralized in the Shows feature.

Do not create arbitrary query keys inside components.

Conceptual hierarchy:

```text
shows
├── list
│   └── browse
├── search
│   └── {query}
└── detail
    └── {id}
        └── episodes
```

Prefer query-key factories that return readonly tuples.

---

# 13. Browse

Browse mode uses TVMaze paginated shows.

Expected flow:

```text
Home
 ↓
useShows
 ↓
useInfiniteQuery
 ↓
showsApi.list(page)
 ↓
mapped Show[]
 ↓
flattened pages
 ↓
client filters
 ↓
FlashList
```

Pagination must never issue another next-page request when:

- no next page exists;
- a next-page request is already running.

Existing items remain visible during pagination.

---

# 14. Remote Search

Home search is remote.

Expected flow:

```text
input
 ↓
normalize
 ↓
debounce
 ↓
useSearchShows
 ↓
TVMaze search endpoint
 ↓
map response
 ↓
Show[]
```

Whitespace-only search behaves as empty.

An empty normalized search returns the screen to browse mode.

Remote search must not be implemented by filtering already-loaded browse pages.

---

# 15. Search Debounce

Remote Home search uses approximately:

```text
350ms
```

of debounce.

Generic debounce logic belongs outside the Shows feature when reusable:

```text
src/hooks/useDebouncedValue.ts
```

The generic debounce hook must not know about TVMaze or Show.

---

# 16. Filtering

Status and rating filtering are client-side transformations.

Filtering must be:

- pure;
- deterministic;
- independently testable.

Expected conceptual function:

```ts
filterShows(shows, filters);
```

Filtering must not:

- mutate source arrays;
- trigger network requests;
- live inside item render callbacks.

Filter changes operate on the dataset currently available to the screen.

Do not fetch all TVMaze pages in order to simulate globally exhaustive filtering.

---

# 17. Browse vs Search

Browse and remote search are separate acquisition modes.

Do not force them into one generalized API shape before the normalization boundary.

Correct:

```text
browse query ───────┐
                    ├── normalized Show[] → shared presentation
search query ───────┘
```

The distinction should remain visible in query ownership.

---

# 18. Show Detail

Show Detail requires show information and episodes.

These are independent remote resources.

Use independent queries:

```text
useShow(id)

useEpisodes(id)
```

Do not combine them into a single query using `Promise.all`.

Reasons:

- independent cache;
- independent loading;
- independent retry;
- independent failure;
- episodes can fail while show detail remains usable.

---

# 19. Episodes

Episode DTOs must also pass through mapping.

Conceptual domain model:

```ts
type Episode = {
  id: number;
  name: string;
  season: number;
  number: number | null;
  runtime: number | null;
  airdate: string | null;
  summary: string | null;
};
```

Optional remote fields must be handled defensively.

---

# 20. Episode Grouping

Episode grouping must be implemented as a pure function.

Expected:

```ts
groupEpisodesBySeason(episodes);
```

Output concept:

```ts
type Season = {
  number: number;
  episodes: Episode[];
};
```

Rules:

- seasons ascending;
- episodes logically ordered within seasons;
- source input must not be mutated.

Grouping logic must not live directly inside JSX.

---

# 21. Season Accordion

Season sections are independently collapsible.

Initial behavior:

```text
first available season
→ expanded

remaining seasons
→ collapsed
```

Expanded state is local presentation state.

Do not store accordion state in:

- TanStack Query;
- FavoritesProvider;
- AsyncStorage;
- route state.

Season controls must expose expanded/collapsed accessibility state.

---

# 22. Show Components

Domain-aware components remain inside this feature.

Examples:

```text
ShowCard
ShowList
ShowStatusBadge
ShowRating
ShowFilters
SeasonAccordion
```

Do not move a component into shared UI while its API still depends on Show-specific concepts.

---

# 23. Shared UI Boundary

Generic UI belongs in:

```text
src/components/ui/
```

Examples:

```text
Button
Chip
Badge
Skeleton
EmptyState
ErrorState
SearchInput
```

Shows components may compose these primitives.

Shared primitives must not import Show domain types.

---

# 24. Lists

Primary Show collections use FlashList.

Do not replace FlashList with:

- ScrollView + `.map`;
- a non-virtualized list.

Stable item identity must use Show identifiers.

Expensive filtering and flattening should happen before item rendering.

Do not introduce memoization automatically unless needed.

---

# 25. Loading States

Loading behavior is part of the feature contract.

Initial browse:

```text
ShowListSkeleton
```

Pagination:

```text
existing shows
+
footer skeleton items
```

Search:

```text
search-specific loading presentation
```

Detail:

```text
detail skeleton
```

Episodes:

```text
episode-local skeleton
```

Do not replace every loading state with a single application-wide spinner.

---

# 26. Error States

Errors must preserve unaffected content.

Examples:

```text
initial browse error
→ full list error state + retry
```

```text
pagination error
→ existing shows preserved + footer retry
```

```text
episodes error
→ show detail remains visible + episode-specific retry
```

HTTP infrastructure determines that an error occurred.

This feature determines the relevant semantic presentation.

---

# 27. Empty States

Distinguish:

- browse empty;
- search empty;
- filter empty.

Do not use the same copy indiscriminately for all three.

The UI should reflect whether:

- the remote dataset was empty;
- remote search returned no result;
- client filters removed available results.

---

# 28. Images

Show images use `expo-image`.

Handle:

- missing URLs;
- stable image geometry;
- remote loading.

Do not assume every TVMaze show contains an image.

A missing image must not break layout.

---

# 29. Accessibility

Show-specific interactive components must expose meaningful accessibility information.

Examples include:

```text
Show card
→ meaningful show identity
```

```text
Status filters
→ selection state
```

```text
Rating filters
→ selected threshold
```

```text
Season accordion
→ season identity + expanded state
```

Favorite accessibility belongs to the Favorites feature.

---

# 30. TypeScript Rules

Maintain:

- strict mode;
- `noUncheckedIndexedAccess`;
- explicit nullable fields.

Do not bypass external typing using:

```ts
as Show
```

unless a concrete and justified interoperability issue exists.

Avoid `any`.

When uncertain external data exists, handle it at the DTO/mapping boundary.

---

# 31. Runtime Validation

Do not add:

- Zod;
- Valibot;
- another runtime schema package;

without first updating the relevant architectural decision.

The approved approach is:

```text
explicit DTO
+
defensive mapper
+
nullable domain values
+
HTTP validation
```

---

# 32. HTTP Rules

Use the shared HTTP infrastructure.

Do not add Axios.

Do not recreate:

- base URL handling;
- HTTP status parsing;
- generic error normalization;

inside the Shows feature if the generic responsibility already exists in `lib/api`.

The Shows API layer owns endpoint paths and TVMaze-specific parameters.

---

# 33. Performance

Do not optimize by ritual.

Do not automatically introduce:

- `React.memo`;
- `useMemo`;
- `useCallback`.

Use memoization when there is:

- an expensive deterministic calculation;
- a referential-stability requirement;
- an observed or structurally predictable render issue.

FlashList and stable data derivation are the primary list-performance strategies.

---

# 34. Testing Expectations

Every non-trivial pure transformation should receive unit coverage.

Required high-value tests include:

```text
shows mapper
search-result mapper
status normalization
rating filtering
status filtering
combined filtering
episode mapper
groupEpisodesBySeason
```

Important component behavior should use React Native Testing Library.

Tests should assert user-observable behavior rather than implementation details.

---

# 35. Test Placement

Prefer colocated tests.

Examples:

```text
utils/
├── filterShows.ts
└── filterShows.test.ts
```

```text
api/
├── shows.mappers.ts
└── shows.mappers.test.ts
```

```text
components/
├── SeasonAccordion.tsx
└── SeasonAccordion.test.tsx
```

Do not create a large feature-global `__tests__` directory by default.

---

# 36. Quality Gates

Before considering a Shows task complete, run:

```bash
npm run format:check
npm run lint
npm run typecheck
npm run test:ci
```

A task is incomplete while any relevant quality gate fails.

---

# 37. Prohibited Shortcuts

Do not:

- call TVMaze directly from screens;
- expose DTOs to UI;
- merge browse and search response handling into UI conditionals;
- put remote state into FavoritesProvider;
- put local filters into TanStack Query;
- fetch all TVMaze pages for filtering;
- add Zustand or Redux;
- add Axios;
- add Zod without an architecture change;
- place episode grouping directly inside JSX;
- combine detail and episodes into one query;
- introduce a heavy component library;
- replace FlashList with a non-virtualized show list;
- suppress TypeScript errors with broad casts;
- disable lint rules just to make a task pass.

---

# 38. When Architecture Is Unclear

Do not silently invent a new architectural rule.

If a requested implementation conflicts with or is not covered by canonical documentation:

1. identify the ambiguity;
2. stop the architectural decision;
3. surface the conflict;
4. propose the smallest viable option;
5. update canonical documentation before implementing a significant architectural change.

Small implementation details that do not affect architecture may be decided locally.

---

# 39. Agent Task Discipline

For each task:

1. read the relevant canonical documentation;
2. inspect existing feature code before changing it;
3. preserve current boundaries;
4. implement only the requested scope;
5. avoid unrelated refactors;
6. add or update relevant tests;
7. run quality gates;
8. summarize changed behavior and trade-offs.

Do not expand scope merely because another improvement appears possible.

---

# 40. Definition of Done

A Shows task is complete when:

- behavior matches `SPEC.md`;
- architecture matches `ARCHITECTURE.md`;
- decisions remain compatible with `DECISIONS.md`;
- this skill's feature rules are preserved;
- DTO boundaries are respected;
- remote state remains in TanStack Query;
- loading/error/empty states are covered where relevant;
- accessibility is considered;
- tests cover meaningful behavior;
- formatting passes;
- lint passes;
- typecheck passes;
- tests pass.

---

# 41. Core Invariants

The following invariants must remain true:

1. TVMaze DTOs never reach UI components.
2. Browse and search normalize into internal Show models.
3. TanStack Query owns TVMaze-backed state.
4. Home search is remote.
5. Status and rating filters are client-side.
6. Filters do not trigger unnecessary remote requests.
7. Show Detail and Episodes use independent queries.
8. Episode grouping is pure and testable.
9. The first available season is initially expanded.
10. Long Show collections use FlashList.
11. Shows does not depend on Favorites implementation.
12. Shared UI remains domain-agnostic.
13. Missing optional TVMaze data must not crash presentation.
14. Architectural changes must update canonical documentation first.
