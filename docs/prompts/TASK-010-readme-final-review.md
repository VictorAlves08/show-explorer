# TASK-010 — README + Final Review

## Task

**Title:** README + Final Review

**Status:** Ready

**Primary responsibility:** delivery readiness + documentation + final compliance review

---

# 1. Objective

Prepare the repository for final submission.

This task must:

- review the complete implementation against the project specification;
- review architecture compliance;
- review architectural decisions;
- verify feature boundaries;
- verify the original challenge requirements;
- create or finalize the project README;
- document setup and execution;
- document architecture and technology choices;
- document testing and quality commands;
- document trade-offs;
- document known limitations;
- document what would be improved with more time;
- document AI-assisted development transparently;
- remove delivery-only leftovers;
- run the complete final validation suite.

This task must not introduce new product scope.

---

# 2. Required Context

Before modifying anything, read completely:

```text
AGENTS.md

docs/SPEC.md
docs/ARCHITECTURE.md
docs/DECISIONS.md

src/features/shows/SKILL.md
src/features/favorites/SKILL.md
```

Then inspect:

```text
package.json
app.json / app.config.*
tsconfig.json
eslint.config.*
jest.config.*
.github/workflows/*
src/app/**
src/features/**
src/components/**
src/lib/**
src/providers/**
```

Also inspect the original technical challenge material available in the repository/conversation if accessible.

Do not infer challenge requirements that are not documented.

---

# 3. Review Mode

Treat this task primarily as a review.

Use this sequence:

```text
requirements
    ↓
implementation
    ↓
tests
    ↓
documentation
    ↓
delivery validation
```

Do not start by rewriting the README.

First understand what the repository actually implements.

---

# 4. Source of Truth

Use this priority when reviewing implementation intent:

```text
original challenge
      ↓
SPEC.md
      ↓
ARCHITECTURE.md
      ↓
DECISIONS.md
      ↓
feature SKILL.md
      ↓
implementation
```

If implementation contradicts an accepted architectural decision, investigate before changing anything.

Do not silently rewrite documentation to justify accidental implementation drift.

---

# 5. Functional Review

Verify the application implements the agreed product behavior.

At minimum review:

```text
Home
Browse
Infinite pagination
Remote search
Status filter
Rating filter
Loading states
Skeletons
Error states
Empty states

Show Detail
Show information
Favorite action
Episodes
Season grouping
Collapsible seasons

Favorites
Persistence
Reactive favorite state
Favorite count
Local search
Status filter
Rating filter

Navigation
Home tab
Favorites tab
Show Detail stack
```

---

# 6. Home Review

Verify:

- initial Shows browse works;
- browse uses pagination;
- FlashList is used;
- infinite loading preserves existing content;
- remote search is debounced;
- search and browse are distinct acquisition modes;
- status filter is local;
- rating filter is local;
- combined filters use AND semantics;
- search/filter state belongs to Home;
- skeletons appear intentionally;
- empty/error states are contextual.

Do not change behavior that already satisfies the specification.

---

# 7. Favorites Review

Verify:

- Favorites use AsyncStorage;
- persistence is behind a storage boundary;
- FavoritesProvider owns reactive state;
- `useFavorites` is the consumer boundary;
- duplicate favorites are prevented;
- count derives from the collection;
- FavoriteButton reacts correctly;
- Favorites render persisted snapshots;
- Favorites do not require network reconstruction;
- local search works;
- status/rating filters work;
- Home and Favorites filters remain independent.

Verify that:

```text
Shows → Favorites
```

dependency has not accidentally been introduced inside the Shows feature.

---

# 8. Detail Review

Verify:

- route parameter is handled safely;
- Show Detail consumes internal domain models;
- Show and Episodes remain independent queries;
- Show content survives Episodes loading/error;
- FavoriteButton is available;
- missing optional data is safe;
- summary does not expose raw HTML;
- Episodes are grouped by season;
- seasons are ordered;
- episodes are ordered appropriately;
- first available season is expanded;
- remaining seasons are collapsed;
- accordion is accessible.

---

# 9. Navigation Review

Verify final structure is equivalent to:

```text
Root Stack
│
├── (tabs)
│   ├── Home
│   └── Favorites
│
└── shows/[id]
```

Verify:

- Detail is not a tab;
- Home and Favorites use one Detail route;
- stack back navigation preserves origin;
- tab icons/labels are clear;
- Favorites count is reactive.

---

# 10. Architecture Review

Verify the intended architecture remains feature-based.

Expected conceptual structure:

```text
src/
├── app/
├── components/
│   └── ui/
├── features/
│   ├── shows/
│   └── favorites/
├── hooks/
├── lib/
├── providers/
└── theme/
```

Do not reorganize directories merely for aesthetic preference.

Only fix actual architectural violations.

---

# 11. Layer Review

Verify the remote data path remains approximately:

```text
TVMaze
   ↓
HTTP client
   ↓
feature API
   ↓
DTO
   ↓
mapper
   ↓
domain model
   ↓
TanStack Query
   ↓
screen/presentation
```

UI must not consume TVMaze DTOs directly.

Routes must not construct TVMaze URLs.

---

# 12. State Ownership Review

Verify state remains intentionally separated.

Expected:

```text
Remote server state
→ TanStack Query

Favorites persistent/reactive state
→ Context + AsyncStorage

Home discovery controls
→ local state

Favorites discovery controls
→ local state

Accordion expanded state
→ local component state
```

There should be no need for Zustand, Redux or generic global AppContext.

Do not introduce them.

---

# 13. Dependency Review

Inspect:

```text
package.json
```

Confirm dependencies correspond to accepted architecture.

Expected core stack includes:

```text
Expo
React Native
TypeScript
Expo Router
TanStack Query
AsyncStorage
NativeWind
FlashList
expo-image
Jest
React Native Testing Library
```

Remove a dependency only if it is clearly accidental and unused.

Do not upgrade package versions during final review.

---

# 14. README

Create or finalize:

```text
README.md
```

The README should describe the actual repository.

Do not write aspirational documentation for functionality that does not exist.

---

# 15. README — Title

Use a clear project title:

```markdown
# Show Explorer
```

Include a concise description explaining that it is a React Native/Expo application for discovering TV shows, viewing details/episodes and managing favorites.

Keep the introduction concise.

---

# 16. README — Features

Include a focused feature overview covering implemented functionality.

For example:

```text
- paginated TV show discovery;
- debounced remote search;
- status and minimum-rating filters;
- optimized lists with FlashList;
- show details;
- episodes grouped by season;
- collapsible season sections;
- persistent favorites;
- Favorites search/filtering;
- skeleton/loading/error/empty states.
```

Only list functionality that actually exists.

---

# 17. README — Tech Stack

Document the important technologies and their responsibilities.

At minimum:

```text
Expo / React Native
TypeScript
Expo Router
TanStack Query
AsyncStorage
NativeWind
FlashList
expo-image
Jest
React Native Testing Library
```

Do not merely dump `package.json`.

Explain why the important architectural dependencies exist.

---

# 18. README — Architecture

Add a concise architecture section.

Explain that the application uses:

```text
feature-based architecture
+
DTO → mapper → domain boundary
+
TanStack Query for server state
+
Context + AsyncStorage for Favorites
+
local state for screen-specific UI state
```

Reference:

```text
docs/ARCHITECTURE.md
docs/DECISIONS.md
```

for deeper detail.

---

# 19. README — Project Structure

Include a concise tree showing important boundaries.

Example:

```text
src/
├── app/                  # Expo Router composition
├── components/ui/        # shared domain-agnostic primitives
├── features/
│   ├── shows/
│   └── favorites/
├── hooks/                # generic hooks
├── lib/                  # infrastructure
├── providers/            # application provider composition
└── theme/                # design tokens
```

Do not dump every file.

---

# 20. README — Data Flow

Document the main remote-data flow succinctly:

```text
TVMaze API
    ↓
HTTP client
    ↓
feature API
    ↓
DTO mapper
    ↓
domain model
    ↓
TanStack Query
    ↓
UI
```

Explain that external API shapes are intentionally isolated from UI.

---

# 21. README — Favorites Architecture

Explain why Favorites does not use Zustand/TanStack Query.

Expected reasoning:

```text
Favorites is small persistent client state.

AsyncStorage
    ↓
FavoritesProvider
    ↓
useFavorites
    ↓
reactive UI
```

Mention that favorite snapshots allow the Favorites screen to render without reconstructing every show from the network.

Keep this concise.

---

# 22. README — Requirements

Document practical development prerequisites.

Derive versions from the actual repository.

For example:

```text
Node.js
npm
Expo-compatible development environment
Android/iOS simulator or physical device
```

Do not invent a Node version if the project does not specify one.

If an `.nvmrc`, `engines`, or equivalent exists, use it.

---

# 23. README — Installation

Document the actual installation command:

```bash
npm install
```

If the repository requires another command, document reality.

Do not use `--force` or `--legacy-peer-deps` in README unless the final clean dependency tree genuinely requires it.

---

# 24. README — Running

Document available scripts from `package.json`.

Likely examples:

```bash
npm start
npm run android
npm run ios
npm run web
```

Only document scripts that exist.

---

# 25. README — Quality Commands

Document:

```bash
npm run format:check
npm run lint
npm run typecheck
npm run test:ci
npm run test:coverage
```

if these are the actual final scripts.

Explain briefly what the important commands validate.

---

# 26. README — Testing Strategy

Add a concise section explaining the testing approach.

Cover:

```text
pure domain functions
API boundaries
query behavior
screen/component behavior
Favorites persistence/provider
loading/error/empty states
accessibility semantics
```

Do not claim E2E coverage if none exists.

---

# 27. README — Design Decisions

Summarize a few important decisions rather than duplicating `DECISIONS.md`.

Good candidates:

```text
feature-based architecture
no global state library
TanStack Query for server state
AsyncStorage + Context for Favorites
FlashList for large collections
independent Show/Episodes queries
NativeWind semantic tokens
```

Link conceptually to `docs/DECISIONS.md`.

---

# 28. README — Trade-offs

Include a transparent section:

```markdown
## Trade-offs
```

Only document actual trade-offs.

Potential examples, if true in the final implementation:

- local filters apply to the currently acquired dataset rather than the entire TVMaze catalog;
- Favorites store presentation snapshots rather than full server entities;
- summary HTML is sanitized into text rather than rendered as rich HTML;
- accordion episode rendering favors implementation simplicity over a more complex nested virtualization architecture;
- NativeWind v5 preview is intentionally used.

Do not manufacture limitations merely to make the README appear sophisticated.

---

# 29. README — With More Time

Include a short:

```markdown
## With More Time
```

Potential legitimate improvements include:

```text
E2E testing
richer offline behavior
stronger runtime DTO validation
accessibility testing on real devices
visual regression testing
more extensive performance profiling
```

Do not list missing core assignment requirements here.

If a required feature is missing, fix it rather than calling it future work.

---

# 30. README — AI-Assisted Development

Include a transparent AI section if required by the challenge.

Suggested structure:

```markdown
## AI-Assisted Development
```

Explain factually that AI tooling was used to assist with activities such as:

```text
architecture discussion
specification refinement
task decomposition
implementation assistance
test generation/review
documentation review
```

Do not claim the application was manually authored without AI if that is false.

Do not overshare irrelevant conversation details.

---

# 31. AI Disclosure Quality

The disclosure should communicate that engineering decisions were reviewed rather than blindly accepted.

A concise statement may explain that AI-assisted changes were validated through:

```text
code review
TypeScript
linting
automated tests
manual inspection
```

Do not use marketing language.

---

# 32. Documentation Links

README may reference repository-relative files using normal Markdown:

```markdown
[Architecture](docs/ARCHITECTURE.md)
[Decisions](docs/DECISIONS.md)
[Specification](docs/SPEC.md)
```

Ensure paths actually exist.

---

# 33. Internal Task Prompts

The repository currently contains:

```text
docs/prompts/
```

Do not delete these automatically.

They document the spec-driven implementation process and can demonstrate deliberate engineering workflow.

However, ensure they do not contain:

- secrets;
- local credentials;
- private tokens;
- accidental sensitive information.

Do not rewrite all historical prompts during final review.

---

# 34. AGENTS and SKILL Files

Keep:

```text
AGENTS.md
src/features/shows/SKILL.md
src/features/favorites/SKILL.md
```

unless the challenge explicitly forbids them.

They are part of the project's spec-driven/agent-guidance architecture.

Ensure their instructions are not materially stale relative to final implementation.

If there is a genuine contradiction, make the smallest documentation correction.

---

# 35. Secrets Review

Inspect repository-visible configuration for accidental secrets.

Look for obvious patterns such as:

```text
API keys
tokens
passwords
private credentials
personal absolute paths
```

TVMaze does not require embedding a secret for normal public API use.

Do not add `.env` merely for architectural appearance.

---

# 36. Local Path Review

Remove accidental documentation/output references such as:

```text
C:\Users\...
C:\RepoLocal\...
```

from repository documentation if they were introduced by generated reports.

README commands must be machine-independent.

---

# 37. Debug Artifact Review

Remove accidental:

```text
debug files
temporary JSON
test output dumps
coverage artifacts if tracked unintentionally
logs
screenshots not intended for submission
```

Do not remove legitimate assets.

---

# 38. Gitignore Review

Ensure common generated directories are ignored appropriately.

Examples:

```text
node_modules
.expo
coverage
dist
```

Preserve existing intentional project files.

Do not add broad ignore patterns that could hide source code.

---

# 39. Formatting Review

Do not manually rewrite large sections of stable implementation just for style.

Use:

```bash
npm run format
```

if required.

Keep diffs focused.

---

# 40. TypeScript Review

Final code must remain compatible with:

```text
strict
noUncheckedIndexedAccess
```

Search for and review suspicious:

```text
any
@ts-ignore
@ts-expect-error
non-null assertions
broad casts
```

Not every cast is invalid, but each should have a clear reason.

Do not weaken compiler settings.

---

# 41. ESLint Review

Do not add rule suppressions merely to reach PASS.

Existing suppressions should be reviewed if suspicious.

Fix underlying issues when practical.

---

# 42. Test Review

Confirm tests represent meaningful behavior rather than only implementation details.

Do not rewrite the suite again if TASK-010 already established sufficient confidence.

Fix only regressions/gaps discovered during final compliance review.

---

# 43. Test Coverage

Run coverage for final diagnostics.

Do not add arbitrary coverage thresholds at this stage.

If meaningful uncovered core logic is discovered, add focused tests.

Do not chase styling lines.

---

# 44. Manual Review Checklist

Perform a code-level/manual-flow review of:

```text
Home
  browse
  pagination
  search
  clear search
  status filter
  rating filter
  combined filters
  open Show
  favorite Show

Favorites
  hydration
  list
  local search
  filters
  unfavorite
  open Show

Detail
  metadata
  favorite toggle
  summary
  episodes loading
  seasons
  accordion
  error isolation
```

If actual simulator/device execution is unavailable to the agent, state that clearly in the completion report.

Do not claim manual runtime validation that was not performed.

---

# 45. Challenge Compliance Matrix

Before completion, internally build a concise requirement checklist:

```text
requirement
→ implementation
→ test/evidence
→ status
```

Use it to identify missing requirements.

It does not need to become a permanent repository document unless useful.

Do not add bureaucratic documentation purely for volume.

---

# 46. Architecture Compliance Matrix

Review important accepted decisions against implementation.

At minimum:

```text
feature-based architecture
Expo Router
TanStack Query
AsyncStorage
no Zustand
no generic global state
NativeWind tokens
FlashList
expo-image
independent Show/Episodes queries
local filters
Favorites snapshots
```

If implementation diverges intentionally, verify the deviation is documented.

---

# 47. Documentation Accuracy

README and canonical docs must describe what exists at submission time.

Do not leave statements such as:

```text
will implement
planned
TODO
```

for functionality that is already complete.

Likewise, do not mark unfinished behavior as complete.

---

# 48. TODO Review

Search for:

```text
TODO
FIXME
HACK
XXX
```

Review each occurrence.

Do not blindly delete them.

Resolve submission-blocking TODOs.

Keep legitimate future-work notes only if they are intentional and non-critical.

---

# 49. Comments

Remove comments that merely narrate obvious code or contain generated-agent instructions.

Keep comments that explain non-obvious architectural constraints or API behavior.

Do not over-comment.

---

# 50. Naming Review

Review obvious naming inconsistencies.

Examples:

```text
favorite vs favourite
showId vs id
minimumRating vs minRating
```

Do not perform large renames unless inconsistency genuinely harms clarity.

Prefer terminology established in SPEC/ARCHITECTURE.

---

# 51. Final Dependency Installation Check

The project should be installable from a clean dependency state using the documented package manager command.

Do not delete `package-lock.json`.

Ensure it reflects the final dependencies.

Do not regenerate it unnecessarily if already consistent.

---

# 52. Expo Sanity Check

Run an Expo project health check if available and appropriate for the installed Expo version.

Prefer an Expo-supported diagnostic such as:

```bash
npx expo-doctor
```

if compatible with the current SDK.

Treat warnings carefully:

- fix actionable project problems;
- do not make speculative package upgrades;
- document non-blocking toolchain warnings when appropriate.

---

# 53. Final Quality Gates

Run:

```bash
npm run format:check
npm run lint
npm run typecheck
npm run test:ci
npm run test:coverage
```

Also run:

```bash
npx expo-doctor
```

if available.

All standard project gates must pass before declaring delivery ready.

---

# 54. Optional Runtime Validation

If the environment allows Expo runtime execution, perform a sanity startup check.

For example:

```bash
npx expo start
```

Do not leave a long-running development server merely for completion reporting.

If runtime execution is not possible, report:

```text
Runtime/device validation: NOT PERFORMED
```

rather than claiming PASS.

---

# 55. Do Not Over-Fix

This is critical.

Do not use final review to:

- redesign components;
- rewrite architecture;
- rename the entire project;
- change dependency versions;
- introduce abstractions;
- optimize without evidence;
- add features;
- expand scope.

Submission stability is more valuable than aesthetic refactoring.

---

# 56. Expected Files

Likely primary modification:

```text
README.md
```

Possible small modifications:

```text
.gitignore
canonical docs
tests
application code
```

only when final review finds a concrete issue.

A large production-code diff during TASK-011 should be treated as suspicious and explained.

---

# 57. Prohibited Changes

Do not:

- add new product features;
- add new API endpoints;
- add dependencies;
- introduce Zustand/Redux;
- change state architecture;
- change styling architecture;
- migrate Expo versions;
- upgrade React Native;
- weaken TypeScript;
- weaken ESLint;
- delete failing tests;
- hide known failures;
- fabricate runtime validation;
- fabricate coverage results.

---

# 58. Completion Report

When complete, report:

## Final Review

Summarize whether the implementation matches:

```text
SPEC
ARCHITECTURE
DECISIONS
feature SKILL files
original challenge requirements
```

Explicitly mention any remaining deviation.

## README

Summarize sections created/updated.

## Fixes

List only concrete issues discovered and fixed during final review.

If none:

```text
No production-code fixes were required.
```

## Validation

Report exact results:

```text
format:check — PASS/FAIL
lint         — PASS/FAIL
typecheck    — PASS/FAIL
test:ci      — PASS/FAIL
coverage     — completed / blocked
expo-doctor  — PASS / warnings / blocked
```

## Runtime Validation

Report one of:

```text
Runtime/device validation — PASS
```

or:

```text
Runtime/device validation — NOT PERFORMED
```

Do not invent execution.

## Remaining Limitations

List only genuine remaining limitations.

## Delivery Status

Finish with exactly one:

```text
READY FOR SUBMISSION
```

or:

```text
NOT READY FOR SUBMISSION
```

If not ready, explain blockers.

---

# 59. Definition of Done

TASK-011 is complete when:

- README accurately describes the final project;
- setup/run/test instructions are correct;
- architecture is concisely documented;
- important technology choices are explained;
- trade-offs are documented honestly;
- future improvements are separated from required functionality;
- AI-assisted development is disclosed appropriately;
- original challenge requirements have been reviewed;
- SPEC compliance has been reviewed;
- ARCHITECTURE compliance has been reviewed;
- DECISIONS compliance has been reviewed;
- feature boundaries remain intact;
- no secrets/local-machine paths/debug artifacts remain;
- no known submission-blocking TODO remains;
- dependencies are intentional;
- standard quality gates pass;
- Expo project health is reviewed;
- runtime validation status is reported honestly;
- remaining limitations are explicit;
- repository is either explicitly declared ready or not ready for submission.
