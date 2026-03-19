'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import ReactEChartsCore from 'echarts-for-react/lib/core'
import echarts from '@/lib/echarts'
import { useDarkMode } from '@/lib/useDarkMode'

interface HomepageChartProps {
  title: string
  subtitle: string
  queries: string[]
}

type StatsEntry = [string, Record<number, number>]

export default function HomepageChart({ title, subtitle, queries }: HomepageChartProps) {
  const [data, setData] = useState<StatsEntry[] | null>(null)
  const isDark = useDarkMode()
  const chartRef = useRef<ReactEChartsCore>(null)

  useEffect(() => {
    const controller = new AbortController()
    Promise.all(
      queries.map((q) =>
        fetch(`/stats?q=${encodeURIComponent(q)}`, { signal: controller.signal })
          .then((r) => r.json() as Promise<StatsEntry>)
      )
    )
      .then(setData)
      .catch(() => {})
    return () => controller.abort()
  }, [queries])

  // Dynamic theme switching
  const themeName = isDark ? 'vsb-dark' : 'vsb-light'
  const prevTheme = useRef(themeName)
  useEffect(() => {
    if (prevTheme.current !== themeName) {
      prevTheme.current = themeName
      const instance = chartRef.current?.getEchartsInstance()
      if (instance) {
        // ECharts v6 setTheme not yet in echarts-for-react, so dispose and reinit
        // The component handles this via key change instead
      }
    }
  }, [themeName])

  const getOption = useCallback(() => {
    if (!data) return {}

    const yearSet = new Set<number>()
    for (const [, yearData] of data) {
      for (const y of Object.keys(yearData)) yearSet.add(parseInt(y, 10))
    }
    const years = Array.from(yearSet).sort((a, b) => a - b)

    return {
      grid: { left: 8, right: 16, top: 8, bottom: 32, containLabel: true },
      tooltip: {
        trigger: 'axis',
        valueFormatter: (v: number) => v.toFixed(6),
      },
      legend: {
        bottom: 0,
        textStyle: { fontSize: 12 },
      },
      xAxis: {
        type: 'category',
        data: years.map(String),
        boundaryGap: false,
        axisLabel: { fontSize: 11 },
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          fontSize: 10,
          fontFamily: 'ui-monospace, SFMono-Regular, monospace',
        },
        splitNumber: 4,
      },
      series: data.map(([term, yearData]) => ({
        name: term,
        type: 'line',
        smooth: false,
        lineStyle: { width: 3 },
        showSymbol: false,
        data: years.map((y) => yearData[y] ?? 0),
      })),
    }
  }, [data])

  return (
    <>
      <h3 className="font-bold mb-1">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{subtitle}</p>
      {data ? (
        <div aria-label={`Liniendiagramm: ${title}`}>
          <ReactEChartsCore
            ref={chartRef}
            key={themeName}
            echarts={echarts}
            option={getOption()}
            theme={themeName}
            style={{ height: '224px', width: '100%' }}
            opts={{ renderer: 'canvas' }}
            notMerge
          />
        </div>
      ) : (
        <div className="h-56 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg flex items-center justify-center">
          <span className="text-sm text-gray-400 dark:text-gray-500">Lade Daten&hellip;</span>
        </div>
      )}
    </>
  )
}
