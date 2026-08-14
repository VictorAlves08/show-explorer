# Favorites Feature — Agent Skill

## Purpose

This skill defines the operating rules for AI-assisted work inside the `favorites` feature.

It is derived from the canonical project documentation:

1. `docs/SPEC.md`
2. `docs/ARCHITECTURE.md`
3. `docs/DECISIONS.md`

Those documents have higher authority than this file.

If this skill conflicts with canonical documentation, the canonical documentation wins.

This skill must not redefine product behavior or architecture.

---

# 1. Feature Ownership

The `favorites` feature owns the user's persisted local favorite-show collection.

Primary location:

```text
src/features/favorites/
```

The feature owns:

- favorite domain contracts;
- reactive favorite state;
- `FavoritesProvider`;
- favorite hydration;
- favorite persistence;
- favorite add/remove/toggle behavior;
- favorite membership checks;
- visible favorites count;
- local favorite search;
- local favorite filtering;
- favorite-specific UI components.

The feature does not own:

- TVMaze requests;
- TVMaze DTOs;
- TanStack Query show state;
- remote Home search;
- episode data;
- routing implementation;
- generic AsyncStorage infrastructure;
- generic UI primitives;
- generic filter UI state;
- application-wide business state.

---

# 2. Canonical Requirements

Before implementing or modifying Favorites behavior, consult:

```text
docs/SPEC.md
```

Important Favorites requirements include:

- favorite a show;
- unfavorite a show;
- immediate reactive updates;
- persistence across application reloads;
- dedicated Favorites screen;
- visible favorite count;
- local Favorites search;
- local status filtering;
- local rating filtering;
- Favorites empty state;
- Favorites search/filter empty state;
- independent Home/Favorites filter state.

Do not infer new requirements from this skill.

---

# 3. Expected Structure

The feature is expected to evolve approximately as:

```text
src/features/favorites/
├── components/
│   ├── FavoriteButton.tsx
│   └── FavoritesBadge.tsx
│
├── domain/
│   └── favorite.ts
│
├── hooks/
│   └── useFavorites.ts
│
├── providers/
│   └── FavoritesProvider.tsx
│
├── storage/
│   └── favorites.storage.ts
│
└── SKILL.md
```

If `providers/` does not yet exist, create it only when implementing the provider.

Do not create files merely to match this tree.

---

# 4. Dependency Rules

Favorites may depend on:

```text
src/lib/
src/components/ui/
src/hooks/
src/theme/
```

when appropriate.

Favorites may also consume **stable public domain contracts** from Shows.

Allowed example:

```ts
import type { ShowListItem } from '@/features/shows/domain/show';
```

or another equivalent stable public domain type.

Favorites must not depend on Shows implementation internals.

Forbidden examples:

```ts
import { useShows } from '@/features/shows/queries/useShows';
```

```ts
import { showsApi } from '@/features/shows/api/shows.api';
```

```ts
import { mapTvMazeShow } from '@/features/shows/api/shows.mappers';
```

The intended direction is:

```text
Shows domain contract
        ↓
Favorites
```

not:

```text
Favorites implementation
        ↓
Shows
```

Shows must not depend on Favorites.

---

# 5. Favorites Are Client State

Favorites are not remote server state.

They must not be stored in TanStack Query.

Correct ownership:

```text
FavoritesProvider
      ↓
in-memory reactive state
      ↓
favorites storage
      ↓
AsyncStorage
```

TanStack Query remains responsible only for TVMaze-backed remote state.

Do not model Favorites using:

```ts
useQuery({
  queryKey: ['favorites'],
  ...
});
```

unless canonical architecture is intentionally changed first.

---

# 6. FavoritesProvider

`FavoritesProvider` is a feature-scoped React Context boundary.

Its purpose is to provide reactive shared Favorites state across:

- Home;
- Favorites;
- Show Detail;
- Favorites tab badge/count.

It is not a generic application store.

Conceptual contract:

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

The final implementation may refine naming while preserving these responsibilities.

---

# 7. Provider Responsibilities

The provider must:

- hydrate persisted favorites;
- hold the reactive in-memory collection;
- expose membership checks;
- expose add/remove/toggle behavior;
- prevent duplicates;
- persist changes;
- keep all consumers synchronized;
- expose hydration state.

The provider must not own:

- Home search state;
- Favorites search state;
- status filter state;
- rating filter state;
- navigation;
- remote show state;
- episodes;
- TVMaze requests.

---

# 8. Provider Placement

The provider is composed at application level through:

```text
src/providers/AppProviders.tsx
```

`AppProviders` is the application composition root.

It may compose:

```text
QueryClientProvider
FavoritesProvider
```

This does not make Favorites generic infrastructure.

Favorites business logic remains inside the Favorites feature.

---

# 9. Favorite Snapshot

Favorites persist a minimal presentation-oriented snapshot.

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

The exact representation may derive from a stable Shows domain contract.

The snapshot must contain enough information to support:

- Favorites list rendering;
- local name search;
- status filtering;
- rating filtering;
- visible favorite count.

Do not persist the full TVMaze payload without a concrete need.

---

# 10. Snapshot Semantics

A persisted favorite is a local snapshot.

It is not the authoritative current TVMaze record.

This means:

```text
TVMaze
→ authoritative remote show information

FavoriteShow
→ persisted local presentation snapshot
```

Temporary staleness is accepted by architecture.

Do not introduce background refresh or cache synchronization unless explicitly required.

---

# 11. Persistence Boundary

Favorites-specific persistence belongs in:

```text
src/features/favorites/storage/
```

Generic storage behavior belongs in:

```text
src/lib/storage/
```

Expected dependency:

```text
AsyncStorage
     ↓
lib/storage
     ↓
favorites.storage
     ↓
FavoritesProvider
```

Do not call AsyncStorage directly from:

- FavoriteButton;
- Favorites screen;
- route files.

---

# 12. Storage Responsibilities

`favorites.storage` should own Favorites-specific persistence concerns such as:

- storage key;
- serialization contract;
- reading persisted favorites;
- writing persisted favorites;
- clearing favorites if explicitly required.

Generic serialization helpers may live in `lib/storage` when truly reusable.

Do not spread the Favorites storage key across multiple files.

---

# 13. Storage Key

Use a centralized key.

Conceptually:

```ts
const FAVORITES_STORAGE_KEY = 'show-explorer:favorites';
```

The exact key may differ.

The important invariant is:

```text
one canonical key
```

not duplicated string literals.

---

# 14. Hydration

Persisted favorites must be loaded when the Favorites provider initializes.

Hydration must be represented explicitly.

Conceptually:

```ts
isHydrated: boolean;
```

Before hydration completes, the application must not incorrectly assume that the favorites collection is empty.

Avoid visible state flicker such as:

```text
0 favorites
↓
hydration completes
↓
5 favorites
```

when presentation can reasonably wait for hydration state.

---

# 15. Hydration Failure

A persistence read failure must not crash the application.

The implementation should fail safely and preserve usability.

Do not silently corrupt or overwrite persisted data merely because hydration failed.

If error handling behavior materially affects product UX, align it with canonical documentation before introducing new UI requirements.

---

# 16. Mutations

Favorite mutations must update the reactive UI immediately.

Required behaviors:

```text
add
→ item becomes favorite
→ count increases
→ Favorites screen updates
```

```text
remove
→ item is no longer favorite
→ count decreases
→ Favorites screen updates
```

```text
toggle
→ delegates to correct add/remove behavior
```

Avoid duplicate entries.

---

# 17. Persistence and Reactive State

In-memory state and persisted state must remain synchronized.

Do not implement a flow where UI changes and AsyncStorage is never updated.

Likewise, do not rely on rereading AsyncStorage after every render to determine membership.

Expected ownership:

```text
reactive in-memory collection
        ↓
persist changes
        ↓
AsyncStorage
```

Hydration is the reverse flow at startup.

---

# 18. Failure During Write

Persistence failure must be handled intentionally.

Do not swallow errors blindly.

The implementation may choose either:

- optimistic UI with rollback;
- persistence-first update;

if the behavior remains consistent and is documented when it materially affects UX.

Do not introduce a complex transactional layer for this small local collection.

Prefer the simplest consistent behavior.

---

# 19. Duplicate Prevention

A show may exist only once in Favorites.

Membership must be based on stable show identifier.

Do not use object identity or name as uniqueness criteria.

Correct:

```ts
favorite.id === show.id;
```

---

# 20. Membership Lookup

Expose a clear membership API.

Conceptually:

```ts
isFavorite(showId);
```

Do not force every consumer to repeat:

```ts
favorites.some(...)
```

if the provider/hook already owns that semantic operation.

Keep the public API small.

---

# 21. Favorite Count

Favorite count is derived from the collection.

Conceptually:

```ts
favorites.length;
```

Do not persist a separate count.

Do not create a second state variable that can drift from the actual collection.

The visible badge must react to collection changes.

---

# 22. Favorites Search

Favorites search is local.

Expected flow:

```text
favorites
   ↓
normalized local search
   ↓
matching FavoriteShow[]
```

It must not call:

```text
/search/shows
```

or any TVMaze endpoint.

Matching must be:

- case-insensitive;
- whitespace-normalized according to `SPEC.md`.

---

# 23. Favorites Filters

Status and rating filtering are local transformations.

Expected flow:

```text
FavoriteShow[]
      ↓
local name search
      ↓
status filter
      ↓
rating filter
      ↓
visible favorites
```

Do not trigger remote requests from Favorites filters.

---

# 24. Filter State Ownership

Favorites filter values belong to the Favorites screen or a local reusable hook.

They do not belong to `FavoritesProvider`.

The provider owns the collection.

The screen owns how that collection is currently viewed.

Correct separation:

```text
FavoritesProvider
→ what is favorited

Favorites screen state
→ what subset is currently visible
```

---

# 25. Shared Filtering Logic

Where domain contracts permit, filtering logic may reuse a pure Shows-domain utility.

Do not duplicate identical filtering rules merely because Favorites is a separate feature.

However, Favorites must not import Shows queries, API or components to gain that reuse.

Allowed dependency:

```text
Favorites
→ stable Show domain/filter contract
```

Forbidden:

```text
Favorites
→ Shows API/query internals
```

---

# 26. FavoriteButton

`FavoriteButton` is a Favorites feature component.

It owns favorite-specific interaction.

It should receive enough show information to:

- determine membership;
- add/remove the correct snapshot;
- expose meaningful accessibility text.

Conceptual behavior:

```text
not favorite
→ press
→ add

favorite
→ press
→ remove
```

Do not implement persistence inside the button.

---

# 27. FavoriteButton Accessibility

The button must communicate both show identity and action.

Equivalent accessible intent:

```text
Add Breaking Bad to favorites
```

or:

```text
Remove Breaking Bad from favorites
```

The button must visually communicate current favorite state.

Do not rely exclusively on color to communicate state.

---

# 28. FavoritesBadge

The Favorites badge displays a derived favorite count.

It must react to shared Favorites state.

It must not:

- read AsyncStorage directly;
- maintain its own count state;
- call TVMaze.

The badge is presentation over:

```text
favorites.length
```

---

# 29. Favorites Screen

The route/screen orchestrates:

```text
useFavorites()
      ↓
local search/filter state
      ↓
pure local transformations
      ↓
FlashList
```

The screen must not:

- read AsyncStorage directly;
- perform TVMaze search;
- reconstruct favorite data from remote queries.

Selecting a Favorite opens the normal Show Detail route.

---

# 30. FlashList

Favorites collections use FlashList as defined by the architecture.

Do not replace the primary Favorites collection with:

```text
ScrollView + map
```

Stable item keys use show identifiers.

Favorites may be small, but consistent list architecture is intentional.

---

# 31. Empty States

Distinguish:

## No favorites exist

The user has not saved any favorites.

Use the Favorites onboarding empty state defined by `SPEC.md`.

## Favorites exist but current search/filter has no matches

Use a search/filter-specific empty state.

Do not present both situations with identical messaging.

---

# 32. Loading State

Favorites do not have remote-loading state.

They do have persistence hydration state.

Do not show remote-style API skeleton behavior merely because Favorites data is initially unavailable.

Represent hydration intentionally and minimally.

---

# 33. Error State

Favorites persistence errors are local-storage errors.

Do not present them as TVMaze/network errors.

Error handling must preserve the distinction between:

```text
remote API failure
```

and:

```text
local persistence failure
```

Do not introduce global error infrastructure without architectural justification.

---

# 34. AsyncStorage Rules

Do not call AsyncStorage directly from UI components.

Do not use AsyncStorage as reactive state.

Do not repeatedly deserialize Favorites during render.

AsyncStorage is persistence only.

The reactive source of truth after hydration is the provider state.

---

# 35. TanStack Query Rules

Favorites must not be added to TanStack Query merely because the library already exists.

Do not create:

```ts
queryKey: ['favorites'];
```

for persisted Favorites state.

This would blur the approved remote/client-state boundary.

Changing this requires a documented architecture decision.

---

# 36. Context Rules

The Favorites Context must remain narrow.

Do not add unrelated values such as:

```text
theme
navigation
search
status filter
rating filter
remote shows
episodes
```

If the context begins accumulating unrelated application state, stop and reassess architecture.

A feature-scoped Context is allowed.

A generic AppContext is not.

---

# 37. Rendering and Performance

The Favorites collection is expected to remain relatively small.

Do not introduce complex selector systems or external stores preemptively.

Avoid automatic:

- `React.memo`;
- `useMemo`;
- `useCallback`;

unless structurally justified.

Derived values such as count should remain simple and predictable.

---

# 38. TypeScript Rules

Maintain:

- strict mode;
- `noUncheckedIndexedAccess`;
- serializable persisted contracts.

Avoid:

```ts
any;
```

and broad unsafe casts.

A FavoriteShow must remain compatible with persistence.

Do not put functions, class instances or unserializable values into persisted objects.

---

# 39. Storage Versioning

Do not build a migration framework preemptively.

However, persisted structures should be designed so future versioning remains possible.

If the Favorite snapshot schema changes incompatibly after persistence is already in use, introduce an explicit migration/version strategy rather than silently assuming old data matches the new structure.

---

# 40. Testing Expectations

High-value unit tests include:

```text
add favorite
remove favorite
toggle favorite
duplicate prevention
membership
favorite count derivation
local name search
status filtering
rating filtering
combined search/filter behavior
storage serialization/read behavior
```

High-value component/integration behavior includes:

```text
FavoriteButton toggles visual state

FavoritesBadge reacts to count

FavoritesProvider hydrates persisted favorites

Favorites list reacts after favorite removal

Favorites local search does not require remote behavior
```

---

# 41. Storage Tests

Mock the storage boundary rather than relying on real device persistence.

Tests should verify observable feature behavior.

Do not couple provider tests unnecessarily to AsyncStorage internals.

Prefer:

```text
FavoritesProvider
→ mocked favorites storage boundary
```

when that keeps tests focused.

---

# 42. Test Placement

Prefer colocated tests.

Examples:

```text
storage/
├── favorites.storage.ts
└── favorites.storage.test.ts
```

```text
components/
├── FavoriteButton.tsx
└── FavoriteButton.test.tsx
```

```text
providers/
├── FavoritesProvider.tsx
└── FavoritesProvider.test.tsx
```

Do not create a large centralized test directory by default.

---

# 43. Quality Gates

Before considering a Favorites task complete, run:

```bash
npm run format:check
npm run lint
npm run typecheck
npm run test:ci
```

A task remains incomplete while a relevant quality gate fails.

---

# 44. Prohibited Shortcuts

Do not:

- store Favorites in TanStack Query;
- add Zustand;
- add Redux;
- create a generic AppContext;
- call AsyncStorage directly from screens;
- call AsyncStorage directly from FavoriteButton;
- call TVMaze from Favorites search;
- put filter state inside FavoritesProvider;
- persist a separate favorite count;
- allow duplicate favorites;
- persist the entire TVMaze response without justification;
- import Shows queries from Favorites;
- import Shows API from Favorites;
- disable TypeScript or lint rules to make a task pass;
- add a persistence dependency without updating architecture.

---

# 45. Architecture Change Handling

Do not silently change Favorites state strategy.

If a task appears to require:

- Zustand;
- Redux;
- query-backed Favorites;
- database storage;
- background synchronization;
- cloud persistence;
- new cross-feature ownership;

stop the architectural decision and compare it against canonical documentation.

For a meaningful architecture change:

1. identify the new requirement;
2. explain why the current architecture is insufficient;
3. compare alternatives;
4. update `DECISIONS.md`;
5. update `ARCHITECTURE.md`;
6. update this skill;
7. then implement.

---

# 46. Agent Task Discipline

For each Favorites task:

1. read relevant canonical documentation;
2. inspect existing Favorites code;
3. inspect the stable Shows domain contract if needed;
4. preserve feature boundaries;
5. implement only requested scope;
6. avoid unrelated refactors;
7. add/update relevant tests;
8. run quality gates;
9. summarize behavior and trade-offs.

Do not expand scope without requirement support.

---

# 47. Definition of Done

A Favorites task is complete when:

- behavior matches `SPEC.md`;
- architecture matches `ARCHITECTURE.md`;
- decisions remain compatible with `DECISIONS.md`;
- shared state remains feature-scoped;
- persistence remains behind the storage boundary;
- local search/filtering remains local;
- Favorites does not depend on Shows internals;
- hydration is handled;
- duplicate prevention is guaranteed;
- accessibility is considered;
- tests cover meaningful behavior;
- formatting passes;
- lint passes;
- typecheck passes;
- tests pass.

---

# 48. Core Invariants

The following invariants must remain true:

1. Favorites are client state, not remote state.
2. FavoritesProvider owns reactive Favorites state.
3. AsyncStorage owns persistence only.
4. Favorites are hydrated before persisted state is treated as empty.
5. A show can exist only once in Favorites.
6. Favorite count is derived from the collection.
7. Favorites search is local.
8. Favorites status/rating filters are local.
9. Favorites filters are not stored in the provider.
10. Favorite snapshots remain serializable.
11. Favorites may consume stable Shows domain contracts only.
12. Favorites must not consume Shows API/query internals.
13. FavoriteButton does not perform persistence directly.
14. The Favorites screen does not call TVMaze to reconstruct the collection.
15. Architectural changes must update canonical documentation first.
