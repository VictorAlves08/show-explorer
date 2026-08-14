# Show Explorer — Architectural Decisions

**Status:** Draft
**Version:** 1.0
**Related:** `SPEC.md`, `ARCHITECTURE.md`

## 1. Purpose

This document records the main architectural and technical decisions made for Show Explorer.

Each decision captures:

- context;
- decision;
- alternatives considered;
- trade-offs;
- current status.

The goal is not to document every implementation detail.

Only decisions that materially affect architecture, maintainability, correctness, performance or project scope belong here.

---

# DEC-001 — Use Expo with React Native and TypeScript

**Status:** Accepted

## Context

The assignment allows either React web or React Native.

The chosen implementation target is mobile using React Native.

The project should minimize native setup overhead while still supporting production-grade React Native patterns.

## Decision

Use:

- Expo;
- React Native;
- TypeScript.

TypeScript operates in strict mode.

## Alternatives Considered

- React web;
- React Native CLI without Expo.

## Rationale

Expo provides:

- streamlined project setup;
- managed ecosystem compatibility;
- mature development tooling;
- native module integration through Expo-compatible packages;
- a productive environment for a take-home assignment.

React Native also demonstrates mobile-specific concerns such as:

- long-list rendering;
- touch accessibility;
- navigation;
- persistence;
- mobile UI behavior.

## Trade-offs

Expo introduces framework conventions and dependency compatibility constraints.

A pure React Native CLI project would offer more direct native control, but that control is unnecessary for the current requirements.

---

# DEC-002 — Use Expo Router

**Status:** Accepted

## Context

The application requires:

- Home;
- Favorites;
- Show Detail;
- persistent primary navigation.

## Decision

Use Expo Router as the navigation layer.

Route structure is based on:

```text
Root Stack
├── Tabs
│   ├── Home
│   └── Favorites
└── Show Detail
```

## Alternatives Considered

- manually configured React Navigation;
- custom navigation abstractions.

## Rationale

Expo Router provides:

- file-based routing;
- integration with Expo;
- predictable route ownership;
- deep-link compatibility;
- less boilerplate around navigation structure.

## Trade-offs

File-based routing introduces routing conventions into the source tree.

Some navigation behavior becomes coupled to directory structure.

For this project, the reduction in navigation boilerplate outweighs that cost.

---

# DEC-003 — Use Feature-Based Architecture

**Status:** Accepted

## Context

The application contains two clear business capabilities:

- shows;
- favorites.

A technical-layer-only structure would spread related code across many top-level directories.

## Decision

Organize business code primarily by feature.

Primary features:

```text
features/
├── shows/
└── favorites/
```

Shared infrastructure remains outside feature boundaries.

## Alternatives Considered

- global folders such as `services`, `models`, `components`, `hooks`;
- Clean Architecture with controllers, repositories, use cases and entities;
- fully domain-driven layered architecture.

## Rationale

Feature-based architecture provides:

- clear ownership;
- high local cohesion;
- easier code navigation;
- lower coupling between unrelated business capabilities.

It also scales naturally if additional features are introduced.

## Trade-offs

Some technical concepts exist in more than one feature.

Feature boundaries require discipline to avoid arbitrary cross-feature imports.

The architecture intentionally avoids deeper layering until it solves a concrete problem.

---

# DEC-004 — Use TanStack Query for Remote State

**Status:** Accepted

## Context

The application consumes remote TVMaze data for:

- browse;
- search;
- show detail;
- episodes.

These data flows require:

- loading state;
- errors;
- retries;
- caching;
- request deduplication;
- infinite pagination.

## Decision

Use TanStack Query as the owner of all TVMaze-backed remote state.

## Alternatives Considered

- manual `useEffect` + `useState`;
- Redux;
- Zustand;
- custom request hooks without a cache layer.

## Rationale

TanStack Query directly models server-state concerns.

It prevents the application from recreating:

- cache management;
- loading state;
- retry logic;
- request lifecycle;
- pagination state.

## Trade-offs

TanStack Query adds a dependency and requires understanding its cache semantics.

It must not become a generic state-management solution for unrelated client state.

---

# DEC-005 — Do Not Use Redux or Zustand

**Status:** Accepted

## Context

The application has limited shared client state.

The main shared local domain is Favorites.

Remote state is already owned by TanStack Query.

Search and filter state is screen-local.

## Decision

Do not introduce Redux or Zustand.

## Alternatives Considered

- Redux Toolkit;
- Zustand.

## Rationale

Neither library currently solves enough complexity to justify another global state abstraction.

Current ownership is already clear:

```text
remote state
→ TanStack Query

favorites
→ FavoritesProvider

screen interaction state
→ local React state
```

## Trade-offs

If client-side state grows significantly, the current approach may require reevaluation.

The absence of a global store means cross-cutting client state should not be introduced casually.

---

# DEC-006 — Use a Feature-Scoped FavoritesProvider

**Status:** Accepted

## Context

Favorites must be reactive across:

- Home;
- Favorites;
- Show Detail;
- Favorites count.

AsyncStorage alone provides persistence but not reactive state propagation.

## Decision

Use a feature-scoped React Context through `FavoritesProvider`.

## Alternatives Considered

- Zustand;
- TanStack Query as local-state cache;
- isolated `useState` + AsyncStorage;
- generic AppContext.

## Rationale

A dedicated provider:

- keeps favorites reactive;
- provides a narrow ownership boundary;
- avoids another dependency;
- remains semantically aligned with client state.

The provider is intentionally limited to Favorites.

## Trade-offs

Context consumers can rerender when provider state changes.

The favorites collection is expected to remain small enough that this is not a concern.

The provider must not evolve into a generic application store.

---

# DEC-007 — Persist Favorite Snapshots, Not Only IDs

**Status:** Accepted

## Context

Favorites must:

- persist across reloads;
- render immediately;
- support local name search;
- support local status filtering;
- support local rating filtering.

Persisting only identifiers would require remote reconstruction or cache dependence.

## Decision

Persist a minimal presentation snapshot for each favorite.

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

## Alternatives Considered

- persist show IDs only;
- persist the complete TVMaze show payload;
- persist TanStack Query cache.

## Rationale

A minimal snapshot provides enough local information for Favorites behavior while keeping storage simple.

It avoids unnecessary network dependency.

## Trade-offs

Persisted data can become temporarily stale relative to TVMaze.

The snapshot is therefore treated as local presentation data, not an authoritative remote record.

---

# DEC-008 — Use AsyncStorage for Favorites Persistence

**Status:** Accepted

## Context

Favorites require lightweight persistent local storage.

The data volume is small and does not require relational queries.

## Decision

Use AsyncStorage.

## Alternatives Considered

- SQLite;
- SecureStore;
- MMKV;
- persisted TanStack Query cache.

## Rationale

AsyncStorage is sufficient for:

- small serializable collections;
- simple read/write behavior;
- persistence across reloads.

## Trade-offs

AsyncStorage is not designed for complex queries or large datasets.

If persistence requirements become more sophisticated, a different storage engine may become appropriate.

---

# DEC-009 — Use Native `fetch` Instead of Axios

**Status:** Accepted

## Context

The application requires a small number of straightforward HTTP requests.

## Decision

Use native `fetch`.

Wrap generic HTTP behavior in a small `lib/api` boundary.

## Alternatives Considered

- Axios;
- another HTTP client library.

## Rationale

The required functionality is limited to:

- GET requests;
- status validation;
- JSON parsing;
- normalized errors.

Adding Axios would not materially reduce complexity.

## Trade-offs

Some conveniences such as interceptors are not available out of the box.

If HTTP requirements become significantly more complex, the choice may be revisited.

---

# DEC-010 — Normalize TVMaze Responses Before Presentation

**Status:** Accepted

## Context

TVMaze browse and search endpoints return different response shapes.

Browse returns show objects directly.

Search wraps each show inside a search-result object.

The assignment explicitly highlights this difference.

## Decision

Introduce a DTO → mapper → domain boundary.

Both endpoint shapes must normalize into the same internal Show model.

## Alternatives Considered

- branch on response shape inside the UI;
- expose raw DTOs through hooks;
- use the TVMaze shape as the domain model.

## Rationale

Normalization:

- prevents API-specific response details from leaking into UI;
- makes browse and search presentation consistent;
- makes domain behavior easier to test;
- isolates external API changes.

## Trade-offs

Mapping introduces additional files and code.

That cost is justified because the API inconsistency is explicit and central to the challenge.

---

# DEC-011 — Do Not Introduce Runtime Schema Validation Initially

**Status:** Accepted

## Context

External API data is inherently untrusted.

Runtime schema libraries could validate TVMaze responses.

## Decision

Do not introduce Zod or another runtime validation library in the initial implementation.

Use:

- explicit DTO types;
- defensive mapping;
- nullable fields;
- HTTP validation.

## Alternatives Considered

- Zod;
- Valibot;
- custom runtime validators.

## Rationale

The application is small and consumes a stable public API.

A schema-validation dependency would add implementation and maintenance cost without sufficient current benefit.

## Trade-offs

TypeScript types do not validate runtime payloads.

Unexpected structural API changes may therefore reach the mapper boundary.

This decision should be revisited if API reliability requirements increase.

---

# DEC-012 — Separate Browse and Search Data Acquisition

**Status:** Accepted

## Context

TVMaze uses separate endpoints for:

- paginated browse;
- name search.

The endpoints differ in semantics and response shape.

## Decision

Treat Home as operating in one of two acquisition modes:

```text
empty search
→ browse mode

non-empty search
→ remote search mode
```

## Alternatives Considered

- merge browse and search into one generalized query abstraction;
- search only inside already loaded browse pages.

## Rationale

Browse and search are distinct remote operations.

Keeping them separate preserves the semantics of the external API.

## Trade-offs

Home must orchestrate two query paths.

This is preferable to hiding meaningful differences behind an artificial abstraction.

---

# DEC-013 — Home Search Is Remote; Favorites Search Is Local

**Status:** Accepted

## Context

Home searches the TVMaze catalog.

Favorites searches only the user's persisted collection.

## Decision

Home uses TVMaze search.

Favorites performs local case-insensitive matching.

## Alternatives Considered

- always use TVMaze search;
- share one generic search data source.

## Rationale

Remote Favorites search would:

- perform unnecessary network requests;
- potentially return shows that are not favorites;
- make persisted favorites dependent on remote availability.

## Trade-offs

The same visual search control has different underlying behavior depending on the screen.

That difference is intentional and should remain explicit.

---

# DEC-014 — Keep Search and Filters Screen-Local

**Status:** Accepted

## Context

Home and Favorites expose the same search/status/rating controls.

The product does not require filter selection to persist between screens.

## Decision

Each screen owns an independent search/filter state.

A reusable hook may encapsulate behavior without creating shared global state.

## Alternatives Considered

- Context;
- Zustand;
- route parameters;
- persisted filters.

## Rationale

State should live at the narrowest level that requires it.

Sharing visual controls does not imply sharing their state.

## Trade-offs

Navigating between Home and Favorites does not preserve identical selections across both screens.

That behavior is intentional and documented in the product specification.

---

# DEC-015 — Status and Rating Filtering Are Client-Side

**Status:** Accepted

## Context

The assignment requires status filtering.

The product additionally introduces minimum-rating filtering.

The chosen TVMaze endpoints do not provide these exact filter semantics for the current browse/search architecture.

## Decision

Apply status and rating filters to the currently available dataset in the client.

## Alternatives Considered

- fetch every TVMaze page to build a complete filtered result;
- introduce another external search strategy;
- build a backend proxy.

## Rationale

Fetching the entire catalog would:

- create unnecessary network traffic;
- conflict with rate-limit awareness;
- delay presentation;
- introduce significant complexity.

Client-side filtering is predictable and appropriate to the take-home scope.

## Trade-offs

In browse mode, filtering is not globally exhaustive across every show in TVMaze.

The filter applies to data currently loaded by the application.

This limitation is explicitly documented.

---

# DEC-016 — Add Rating Filter as a Product Enhancement

**Status:** Accepted

## Context

The assignment requires status filtering but does not require rating filtering.

The project aims to add one small discovery enhancement without substantially expanding scope.

## Decision

Add minimum-rating filtering with options:

- Any;
- 6+;
- 7+;
- 8+;
- 9+.

## Alternatives Considered

- no additional filter;
- rating slider;
- sorting by rating.

## Rationale

Discrete thresholds are:

- mobile-friendly;
- easy to understand;
- easy to test;
- low complexity.

A slider adds interaction complexity without meaningful value for this assignment.

## Trade-offs

The feature is beyond the explicit assignment requirements and therefore consumes implementation time.

Its scope is intentionally constrained.

---

# DEC-017 — Use FlashList for Primary Show Lists

**Status:** Accepted

## Context

Home uses infinite scrolling and may render large collections.

Favorites and search results use the same show-card presentation.

## Decision

Use FlashList for primary show collections.

## Alternatives Considered

- FlatList;
- ScrollView;
- custom virtualization.

## Rationale

FlashList is designed for performant React Native list rendering and fits the infinite-list requirement.

It also communicates deliberate attention to mobile list performance.

## Trade-offs

It adds another dependency.

For small lists, the performance difference may be negligible.

The dependency remains justified because infinite browsing is a central product behavior.

---

# DEC-018 — Use Skeletons for Initial and Pagination Loading

**Status:** Accepted

## Context

The assignment explicitly requires loading states.

Infinite pagination should preserve visual continuity.

## Decision

Use:

```text
initial load
→ show-card skeleton collection

pagination
→ skeleton cards appended at list footer
```

## Alternatives Considered

- full-screen spinner;
- footer ActivityIndicator only.

## Rationale

Skeletons:

- preserve approximate layout;
- communicate progress;
- keep existing content visible during pagination;
- create a more polished mobile experience.

## Trade-offs

Skeleton components require additional presentation code.

They must not become overly elaborate or visually distracting.

---

# DEC-019 — Use expo-image for Show Images

**Status:** Accepted

## Context

Shows contain remote poster images and are rendered inside long lists.

## Decision

Use `expo-image`.

## Alternatives Considered

- React Native `Image`;
- third-party image libraries.

## Rationale

`expo-image` integrates naturally with Expo and provides behavior suitable for remote image rendering and caching.

## Trade-offs

Another Expo-specific dependency is introduced.

This is acceptable within an Expo-based application.

---

# DEC-020 — Use NativeWind with Semantic Tokens

**Status:** Accepted

## Context

The application has no provided design.

A consistent lightweight design system is required without introducing a heavy UI library.

## Decision

Use NativeWind with semantic design tokens.

Styling hierarchy:

```text
semantic tokens
→ UI primitives
→ feature components
→ screens
```

## Alternatives Considered

- StyleSheet only;
- Tamagui;
- NativeBase;
- another component library;
- raw Tailwind-style color utilities everywhere.

## Rationale

NativeWind provides productive styling while semantic tokens maintain consistency.

The design system remains small and product-specific.

## Trade-offs

NativeWind introduces build-time tooling and framework-specific styling conventions.

The project must avoid long arbitrary utility lists that undermine semantic consistency.

---

# DEC-021 — Do Not Use a Heavy Component Library

**Status:** Accepted

## Context

The UI requirements are relatively small.

The project needs:

- buttons;
- chips;
- badges;
- skeletons;
- states;
- cards.

## Decision

Create small internal primitives rather than introducing a full UI framework.

## Alternatives Considered

- NativeBase;
- Tamagui;
- Paper;
- another component system.

## Rationale

A heavy UI framework would:

- increase dependency surface;
- constrain visual decisions;
- add concepts unnecessary for the assignment.

## Trade-offs

Some components must be implemented locally.

That work is intentionally limited to primitives actually used by the application.

---

# DEC-022 — Group Episodes by Season

**Status:** Accepted

## Context

The assignment marks grouping episodes by season as a bonus.

The product should present episode data in a structured, usable form.

## Decision

Promote season grouping from optional bonus to required product behavior.

Episodes are transformed into:

```ts
type Season = {
  number: number;
  episodes: Episode[];
};
```

## Alternatives Considered

- flat episode list;
- grouping directly inside JSX.

## Rationale

Season grouping significantly improves readability while requiring only a small pure transformation.

The transformation is easy to unit test.

## Trade-offs

Adds one domain/presentation transformation and grouping logic.

The value-to-complexity ratio is strongly favorable.

---

# DEC-023 — Use Collapsible Season Sections

**Status:** Accepted

## Context

Some shows contain many seasons and many episodes.

Rendering every episode expanded creates a very long detail screen.

## Decision

Present seasons as independently collapsible sections.

Initial state:

```text
first season
→ expanded

remaining seasons
→ collapsed
```

## Alternatives Considered

- all seasons expanded;
- all seasons collapsed;
- third-party accordion component.

## Rationale

The approach:

- improves scanability;
- reduces initial visual density;
- requires minimal local state;
- avoids another dependency.

## Trade-offs

The first-season-open policy is a product convention rather than a universal rule.

It remains explicitly documented and can be changed without affecting data architecture.

---

# DEC-024 — Keep Show and Episode Queries Independent

**Status:** Accepted

## Context

Show Detail requires both:

- show information;
- episodes.

The resources have different loading and failure behavior.

## Decision

Use separate queries for show detail and episodes.

## Alternatives Considered

- one query using `Promise.all`;
- a single combined endpoint abstraction.

## Rationale

Independent queries provide:

- separate cache entries;
- isolated errors;
- granular loading UI;
- better reuse;
- episodes can fail without invalidating show information.

## Trade-offs

The detail screen orchestrates more than one query.

That orchestration reflects the actual resource boundaries and is therefore intentional.

---

# DEC-025 — Use Pure Functions for Domain Transformations

**Status:** Accepted

## Context

Several behaviors are deterministic transformations:

- status normalization;
- search normalization;
- filtering;
- episode grouping.

## Decision

Implement these behaviors as pure functions where practical.

## Alternatives Considered

- embed transformation logic directly in components;
- hide transformation inside mutable stores.

## Rationale

Pure functions are:

- easy to test;
- easy to reason about;
- reusable;
- independent of React rendering.

## Trade-offs

Some additional small utility modules may exist.

They must remain focused and not become generic dumping grounds.

---

# DEC-026 — Use Jest and React Native Testing Library

**Status:** Accepted

## Context

The project requires confidence in:

- domain transformations;
- component behavior;
- important user flows.

## Decision

Use:

- Jest;
- jest-expo;
- React Native Testing Library.

## Alternatives Considered

- Vitest;
- Detox;
- Maestro;
- no component testing.

## Rationale

The chosen tools align with React Native component behavior and the Expo environment.

They cover the current test scope without introducing a device-level E2E stack.

## Trade-offs

Unit/component tests do not replace true device E2E coverage.

E2E is intentionally deferred.

---

# DEC-027 — Do Not Add Initial E2E Automation

**Status:** Accepted

## Context

The take-home scope is small and implementation time should prioritize core functionality, UX and maintainability.

## Decision

Do not introduce an E2E framework in the initial implementation.

## Alternatives Considered

- Maestro;
- Detox.

## Rationale

E2E setup would consume meaningful project time while providing limited incremental signal for the initial scope.

Unit and integration-oriented component tests provide better value initially.

## Trade-offs

Navigation and full-device integration are not automatically validated end-to-end.

E2E is a candidate for future work.

---

# DEC-028 — Use ESLint, Prettier, Strict TypeScript and CI

**Status:** Accepted

## Context

The repository should provide reproducible quality checks.

## Decision

Use:

- ESLint;
- Prettier;
- TypeScript strict mode;
- `noUncheckedIndexedAccess`;
- GitHub Actions.

Quality gates:

```text
format:check
lint
typecheck
test:ci
```

## Alternatives Considered

- local-only validation;
- extensive pre-commit tooling.

## Rationale

CI creates a reproducible minimum quality baseline.

The chosen checks are simple and high-value.

## Trade-offs

CI adds configuration and execution time.

The project intentionally avoids adding Husky, lint-staged and commit hooks before a concrete need exists.

---

# DEC-029 — Avoid Premature Barrel Files

**Status:** Accepted

## Context

Barrel exports can simplify imports but can also obscure boundaries and introduce circular dependencies.

## Decision

Do not create `index.ts` barrel files by default.

Introduce them only when they represent a meaningful public module boundary.

## Alternatives Considered

- barrel file in every directory.

## Rationale

Explicit imports make ownership clearer in a small-to-medium project.

## Trade-offs

Some import paths are slightly longer.

The `@/*` alias already reduces deep relative-path noise.

---

# DEC-030 — Use Feature-Level Agent Skills

**Status:** Accepted

## Context

The assignment allows AI-assisted development and requires AI usage disclosure.

The project will use Codex during implementation.

Generic prompts alone can lose architectural context over time.

## Decision

Create feature-specific agent skills after canonical documentation is approved.

Expected:

```text
features/shows/SKILL.md
features/favorites/SKILL.md
```

## Alternatives Considered

- one large project prompt;
- no repository agent guidance;
- prompts only in chat history.

## Rationale

Feature skills provide durable local guidance for:

- ownership;
- invariants;
- dependencies;
- testing expectations;
- prohibited architectural shortcuts.

They derive from canonical project documentation.

## Trade-offs

Skills create documentation that must remain synchronized.

They therefore must not redefine requirements independently.

---

# DEC-031 — Canonical Documentation Precedes Agent Prompts

**Status:** Accepted

## Context

AI prompts can unintentionally become competing specifications.

## Decision

Use the following authority order:

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

## Alternatives Considered

- task prompts as primary source of truth;
- code-only architecture.

## Rationale

This ensures implementation is driven by stable repository documentation rather than conversational memory.

## Trade-offs

Documentation must be maintained when intentional architectural changes occur.

This is considered a beneficial constraint.

---

# DEC-032 — Document Ambiguities Instead of Hiding Them

**Status:** Accepted

## Context

The assignment explicitly allows reasonable interpretation of ambiguous requirements and asks that such decisions be documented.

One major ambiguity is status filtering over paginated browse results.

## Decision

Record assumptions and limitations explicitly in:

- `SPEC.md`;
- `DECISIONS.md`;
- README where relevant.

## Alternatives Considered

- silently choose behavior;
- over-engineer a global catalog solution.

## Rationale

Explicit trade-offs demonstrate engineering judgment and make reviewer expectations clear.

## Trade-offs

Documentation exposes known limitations.

This is intentional and preferable to implying behavior the application does not provide.

---

# DEC-033 — Do Not Optimize by Default

**Status:** Accepted

## Context

React applications can accumulate unnecessary memoization and abstraction driven by optimization folklore rather than actual cost.

## Decision

Do not apply:

- `React.memo`;
- `useMemo`;
- `useCallback`;

systematically.

Use them when:

- a structurally expensive transformation exists;
- referential stability matters;
- profiling or predictable render cost justifies it.

## Alternatives Considered

- aggressive memoization by default.

## Rationale

Unnecessary memoization increases cognitive complexity and can provide no practical performance benefit.

## Trade-offs

Some optimizations may be introduced later rather than preemptively.

This is intentional.

---

# DEC-034 — Keep Dependencies Purpose-Driven

**Status:** Accepted

## Context

Take-home projects can become overloaded with libraries chosen to signal familiarity rather than solve actual requirements.

## Decision

A new dependency requires a concrete justification.

Acceptable reasons include:

- meaningful complexity reduction;
- correctness guarantees;
- substantial performance benefit;
- ecosystem-standard solution to an actual requirement.

## Alternatives Considered

- broad adoption of familiar ecosystem libraries.

## Rationale

A smaller dependency surface improves:

- maintainability;
- upgradeability;
- reviewer comprehension;
- architecture clarity.

## Trade-offs

Some utilities or primitives must be implemented locally.

That is acceptable when the implementation is small and explicit.

---

# 2. Rejected / Deferred Technologies

The following technologies are intentionally excluded from the initial architecture.

## Redux

Rejected because current application-wide client state complexity does not justify it.

## Zustand

Rejected because Favorites can be represented cleanly by a feature-scoped provider.

## Axios

Rejected because native `fetch` covers current HTTP requirements.

## Zod

Deferred because runtime schema validation adds limited value at current scope.

## SQLite

Rejected because persistent data is small and non-relational.

## Storybook

Deferred because the internal design system is intentionally small.

## E2E framework

Deferred in favor of unit/component coverage for the initial implementation.

## Generic repository interfaces

Rejected because there is no current need for multiple interchangeable persistence or API implementations.

## Dependency injection framework

Rejected because dependency relationships remain simple and explicit.

---

# 3. Decision Change Process

An accepted decision is not immutable.

If implementation reveals new constraints:

1. identify the concrete problem;
2. evaluate whether the current decision still holds;
3. document alternatives and trade-offs;
4. update this file;
5. update `ARCHITECTURE.md` if necessary;
6. update affected feature skills;
7. only then implement the architectural change.

Code should not silently invalidate an accepted decision.

---

# 4. Current Baseline Summary

The accepted baseline is:

```text
Expo
React Native
TypeScript strict
Expo Router

Feature-based architecture

TanStack Query
→ remote TVMaze state

FavoritesProvider
→ reactive shared favorites

AsyncStorage
→ favorites persistence

local state
→ screen search and filters

fetch
→ HTTP

DTO → mapper → domain
→ API normalization

NativeWind + semantic tokens
→ styling

FlashList
→ long show lists

expo-image
→ remote images

Jest + React Native Testing Library
→ tests

ESLint + Prettier + TypeScript + GitHub Actions
→ quality gates
```

The guiding principle is:

> Prefer explicit ownership and justified simplicity over architectural ceremony.
