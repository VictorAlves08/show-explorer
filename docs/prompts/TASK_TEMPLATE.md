# Show Explorer — Codex Task Template

## Task

**Title:**
`<short task title>`

**Status:** Ready

**Primary feature:**
`<shows | favorites | shared infrastructure | app composition | ui>`

---

# 1. Objective

Implement only the following objective:

> `<clear and narrow implementation goal>`

Do not expand the task beyond this objective unless a required dependency is strictly necessary to complete it.

---

# 2. Required Context

Before modifying code, read:

1. `AGENTS.md`
2. relevant sections of `docs/SPEC.md`
3. relevant sections of `docs/ARCHITECTURE.md`
4. relevant decisions in `docs/DECISIONS.md`
5. the affected feature `SKILL.md`, when applicable

Relevant feature skills:

```text
src/features/shows/SKILL.md
src/features/favorites/SKILL.md
```

Canonical documentation has higher authority than this task prompt.

If this task conflicts with canonical documentation, do not silently implement the conflict.

---

# 3. Inspect Before Editing

Before making changes:

1. inspect the current repository state;
2. inspect existing files related to this task;
3. identify reusable infrastructure already present;
4. verify that the requested capability has not already been implemented;
5. preserve existing working conventions.

Do not assume the repository still matches an earlier prompt.

The current codebase is the implementation source of truth, constrained by canonical documentation.

---

# 4. Scope

## In Scope

- `<specific behavior 1>`
- `<specific behavior 2>`
- `<specific behavior 3>`

## Out of Scope

- `<explicitly excluded behavior 1>`
- `<explicitly excluded behavior 2>`
- unrelated refactors;
- dependency upgrades;
- architecture changes not required by this task.

Do not implement future tasks preemptively.

---

# 5. Expected Behavior

The implementation must satisfy:

- `<behavioral requirement>`
- `<behavioral requirement>`
- `<edge-case requirement>`

Where behavior already exists in `SPEC.md`, follow the canonical wording and semantics.

Do not invent alternative UX behavior without a requirement.

---

# 6. Architecture Constraints

Preserve these project-level rules:

- TanStack Query owns TVMaze-backed remote state.
- FavoritesProvider owns shared reactive Favorites state.
- AsyncStorage is persistence only.
- screen search/filter state remains local.
- TVMaze DTOs never reach presentation components.
- remote responses cross DTO → mapper → domain.
- generic infrastructure does not depend on business features.
- Shows does not depend on Favorites implementation.
- Favorites may consume stable public Shows domain contracts only.
- shared UI remains domain-agnostic.
- primary show lists use FlashList.

Add task-specific constraints here:

- `<constraint>`
- `<constraint>`

---

# 7. Expected Files

Files that are likely to be created or modified:

```text
<path>
<path>
<path>
```

This list is guidance, not permission to create unnecessary abstractions.

Do not create placeholder files only to match an expected tree.

If the current repository structure makes a different small file arrangement clearly more appropriate, preserve architecture and explain the deviation.

---

# 8. Data and Type Rules

Use strict TypeScript.

Requirements:

- avoid `any`;
- avoid broad unsafe casts;
- preserve `noUncheckedIndexedAccess`;
- represent nullable external data explicitly;
- keep persisted data serializable;
- keep external DTOs distinct from internal domain models.

If the task touches TVMaze data:

```text
remote payload
→ DTO
→ mapper
→ domain
→ consumer
```

must remain intact.

---

# 9. State Ownership

Explicit state ownership for this task:

```text
<state>
→ <owner>

<state>
→ <owner>
```

Do not introduce global state when local or feature-scoped ownership is sufficient.

Do not copy TanStack Query data into local state without a real independent-state requirement.

---

# 10. Loading, Error and Empty States

If the task includes asynchronous or filtered behavior, implement all relevant states.

Relevant states for this task:

- `<loading state>`
- `<error state>`
- `<empty state>`

Preserve unaffected content during isolated failures when required by `SPEC.md`.

Do not implement only the success path.

---

# 11. Accessibility

Consider accessibility for every new interactive control.

Relevant requirements may include:

- meaningful accessibility labels;
- selected state;
- expanded/collapsed state;
- touch target size;
- avoiding color-only meaning.

Task-specific accessibility expectations:

- `<requirement>`

---

# 12. Testing Requirements

Add or update tests for meaningful behavior introduced by this task.

Expected tests:

```text
<test case>
<test case>
<edge case>
```

Testing guidance:

- use unit tests for pure functions;
- use React Native Testing Library for component behavior;
- prefer observable behavior over implementation details;
- prefer colocated tests;
- mock stable boundaries instead of internal implementation where practical.

Do not weaken existing tests to make the task pass.

---

# 13. Quality Gates

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

Then rerun all relevant gates.

Do not claim completion while a quality gate is failing.

---

# 14. Dependency Rule

Do not add a new dependency unless it is strictly required for this task and consistent with `DECISIONS.md`.

If a new dependency appears necessary:

1. explain why existing tooling is insufficient;
2. verify that the dependency does not contradict an accepted decision;
3. do not install it silently if it changes architecture.

---

# 15. Architecture Conflict Rule

If the requested task appears to require changing:

- state ownership;
- persistence strategy;
- API boundaries;
- feature boundaries;
- navigation architecture;
- styling architecture;
- approved dependency strategy;

stop before implementing that architectural change.

Report:

1. the conflict;
2. why current architecture is insufficient;
3. the smallest reasonable alternatives;
4. which canonical documents would need updating.

Do not silently make code the new architecture.

---

# 16. Implementation Discipline

While implementing:

- keep changes narrow;
- prefer existing project conventions;
- reuse existing primitives and infrastructure;
- avoid speculative abstractions;
- avoid unrelated cleanup;
- do not create generic layers for a single use case;
- do not optimize without a concrete reason;
- preserve explicit feature ownership.

Comments should explain non-obvious constraints, not narrate obvious code.

---

# 17. Prohibited Shortcuts

Do not:

- disable lint rules to pass the task;
- add broad TypeScript ignores;
- use `skipLibCheck` as a task workaround;
- introduce `any` casually;
- hide DTOs behind unsafe casts;
- delete meaningful tests;
- swallow errors silently;
- create a generic AppContext;
- introduce Redux or Zustand;
- use TanStack Query for Favorites;
- call AsyncStorage from UI;
- call TVMaze directly from screens;
- expose DTOs to UI;
- introduce Axios or Zod without an approved architecture change.

---

# 18. Completion Report

When implementation is complete, report only:

## Changed

- `<main behavior implemented>`
- `<main behavior implemented>`

## Files

- `<important file>`
- `<important file>`

## Tests

- `<tests added or updated>`

## Validation

```text
format:check — PASS/FAIL
lint         — PASS/FAIL
typecheck    — PASS/FAIL
test:ci      — PASS/FAIL
```

## Notes

- `<only meaningful trade-off, limitation, or deviation>`

Do not include a long retrospective unless explicitly requested.

---

# 19. Definition of Done

This task is complete only when:

- requested scope is fully implemented;
- behavior matches `SPEC.md`;
- architecture matches `ARCHITECTURE.md`;
- accepted decisions remain valid;
- relevant `SKILL.md` rules are preserved;
- meaningful tests exist;
- loading/error/empty behavior is covered when applicable;
- accessibility is considered;
- formatting passes;
- lint passes;
- typecheck passes;
- tests pass.

---

# 20. Task-Specific Instructions

Add task-specific implementation guidance below this line.

Do not duplicate the entire project architecture here.

Only include details necessary to remove ambiguity for this specific task.

---

`<task-specific instructions>`
