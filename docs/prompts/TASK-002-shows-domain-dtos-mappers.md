# TASK-002 — Shows Domain, DTOs and Mappers

## Task

**Title:** Shows Domain, DTOs and Mappers

**Status:** Ready

**Primary feature:** shows

---

# 1. Objective

Implement the Shows domain contracts, TVMaze DTO contracts and mapping functions required to normalize external TVMaze data into internal application models.

The implementation must establish a clear boundary:

```text
TVMaze payload
→ DTO
→ mapper
→ domain model
```

Do not implement API endpoint functions, TanStack Query hooks or UI in this task.

---

# 2. Required Context

Before modifying code, read:

1. `AGENTS.md`
2. relevant sections of `docs/SPEC.md`
3. relevant sections of `docs/ARCHITECTURE.md`
4. relevant decisions in `docs/DECISIONS.md`
5. `src/features/shows/SKILL.md`

Especially review:

- Domain Models
- TVMaze API Boundary
- Response Normalization
- Runtime Validation
- TypeScript Rules
- DEC-010 — normalize TVMaze responses
- DEC-011 — no runtime schema validation initially
- DEC-025 — pure functions for domain transformations

---

# 3. Inspect Before Editing

Before making changes:

1. inspect `src/features/shows/domain`;
2. inspect `src/features/shows/api`;
3. inspect existing HTTP infrastructure;
4. inspect current TypeScript conventions;
5. preserve existing alias usage and file naming conventions.

Do not change shared infrastructure unless strictly required.

---

# 4. Scope

## In Scope

- Show domain types;
- Show status domain normalization;
- Episode domain types;
- Season domain/presentation type;
- TVMaze Show DTO types;
- TVMaze Search Result DTO type;
- TVMaze Episode DTO type;
- show mapper;
- search-result mapper;
- episode mapper;
- focused unit tests for mapping and normalization.

## Out of Scope

- TVMaze endpoint functions;
- network requests;
- TanStack Query;
- pagination logic;
- search hooks;
- filtering utilities;
- episode grouping;
- UI components;
- Favorites implementation;
- runtime schema validation library.

---

# 5. Domain Models

Create domain contracts inside:

```text
src/features/shows/domain/
```

Expected files:

```text
show.ts
episode.ts
season.ts
```

---

# 6. Show Domain

Create a normalized Show model conceptually equivalent to:

```ts
export type ShowStatus = 'running' | 'ended' | 'to-be-determined' | 'unknown';

export type Show = {
  id: number;
  name: string;
  imageUrl: string | null;
  status: ShowStatus;
  rating: number | null;
  genres: string[];
  summary: string | null;
  premieredAt: string | null;
};

export type ShowListItem = Pick<Show, 'id' | 'name' | 'imageUrl' | 'status' | 'rating' | 'genres'>;
```

Minor naming refinements are acceptable if they preserve the same semantics.

Do not expose raw TVMaze status strings as the domain type.

---

# 7. Show Status Normalization

Implement a pure status-normalization function.

Expected external values include at least:

```text
Running
Ended
To Be Determined
```

Map them to:

```text
running
ended
to-be-determined
```

Any unknown or unsupported external status must map to:

```text
unknown
```

The normalization must be deterministic and independently testable.

Do not throw for an unknown external status.

---

# 8. Episode Domain

Create an internal Episode model conceptually equivalent to:

```ts
export type Episode = {
  id: number;
  name: string;
  season: number;
  number: number | null;
  runtime: number | null;
  airdate: string | null;
  summary: string | null;
};
```

Keep nullable fields explicit.

Do not infer default values such as `0` for missing episode numbers or runtime.

---

# 9. Season Domain

Create:

```ts
export type Season = {
  number: number;
  episodes: Episode[];
};
```

Do not implement grouping in this task.

`Season` is only the contract required by the future grouping task.

---

# 10. TVMaze DTOs

Create DTO contracts inside:

```text
src/features/shows/api/
```

Expected file:

```text
shows.dto.ts
```

DTOs should reflect TVMaze transport structure, not presentation preferences.

Define the minimum remote shape required by the current product.

Avoid modeling every TVMaze field if the application does not need it.

---

# 11. Show DTO

The Show DTO must contain enough information to map:

- id;
- name;
- image;
- status;
- rating;
- genres;
- summary;
- premiered date.

Conceptually, relevant remote data includes structures similar to:

```ts
type TvMazeShowDto = {
  id: number;
  name: string;
  status: string;
  genres: string[];
  summary: string | null;
  premiered: string | null;
  rating: {
    average: number | null;
  };
  image: {
    medium: string;
    original: string;
  } | null;
};
```

Model nullable API fields defensively.

Do not include UI-specific properties.

---

# 12. Search DTO

TVMaze search results wrap a Show.

Model this explicitly:

```ts
export type TvMazeSearchResultDto = {
  score: number;
  show: TvMazeShowDto;
};
```

Do not flatten this at the DTO layer.

The wrapper belongs to the external contract.

---

# 13. Episode DTO

Create the minimum TVMaze episode DTO required to map the internal Episode model.

Conceptually:

```ts
type TvMazeEpisodeDto = {
  id: number;
  name: string;
  season: number;
  number: number | null;
  runtime: number | null;
  airdate: string | null;
  summary: string | null;
};
```

If TVMaze exposes additional fields, do not model them unless required.

---

# 14. Mapper Location

Create:

```text
src/features/shows/api/shows.mappers.ts
```

Mappers must be pure functions.

They must not:

- perform network requests;
- read React state;
- use TanStack Query;
- depend on UI;
- mutate DTO input.

---

# 15. Show Mapper

Implement a mapper conceptually equivalent to:

```ts
mapShowDto(dto: TvMazeShowDto): Show
```

Requirements:

- id preserved;
- name preserved;
- status normalized;
- rating maps from `rating.average`;
- genres copied into domain;
- summary preserved;
- premiere date mapped to `premieredAt`;
- image URL resolved defensively.

For image selection, prefer:

```text
image.original
```

when available.

If unavailable, fall back to:

```text
image.medium
```

If no image exists, return:

```text
null
```

Do not invent placeholder URLs in the mapper.

---

# 16. Search Result Mapper

Implement a mapper conceptually equivalent to:

```ts
mapSearchResultDto(dto: TvMazeSearchResultDto): Show
```

It should delegate to the same Show normalization path.

Do not duplicate Show mapping logic.

Expected direction:

```text
search wrapper
→ dto.show
→ mapShowDto
→ Show
```

---

# 17. Episode Mapper

Implement:

```ts
mapEpisodeDto(dto: TvMazeEpisodeDto): Episode
```

Preserve nullable values.

Do not convert missing values into arbitrary defaults.

---

# 18. Defensive Mapping

The mapper boundary should handle optional remote values intentionally.

Examples:

```text
missing image
→ imageUrl: null

missing rating.average
→ rating: null

missing summary
→ summary: null

missing premiered
→ premieredAt: null
```

Do not use broad fallback strings such as:

```text
"Unknown"
"N/A"
```

inside domain mapping.

Presentation layers may later decide how to render missing values.

---

# 19. Immutability

Do not expose mutable DTO arrays directly when a small defensive copy is appropriate.

For example, `genres` should not intentionally share mutable identity with an external DTO object if a simple copy can preserve domain isolation.

A small implementation such as:

```ts
genres: [...dto.genres];
```

is acceptable.

Do not over-engineer deep cloning.

---

# 20. Runtime Validation

Do not add:

- Zod;
- Valibot;
- io-ts;
- custom schema framework.

TypeScript DTOs plus defensive mapping remain the approved approach.

Do not claim the mapper provides complete runtime validation.

---

# 21. Testing Requirements

Add focused unit tests.

Required coverage:

## Status normalization

Verify:

- `Running` → `running`
- `Ended` → `ended`
- `To Be Determined` → `to-be-determined`
- unexpected value → `unknown`

## Show mapping

Verify:

- scalar fields map correctly;
- rating average maps correctly;
- original image is preferred;
- medium image is used as fallback;
- missing image becomes `null`;
- missing rating remains `null`;
- missing optional text/date remains `null`;
- genres map correctly.

## Search mapping

Verify:

- search wrapper maps through the same Show mapper semantics.

## Episode mapping

Verify:

- episode fields map correctly;
- nullable fields remain nullable.

---

# 22. Test Placement

Prefer colocated tests.

Examples:

```text
domain/
├── show.ts
└── show.test.ts
```

if status normalization lives there.

And:

```text
api/
├── shows.mappers.ts
└── shows.mappers.test.ts
```

Do not create a centralized feature-wide test directory.

---

# 23. Test Data

Keep test fixtures small and explicit.

Do not copy large real TVMaze payloads into tests unless needed.

Prefer minimal valid DTO objects that make the behavior under test obvious.

Avoid hidden shared mutable fixtures.

---

# 24. TypeScript Rules

Maintain:

- strict mode;
- `noUncheckedIndexedAccess`.

Avoid:

```ts
as Show
```

inside production mapping logic.

The mapper should construct valid domain objects explicitly.

Avoid `any`.

If a test helper needs to construct DTO variants, keep helper typing explicit.

---

# 25. Dependency Rules

Do not install dependencies.

This task requires no new package.

Shows domain and mappers may depend only on stable local code required by this task.

Do not import:

- Favorites;
- TanStack Query;
- React;
- UI components.

---

# 26. Architecture Constraints

Preserve:

```text
TVMaze DTO
    ↓
mapper
    ↓
Show / Episode domain
```

Do not create:

```text
DTO
→ component
```

or:

```text
DTO
→ Favorites
```

direct dependencies.

The domain layer must remain independent of the transport wrapper shape where possible.

---

# 27. Prohibited Shortcuts

Do not:

- expose raw status strings as ShowStatus;
- flatten search DTO at the DTO definition layer;
- duplicate Show mapping inside search mapping;
- add network requests;
- add filtering;
- add episode grouping;
- add Favorites behavior;
- add Zod;
- use broad casts;
- map missing rating to zero;
- map missing image to a fake URL;
- add fields not needed by the approved product.

---

# 28. Quality Gates

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

Then rerun the quality gates.

---

# 29. Completion Report

When complete, report:

## Changed

- domain contracts created;
- TVMaze DTO contracts created;
- mapping/normalization implemented.

## Files

List important files created or modified.

## Tests

List covered mapping and normalization behavior.

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

# 30. Definition of Done

TASK-002 is complete when:

- Show domain exists;
- ShowStatus is normalized;
- ShowListItem exists;
- Episode domain exists;
- Season contract exists;
- Show DTO exists;
- Search Result DTO exists;
- Episode DTO exists;
- Show mapper exists;
- Search Result mapper reuses Show mapping;
- Episode mapper exists;
- missing optional remote data is handled defensively;
- focused tests exist;
- no network/query/UI code is introduced;
- all quality gates pass.
