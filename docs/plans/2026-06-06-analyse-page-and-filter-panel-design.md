# Analyse Page (Trends + Regional) & Unified Filter Panel

**Status:** Draft — iterate before implementation

**Goal:** (1) One consistent filter panel look across all filter pages; (2) merge `/trends` and `/regional` into a single term-analysis page at `/analyse` — both are "how often does a term appear", just along different axes (time vs. region).

**Decisions (agreed):** stacked sections (chart above heatmap), new route `/analyse` with permanent redirects, gray panel box with visible labels everywhere.

Builds on the unified filter system (`2026-06-06-unified-filter-system-design.md`); components and URL-state architecture stay as they are.

---

## 1. FilterPanel — one look for all pages

New thin server component wrapping the existing `FilterBar`:

```
src/components/filters/FilterPanel.tsx   ← FilterBar + the berichte-style box:
                                            rounded-xl bg-gray-50 dark:bg-gray-900 p-6,
                                            children in flex flex-wrap items-end gap-3
```

- All controls get **visible labels** (`labelVisible` becomes the default in `SelectFilter`/`YearRangeFilter`; sr-only stays available via prop).
- Page rollout:
  - **berichte**: already this look — swap markup for `FilterPanel`, no visual change.
  - **suche**: search input becomes row 1 *inside* the panel (full width, `lg`), labeled controls row 2. The hidden-when-enhanced submit stays.
  - **analyse** (new, below): term input + pills row 1, Zeitraum row 2.
- `FilterSubmit` placement and behavior unchanged.

## 2. /analyse — merged page

### URL contract

| Param | Meaning | From |
|---|---|---|
| `q` (multi) | active terms, max 5 | trends |
| `term` | add-action input (folded into terms server-side) | trends |
| `remove` | remove-action (kept for inbound links) | trends |
| `min_year`, `max_year` | year range, applies to **both** views | regional |
| `fokus` | which term the heatmap shows (default: first term) | new |

### Layout (stacked)

1. Header + intro
2. **FilterPanel**: term input + "Hinzufügen" (visible submit, `data-filter-manual` input) and `YearRangeFilter`; below the panel: `TermTags` pills + suggestions
3. **Zeitverlauf** section: `TrendChart` for all active terms + collapsible data table (no-JS fallback) — unchanged from trends
4. **Regional** section: heatmap for the *fokus* term + legend + CSV export. With >1 term, a small pill row above the heatmap switches `fokus` (plain links — no-JS safe)

Both data sections render only when terms exist. Optional: wrap each section in `<Suspense>` so the chart streams in before the heatmap query finishes.

### Data layer — no new queries needed

- Chart: `getTermStats(term, { minYear, maxYear })` — **params already exist**, trends just never passed them. Year range now filters the chart too.
- Heatmap: `getMentions(fokusTerm, { minYear, maxYear })` — unchanged.
- Note: the chart has data only from 1993 (`TRENDS_MIN_YEAR`, coverage cutoff); the heatmap goes further back. Slider bounds stay global (`getYearBounds()`) — the chart simply starts at 1993.

### Jurisdiction filter — considered, deferred

`getTermStats` even supports `jurisdiction`, so a Behörde filter on the chart is cheap. But the heatmap *is* the jurisdiction comparison — a filter that affects one section and not the other is confusing. Deferred; if wanted later: filter applies to chart + highlights the matching heatmap row.

### Redirects & link updates

- `next.config.ts` gets `redirects()`: `/trends` → `/analyse`, `/regional` → `/analyse`, both `permanent: true`. Query strings pass through automatically (Next preserves them); the old params (`q`, `term`, `remove`, `min_year`, `max_year`) are all valid on `/analyse` — old bookmarks keep working.
- Internal links to update: `Navbar` + `MobileMenu` (two entries → one "Analyse"), `Footer` (2), homepage `page.tsx` (4), `ChartCarousel` (1), `sitemap.ts` (2 entries → 1).
- Metadata: title "Analyse", description covers both views, og-image: reuse `/thumbnail_regional.jpg` for now.
- Delete `src/app/(frontend)/trends/` and `regional/` after the redirects are in.

## 3. Tests

- E2E: merge `trends.test.ts` + `regional.test.ts` → `analyse.test.ts` (same scenarios on the new route, plus fokus-switch with 2 terms); add redirect assertions (`/trends?q=NSU` → 308 → `/analyse?q=NSU`).
- no-js.test.ts: point trends/regional scenarios at `/analyse`; add: heatmap fokus switch works without JS (plain links).
- Visual: FilterPanel on suche/berichte before/after screenshots.

## 4. Out of scope

- Jurisdiction filter on the chart (see above)
- Autocomplete on the term input (same open question as on /suche)
- Combining with /suche in any way — search stays its own page

## Open questions

1. Navbar label: "Analyse" — or "Begriffe"/"Begriffsanalyse"?
2. Should the suggestions row move *into* the panel box or stay below it (current draft: below, like today)?
