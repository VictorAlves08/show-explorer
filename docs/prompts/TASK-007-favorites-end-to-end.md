# TASK-007 — Favorites End-to-End

## Task

**Title:** Favorites End-to-End

**Status:** Ready

**Primary feature:** favorites + app composition

---

# 1. Objective

Implement the complete Favorites feature from persistence to UI.

The task must deliver:

- Favorites storage boundary;
- FavoritesProvider;
- `useFavorites`;
- hydration behavior;
- add/remove/toggle favorite;
- duplicate prevention;
- favorite count;
- FavoriteButton;
- FavoritesBadge;
- Favorites screen;
- local Favorites search;
- local status/rating filtering;
- Favorites empty states;
- integration of favorite state into relevant existing Show surfaces.

Do not implement Show Detail episodes in this task.

---

# 2. Required Context

Before modifying code, read:

1. `AGENTS.md`
2. relevant sections of `docs/SPEC.md`
3. relevant sections of `docs/ARCHITECTURE.md`
4. relevant decisions in `docs/DECISIONS.md`
5. `src/features/favorites/SKILL.md`
6. relevant stable domain contracts from `src/features/shows`

Also inspect implementation produced by TASK-005 and TASK-006.

Especially review:

- Favorites Architecture;
- Favorite Snapshot;
- Storage Boundary;
- Provider Composition;
- State Ownership;
- Favorites Search;
- Favorites Filters;
- DEC-005;
- DEC-006;
- DEC-007;
- DEC-008;
- DEC-013;
- DEC-014.

---

# 3. Inspect Before Editing

Before coding:

1. inspect `src/features/favorites`;
2. inspect `src/providers/AppProviders.tsx`;
3. inspect existing Show domain types;
4. inspect existing ShowCard API;
5. inspect Home screen composition;
6. inspect shared UI primitives;
7. inspect current Router structure.

Reuse stable existing contracts instead of duplicating Show data types.

---

# 4. Scope

## In Scope

Implement:

```text
FavoriteShow contract
generic storage primitive if still missing
favorites.storage
FavoritesProvider
useFavorites
FavoriteButton
FavoritesBadge
Favorites screen
local search
local status/rating filtering
hydration state
empty states
favorite integration in Home/list surface
favorite integration path for future Detail
provider composition
```

## Out of Scope

Do not implement:

- episode grouping;
- SeasonAccordion;
- Show Detail data presentation;
- remote Favorites search;
- cloud sync;
- background sync;
- database migrations beyond what is strictly required now;
- Redux;
- Zustand;
- TanStack Query-backed Favorites.

---

# 5. Favorite Snapshot

Persist a minimal presentation snapshot.

Conceptually:

```ts
export type FavoriteShow = {
  id: number;
  name: string;
  imageUrl: string | null;
  status: ShowStatus;
  rating: number | null;
  genres: string[];
};
```

Prefer deriving this from a stable Shows domain contract when practical.

Do not duplicate equivalent types unnecessarily.

---

# 6. Shows Dependency Boundary

Favorites may consume stable Shows domain contracts.

Allowed:

```ts
import type { ShowListItem } from '@/features/shows/domain/show';
```

Forbidden:

```ts
import { useShows } from '@/features/shows/queries/useShows';
```

```ts
import { showsApi } from '@/features/shows/api/shows.api';
```

Favorites must not depend on Shows API/query internals.

---

# 7. Generic Storage Boundary

If `src/lib/storage` does not yet contain a small generic abstraction, introduce only the minimal one required.

Conceptually acceptable operations:

```ts
getItem<T>(key: string): Promise<T | null>;
setItem<T>(key: string, value: T): Promise<void>;
removeItem(key: string): Promise<void>;
```

It may wrap AsyncStorage JSON serialization.

Keep it generic.

It must not know what Favorites are.

---

# 8. Favorites Storage

Implement:

```text
src/features/favorites/storage/favorites.storage.ts
```

This module owns:

- storage key;
- read Favorites collection;
- write Favorites collection.

Use one canonical storage key.

Conceptually:

```ts
const FAVORITES_STORAGE_KEY = 'show-explorer:favorites';
```

Exact naming may differ.

Do not expose AsyncStorage directly to UI.

---

# 9. Storage Read Semantics

Reading Favorites should produce a safely usable collection.

If no persisted value exists:

```text
[]
```

is appropriate.

Do not confuse:

```text
no persisted favorites
```

with:

```text
storage operation failed
```

A storage failure should remain distinguishable from an empty collection.

---

# 10. Storage Write Semantics

Persist the complete current FavoriteShow collection.

Do not persist a separate count.

Do not create one storage entry per show unless architecture clearly benefits from it.

The collection is small; a single serialized collection is sufficient.

---

# 11. FavoritesProvider

Implement:

```text
src/features/favorites/providers/FavoritesProvider.tsx
```

The provider owns:

- in-memory favorites;
- hydration state;
- add;
- remove;
- toggle;
- membership.

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

Small naming refinements are acceptable.

---

# 12. Context Creation

Keep Context private to the feature where practical.

Consumers should normally use:

```text
useFavorites()
```

instead of importing the raw Context directly.

The hook should throw a clear development-time error if used outside the provider.

---

# 13. Hydration

When FavoritesProvider mounts:

```text
favorites storage
      ↓
read
      ↓
provider state
      ↓
isHydrated = true
```

Do not treat the collection as definitively empty before hydration completes.

The app should avoid an obvious:

```text
0 favorites
→ hydration
→ N favorites
```

flicker where practical.

---

# 14. Hydration Failure

A read failure must not crash the application.

Handle it intentionally.

A reasonable minimal behavior is:

- keep the app usable;
- finish hydration;
- preserve an empty in-memory collection;
- avoid automatically overwriting persisted data merely because the read failed.

If implementing a user-visible storage error would expand product behavior beyond `SPEC.md`, keep error handling internal and document the trade-off.

---

# 15. Add Favorite

Required behavior:

```text
not favorite
→ add
→ in-memory collection updates
→ persistence updates
→ all consumers react
```

Prevent duplicates by Show ID.

Do not rely on name equality.

---

# 16. Remove Favorite

Required behavior:

```text
favorite
→ remove by ID
→ collection updates
→ persistence updates
→ count updates
→ Favorites screen updates
```

Removing an unknown ID should not corrupt state.

---

# 17. Toggle Favorite

Implement as semantic feature behavior.

Conceptually:

```ts
isFavorite(show.id) ? removeFavorite(show.id) : addFavorite(show);
```

Avoid duplicating persistence logic across three different methods.

---

# 18. Write Failure Strategy

Use a simple consistent write strategy.

A good default is:

```text
optimistic in-memory update
→ persist
→ rollback if persistence fails
```

or a persistence-first approach if current code remains simpler.

Whichever strategy is chosen:

- do not leave in-memory and persisted state intentionally inconsistent;
- keep complexity appropriate to a small local store;
- document the trade-off in completion notes.

Do not build a transaction framework.

---

# 19. Favorite Count

Count must be derived:

```ts
favorites.length;
```

Do not store:

```ts
favoriteCount;
```

as a second independent state value.

This prevents drift.

---

# 20. FavoritesProvider Composition

Update:

```text
src/providers/AppProviders.tsx
```

to compose FavoritesProvider with the existing QueryClientProvider.

Conceptually:

```tsx
<QueryClientProvider client={queryClient}>
  <FavoritesProvider>{children}</FavoritesProvider>
</QueryClientProvider>
```

Equivalent nesting is acceptable if justified.

`AppProviders` remains composition only.

Do not move Favorites business logic there.

---

# 21. useFavorites

Implement:

```text
src/features/favorites/hooks/useFavorites.ts
```

The hook exposes the feature's public reactive interface.

Consumers should not need to know about:

- AsyncStorage;
- storage keys;
- raw Context object.

Keep the API narrow.

---

# 22. FavoriteButton

Implement:

```text
src/features/favorites/components/FavoriteButton.tsx
```

It should accept enough stable Show-domain information to build a FavoriteShow snapshot.

Conceptual API:

```tsx
<FavoriteButton show={show} />
```

or equivalent.

Do not require callers to manually manage storage.

---

# 23. FavoriteButton Behavior

Required:

```text
not favorite
→ visual unselected state
→ press
→ favorite
```

```text
favorite
→ visual selected state
→ press
→ unfavorite
```

Use the existing IconButton/shared primitives where appropriate.

Do not access AsyncStorage directly.

---

# 24. FavoriteButton Accessibility

Required semantic intent:

```text
Add {show name} to favorites
```

or:

```text
Remove {show name} from favorites
```

Expose selected/pressed state appropriately.

Do not rely only on color.

---

# 25. Icons

If no icon package is already installed, do not add one just for this task unless Expo's existing project dependencies already provide an approved icon solution.

Prefer the smallest approach consistent with existing project setup.

If `@expo/vector-icons` is already transitively/explicitly available in the Expo project and usable without dependency changes, it may be used.

Do not install a large unrelated icon library.

---

# 26. Home Integration

Integrate FavoriteButton into the existing Show list/card presentation.

Prefer compositional extension rather than making ShowCard import Favorites directly.

Ideal direction:

```text
Home composition
   ↓
ShowCard
+
FavoriteButton
```

If the existing ShowCard API supports an action slot, use it.

If it does not, make the smallest generic extension such as:

```tsx
<ShowCard show={show} action={<FavoriteButton show={show} />} />
```

Do not make the Shows feature depend on Favorites.

---

# 27. Feature Dependency Invariant

This is important:

```text
Favorites → stable Shows domain ✅
Shows → Favorites ❌
```

Therefore do not edit ShowCard into:

```ts
import { FavoriteButton } from '@/features/favorites/...';
```

Prefer composition from route/screen/app layer.

---

# 28. FavoritesBadge

Implement:

```text
src/features/favorites/components/FavoritesBadge.tsx
```

It derives count from:

```ts
favorites.length;
```

It must not:

- persist count;
- read AsyncStorage;
- call TVMaze.

The badge should handle zero gracefully.

---

# 29. Favorites Screen

Implement the dedicated Favorites screen.

Target route is conceptually:

```text
src/app/(tabs)/favorites.tsx
```

If tabs are not yet finalized, place the screen according to the current Router structure without prematurely executing the full TASK-009 navigation polish.

The screen must consume FavoritesProvider only.

---

# 30. Favorites Data Flow

Expected:

```text
FavoritesProvider
      ↓
FavoriteShow[]
      ↓
local search
      ↓
status filter
      ↓
rating filter
      ↓
ShowList / FlashList
```

No remote query is required to render Favorites.

---

# 31. Favorites Search

Use the shared search presentation.

Search is local and case-insensitive.

Normalize at minimum:

```text
trim
lowercase for comparison
```

Conceptually:

```ts
show.name.toLowerCase().includes(query.toLowerCase());
```

Do not mutate the stored show name.

---

# 32. No Search Debounce Requirement

Favorites search is local.

A debounce is not required.

If reuse of a local discovery hook naturally introduces harmless debounce, avoid it unless necessary; immediate local filtering is preferable.

Do not call TVMaze.

---

# 33. Favorites Filters

Reuse the same status/rating semantics as Home.

Supported:

```text
Status:
All
Running
Ended
To Be Determined

Rating:
Any
6+
7+
8+
9+
```

Where practical, reuse the existing pure `filterShows` logic from the Shows feature using stable domain contracts.

Do not duplicate equivalent filter algorithms.

---

# 34. Favorites Filter State

Favorites screen owns:

```text
search
status
minimumRating
```

Do not put these into FavoritesProvider.

Home and Favorites filter states remain independent.

---

# 35. Reusing ShowFilters

The same controlled ShowFilters presentation from TASK-006 may be reused.

This is encouraged if its API remains presentation-oriented and compatible with FavoriteShow/ShowListItem contracts.

Do not duplicate the filter UI without reason.

---

# 36. Favorites List

Use the existing ShowList / FlashList architecture.

Favorites data should be converted or represented as the stable list-oriented Show domain contract required by ShowList.

Do not create a second arbitrary list implementation.

---

# 37. Favorites Empty State

When:

```text
favorites.length === 0
```

show the Favorites onboarding empty state.

It should communicate that shows can be added using the favorite action.

Use the shared EmptyState primitive.

---

# 38. Favorites Search/Filter Empty

When Favorites exist but the local search/filter pipeline returns no visible results, show a different empty state.

Do not use the onboarding message.

Expected semantic difference:

```text
No favorites yet
```

versus:

```text
No favorites match these filters
```

Exact product copy may be polished later.

---

# 39. Hydration Presentation

Before hydration completes, do not render the definitive empty Favorites onboarding state.

Use a minimal loading/skeleton strategy consistent with the app.

Avoid a visually disruptive full-screen spinner if an existing list skeleton is appropriate.

---

# 40. Favorite Navigation

Pressing a Favorite Show should navigate to the same Show Detail route as Home:

```text
/shows/[id]
```

Do not create a Favorites-specific detail route.

---

# 41. Show Detail Integration

TASK-007 may prepare FavoriteButton so it can be reused by Show Detail later.

Do not implement Show Detail content in this task.

If the Detail placeholder already exists, do not expand it beyond what is needed for compilation/navigation.

---

# 42. Local Search Utility

If local favorite search is non-trivial enough to deserve a pure helper, create a small utility.

Conceptually:

```ts
searchFavoriteShows(favorites, query);
```

It must:

- be pure;
- not mutate input;
- be independently testable.

Avoid creating generic search abstraction frameworks.

---

# 43. State Synchronization

Required integration behavior:

```text
Home FavoriteButton
      ↓
toggle
      ↓
FavoritesProvider changes
      ├── Home button reacts
      ├── badge reacts
      └── Favorites screen reacts
```

No manual event bus or refetch is needed.

React Context is the synchronization mechanism.

---

# 44. No Remote Reconstruction

Do not implement:

```text
favorite IDs
→ useShow(id) for every Favorite
```

to render Favorites.

The persisted snapshot exists specifically to avoid this.

Remote Show Detail may still retrieve fresh data when the user opens a favorite.

---

# 45. Testing — Storage

Required high-value tests:

- no stored value → empty collection;
- stored favorites deserialize correctly;
- favorites write correctly;
- storage failure propagates/behaves according to chosen boundary contract.

Mock AsyncStorage or generic storage boundary.

Do not use real device storage.

---

# 46. Testing — Provider

Required:

- hydrates persisted Favorites;
- marks hydration complete;
- add Favorite;
- duplicate add does not duplicate;
- remove Favorite;
- toggle Favorite;
- membership changes reactively;
- count derives correctly;
- persistence called after changes.

If rollback is implemented, test write-failure rollback.

---

# 47. Testing — FavoriteButton

Required:

- unselected state for non-favorite;
- selected state for favorite;
- press toggles;
- meaningful accessibility label changes.

Test user-observable behavior.

---

# 48. Testing — Favorites Screen

High-value cases:

- hydration loading does not incorrectly show "no favorites";
- no Favorites → onboarding empty state;
- Favorites render after hydration;
- local search filters by name;
- status filter works;
- rating filter works;
- combined filters work;
- filter-empty state differs from no-favorites state;
- favorite removal updates visible list.

Do not make real network requests.

---

# 49. Testing — Synchronization

Add at least one integration-oriented test showing that two consumers of FavoritesProvider observe the same update.

For example:

```text
FavoriteButton toggle
→ count consumer updates
```

This validates why the provider exists.

---

# 50. TypeScript

Maintain:

```text
strict
noUncheckedIndexedAccess
```

Persisted FavoriteShow must remain serializable.

Do not use `any`.

Avoid broad casts when reading storage; keep unsafe deserialization boundaries localized and explicit.

---

# 51. Performance

Favorites is expected to be a relatively small collection.

Do not introduce:

- selector frameworks;
- Zustand;
- memoization architecture;
- normalized entity stores.

Simple Context state is intentional.

---

# 52. Dependencies

Do not install new dependencies unless an icon solution is genuinely required and already-approved Expo tooling cannot satisfy it.

No state-management or persistence package may be added.

Existing:

```text
AsyncStorage
React Context
FlashList
NativeWind
RNTL
```

are sufficient.

---

# 53. Expected Files

Likely:

```text
src/lib/storage/storage.ts

src/features/favorites/domain/favorite.ts

src/features/favorites/storage/favorites.storage.ts

src/features/favorites/providers/FavoritesProvider.tsx

src/features/favorites/hooks/useFavorites.ts

src/features/favorites/components/FavoriteButton.tsx
src/features/favorites/components/FavoritesBadge.tsx

src/app/(tabs)/favorites.tsx
```

Existing Home/ShowCard composition may be modified narrowly to surface FavoriteButton.

Tests should be colocated.

Do not create barrel files by default.

---

# 54. Prohibited Shortcuts

Do not:

- put Favorites in TanStack Query;
- add Zustand;
- add Redux;
- create generic AppContext;
- call AsyncStorage from UI;
- call TVMaze from Favorites screen;
- reconstruct Favorites remotely;
- store separate favorite count;
- put search/filters in FavoritesProvider;
- make Shows import Favorites;
- introduce cloud sync;
- implement episodes;
- install unrelated dependencies;
- suppress persistence failures silently.

---

# 55. Quality Gates

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

# 56. Completion Report

When complete, report:

## Changed

- Favorites persistence implemented;
- FavoritesProvider implemented;
- FavoriteButton and badge implemented;
- Home favorite integration implemented;
- Favorites screen implemented;
- local Favorites search/filters implemented.

## Files

List important files created/modified.

## Tests

List storage/provider/component/screen behavior covered.

## Validation

```text
format:check — PASS/FAIL
lint         — PASS/FAIL
typecheck    — PASS/FAIL
test:ci      — PASS/FAIL
```

## Notes

Mention:

- chosen write-failure strategy;
- meaningful architecture deviation, if any.

---

# 57. Definition of Done

TASK-007 is complete when:

- Favorites hydrate from AsyncStorage;
- provider exposes reactive collection;
- add/remove/toggle work;
- duplicate Favorites are prevented;
- changes persist;
- count derives from collection;
- FavoriteButton works from Show surfaces;
- Shows feature does not depend on Favorites;
- Favorites screen renders persisted snapshots;
- Favorites search is local;
- status/rating filters are local;
- Home and Favorites filter states remain independent;
- no remote Favorites reconstruction occurs;
- hydration/empty/filter-empty states are handled;
- meaningful tests exist;
- all quality gates pass.
