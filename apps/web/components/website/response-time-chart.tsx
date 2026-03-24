'use client'

import type { ResponseTime } from '../../types/website'
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardBody, CardHeader } from '../common/card'
import { formatResponseTime } from '../../lib/format'
import { formatDateTime, formatTime } from '../../lib/utils'

interface ResponseTimeChartProps {
  data: ResponseTime[]
}

export function ResponseTimeChart({ data }: ResponseTimeChartProps) {
  const chartData = data.map((point) => ({
    rawTimestamp: point.timestamp,
    timestamp: formatTime(point.timestamp),
    responseTime: point.responseTimeMs,
  }))

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <h3 className="font-semibold text-gray-900">Response Time</h3>
        </CardHeader>
        <CardBody>
          <p className="text-sm text-gray-500">No response time data available yet.</p>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <h3 className="font-semibold text-gray-900">Response Time</h3>
      </CardHeader>

      <CardBody>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis
                dataKey="timestamp"
                tick={{ fontSize: 12 }}
                minTickGap={24}
              />

              <YAxis
                tick={{ fontSize: 12 }}
                width={60}
                label={{
                  value: 'ms',
                  angle: -90,
                  position: 'insideLeft',
                }}
              />

              <Tooltip
                formatter={(value: ValueType) =>
                  formatResponseTime(typeof value === 'number' ? value : null)
                }
                labelFormatter={(
                  _: string | number,
                  payload?: Array<{
                    payload?: {
                      rawTimestamp?: string
                    }
                    dataKey?: NameType
                    value?: ValueType
                  }>
                ) => {
                  const item = payload?.[0]?.payload
                  return item?.rawTimestamp
                    ? formatDateTime(item.rawTimestamp)
                    : ''
                }}
              />

              <Line
                type="monotone"
                dataKey="responseTime"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                connectNulls={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardBody>
    </Card>
  )
}