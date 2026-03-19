import * as echarts from 'echarts/core'
import { LineChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  ToolboxComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([
  LineChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  ToolboxComponent,
  CanvasRenderer,
])

// ColorBrewer Paired palette — good contrast on both light and dark backgrounds
const palette = [
  '#1f78b4', '#33a02c', '#e31a1c', '#ff7f00', '#6a3d9a',
  '#a6cee3', '#b2df8a', '#fb9a99', '#fdbf6f', '#cab2d6',
]

echarts.registerTheme('vsb-light', {
  backgroundColor: 'transparent',
  color: palette,
  textStyle: { color: '#111827', fontFamily: 'system-ui, -apple-system, sans-serif' },
  legend: { textStyle: { color: '#111827' } },
  categoryAxis: {
    axisLine: { lineStyle: { color: '#e5e7eb' } },
    axisTick: { lineStyle: { color: '#e5e7eb' } },
    axisLabel: { color: '#6b7280' },
  },
  valueAxis: {
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { color: '#6b7280' },
    splitLine: { lineStyle: { color: '#e5e7eb' } },
  },
  tooltip: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
    textStyle: { color: '#111827' },
  },
})

echarts.registerTheme('vsb-dark', {
  backgroundColor: 'transparent',
  color: palette,
  textStyle: { color: '#f3f4f6', fontFamily: 'system-ui, -apple-system, sans-serif' },
  legend: { textStyle: { color: '#f3f4f6' } },
  categoryAxis: {
    axisLine: { lineStyle: { color: '#1f2937' } },
    axisTick: { lineStyle: { color: '#1f2937' } },
    axisLabel: { color: '#9ca3af' },
  },
  valueAxis: {
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { color: '#9ca3af' },
    splitLine: { lineStyle: { color: '#1f2937' } },
  },
  tooltip: {
    backgroundColor: '#030712',
    borderColor: '#1f2937',
    textStyle: { color: '#f3f4f6' },
  },
})

export default echarts
