'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { buildFilterUrl } from './build-filter-url'

/**
 * Progressive enhancement for filter forms (renders no UI).
 *
 * Placed inside a `<form method="get">`, it intercepts `change` and
 * `submit` events after hydration and applies the filters instantly via
 * `router.replace` — the URL stays the single source of truth and the
 * server components re-render. Without JavaScript the form keeps working
 * as a plain GET form.
 *
 * Enhanced controls (slider, debounced search input) don't navigate
 * themselves: they write into native form fields and dispatch a bubbling
 * `change` event, so this is the only navigation code path.
 *
 * Sets `data-enhanced` on the form, which hides the then-redundant
 * submit button (see globals.css).
 */
export default function AutoSubmit() {
  // Unnamed hidden input: never submitted, but `.form` finds the parent form.
  const marker = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    const form = marker.current?.form
    if (!form) return

    const navigate = () => {
      const action = form.getAttribute('action') || window.location.pathname
      const url = buildFilterUrl(action, new FormData(form))
      router.replace(url, { scroll: false })
    }

    const onChange = (e: Event) => {
      // Controls marked data-filter-manual only apply on explicit submit
      // (e.g. the term input on /trends — a blur must not add half a term).
      if (e.target instanceof HTMLElement && e.target.hasAttribute('data-filter-manual')) return
      navigate()
    }
    const onSubmit = (e: SubmitEvent) => {
      e.preventDefault()
      navigate()
      // Action-style inputs (data-filter-manual) are consumed by the
      // navigation (e.g. the term input on /trends) — clear them like a
      // full page load would, so the next entry starts fresh.
      for (const el of form.querySelectorAll<HTMLInputElement>('input[data-filter-manual]')) {
        el.value = ''
      }
    }

    form.dataset.enhanced = 'true'
    form.addEventListener('change', onChange)
    form.addEventListener('submit', onSubmit)
    return () => {
      delete form.dataset.enhanced
      form.removeEventListener('change', onChange)
      form.removeEventListener('submit', onSubmit)
    }
  }, [router])

  return <input ref={marker} type="hidden" />
}
