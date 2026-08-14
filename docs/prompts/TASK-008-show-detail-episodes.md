# TASK-008 — Show Detail + Episodes

## Task

**Title:** Show Detail + Episodes

**Status:** Ready

**Primary feature:** shows + app composition

---

# 1. Objective

Implement the complete Show Detail experience, including:

- Show Detail route composition;
- show information presentation;
- independent show-detail query consumption;
- independent episodes query consumption;
- episode grouping by season;
- collapsible season sections;
- show-level loading state;
- episodes-level loading state;
- show-level error state;
- episodes-level isolated error state;
- favorite action integration;
- navigation back behavior through Expo Router.

Do not merge Show and Episodes into a single remote resource.

---

# 2. Required Context

Before modifying code, read:

1. `AGENTS.md`
2. relevant sections of `docs/SPEC.md`
3. relevant sections of `docs/ARCHITECTURE.md`
4. relevant decisions in `docs/DECISIONS.md`
5. `src/features/shows/SKILL.md`
6. `src/features/favorites/SKILL.md` only for FavoriteButton integration

Also inspect implementation produced by:

- TASK-002 domain and mappers;
- TASK-003 Shows API;
- TASK-004 query layer;
- TASK-005 UI/Show presentation;
- TASK-007 FavoriteButton.

Especially review:

- Show Detail;
- Episodes;
- Group Episodes by Season;
- Collapsible Seasons;
- Independent Detail Queries;
- Episode Architecture;
- Loading/Error ownership;
- DEC-022;
- DEC-023;
- DEC-024;
- DEC-025.

---

# 3. Inspect Before Editing

Before implementation:

1. inspect the existing `/shows/[id]` route or placeholder;
2. inspect `useShow`;
3. inspect `useEpisodes`;
4. inspect Episode and Season domain contracts;
5. inspect shared UI primitives;
6. inspect FavoriteButton API;
7. inspect existing Show presentation conventions;
8. preserve existing route and styling conventions.

Do not recreate query/API/domain layers.

---

# 4. Scope

## In Scope

Implement:

```text
Show Detail route
Show Detail presentation components
Show metadata presentation
FavoriteButton integration
episode grouping
SeasonAccordion
episode row/list presentation
show loading state
show error state
episodes loading state
episodes error state
empty episodes state
```

## Out of Scope

Do not implement:

- new API endpoints;
- new query architecture;
- Favorites persistence changes;
- Home behavior;
- Favorites screen behavior;
- global navigation polish;
- global accessibility audit;
- E2E tests;
- external HTML rendering dependency;
- episode specials configuration changes.

---

# 5. Route

Use the existing Expo Router route:

```text
src/app/shows/[id].tsx
```

or the equivalent route already established by the repository.

The route must:

1. read the Show ID from route params;
2. validate/normalize it to a numeric identifier;
3. consume `useShow(id)`;
4. consume `useEpisodes(id)`;
5. compose presentation components;
6. compose FavoriteButton;
7. not construct API URLs directly.

---

# 6. Route Parameter Handling

Route parameters originate as strings or string-like route values.

Do not use unsafe assumptions such as:

```ts
const id = params.id as number;
```

Normalize explicitly.

If the parameter cannot produce a valid positive numeric Show ID, present a safe route-level error/fallback rather than issuing an invalid request.

Do not introduce a separate validation library.

---

# 7. Independent Queries

Maintain:

```text
useShow(id)
```

and:

```text
useEpisodes(id)
```

as independent query resources.

Do not replace them with:

```text
useShowWithEpisodes
Promise.all
combined query key
```

The screen must be able to reach this state:

```text
Show data     → SUCCESS
Episodes      → ERROR
```

while preserving usable Show content.

---

# 8. Show Detail Presentation

Create a Show-specific detail presentation component where useful.

Possible location:

```text
src/features/shows/components/ShowDetail.tsx
```

Do not force all JSX into the route if the screen becomes difficult to read.

The route should primarily orchestrate.

---

# 9. Show Information

Display available Show information from the internal domain model.

Required/expected information:

```text
image
name
status
rating
genres
summary
premiere information
```

Optional data must be rendered gracefully.

Never show raw:

```text
undefined
null
```

as UI copy.

---

# 10. Show Image

Use `expo-image`.

Requirements:

- stable layout geometry;
- appropriate detail-size presentation;
- missing-image fallback;
- reasonable content fit.

Do not use the TVMaze DTO image object.

Consume only the mapped:

```ts
show.imageUrl;
```

---

# 11. Show Name

The Show name is the primary heading.

Use semantic typography from the shared UI layer.

Do not encode title typography directly using arbitrary raw values if an existing semantic Text variant is appropriate.

---

# 12. Status

Reuse:

```text
ShowStatusBadge
```

from TASK-005.

Do not duplicate status-to-label mapping inside Show Detail.

---

# 13. Rating

Reuse:

```text
ShowRating
```

from TASK-005.

Do not reimplement rating formatting.

Missing rating must not become zero.

---

# 14. Genres

Render genres only when available.

A compact list such as:

```text
Drama · Crime · Thriller
```

or equivalent Chip-like presentation is acceptable.

Do not create a new generic taxonomy system.

Keep the presentation concise.

---

# 15. Premiere Information

When:

```ts
show.premieredAt !== null;
```

display a clear human-readable premiere value.

Do not introduce a date library just for this.

The raw API date is currently ISO-like and can be displayed or minimally formatted using platform APIs.

If formatting is performed, ensure invalid/missing dates fail gracefully.

---

# 16. Summary

TVMaze summaries may contain HTML markup.

Do not render raw HTML directly into React Native Text.

Do not install an HTML-rendering package in this task.

Use the simplest safe transformation appropriate to the current API data.

A small pure helper to strip simple HTML tags / normalize whitespace is acceptable.

Example conceptual boundary:

```ts
sanitizeShowSummary(summary: string | null): string | null
```

Keep it pure and independently testable.

Do not attempt to build a general-purpose HTML parser.

---

# 17. Summary Missing State

If summary is unavailable:

- omit the section;
- or use a restrained unavailable-state presentation.

Do not inject fake descriptions.

---

# 18. FavoriteButton Integration

Compose the existing:

```text
FavoriteButton
```

into Show Detail.

The Shows feature must not import Favorites implementation into a domain component if that would violate the existing boundary.

Prefer route/app composition if necessary.

Acceptable:

```text
route
├── ShowDetail
└── FavoriteButton
```

or a generic action slot passed into ShowDetail.

Avoid:

```ts
ShowDetail.tsx
→ import FavoritesProvider internals
```

---

# 19. Detail Loading

If required Show data is initially unavailable and `useShow` is pending:

```text
ShowDetailSkeleton
```

or an equivalent intentional skeleton presentation must appear.

Create a feature-level skeleton only if one does not exist.

Do not render a raw full-screen spinner as the only loading experience.

---

# 20. ShowDetailSkeleton

If created, approximate:

```text
large image
title
metadata
summary lines
```

Use shared Skeleton.

Do not include query logic inside the skeleton component.

---

# 21. Show Detail Error

If the required Show query fails and no usable Show data exists:

```text
ErrorState
+
retry
```

must be shown.

Retry delegates to the Show query.

Do not expose raw infrastructure error strings as polished user-facing copy by default.

---

# 22. Episodes Section

Episodes belong inside Show Detail but have an independent lifecycle.

Conceptual screen:

```text
Show information
Favorite action
Summary
────────────
Episodes
  ↓
season accordions
```

Show information should remain usable regardless of episode query status.

---

# 23. Episode Domain

Reuse the existing Episode model.

Do not recreate a second Episode representation for the UI unless a genuinely different presentation projection is required.

Avoid duplicating fields unnecessarily.

---

# 24. Episode Grouping

Implement:

```text
src/features/shows/utils/groupEpisodesBySeason.ts
```

if not already present.

Expected:

```ts
groupEpisodesBySeason(episodes: Episode[]): Season[]
```

The function must be:

- pure;
- deterministic;
- non-mutating.

---

# 25. Season Ordering

Output seasons in ascending numeric order.

Examples:

```text
Season 0
Season 1
Season 2
```

if those season numbers exist in the supplied data.

Do not hard-code that Season 1 is always first.

The first **available** season is the one initially expanded.

---

# 26. Episode Ordering

Episodes inside each season must remain logically ordered.

Prefer:

```text
episode.number ascending
```

when episode numbers are available.

When episode number is null, preserve stable/source ordering rather than inventing arbitrary numeric values.

Do not mutate the input array while sorting.

---

# 27. Grouping Return Shape

Use the existing Season domain contract:

```ts
type Season = {
  number: number;
  episodes: Episode[];
};
```

Do not return a Record/Map if the established domain contract is `Season[]`.

---

# 28. SeasonAccordion

Implement:

```text
src/features/shows/components/SeasonAccordion.tsx
```

The component must present:

- season label;
- episode count;
- expanded/collapsed state;
- episode content when expanded.

Each season manages its own local expanded state unless a simple controlled design is more appropriate.

Do not store accordion state globally.

---

# 29. Initial Accordion State

Per canonical docs:

```text
first available season
→ expanded

remaining seasons
→ collapsed
```

The parent may determine:

```ts
defaultExpanded={index === 0}
```

or equivalent.

Do not assume:

```ts
season.number === 1;
```

means first available season.

---

# 30. Accordion Interaction

Use React Native `Pressable`.

No third-party accordion dependency.

The control must:

- toggle expanded state;
- expose accessibility role/semantics;
- expose expanded/collapsed state;
- remain touch-friendly.

---

# 31. Accordion Accessibility

A user should be able to understand something equivalent to:

```text
Season 2, 13 episodes, collapsed
```

and after expansion:

```text
Season 2, 13 episodes, expanded
```

Use appropriate accessibility state such as:

```ts
accessibilityState={{ expanded }}
```

where supported.

Do not rely only on a chevron/icon.

---

# 32. Episode Presentation

Create a small feature component if useful:

```text
EpisodeRow
```

or equivalent.

Each episode should display at least:

```text
episode number where available
episode name
```

Optional useful metadata may include:

```text
runtime
air date
```

Keep it concise.

Do not render full episode summaries by default unless the existing design remains clean and `SPEC.md` supports that detail.

---

# 33. Episode Number Formatting

When both season and episode number are available, presentation may use:

```text
S01E03
```

or a simpler:

```text
Episode 3
```

Do not display:

```text
Episode null
```

If number is unavailable, fall back to the episode name/neutral label.

---

# 34. Episode Runtime

If runtime exists, display a human-readable value such as:

```text
42 min
```

Do not display zero unless zero is actual data.

Null runtime should be omitted.

---

# 35. Episode Air Date

If airdate exists, it may be shown.

Do not add date dependencies.

Keep formatting consistent with Show premiere formatting where practical.

---

# 36. Episodes Loading

When Show data is already available but Episodes are pending:

```text
Show info remains visible
+
Episodes skeleton/loading section
```

Do not replace the entire Show Detail screen with a loading state.

---

# 37. Episodes Skeleton

A small local representation is enough.

Examples:

```text
Season header skeleton
Episode row skeleton
```

Do not overbuild animation or huge placeholder trees.

---

# 38. Episodes Error

When episodes fail:

```text
Show info remains visible
+
episode-specific ErrorState
+
retry episodes
```

Retry delegates only to:

```text
episodesQuery.refetch
```

Do not refetch Show unnecessarily.

---

# 39. Episodes Empty State

If the episodes query succeeds with an empty array:

```text
Episodes EmptyState
```

or an appropriately restrained message must be rendered.

Do not treat successful empty data as error.

---

# 40. Grouping Lifecycle

Group only successful normalized `Episode[]`.

Do not group DTOs.

Correct:

```text
API
↓
mapper
↓
Episode[]
↓
groupEpisodesBySeason
↓
Season[]
```

---

# 41. Derived Grouping

Grouping should be derived state.

Do not store grouped seasons independently with `useState + useEffect`.

Acceptable:

```ts
const seasons = groupEpisodesBySeason(episodes);
```

or `useMemo` if structurally useful.

Do not create synchronization state.

---

# 42. Scrolling Architecture

Show Detail will likely require vertical scrolling.

Use the simplest suitable structure.

If episode counts can be large, avoid rendering every episode inside an unvirtualized nested architecture without consideration.

However, do not prematurely introduce a complex nested virtualized-list design.

A reasonable approach for the take-home is acceptable if performance remains sane and season content is collapsed by default.

Do not create nested vertical FlashLists casually.

---

# 43. Collapsed Rendering Benefit

Because only the first available season is expanded initially, most large episode collections remain unrendered initially.

Leverage this design rather than introducing premature list complexity.

If implementation reveals serious rendering cost, document it before architectural expansion.

---

# 44. Navigation Header

Use Expo Router's existing Stack behavior.

A back affordance should remain available through the normal navigation stack.

TASK-008 may set a meaningful header title if consistent with existing routing.

Do not perform the full navigation visual polish planned for TASK-009.

---

# 45. Route Title

A reasonable behavior is:

```text
initially generic title
→ Show name when data becomes available
```

if Expo Router composition allows this cleanly.

Do not make the route dependent on query success merely to navigate.

---

# 46. No New Remote Calls

Do not introduce:

- cast endpoint;
- seasons endpoint;
- images endpoint;
- embedding APIs;
- specials parameter.

Use only the existing Show + Episodes query layer.

---

# 47. No New Dependencies

Do not add:

- HTML renderer;
- accordion library;
- date library;
- state-management library;
- additional query library.

Existing stack is sufficient.

---

# 48. Testing — Summary Sanitization

If a summary helper is created, test at least:

- null → null;
- plain text preserved;
- simple HTML tags removed;
- whitespace normalized reasonably.

Do not attempt exhaustive browser-grade HTML parsing tests.

---

# 49. Testing — Episode Grouping

Required unit tests:

## Seasons

- episodes group by season;
- seasons sorted ascending;
- source array not mutated.

## Episodes

- episode order is logical within season;
- null episode numbers handled safely;
- empty input returns empty seasons.

---

# 50. Testing — SeasonAccordion

Required component behavior:

- season label rendered;
- episode count rendered;
- collapsed state hides episodes;
- expanded state shows episodes;
- press toggles state;
- accessibility expanded state changes.

---

# 51. Testing — Show Detail

High-value tests:

- initial Show loading displays detail skeleton;
- Show success renders name/status/rating;
- missing optional fields do not render `null`/`undefined`;
- FavoriteButton is present/composed;
- Show query error exposes retry;
- Episodes loading does not hide Show information;
- Episodes error preserves Show information and exposes episode retry;
- grouped seasons render;
- first available season is expanded;
- later season is collapsed initially.

---

# 52. Testing Query Boundaries

Mock existing query hooks or underlying feature API at a stable boundary.

Do not make real TVMaze requests.

Do not duplicate TASK-004 tests.

The focus here is presentation/orchestration.

---

# 53. Testing Navigation Parameter

Include a focused route-level or extracted helper test for invalid ID normalization if practical.

At minimum, the implementation must not call remote hooks with:

```text
NaN
```

or an invalid negative identifier.

Avoid complex Expo Router mocking solely to test framework internals.

---

# 54. TypeScript

Maintain:

```text
strict
noUncheckedIndexedAccess
```

Do not use broad casts for route params.

Do not expose DTO types to Show Detail.

Nullable remote fields must remain explicitly handled.

---

# 55. Performance

Do not add memoization by default.

`groupEpisodesBySeason` may be memoized at the presentation boundary if episode collections are structurally large and recomputation would occur frequently.

Do not memoize trivial metadata rendering.

---

# 56. Expected Files

Likely additions/modifications:

```text
src/app/shows/[id].tsx

src/features/shows/components/ShowDetail.tsx
src/features/shows/components/ShowDetailSkeleton.tsx
src/features/shows/components/SeasonAccordion.tsx
src/features/shows/components/EpisodeRow.tsx

src/features/shows/utils/groupEpisodesBySeason.ts
src/features/shows/utils/sanitizeShowSummary.ts
```

Tests should be colocated where practical.

Not every listed file is mandatory if a smaller cohesive structure is clearer.

---

# 57. Feature Boundary Rules

Shows presentation must not import:

```text
FavoritesProvider
favorites storage
useFavorites
```

if composition can happen at the route/app layer.

FavoriteButton may be composed from the app layer.

Keep:

```text
Shows domain/presentation
```

independent from:

```text
Favorites implementation
```

as much as practical.

---

# 58. Prohibited Shortcuts

Do not:

- combine Show and Episodes queries;
- construct TVMaze URLs;
- use DTOs in UI;
- put grouped seasons in Context;
- persist accordion state;
- add an accordion library;
- add an HTML-rendering library;
- display raw HTML summary;
- show raw null/undefined values;
- make Episodes error replace valid Show data;
- assume Season 1 is always first;
- make Show components depend on Favorites internals;
- implement global navigation polish;
- install new dependencies.

---

# 59. Quality Gates

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

# 60. Completion Report

When complete, report:

## Changed

- Show Detail route implemented;
- Show information presentation implemented;
- Favorite action integrated;
- Episodes presentation implemented;
- episode grouping implemented;
- SeasonAccordion implemented;
- isolated loading/error states implemented.

## Files

List important created/modified files.

## Tests

List grouping, accordion and Show Detail behavior covered.

## Validation

```text
format:check — PASS/FAIL
lint         — PASS/FAIL
typecheck    — PASS/FAIL
test:ci      — PASS/FAIL
```

## Notes

Mention only:

- summary sanitization approach;
- any meaningful Detail scrolling/performance trade-off;
- architectural deviation, if one exists.

---

# 61. Definition of Done

TASK-008 is complete when:

- valid Show route IDs load Show data;
- invalid IDs fail safely;
- Show Detail renders mapped domain information;
- optional data is handled safely;
- summary does not render raw HTML tags;
- FavoriteButton is available on Detail;
- Show and Episodes remain independent queries;
- episode data is grouped into ascending seasons;
- episodes are logically ordered;
- first available season is initially expanded;
- remaining seasons are initially collapsed;
- accordion interaction works accessibly;
- Episodes loading/error do not hide valid Show content;
- episode retry is isolated;
- empty episodes are handled;
- meaningful tests exist;
- no new dependency is introduced;
- all quality gates pass.
