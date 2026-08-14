# Show Explorer — Agent Instructions

## Purpose

This file defines the default operating rules for AI coding agents working in this repository.

It is not a product specification and it is not an architectural decision record.

Canonical project authority is:

1. `docs/SPEC.md`
2. `docs/ARCHITECTURE.md`
3. `docs/DECISIONS.md`
4. feature `SKILL.md`
5. task-specific prompt
6. implementation

If two sources conflict, the higher-level source wins.

---

# 1. Read Before Changing Code

Before implementing a task:

1. identify the affected feature;
2. read the relevant sections of `docs/SPEC.md`;
3. read the relevant sections of `docs/ARCHITECTURE.md`;
4. consult `docs/DECISIONS.md` for related accepted decisions;
5. read the feature `SKILL.md` if one exists;
6. inspect the current code before proposing changes.

Do not implement from the task prompt alone when repository documentation already defines the behavior.

---

# 2. Feature Skills

Feature-specific operating rules currently exist at:

```text
src/features/shows/SKILL.md
src/features/favorites/SKILL.md
```

When modifying a feature, its skill is mandatory context.

Feature skills do not override canonical documentation.

---

# 3. Scope Discipline

Implement only the requested scope.

Do not:

- add unrelated features;
- perform broad cleanup;
- rename unrelated files;
- reorganize working architecture;
- introduce speculative abstractions;
- upgrade dependencies without a requirement;
- refactor working code merely for preference.

If a small local refactor is required to implement the requested behavior safely, keep it narrowly scoped and explain why it was necessary.

---

# 4. Architecture Discipline

Preserve the architecture described in `docs/ARCHITECTURE.md`.

Important invariants include:

- TanStack Query owns TVMaze-backed remote state.
- FavoritesProvider owns shared reactive Favorites state.
- AsyncStorage is persistence, not reactive state.
- Home search is remote.
- Favorites search is local.
- Search/filter state is screen-local.
- DTOs do not reach presentation components.
- TVMaze responses cross a DTO → mapper → domain boundary.
- Show detail and episode queries remain independent.
- Shared UI does not contain Shows/Favorites business logic.
- Generic infrastructure does not depend on business features.
- Shows does not depend on Favorites implementation.
- Favorites may consume stable public Shows domain contracts only.
- Long show collections use FlashList.

Do not silently violate these rules.

---

# 5. Architecture Changes

If the requested task appears to require an architecture change:

1. identify the exact conflict;
2. explain why the existing architecture is insufficient;
3. propose the smallest viable change;
4. compare relevant trade-offs;
5. do not implement the architectural change until canonical documentation is updated.

Examples of architecture changes include introducing:

- Redux;
- Zustand;
- a generic AppContext;
- Axios;
- runtime schema validation;
- SQLite;
- a new state ownership model;
- a new persistence strategy;
- new cross-feature dependencies;
- a heavy UI framework.

Do not work around accepted decisions silently.

---

# 6. Dependency Policy

Do not add a dependency unless it materially:

- reduces complexity;
- improves correctness;
- provides a required performance capability;
- or is the ecosystem-standard solution to a real requirement.

Do not add dependencies merely to reduce a few lines of straightforward code.

Before adding a dependency, check whether the existing stack already solves the problem.

---

# 7. TypeScript

Maintain strict TypeScript.

Do not introduce:

```ts
any;
```

unless required by an external interoperability boundary and locally justified.

Do not suppress type errors using broad casts such as:

```ts
value as SomeDomainType;
```

when the correct solution is DTO mapping or explicit narrowing.

Preserve:

```text
strict
noUncheckedIndexedAccess
```

External data must be handled defensively.

---

# 8. React State

State should live at the narrowest appropriate owner.

Do not promote state to Context merely because multiple components exist.

Use:

```text
TanStack Query
→ remote TVMaze state

FavoritesProvider
→ shared Favorites state

screen-local React state
→ search, filters, local UI interaction

component-local state
→ presentation state such as accordion expansion
```

Avoid duplicating query state into local state.

---

# 9. Networking

Do not call TVMaze directly from screens or presentation components.

Expected flow:

```text
screen/component
      ↓
query hook
      ↓
feature API
      ↓
shared HTTP infrastructure
      ↓
TVMaze
```

Use the existing native `fetch` infrastructure.

Do not introduce Axios without an approved architectural change.

---

# 10. API Data

External TVMaze response types are DTOs.

DTOs must not be used directly by UI.

Use:

```text
DTO
 ↓
mapper
 ↓
domain model
 ↓
presentation
```

Browse and search response-shape differences must end at the API/mapping boundary.

---

# 11. UI

Use the existing NativeWind + semantic-token styling strategy.

Prefer shared primitives when a truly generic UI responsibility already exists.

Do not move domain-aware components into `src/components/ui`.

Examples:

```text
Button
Chip
Skeleton
→ shared UI
```

```text
ShowCard
FavoriteButton
SeasonAccordion
→ feature components
```

Do not introduce raw visual conventions that conflict with the semantic design tokens without a concrete reason.

---

# 12. Performance

Preserve the approved list architecture.

Use FlashList for primary show collections.

Do not use:

```text
ScrollView + array.map
```

for long show lists.

Do not automatically add:

- `React.memo`;
- `useMemo`;
- `useCallback`.

Use memoization when there is a concrete render-cost or referential-stability reason.

---

# 13. Accessibility

Accessibility is part of implementation quality, not optional polish.

For interactive controls, consider:

- accessible labels;
- selected state;
- expanded/collapsed state;
- touch target size;
- avoiding color-only meaning.

Feature skills contain domain-specific accessibility expectations.

---

# 14. Loading, Error and Empty States

Do not implement the successful path only.

When a task touches asynchronous or filtered behavior, check the relevant states in `SPEC.md`.

Examples include:

- initial loading;
- pagination loading;
- search loading;
- empty search;
- empty filtered result;
- pagination failure;
- episode failure;
- favorites hydration.

Preserve already available content when an isolated sub-resource fails.

---

# 15. Testing

Add or update tests for meaningful behavior changed by the task.

Prefer:

- unit tests for pure transformations;
- React Native Testing Library for component behavior;
- observable behavior over implementation details.

Prefer colocated tests.

Do not overmock internal implementation details when a stable boundary can be mocked instead.

---

# 16. Test Boundaries

For remote behavior, prefer mocking the API/HTTP boundary rather than TanStack Query internals when practical.

For Favorites persistence, prefer mocking the Favorites storage boundary rather than asserting AsyncStorage internals from provider tests.

Pure functions should be tested without React.

---

# 17. Quality Gates

Before declaring a coding task complete, run:

```bash
npm run format:check
npm run lint
npm run typecheck
npm run test:ci
```

If formatting changes are required, run:

```bash
npm run format
```

and re-run the quality gates.

Do not claim task completion while a relevant quality gate fails.

---

# 18. Do Not Hide Failures

Do not make a task pass by:

- disabling lint rules;
- adding broad TypeScript ignores;
- using `skipLibCheck` as a task-level workaround;
- using unsafe casts;
- deleting meaningful tests;
- weakening assertions;
- swallowing errors without reason.

Fix the cause whenever reasonably possible.

---

# 19. File Creation

Do not create placeholder files or directories only to match a target architecture diagram.

Create code when a real responsibility exists.

Avoid barrel files by default.

Do not create `index.ts` files merely to shorten imports.

---

# 20. Imports

Use the `@/*` alias for cross-directory imports.

Example:

```ts
import { queryClient } from '@/lib/query/queryClient';
```

Short local relative imports inside the same cohesive directory are acceptable.

Avoid deep relative traversal.

---

# 21. Comments

Prefer self-explanatory code.

Add comments when they explain:

- a non-obvious constraint;
- an external API quirk;
- a deliberate trade-off;
- behavior that would otherwise look incorrect.

Do not narrate obvious code line by line.

---

# 22. Error Handling

Do not introduce global alerts or toasts from infrastructure layers.

Infrastructure identifies failures.

Features decide presentation.

Keep remote API failures distinct from local persistence failures.

---

# 23. Agent Output After Implementation

After completing a task, report concisely:

1. what changed;
2. main files changed;
3. tests added/updated;
4. quality-gate status;
5. any deliberate trade-off or remaining limitation.

Do not provide a long retrospective unless requested.

---

# 24. If Blocked

If implementation is blocked by a genuine ambiguity not covered by canonical documentation:

- do not silently guess an architectural answer;
- state the ambiguity;
- identify the affected requirement or decision;
- propose the smallest reasonable options.

For small implementation details that do not affect product behavior or architecture, make a reasonable local choice and continue.

---

# 25. Prohibited Default Behaviors

Do not:

- introduce Redux;
- introduce Zustand;
- create a generic application Context;
- add Axios;
- add Zod without architecture approval;
- use TanStack Query for Favorites;
- put remote API state in FavoritesProvider;
- put screen filters in FavoritesProvider;
- call TVMaze from Favorites search;
- call AsyncStorage directly from UI;
- expose DTOs to UI;
- fetch the entire TVMaze catalog for filtering;
- combine show-detail and episode queries;
- replace FlashList with a non-virtualized primary list;
- add broad refactors unrelated to the task;
- silently change canonical documentation.

---

# 26. Definition of Done

A task is complete when:

- requested behavior is implemented;
- `SPEC.md` is respected;
- `ARCHITECTURE.md` is respected;
- accepted decisions remain valid;
- the relevant feature skill is respected;
- tests cover meaningful changed behavior;
- loading/error/empty behavior is addressed when relevant;
- accessibility is considered;
- formatting passes;
- lint passes;
- TypeScript passes;
- tests pass.

---

# 27. Guiding Principle

Prefer:

> explicit ownership, small boundaries, and justified simplicity

over:

> architectural ceremony, speculative abstraction, or dependency accumulation.

# 28. Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.
