# Show Explorer — Product Specification

**Status:** Draft
**Version:** 1.0
**Last updated:** 2026-08-14

## 1. Purpose

Show Explorer is a React Native mobile application for discovering TV shows using the public TVMaze API.

The application allows users to:

- browse an infinitely scrolling catalog of TV shows;
- search shows by name;
- filter shows by status and rating;
- inspect detailed show information;
- browse episodes grouped by season;
- favorite and unfavorite shows;
- access persisted favorites from a dedicated screen.

This document defines the expected product behavior and acceptance criteria.

Implementation details and architectural decisions belong in `ARCHITECTURE.md` and `DECISIONS.md`.

---

## 2. Product Goals

### G-01 — Discovery

Users must be able to efficiently browse and discover TV shows.

### G-02 — Search and refinement

Users must be able to search shows by name and refine visible results using status and rating filters.

### G-03 — Show exploration

Users must be able to inspect show information and browse episodes organized by season.

### G-04 — Personal collection

Users must be able to maintain a persistent collection of favorite shows.

### G-05 — Resilient experience

Loading, empty and error states must be intentionally represented throughout the application.

### G-06 — Mobile usability

Interactions must be appropriate for a mobile interface, including accessible touch targets, clear navigation and performant long lists.

---

# 3. Navigation

The application contains two primary destinations:

- Home
- Favorites

A persistent bottom navigation bar must expose both destinations.

The Home destination must display a home icon and label.

The Favorites destination must display a heart icon, label and visible favorite count.

Show details are presented outside the primary tab destinations.

Navigation hierarchy:

```text
Root
├── Tabs
│   ├── Home
│   └── Favorites
│
└── Show Detail
```

Opening a show from either Home or Favorites must navigate to the same Show Detail experience.

Returning from Show Detail must return the user to the previous navigation context.

---

# 4. Domain Terminology

## Show

A TV show available through TVMaze.

For product behavior, a show may expose:

- identifier;
- name;
- image;
- status;
- rating;
- genres;
- summary;
- premiere information.

Not every field is guaranteed to be available.

The UI must handle unavailable optional information gracefully.

## Favorite Show

A show explicitly saved by the user.

Favorite shows persist across application reloads.

## Episode

An episode belonging to a show.

Episodes belong to seasons and are displayed grouped by season.

## Season

A presentation grouping containing episodes with the same season number.

---

# 5. Home

## FR-01 — Browse shows

The Home screen must display a list of TV shows.

Each visible show item must display at least:

- image;
- name;
- status.

The product additionally displays rating when available.

Genres may be displayed when appropriate to the final card design.

Selecting a show must open Show Detail.

---

## FR-02 — Infinite scrolling

When Home is operating in browse mode, shows must be loaded incrementally as the user approaches the end of the currently loaded list.

The initial page must not require the user to manually request more results.

When additional data is available:

1. the user approaches the end of the list;
2. the application requests the next page;
3. loading placeholders appear at the end of the existing content;
4. newly loaded shows are appended to the list.

Existing content must remain visible while the next page loads.

The application must prevent duplicate concurrent next-page requests.

If no additional page exists, reaching the end must not trigger further requests.

---

# 6. Search

## FR-03 — Home search

Home must contain a search field for searching shows by name.

When the normalized search value is empty, Home operates in **browse mode**.

Browse mode uses the paginated TVMaze shows catalog.

When the normalized search value contains text, Home operates in **search mode**.

Search mode queries TVMaze show search.

Search input must be debounced before triggering remote requests.

The expected debounce interval is approximately **350 milliseconds**.

Whitespace-only input is treated as empty.

Clearing search must return Home to browse mode.

Browse and search are separate data acquisition modes.

Search results must not be treated as pages of the browse dataset.

---

# 7. Filters

Both Home and Favorites must expose:

- status filter;
- minimum rating filter.

Search, status and rating controls must be visually reusable between both screens while preserving screen-specific behavior.

---

## FR-04 — Status filter

Supported user-facing status options are:

- All;
- Running;
- Ended;
- To Be Determined.

`All` represents no status restriction.

Status filtering is performed against the dataset currently available to the screen.

On Home, this means filtering the shows currently returned by browse or search.

The application must not attempt to download the entire TVMaze catalog in order to provide a global status-filtered dataset.

---

## FR-05 — Rating filter

Users must be able to restrict visible shows by minimum rating.

Supported options are:

- Any;
- 6+;
- 7+;
- 8+;
- 9+.

`Any` represents no rating restriction.

For a selected minimum rating, a show is visible when its available rating is greater than or equal to the selected threshold.

Shows without a rating remain visible when `Any` is selected.

Shows without a rating do not satisfy a numeric minimum rating.

---

## FR-06 — Combined filtering

Status and rating filters must be combinable.

When both filters are active, a show must satisfy both conditions to remain visible.

Search and filters are separate concerns:

```text
dataset acquisition
        ↓
search mode selection
        ↓
available shows
        ↓
status filter
        ↓
rating filter
        ↓
visible shows
```

Changing filters must not unnecessarily trigger new remote requests.

---

# 8. Favorites

## FR-07 — Favorite a show

Users must be able to favorite a show from relevant show presentation surfaces.

The favorite action must provide immediate visual feedback.

A show cannot exist more than once in the favorites collection.

---

## FR-08 — Unfavorite a show

Users must be able to remove an existing favorite.

Removing a favorite must immediately update:

- the favorite action state;
- the Favorites screen;
- the visible favorites count.

---

## FR-09 — Favorites persistence

Favorites must persist across application reloads.

The Favorites screen must be usable from locally persisted favorite information without requiring a remote request to reconstruct the list.

---

## FR-10 — Favorite count

The application must expose a visible count of currently saved favorite shows.

The count must update immediately after favorite and unfavorite actions.

---

## FR-11 — Favorites screen

Favorites must have a dedicated primary navigation destination.

The screen displays the user's persisted favorite shows.

Selecting a favorite must open Show Detail.

---

## FR-12 — Favorites search

Favorites must expose the same search control presentation used on Home.

Unlike Home search, Favorites search is local.

Typing into Favorites search must filter the persisted favorites collection by show name.

Favorites search must not call the TVMaze search endpoint.

Search matching must be case-insensitive.

Whitespace surrounding the search term must not affect matching.

---

## FR-13 — Favorites filters

Favorites must expose the same status and rating filter options available on Home.

Filtering is performed locally against persisted favorite show information.

Search, status and rating filters must work together.

---

# 9. Show Detail

## FR-14 — Show information

Selecting a show must open Show Detail.

The screen should present available information relevant to understanding the show, including:

- image;
- name;
- status;
- rating;
- genres;
- summary;
- premiere information where available.

Optional unavailable information must not cause broken layouts or placeholder text such as `undefined` or `null`.

The user must be able to favorite or unfavorite the show from Show Detail.

---

# 10. Episodes

## FR-15 — Episode retrieval

Show Detail must load the episodes belonging to the selected show.

Episode loading must not prevent already available show information from being displayed.

A failure to load episodes must not necessarily make the entire Show Detail screen unusable.

---

## FR-16 — Group episodes by season

Episodes must be grouped by season.

Season ordering must be ascending.

Episodes within each season must preserve their logical episode ordering.

The grouping must produce a presentation concept equivalent to:

```text
Season
├── number
└── episodes[]
```

---

## FR-17 — Collapsible seasons

Each season must be displayed using a collapsible section.

The season header must communicate:

- season number;
- episode count;
- expanded or collapsed state.

The first season is expanded initially.

Remaining seasons are collapsed initially.

Users must be able to independently expand and collapse seasons.

Collapsing a season hides its episode list without removing other season sections.

---

# 11. Loading States

## NFR-01 — Initial list loading

Initial Home loading must use show-card skeleton placeholders rather than relying solely on a full-screen activity indicator.

Skeletons should approximately preserve the geometry of the final content.

---

## NFR-02 — Pagination loading

When another browse page is being loaded:

- existing shows remain visible;
- skeleton show items appear at the end of the list.

Pagination loading must not replace the entire existing list with a loading screen.

---

## NFR-03 — Search loading

Remote search must communicate that results are loading.

Existing interaction controls should remain usable where appropriate.

---

## NFR-04 — Detail loading

Show Detail must provide an intentional loading representation while required show information is unavailable.

---

## NFR-05 — Episodes loading

Episode loading must be represented independently from already available show details.

---

# 12. Empty States

The application must distinguish meaningful empty scenarios.

## ES-01 — Browse empty

Displayed if the browse source contains no shows.

## ES-02 — Search empty

Displayed when a remote search returns no matches.

The state should communicate that no shows matched the search.

## ES-03 — Filter empty

Displayed when shows exist in the underlying dataset but active filters remove every visible result.

This state should differ semantically from a remote search returning no results.

## ES-04 — Favorites empty

Displayed when the user has not saved any favorites.

The state should explain that shows can be added to Favorites using the favorite action.

## ES-05 — Favorites search/filter empty

Displayed when favorites exist but the current local search/filter combination produces no visible matches.

---

# 13. Error States

## ER-01 — Initial browse failure

An initial browse failure must display an error state with a retry action.

---

## ER-02 — Pagination failure

A failure while requesting another page must not remove already loaded shows.

The failure must be represented near the pagination boundary and provide a retry mechanism.

---

## ER-03 — Search failure

A remote search failure must communicate failure and allow retry.

---

## ER-04 — Show Detail failure

Failure to load required show information must display an appropriate error state with retry capability.

---

## ER-05 — Episodes failure

Failure to load episodes must be represented independently when show information is already available.

The user should remain able to inspect the show and retry episode loading.

---

# 14. Data Freshness and Request Behavior

## NFR-06 — Request efficiency

The application must avoid unnecessary duplicate requests.

Search must be debounced.

Pagination must not issue concurrent duplicate next-page requests.

Client-side filter changes must not trigger remote requests when the underlying remote dataset has not changed.

---

## NFR-07 — Rate-limit awareness

The client must behave conservatively toward the TVMaze API rate limit.

Transient failures may be retried a limited number of times.

Rate-limit responses must not cause uncontrolled retry loops.

---

# 15. List Performance

## NFR-08 — Long-list rendering

Long show collections must use a virtualized high-performance list.

The application uses FlashList for primary show collections.

Items must have stable identifiers.

Expensive transformations must not be unnecessarily repeated during list rendering.

---

## NFR-09 — Images

Show images must load asynchronously.

Missing images must not break show cards or detail layouts.

The application should maintain stable image geometry to reduce visible layout movement.

---

# 16. Accessibility

## NFR-10 — Interactive controls

Interactive controls must provide meaningful accessibility information.

This includes:

- navigation destinations;
- favorite actions;
- filters;
- season expand/collapse controls.

---

## NFR-11 — Favorite action

Favorite controls must communicate both the target show and action.

Equivalent accessible intent:

```text
Add Breaking Bad to favorites
```

or:

```text
Remove Breaking Bad from favorites
```

---

## NFR-12 — Filter selection

Filter controls must expose their selected state where supported.

---

## NFR-13 — Season state

Season controls must communicate whether the season is expanded or collapsed.

---

## NFR-14 — Touch interaction

Interactive targets must be reasonably sized for touch interaction.

---

# 17. State Independence

Home discovery controls and Favorites discovery controls are independent.

For example:

1. the user selects `Running` and `8+` on Home;
2. the user navigates to Favorites;
3. Favorites does not automatically inherit those filter values.

Each screen owns its current search and filter selections.

Favorites collection state itself is shared across the application.

---

# 18. Resilience to Missing API Data

Remote API data must be treated as potentially incomplete.

The product must gracefully handle cases such as:

- missing image;
- missing rating;
- missing summary;
- missing premiere information;
- unavailable optional episode metadata.

Missing optional data must not crash the application.

---

# 19. Acceptance Criteria

## AC-01 — Browse

**Given** the user opens Home
**When** the initial shows request succeeds
**Then** a list of shows is displayed with at least name, image and status.

---

## AC-02 — Infinite scroll

**Given** Home has more browse data available
**When** the user approaches the end of the list
**Then** the next page is requested once
**And** pagination skeletons are displayed
**And** existing shows remain visible
**And** new shows are appended after success.

---

## AC-03 — Search

**Given** the user is on Home
**When** they enter a non-empty show name
**Then** the input is debounced
**And** TVMaze search is used
**And** normalized search results replace browse results for presentation.

---

## AC-04 — Clear search

**Given** Home is in search mode
**When** the user clears the search field
**Then** Home returns to browse mode.

---

## AC-05 — Status filtering

**Given** visible shows have different statuses
**When** a status filter is selected
**Then** only matching shows from the currently available dataset remain visible.

---

## AC-06 — Rating filtering

**Given** visible shows have different ratings
**When** the user selects `8+`
**Then** only shows with an available rating greater than or equal to 8 remain visible.

---

## AC-07 — Combined filters

**Given** status and rating filters are both active
**Then** visible shows satisfy both conditions.

---

## AC-08 — Favorite

**Given** a show is not currently a favorite
**When** the user favorites it
**Then** the favorite state updates immediately
**And** the favorites count increases
**And** the show becomes available in Favorites.

---

## AC-09 — Persistence

**Given** at least one favorite exists
**When** the application reloads
**Then** the favorite remains available.

---

## AC-10 — Favorites search

**Given** multiple favorites exist
**When** the user searches inside Favorites
**Then** filtering occurs locally
**And** no remote search request is required.

---

## AC-11 — Detail

**Given** the user selects a show
**Then** Show Detail opens
**And** available show information is presented.

---

## AC-12 — Seasons

**Given** episodes were successfully loaded
**Then** episodes are grouped by season
**And** seasons appear in ascending order
**And** the first season is initially expanded
**And** other seasons are initially collapsed.

---

## AC-13 — Episode failure isolation

**Given** show information loads successfully
**And** the episodes request fails
**Then** show information remains usable
**And** an episode-specific error state is shown
**And** episode loading can be retried.

---

## AC-14 — Empty favorites

**Given** no favorites exist
**When** the user opens Favorites
**Then** an intentional Favorites empty state is displayed.

---

## AC-15 — Filter independence

**Given** filters are selected on Home
**When** the user opens Favorites
**Then** Favorites maintains its own independent search and filter state.

---

# 20. Assumptions

## A-01 — Status filtering scope

TVMaze browse pagination is treated as the source of available browse data.

Status filtering applies only to the dataset currently available to the client.

The application does not fetch every TVMaze page to create a globally exhaustive filtered result.

## A-02 — Rating filtering scope

Rating filtering follows the same client-side scope as status filtering.

## A-03 — Favorites availability

Favorites store enough show information locally to render the Favorites list and apply local search/status/rating filtering without reconstructing the collection from remote API calls.

## A-04 — Remote data

TVMaze remains the authoritative source for current remote show and episode information.

A persisted favorite represents a local presentation snapshot and may therefore temporarily differ from current remote information.

---

# 21. Out of Scope

The initial implementation intentionally excludes:

- authentication;
- user accounts;
- cloud synchronization;
- backend services owned by Show Explorer;
- offline synchronization of the complete TVMaze catalog;
- downloading all TVMaze pages for exhaustive filtering;
- advanced sorting;
- custom user ratings;
- reviews;
- notifications;
- watchlists separate from Favorites;
- episode playback;
- pagination inside remote search where unsupported by the selected endpoint behavior;
- E2E automation in the initial implementation;
- analytics;
- push notifications.

These may be considered future improvements but are not required for the initial take-home implementation.

---

# 22. Requirement Traceability

| Requirement                | Origin                                           |
| -------------------------- | ------------------------------------------------ |
| Infinite show browsing     | Assignment                                       |
| Name search                | Assignment                                       |
| Status filter              | Assignment                                       |
| Show Detail                | Assignment                                       |
| Episodes                   | Assignment                                       |
| Favorites                  | Assignment                                       |
| Persistent Favorites       | Assignment                                       |
| Favorites view             | Assignment                                       |
| Visible Favorites count    | Assignment                                       |
| Loading/error/empty states | Assignment                                       |
| Episodes grouped by season | Assignment bonus promoted to product requirement |
| Rating filter              | Show Explorer enhancement                        |
| Favorites search/filter    | Show Explorer enhancement                        |
| Collapsible seasons        | Show Explorer enhancement                        |
| Skeleton pagination        | Show Explorer UX decision                        |
| Accessibility requirements | Show Explorer quality requirement                |
