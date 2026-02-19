import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type PickupMode = 'onsite' | 'zone' | 'van'
export type PickupStatus = 'pending' | 'released' | 'boarded' | 'arrived' | 'complete'

export interface Zone {
  id: string
  name: string
  distance: string
  capacity: number
  remaining: number
}

export interface OverrunRecord {
  id: string
  date: Date
  result: 'warning' | 'fee'
  feeAmount?: number
  strikeNumber: number
}

export interface TimelineEvent {
  id: string
  timestamp: Date
  event: string
  verified?: boolean
}

export interface CarpoolFamily {
  id: string
  name: string
  neighbourhood: string
  childName: string
  matchScore: number
}

export interface AppState {
  // Parent info
  parentName: string
  childName: string
  schoolName: string
  pickupTime: string

  // Current mode
  currentMode: PickupMode
  selectedZoneId: string | null
  zoneLocked: boolean

  // On-site tracking
  overrunCount: number
  overrunHistory: OverrunRecord[]

  // Zone pickup status
  pickupStatus: PickupStatus
  qrVerified: boolean

  // Timeline
  timelineEvents: TimelineEvent[]

  // Van subscription
  vanSubscribedNextSemester: boolean

  // Carpool
  carpoolRequests: string[]
  carpoolGroupJoined: boolean

  // Zones data
  zones: Zone[]

  // Carpool families
  carpoolFamilies: CarpoolFamily[]

  // Actions
  selectZone: (zoneId: string) => void
  recordOverrun: () => void
  setPickupStatus: (status: PickupStatus) => void
  verifyQR: () => void
  subscribeVan: () => void
  requestCarpool: (familyId: string) => void
  joinCarpoolGroup: () => void
  setMode: (mode: PickupMode) => void
  addTimelineEvent: (event: string, verified?: boolean) => void
  resetDemo: () => void
}

const initialZones: Zone[] = [
  { id: 'zone-a', name: 'Zone A', distance: '1.2 km', capacity: 120, remaining: 12 },
  { id: 'zone-b', name: 'Zone B', distance: '0.8 km', capacity: 120, remaining: 31 },
  { id: 'zone-c', name: 'Zone C', distance: '1.5 km', capacity: 120, remaining: 0 },
]

const initialCarpoolFamilies: CarpoolFamily[] = [
  { id: 'family-1', name: 'Ahmed Family', neighbourhood: 'Al Barsha 2', childName: 'Omar', matchScore: 95 },
  { id: 'family-2', name: 'Khan Family', neighbourhood: 'Al Barsha 2', childName: 'Fatima', matchScore: 88 },
  { id: 'family-3', name: 'Smith Family', neighbourhood: 'Al Barsha 3', childName: 'Liam', matchScore: 72 },
]

const getInitialState = () => ({
  parentName: "Sara's Mum",
  childName: 'Sara',
  schoolName: 'Millennium School',
  pickupTime: '2:00 PM',
  currentMode: 'onsite' as PickupMode,
  selectedZoneId: null,
  zoneLocked: false,
  overrunCount: 0,
  overrunHistory: [] as OverrunRecord[],
  pickupStatus: 'pending' as PickupStatus,
  qrVerified: false,
  timelineEvents: [] as TimelineEvent[],
  vanSubscribedNextSemester: false,
  carpoolRequests: [] as string[],
  carpoolGroupJoined: false,
  zones: initialZones,
  carpoolFamilies: initialCarpoolFamilies,
})

export function calculateFee(overrunNumber: number): { result: 'warning' | 'fee'; amount?: number } {
  if (overrunNumber <= 3) {
    return { result: 'warning' }
  }
  // 4th = 20, 5th = 40, 6th = 60, 7th = 80, etc.
  const feeAmount = (overrunNumber - 3) * 20
  return { result: 'fee', amount: feeAmount }
}

export function getNextFee(currentOverruns: number): { label: string; amount?: number } {
  const next = currentOverruns + 1
  if (next <= 3) {
    return { label: `Warning ${next}/3` }
  }
  const amount = (next - 3) * 20
  return { label: `AED ${amount} fee`, amount }
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...getInitialState(),

      selectZone: (zoneId: string) => {
        const zones = get().zones
        const zone = zones.find(z => z.id === zoneId)
        if (!zone || zone.remaining === 0) return

        set({
          selectedZoneId: zoneId,
          zoneLocked: true,
          currentMode: 'zone',
          zones: zones.map(z =>
            z.id === zoneId
              ? { ...z, remaining: z.remaining - 1 }
              : z
          )
        })
      },

      recordOverrun: () => {
        const currentCount = get().overrunCount
        const newCount = currentCount + 1
        const feeResult = calculateFee(newCount)

        const newRecord: OverrunRecord = {
          id: `overrun-${Date.now()}`,
          date: new Date(),
          result: feeResult.result,
          feeAmount: feeResult.amount,
          strikeNumber: newCount
        }

        set({
          overrunCount: newCount,
          overrunHistory: [...get().overrunHistory, newRecord]
        })
      },

      setPickupStatus: (status: PickupStatus) => {
        const statusLabels: Record<PickupStatus, string> = {
          pending: 'Pending',
          released: 'Child Released from School',
          boarded: 'Boarded Shuttle',
          arrived: 'Arrived at Zone',
          complete: 'Pickup Complete'
        }

        set({ pickupStatus: status })
        get().addTimelineEvent(statusLabels[status], status === 'complete' && get().qrVerified)
      },

      verifyQR: () => {
        set({ qrVerified: true })
        get().addTimelineEvent('QR Verified - Pickup Authorized', true)
      },

      subscribeVan: () => {
        set({ vanSubscribedNextSemester: true })
      },

      requestCarpool: (familyId: string) => {
        const requests = get().carpoolRequests
        if (!requests.includes(familyId)) {
          set({ carpoolRequests: [...requests, familyId] })
        }
      },

      joinCarpoolGroup: () => {
        set({ carpoolGroupJoined: true })
      },

      setMode: (mode: PickupMode) => {
        set({ currentMode: mode })
      },

      addTimelineEvent: (event: string, verified = false) => {
        const newEvent: TimelineEvent = {
          id: `event-${Date.now()}`,
          timestamp: new Date(),
          event,
          verified
        }
        set({ timelineEvents: [...get().timelineEvents, newEvent] })
      },

      resetDemo: () => {
        set({
          ...getInitialState(),
          zones: [
            { id: 'zone-a', name: 'Zone A', distance: '1.2 km', capacity: 120, remaining: 12 },
            { id: 'zone-b', name: 'Zone B', distance: '0.8 km', capacity: 120, remaining: 31 },
            { id: 'zone-c', name: 'Zone C', distance: '1.5 km', capacity: 120, remaining: 0 },
          ]
        })
      },
    }),
    {
      name: 'tanzeem-storage',
    }
  )
)

// Ops dashboard computed values
export function getOpsMetrics(state: AppState) {
  const totalParents = 247 // Mock pilot size
  const onsiteCount = 89
  const zoneCount = 142
  const vanIntentCount = 16

  const avgOverruns = 1.3
  const totalFees = state.overrunHistory
    .filter(o => o.result === 'fee')
    .reduce((sum, o) => sum + (o.feeAmount || 0), 0) + 1240 // Add mock baseline

  return {
    totalParents,
    modeSplit: { onsite: onsiteCount, zone: zoneCount, vanIntent: vanIntentCount },
    avgOverruns,
    totalFees,
    riskParents: [
      { name: "Sara's Mum", warnings: state.overrunCount >= 3 ? state.overrunCount : 0, fees: state.overrunHistory.filter(o => o.result === 'fee').reduce((s, o) => s + (o.feeAmount || 0), 0) },
      { name: 'Mohammed A.', warnings: 3, fees: 60 },
      { name: 'Fatima K.', warnings: 4, fees: 20 },
      { name: 'Ali H.', warnings: 3, fees: 0 },
    ].filter(p => p.warnings >= 3 || p.fees > 0)
  }
}
