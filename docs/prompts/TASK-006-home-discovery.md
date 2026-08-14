# TASK-006 — Discovery Logic + Home Screen

## Task

**Title:** Discovery Logic + Home Screen

**Status:** Ready

**Primary feature:** shows + app composition

---

# 1. Objective

Implement the complete Home discovery experience.

The Home screen must support:

- paginated browse mode;
- remote search mode;
- search debounce;
- status filtering;
- minimum-rating filtering;
- combined filters;
- FlashList rendering;
- infinite-scroll pagination;
- initial skeleton loading;
- pagination skeleton loading;
- search loading;
- error handling;
- empty states;
- navigation intent to Show Detail.

Do not implement Favorites in this task.

---

# 2. Required Context

Before modifying code, read:

1. `AGENTS.md`
2. relevant sections of `docs/SPEC.md`
3. relevant sections of `docs/ARCHITECTURE.md`
4. relevant decisions in `docs/DECISIONS.md`
5. `src/features/shows/SKILL.md`

Also inspect the implementation delivered by:

- TASK-002 domain/mappers;
- TASK-003 Shows API;
- TASK-004 query layer;
- TASK-005 shared UI and Show presentation.

Especially review:

- Home;
- Search;
- Filters;
- Infinite Scrolling;
- Loading States;
- Empty States;
- Error States;
- State Independence;
- Browse Architecture;
- Search Architecture;
- Filtering Architecture;
- Local Screen State.

---

# 3. Inspect Before Editing

Before implementation:

1. inspect `src/app/index.tsx`;
2. inspect existing Expo Router structure;
3. inspect Shows query hooks;
4. inspect ShowList and skeleton components;
5. inspect shared SearchInput, Chip, EmptyState and ErrorState;
6. inspect current Show domain/status values;
7. reuse existing components instead of creating parallel UI.

Do not duplicate query logic.

---

# 4. Scope

## In Scope

Implement:

```text
useDebouncedValue
show search normalization
ShowFilters
status filter behavior
rating filter behavior
combined filtering
Home browse/search mode selection
Home screen composition
infinite-scroll handler
loading states
pagination loading
error states
empty states
Show Detail navigation intent
```

## Out of Scope

Do not implement:

- FavoritesProvider;
- FavoriteButton;
- Favorites screen;
- Favorites count;
- episode grouping;
- Show Detail content;
- SeasonAccordion;
- final tab bar/navigation polish;
- global accessibility audit.

TASK-007 owns Favorites.

TASK-008 owns Show Detail/Episodes.

---

# 5. Home State Ownership

Home owns its own discovery state.

Conceptually:

```ts
search;
status;
minimumRating;
```

This state must remain local to Home or a Home-specific reusable hook.

Do not put it in:

- TanStack Query;
- Context;
- FavoritesProvider;
- global storage.

---

# 6. Search Normalization

Normalize search input before using it for remote acquisition.

At minimum:

```text
trim surrounding whitespace
```

Whitespace-only input must behave as empty.

Do not introduce aggressive transformations that alter valid user intent.

Case normalization is not required for the remote request.

---

# 7. Debounce

Create a generic reusable hook:

```text
src/hooks/useDebouncedValue.ts
```

Expected API:

```ts
useDebouncedValue(value, delay);
```

Home remote search uses approximately:

```text
350ms
```

The debounce hook must remain generic.

It must not know about:

- Shows;
- TVMaze;
- filters.

---

# 8. Browse/Search Mode

Home has two mutually exclusive remote acquisition modes.

```text
normalized debounced search empty
→ browse mode

normalized debounced search non-empty
→ search mode
```

Browse uses:

```text
useShows()
```

Search uses:

```text
useSearchShows(debouncedSearch)
```

Do not combine browse and search into one query.

---

# 9. Search Transition Behavior

The user may type while browse data is already available.

During debounce:

- the input updates immediately;
- the previous remote mode may remain visible until the debounced value changes;
- do not issue a request for every keystroke.

Once the debounced value becomes non-empty:

```text
Home → search mode
```

Clearing the input returns Home to browse mode after normalization/debounce behavior resolves.

Avoid unnecessary list resets caused by unrelated filter changes.

---

# 10. Filters

Implement:

```text
status
minimum rating
```

Supported Status options:

```text
All
Running
Ended
To Be Determined
```

Supported Rating options:

```text
Any
6+
7+
8+
9+
```

Filters apply only to the currently available remote dataset.

They do not trigger new remote requests.

---

# 11. Filter Domain Contract

Prefer explicit filter domain types.

Conceptually:

```ts
type StatusFilter = 'all' | 'running' | 'ended' | 'to-be-determined';

type MinimumRating = null | 6 | 7 | 8 | 9;
```

Do not use arbitrary strings throughout the screen.

Place these types in the smallest appropriate Shows-domain or utility boundary.

---

# 12. Filtering Function

Implement a pure filtering function.

Expected direction:

```ts
filterShows(shows, {
  status,
  minimumRating,
});
```

Requirements:

- does not mutate input;
- status `all` accepts all statuses;
- numeric rating threshold requires `rating !== null`;
- `null` minimum rating accepts unrated shows;
- status and rating combine using AND semantics.

Do not put filtering directly inside FlashList item rendering.

---

# 13. Home Search vs Filters

Data flow must remain:

```text
browse/search acquisition
        ↓
available Show[]
        ↓
status filter
        ↓
rating filter
        ↓
visible Show[]
```

Filters do not determine whether browse/search query executes.

Search determines acquisition mode.

---

# 14. ShowFilters Component

Implement a Shows-domain filter presentation component.

Likely location:

```text
src/features/shows/components/ShowFilters.tsx
```

It may compose:

- shared SearchInput;
- shared Chip;
- Text/layout primitives.

It must remain controlled.

Conceptual API:

```tsx
<ShowFilters
  search={search}
  status={status}
  minimumRating={minimumRating}
  onSearchChange={...}
  onStatusChange={...}
  onMinimumRatingChange={...}
/>
```

Do not let ShowFilters own remote queries.

---

# 15. Filter UI

Present filters as mobile-friendly Chips.

Suggested structure:

```text
Search
[ Search shows... ]

Status
[ All ] [ Running ] [ Ended ] [ TBD ]

Rating
[ Any ] [ 6+ ] [ 7+ ] [ 8+ ] [ 9+ ]
```

Use a horizontally scrollable or wrapping layout when necessary.

Do not introduce dropdown dependencies.

---

# 16. Filter Accessibility

Each selectable Chip must expose selected state through the shared Chip primitive.

Labels must be understandable without relying only on color.

Examples:

```text
Status Running
Rating 8 or higher
```

Exact accessible copy may be implemented at the feature level.

---

# 17. Browse Data Flattening

`useShows()` returns infinite-query pages.

Home must flatten the available pages for presentation.

Conceptually:

```ts
const browsedShows = browseQuery.data?.pages.flat() ?? [];
```

Keep this as derived state.

Do not copy it into `useState`.

---

# 18. Search Data

Search mode consumes:

```text
searchQuery.data ?? []
```

Do not combine search results into the infinite-query page cache.

---

# 19. Active Dataset

Derive one active remote dataset:

```text
browse mode
→ flattened browse pages

search mode
→ search results
```

Then apply local filters once.

Avoid duplicated filtering pipelines for browse and search.

---

# 20. Home List

Use the TASK-005 ShowList component.

The Home screen must not create a second FlashList implementation unless ShowList proves insufficient and a narrow refinement is necessary.

The list receives already filtered Show domain items.

---

# 21. Infinite Scroll Handler

Infinite pagination applies only in browse mode.

When the list approaches the end:

```ts
if (mode === 'browse' && browseQuery.hasNextPage && !browseQuery.isFetchingNextPage) {
  browseQuery.fetchNextPage();
}
```

Equivalent safe implementation is acceptable.

Search mode must not call `fetchNextPage`.

---

# 22. onEndReached

Use a reasonable `onEndReachedThreshold`.

Do not over-tune without evidence.

The handler must prevent duplicate concurrent next-page requests.

TanStack Query remains the source of pagination state.

---

# 23. Initial Browse Loading

When browse has no usable data and the initial query is pending:

```text
ShowListSkeleton
```

should be displayed.

Do not use only a full-screen spinner.

The search/filter controls should remain part of the Home composition where appropriate.

---

# 24. Pagination Loading

When:

```text
isFetchingNextPage === true
```

keep existing real items visible.

Append a small number of ShowCardSkeleton items as list footer content.

Do not replace the entire list.

---

# 25. Search Loading

When search mode is active and the remote search is pending:

- communicate loading clearly;
- prefer ShowListSkeleton or equivalent list-shaped loading;
- keep search/filter controls usable.

Do not show browse pagination skeleton as if more pages were being fetched.

---

# 26. Initial Browse Error

When initial browse fails and no browse data is available:

```text
ErrorState
+
retry
```

Use:

```text
browseQuery.refetch
```

or equivalent query retry action.

Do not display raw `ApiError.message` as product copy unless it is intentionally mapped.

---

# 27. Pagination Error

If the next-page request fails while existing shows are already visible:

- preserve existing items;
- show a footer-level error/retry presentation;
- do not replace the list with a full-screen error.

The retry action should retry the pagination request or equivalent appropriate behavior.

Do not reset successful pages.

---

# 28. Search Error

Search failure must:

- preserve discovery controls;
- show search-specific error presentation;
- provide retry.

Do not fall back silently to browse results while the UI still indicates a non-empty search.

---

# 29. Empty Browse

If browse successfully produces no shows:

```text
browse EmptyState
```

This is expected to be rare.

Do not confuse it with filter-empty behavior.

---

# 30. Empty Search

If search succeeds with zero results before local filtering:

```text
search EmptyState
```

The message must communicate that no shows matched the search.

Do not label this as a filter failure.

---

# 31. Filter Empty

If underlying remote data exists but active status/rating filters remove all visible results:

```text
filter-specific EmptyState
```

This state must be distinguishable from:

```text
remote search returned zero results
```

---

# 32. Empty-State Precedence

Determine empty state from the underlying data first, then filtered data.

Conceptually:

```text
remote dataset empty
→ browse/search empty

remote dataset non-empty
AND filtered dataset empty
→ filter empty
```

Avoid using only:

```ts
visibleShows.length === 0;
```

to decide all empty-state copy.

---

# 33. Navigation Intent

Selecting a Show should navigate toward:

```text
/shows/[id]
```

using Expo Router.

TASK-006 may wire the route navigation even though Show Detail content is implemented later.

The target route may remain a minimal placeholder until TASK-008.

Do not implement detail business logic here.

---

# 34. Route Responsibility

The Home route should orchestrate:

```text
queries
+
local discovery state
+
derived visible data
+
presentation components
+
navigation
```

It should not:

- construct API URLs;
- map DTOs;
- perform persistence;
- implement low-level filter algorithms inline.

---

# 35. Home Layout

Use the existing Screen/shared UI foundation.

The screen should have a clear hierarchy:

```text
Home
 ↓
search/filter controls
 ↓
show results
```

Keep the design clean and mobile-focused.

Avoid decorative complexity.

---

# 36. FlashList Header Strategy

The filter controls may either:

- live outside the FlashList;
- or be composed through a stable header;

depending on the existing ShowList API and desired UX.

Prefer the simplest structure that keeps controls accessible while scrolling.

Do not create nested vertical virtualized lists.

---

# 37. No Nested Vertical Scroll Containers

Avoid:

```text
ScrollView
  ↓
FlashList
```

in the same vertical axis.

This can break virtualization and scrolling behavior.

Use a single primary vertical scrolling container.

---

# 38. Search Keyboard Behavior

Use reasonable mobile TextInput behavior.

Potentially include:

```text
returnKeyType="search"
```

where appropriate.

Do not introduce complex keyboard-management dependencies.

---

# 39. No Favorites Yet

Do not add:

```text
FavoriteButton
favorite heart
favorites badge
FavoritesProvider
```

to Home during TASK-006.

The visual card may leave room for later composition if existing layout naturally supports it, but do not implement the feature early.

---

# 40. No Show Detail Data Yet

Do not call:

```text
useShow
useEpisodes
```

from Home.

Home only navigates with Show ID.

---

# 41. Testing — Filtering

Required unit tests include:

## Status

- all returns all;
- running filters correctly;
- ended filters correctly;
- to-be-determined filters correctly.

## Rating

- Any includes rated/unrated;
- 8+ includes rating >= 8;
- 8+ excludes rating < 8;
- numeric threshold excludes null rating.

## Combined

- both filters use AND semantics;
- input array is not mutated.

---

# 42. Testing — Debounce

Test generic debounce behavior if practical with fake timers.

Verify:

- original value is initially available according to chosen hook contract;
- changed value appears only after delay;
- subsequent changes reset timing.

Do not make tests depend on real waiting.

---

# 43. Testing — Home Behavior

High-value component/integration tests include:

- initial browse loading → skeleton;
- browse results → ShowList items;
- typing search eventually switches to remote search;
- filters update visible items without remote request;
- search empty state;
- filter empty state;
- initial error retry;
- show press triggers navigation intent.

Pagination behavior should be tested at the orchestration boundary where practical.

---

# 44. API Mocking in Home Tests

Mock feature query hooks or the API boundary according to the smallest stable test boundary.

Avoid real TVMaze requests.

Do not mock FlashList internals unnecessarily.

Prefer testing user-visible behavior.

---

# 45. Timer Tests

If testing debounce:

```text
jest fake timers
```

are acceptable.

Restore real timers after tests.

Avoid leaking timer state between test files.

---

# 46. TypeScript

Maintain:

```text
strict
noUncheckedIndexedAccess
```

Avoid `any`.

Filter types must be explicit.

Derived datasets should remain typed as internal Show models.

---

# 47. Performance

Do not optimize ritualistically.

Reasonable derived computation using:

```text
useMemo
```

may be justified for:

- flattening many pages;
- filtering large visible datasets;

but use it only where structurally useful.

Do not wrap every handler/component in memoization automatically.

---

# 48. Dependencies

Do not install new dependencies.

Existing stack is sufficient:

- TanStack Query;
- Expo Router;
- FlashList;
- NativeWind;
- React Native;
- Jest/RNTL.

---

# 49. Expected Files

Likely additions:

```text
src/hooks/useDebouncedValue.ts

src/features/shows/domain/showFilters.ts
or equivalent small filter contract

src/features/shows/utils/filterShows.ts

src/features/shows/components/ShowFilters.tsx

src/app/index.tsx
```

Depending on current Router evolution, Home may move to:

```text
src/app/(tabs)/index.tsx
```

only if navigation structure already requires it.

Do not perform TASK-009 navigation polish early.

Tests should be colocated where practical.

---

# 50. Prohibited Shortcuts

Do not:

- duplicate API/query code;
- put filters into query keys;
- fetch all TVMaze pages for filters;
- implement search by filtering browse pages;
- implement debounce in API;
- put Home filters into Context;
- introduce Zustand/Redux;
- create nested vertical ScrollView + FlashList;
- implement Favorites;
- implement Show Detail data;
- install dependencies;
- collapse all empty states into one generic message.

---

# 51. Quality Gates

Before completion:

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

# 52. Completion Report

When complete, report:

## Changed

- discovery filter model implemented;
- debounce implemented;
- ShowFilters implemented;
- Home browse/search orchestration implemented;
- infinite scrolling integrated;
- loading/error/empty states implemented.

## Files

List important created/modified files.

## Tests

List meaningful discovery/Home behaviors covered.

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

# 53. Definition of Done

TASK-006 is complete when:

- Home renders remote browse results;
- browse uses existing infinite-query data;
- pagination works only in browse mode;
- next-page loading preserves existing items;
- Home remote search works;
- search is debounced by approximately 350ms;
- clearing search restores browse mode;
- status filtering works locally;
- rating filtering works locally;
- combined filters work;
- filter changes do not trigger remote requests;
- initial loading uses skeletons;
- pagination loading uses footer skeletons;
- browse/search/filter empty states are distinct;
- initial and isolated pagination/search errors are intentionally handled;
- Show press navigates by ID toward Show Detail;
- no Favorites/Detail implementation is introduced;
- meaningful tests exist;
- all quality gates pass.
