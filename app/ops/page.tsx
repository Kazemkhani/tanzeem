'use client'

import React from 'react'
import Link from 'next/link'
import { useStore, getOpsMetrics } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Users, MapPin, Bus, AlertTriangle, DollarSign,
  RotateCcw, ArrowLeft, TrendingUp, Clock
} from 'lucide-react'

export default function OpsPage() {
  const store = useStore()
  const metrics = getOpsMetrics(store)

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-rta-primary text-white px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-white/80 hover:text-white">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-xl font-semibold">TANZEEM Operations</h1>
              <p className="text-sm text-white/70">RTA School Pickup Management</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge className="bg-white/20 text-white">Pilot Program</Badge>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => store.resetDemo()}
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Demo
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <KPICard
            title="Total Parents"
            value={metrics.totalParents.toString()}
            subtitle="In pilot program"
            icon={Users}
            trend="+12 this week"
          />
          <KPICard
            title="On-site Pickups"
            value={metrics.modeSplit.onsite.toString()}
            subtitle={`${Math.round((metrics.modeSplit.onsite / metrics.totalParents) * 100)}% of total`}
            icon={Clock}
            variant="warning"
          />
          <KPICard
            title="Zone Pickups"
            value={metrics.modeSplit.zone.toString()}
            subtitle={`${Math.round((metrics.modeSplit.zone / metrics.totalParents) * 100)}% of total`}
            icon={MapPin}
            variant="success"
          />
          <KPICard
            title="Van Intent"
            value={metrics.modeSplit.vanIntent.toString()}
            subtitle="Next semester"
            icon={Bus}
            variant="info"
          />
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                Average Overruns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">{metrics.avgOverruns}</span>
                <span className="text-gray-500">per parent this semester</span>
              </div>
              <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-500" style={{ width: `${(metrics.avgOverruns / 6) * 100}%` }} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-500" />
                Total Fees Collected
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">AED {metrics.totalFees.toLocaleString()}</span>
                <span className="text-gray-500">this semester</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Revenue supports zone infrastructure
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Mode Split Visualization */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Mode Distribution</CardTitle>
            <CardDescription>Pickup method breakdown across pilot</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-1 h-8 rounded-lg overflow-hidden">
              <div
                className="bg-yellow-500 flex items-center justify-center text-white text-xs font-medium"
                style={{ width: `${(metrics.modeSplit.onsite / metrics.totalParents) * 100}%` }}
              >
                On-site {Math.round((metrics.modeSplit.onsite / metrics.totalParents) * 100)}%
              </div>
              <div
                className="bg-green-500 flex items-center justify-center text-white text-xs font-medium"
                style={{ width: `${(metrics.modeSplit.zone / metrics.totalParents) * 100}%` }}
              >
                Zone {Math.round((metrics.modeSplit.zone / metrics.totalParents) * 100)}%
              </div>
              <div
                className="bg-blue-500 flex items-center justify-center text-white text-xs font-medium"
                style={{ width: `${(metrics.modeSplit.vanIntent / metrics.totalParents) * 100}%` }}
              >
                Van {Math.round((metrics.modeSplit.vanIntent / metrics.totalParents) * 100)}%
              </div>
            </div>
            <div className="flex gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="text-sm">On-site ({metrics.modeSplit.onsite})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-sm">Zone ({metrics.modeSplit.zone})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-sm">Van Intent ({metrics.modeSplit.vanIntent})</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Zone Capacity */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Zone Capacity Status</CardTitle>
            <CardDescription>Real-time enrollment by zone</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {store.zones.map(zone => {
                const enrolled = zone.capacity - zone.remaining
                const pct = (enrolled / zone.capacity) * 100
                const isFull = zone.remaining === 0

                return (
                  <div key={zone.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{zone.name}</span>
                      <Badge variant={isFull ? 'danger' : pct > 80 ? 'warning' : 'success'}>
                        {isFull ? 'Full' : `${zone.remaining} spots`}
                      </Badge>
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden mb-2">
                      <div
                        className={`h-full ${isFull ? 'bg-red-500' : pct > 80 ? 'bg-yellow-500' : 'bg-green-500'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="text-sm text-gray-500">
                      {enrolled}/{zone.capacity} enrolled ({Math.round(pct)}%)
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Risk List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Compliance Risk List
            </CardTitle>
            <CardDescription>Parents with 3+ warnings or fees incurred</CardDescription>
          </CardHeader>
          <CardContent>
            {metrics.riskParents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <TrendingUp className="w-6 h-6 text-green-500" />
                </div>
                <p>No high-risk parents currently</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Parent</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-500">Warnings</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-500">Fees Incurred</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-500">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.riskParents.map((parent, index) => (
                      <tr key={index} className="border-b last:border-0">
                        <td className="py-3 px-4 font-medium">{parent.name}</td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant={parent.warnings >= 3 ? 'danger' : 'warning'}>
                            {parent.warnings} warnings
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {parent.fees > 0 ? (
                            <span className="font-medium text-red-600">AED {parent.fees}</span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant={parent.fees > 0 ? 'danger' : 'warning'}>
                            {parent.fees > 0 ? 'Fee Active' : 'Warning Zone'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="mt-6 flex justify-center">
          <Button
            variant="destructive"
            onClick={() => store.resetDemo()}
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset All Demo Data
          </Button>
        </div>
      </main>
    </div>
  )
}

function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'default',
  trend
}: {
  title: string
  value: string
  subtitle: string
  icon: React.ElementType
  variant?: 'default' | 'success' | 'warning' | 'info'
  trend?: string
}) {
  const iconColors = {
    default: 'bg-gray-100 text-gray-600',
    success: 'bg-green-100 text-green-600',
    warning: 'bg-yellow-100 text-yellow-600',
    info: 'bg-blue-100 text-blue-600'
  }

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            {trend && (
              <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {trend}
              </p>
            )}
          </div>
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconColors[variant]}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
