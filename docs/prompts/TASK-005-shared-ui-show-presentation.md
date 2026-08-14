# TASK-005 — Shared UI Foundation + Show Presentation

## Task

**Title:** Shared UI Foundation + Show Presentation

**Status:** Ready

**Primary feature:** shared UI + shows

---

# 1. Objective

Implement the reusable UI foundation and the first complete show-list presentation layer.

This task must deliver:

- generic shared UI primitives;
- ShowCard;
- ShowStatusBadge;
- ShowRating;
- ShowList;
- ShowCardSkeleton;
- ShowListSkeleton.

The result should make the project ready for TASK-006 to compose the complete Home screen without needing to design basic presentation components.

Do not implement Home orchestration, filters, search behavior or pagination behavior in this task.

---

# 2. Required Context

Before modifying code, read:

1. `AGENTS.md`
2. relevant sections of `docs/SPEC.md`
3. relevant sections of `docs/ARCHITECTURE.md`
4. relevant decisions in `docs/DECISIONS.md`
5. `src/features/shows/SKILL.md`

Especially review:

- Design System Architecture;
- UI Primitives;
- Feature Components;
- List Architecture;
- Skeleton Strategy;
- Image Architecture;
- Accessibility Architecture;
- DEC-017 — FlashList;
- DEC-018 — Skeletons;
- DEC-019 — expo-image;
- DEC-020 — NativeWind;
- DEC-021 — small internal UI primitives.

---

# 3. Inspect Before Editing

Before implementation:

1. inspect `src/components/ui`;
2. inspect `src/features/shows/components`;
3. inspect `src/features/shows/domain`;
4. inspect `global.css`;
5. inspect `src/theme/tokens.ts`;
6. inspect the Show domain produced by TASK-002;
7. preserve existing NativeWind conventions.

Do not recreate domain contracts.

---

# 4. Scope

## Shared UI — In Scope

Implement:

```text
Text
Screen
Button
IconButton
Badge
Chip
Skeleton
EmptyState
ErrorState
SearchInput
Divider
```

Keep them intentionally small.

## Shows Presentation — In Scope

Implement:

```text
ShowCard
ShowStatusBadge
ShowRating
ShowList
ShowCardSkeleton
ShowListSkeleton
```

## Out of Scope

Do not implement:

- Home screen orchestration;
- ShowFilters;
- status filter behavior;
- rating filter behavior;
- debounce;
- browse/search switching;
- `fetchNextPage` handling;
- pagination-end logic;
- Favorites;
- FavoriteButton;
- Show Detail;
- episodes;
- navigation changes;
- API/query changes.

TASK-006 owns Home behavior.

---

# 5. Design-System Direction

Follow:

```text
semantic tokens
      ↓
shared primitives
      ↓
Show components
      ↓
future screens
```

Use existing semantic NativeWind tokens.

Prefer:

```text
bg-background
bg-surface
bg-surface-muted
text-foreground
text-foreground-muted
border-border
bg-primary
text-primary-foreground
```

Do not spread arbitrary raw palette colors through feature components.

If a semantic token is genuinely missing, add the smallest reusable semantic token required.

---

# 6. Shared UI Boundary

Shared components live in:

```text
src/components/ui/
```

They must remain completely domain-agnostic.

They must not import:

```text
features/shows
features/favorites
```

If a component needs `ShowStatus`, `Show`, `FavoriteShow` or similar business types, it belongs inside the relevant feature.

---

# 7. Shared Text

Implement a small typography primitive.

Recommended semantic variants:

```text
body
muted
label
title
heading
```

It must:

- wrap React Native `Text`;
- forward native Text props;
- support `className`;
- allow caller extensions;
- use semantic text styling.

Do not build a full typography system.

---

# 8. Screen

Implement a generic screen-level container.

Responsibilities:

- full available space;
- application background;
- optional generic padding/composition support.

Do not automatically add scrolling.

Do not include Home or Favorites semantics.

---

# 9. Button

Implement a generic `Pressable`-based button.

Supported variants should remain small, such as:

```text
primary
secondary
ghost
danger
```

Supported sizes may include:

```text
sm
md
```

Required behavior:

- press handling;
- disabled state;
- pressed visual state;
- accessibility button role;
- caller-supplied className/native props.

Do not include network loading behavior.

---

# 10. IconButton

Implement a generic icon/content button suitable for compact actions.

Requirements:

- `Pressable`;
- touch-friendly size;
- pressed state;
- disabled state;
- accessibility support;
- arbitrary children.

Do not bind this primitive to favorites or to a specific icon package.

---

# 11. Badge

Implement a generic compact label/count presentation.

Potential semantic variants:

```text
neutral
success
warning
danger
```

Keep the API minimal.

Do not map Show statuses inside this primitive.

---

# 12. Chip

Implement a selectable generic Chip.

Requirements:

- `selected`;
- `onPress`;
- disabled support;
- selected accessibility state;
- generic content.

This will later be used for Status and Rating controls.

Do not implement the actual filters here.

---

# 13. Skeleton

Implement a generic stable skeleton block.

Requirements:

- caller can define dimensions/layout using className/native style;
- semantic muted presentation;
- no additional dependency.

Animation is optional and should only be included if trivial with the current stack.

Do not add an animation library.

---

# 14. EmptyState

Implement generic presentation accepting equivalent data to:

```ts
title;
description?;
action?;
```

No feature-specific copy.

Do not hard-code:

- no favorites;
- no shows;
- no search results.

---

# 15. ErrorState

Implement generic error presentation supporting:

```ts
title;
description?;
onRetry?;
```

It must not know about:

- `ApiError`;
- TVMaze;
- TanStack Query;
- AsyncStorage.

Consumers translate domain errors into UI semantics.

---

# 16. SearchInput

Implement a generic search input.

Requirements:

- `value`;
- `onChangeText`;
- placeholder;
- standard TextInput props;
- accessibility support;
- semantic NativeWind styling.

Do not:

- debounce;
- trim;
- call APIs;
- own search state.

---

# 17. Divider

Implement a simple generic divider using the semantic border token.

No complex API is required.

---

# 18. ShowStatusBadge

Create inside:

```text
src/features/shows/components/
```

The component accepts normalized Show status.

It owns the mapping from Show-domain status to user-facing presentation.

Expected labels:

```text
running → Running
ended → Ended
to-be-determined → To Be Determined
unknown → reasonable neutral fallback
```

Use the shared Badge primitive.

Status visual meaning should be consistent, but do not rely on color alone.

---

# 19. ShowRating

Implement a Show-specific rating presentation.

Input:

```ts
rating: number | null;
```

When rating exists, display it clearly, such as:

```text
★ 8.7
```

When rating is unavailable, avoid rendering misleading:

```text
0
```

Choose a restrained fallback such as omitting the value or displaying unavailable presentation.

Do not implement filter logic here.

---

# 20. ShowCard

Implement a reusable Show presentation card.

It must consume an internal Shows-domain model, preferably `ShowListItem`.

Required visible information:

- image;
- name;
- status;
- rating when available.

Genres may be included if the design remains clean.

The card must not receive a TVMaze DTO.

---

# 21. ShowCard Image

Use:

```text
expo-image
```

Requirements:

- stable poster geometry;
- missing-image state;
- reasonable content fit;
- no broken layout when `imageUrl` is null.

Do not create a fake URL in the component.

A generic local fallback presentation is acceptable.

---

# 22. ShowCard Interaction

The card should support navigation-oriented interaction without owning navigation itself.

Preferred contract:

```tsx
<ShowCard
  show={show}
  onPress={() => ...}
/>
```

The component must not call Expo Router directly unless there is an already-established component-level navigation convention.

Prefer keeping routing at screen/composition level.

---

# 23. ShowCard Accessibility

The interactive card must communicate meaningful Show identity.

At minimum, the accessibility label should make the show name apparent.

Do not combine Favorite behavior into this card yet.

FavoriteButton belongs to TASK-007.

---

# 24. ShowList

Implement a reusable Show list using:

```text
FlashList
```

The component receives already prepared domain items.

Conceptual API may include:

```ts
shows;
render-related callbacks;
onShowPress?;
ListHeaderComponent?;
ListFooterComponent?;
ListEmptyComponent?;
onEndReached?;
```

Do not over-generalize the wrapper.

Its purpose is to centralize Show-list presentation and FlashList usage.

---

# 25. ShowList Responsibilities

ShowList may own:

- FlashList setup;
- stable show ID keys;
- ShowCard rendering;
- layout/content spacing;
- forwarding pagination/list callbacks;
- caller-provided footer/empty/header content.

It must not own:

- fetching;
- `fetchNextPage`;
- search;
- filters;
- remote mode selection.

Those belong to TASK-006.

---

# 26. FlashList

Primary Show collections must use FlashList.

Do not replace it with:

```text
ScrollView + map
FlatList
```

without changing the accepted architecture.

Use stable show identifiers as keys.

Do not add speculative memoization unless needed.

---

# 27. ShowCardSkeleton

Build a feature-level skeleton using the shared `Skeleton` primitive.

It should approximate ShowCard geometry:

```text
poster
+
title
+
status/rating lines
```

The purpose is visual continuity.

Do not include remote/query state inside it.

---

# 28. ShowListSkeleton

Build a reusable group of ShowCardSkeleton items.

Conceptual API may support a small optional count:

```tsx
<ShowListSkeleton count={6} />
```

Keep defaults reasonable.

This will be reused by:

- initial Home loading;
- potentially search loading.

Pagination footer may later use a smaller count.

---

# 29. Styling

Keep the initial visual design clean and restrained.

The assignment does not provide a design; consistency and clarity are more valuable than decorative complexity.

Use:

- semantic colors;
- consistent spacing;
- existing radius tokens;
- predictable poster aspect ratio;
- clear hierarchy.

Do not redesign the token system extensively during this task.

---

# 30. NativeWind Composition

Keep class usage readable.

Small local class maps for variants are acceptable.

Do not add:

- `class-variance-authority`;
- styling frameworks;
- component libraries.

Existing NativeWind functionality is sufficient.

---

# 31. className API

Shared primitives should generally permit `className` extension where useful.

Feature components do not need to expose every internal style knob.

Avoid turning ShowCard into an unbounded design-system component.

---

# 32. No Favorite Behavior Yet

Do not add:

```text
heart icon
FavoriteButton
isFavorite
toggleFavorite
FavoritesProvider
```

to ShowCard during TASK-005.

TASK-007 will compose FavoriteButton into relevant show surfaces.

Avoid crossing task boundaries even if the visual space is obvious.

---

# 33. No Filtering Yet

Do not create:

```text
ShowFilters
StatusFilter
RatingFilter
```

during TASK-005.

Chip exists only as a generic primitive.

TASK-006 owns discovery/filter composition.

---

# 34. No Pagination Logic Yet

ShowList may expose:

```ts
onEndReached;
```

and footer composition.

It must not decide:

```ts
if (hasNextPage && !isFetchingNextPage) {
  fetchNextPage();
}
```

That orchestration belongs to Home in TASK-006.

---

# 35. Testing — Shared Primitives

High-value tests:

## Button

- renders content;
- press invokes callback;
- disabled prevents callback;
- exposes button semantics.

## Chip

- press invokes callback;
- selected accessibility state is exposed.

## SearchInput

- value rendered;
- text-change callback invoked;
- placeholder rendered.

## EmptyState / ErrorState

- content rendered;
- optional action/retry invoked.

Avoid snapshot-only coverage as the primary strategy.

---

# 36. Testing — Show Presentation

High-value tests:

## ShowStatusBadge

- known statuses map to expected labels;
- unknown status uses safe fallback.

## ShowRating

- known rating is displayed;
- null rating does not become zero.

## ShowCard

- name shown;
- status shown;
- rating shown when available;
- missing image does not break rendering;
- press callback works.

## ShowList

- items render from domain models;
- item press is forwarded;
- empty data is handled without crash.

## Skeletons

A dedicated visual snapshot test is not required unless there is meaningful behavior.

---

# 37. Test Boundaries

Do not test NativeWind implementation classes excessively.

Prefer user-visible behavior and accessibility semantics.

Do not test FlashList internals.

Test that ShowList correctly presents provided items and forwards its external contract.

---

# 38. TypeScript

Maintain:

```text
strict
noUncheckedIndexedAccess
```

Use native component prop types where appropriate.

Avoid `any`.

Do not broaden Show component input to raw API DTO types.

---

# 39. Dependencies

Do not install new dependencies.

Use existing:

- NativeWind;
- FlashList;
- expo-image;
- React Native;
- RNTL.

Do not add an icon package in this task.

Symbols/text or generic children are sufficient where an icon would otherwise be required for primitive testing.

---

# 40. Expected Files

Likely shared UI:

```text
src/components/ui/Text.tsx
src/components/ui/Screen.tsx
src/components/ui/Button.tsx
src/components/ui/IconButton.tsx
src/components/ui/Badge.tsx
src/components/ui/Chip.tsx
src/components/ui/Skeleton.tsx
src/components/ui/EmptyState.tsx
src/components/ui/ErrorState.tsx
src/components/ui/SearchInput.tsx
src/components/ui/Divider.tsx
```

Likely Shows components:

```text
src/features/shows/components/ShowStatusBadge.tsx
src/features/shows/components/ShowRating.tsx
src/features/shows/components/ShowCard.tsx
src/features/shows/components/ShowList.tsx
src/features/shows/components/ShowCardSkeleton.tsx
src/features/shows/components/ShowListSkeleton.tsx
```

Colocate meaningful tests.

Do not create barrel files by default.

---

# 41. Prohibited Shortcuts

Do not:

- import DTOs into UI;
- import Favorites into Shows;
- call TVMaze;
- use TanStack Query;
- implement Home;
- implement filters;
- implement debounce;
- implement Favorites;
- implement navigation logic;
- add UI/icon/animation dependencies;
- use raw TVMaze structures;
- replace FlashList;
- make Shared UI domain-aware.

---

# 42. Quality Gates

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

Then rerun the gates.

---

# 43. Completion Report

When complete, report:

## Changed

- shared UI foundation implemented;
- Show presentation components implemented;
- FlashList-based ShowList implemented;
- Show skeleton presentation implemented.

## Files

List important files created or modified.

## Tests

List meaningful shared/UI behavior covered.

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

# 44. Definition of Done

TASK-005 is complete when:

- shared primitives are reusable and domain-agnostic;
- ShowStatusBadge exists;
- ShowRating exists;
- ShowCard renders domain data;
- ShowCard handles missing images safely;
- ShowList uses FlashList;
- ShowCardSkeleton exists;
- ShowListSkeleton exists;
- no filters/Home/Favorites behavior is introduced;
- accessibility is considered;
- meaningful tests exist;
- no new dependency is introduced;
- all quality gates pass.
