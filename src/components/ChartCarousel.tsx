'use client'

import { useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import HomepageChart from './HomepageChart'

interface ChartSlide {
  title: string
  subtitle: string
  queries: string[]
}

const slides: ChartSlide[] = [
  {
    title: 'Erw\u00e4hnungen von RAF und NSU',
    subtitle: 'Alle Berichte, 1990\u20132023',
    queries: ['raf', 'nsu'],
  },
  {
    title: 'Erw\u00e4hnungen von Parteien',
    subtitle: 'Alle Berichte, 2000\u20132023',
    queries: ['npd', 'pkk', 'dkp'],
  },
  {
    title: 'Erw\u00e4hnungen von Medien',
    subtitle: 'Alle Berichte, 1990\u20132023',
    queries: ['internet', 'facebook', 'zeitung'],
  },
  {
    title: 'Erw\u00e4hnung von Cyber',
    subtitle: 'Alle Berichte',
    queries: ['cyber'],
  },
  {
    title: 'Rechts- und Linksextremismus',
    subtitle: 'Alle Berichte',
    queries: ['rechtsextrem', 'linksextrem'],
  },
  {
    title: 'Islamismus und Salafismus',
    subtitle: 'Alle Berichte',
    queries: ['islamismus', 'salafismus'],
  },
]

const SLIDES_PER_PAGE = 2

export default function ChartCarousel() {
  const [page, setPage] = useState(0)

  // Total pages depends on viewport — we use desktop count for logic,
  // CSS handles showing 1 or 2 cards
  const totalPages = Math.ceil(slides.length / SLIDES_PER_PAGE)

  const prev = useCallback(() => {
    setPage((p) => (p > 0 ? p - 1 : totalPages - 1))
  }, [totalPages])

  const next = useCallback(() => {
    setPage((p) => (p < totalPages - 1 ? p + 1 : 0))
  }, [totalPages])

  // Touch swipe support
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)
  const minSwipeDistance = 50

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
    touchEndX.current = e.touches[0].clientX
  }

  function handleTouchMove(e: React.TouchEvent) {
    touchEndX.current = e.touches[0].clientX
  }

  function handleTouchEnd() {
    const distance = touchStartX.current - touchEndX.current
    if (Math.abs(distance) >= minSwipeDistance) {
      if (distance > 0) next()
      else prev()
    }
  }

  const startIdx = page * SLIDES_PER_PAGE
  const visibleSlides = slides.slice(startIdx, startIdx + SLIDES_PER_PAGE)

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Carousel Header */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-serif font-bold text-3xl lg:text-4xl tracking-tight">
          Verfassungsschutz Trends
        </h2>
        <div className="flex items-center gap-4">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {page + 1} / {totalPages}
          </p>
          <div className="flex gap-2">
            <button
            type="button"
            onClick={prev}
            aria-label="Vorherige Charts"
            className="p-2.5 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Naechste Charts"
            className="p-2.5 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
          </div>
        </div>
      </div>

      {/* No-JS fallback */}
      <noscript>
        <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl p-6 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Die interaktiven Charts ben&ouml;tigen JavaScript.
          </p>
          <Link
            href="/trends"
            className="text-blue-700 dark:text-blue-400 font-medium hover:underline"
          >
            Zur Trend-Analyse mit Datentabelle &rarr;
          </Link>
        </div>
      </noscript>

      {/* Chart Cards */}
      <div className="grid md:grid-cols-2 gap-8">
        {visibleSlides.map((slide) => (
          <div
            key={slide.queries.join(',')}
            className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl p-6"
          >
            <HomepageChart
              title={slide.title}
              subtitle={slide.subtitle}
              queries={slide.queries}
            />
          </div>
        ))}
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center gap-2 mt-8">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setPage(i)}
            aria-label={`Seite ${i + 1}`}
            className={`w-2 h-2 rounded-full transition-colors ${
              i === page
                ? 'bg-blue-700 dark:bg-blue-400'
                : 'bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
