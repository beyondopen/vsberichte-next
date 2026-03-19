'use client'

import { useState, useCallback, useEffect } from 'react'

interface HighlightBox {
  x: number
  y: number
  w: number
  h: number
}

interface SearchResultImageProps {
  src: string
  alt: string
  highlightBoxes: HighlightBox[]
}

export default function SearchResultImage({ src, alt, highlightBoxes }: SearchResultImageProps) {
  const [expanded, setExpanded] = useState(false)

  const close = useCallback(() => setExpanded(false), [])

  useEffect(() => {
    if (!expanded) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [expanded, close])

  return (
    <>
      {/* Thumbnail */}
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="relative w-40 h-56 bg-gray-100 dark:bg-gray-800 rounded-lg flex-shrink-0 overflow-hidden cursor-zoom-in"
        aria-label={`${alt} vergroessern`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className="absolute inset-0 w-full h-full object-cover object-top"
          loading="lazy"
        />
        {highlightBoxes.map((box, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              top: `${box.y * 100}%`,
              left: `${box.x * 100}%`,
              width: `${box.w * 100}%`,
              height: `${box.h * 100}%`,
              background: 'rgba(250, 204, 21, 0.35)',
              borderRadius: '2px',
            }}
          />
        ))}
      </button>

      {/* Lightbox */}
      {expanded && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 cursor-zoom-out"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label={alt}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] w-full overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={close}
              className="absolute top-2 right-2 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
              aria-label="Schliessen"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={alt}
                className="w-full h-auto rounded-lg"
              />
              {highlightBoxes.map((box, i) => (
                <div
                  key={i}
                  className="absolute"
                  style={{
                    top: `${box.y * 100}%`,
                    left: `${box.x * 100}%`,
                    width: `${box.w * 100}%`,
                    height: `${box.h * 100}%`,
                    background: 'rgba(250, 204, 21, 0.35)',
                    borderRadius: '2px',
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
