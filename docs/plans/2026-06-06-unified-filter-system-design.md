# Unified Filter System Design

**Status:** Implemented (2026-06-06)

**Goal:** Replace the four page-local, copy-pasted filter UIs (`/berichte`, `/suche`, `/trends`, `/regional`) with one shared, modern filter component system: dual-thumb year-range slider, instant apply, consistent styling — while keeping a no-JS fallback via plain GET forms.

**Tech decisions (agreed):**
- **UI library: shadcn/ui** — Radix-based, Tailwind v4 compatible, components are copied into the repo (no runtime framework dependency). Used primarily for the `Slider` (dual thumb) and shared design tokens; selects stay native for the no-JS fallback.
- **Interaction: instant apply with progressive enhancement** — filter changes update the URL immediately (`router.replace`), server components re-render. Without JS the same markup degrades to a classic GET form with a submit button.

---

## 1. Current state

| Page | Filters | Implementation |
|---|---|---|
| `/berichte` | type, language, jurisdiction, min_year, max_year | inline `<select>`s, GET form |
| `/suche` | q, jurisdiction, min_year, max_year | inline input + `<select>`s, GET form |
| `/trends` | q (multi-term), term add/remove | text input + hidden inputs + pill links |
| `/regional` | q (+ min_year/max_year parsed but **not exposed in UI**) | inline input, GET form |

Problems:
- The year range (two Von/Bis selects, 1950–current) is duplicated verbatim in berichte and suche.
- The jurisdiction select is duplicated (with drift: `"Alle Behörden"` vs `"Alle Behoerden"`).
- Tailwind class strings for form controls are repeated ~10× with accidental variations (`dark:bg-gray-800` vs `dark:bg-gray-900`).
- No shared filter components exist; `src/components/` has none.
- Regional accepts year params but offers no UI for them.

What's already good and must be preserved:
- **Filter state lives in the URL** (shareable/bookmarkable links, server-rendered results).
- **URL parameter names are the public contract** — `q`, `type`, `language`, `jurisdiction`, `min_year`, `max_year`, `seite` stay exactly as they are (existing links and the Flask app's URL scheme keep working).

### No-JS reality check

Without JavaScript today: all four filter forms work (plain GET), navbar search works (`action="/suche" method="get"`), lists/pagination/document pages work. Broken without JS: ECharts charts on trends/regional, MobileMenu, DarkModeToggle. So the no-JS fallback matters most on **berichte** and **suche**; on trends/regional the charts need JS anyway, but the filter forms still degrade gracefully for free.

---

## 2. Architecture

### File layout

Guiding principle: **the form DOM is the state, the URL is the store, server components are the renderer.** There is no React client state for filters at all — the client boundary shrinks to three small leaf islands.

```
src/components/ui/            ← shadcn primitives (generated, then owned by us)
  slider.tsx                  ← Radix dual-thumb slider
  button.tsx
  input.tsx
  label.tsx
  badge.tsx
src/components/filters/
  FilterBar.tsx               ← SERVER component: real <form method="get"> + layout + submit button
  AutoSubmit.tsx              ← client leaf (renders nothing): change-listener on parent form → router.replace
  SearchInput.tsx             ← client leaf: debounced text input (q)
  YearRangeFilter.tsx         ← client leaf: slider bound to two native number inputs (min_year/max_year)
  SelectFilter.tsx            ← SERVER: styled NATIVE <select> (jurisdiction, type, language) — zero client JS
  TermTags.tsx                ← trends: active term pills + add input
  build-filter-url.ts         ← pure function: FormData → query string (unit-tested)
  filter-constants.ts         ← shared option lists (types, languages)
```

Year bounds come from the data: `getYearBounds()` in `src/lib/queries/documents.ts`.

### FilterBar (the core pattern)

A **server component** that renders a real `<form method="get" action={pathname}>` with native controls, plus one tiny client island:

- **Before hydration / without JS:** the form is fully functional. Native inputs and selects carry the `name` attributes; a visible "Filtern" submit button posts the GET request. This is the fallback — no `<noscript>` hacks needed.
- **After hydration:** `<AutoSubmit />` (a client leaf that renders no UI) attaches a `change` listener to its parent form via ref. On change it serializes the form (`new FormData(form)`), builds the query string via `build-filter-url.ts`, and calls `router.replace(url, { scroll: false })` inside `useTransition` (pending state can dim the result list). It also sets `data-enhanced` on the form, which hides the now-redundant submit button via CSS.
- **Event-based decoupling:** enhanced controls (slider, debounced search input) don't call the router themselves — they write to native form fields and dispatch a `change` event; `AutoSubmit` picks it up. One navigation code path for everything.
- **Pagination reset:** `build-filter-url.ts` always drops `seite` and omits empty values — changing a filter returns to page 1 (same behavior as a form submit today, must not regress in the instant-apply path).
- **Debouncing:** the search input debounces ~300 ms; selects apply immediately (native `change`); the slider applies on `onValueCommit` (thumb release), not on every drag tick.
- Optional row: active-filter chips with × to remove + "Zurücksetzen" link to the bare pathname.

**Why not Server Actions as `form action`?** They are progressively enhanced too, but actions are POST-based — filters want shareable GET URLs, so an action would be POST → `redirect()` → GET (an extra round trip), and instant apply would still need the same client change-listener. The plain GET form is strictly simpler.

```tsx
// sketch
<FilterBar action="/suche">
  <SearchInput name="q" defaultValue={q} />
  <SelectFilter name="jurisdiction" label="Behörde" options={jurisdictions} allLabel="Alle Behörden" defaultValue={jurisdiction} />
  <YearRangeFilter min={minYear} max={maxYear} />
</FilterBar>
```

### YearRangeFilter (the "modern" centerpiece)

Replaces the two Von/Bis dropdowns:

- Two **native** `<input type="number" name="min_year|max_year">` fields (compact, also serve as precise keyboard entry) — these are the actual form fields and the no-JS fallback.
- A shadcn/Radix `Slider` with two thumbs **rendered only after mount**, bound bidirectionally to the inputs. Pre-hydration/no-JS users simply see the two number inputs. On `onValueCommit` the slider writes the values into the number inputs and dispatches a `change` event — navigation itself is handled by `AutoSubmit`.
- Range: dynamic from the corpus via `getYearBounds()` (cached `MIN/MAX(year)` query, `corpus` tag), with 1950/current year only as empty-DB fallback. Slider at full extent = params omitted = no constraint.
- Empty inputs = no constraint (params omitted from URL, as today).

### SelectFilter — deliberately native

Jurisdiction/type/language stay native `<select>` elements with one shared styled wrapper (custom chevron, shadcn-consistent tokens) — a **server component with zero client JS**; instant apply comes for free from the native `change` event bubbling to `AutoSubmit`. Rationale: native selects are the best mobile UX, are keyboard/screen-reader correct for free, and keep the no-JS fallback. We deliberately do **not** use shadcn's Radix `Select` here. If jurisdiction later becomes multi-select, upgrade that one control to a shadcn `Combobox` (JS-only, acceptable as enhancement).

### TermTags (trends)

Trends keeps its distinct interaction (term list instead of single query) but moves into the same `FilterBar` container and visual language:

- Active terms as shadcn `Badge` pills with × remove.
- With JS: add/remove updates the `q` array via `applyFilters`. Without JS: today's mechanism is kept — hidden `q` inputs + text input + submit.
- Suggestion pills reuse the same `Badge` style (outline variant).

---

## 3. shadcn/ui setup

```bash
npx shadcn@latest init        # Tailwind v4 flow; creates components.json, lib/utils (cn), CSS vars in globals.css
npx shadcn@latest add slider button input label badge
```

- New deps (small): `@radix-ui/react-slider`, `clsx`, `tailwind-merge`, `class-variance-authority`, `lucide-react` (icons; optional — can skip and keep inline SVGs).
- **Theme mapping:** shadcn writes CSS variables (`--primary`, `--background`, …) into `globals.css`. Map them to the existing palette — primary = current `blue-700`/`blue-500` focus ring, neutrals = current grays — so existing pages don't shift visually. Dark mode already uses a `.dark` class with `@custom-variant dark (&:is(.dark *))`, which is exactly shadcn's expected setup; no change needed.
- Scope discipline: only the five components above. Navbar/SearchForm/Pagination are *not* migrated in this effort (no big-bang restyle), but new filter components must visually match them.

---

## 4. Page-by-page migration

| Page | Change |
|---|---|
| `/suche` | First migration (most traffic, has all control types): `SearchInput` + `SelectFilter`(jurisdiction) + `YearRangeFilter`. Navbar autocomplete behavior stays in the navbar `SearchForm`; the page-level `SearchInput` can adopt autocomplete later. |
| `/berichte` | `SelectFilter`×3 (type, language, jurisdiction) + `YearRangeFilter`. Removes the largest block of duplicated markup. |
| `/regional` | `SearchInput` + **newly exposed** `YearRangeFilter` (params are already parsed server-side — pure win). |
| `/trends` | `FilterBar` container + `TermTags`. Visual unification; interaction logic unchanged. |

All four pages — including `FilterBar` and the selects — stay **server components**; the only client islands are `AutoSubmit`, `YearRangeFilter` (slider), `SearchInput` (debounce), and `TermTags`.

---

## 5. Testing

- **Unit (vitest):** `build-filter-url.ts` — param merge, `seite` reset, empty-value omission, year clamping, multi-value `q` (trends).
- **E2E (playwright):** per page: change a filter → URL updates → results re-render. Slider drag on suche. Term add/remove on trends.
- **No-JS E2E:** one playwright project with `javaScriptEnabled: false` — suche and berichte forms must filter via submit button.
- Existing e2e tests touching filter selectors will need selector updates — review `tests/` during implementation.

---

## 6. Alternatives considered

- **nuqs** for URL state: nice typed API + built-in debounce, and its `createSearchParamsCache` would give shared typed param parsing on the server. But nuqs' model is client hooks + controlled components (`useState` synced to the URL) — in this design the filter controls are server-rendered native form fields with no React state at all, so there is nothing for nuqs to attach to. The one place that builds URLs is the pure `build-filter-url.ts` (~40 lines). Skipped; revisit only if filters ever become client-stateful (e.g. complex multi-select with optimistic UI).
- **Base UI / react-aria-components:** both solid, but more styling work from scratch and a smaller Tailwind ecosystem; shadcn gives the slider + token system with the least friction.
- **Radix `Select` for dropdowns:** rejected — breaks no-JS, worse on mobile than native selects, no functional gain for single-select.
- **`<noscript>` submit button:** rejected in favor of "render button, hide after mount" — `<noscript>` doesn't cover the pre-hydration window on slow connections.

## 7. Open questions

1. ~~Should jurisdiction become **multi-select** (e.g. compare Bund + Bayern)?~~ **Resolved: yes, later effort** — see `2026-06-06-jurisdiction-multiselect-design.md`. The `SelectFilter` API did not block it: a sibling `MultiSelectFilter` (shadcn Combobox + native `<select multiple>` fallback) replaces the jurisdiction control; type/language stay native single selects.
2. ~~Derive slider min year from actual data instead of hardcoded 1950?~~ **Resolved: yes** — `getYearBounds()` queries `MIN/MAX(year)` (cached, `corpus` tag); 1950/current year remain only as empty-DB fallback.
3. ~~Should the page-level `SearchInput` get the navbar's autocomplete dropdown (shared component) in this effort or later?~~ **Resolved: later effort** — see `2026-06-06-autocomplete-input-design.md` (shared `useAutocomplete` hook for the homepage form, /suche and the /analyse term input).
