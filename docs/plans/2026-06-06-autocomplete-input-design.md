# Autocomplete for Page-Level Search Inputs

**Status:** Draft — iterate before implementation

**Goal:** Bring the homepage search's autocomplete dropdown to the page-level inputs: the `/suche` `SearchInput` and the `/analyse` term input. Resolves open question 3 of the unified filter system design and the "autocomplete on the term input" out-of-scope note of the analyse page design.

**Decisions (agreed):**
- Both `/suche` and `/analyse` get autocomplete, via shared logic extracted from `SearchForm`.
- **Headless hook + presentational list**, not a monolithic component and not shadcn `Command`: the three hosts share fetch/debounce/keyboard/ARIA but differ in what *selection* does (navigate / instant filter / add term). Command models "pick from a fixed set" (the jurisdiction multi-select uses it); an editable free-text input with suggestions is the WAI-ARIA *editable combobox* pattern, which `SearchForm`'s hand-rolled dropdown already implements.

---

## 1. Current state

- **`SearchForm.tsx`** (homepage only — the navbar links to /suche): controlled input, 200 ms debounced fetch to `/api/auto-complete`, dropdown with ↑/↓/Enter/Escape, outside-click close. Known flaws: no fetch cancellation (a slow early response can overwrite a newer one), hardcoded `id="autocomplete-list"` (collides with a second instance), no `aria-activedescendant`/option ids.
- **`filters/SearchInput.tsx`** (`/suche`): uncontrolled client leaf; 500 ms pause → bubbling `change` → `AutoSubmit` → `router.replace`. No suggestions.
- **`/analyse` term input:** plain `<input name="term" data-filter-manual>` in the server component; `AutoSubmit` ignores its `change` events, applies it only on explicit submit and clears it afterwards.
- **API:** `/api/auto-complete` → `getAutocompleteSuggestions` (`token_count` prefix match; multi-token = doc-id intersection on previous tokens; ≤10).

## 2. Architecture

```
src/components/search/
  useAutocomplete.ts      ← hook: fetch (200 ms debounce, AbortController), open/close,
                            activeIndex, keyboard handling, combobox ARIA props
  AutocompleteList.tsx    ← <ul role="listbox"> render, styling from SearchForm
```

```ts
useAutocomplete({
  onSelect: (value: string) => void   // the single divergence point per host
  minChars?: number                   // default 2
  debounceMs?: number                 // default 200
}) => {
  suggestions, open, activeIndex, listId, optionId(i),
  inputProps,                         // spread onto the <input>
  close(), wrapperRef                 // outside-click target
}
```

- The hook does **not** own the input value — hosts keep their model (SearchForm controlled, the filter inputs uncontrolled/DOM-first, which keeps the no-JS fallback untouched). It reads the text from the input events.
- **Enter rule:** with an active (arrow-keyed) suggestion, `preventDefault` + `onSelect`; without one, do nothing — the event bubbles to the form and the host's native submit semantics apply. This single rule lets all three hosts coexist with their forms.
- **AbortController** on every new keystroke (fixes the stale-response race); `useId()`-based list/option ids; `aria-activedescendant` wiring (fixes the a11y gaps) — all hosts inherit the fixes.
- List uses `onMouseDown` for selection (fires before input blur), as today.

## 3. Interaction semantics per host

| Host | Value model | On select (click / Enter-on-active) | Enter without active option |
|---|---|---|---|
| `SearchForm` (homepage) | controlled | `submitSearch(value)` → `router.push('/suche?q=…')` (unchanged) | submit form → `submitSearch(query)` (unchanged) |
| `SearchInput` (/suche) | uncontrolled | set `input.value`, close, cancel the pending 500 ms timer, dispatch `change` **immediately** — selection is an explicit commit, filters apply instantly | bubbles → form submit → `AutoSubmit` (unchanged) |
| `TermAutocompleteInput` (/analyse, new) | uncontrolled | set `input.value`, close, `input.form?.requestSubmit()` — adds the term in one action via `AutoSubmit`'s submit path, which also clears the manual input | bubbles → form submit → adds typed term (unchanged) |

`/suche` runs two independent timers: 200 ms for suggestions, the existing 500 ms for live URL updates. They share no state; if the user pauses 500 ms without picking, the filter fires as today; picking cancels the slower timer so the same value isn't dispatched twice.

`/analyse`: `requestSubmit()` (not `.submit()`) fires the `submit` event `AutoSubmit` listens for — term folded into `q` server-side, manual input cleared, exactly the existing Enter/button flow. `data-filter-manual` stays, so a blur with a half-typed term still never auto-applies. The visible "Hinzufügen" button stays (no-JS + typed non-suggestions).

New client leaf `src/components/filters/TermAutocompleteInput.tsx` replaces the inline term input on `/analyse` (markup/label/layout identical). Reusing `SearchInput` with a "manual" mode was rejected: its whole point is the debounced live dispatch, which `/analyse` explicitly must not do.

`SearchForm` is refactored onto the hook + list (single call site, deletes ~60 duplicated lines, proves the extraction). Visuals (`size="lg"`) and submit flow unchanged.

`SearchInput` gets an opt-in `autocomplete?: boolean` prop (default false); `/suche` enables it. It needs a wrapper div (positioning context) and an input ref — no change to the form-relevant markup.

## 4. API hardening

`/api/auto-complete` (backward-compatible):
- `limit` param, default 10, clamped to 1–10 → `getAutocompleteSuggestions(q, limit)`.
- `Cache-Control: public, max-age=60, stale-while-revalidate=300` — prefix suggestions are stable; absorbs keystroke bursts.

No ranking/fuzzy changes — this effort is "reuse the existing autocomplete", not "improve it".

## 5. No-JS

All three inputs remain plain named inputs; the dropdown and all hook behavior are mount-gated enhancements. Acceptance criterion: `tests/e2e/no-js.test.ts` stays green **without edits** (homepage GET submit, /suche filter round-trip, /analyse add-term button).

## 6. Testing

- **E2E `/suche`:** typing `nsu` shows a listbox with an `nsu…` option (token_count is seeded in the e2e DB — `api.test.ts` already asserts this); ↓+Enter picks → `?q=…` + results; click picks instantly; Escape closes. Scope option locators to the listbox id (the /analyse suggestion pills are also clickable).
- **E2E `/analyse`:** typing + picking a suggestion adds the term pill and clears the input (same shape as the existing add-term test).
- **E2E homepage:** existing tests cover the refactored SearchForm; re-run unchanged.
- Unit tests: none needed beyond existing ones — the logic lives in a hook exercised end-to-end; the `limit` clamp is trivial.

## 7. Alternatives considered

- **shadcn `Command` in a Popover:** wrong pattern for an editable input (focus and filtering live in cmdk, not the form field); would fight the uncontrolled no-JS input model. Used only for the jurisdiction multi-select (fixed option set).
- **One `AutocompleteInput` component for all hosts:** needs mode props for three different commit semantics (navigate / dispatch-change / requestSubmit) plus controlled+uncontrolled support — configuration-shaped duplication. Hook keeps the shared 80 % in one place.
- **Server-side suggestions via RSC:** suggestions are inherently per-keystroke client state; a fetch endpoint is the right boundary (and exists).

## 8. Open questions

1. Should suggestion picks on `/suche` be recorded any differently in analytics (currently none) — out of scope?
2. Dropdown max height/scroll for long token lists — fixed 10 via `limit`, so probably moot.
