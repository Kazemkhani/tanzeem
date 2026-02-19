'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useStore, calculateFee, getNextFee, PickupMode, PickupStatus } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { formatTime, formatDateTime } from '@/lib/utils'
import {
  Home, Clock, AlertTriangle, MapPin, Bus, Users, Calendar,
  QrCode, CheckCircle2, ArrowLeft, ChevronRight, Shield,
  Timer, AlertCircle, Car, X
} from 'lucide-react'

type Screen = 'home' | 'timer' | 'strikes' | 'zones' | 'zone-pickup' | 'carpool' | 'van' | 'timeline'

export default function ParentApp() {
  const [screen, setScreen] = useState<Screen>('home')
  const store = useStore()

  const renderScreen = () => {
    switch (screen) {
      case 'home':
        return <HomeScreen onNavigate={setScreen} />
      case 'timer':
        return <TimerScreen onBack={() => setScreen('home')} />
      case 'strikes':
        return <StrikesScreen onBack={() => setScreen('home')} />
      case 'zones':
        return <ZoneSelectionScreen onBack={() => setScreen('home')} onComplete={() => setScreen('home')} />
      case 'zone-pickup':
        return <ZonePickupScreen onBack={() => setScreen('home')} />
      case 'carpool':
        return <CarpoolScreen onBack={() => setScreen('home')} />
      case 'van':
        return <VanSubscriptionScreen onBack={() => setScreen('home')} />
      case 'timeline':
        return <TimelineScreen onBack={() => setScreen('home')} />
      default:
        return <HomeScreen onNavigate={setScreen} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-rta-primary text-white px-4 py-3 sticky top-0 z-40">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold">T</span>
            </div>
            <span className="font-semibold">TANZEEM</span>
          </div>
          <span className="text-sm text-white/80">Parent Portal</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-lg mx-auto p-4">
        {renderScreen()}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-40">
        <div className="max-w-lg mx-auto flex justify-around">
          <NavButton icon={Home} label="Home" active={screen === 'home'} onClick={() => setScreen('home')} />
          <NavButton icon={Clock} label="Timer" active={screen === 'timer'} onClick={() => setScreen('timer')} />
          <NavButton icon={MapPin} label="Zones" active={screen === 'zones' || screen === 'zone-pickup'} onClick={() => store.zoneLocked ? setScreen('zone-pickup') : setScreen('zones')} />
          <NavButton icon={Users} label="Carpool" active={screen === 'carpool'} onClick={() => setScreen('carpool')} />
          <NavButton icon={Bus} label="Van" active={screen === 'van'} onClick={() => setScreen('van')} />
        </div>
      </nav>

      {/* Spacer for bottom nav */}
      <div className="h-20" />
    </div>
  )
}

function NavButton({ icon: Icon, label, active, onClick }: { icon: React.ElementType; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-colors ${
        active ? 'text-rta-primary' : 'text-gray-500 hover:text-gray-700'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="text-xs">{label}</span>
    </button>
  )
}

// ============ HOME SCREEN ============
function HomeScreen({ onNavigate }: { onNavigate: (screen: Screen) => void }) {
  const store = useStore()
  const [showQR, setShowQR] = useState(false)

  const nextFee = getNextFee(store.overrunCount)
  const modeLabels: Record<PickupMode, string> = {
    onsite: 'On-site Pickup',
    zone: 'Smart Zone',
    van: 'Neighbourhood Van'
  }

  const getModeVariant = (mode: PickupMode) => {
    switch (mode) {
      case 'onsite': return 'warning'
      case 'zone': return 'success'
      case 'van': return 'info'
    }
  }

  return (
    <div className="space-y-4">
      {/* Child Info Card */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">{store.childName}</CardTitle>
              <CardDescription>{store.schoolName}</CardDescription>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Pickup Time</div>
              <div className="text-lg font-semibold">{store.pickupTime}</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-3">
            <Badge variant={getModeVariant(store.currentMode)}>
              {modeLabels[store.currentMode]}
            </Badge>
            {store.zoneLocked && store.selectedZoneId && (
              <Badge variant="outline">
                {store.zones.find(z => z.id === store.selectedZoneId)?.name}
              </Badge>
            )}
          </div>

          {/* Strikes & Fees Summary */}
          <div className="bg-gray-50 rounded-lg p-3 mt-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className={`w-4 h-4 ${store.overrunCount >= 3 ? 'text-red-500' : 'text-yellow-500'}`} />
                <span className="text-sm">
                  {store.overrunCount === 0
                    ? 'No overruns this semester'
                    : `${Math.min(store.overrunCount, 3)}/3 warnings used`}
                </span>
              </div>
              <button
                onClick={() => onNavigate('strikes')}
                className="text-sm text-rta-accent hover:underline flex items-center gap-1"
              >
                View History <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            {store.overrunCount > 0 && (
              <div className="mt-2 text-xs text-gray-600">
                Next overrun: <span className={store.overrunCount >= 3 ? 'text-red-600 font-medium' : ''}>
                  {nextFee.label}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          onClick={() => setShowQR(true)}
          variant="default"
          className="h-auto py-4 flex flex-col gap-2"
        >
          <QrCode className="w-6 h-6" />
          <span>View Pickup QR</span>
        </Button>

        {store.currentMode === 'onsite' && (
          <Button
            onClick={() => onNavigate('timer')}
            variant="warning"
            className="h-auto py-4 flex flex-col gap-2"
          >
            <Timer className="w-6 h-6" />
            <span>Start Timer</span>
          </Button>
        )}

        {store.currentMode !== 'onsite' && (
          <Button
            onClick={() => onNavigate('zone-pickup')}
            variant="success"
            className="h-auto py-4 flex flex-col gap-2"
          >
            <MapPin className="w-6 h-6" />
            <span>Zone Pickup</span>
          </Button>
        )}
      </div>

      <Button
        onClick={() => onNavigate('timeline')}
        variant="outline"
        className="w-full"
      >
        <Shield className="w-4 h-4 mr-2" />
        View Custody Timeline
      </Button>

      {/* Mode Switcher (Demo Only) */}
      <Card className="bg-gray-100 border-dashed">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-gray-500">Demo: Switch Mode</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            <Button
              size="sm"
              variant={store.currentMode === 'onsite' ? 'default' : 'outline'}
              onClick={() => store.setMode('onsite')}
            >
              On-site
            </Button>
            <Button
              size="sm"
              variant={store.currentMode === 'zone' ? 'default' : 'outline'}
              onClick={() => store.setMode('zone')}
            >
              Zone
            </Button>
            <Button
              size="sm"
              variant={store.currentMode === 'van' ? 'default' : 'outline'}
              onClick={() => store.setMode('van')}
            >
              Van
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* QR Dialog */}
      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent onClose={() => setShowQR(false)}>
          <DialogHeader>
            <DialogTitle>Pickup QR Code</DialogTitle>
            <DialogDescription>Show this to verify pickup</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center py-6">
            <div className="w-48 h-48 bg-gray-900 rounded-lg flex items-center justify-center mb-4">
              <div className="grid grid-cols-5 gap-1">
                {Array.from({ length: 25 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-6 h-6 ${Math.random() > 0.3 ? 'bg-white' : 'bg-gray-900'}`}
                  />
                ))}
              </div>
            </div>
            <div className="text-center">
              <p className="font-medium">{store.childName}</p>
              <p className="text-sm text-gray-500">{store.schoolName}</p>
              <p className="text-xs text-gray-400 mt-2">Parent: {store.parentName}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ============ TIMER SCREEN ============
function TimerScreen({ onBack }: { onBack: () => void }) {
  const store = useStore()
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes
  const [isRunning, setIsRunning] = useState(false)
  const [exceeded, setExceeded] = useState(false)

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            setIsRunning(false)
            setExceeded(true)
            return 0
          }
          return t - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRunning, timeLeft])

  const handleRecordOverrun = () => {
    store.recordOverrun()
    store.addTimelineEvent('On-site overrun recorded')
    setTimeLeft(300)
    setExceeded(false)
    setIsRunning(false)
  }

  const nextFee = getNextFee(store.overrunCount)
  const feeLadder = [
    { overrun: 1, label: 'Warning 1', isFee: false },
    { overrun: 2, label: 'Warning 2', isFee: false },
    { overrun: 3, label: 'Warning 3', isFee: false },
    { overrun: 4, label: 'AED 20', isFee: true },
    { overrun: 5, label: 'AED 40', isFee: true },
    { overrun: 6, label: 'AED 60', isFee: true },
    { overrun: 7, label: 'AED 80', isFee: true },
  ]

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <Card>
        <CardHeader>
          <CardTitle>On-site Pickup Timer</CardTitle>
          <CardDescription>5-minute limit for school pickup zone</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center py-6">
            <div className={`text-6xl font-mono font-bold ${
              exceeded ? 'text-red-600' : timeLeft <= 60 ? 'text-yellow-600' : 'text-gray-900'
            }`}>
              {formatTime(timeLeft)}
            </div>

            {exceeded && (
              <div className="mt-4 flex items-center gap-2 text-red-600">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">Time exceeded — recorded</span>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              {!exceeded && (
                <Button
                  onClick={() => setIsRunning(!isRunning)}
                  variant={isRunning ? 'destructive' : 'default'}
                  size="lg"
                >
                  {isRunning ? 'Stop' : 'Start Timer'}
                </Button>
              )}
              <Button
                onClick={handleRecordOverrun}
                variant="warning"
                size="lg"
              >
                Record Overrun Now
              </Button>
            </div>

            <p className="text-xs text-gray-500 mt-4">
              Demo: Use "Record Overrun Now" to simulate without waiting
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Current Status */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">This Semester</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-2xl font-bold">{store.overrunCount}</span>
              <span className="text-gray-500 ml-2">overruns</span>
            </div>
            <Badge variant={store.overrunCount >= 3 ? 'danger' : 'warning'}>
              {store.overrunCount >= 3
                ? `${store.overrunCount - 3} fees incurred`
                : `${store.overrunCount}/3 warnings`
              }
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Fee Ladder */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Progressive Fee Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {feeLadder.map(item => {
              const isPast = item.overrun <= store.overrunCount
              const isNext = item.overrun === store.overrunCount + 1

              return (
                <div
                  key={item.overrun}
                  className={`flex items-center justify-between py-2 px-3 rounded-lg ${
                    isNext ? 'bg-yellow-50 border border-yellow-200' :
                    isPast ? 'bg-gray-100 text-gray-500' : 'bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isPast && <CheckCircle2 className="w-4 h-4 text-gray-400" />}
                    {isNext && <AlertTriangle className="w-4 h-4 text-yellow-600" />}
                    <span>Overrun {item.overrun}</span>
                  </div>
                  <Badge variant={item.isFee ? 'danger' : 'warning'}>
                    {item.label}
                  </Badge>
                </div>
              )
            })}
            <div className="text-xs text-gray-500 mt-2 text-center">
              +AED 20 for each additional overrun
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ============ STRIKES SCREEN ============
function StrikesScreen({ onBack }: { onBack: () => void }) {
  const store = useStore()

  const totalWarnings = store.overrunHistory.filter(o => o.result === 'warning').length
  const totalFees = store.overrunHistory
    .filter(o => o.result === 'fee')
    .reduce((sum, o) => sum + (o.feeAmount || 0), 0)

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <Card>
        <CardHeader>
          <CardTitle>Strikes & Fees History</CardTitle>
          <CardDescription>This semester's overrun records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-yellow-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-yellow-700">{totalWarnings}</div>
              <div className="text-sm text-yellow-600">Warnings</div>
            </div>
            <div className="bg-red-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-red-700">AED {totalFees}</div>
              <div className="text-sm text-red-600">Total Fees</div>
            </div>
          </div>

          {store.overrunHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-green-500" />
              <p>No overruns recorded this semester</p>
            </div>
          ) : (
            <div className="space-y-3">
              {store.overrunHistory.map((record, index) => (
                <div key={record.id} className="flex items-center justify-between py-3 border-b last:border-0">
                  <div>
                    <div className="font-medium">Overrun #{index + 1}</div>
                    <div className="text-sm text-gray-500">
                      {formatDateTime(new Date(record.date))}
                    </div>
                  </div>
                  <Badge variant={record.result === 'fee' ? 'danger' : 'warning'}>
                    {record.result === 'fee' ? `AED ${record.feeAmount}` : 'Warning'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Next Semester Options</p>
              <p>If on-site pickup doesn't fit your schedule, consider selecting a Smart Zone or subscribing to the Neighbourhood Van next semester.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ============ ZONE SELECTION SCREEN ============
function ZoneSelectionScreen({ onBack, onComplete }: { onBack: () => void; onComplete: () => void }) {
  const store = useStore()
  const [confirmZone, setConfirmZone] = useState<string | null>(null)

  const handleConfirmSelection = () => {
    if (confirmZone) {
      store.selectZone(confirmZone)
      store.addTimelineEvent(`Zone selected: ${store.zones.find(z => z.id === confirmZone)?.name}`)
      setConfirmZone(null)
      onComplete()
    }
  }

  if (store.zoneLocked) {
    return (
      <div className="space-y-4">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <Card>
          <CardHeader>
            <CardTitle>Your Zone This Semester</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold">
                {store.zones.find(z => z.id === store.selectedZoneId)?.name}
              </h3>
              <p className="text-gray-500 mt-1">
                {store.zones.find(z => z.id === store.selectedZoneId)?.distance} from school
              </p>
              <Badge variant="success" className="mt-3">Locked for Semester</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <Card>
        <CardHeader>
          <CardTitle>Select Your Zone</CardTitle>
          <CardDescription>Choose one zone for this semester (first-come, first-served)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {store.zones.map(zone => {
            const isFull = zone.remaining === 0
            return (
              <div
                key={zone.id}
                className={`border rounded-lg p-4 ${
                  isFull ? 'bg-gray-50 opacity-60' : 'hover:border-rta-primary cursor-pointer'
                }`}
                onClick={() => !isFull && setConfirmZone(zone.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{zone.name}</h4>
                    <p className="text-sm text-gray-500">{zone.distance} from school</p>
                  </div>
                  <div className="text-right">
                    {isFull ? (
                      <Badge variant="danger">Full</Badge>
                    ) : (
                      <Badge variant="success">{zone.remaining} spots left</Badge>
                    )}
                  </div>
                </div>
                <div className="mt-2">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${isFull ? 'bg-red-500' : 'bg-green-500'}`}
                      style={{ width: `${((zone.capacity - zone.remaining) / zone.capacity) * 100}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {zone.capacity - zone.remaining}/{zone.capacity} enrolled
                  </div>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={!!confirmZone} onOpenChange={() => setConfirmZone(null)}>
        <DialogContent onClose={() => setConfirmZone(null)}>
          <DialogHeader>
            <DialogTitle>Confirm Zone Selection</DialogTitle>
            <DialogDescription>
              You are selecting <strong>{store.zones.find(z => z.id === confirmZone)?.name}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">Your zone is fixed for the semester</p>
                  <p className="mt-1">You cannot change zones until next semester enrollment opens.</p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmZone(null)}>Cancel</Button>
            <Button onClick={handleConfirmSelection}>Confirm Selection</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ============ ZONE PICKUP SCREEN ============
function ZonePickupScreen({ onBack }: { onBack: () => void }) {
  const store = useStore()
  const [showQR, setShowQR] = useState(false)

  const zone = store.zones.find(z => z.id === store.selectedZoneId)

  const statusSteps: { status: PickupStatus; label: string }[] = [
    { status: 'pending', label: 'Pending' },
    { status: 'released', label: 'Child Released' },
    { status: 'boarded', label: 'Boarded Shuttle' },
    { status: 'arrived', label: 'Arrived at Zone' },
    { status: 'complete', label: 'Pickup Complete' },
  ]

  const currentIndex = statusSteps.findIndex(s => s.status === store.pickupStatus)

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <Card>
        <CardHeader>
          <CardTitle>Smart Zone Pickup</CardTitle>
          <CardDescription>{zone?.name || 'Zone A'} • {zone?.distance || '1.2 km'} from school</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="text-sm text-gray-500 mb-2">Pickup Window</div>
            <div className="text-xl font-semibold">2:00 PM - 2:30 PM</div>
          </div>

          {/* Status Progress */}
          <div className="space-y-3">
            {statusSteps.map((step, index) => {
              const isComplete = index < currentIndex
              const isCurrent = index === currentIndex
              const isPending = index > currentIndex

              return (
                <div
                  key={step.status}
                  className={`flex items-center gap-3 py-2 px-3 rounded-lg ${
                    isCurrent ? 'bg-blue-50 border border-blue-200' :
                    isComplete ? 'bg-green-50' : 'bg-gray-50'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    isComplete ? 'bg-green-500 text-white' :
                    isCurrent ? 'bg-blue-500 text-white' : 'bg-gray-300 text-white'
                  }`}>
                    {isComplete ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
                  </div>
                  <span className={isPending ? 'text-gray-400' : 'text-gray-900'}>
                    {step.label}
                  </span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Simulator Buttons */}
      <Card className="bg-gray-100 border-dashed">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-gray-500">Demo: Simulate Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            <Button size="sm" variant="outline" onClick={() => store.setPickupStatus('released')}>
              Child Released
            </Button>
            <Button size="sm" variant="outline" onClick={() => store.setPickupStatus('boarded')}>
              Boarded Shuttle
            </Button>
            <Button size="sm" variant="outline" onClick={() => store.setPickupStatus('arrived')}>
              Arrived at Zone
            </Button>
            <Button size="sm" variant="success" onClick={() => {
              store.verifyQR()
              store.setPickupStatus('complete')
            }}>
              Pickup Complete
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* QR & Confirm */}
      <div className="grid grid-cols-2 gap-3">
        <Button onClick={() => setShowQR(true)} variant="default">
          <QrCode className="w-4 h-4 mr-2" />
          Show Pickup QR
        </Button>
        <Button
          onClick={() => {
            store.verifyQR()
            store.setPickupStatus('complete')
          }}
          variant="success"
          disabled={store.pickupStatus === 'complete'}
        >
          <CheckCircle2 className="w-4 h-4 mr-2" />
          Confirm Pickup
        </Button>
      </div>

      {/* QR Dialog */}
      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent onClose={() => setShowQR(false)}>
          <DialogHeader>
            <DialogTitle>Pickup QR Code</DialogTitle>
            <DialogDescription>Scan at zone to verify pickup</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center py-6">
            <div className="w-48 h-48 bg-gray-900 rounded-lg flex items-center justify-center mb-4">
              <div className="grid grid-cols-5 gap-1">
                {Array.from({ length: 25 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-6 h-6 ${Math.random() > 0.3 ? 'bg-white' : 'bg-gray-900'}`}
                  />
                ))}
              </div>
            </div>
            <div className="text-center">
              <p className="font-medium">{store.childName}</p>
              <p className="text-sm text-gray-500">{zone?.name || 'Zone A'}</p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => {
              store.verifyQR()
              setShowQR(false)
            }}>
              Simulate Scan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ============ CARPOOL SCREEN ============
function CarpoolScreen({ onBack }: { onBack: () => void }) {
  const store = useStore()

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <Card>
        <CardHeader>
          <CardTitle>Zone Community Carpooling</CardTitle>
          <CardDescription>Connect with families in your zone</CardDescription>
        </CardHeader>
        <CardContent>
          {store.carpoolGroupJoined ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg">You've joined the carpool group!</h3>
              <p className="text-gray-500 mt-1">Coordinate with your zone community</p>
            </div>
          ) : (
            <Button
              onClick={() => store.joinCarpoolGroup()}
              className="w-full"
            >
              <Users className="w-4 h-4 mr-2" />
              Join Carpool Group
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Suggested Matches</CardTitle>
          <CardDescription>Families in your neighbourhood cluster</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {store.carpoolFamilies.map(family => {
            const requested = store.carpoolRequests.includes(family.id)
            return (
              <div key={family.id} className="flex items-center justify-between py-3 border-b last:border-0">
                <div>
                  <div className="font-medium">{family.name}</div>
                  <div className="text-sm text-gray-500">
                    Child: {family.childName} • {family.neighbourhood}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="info">{family.matchScore}% match</Badge>
                  {requested ? (
                    <Badge variant="success">Requested</Badge>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => store.requestCarpool(family.id)}
                    >
                      Request
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}

// ============ VAN SUBSCRIPTION SCREEN ============
function VanSubscriptionScreen({ onBack }: { onBack: () => void }) {
  const store = useStore()

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <Card>
        <CardHeader>
          <CardTitle>Neighbourhood Van</CardTitle>
          <CardDescription>Door-to-neighbourhood shuttle service</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium">Route: Al Barsha Loop</span>
                <Badge variant="success">12 seats available</Badge>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <p>• Pickup from Zone A</p>
                <p>• Drop-off at Al Barsha 2 cluster</p>
                <p>• ~15 min journey</p>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <div className="text-sm text-gray-500 mb-1">Monthly Subscription</div>
              <div className="text-2xl font-bold">AED 350 <span className="text-sm font-normal text-gray-500">/month</span></div>
            </div>

            {store.vanSubscribedNextSemester ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-medium">Subscribed for Next Semester</span>
                </div>
                <p className="text-sm text-green-600 mt-1">
                  Your subscription will activate when the new semester begins.
                </p>
              </div>
            ) : (
              <Button
                onClick={() => store.subscribeVan()}
                className="w-full"
                size="lg"
              >
                <Bus className="w-4 h-4 mr-2" />
                Subscribe for Next Semester
              </Button>
            )}

            <p className="text-xs text-gray-500 text-center">
              Note: Van subscription is for next semester only. Current semester mode remains unchanged.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ============ TIMELINE SCREEN ============
function TimelineScreen({ onBack }: { onBack: () => void }) {
  const store = useStore()

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <Card>
        <CardHeader>
          <CardTitle>Custody Timeline</CardTitle>
          <CardDescription>Verified events with timestamps</CardDescription>
        </CardHeader>
        <CardContent>
          {store.timelineEvents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No events recorded yet</p>
              <p className="text-sm mt-1">Events will appear as pickup progresses</p>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-200" />
              <div className="space-y-4">
                {[...store.timelineEvents].reverse().map((event, index) => (
                  <div key={event.id} className="relative pl-8">
                    <div className={`absolute left-0 w-6 h-6 rounded-full flex items-center justify-center ${
                      event.verified ? 'bg-green-500' : 'bg-blue-500'
                    }`}>
                      {event.verified ? (
                        <Shield className="w-3 h-3 text-white" />
                      ) : (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{event.event}</span>
                        {event.verified && (
                          <Badge variant="success" className="text-xs">Verified</Badge>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatDateTime(new Date(event.timestamp))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Demo: Add Event */}
      <Card className="bg-gray-100 border-dashed">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-gray-500">Demo: Add Timeline Event</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            <Button size="sm" variant="outline" onClick={() => store.addTimelineEvent('Child released from classroom')}>
              Released
            </Button>
            <Button size="sm" variant="outline" onClick={() => store.addTimelineEvent('Boarded shuttle bus')}>
              Boarded
            </Button>
            <Button size="sm" variant="outline" onClick={() => store.addTimelineEvent('Arrived at pickup zone')}>
              Arrived
            </Button>
            <Button size="sm" variant="success" onClick={() => store.addTimelineEvent('Pickup verified by QR scan', true)}>
              Verified Pickup
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
