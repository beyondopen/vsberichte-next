# Jurisdiction Multi-Select & Analyse Chart Filter

**Status:** Draft — iterate before implementation

**Goal:** (1) Upgrade the Behörde filter on `/berichte` and `/suche` from single-select to multi-select (e.g. compare Bund + Bayern); (2) add the same multi-select to `/analyse`, where it filters the time-series chart and highlights the matching heatmap rows. Resolves open question 1 of the unified filter system design and the deferred jurisdiction filter of the analyse page design.

**Decisions (agreed):**
- **UI control: shadcn Combobox** (Popover + Command/cmdk) with checkbox options and removable badges — the upgrade path the filter system design already anticipated ("upgrade that one control to a shadcn Combobox, JS-only, acceptable as enhancement"). A native `<select multiple>` remains as the pre-hydration/no-JS fallback.
- **`/analyse` gets the identical control** — consistent UX over all three pages. The chart aggregates over the selected jurisdictions; the heatmap stays unfiltered (it *is* the jurisdiction comparison) but highlights the selected rows. This resolves the original objection ("a filter that affects one section and not the other is confusing"): the highlight communicates *which rows the chart aggregates* while the comparison stays complete.

Builds on the unified filter system (`2026-06-06-unified-filter-system-design.md`); form-as-state, URL-as-store and the `AutoSubmit` navigation path stay as they are.

---

## 1. Current state

- `SelectFilter` renders a native single `<select name="jurisdiction">` on `/berichte` and `/suche`; `/analyse` has no jurisdiction control.
- All query functions take a single value: `searchDocumentPages` (`search.ts`), `getFilteredDocuments` (`documents.ts`), `getTermStats` (`stats.ts`, param exists but is never passed by `/analyse`). The `/berichte` grid view filters in JS (`jur !== jurisdictionFilter`).
- Multi-value URL params are already an established pattern: `?q=a&q=b` on `/analyse`, `buildFilterUrl` uses `params.append`, so repeated form fields survive into the URL **with zero changes** there.

## 2. URL contract

| Aspect | Behavior |
|---|---|
| Multi value | repeated params: `?jurisdiction=Bund&jurisdiction=Bayern` (same as `q` on /analyse) |
| Empty | param omitted = all jurisdictions (unchanged) |
| Back-compat | single-value links `?jurisdiction=Bayern` parse to `['Bayern']` — `ANY(['Bayern'])` ≡ old equality |
| Unknown values | dropped silently (a bad value already yields zero rows today, never a 500) |
| Param name | `jurisdiction` stays — public contract |

New pure helper in `src/lib/jurisdictions.ts`:

```ts
/** string | string[] | undefined → sorted, deduped array of KNOWN jurisdictions. */
export function normalizeJurisdictions(raw: string | string[] | undefined): string[]
```

Sorting is load-bearing: the array becomes part of `unstable_cache` keys (`getTermStats`), so `?jurisdiction=Bayern&jurisdiction=Bund` and the reverse must produce the same key.

## 3. Component: MultiSelectFilter

New client island `src/components/filters/MultiSelectFilter.tsx`. `SelectFilter` stays untouched (still used for type/language — those remain native single selects with zero JS).

```ts
interface MultiSelectFilterProps {
  id: string
  name: string              // 'jurisdiction'
  label: string             // 'Behörde'
  labelVisible?: boolean
  allLabel?: string         // trigger text when nothing is selected
  options: string[]
  selected: string[]        // normalized current selection
  className?: string
}
```

**Form state = hidden inputs.** One `<input type="hidden" name="jurisdiction" value={j}>` per selected jurisdiction. `FormData` serializes them, `buildFilterUrl` appends them, `AutoSubmit` navigates — the existing single navigation code path, no `AutoSubmit` change. On toggle/badge-remove: update React state, flush, then dispatch a bubbling `change` event (the `YearRangeFilter` commit pattern) so the hidden inputs are in the DOM before `FormData` reads it.

**UI (after mount):** Popover trigger styled like `SelectFilter`; Command list with a check indicator per option and cmdk's type-to-filter. Trigger label (decided): `allLabel` when empty, names for 1–2 selections ("Bund, Bayern"), "N Behörden" from 3 up. **No badge pills** (decided): the selection is visible in the trigger and as checkmarks in the list; deselection happens in the list. Keeps the filter row as compact as the other selects and avoids a second pill row next to the term tags on /analyse.

**No-JS fallback (before mount / without JS):** a native `<select multiple size={6}>` with the current selection — submits the identical repeated params on GET. Same swap-after-mount approach as `YearRangeFilter`'s slider placeholder. Empty selection = no param = all, so no "Alle" sentinel option is needed.

**A11y:** trigger `aria-haspopup="listbox"` + `aria-expanded`; cmdk provides listbox/option semantics and keyboard nav.

New shadcn primitives: `npx shadcn@latest add popover command` (adds `cmdk`; `@radix-ui/react-popover` is already present). Same care as the initial setup: the CLI must not touch fonts/`layout.tsx`/`globals.css`.

## 4. Query layer

All three functions move from `jurisdiction?: string | null` to `jurisdictions?: string[]`, with the same SQL pattern (`pg` binds a JS string array as one `text[]` parameter):

```sql
AND d.jurisdiction = ANY($n::text[])    -- only when jurisdictions.length > 0
```

- **`searchDocumentPages`** (`search.ts`): condition swap only; all three internal queries share `queryParams`, so they work unchanged. Not cached.
- **`getFilteredDocuments`** (`documents.ts`): same swap. Not cached.
- **`getTermStats`** (`stats.ts`) — **the denominator must move too.** Today the numerator (term occurrences) is filterable but the denominator `getYearTotals()` sums tokens over the *whole corpus*. Filtering only the numerator would yield "occurrences in selection ÷ tokens everywhere" — a ratio that shrinks just because fewer jurisdictions are selected. Fix: `getYearTotals(jurisdictions?: string[])` gets the same `ANY()` filter on its `token_count ⋈ document` query, and `getTermStats` passes its `jurisdictions` through. Result: **pooled relative frequency** — occurrences across the selected set ÷ total words across the selected set ("treat the selection as one combined corpus").
- **Cache keys:** both are `unstable_cache`; the args are the key, hence the sorted array from `normalizeJurisdictions`. Empty selection consistently passes no array so the all-corpus entry stays identical to today. Tags (`corpus`) unchanged.
- **`getMentions`:** no change — the heatmap stays unfiltered.
- **`/stats` route:** `searchParams.get('jurisdiction')` → `getAll('jurisdiction')` + normalize (single-value callers keep working).

## 5. Page integration

| Page | Changes |
|---|---|
| `/suche` | `searchParams` type `jurisdiction?: string \| string[]`; normalize; pass array to `searchDocumentPages`; pagination URL builder appends each value; `SelectFilter` → `MultiSelectFilter` |
| `/berichte` | same parsing; list path via `getFilteredDocuments`; **grid path** is JS-filtered: `jur !== filter` → `jurisdictions.length && !jurisdictions.includes(jur)`; `displayTotal` condition follows; control swap |
| `/analyse` | new `MultiSelectFilter` in the panel row next to `YearRangeFilter`; pass array to `getTermStats`; `analyseUrl()` appends `jurisdiction` per value (fokus-switch links keep the selection); `TermTags` gets `multiParams?: Record<string, string[]>` (its `extraParams` is scalar-only) so term add/remove pills keep the selection; chart subline shows the selection ("Bund, Bayern" instead of "Alle Berichte") |

A jurisdiction change on `/analyse` dispatches `change` → `AutoSubmit` navigates; active terms survive as hidden `q` inputs and the `data-filter-manual` term input is not consumed (only explicit submits consume it) — no special handling needed.

### Heatmap row highlight

`Heatmap.tsx` gets `highlighted?: string[]` (default `[]`). Matching rows get `data-highlighted` plus a subtle emphasis on the sticky row header (accent border + `font-bold text-blue-700`); cell colors stay untouched so the comparison reading is unaffected. Empty selection = no highlight. CSV export stays unfiltered (it exports heatmap data).

## 6. Testing

- **Unit:** `normalizeJurisdictions` (scalar/array input, unknown values dropped, dedupe, sorted, empty); `build-filter-url` case locking repeated `jurisdiction` entries (analogous to the multi-`q` case).
- **Integration:** `searchDocumentPages` with array → result jurisdictions ⊆ selection; `getTermStats` with `['Bund']` differs from all-corpus and is order-independent.
- **E2E:** rewrite the `select[name=jurisdiction]` instant-apply test to drive the Combobox; add multi-select (two params in URL) and deselect-in-list cases; no-JS project uses `selectOption([...])` against the native `<select multiple>`; `/analyse`: selection updates chart subline + highlights heatmap rows, fokus switch and term add preserve `?jurisdiction=…`.

## 7. Alternatives considered

- **Native `<select multiple>` as the primary control:** zero JS and no-JS-safe, but ctrl-click desktop UX is notoriously bad. Kept as the fallback only.
- **Always-visible checkbox pills for all 17 jurisdictions:** no dropdown, but a lot of permanent panel space and pre-hydration markup/layout shift. Rejected.
- **Averaging per-jurisdiction relative frequencies** (instead of pooled frequency): weights Bremen equal to Bund and is harder to explain. Rejected.
- **Filtering the heatmap by the selection:** rejected (again) — the heatmap is the comparison; highlight instead.
- **Single-select on /analyse** (the original deferred sketch): inconsistent once /berichte and /suche are multi-select. Rejected.

## 8. Open questions

1. ~~Trigger label for multiple selections?~~ **Resolved:** names for 1–2 ("Bund, Bayern"), "N Behörden" from 3.
2. ~~Badges inside the panel row or below?~~ **Resolved:** no badges — trigger label + list checkmarks are enough.
