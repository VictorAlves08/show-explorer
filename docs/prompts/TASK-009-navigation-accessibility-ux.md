# TASK-009 — Navigation + Accessibility + UX Hardening

## Task

**Title:** Navigation + Accessibility + UX Hardening

**Status:** Ready

**Primary feature:** app composition + cross-cutting UX

---

# 1. Objective

Finalize application navigation and perform a focused accessibility and UX hardening pass across the existing flows.

The task must deliver:

- final Home/Favorites tab navigation;
- visible Favorites count integration;
- coherent Show Detail stack navigation;
- consistent route headers;
- accessibility improvements across interactive surfaces;
- loading/error/empty state consistency review;
- touch-target and interaction review;
- small UX corrections required to make the application feel cohesive.

Do not add new product features.

---

# 2. Required Context

Before modifying code, read:

1. `AGENTS.md`
2. relevant sections of `docs/SPEC.md`
3. relevant sections of `docs/ARCHITECTURE.md`
4. relevant decisions in `docs/DECISIONS.md`
5. `src/features/shows/SKILL.md`
6. `src/features/favorites/SKILL.md`

Inspect implementation delivered by TASK-005 through TASK-008.

Especially review:

- Navigation;
- Accessibility;
- Loading States;
- Empty States;
- Error States;
- Favorites count;
- State Independence;
- Navigation Architecture;
- Accessibility Architecture;
- Definition of Done.

---

# 3. Inspect Before Editing

Before implementation:

1. inspect the current Expo Router tree;
2. inspect root `_layout.tsx`;
3. inspect existing tab structure, if already created;
4. inspect Home route;
5. inspect Favorites route;
6. inspect Show Detail route;
7. inspect FavoritesBadge;
8. inspect Button/IconButton/Chip/SearchInput;
9. inspect ShowCard and SeasonAccordion;
10. inspect current accessibility props.

Do not replace working feature implementations unless necessary for integration.

---

# 4. Scope

## In Scope

Implement/refine:

```text
root Stack
Home/Favorites tabs
tab icons/labels
Favorites visible count
Show Detail stack navigation
route titles
back navigation
accessibility labels
accessibility state
touch targets
interaction feedback
loading/error/empty-state consistency
small UX inconsistencies
```

## Out of Scope

Do not implement:

- new filters;
- new TVMaze endpoints;
- sorting;
- new Favorites behavior;
- offline mode;
- new persistence strategy;
- new design framework;
- analytics;
- E2E framework;
- broad redesign.

---

# 5. Final Navigation Hierarchy

The final application navigation must follow:

```text
Root Stack
│
├── (tabs)
│   ├── Home
│   └── Favorites
│
└── shows/[id]
```

Expected route structure:

```text
src/app/
├── _layout.tsx
├── (tabs)/
│   ├── _layout.tsx
│   ├── index.tsx
│   └── favorites.tsx
└── shows/
    └── [id].tsx
```

If current files differ, migrate only as needed to establish this architecture.

---

# 6. Root Stack

The root layout owns the relationship between:

```text
Tabs
and
Show Detail
```

Show Detail must not become a third tab.

Conceptually:

```tsx
<Stack>
  <Stack.Screen name="(tabs)" ... />
  <Stack.Screen name="shows/[id]" ... />
</Stack>
```

Exact Expo Router syntax should follow the project's installed version.

---

# 7. Tabs

The application has exactly two primary tab destinations:

```text
Home
Favorites
```

Both should remain easily reachable throughout primary app usage.

Use clear labels:

```text
Home
Favorites
```

Do not abbreviate them unnecessarily.

---

# 8. Home Tab

Home must use:

- home icon;
- Home label;
- appropriate accessibility semantics.

The tab should navigate to the discovery experience implemented in TASK-006.

Do not duplicate Home screen code during route migration.

---

# 9. Favorites Tab

Favorites must use:

- heart icon;
- Favorites label;
- visible favorite count.

The visible count may be presented as:

- tab badge;
- small count badge near the icon;

depending on Expo Router/React Navigation support and current implementation.

Prefer framework-native tab badge behavior when cleanly available.

---

# 10. Favorites Count

The count must derive from:

```ts
favorites.length;
```

through the Favorites feature.

Do not persist a separate count.

The tab must react immediately when a show is:

- favorited;
- unfavorited.

---

# 11. Zero Favorites Count

When the count is zero, choose a clean representation.

Prefer either:

```text
no badge
```

or:

```text
0
```

only if the UI remains clear.

Do not display visually noisy zero-state badging without reason.

Whatever behavior is chosen must remain consistent.

---

# 12. Icons

Use an icon solution already available in the Expo project.

If `@expo/vector-icons` is available through the current Expo installation, use it.

Do not add another icon library.

Recommended semantic icons:

```text
Home → home
Favorites → heart
```

Selected/unselected icon styles may differ.

Do not rely solely on icon fill/color to indicate current tab; labels and navigation state already provide context.

---

# 13. Show Detail Navigation

Selecting a Show from:

```text
Home
Favorites
```

must navigate to:

```text
/shows/{id}
```

Both entry points use the same detail route.

Do not create:

```text
/favorites/shows/{id}
```

or another duplicate detail path.

---

# 14. Back Navigation

Show Detail must preserve normal stack back navigation.

A user entering Detail from Home should return to Home.

A user entering Detail from Favorites should return to Favorites.

Do not hard-code:

```ts
router.replace('/...');
```

for back behavior when stack navigation already preserves origin.

Prefer native stack semantics.

---

# 15. Show Detail Header

The Detail route should expose a reasonable header.

A good final behavior is:

```text
initial:
Show Details

after data:
{Show name}
```

if this is clean to implement.

Do not block screen navigation while waiting for Show data merely to determine a header title.

---

# 16. Tab Header Strategy

Decide intentionally whether Home/Favorites use:

- native stack/tab headers;
- in-screen titles.

Avoid duplicated titles such as:

```text
Header: Home
Screen heading: Home
```

unless the design intentionally requires both.

Keep visual hierarchy clean.

---

# 17. Route Organization

Route files remain composition boundaries.

Do not move business logic into route layouts while configuring navigation.

Root/tab layouts own navigation configuration only.

---

# 18. Accessibility Audit Scope

Review at minimum:

```text
tab items
ShowCard
FavoriteButton
Button
IconButton
Chip
SearchInput
SeasonAccordion
ErrorState retry
empty-state actions
```

Accessibility must be treated as behavior, not only visual polish.

---

# 19. Tab Accessibility

Tabs must expose understandable labels.

Expected semantic intent:

```text
Home tab
Favorites tab
```

The Favorites badge should not make the tab label unreadable or ambiguous.

Avoid custom tab implementations if framework-native tabs already provide correct accessibility behavior.

---

# 20. ShowCard Accessibility

For an interactive ShowCard, ensure the accessible identity includes the Show name.

Example intent:

```text
Breaking Bad
```

or:

```text
Open Breaking Bad details
```

Avoid making every nested text element separately focusable if the whole card is the primary action.

---

# 21. FavoriteButton Accessibility

Verify the button dynamically exposes:

```text
Add {show name} to favorites
```

or:

```text
Remove {show name} from favorites
```

The state must update immediately after interaction.

Do not rely solely on heart color/fill.

---

# 22. Chip Accessibility

Verify selected filters expose selection state.

Conceptually:

```ts
accessibilityState={{
  selected,
  disabled,
}}
```

where appropriate.

Feature-level labels should identify the meaning of the chip.

---

# 23. SearchInput Accessibility

Ensure SearchInput has:

- meaningful placeholder;
- accessible label if placeholder alone is insufficient;
- appropriate keyboard/search semantics;
- usable focus behavior.

Do not add complex focus management.

---

# 24. SeasonAccordion Accessibility

Verify:

- Pressable semantics;
- season identity;
- episode count;
- expanded state.

Example accessible intent:

```text
Season 3, 10 episodes, collapsed
```

After press:

```text
Season 3, 10 episodes, expanded
```

---

# 25. Touch Targets

Review interactive controls for reasonable mobile touch size.

Particularly:

- IconButton;
- FavoriteButton;
- Chips;
- accordion headers;
- tab interactions.

Small visual icons may live inside larger invisible/visible pressable areas.

Do not make 16px icons themselves the full touch target.

---

# 26. Press Feedback

Interactive controls should communicate presses using existing Pressable behavior.

Review consistency across:

```text
Button
IconButton
Chip
ShowCard
SeasonAccordion
```

Avoid wildly different pressed-opacity conventions.

Do not add animation dependencies.

---

# 27. Disabled States

Where controls can be disabled, verify:

- interaction is actually disabled;
- visual state changes;
- accessibility disabled state is exposed.

Do not implement disabled appearance only.

---

# 28. Loading UX Review

Review the final flows.

## Home initial

Expected:

```text
filters/search
+
ShowListSkeleton
```

## Home pagination

Expected:

```text
existing Shows
+
footer skeletons
```

## Search

Expected:

```text
controls preserved
+
search loading presentation
```

## Favorites hydration

Expected:

```text
no false "empty favorites" flash
```

## Detail

Expected:

```text
Show detail skeleton
```

## Episodes

Expected:

```text
Show remains visible
+
episodes loading section
```

Do not introduce new global loading overlays.

---

# 29. Error UX Review

Verify errors preserve unaffected content.

Important scenarios:

```text
Home initial failure
→ full content error + retry
```

```text
pagination failure
→ existing Shows + footer retry
```

```text
search failure
→ controls + search error
```

```text
Show failure
→ detail error
```

```text
Episodes failure
→ Show remains visible + episode retry
```

Do not collapse all errors into one global message.

---

# 30. Error Copy

User-facing copy should be concise and contextual.

Avoid displaying infrastructure text such as:

```text
Request failed with status 500
```

directly as final UX.

Feature screens should map failures to useful general messages such as:

```text
Unable to load shows.
Try again.
```

Do not build a localization system in this task.

---

# 31. Empty UX Review

Verify distinct states exist for:

```text
remote search empty
filter empty
no Favorites
Favorites filter/search empty
episodes empty
```

Do not collapse them into:

```text
No results
```

everywhere.

Copy can remain concise but should communicate why the screen is empty.

---

# 32. Favorites UX

When Favorites is empty, provide a useful message explaining how to add shows.

Do not add a new CTA that creates navigation complexity unless it materially improves UX.

A simple explanation may be enough.

---

# 33. Filter UX

Review Home and Favorites filter controls for:

- understandable labels;
- selected-state visibility;
- reasonable horizontal wrapping/scrolling;
- no clipping on smaller screens.

Do not change filter semantics.

---

# 34. Keyboard UX

On Home/Favorites search:

- keyboard should not make the list unusable;
- tapping list/content should behave reasonably;
- return key may use search semantics.

Use platform/native list/input behavior where practical.

Do not add keyboard management dependencies.

---

# 35. Long Text

Review:

- Show names;
- genres;
- summaries;
- episode names.

Avoid layouts that break catastrophically when strings are long.

Use reasonable wrapping/truncation based on context.

Do not aggressively truncate Show Detail summary.

---

# 36. Missing Data UX

Verify:

```text
missing image
missing rating
missing summary
missing premiere
missing episode number/runtime
```

do not create:

```text
null
undefined
NaN
broken image
```

presentation.

Do not invent fake data.

---

# 37. Visual Consistency

Perform a restrained consistency pass across:

```text
spacing
radius
typography
surface usage
muted text
status badges
buttons
chips
cards
```

Use existing semantic tokens.

Do not redesign the app.

---

# 38. NativeWind Preview Constraint

The project intentionally uses the current NativeWind v5 preview.

Do not work around visual inconsistencies by introducing another styling system.

If an actual NativeWind preview bug is identified:

1. isolate it;
2. document it;
3. use the smallest local workaround;
4. do not silently migrate styling architecture.

---

# 39. Safe Areas

Ensure primary screens behave correctly around device safe areas.

Use the existing Expo/React Native safe-area infrastructure where needed.

Do not add another safe-area dependency.

Avoid double-applying safe-area padding if native headers/tabs already handle an edge.

---

# 40. Screen Background

Navigation transitions and screens should consistently use the semantic app background.

Avoid flashes of unrelated default background colors.

Configure navigation content styles if required.

---

# 41. Status Bar

Use a consistent status-bar appearance appropriate to the current light theme.

Do not implement dark mode in this task.

If `expo-status-bar` is already available, configure it at the appropriate composition level.

---

# 42. No New Features

Do not add:

- sorting;
- recent searches;
- filter persistence;
- pull-to-refresh unless already required/implemented;
- share button;
- cast information;
- watch progress;
- theme switching.

This is a hardening task, not product expansion.

---

# 43. No New Dependencies

Do not install dependencies.

Existing Expo/React Native stack is sufficient.

If navigation setup reveals a missing package that Expo Router already requires, first inspect the existing dependency tree before installing anything.

---

# 44. Testing — Navigation

Add/update meaningful tests where practical.

High-value behaviors include:

- Home Show press navigates to Detail ID;
- Favorites Show press navigates to same Detail route;
- Favorites count updates after favorite toggle.

Avoid attempting to fully test Expo Router internals.

Test your integration contract.

---

# 45. Testing — Accessibility

Add/update tests for user-observable semantics.

Examples:

```text
FavoriteButton accessible label changes
Chip selected state
SeasonAccordion expanded state
button disabled semantics
```

Do not test implementation-only props without behavioral value.

---

# 46. Testing — UX States

Where gaps exist, add tests for:

- correct empty-state distinction;
- retry action presence;
- valid content preserved during isolated errors;
- hydration state not falsely showing empty Favorites.

Do not duplicate already sufficient coverage.

---

# 47. Test Hardening Philosophy

This task is not the final coverage task.

Do not try to achieve an arbitrary coverage percentage.

TASK-010 will perform the comprehensive test-gap review.

TASK-009 tests should cover behavior changed during this hardening pass.

---

# 48. TypeScript

Maintain:

```text
strict
noUncheckedIndexedAccess
```

Do not use casts to silence Expo Router type issues if proper route typing can resolve them cleanly.

Do not introduce `any`.

---

# 49. Expected Files

Likely modifications:

```text
src/app/_layout.tsx

src/app/(tabs)/_layout.tsx
src/app/(tabs)/index.tsx
src/app/(tabs)/favorites.tsx

src/app/shows/[id].tsx

src/features/favorites/components/FavoritesBadge.tsx

src/components/ui/Button.tsx
src/components/ui/IconButton.tsx
src/components/ui/Chip.tsx
src/components/ui/SearchInput.tsx

src/features/shows/components/ShowCard.tsx
src/features/shows/components/SeasonAccordion.tsx
```

Only modify files requiring actual hardening.

Do not churn the whole project for stylistic preference.

---

# 50. Prohibited Shortcuts

Do not:

- create custom navigation from scratch;
- duplicate Detail routes;
- persist favorite count;
- add navigation state to FavoritesProvider;
- move filters into global state;
- introduce new product features;
- add UI/navigation dependencies;
- hide accessibility issues by removing semantics;
- replace feature-specific error states with one global error;
- broadly redesign working components;
- weaken tests.

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

- final tab navigation implemented/refined;
- Favorites count integrated;
- Show Detail stack behavior finalized;
- accessibility hardening completed;
- loading/error/empty UX reviewed and corrected;
- visual interaction consistency improved.

## Files

List important created/modified files.

## Tests

List navigation/accessibility/UX behavior added or updated.

## Validation

```text
format:check — PASS/FAIL
lint         — PASS/FAIL
typecheck    — PASS/FAIL
test:ci      — PASS/FAIL
```

## Notes

Mention only:

- meaningful navigation trade-off;
- known accessibility limitation;
- NativeWind preview workaround, if one was actually necessary.

---

# 53. Definition of Done

TASK-009 is complete when:

- Home and Favorites are the two primary tabs;
- tab labels/icons are clear;
- Favorites count is visible and reactive;
- Show Detail remains outside tabs;
- Detail navigation from Home/Favorites uses one route;
- stack back behavior preserves origin;
- interactive controls expose meaningful accessibility semantics;
- selected/expanded/disabled state is accessible where applicable;
- touch targets are reasonable;
- loading states remain contextual;
- isolated errors preserve unaffected data;
- empty states remain semantically distinct;
- missing optional data is presented safely;
- layout is coherent on mobile;
- no new product feature or dependency is introduced;
- meaningful changed behavior is tested;
- all quality gates pass.
