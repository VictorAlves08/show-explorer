# Show Explorer — Technical Architecture

**Status:** Draft
**Version:** 1.0
**Related:** `SPEC.md`, `DECISIONS.md`

## 1. Purpose

This document defines the technical architecture of Show Explorer.

`SPEC.md` defines **what** the product must do.

This document defines **how the system is structured to support those requirements**.

Individual architectural decisions and their trade-offs are recorded in `DECISIONS.md`.

The architecture prioritizes:

- clear ownership of state;
- explicit feature boundaries;
- predictable data flow;
- type safety;
- testability;
- mobile performance;
- resilience;
- low accidental complexity;
- maintainability appropriate to the scope of the project.

---

# 2. Technology Stack

## Application

- Expo
- React Native
- React
- TypeScript
- Expo Router

## Remote state

- TanStack Query

## HTTP

- native `fetch`

## Persistent local state

- AsyncStorage

## Shared reactive favorites state

- feature-scoped React Context through `FavoritesProvider`

## Styling

- NativeWind
- Tailwind CSS
- semantic design tokens

## Images

- expo-image

## Lists

- FlashList

## Testing

- Jest
- jest-expo
- React Native Testing Library

## Quality

- ESLint
- Prettier
- TypeScript strict mode
- GitHub Actions

---

# 3. Architectural Style

Show Explorer uses a **feature-based architecture**.

Code is primarily organized according to business capability rather than technical type.

Primary features:

```text
features/
├── shows/
└── favorites/
```

Cross-cutting infrastructure remains outside features:

```text
components/
hooks/
lib/
providers/
theme/
```

The architecture intentionally avoids introducing layers that do not currently solve a concrete problem.

Examples intentionally not introduced:

- generic repository interfaces;
- dependency injection containers;
- application-wide Redux/Zustand stores;
- generic service layers;
- use-case classes;
- domain event systems.

---

# 4. High-Level Architecture

```text
┌──────────────────────────────────────────────┐
│                    UI                        │
│                                              │
│ Expo Router / Screens / Feature Components  │
└──────────────────────┬───────────────────────┘
                       │
              ┌────────┴────────┐
              │                 │
              ▼                 ▼
        Remote State       Local State
        TanStack Query     FavoritesProvider
              │                 │
              ▼                 ▼
        Feature Queries    Favorites Storage
              │                 │
              ▼                 ▼
          API Layer          AsyncStorage
              │
              ▼
           TVMaze
```

UI components never communicate directly with TVMaze.

Remote DTOs never become presentation models without passing through the feature's mapping boundary.

---

# 5. Source Structure

Target structure:

```text
src/
├── app/
│   ├── _layout.tsx
│   │
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx
│   │   └── favorites.tsx
│   │
│   └── shows/
│       └── [id].tsx
│
├── components/
│   └── ui/
│
├── features/
│   ├── shows/
│   │   ├── api/
│   │   ├── components/
│   │   ├── domain/
│   │   ├── queries/
│   │   ├── utils/
│   │   └── SKILL.md
│   │
│   └── favorites/
│       ├── components/
│       ├── domain/
│       ├── hooks/
│       ├── storage/
│       └── SKILL.md
│
├── hooks/
│
├── lib/
│   ├── api/
│   ├── query/
│   └── storage/
│
├── providers/
│   └── AppProviders.tsx
│
└── theme/
    └── tokens.ts
```

Not every directory must contain code before a real responsibility exists.

Empty placeholder abstractions should not be created merely to satisfy this tree.

---

# 6. Dependency Direction

The intended dependency direction is:

```text
app
 ↓
features
 ↓
shared infrastructure
```

Feature components may depend on shared UI:

```text
features
   ↓
components/ui
```

Features may depend on infrastructure:

```text
features
   ↓
lib
```

Shared infrastructure must never depend on a business feature.

Invalid dependencies:

```text
lib → features            ❌

components/ui → features  ❌
```

Feature-to-feature dependencies should also be avoided by default:

```text
shows → favorites         ❌

favorites → shows         ❌
```

When information crosses feature boundaries, the smallest stable contract should be used rather than importing feature internals arbitrarily.

---

# 7. Application Layer

`src/app` is owned by Expo Router.

Route files are composition boundaries.

They are responsible for:

- routing;
- route parameters;
- screen-level composition;
- connecting feature hooks and components.

Route files must not own:

- HTTP implementation;
- DTO transformation;
- AsyncStorage implementation;
- episode grouping algorithms;
- reusable filtering algorithms.

A route should primarily orchestrate existing capabilities.

---

# 8. Navigation Architecture

Expo Router provides file-based navigation.

Target hierarchy:

```text
Root Stack
│
├── Tabs
│   ├── Home
│   └── Favorites
│
└── Show Detail
```

Physical structure:

```text
app/
├── _layout.tsx
├── (tabs)/
│   ├── _layout.tsx
│   ├── index.tsx
│   └── favorites.tsx
└── shows/
    └── [id].tsx
```

The root stack owns transitions between the tab navigator and Show Detail.

Show Detail receives the show identifier through the route.

The tabs remain the application's primary destinations.

---

# 9. State Ownership

State ownership must remain explicit.

| State                   | Owner                 | Persistent        |
| ----------------------- | --------------------- | ----------------- |
| Browse pages            | TanStack Query        | No                |
| Remote search results   | TanStack Query        | No                |
| Show detail             | TanStack Query        | No                |
| Episodes                | TanStack Query        | No                |
| Favorites               | FavoritesProvider     | Yes, AsyncStorage |
| Home search input       | Home screen/hook      | No                |
| Home status filter      | Home screen/hook      | No                |
| Home rating filter      | Home screen/hook      | No                |
| Favorites search input  | Favorites screen/hook | No                |
| Favorites status filter | Favorites screen/hook | No                |
| Favorites rating filter | Favorites screen/hook | No                |
| Season expanded state   | Season component      | No                |
| Current route           | Expo Router           | Router-managed    |

State should live at the narrowest level that requires it.

State must not become global merely because multiple components exist.

---

# 10. Remote State

TanStack Query owns all TVMaze-backed asynchronous state.

This includes:

- browse pages;
- remote search;
- show detail;
- episodes.

TanStack Query is responsible for:

- request lifecycle;
- loading state;
- error state;
- retry behavior;
- request deduplication;
- caching;
- pagination state.

Screens must not duplicate remote data into local React state.

Avoid:

```text
query result
    ↓
useEffect
    ↓
useState
```

unless a concrete independent state requirement exists.

---

# 11. Query Key Strategy

Query keys are hierarchical and feature-owned.

Conceptual structure:

```ts
showKeys = {
  all: ['shows'],

  lists: () => [...showKeys.all, 'list'],

  browse: () => [...showKeys.lists(), 'browse'],

  searches: () => [...showKeys.all, 'search'],

  search: (query: string) => [...showKeys.searches(), query],

  details: () => [...showKeys.all, 'detail'],

  detail: (id: number) => [...showKeys.details(), id],

  episodes: (id: number) => [...showKeys.detail(id), 'episodes'],
};
```

The exact implementation may use readonly tuple helpers for stronger type inference.

Query keys must not be constructed ad hoc throughout components.

---

# 12. Browse Architecture

Browse uses TanStack Query infinite queries.

Data flow:

```text
Home
 ↓
useShows()
 ↓
useInfiniteQuery
 ↓
showsApi.list(page)
 ↓
TVMaze DTO[]
 ↓
mapper
 ↓
Show[]
 ↓
flatten pages
 ↓
filters
 ↓
FlashList
```

Pagination logic must verify:

- a next page exists;
- another next-page request is not already running.

Existing pages remain available while another page loads.

---

# 13. Search Architecture

Home remote search and Favorites local search intentionally use different data paths.

## Home

```text
input
 ↓
normalized value
 ↓
debounce
 ↓
useSearchShows()
 ↓
TVMaze
 ↓
normalize
 ↓
Show[]
```

## Favorites

```text
input
 ↓
normalized value
 ↓
FavoriteShow[]
 ↓
local matching
 ↓
visible favorites
```

The visual search primitive may be shared.

The data behavior must not be shared artificially.

Home search does not use browse pagination.

Favorites search does not use TVMaze search.

---

# 14. Filtering Architecture

Filtering is a pure client-side transformation.

Conceptual pipeline:

```text
available dataset
      ↓
status filter
      ↓
rating filter
      ↓
visible dataset
```

Filtering functions should be deterministic and side-effect free.

A filter change does not trigger a remote request.

The filtering implementation should be reusable between Home and Favorites where the domain contract permits it.

---

# 15. TVMaze API Boundary

TVMaze-specific implementation belongs to:

```text
features/shows/api/
```

Expected responsibilities:

```text
shows.dto.ts
shows.api.ts
shows.mappers.ts
```

## DTO layer

DTO types describe external TVMaze response structures.

They should represent the remote contract rather than presentation convenience.

## API layer

The API module performs endpoint-specific requests.

Conceptual API:

```ts
showsApi.list(page);

showsApi.search(query);

showsApi.getById(id);

showsApi.getEpisodes(id);
```

## Mapper layer

Mappers translate external representations into internal domain models.

```text
TVMaze DTO
    ↓
mapper
    ↓
domain model
```

Presentation components must not receive TVMaze DTOs.

---

# 16. Response Normalization

TVMaze browse and search return different response shapes.

Browse conceptually returns:

```ts
TvMazeShowDto[];
```

Search conceptually returns:

```ts
type TvMazeSearchResultDto = {
  score: number;
  show: TvMazeShowDto;
};
```

Both must normalize to the same internal show representation:

```text
browse response ──────┐
                      ├──→ Show[]
search response ──────┘
```

The difference between external endpoints ends at the API/mapping boundary.

The UI must not branch based on TVMaze response shape.

---

# 17. Domain Models

Remote DTOs and internal domain models are distinct concepts.

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

List-oriented representation:

```ts
type ShowListItem = Pick<Show, 'id' | 'name' | 'imageUrl' | 'status' | 'rating' | 'genres'>;
```

Status is normalized into an internal representation.

Unknown external status values must not cause unsafe assumptions.

---

# 18. Runtime Validation

The initial implementation does not introduce a runtime schema-validation library.

External data is handled through:

- explicit DTO types;
- defensive mapping;
- nullable optional fields;
- HTTP status validation.

This is an intentional scope decision.

Runtime schema validation may be introduced if API reliability requirements increase.

---

# 19. HTTP Infrastructure

Generic HTTP behavior belongs in:

```text
lib/api/
```

The application uses native `fetch`.

Expected generic responsibilities:

- base URL handling;
- HTTP status validation;
- JSON parsing;
- normalized application error creation.

Conceptual boundary:

```text
request<T>()
```

Feature endpoint knowledge must not leak into generic HTTP infrastructure.

`lib/api` does not know what a Show or Episode is.

---

# 20. Error Model

Remote failures should be normalized into a small application-level error representation.

Conceptually:

```ts
class ApiError extends Error {
  status: number;
}
```

The HTTP layer determines that a request failed.

Feature/UI layers determine how that failure is presented.

The HTTP client must not display alerts, toasts or UI.

---

# 21. Retry Strategy

Global query defaults remain conservative.

Transient failures may retry a limited number of times.

Non-transient responses may bypass retry when appropriate.

Rate-limit responses must never create uncontrolled retry loops.

Endpoint-specific behavior may override global query defaults when justified.

---

# 22. Favorites Architecture

Favorites are **client state**, not remote server state.

They therefore do not belong to TanStack Query.

Architecture:

```text
AsyncStorage
     ↑ ↓
favorites.storage
     ↑ ↓
FavoritesProvider
     ↓
useFavorites()
     ↓
Home / Favorites / Detail / Tab Badge
```

`FavoritesProvider` is a feature-scoped reactive state boundary.

It is not a generic application store.

---

# 23. FavoritesProvider

The provider owns the in-memory representation of the persisted favorites collection.

Conceptual interface:

```ts
type FavoritesContextValue = {
  favorites: FavoriteShow[];
  isHydrated: boolean;

  isFavorite(id: number): boolean;

  addFavorite(show: FavoriteShow): Promise<void>;

  removeFavorite(id: number): Promise<void>;

  toggleFavorite(show: FavoriteShow): Promise<void>;
};
```

The final API may be refined during implementation while preserving these responsibilities.

The provider must:

- hydrate persisted favorites;
- expose reactive favorite state;
- prevent duplicates;
- persist changes;
- keep consumers synchronized.

It must not own:

- remote shows;
- remote search;
- episodes;
- navigation;
- Home filters;
- Favorites filters.

---

# 24. Favorite Snapshot

Favorites persist a presentation-oriented snapshot rather than only a show identifier.

Conceptually:

```ts
type FavoriteShow = {
  id: number;
  name: string;
  imageUrl: string | null;
  status: ShowStatus;
  rating: number | null;
  genres: string[];
};
```

This enables Favorites to:

- render immediately after hydration;
- search locally;
- filter by status;
- filter by rating;
- operate without reconstructing the list through network calls.

The snapshot is not treated as the authoritative current TVMaze record.

---

# 25. Storage Boundary

Generic storage infrastructure belongs in:

```text
lib/storage/
```

Favorites-specific persistence belongs in:

```text
features/favorites/storage/
```

Dependency direction:

```text
AsyncStorage
     ↓
lib/storage
     ↓
favorites.storage
     ↓
FavoritesProvider
```

Generic storage must not know what a favorite show is.

Storage keys must be centralized rather than repeated across components.

Persisted structures should be serializable and versionable if future migration becomes necessary.

---

# 26. Provider Composition

Global provider composition belongs in:

```text
providers/AppProviders.tsx
```

Conceptually:

```text
AppProviders
├── QueryClientProvider
└── FavoritesProvider
```

The route root remains focused on application composition:

```tsx
<AppProviders>
  <Stack />
</AppProviders>
```

A provider should only be added when application-wide placement is necessary.

---

# 27. Episode Architecture

Episode data remains remote state.

Data flow:

```text
Show Detail
     ↓
useEpisodes(showId)
     ↓
TVMaze
     ↓
Episode DTO[]
     ↓
mapper
     ↓
Episode[]
     ↓
groupEpisodesBySeason()
     ↓
Season[]
```

Episode grouping is a pure domain/presentation transformation.

Conceptual model:

```ts
type Season = {
  number: number;
  episodes: Episode[];
};
```

Grouping logic must be independently unit-testable.

---

# 28. Independent Detail Queries

Show information and episodes use independent queries.

```text
Show Detail
   ├── useShow(id)
   └── useEpisodes(id)
```

They must not be artificially combined into a single `Promise.all` query.

Benefits:

- independent cache entries;
- isolated failures;
- granular loading states;
- episodes can fail without removing show information;
- each resource has an independent lifecycle.

---

# 29. Season Accordion State

Expanded/collapsed state is presentation state.

It belongs near the season presentation component.

It does not belong in:

- TanStack Query;
- FavoritesProvider;
- application-wide context;
- persistent storage.

The initial state follows `SPEC.md`:

```text
Season 1 → expanded
Other seasons → collapsed
```

---

# 30. Design System Architecture

Styling follows:

```text
semantic tokens
      ↓
UI primitives
      ↓
feature components
      ↓
screens
```

NativeWind provides utility-based styling.

The application should prefer semantic tokens over arbitrary repeated visual values.

Examples:

```text
background
surface
surface-muted
foreground
foreground-muted
border
primary
success
warning
danger
favorite
```

Feature components should communicate design intent rather than repeatedly selecting unrelated raw color values.

---

# 31. TypeScript Theme Tokens

Not every CSS token must be duplicated in TypeScript.

CSS/NativeWind tokens own visual styling.

TypeScript tokens exist only when values are also required programmatically.

Current examples:

```ts
tokens.spacing;
tokens.radius;
```

This avoids maintaining two competing sources of truth for visual colors.

---

# 32. UI Primitives

Shared UI primitives live under:

```text
components/ui/
```

Potential primitives include:

- Text
- Screen
- Button
- IconButton
- Badge
- Chip
- Skeleton
- Divider
- EmptyState
- ErrorState
- SearchInput

A primitive is created only when a genuine reusable UI responsibility exists.

Do not prebuild an abstract component library before usage exists.

Shared primitives must not contain Show or Favorite business rules.

---

# 33. Feature Components

Domain-aware components remain inside their owning feature.

Examples:

```text
features/shows/components/
├── ShowCard
├── ShowList
├── ShowFilters
├── ShowStatusBadge
├── ShowRating
└── SeasonAccordion
```

Favorites-specific components:

```text
features/favorites/components/
├── FavoriteButton
└── FavoritesBadge
```

A component should move to shared UI only when its API no longer depends on business-domain knowledge.

---

# 34. List Architecture

Primary show collections use FlashList.

Expected uses:

- Home browse;
- Home search results;
- Favorites results.

List responsibilities include:

- stable item keys;
- pagination boundary handling;
- loading footer;
- empty presentation;
- efficient item rendering.

Pagination logic belongs outside individual Show cards.

---

# 35. Skeleton Strategy

Skeletons should approximate final component geometry.

Expected hierarchy:

```text
Skeleton
 ↓
ShowCardSkeleton
 ↓
ShowListSkeleton
```

Additional feature-specific skeletons may include:

```text
ShowDetailSkeleton
EpisodeSkeleton
```

Initial loading and pagination loading are distinct states.

Initial loading may show a skeleton collection.

Pagination loading appends skeleton items after already loaded content.

---

# 36. Image Architecture

Show images use `expo-image`.

Image components must support:

- asynchronous loading;
- missing image fallback;
- stable aspect ratio;
- efficient reuse in long lists.

Feature components decide the appropriate show-image presentation.

The generic design system should not know TVMaze image semantics.

---

# 37. Local Screen State

Search and filter selections belong to each screen.

A reusable hook may encapsulate their behavior:

```text
useShowFilters()
```

Conceptually:

```ts
{
  search;
  status;
  minimumRating;

  setSearch;
  setStatus;
  setMinimumRating;

  reset;
}
```

Home and Favorites instantiate this behavior independently.

The hook does not create global shared filter state.

---

# 38. Debouncing

Debouncing is generic interaction behavior.

A reusable hook may live in:

```text
hooks/useDebouncedValue.ts
```

Home uses the debounced normalized search value for remote search.

Favorites does not require remote-request debouncing, although UI behavior may reuse normalization utilities where useful.

The debounce hook must not know about TVMaze.

---

# 39. Loading / Error / Empty State Ownership

Remote query state originates from TanStack Query.

Presentation belongs to the consuming feature/screen.

Examples:

```text
isPending
   ↓
ShowListSkeleton

isFetchingNextPage
   ↓
pagination skeleton

query error
   ↓
ErrorState
```

Shared UI provides generic presentation primitives.

Features determine the correct semantic message and retry action.

---

# 40. Testing Architecture

Testing is divided by responsibility.

## Unit tests

Primary candidates:

- DTO mappers;
- status normalization;
- show filtering;
- combined filters;
- favorite local search;
- episode grouping;
- serialization behavior where valuable.

## Component tests

Primary candidates:

- ShowCard;
- FavoriteButton;
- ShowFilters;
- SeasonAccordion;
- EmptyState;
- ErrorState.

## Integration-oriented component tests

Primary flows:

- browse loading → results;
- search → results;
- filter → visible results;
- favorite → reactive count;
- Favorites local search;
- Detail → grouped seasons.

The initial implementation does not require an E2E framework.

---

# 41. Test Location

Tests should live near the code they verify when practical.

Example:

```text
utils/
├── filterShows.ts
└── filterShows.test.ts
```

or:

```text
components/
├── ShowCard.tsx
└── ShowCard.test.tsx
```

Large centralized test directories should not become the default.

The infrastructure smoke test may be removed after meaningful application tests exist.

---

# 42. Mocking Strategy

Tests should mock at the smallest useful boundary.

Pure functions require no network mocks.

Component tests should prefer observable behavior over implementation details.

Network-dependent tests should mock the HTTP/API boundary rather than internal TanStack Query implementation details where practical.

Tests should not assert private implementation state.

---

# 43. TypeScript Rules

TypeScript operates in strict mode.

`noUncheckedIndexedAccess` remains enabled.

Avoid:

```ts
as Show;
```

as a mechanism for bypassing unsafe external data.

Prefer:

- explicit DTOs;
- mapper functions;
- discriminated/normalized domain types;
- nullable optional data;
- exhaustive handling where appropriate.

`any` should not be introduced without an explicit interoperability reason.

---

# 44. Import Strategy

The project uses:

```text
@/*
```

as an alias for:

```text
src/*
```

Prefer:

```ts
import { queryClient } from '@/lib/query/queryClient';
```

over deeply nested relative paths such as:

```ts
import { queryClient } from '../../../../lib/query/queryClient';
```

Short local relative imports inside a cohesive directory remain acceptable.

---

# 45. Barrel Files

Barrel files are not required by default.

Do not create `index.ts` files merely to hide directory structure.

They may be introduced when they create a meaningful public feature boundary.

Avoid barrel patterns that:

- obscure ownership;
- introduce circular dependencies;
- export feature internals unintentionally.

---

# 46. Performance Principles

Performance decisions must be intentional rather than ritualistic.

Use:

- FlashList for long show collections;
- stable identifiers;
- stable image geometry;
- pure transformations;
- derived filtering outside item render functions.

Do not automatically apply:

- `React.memo` everywhere;
- `useMemo` everywhere;
- `useCallback` everywhere.

Memoization should solve an observed or structurally predictable rendering cost.

---

# 47. Accessibility Architecture

Accessibility is part of component contracts.

Interactive feature components must expose enough information to construct meaningful labels.

Examples:

```text
FavoriteButton
→ receives enough show identity to expose:
  "Add Breaking Bad to favorites"
```

```text
SeasonAccordion
→ exposes expanded/collapsed state
```

Generic primitives should forward relevant React Native accessibility props rather than blocking them.

---

# 48. Quality Gates

The project defines these local quality commands:

```text
npm run format:check
npm run lint
npm run typecheck
npm run test:ci
```

A feature is not considered complete when these checks fail.

GitHub Actions executes the same quality gates in CI.

---

# 49. Definition of Done

A functional change is considered complete when:

1. behavior matches `SPEC.md`;
2. implementation respects this architecture;
3. relevant decisions remain consistent with `DECISIONS.md`;
4. loading behavior is handled where applicable;
5. error behavior is handled where applicable;
6. empty behavior is handled where applicable;
7. accessibility is considered;
8. relevant tests exist;
9. lint passes;
10. TypeScript passes;
11. tests pass;
12. formatting passes.

---

# 50. AI / Agent Architecture

AI-assisted implementation is allowed by the assignment and is treated as an engineering tool rather than an architectural authority.

Canonical project context is ordered as:

```text
SPEC.md
   ↓
ARCHITECTURE.md
   ↓
DECISIONS.md
   ↓
feature SKILL.md
   ↓
task prompt
   ↓
implementation
```

Agents must not silently redefine requirements or architecture.

Feature skills provide local implementation guidance derived from canonical documentation.

Expected skills:

```text
features/shows/SKILL.md
features/favorites/SKILL.md
```

A skill should describe:

- feature ownership;
- permitted dependencies;
- invariants;
- relevant architecture;
- testing expectations;
- files that commonly belong to the feature;
- behaviors that must not be introduced.

Skills must not contradict canonical documentation.

---

# 51. Architectural Invariants

The following rules are treated as project invariants.

1. TVMaze DTOs never reach presentation components.

2. TanStack Query owns remote TVMaze state.

3. FavoritesProvider owns shared reactive favorite state.

4. AsyncStorage owns favorite persistence.

5. No generic global application state store is introduced.

6. Search and filter state remain screen-local.

7. Home search is remote.

8. Favorites search is local.

9. Status and rating filters are client-side transformations.

10. Filter changes do not cause unnecessary network requests.

11. Route files orchestrate rather than implement infrastructure.

12. Shared UI contains no Show/Favorite business rules.

13. Generic infrastructure does not depend on features.

14. Features do not depend arbitrarily on each other's internals.

15. External response shapes are normalized before presentation.

16. Show and episode queries remain independently cacheable.

17. Episode grouping is a pure transformation.

18. Long show collections use FlashList.

19. Loading, error and empty states are first-class behaviors.

20. New dependencies require a concrete reduction in complexity or risk.

---

# 52. Architecture Change Policy

This document describes the approved architecture baseline.

Implementation may reveal a reason to change an architectural decision.

When that happens:

```text
requirement
   ↓
proposed architectural change
   ↓
trade-off analysis
   ↓
DECISIONS.md update
   ↓
ARCHITECTURE.md update
   ↓
implementation
```

The code should not silently become the new architecture.

Significant divergence must first be documented.

---

# 53. Dependency Policy

A new dependency should be introduced only when at least one of the following is true:

- it materially reduces implementation complexity;
- it provides difficult-to-reproduce correctness guarantees;
- it provides a meaningful performance benefit;
- it is the ecosystem-standard solution for an existing requirement.

Adding a dependency solely to demonstrate familiarity with a library is not sufficient justification.

---

# 54. Current Intentional Exclusions

The architecture intentionally does not include:

- Redux;
- Zustand;
- generic AppContext state;
- Axios;
- Zod or another runtime schema library;
- dependency injection framework;
- generic repository abstraction;
- SQLite;
- local relational database;
- React Hook Form;
- Storybook;
- initial E2E framework;
- generic accordion dependency;
- heavy component library.

These exclusions are scope decisions, not claims that the technologies are inappropriate in general.

Their rationale is recorded in `DECISIONS.md`.

---

# 55. Architecture Summary

The system can be summarized as:

```text
Expo Router
     ↓
Screen composition
     ↓
Feature boundaries
     │
     ├──────── Remote ────────┐
     │                        ↓
     │                  TanStack Query
     │                        ↓
     │                    API layer
     │                        ↓
     │                      DTO
     │                        ↓
     │                     Mapper
     │                        ↓
     │                     Domain
     │                        ↓
     │                       UI
     │
     └──────── Local ─────────┐
                              ↓
                      FavoritesProvider
                              ↓
                      Favorites storage
                              ↓
                         AsyncStorage
```

The architecture favors explicit ownership and simple boundaries over abstraction depth.

Complexity should be introduced only when required by product behavior, correctness, performance or maintainability.
