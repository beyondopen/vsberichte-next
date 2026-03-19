'use client'

import { useMemo, useRef, useState, useCallback } from 'react'
import ReactEChartsCore from 'echarts-for-react/lib/core'
import echarts from '@/lib/echarts'
import { useDarkMode } from '@/lib/useDarkMode'

interface TrendChartProps {
  statsData: [string, Record<number, number>][]
  terms: string[]
}

export default function TrendChart({ statsData, terms }: TrendChartProps) {
  const isDark = useDarkMode()
  const chartRef = useRef<ReactEChartsCore>(null)
  const [copied, setCopied] = useState(false)
  const themeName = isDark ? 'vsb-dark' : 'vsb-light'

  const { years, option } = useMemo(() => {
    const yearSet = new Set<number>()
    for (const [, yearData] of statsData) {
      for (const y of Object.keys(yearData)) yearSet.add(parseInt(y, 10))
    }
    const sortedYears = Array.from(yearSet).sort((a, b) => a - b)

    return {
      years: sortedYears,
      option: {
        grid: { left: 8, right: 16, top: 16, bottom: 40, containLabel: true },
        tooltip: {
          trigger: 'axis' as const,
          valueFormatter: (v: number) => v.toFixed(6),
        },
        legend: {
          bottom: 0,
          textStyle: { fontSize: 12 },
        },
        xAxis: {
          type: 'category' as const,
          data: sortedYears.map(String),
          boundaryGap: false,
          name: 'Jahr',
          nameLocation: 'center' as const,
          nameGap: 25,
          axisLabel: { fontSize: 11 },
        },
        yAxis: {
          type: 'value' as const,
          name: 'rel. Haeufigkeit',
          nameLocation: 'center' as const,
          nameGap: 60,
          axisLabel: {
            fontSize: 10,
            fontFamily: 'ui-monospace, SFMono-Regular, monospace',
          },
          splitNumber: 5,
        },
        series: statsData.map(([term, yearData]) => ({
          name: term,
          type: 'line' as const,
          smooth: false,
          lineStyle: { width: 3 },
          showSymbol: false,
          data: sortedYears.map((y) => yearData[y] ?? 0),
        })),
      },
    }
  }, [statsData])

  const handleSaveImage = useCallback(() => {
    const instance = chartRef.current?.getEchartsInstance()
    if (!instance) return
    const url = instance.getDataURL({
      type: 'jpeg',
      backgroundColor: isDark ? '#030712' : '#ffffff',
      pixelRatio: 2,
    })
    const a = document.createElement('a')
    a.href = url
    a.download = `vsberichte-trends-${terms.join('-')}.jpg`
    a.click()
  }, [isDark, terms])

  const handleExportCSV = useCallback(() => {
    const rows = ['term,year,value']
    for (const [term, yearData] of statsData) {
      for (const y of years) {
        rows.push(`${term},${y},${yearData[y] ?? 0}`)
      }
    }
    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `vsberichte-trends-${terms.join('-')}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }, [statsData, years, terms])

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback: select and copy from a temporary input
    }
  }, [])

  if (statsData.length === 0) return null

  return (
    <>
      {/* Chart */}
      <div aria-label={`Liniendiagramm: Relative Haeufigkeit von ${terms.join(', ')}`}>
        <ReactEChartsCore
          ref={chartRef}
          key={themeName}
          echarts={echarts}
          option={option}
          theme={themeName}
          style={{ height: '320px', width: '100%' }}
          opts={{ renderer: 'canvas' }}
          notMerge
        />
      </div>

      {/* Export Buttons */}
      <div className="flex flex-wrap gap-3 mt-6">
        <button
          type="button"
          onClick={handleSaveImage}
          className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Als JPG speichern
        </button>
        <button
          type="button"
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          CSV exportieren
        </button>
        <button
          type="button"
          onClick={handleCopyLink}
          className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          {copied ? 'Kopiert!' : 'Link kopieren'}
        </button>
      </div>
    </>
  )
}
