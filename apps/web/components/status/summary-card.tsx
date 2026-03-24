import React from 'react'
import { Card, CardBody } from '../common/card'

interface SummaryCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: React.ReactNode
}

export function SummaryCard({
  title,
  value,
  subtitle,
  icon,
}: SummaryCardProps) {
  return (
    <Card>
      <CardBody className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-3xl font-bold leading-tight text-gray-900">
            {value}
          </p>
          {subtitle && <p className="mt-1 text-xs text-gray-500">{subtitle}</p>}
        </div>

        {icon && <div className="shrink-0 text-4xl">{icon}</div>}
      </CardBody>
    </Card>
  )
}