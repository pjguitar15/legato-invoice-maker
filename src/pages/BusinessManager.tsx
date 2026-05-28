import { useDeferredValue, useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CssBaseline,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  Menu,
  MenuItem,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import { alpha, createTheme, ThemeProvider } from '@mui/material/styles'
import { Link as RouterLink } from 'react-router'
import {
  FiBarChart2,
  FiCalendar,
  FiMapPin,
  FiUsers,
  FiEdit3,
  FiFileText,
  FiMoon,
  FiPlus,
  FiSearch,
  FiSun,
  FiTrash2,
} from 'react-icons/fi'

type EventRecord = {
  id: string
  name: string
  agreedAmount: number | null
  amountPaid: number | null
  bookingSource: string
  clientName: string
  eventDate: string
  eventType: string
  eventTime: string
  location: string
  notes: string
  packageName: string
  paymentDueDate: string
  pipelineStage: string
  status: string
}

type EventFormValues = Omit<EventRecord, 'id' | 'agreedAmount' | 'amountPaid'> & {
  agreedAmount: string
  amountPaid: string
}

type ViewMode = 'events' | 'calendar' | 'analytics' | 'clients' | 'venues'
type ColorMode = 'light' | 'dark'
type SortField = 'eventDate' | 'name' | 'clientName' | 'agreedAmount' | 'status'
type SortDirection = 'asc' | 'desc'
type SavedView = 'all' | 'upcoming' | 'unpaid' | 'needsData' | 'completed'
type ColumnKey =
  | 'event'
  | 'client'
  | 'date'
  | 'type'
  | 'package'
  | 'location'
  | 'amount'
  | 'balance'
  | 'pipeline'
  | 'source'
  | 'status'

type GroupSummary = {
  name: string
  count: number
  activeCount: number
  doneCount: number
  cancelledCount: number
  revenue: number
  averageRevenue: number
  latestDate: string
  topPackage: string
  topType: string
  topLocation: string
  topClient: string
}

type EventListParams = {
  eventTypeFilter: string
  packageFilter: string
  page: number
  query: string
  rowsPerPage: number
  savedView: SavedView
  showUnscheduled: boolean
  sortDirection: SortDirection
  sortField: SortField
  statusFilter: string
  yearFilter: string
}

type EventListMeta = {
  total: number
  limit: number
  skip: number
}

type EventFacets = {
  eventTypes: string[]
  packages: string[]
  statuses: string[]
  years: string[]
}

const tableColumns: Array<{ key: ColumnKey; label: string }> = [
  { key: 'event', label: 'Event' },
  { key: 'date', label: 'Date' },
  { key: 'client', label: 'Client' },
  { key: 'location', label: 'Location' },
  { key: 'type', label: 'Type' },
  { key: 'package', label: 'Package' },
  { key: 'amount', label: 'Amount' },
  { key: 'balance', label: 'Balance' },
  { key: 'pipeline', label: 'Pipeline' },
  { key: 'source', label: 'Source' },
  { key: 'status', label: 'Status' },
]

const pipelineStages = [
  'Inquiry',
  'Quoted',
  'Booked',
  'Deposit Paid',
  'Completed',
  'Cancelled',
  'Lost',
]

const bookingSources = [
  'Unknown',
  'Referral',
  'Facebook',
  'Instagram',
  'Website',
  'Repeat client',
  'Wedding fair',
  'Walk-in',
]

const savedViews: Array<{ key: SavedView; label: string }> = [
  { key: 'all', label: 'All scheduled' },
  { key: 'upcoming', label: 'Upcoming 30 days' },
  { key: 'unpaid', label: 'Unpaid balances' },
  { key: 'needsData', label: 'Needs data' },
  { key: 'completed', label: 'Completed' },
]

const managerThemes = {
  light: {
    page: '#f5f7fb',
    pageGlow:
      'radial-gradient(circle at 16% 0%, rgba(20, 184, 166, 0.16), transparent 32%), radial-gradient(circle at 88% 8%, rgba(245, 158, 11, 0.14), transparent 30%)',
    panel: '#ffffff',
    panelSoft: '#f8fafc',
    elevated: '#ffffff',
    text: '#111827',
    muted: '#667085',
    faint: '#98a2b3',
    border: '#dde5ef',
    borderSoft: '#edf1f6',
    primary: '#0f172a',
    primaryHover: '#1e293b',
    primaryText: '#ffffff',
    accent: '#14b8a6',
    accent2: '#f59e0b',
    accent3: '#4f46e5',
    field: '#ffffff',
    shadow: '0 18px 48px rgba(15, 23, 42, 0.08)',
  },
  dark: {
    page: '#080b12',
    pageGlow:
      'radial-gradient(circle at 16% 0%, rgba(20, 184, 166, 0.2), transparent 34%), radial-gradient(circle at 84% 8%, rgba(79, 70, 229, 0.18), transparent 32%)',
    panel: '#111827',
    panelSoft: '#0d1420',
    elevated: '#151e2d',
    text: '#f8fafc',
    muted: '#aab6c8',
    faint: '#748094',
    border: '#263244',
    borderSoft: '#1d2736',
    primary: '#2dd4bf',
    primaryHover: '#5eead4',
    primaryText: '#ffffff',
    accent: '#2dd4bf',
    accent2: '#fbbf24',
    accent3: '#818cf8',
    field: '#0d1420',
    shadow: '0 18px 52px rgba(0, 0, 0, 0.34)',
  },
} as const

type ManagerTheme = (typeof managerThemes)[ColorMode]
type EventFormFieldName = keyof EventFormValues

const eventFormFields: Array<{ name: EventFormFieldName; label: string }> = [
  { name: 'name', label: 'Event name' },
  { name: 'clientName', label: 'Client name' },
  { name: 'eventDate', label: 'Event date' },
  { name: 'eventTime', label: 'Event time' },
  { name: 'eventType', label: 'Event type' },
  { name: 'packageName', label: 'Package' },
  { name: 'agreedAmount', label: 'Agreed amount' },
  { name: 'amountPaid', label: 'Amount paid' },
  { name: 'paymentDueDate', label: 'Payment due date' },
  { name: 'pipelineStage', label: 'Pipeline stage' },
  { name: 'bookingSource', label: 'Booking source' },
  { name: 'status', label: 'Status' },
  { name: 'location', label: 'Location' },
  { name: 'notes', label: 'Notes' },
]

const buildMuiTheme = (mode: ColorMode) => {
  const tokens = managerThemes[mode]

  return createTheme({
    palette: {
      mode,
      primary: {
        main: tokens.accent3,
      },
      secondary: {
        main: tokens.accent,
      },
      background: {
        default: tokens.page,
        paper: tokens.panel,
      },
      text: {
        primary: tokens.text,
        secondary: tokens.muted,
      },
      divider: tokens.border,
      action: {
        hover: alpha(tokens.accent, mode === 'light' ? 0.08 : 0.16),
        selected: alpha(tokens.accent3, mode === 'light' ? 0.12 : 0.24),
      },
    },
    shape: {
      borderRadius: 12,
    },
    typography: {
      fontFamily:
        '"Segoe UI Variable", "Aptos", "Inter", "SF Pro Display", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      h1: {
        fontWeight: 720,
        letterSpacing: 0,
      },
      h2: {
        fontWeight: 700,
        letterSpacing: 0,
      },
      button: {
        textTransform: 'none',
        fontWeight: 620,
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            boxShadow: 'none',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            border: `1px solid ${tokens.border}`,
            boxShadow: tokens.shadow,
          },
        },
      },
      MuiCardContent: {
        styleOverrides: {
          root: {
            padding: 24,
            '&:last-child': {
              paddingBottom: 24,
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
      MuiTextField: {
        defaultProps: {
          size: 'small',
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 620,
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderColor: tokens.borderSoft,
            padding: '12px 14px',
          },
          head: {
            backgroundColor: tokens.panelSoft,
            color: tokens.muted,
            fontSize: 11,
            fontWeight: 650,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            padding: '13px 14px',
          },
        },
      },
    },
  })
}

const emptyForm: EventFormValues = {
  name: '',
  agreedAmount: '',
  amountPaid: '',
  bookingSource: 'Unknown',
  clientName: '',
  eventDate: '',
  eventType: '',
  eventTime: '',
  location: '',
  notes: '',
  packageName: '',
  paymentDueDate: '',
  pipelineStage: 'Booked',
  status: 'Booked',
}

const peso = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  maximumFractionDigits: 0,
})

const monthLabel = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  year: 'numeric',
})

const shortMonthLabel = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  year: '2-digit',
})

const normalizeStatus = (status: string) => status.trim().toLowerCase()
const isCancelled = (status: string) => normalizeStatus(status).includes('cancel')
const isDone = (status: string) => normalizeStatus(status).includes('done')
const inferPipelineStage = (status: string) => {
  const normalized = normalizeStatus(status)
  if (normalized.includes('cancel')) return 'Cancelled'
  if (normalized.includes('lost')) return 'Lost'
  if (normalized.includes('done') || normalized.includes('complete')) return 'Completed'
  if (normalized.includes('deposit') || normalized.includes('paid')) return 'Deposit Paid'
  if (normalized.includes('quote')) return 'Quoted'
  if (normalized.includes('inquir')) return 'Inquiry'
  return 'Booked'
}

const parseAmountInput = (value: string) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

const normalizeEventRecord = (event: Partial<EventRecord>): EventRecord => ({
  id: event.id || `evt-${Date.now()}`,
  name: event.name || '',
  agreedAmount:
    typeof event.agreedAmount === 'number' && Number.isFinite(event.agreedAmount)
      ? event.agreedAmount
      : null,
  amountPaid:
    typeof event.amountPaid === 'number' && Number.isFinite(event.amountPaid)
      ? event.amountPaid
      : null,
  bookingSource: event.bookingSource || 'Unknown',
  clientName: event.clientName || '',
  eventDate: event.eventDate || '',
  eventType: event.eventType || '',
  eventTime: event.eventTime || '',
  location: event.location || '',
  notes: event.notes || '',
  packageName: event.packageName || '',
  paymentDueDate: event.paymentDueDate || '',
  pipelineStage: event.pipelineStage || inferPipelineStage(event.status || ''),
  status: event.status || 'No status',
})

const toFormValues = (event: EventRecord): EventFormValues => ({
  ...event,
  agreedAmount: event.agreedAmount == null ? '' : String(event.agreedAmount),
  amountPaid: event.amountPaid == null ? '' : String(event.amountPaid),
})

const readApiError = async (response: Response) => {
  try {
    const body = await response.json()
    return body.error || body.message || `Request failed with ${response.status}`
  } catch {
    return `Request failed with ${response.status}`
  }
}

const fetchEventsFromApi = async (params: EventListParams, signal?: AbortSignal) => {
  const searchParams = new URLSearchParams({
    limit: String(params.rowsPerPage),
    skip: String(params.page * params.rowsPerPage),
    savedView: params.savedView,
    scheduled: String(!params.showUnscheduled),
    sortDirection: params.sortDirection,
    sortField: params.sortField,
  })

  if (params.query.trim()) searchParams.set('q', params.query.trim())
  if (params.yearFilter !== 'All') searchParams.set('year', params.yearFilter)
  if (params.statusFilter !== 'All') searchParams.set('status', params.statusFilter)
  if (params.packageFilter !== 'All') searchParams.set('packageName', params.packageFilter)
  if (params.eventTypeFilter !== 'All') searchParams.set('eventType', params.eventTypeFilter)

  const response = await fetch(`/api/events?${searchParams.toString()}`, { signal })

  if (!response.ok) {
    throw new Error(await readApiError(response))
  }

  const body = (await response.json()) as {
    data?: Partial<EventRecord>[]
    meta?: Partial<EventListMeta>
  }

  return {
    data: (body.data ?? []).map(normalizeEventRecord),
    meta: {
      total: body.meta?.total ?? 0,
      limit: body.meta?.limit ?? params.rowsPerPage,
      skip: body.meta?.skip ?? params.page * params.rowsPerPage,
    },
  }
}

const fetchEventFacetsFromApi = async (signal?: AbortSignal) => {
  const response = await fetch('/api/events/facets', { signal })

  if (!response.ok) {
    throw new Error(await readApiError(response))
  }

  const body = (await response.json()) as { data?: Partial<EventFacets> }

  return {
    eventTypes: body.data?.eventTypes ?? [],
    packages: body.data?.packages ?? [],
    statuses: body.data?.statuses ?? [],
    years: body.data?.years ?? [],
  }
}

const saveEventToApi = async (event: EventRecord, editingId?: string) => {
  const response = await fetch(editingId ? `/api/events/${editingId}` : '/api/events', {
    method: editingId ? 'PUT' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(event),
  })

  if (!response.ok) {
    throw new Error(await readApiError(response))
  }

  const body = (await response.json()) as { data?: Partial<EventRecord> }
  return normalizeEventRecord(body.data ?? event)
}

const deleteEventFromApi = async (eventId: string) => {
  const response = await fetch(`/api/events/${eventId}`, { method: 'DELETE' })

  if (!response.ok) {
    throw new Error(await readApiError(response))
  }
}

const getMonthKey = (dateValue: string) => {
  if (!dateValue) return ''

  const date = new Date(`${dateValue}T00:00:00`)
  return Number.isNaN(date.getTime())
    ? ''
    : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

const getDateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

const getCurrentMonthKey = () => getDateKey(new Date()).slice(0, 7)
const getMonthDate = (monthKey: string) => new Date(`${monthKey}-01T00:00:00`)

const average = (total: number, count: number) =>
  count === 0 ? 0 : Math.round(total / count)

const hasSchedule = (event: EventRecord) =>
  Boolean(event.eventDate.trim() && event.eventTime.trim())

const getBalance = (event: EventRecord) =>
  Math.max((event.agreedAmount ?? 0) - (event.amountPaid ?? 0), 0)

const isUpcomingWithin = (event: EventRecord, days: number) => {
  if (!hasSchedule(event) || isCancelled(event.status)) return false

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(`${event.eventDate}T00:00:00`)
  const diff = target.getTime() - today.getTime()
  return diff >= 0 && diff <= days * 24 * 60 * 60 * 1000
}

const needsCriticalData = (event: EventRecord) =>
  !event.clientName ||
  !event.location ||
  !event.eventType ||
  !event.packageName ||
  !hasSchedule(event) ||
  event.agreedAmount == null

const getEventYear = (event: EventRecord) =>
  event.eventDate ? event.eventDate.slice(0, 4) : 'Unscheduled'

const mostCommon = (values: string[]) => {
  const counts = new Map<string, number>()

  values
    .filter(Boolean)
    .forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1))

  return Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '-'
}

const summarizeGroup = (
  name: string,
  records: EventRecord[],
  options: { topClient?: boolean; topLocation?: boolean } = {},
): GroupSummary => {
  const active = records.filter((event) => !isCancelled(event.status))
  const done = records.filter((event) => isDone(event.status))
  const cancelled = records.filter((event) => isCancelled(event.status))
  const revenue = active.reduce((sum, event) => sum + (event.agreedAmount ?? 0), 0)
  const latestDate =
    records
      .map((event) => event.eventDate)
      .filter(Boolean)
      .sort()
      .at(-1) ?? '-'

  return {
    name,
    count: records.length,
    activeCount: active.length,
    doneCount: done.length,
    cancelledCount: cancelled.length,
    revenue,
    averageRevenue: average(revenue, active.length),
    latestDate,
    topPackage: mostCommon(records.map((event) => event.packageName)),
    topType: mostCommon(records.map((event) => event.eventType)),
    topLocation: options.topLocation
      ? mostCommon(records.map((event) => event.location))
      : '-',
    topClient: options.topClient
      ? mostCommon(records.map((event) => event.clientName))
      : '-',
  }
}

const statusTone = (status: string) => {
  if (isDone(status)) return { bg: '#ecfdf3', color: '#027a48', border: '#abefc6' }
  if (isCancelled(status)) return { bg: '#fff1f3', color: '#c01048', border: '#fecdd6' }
  return { bg: '#eff8ff', color: '#175cd3', border: '#b2ddff' }
}

const DashboardMetric = ({
  label,
  value,
  detail,
  accent,
}: {
  label: string
  value: string
  detail: string
  accent: string
}) => (
  <Card
    sx={{
      position: 'relative',
      borderRadius: 3,
      background: 'linear-gradient(180deg, var(--panel), var(--panelSoft))',
      minWidth: 0,
      overflow: 'hidden',
      '&::before': {
        content: '""',
        position: 'absolute',
        inset: '0 auto 0 0',
        width: 5,
        background: accent,
      },
    }}
  >
    <CardContent sx={{ padding: { xs: 2.25, md: 2.5 }, '&:last-child': { paddingBottom: { xs: 2.25, md: 2.5 } } }}>
      <Typography
        sx={{
          fontSize: 11,
          fontWeight: 650,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'text.secondary',
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontSize: { xs: 25, md: 30 },
          lineHeight: 1.1,
          fontWeight: 700,
          color: 'text.primary',
          marginTop: '0.5rem',
        }}
      >
        {value}
      </Typography>
      <Typography sx={{ fontSize: 13, color: 'text.secondary', marginTop: '0.35rem' }}>
        {detail}
      </Typography>
    </CardContent>
  </Card>
)

const AnalyticsCard = ({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) => (
  <Card
    sx={{
      background: 'var(--panel)',
      borderRadius: 3,
      minWidth: 0,
    }}
  >
    <CardContent sx={{ padding: { xs: 2.25, md: 2.75 }, '&:last-child': { paddingBottom: { xs: 2.25, md: 2.75 } } }}>
      <Typography sx={{ fontSize: 18, fontWeight: 650, color: 'text.primary' }}>
        {title}
      </Typography>
      <Typography sx={{ fontSize: 13, color: 'text.secondary', marginTop: '0.25rem' }}>
        {description}
      </Typography>
      {children}
    </CardContent>
  </Card>
)

const DataBar = ({
  label,
  value,
  helper,
  percentage,
  color = 'linear-gradient(90deg, var(--accent2), var(--accent))',
}: {
  label: string
  value: string
  helper?: string
  percentage: number
  color?: string
}) => (
  <Box>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
      <Typography noWrap sx={{ fontSize: 13, fontWeight: 650, color: 'var(--text)' }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>
        {value}
      </Typography>
    </Box>
    {helper ? (
      <Typography noWrap sx={{ fontSize: 11.5, color: 'var(--faint)', marginTop: '0.15rem' }}>
        {helper}
      </Typography>
    ) : null}
    <Box
      sx={{
        height: 9,
        background: 'var(--panelSoft)',
        borderRadius: 999,
        marginTop: '0.45rem',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          height: '100%',
          width: `${Math.min(Math.max(percentage, 2), 100)}%`,
          background: color,
          borderRadius: 999,
        }}
      />
    </Box>
  </Box>
)

const DonutChart = ({
  slices,
}: {
  slices: Array<{ label: string; value: number; color: string }>
}) => {
  const total = slices.reduce((sum, slice) => sum + slice.value, 0) || 1
  const gradient = slices
    .reduce<{ parts: string[]; offset: number }>(
      (current, slice) => {
        const start = current.offset
        const end = start + (slice.value / total) * 100
        return {
          parts: [...current.parts, `${slice.color} ${start}% ${end}%`],
          offset: end,
        }
      },
      { parts: [], offset: 0 },
    )
    .parts
    .join(', ')

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '1rem', alignItems: 'center', marginTop: '1.25rem' }}>
      <Box
        sx={{
          width: 150,
          height: 150,
          borderRadius: '50%',
          background: `conic-gradient(${gradient})`,
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            inset: 28,
            borderRadius: '50%',
            background: 'var(--panel)',
            border: '1px solid var(--borderSoft)',
          },
        }}
      />
      <Stack spacing={0.85}>
        {slices.map((slice) => (
          <Box key={slice.label} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 10, height: 10, borderRadius: 999, background: slice.color }} />
            <Typography sx={{ fontSize: 13, color: 'var(--text)', fontWeight: 600, flex: 1 }}>
              {slice.label}
            </Typography>
            <Typography sx={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600 }}>
              {Math.round((slice.value / total) * 100)}%
            </Typography>
          </Box>
        ))}
      </Stack>
    </Box>
  )
}

const TableSkeletonLine = ({
  width = '100%',
  height = 18,
}: {
  width?: number | string
  height?: number
}) => (
  <Skeleton
    variant='rounded'
    animation='wave'
    width={width}
    height={height}
    sx={{
      borderRadius: 1,
      bgcolor: 'color-mix(in srgb, var(--muted) 14%, transparent)',
    }}
  />
)

const EventTableSkeletonRows = ({
  rowCount,
  visibleColumns,
}: {
  rowCount: number
  visibleColumns: Record<ColumnKey, boolean>
}) => (
  <>
    {Array.from({ length: rowCount }, (_, rowIndex) => (
      <TableRow
        key={`event-skeleton-${rowIndex}`}
        sx={{
          '& td': {
            borderColor: 'var(--borderSoft)',
            py: 1.3,
            px: 1.75,
          },
        }}
      >
        {visibleColumns.event ? (
          <TableCell sx={{ width: 190, maxWidth: 220 }}>
            <Stack spacing={0.75}>
              <TableSkeletonLine width='82%' height={17} />
              <TableSkeletonLine width='58%' height={14} />
            </Stack>
          </TableCell>
        ) : null}
        {visibleColumns.date ? (
          <TableCell sx={{ whiteSpace: 'nowrap' }}>
            <Stack spacing={0.75}>
              <TableSkeletonLine width={92} height={16} />
              <TableSkeletonLine width={58} height={14} />
            </Stack>
          </TableCell>
        ) : null}
        {visibleColumns.client ? (
          <TableCell sx={{ width: 150, maxWidth: 170 }}>
            <TableSkeletonLine width='72%' />
          </TableCell>
        ) : null}
        {visibleColumns.location ? (
          <TableCell sx={{ width: 190, maxWidth: 220 }}>
            <TableSkeletonLine width='78%' />
          </TableCell>
        ) : null}
        {visibleColumns.type ? (
          <TableCell sx={{ width: 120, maxWidth: 130 }}>
            <TableSkeletonLine width='68%' />
          </TableCell>
        ) : null}
        {visibleColumns.package ? (
          <TableCell sx={{ width: 150, maxWidth: 160 }}>
            <TableSkeletonLine width='76%' />
          </TableCell>
        ) : null}
        {visibleColumns.amount ? (
          <TableCell>
            <TableSkeletonLine width={74} />
          </TableCell>
        ) : null}
        {visibleColumns.balance ? (
          <TableCell>
            <TableSkeletonLine width={70} />
          </TableCell>
        ) : null}
        {visibleColumns.pipeline ? (
          <TableCell sx={{ minWidth: 130 }}>
            <TableSkeletonLine width={104} height={24} />
          </TableCell>
        ) : null}
        {visibleColumns.source ? (
          <TableCell sx={{ width: 130, maxWidth: 150 }}>
            <TableSkeletonLine width='70%' />
          </TableCell>
        ) : null}
        {visibleColumns.status ? (
          <TableCell>
            <TableSkeletonLine width={86} height={24} />
          </TableCell>
        ) : null}
        <TableCell align='right'>
          <Stack direction='row' spacing={1} sx={{ justifyContent: 'flex-end' }}>
            <TableSkeletonLine width={28} height={28} />
            <TableSkeletonLine width={28} height={28} />
          </Stack>
        </TableCell>
      </TableRow>
    ))}
  </>
)

const EventDialog = ({
  editingEvent,
  savingEvent,
  theme,
  onClose,
  onSave,
}: {
  editingEvent: EventRecord | null
  savingEvent: boolean
  theme: ManagerTheme
  onClose: () => void
  onSave: (values: EventFormValues) => Promise<void>
}) => {
  const initialValues = editingEvent ? toFormValues(editingEvent) : emptyForm

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const values = eventFormFields.reduce((current, { name }) => {
      current[name] = String(formData.get(name) ?? '')
      return current
    }, {} as EventFormValues)

    await onSave(values)
  }

  return (
    <Dialog
      open
      onClose={onClose}
      fullWidth
      maxWidth='md'
      slotProps={{
        paper: {
          sx: {
            background: theme.panel,
            color: theme.text,
            border: `1px solid ${theme.border}`,
            borderRadius: '16px',
          },
        },
      }}
    >
      <Box
        component='form'
        onSubmit={handleSubmit}
        sx={{
          '& .MuiOutlinedInput-root': {
            background: theme.field,
            color: theme.text,
            borderRadius: '10px',
            '& fieldset': {
              borderColor: theme.border,
            },
            '&:hover fieldset, &.Mui-focused fieldset': {
              borderColor: theme.accent,
            },
          },
          '& .MuiInputLabel-root, & .MuiSelect-icon': {
            color: theme.muted,
          },
          '& input, & textarea': {
            color: theme.text,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: theme.text }}>
          {editingEvent ? 'Edit event' : 'Add event'}
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
              gap: 1.5,
              paddingTop: 1,
            }}
          >
            {eventFormFields.map(({ name, label }) => (
              <TextField
                key={name}
                name={name}
                label={label}
                type={
                  name === 'eventDate' || name === 'paymentDueDate'
                    ? 'date'
                    : name === 'agreedAmount' || name === 'amountPaid'
                      ? 'number'
                      : 'text'
                }
                select={name === 'pipelineStage' || name === 'bookingSource'}
                defaultValue={initialValues[name]}
                required={name === 'name' || name === 'eventDate'}
                multiline={name === 'notes'}
                minRows={name === 'notes' ? 3 : undefined}
                sx={{ gridColumn: name === 'location' || name === 'notes' ? '1 / -1' : undefined }}
                slotProps={name === 'eventDate' || name === 'paymentDueDate' ? { inputLabel: { shrink: true } } : undefined}
              >
                {name === 'pipelineStage'
                  ? pipelineStages.map((stage) => (
                      <MenuItem key={stage} value={stage}>
                        {stage}
                      </MenuItem>
                    ))
                  : null}
                {name === 'bookingSource'
                  ? bookingSources.map((source) => (
                      <MenuItem key={source} value={source}>
                        {source}
                      </MenuItem>
                    ))
                  : null}
              </TextField>
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ padding: { xs: 2, md: '1.25rem 1.75rem 1.5rem' } }}>
          <Button
            onClick={onClose}
            variant='outlined'
            sx={{
              borderColor: theme.border,
              color: theme.text,
              textTransform: 'none',
              fontWeight: 620,
            }}
          >
            Cancel
          </Button>
          <Button
            type='submit'
            variant='contained'
            disabled={savingEvent}
            sx={{
              background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent3})`,
              boxShadow: 'none',
              textTransform: 'none',
              fontWeight: 650,
            }}
          >
            {savingEvent ? 'Saving...' : 'Save event'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}

const BusinessManager = () => {
  const [events, setEvents] = useState<EventRecord[]>([])
  const [eventsLoading, setEventsLoading] = useState(true)
  const [eventsError, setEventsError] = useState('')
  const [eventsTotal, setEventsTotal] = useState(0)
  const [eventsRevision, setEventsRevision] = useState(0)
  const [facetsRevision, setFacetsRevision] = useState(0)
  const [eventFacets, setEventFacets] = useState<EventFacets>({
    eventTypes: [],
    packages: [],
    statuses: [],
    years: [],
  })
  const [savingEvent, setSavingEvent] = useState(false)
  const [deletingEventId, setDeletingEventId] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('events')
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [packageFilter, setPackageFilter] = useState('All')
  const [eventTypeFilter, setEventTypeFilter] = useState('All')
  const [yearFilter, setYearFilter] = useState('All')
  const [savedView, setSavedView] = useState<SavedView>('all')
  const [showUnscheduled, setShowUnscheduled] = useState(false)
  const [sortField, setSortField] = useState<SortField>('eventDate')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [visibleColumns, setVisibleColumns] = useState<Record<ColumnKey, boolean>>({
    event: true,
    date: true,
    client: true,
    location: true,
    type: true,
    package: true,
    amount: true,
    balance: true,
    pipeline: true,
    source: false,
    status: true,
  })
  const [propertiesAnchor, setPropertiesAnchor] = useState<HTMLElement | null>(null)
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthKey())
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(25)
  const [editingEvent, setEditingEvent] = useState<EventRecord | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [calendarEventDetails, setCalendarEventDetails] = useState<EventRecord | null>(null)
  const [colorMode, setColorMode] = useState<ColorMode>('light')
  const theme = managerThemes[colorMode]
  const muiTheme = useMemo(() => buildMuiTheme(colorMode), [colorMode])
  const deferredQuery = useDeferredValue(query)
  const eventListParams = useMemo<EventListParams>(
    () => ({
      eventTypeFilter,
      packageFilter,
      page,
      query: deferredQuery,
      rowsPerPage,
      savedView,
      showUnscheduled,
      sortDirection,
      sortField,
      statusFilter,
      yearFilter,
    }),
    [
      eventTypeFilter,
      packageFilter,
      page,
      deferredQuery,
      rowsPerPage,
      savedView,
      showUnscheduled,
      sortDirection,
      sortField,
      statusFilter,
      yearFilter,
    ],
  )

  useEffect(() => {
    const controller = new AbortController()

    setEventsLoading(true)
    setEventsError('')

    fetchEventsFromApi(eventListParams, controller.signal)
      .then(({ data, meta }) => {
        setEvents(data)
        setEventsTotal(meta.total)
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return
        setEventsError(error instanceof Error ? error.message : 'Failed to load events')
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setEventsLoading(false)
        }
      })

    return () => controller.abort()
  }, [eventListParams, eventsRevision])

  useEffect(() => {
    const controller = new AbortController()

    fetchEventFacetsFromApi(controller.signal)
      .then(setEventFacets)
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return
        setEventsError(error instanceof Error ? error.message : 'Failed to load event filters')
      })

    return () => controller.abort()
  }, [facetsRevision])

  const statusOptions = useMemo(
    () => ['All', ...eventFacets.statuses],
    [eventFacets.statuses],
  )

  const packageOptions = useMemo(
    () => ['All', ...eventFacets.packages],
    [eventFacets.packages],
  )

  const eventTypeOptions = useMemo(
    () => ['All', ...eventFacets.eventTypes],
    [eventFacets.eventTypes],
  )

  const yearOptions = useMemo(
    () => ['All', ...eventFacets.years],
    [eventFacets.years],
  )

  const visibleTableColumns = tableColumns.filter(
    (column) => visibleColumns[column.key],
  )

  const lastPage = Math.max(Math.ceil(eventsTotal / rowsPerPage) - 1, 0)
  const safePage = Math.min(page, lastPage)

  useEffect(() => {
    if (page > lastPage) {
      setPage(lastPage)
    }
  }, [lastPage, page])

  const analyticsEvents = useMemo(
    () =>
      events.filter(
        (event) =>
          hasSchedule(event) &&
          (yearFilter === 'All' || getEventYear(event) === yearFilter),
      ),
    [events, yearFilter],
  )
  const activeEvents = analyticsEvents.filter((event) => !isCancelled(event.status))
  const doneEvents = analyticsEvents.filter((event) => isDone(event.status))
  const activeRevenue = activeEvents.reduce(
    (sum, event) => sum + (event.agreedAmount ?? 0),
    0,
  )
  const unpaidBalance = activeEvents.reduce(
    (sum, event) => sum + getBalance(event),
    0,
  )
  const upcoming30Events = events.filter((event) => isUpcomingWithin(event, 30))
  const needsDataEvents = events.filter(needsCriticalData)
  const completedRevenue = doneEvents.reduce(
    (sum, event) => sum + (event.agreedAmount ?? 0),
    0,
  )
  const cancellationRate =
    analyticsEvents.length === 0
      ? 0
      : Math.round((analyticsEvents.filter((event) => isCancelled(event.status)).length / analyticsEvents.length) * 100)

  const monthlyRevenue = useMemo(() => {
    const totals = new Map<string, { label: string; revenue: number; count: number }>()

    events.forEach((event) => {
      if (!hasSchedule(event)) return
      if (yearFilter !== 'All' && getEventYear(event) !== yearFilter) return
      if (isCancelled(event.status)) return

      const key = getMonthKey(event.eventDate)
      if (!key) return

      const date = getMonthDate(key)
      const current = totals.get(key) ?? {
        label: shortMonthLabel.format(date),
        revenue: 0,
        count: 0,
      }
      current.revenue += event.agreedAmount ?? 0
      current.count += 1
      totals.set(key, current)
    })

    return Array.from(totals.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-8)
      .map(([, value]) => value)
  }, [events, yearFilter])

  const statusMix = useMemo(() => {
    const totals = new Map<string, { count: number; revenue: number }>()

    events.forEach((event) => {
      if (!hasSchedule(event)) return
      if (yearFilter !== 'All' && getEventYear(event) !== yearFilter) return
      const key = event.status || 'No status'
      const current = totals.get(key) ?? { count: 0, revenue: 0 }
      current.count += 1
      current.revenue += event.agreedAmount ?? 0
      totals.set(key, current)
    })

    return Array.from(totals.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 7)
  }, [events, yearFilter])

  const eventTypeRevenue = useMemo(() => {
    const totals = new Map<string, { count: number; revenue: number }>()

    events.forEach((event) => {
      if (!hasSchedule(event)) return
      if (yearFilter !== 'All' && getEventYear(event) !== yearFilter) return
      if (isCancelled(event.status)) return

      const key = event.eventType || 'Unspecified'
      const current = totals.get(key) ?? { count: 0, revenue: 0 }
      current.count += 1
      current.revenue += event.agreedAmount ?? 0
      totals.set(key, current)
    })

    return Array.from(totals.entries())
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .slice(0, 7)
  }, [events, yearFilter])

  const packageRevenue = useMemo(() => {
    const totals = new Map<string, { count: number; revenue: number }>()

    events.forEach((event) => {
      if (!hasSchedule(event)) return
      if (yearFilter !== 'All' && getEventYear(event) !== yearFilter) return
      if (isCancelled(event.status)) return

      const key = event.packageName || 'Unspecified'
      const current = totals.get(key) ?? { count: 0, revenue: 0 }
      current.count += 1
      current.revenue += event.agreedAmount ?? 0
      totals.set(key, current)
    })

    return Array.from(totals.entries())
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .slice(0, 7)
  }, [events, yearFilter])

const topLocations = useMemo(() => {
    const totals = new Map<string, number>()

    events.forEach((event) => {
      if (!hasSchedule(event)) return
      if (yearFilter !== 'All' && getEventYear(event) !== yearFilter) return
      if (isCancelled(event.status)) return

      const key = event.location || 'Unspecified'
      totals.set(key, (totals.get(key) ?? 0) + 1)
    })

    return Array.from(totals.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
  }, [events, yearFilter])

  const sourceRevenue = useMemo(() => {
    const totals = new Map<string, { count: number; revenue: number }>()

    events.forEach((event) => {
      if (!hasSchedule(event)) return
      if (yearFilter !== 'All' && getEventYear(event) !== yearFilter) return
      if (isCancelled(event.status)) return

      const key = event.bookingSource || 'Unknown'
      const current = totals.get(key) ?? { count: 0, revenue: 0 }
      current.count += 1
      current.revenue += event.agreedAmount ?? 0
      totals.set(key, current)
    })

    return Array.from(totals.entries())
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .slice(0, 6)
  }, [events, yearFilter])

  const pipelineMix = useMemo(() => {
    const totals = new Map<string, { count: number; revenue: number }>()

    events.forEach((event) => {
      if (!hasSchedule(event)) return
      if (yearFilter !== 'All' && getEventYear(event) !== yearFilter) return

      const key = event.pipelineStage || inferPipelineStage(event.status)
      const current = totals.get(key) ?? { count: 0, revenue: 0 }
      current.count += 1
      current.revenue += event.agreedAmount ?? 0
      totals.set(key, current)
    })

    return pipelineStages
      .map((stage) => [stage, totals.get(stage) ?? { count: 0, revenue: 0 }] as const)
      .filter(([, value]) => value.count > 0)
  }, [events, yearFilter])

  const yearlyPipeline = useMemo(() => {
    const totals = new Map<string, { revenue: number; count: number }>()

    events.forEach((event) => {
      if (!hasSchedule(event)) return
      if (isCancelled(event.status)) return

      const year = getEventYear(event)
      const current = totals.get(year) ?? { revenue: 0, count: 0 }
      current.revenue += event.agreedAmount ?? 0
      current.count += 1
      totals.set(year, current)
    })

    return Array.from(totals.entries()).sort(([a], [b]) => a.localeCompare(b))
  }, [events])

  const clientSummaries = useMemo(() => {
    const groups = new Map<string, EventRecord[]>()

    events.forEach((event) => {
      const key = event.clientName || 'No client'
      groups.set(key, [...(groups.get(key) ?? []), event])
    })

    return Array.from(groups.entries())
      .map(([name, records]) => summarizeGroup(name, records, { topLocation: true }))
      .sort((a, b) => b.revenue - a.revenue)
  }, [events])

  const venueSummaries = useMemo(() => {
    const groups = new Map<string, EventRecord[]>()

    events.forEach((event) => {
      const key = event.location || 'No location'
      groups.set(key, [...(groups.get(key) ?? []), event])
    })

    return Array.from(groups.entries())
      .map(([name, records]) => summarizeGroup(name, records, { topClient: true }))
      .sort((a, b) => b.revenue - a.revenue)
  }, [events])

  const selectedMonthEvents = useMemo(
    () =>
      events
        .filter((event) => getMonthKey(event.eventDate) === selectedMonth)
        .sort((a, b) => (a.eventDate || '').localeCompare(b.eventDate || '')),
    [events, selectedMonth],
  )

  const calendarDays = useMemo(() => {
    const monthDate = getMonthDate(selectedMonth)
    const firstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
    const lastDay = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0)
    const cells: Array<{ date: Date | null; events: EventRecord[] }> = []

    for (let i = 0; i < firstDay.getDay(); i += 1) {
      cells.push({ date: null, events: [] })
    }

    for (let day = 1; day <= lastDay.getDate(); day += 1) {
      const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), day)
      const key = getDateKey(date)
      cells.push({
        date,
        events: selectedMonthEvents.filter((event) => event.eventDate === key),
      })
    }

    while (cells.length % 7 !== 0) {
      cells.push({ date: null, events: [] })
    }

    return cells
  }, [selectedMonth, selectedMonthEvents])

  const openCreateDialog = () => {
    setEditingEvent(null)
    setDialogOpen(true)
  }

  const openEditDialog = (event: EventRecord) => {
    setEditingEvent(event)
    setDialogOpen(true)
  }

  const handleDelete = async (eventId: string) => {
    setDeletingEventId(eventId)
    setEventsError('')

    try {
      await deleteEventFromApi(eventId)
      setCalendarEventDetails((current) => (current?.id === eventId ? null : current))
      setEventsRevision((current) => current + 1)
      setFacetsRevision((current) => current + 1)
    } catch (error) {
      setEventsError(error instanceof Error ? error.message : 'Failed to delete event')
    } finally {
      setDeletingEventId('')
    }
  }

  const handleSaveEvent = async (values: EventFormValues) => {
    const nextEvent: EventRecord = {
      ...values,
      id: editingEvent?.id ?? `evt-${Date.now()}`,
      agreedAmount: parseAmountInput(values.agreedAmount),
      amountPaid: parseAmountInput(values.amountPaid),
    }

    setSavingEvent(true)
    setEventsError('')

    try {
      await saveEventToApi(nextEvent, editingEvent?.id)
      setDialogOpen(false)
      setEditingEvent(null)
      setEventsRevision((current) => current + 1)
      setFacetsRevision((current) => current + 1)
    } catch (error) {
      setEventsError(error instanceof Error ? error.message : 'Failed to save event')
    } finally {
      setSavingEvent(false)
    }
  }

  const maxMonthlyRevenue = Math.max(...monthlyRevenue.map((item) => item.revenue), 1)
  const maxStatusCount = Math.max(...statusMix.map(([, value]) => value.count), 1)
  const maxEventTypeRevenue = Math.max(
    ...eventTypeRevenue.map(([, value]) => value.revenue),
    1,
  )
  const maxPackageRevenue = Math.max(
    ...packageRevenue.map(([, value]) => value.revenue),
    1,
  )
  const maxLocationCount = Math.max(...topLocations.map(([, count]) => count), 1)
  const maxSourceRevenue = Math.max(
    ...sourceRevenue.map(([, value]) => value.revenue),
    1,
  )
  const maxPipelineCount = Math.max(
    ...pipelineMix.map(([, value]) => value.count),
    1,
  )
  const maxYearlyPipeline = Math.max(
    ...yearlyPipeline.map(([, value]) => value.revenue),
    1,
  )
  const averageCompletedBooking = average(completedRevenue, doneEvents.length)
  const doneRate = analyticsEvents.length
    ? Math.round((doneEvents.length / analyticsEvents.length) * 100)
    : 0

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <Box
      sx={{
        '--page': theme.page,
        '--pageGlow': theme.pageGlow,
        '--panel': theme.panel,
        '--panelSoft': theme.panelSoft,
        '--elevated': theme.elevated,
        '--text': theme.text,
        '--muted': theme.muted,
        '--faint': theme.faint,
        '--border': theme.border,
        '--borderSoft': theme.borderSoft,
        '--primary': theme.primary,
        '--primaryHover': theme.primaryHover,
        '--primaryText': theme.primaryText,
        '--accent': theme.accent,
        '--accent2': theme.accent2,
        '--accent3': theme.accent3,
        '--field': theme.field,
        '--shadow': theme.shadow,
        minHeight: '100vh',
        backgroundColor: 'var(--page)',
        backgroundImage: 'var(--pageGlow)',
        color: 'var(--text)',
        transition: 'background-color 180ms ease, color 180ms ease',
        '& .MuiOutlinedInput-root': {
          background: 'var(--field)',
          color: 'var(--text)',
          borderRadius: '10px',
          '& fieldset': {
            borderColor: 'var(--border)',
          },
          '&:hover fieldset': {
            borderColor: 'var(--accent)',
          },
          '&.Mui-focused fieldset': {
            borderColor: 'var(--accent)',
          },
        },
        '& .MuiInputLabel-root, & .MuiSelect-icon': {
          color: 'var(--muted)',
        },
        '& .MuiInputLabel-root.Mui-focused': {
          color: 'var(--accent)',
        },
        '& input, & textarea': {
          color: 'var(--text)',
        },
      }}
      >
      <Box sx={{ maxWidth: 1440, margin: '0 auto', padding: { xs: 2, md: 3, lg: 4 } }}>
        <Box
          component={Card}
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            gap: '1rem',
            alignItems: { md: 'flex-end' },
            marginBottom: 2.5,
            borderRadius: 4,
            background:
              'linear-gradient(135deg, color-mix(in srgb, var(--panel) 82%, var(--accent) 18%), var(--panel))',
            padding: { xs: 2.5, md: 3.25 },
          }}
        >
          <Box>
            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 650,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--accent)',
              }}
            >
              Legato Operations
            </Typography>
            <Typography
              component='h1'
              sx={{
                fontSize: { xs: 29, md: 36 },
                lineHeight: 1,
                fontWeight: 720,
                letterSpacing: 0,
                marginTop: '0.35rem',
                color: 'var(--text)',
              }}
            >
              Event Business Tracker
            </Typography>
            <Typography sx={{ color: 'var(--muted)', marginTop: '0.55rem', maxWidth: 620 }}>
              Track events, booking status, revenue, packages, and the working calendar from one local-state dashboard.
            </Typography>
          </Box>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <Button
              variant='outlined'
              startIcon={colorMode === 'light' ? <FiMoon /> : <FiSun />}
              onClick={() =>
                setColorMode((current) => (current === 'light' ? 'dark' : 'light'))
              }
              sx={{
                borderColor: 'var(--border)',
                color: 'var(--text)',
                background: 'color-mix(in srgb, var(--panel) 78%, transparent)',
                borderRadius: '10px',
                fontWeight: 650,
                textTransform: 'none',
                minHeight: 42,
                '&:hover': {
                  borderColor: 'var(--accent)',
                  background: 'var(--panelSoft)',
                },
              }}
            >
              {colorMode === 'light' ? 'Dark' : 'Light'}
            </Button>
            <Button
              component={RouterLink}
              to='/invoice-templates'
              variant='outlined'
              startIcon={<FiFileText />}
              sx={{
                borderColor: 'var(--border)',
                color: 'var(--text)',
                background: 'color-mix(in srgb, var(--panel) 78%, transparent)',
                borderRadius: '10px',
                fontWeight: 620,
                textTransform: 'none',
                minHeight: 42,
                '&:hover': {
                  borderColor: 'var(--accent)',
                  background: 'var(--panelSoft)',
                },
              }}
            >
              Invoice maker
            </Button>
            <Button
              variant='contained'
              startIcon={<FiPlus />}
              onClick={openCreateDialog}
              disabled={eventsLoading}
              sx={{
                background: 'linear-gradient(135deg, var(--accent), var(--accent3))',
                color: 'var(--primaryText)',
                borderRadius: '10px',
                boxShadow: 'none',
                fontWeight: 650,
                textTransform: 'none',
                minHeight: 42,
                '&:hover': {
                  background: 'linear-gradient(135deg, var(--primaryHover), var(--accent3))',
                  boxShadow: 'none',
                },
              }}
            >
              Add event
            </Button>
          </Stack>
        </Box>

        {eventsError ? (
          <Card sx={{ mb: 2, borderColor: '#f43f5e', background: 'color-mix(in srgb, #f43f5e 8%, var(--panel))' }}>
            <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Typography sx={{ color: '#f43f5e', fontWeight: 650 }}>
                {eventsError}
              </Typography>
            </CardContent>
          </Card>
        ) : null}

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
            gap: 1.5,
            marginBottom: 2,
          }}
        >
          <DashboardMetric label='Active pipeline' value={peso.format(activeRevenue)} detail={`${activeEvents.length} non-cancelled scheduled events`} accent='var(--accent)' />
          <DashboardMetric label='Unpaid balance' value={peso.format(unpaidBalance)} detail='Estimated receivables from active events' accent='#f43f5e' />
          <DashboardMetric label='Upcoming 30 days' value={String(upcoming30Events.length)} detail='Scheduled active events needing prep' accent='var(--accent2)' />
          <DashboardMetric label='Needs data' value={String(needsDataEvents.length)} detail='Missing amount, schedule, client, type, package, or venue' accent='var(--accent3)' />
        </Box>

        <Box
          component={Card}
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 0.75,
            background: 'var(--panel)',
            borderRadius: 3,
            padding: 0.75,
            marginBottom: 1.5,
            alignItems: 'center',
          }}
        >
          {[
            ['events', FiFileText, 'Events'],
            ['calendar', FiCalendar, 'Calendar'],
            ['analytics', FiBarChart2, 'Analytics'],
            ['clients', FiUsers, 'All Clients'],
            ['venues', FiMapPin, 'All Venues'],
          ].map(([value, Icon, label]) => (
            <Button
              key={value as string}
              variant={viewMode === value ? 'contained' : 'text'}
              onClick={() => {
                const nextView = value as ViewMode
                if (nextView === 'calendar') {
                  setSelectedMonth(getCurrentMonthKey())
                }
                setViewMode(nextView)
              }}
              startIcon={<Icon />}
              sx={{
                flex: { xs: '1 1 100%', sm: '0 0 auto' },
                borderRadius: 2.5,
                color: viewMode === value ? 'white' : 'text.secondary',
                background: viewMode === value ? 'primary.main' : 'transparent',
                fontWeight: 650,
                '&:hover': {
                  background: viewMode === value ? 'primary.dark' : 'action.hover',
                },
              }}
            >
              {label as string}
            </Button>
          ))}
          <Box sx={{ flex: 1 }} />
          <Button
            onClick={(event) => setPropertiesAnchor(event.currentTarget)}
            sx={{
              borderRadius: '10px',
              color: 'var(--muted)',
              fontWeight: 620,
              textTransform: 'none',
              '&:hover': { background: 'var(--panelSoft)' },
            }}
          >
            Properties
          </Button>
          <Button
            sx={{
              borderRadius: '10px',
              color: 'var(--muted)',
              fontWeight: 620,
              textTransform: 'none',
              pointerEvents: 'none',
            }}
          >
            {viewMode === 'clients'
              ? `${clientSummaries.length} clients`
              : viewMode === 'venues'
                ? `${venueSummaries.length} venues`
                : `${eventsTotal} rows`}
          </Button>
        </Box>
        <Menu
          anchorEl={propertiesAnchor}
          open={Boolean(propertiesAnchor)}
          onClose={() => setPropertiesAnchor(null)}
          slotProps={{
            paper: {
              sx: {
                background: 'var(--panel)',
                color: 'var(--text)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '0.35rem',
              },
            },
          }}
        >
          {tableColumns.map((column) => (
            <MenuItem key={column.key} dense>
              <FormControlLabel
                control={
                  <Checkbox
                    size='small'
                    checked={visibleColumns[column.key]}
                    onChange={(event) =>
                      setVisibleColumns((current) => ({
                        ...current,
                        [column.key]: event.target.checked,
                      }))
                    }
                  />
                }
                label={column.label}
                sx={{
                  margin: 0,
                  '& .MuiFormControlLabel-label': {
                    fontSize: 13,
                    fontWeight: 560,
                  },
                }}
              />
            </MenuItem>
          ))}
        </Menu>

        {viewMode === 'events' ? (
          <Box
            component={Card}
            sx={{
              background: 'var(--panel)',
              borderRadius: 3,
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 1,
                padding: { xs: 1.5, md: 2 },
                borderBottom: '1px solid var(--borderSoft)',
                background: 'var(--panel)',
              }}
            >
              {savedViews.map((item) => (
                <Chip
                  key={item.key}
                  label={item.label}
                  clickable
                  color={savedView === item.key ? 'primary' : 'default'}
                  variant={savedView === item.key ? 'filled' : 'outlined'}
                  onClick={() => {
                    setSavedView(item.key)
                    setPage(0)
                  }}
                  sx={{ borderRadius: 2, px: 0.5 }}
                />
              ))}
            </Box>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1.35fr repeat(5, minmax(130px, 1fr))' },
                gap: 1,
                padding: { xs: 1.5, md: 2 },
                borderBottom: '1px solid var(--borderSoft)',
                background: 'var(--panelSoft)',
              }}
            >
              <TextField
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value)
                  setPage(0)
                }}
                placeholder='Search event, client, type, location, package, source'
                size='small'
                slotProps={{
                  input: {
                    startAdornment: <FiSearch style={{ marginRight: 8, color: 'var(--muted)' }} />,
                  },
                }}
              />
              <TextField
                select
                label='Year'
                value={yearFilter}
                onChange={(event) => {
                  setYearFilter(event.target.value)
                  setPage(0)
                }}
                size='small'
              >
                {yearOptions.map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label='Status'
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(event.target.value)
                  setPage(0)
                }}
                size='small'
              >
                {statusOptions.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label='Type'
                value={eventTypeFilter}
                onChange={(event) => {
                  setEventTypeFilter(event.target.value)
                  setPage(0)
                }}
                size='small'
              >
                {eventTypeOptions.map((eventType) => (
                  <MenuItem key={eventType} value={eventType}>
                    {eventType}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label='Package'
                value={packageFilter}
                onChange={(event) => {
                  setPackageFilter(event.target.value)
                  setPage(0)
                }}
                size='small'
              >
                {packageOptions.map((packageName) => (
                  <MenuItem key={packageName} value={packageName}>
                    {packageName}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label='Sort'
                value={sortField}
                onChange={(event) => setSortField(event.target.value as SortField)}
                size='small'
              >
                {[
                  ['eventDate', 'Event date'],
                  ['name', 'Event name'],
                  ['clientName', 'Client'],
                  ['agreedAmount', 'Amount'],
                  ['status', 'Status'],
                ].map(([value, label]) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label='Order'
                value={sortDirection}
                onChange={(event) => setSortDirection(event.target.value as SortDirection)}
                size='small'
              >
                <MenuItem value='asc'>Ascending</MenuItem>
                <MenuItem value='desc'>Descending</MenuItem>
              </TextField>
              <FormControlLabel
                control={
                  <Checkbox
                    size='small'
                    checked={showUnscheduled}
                    onChange={(event) => {
                      setShowUnscheduled(event.target.checked)
                      setPage(0)
                    }}
                  />
                }
                label='Show unscheduled'
                sx={{
                  alignSelf: 'center',
                  color: 'var(--muted)',
                  '& .MuiFormControlLabel-label': {
                    fontSize: 12.5,
                    fontWeight: 620,
                  },
                }}
              />
            </Box>

            <TableContainer sx={{ maxHeight: 620 }}>
              <Table stickyHeader size='small'>
                <TableHead>
                  <TableRow>
                    {[...visibleTableColumns.map((column) => column.label), ''].map((header) => (
                      <TableCell
                        key={header}
                        sx={{
                          color: 'text.secondary',
                        }}
                      >
                        {header}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {eventsLoading ? (
                    <EventTableSkeletonRows
                      rowCount={rowsPerPage}
                      visibleColumns={visibleColumns}
                    />
                  ) : null}
                  {!eventsLoading && events.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={visibleTableColumns.length + 1} align='center' sx={{ py: 5, color: 'text.secondary' }}>
                        No events match this view.
                      </TableCell>
                    </TableRow>
                  ) : null}
                  {events.map((event) => {
                    const tone = statusTone(event.status)

                    return (
                      <TableRow
                        key={event.id}
                        hover
                        sx={{
                          '& td': {
                            color: 'var(--text)',
                            borderColor: 'var(--borderSoft)',
                            py: 1.3,
                            px: 1.75,
                          },
                          '&:hover td': {
                            background: 'var(--panelSoft)',
                          },
                        }}
                      >
                        {visibleColumns.event ? (
                          <TableCell sx={{ width: 190, maxWidth: 220 }}>
                            <Typography noWrap sx={{ fontSize: 13.5, fontWeight: 650, color: 'var(--text)' }}>{event.name || 'Untitled event'}</Typography>
                            <Typography noWrap sx={{ fontSize: 12, color: 'var(--muted)' }}>
                              {event.notes || 'No notes'}
                            </Typography>
                          </TableCell>
                        ) : null}
                        {visibleColumns.date ? (
                          <TableCell sx={{ whiteSpace: 'nowrap' }}>
                            <Typography sx={{ fontSize: 12.5, fontWeight: 600 }}>{event.eventDate || 'No date'}</Typography>
                            <Typography sx={{ fontSize: 12, color: 'var(--muted)' }}>{event.eventTime || 'No time'}</Typography>
                          </TableCell>
                        ) : null}
                        {visibleColumns.client ? (
                          <TableCell sx={{ width: 150, maxWidth: 170 }}>
                            <Typography noWrap sx={{ fontSize: 12.5, fontWeight: 600 }}>
                              {event.clientName || 'No client'}
                            </Typography>
                          </TableCell>
                        ) : null}
                        {visibleColumns.location ? (
                          <TableCell sx={{ width: 190, maxWidth: 220 }}>
                            <Typography noWrap sx={{ fontSize: 12.5 }}>
                              {event.location || 'No location'}
                            </Typography>
                          </TableCell>
                        ) : null}
                        {visibleColumns.type ? (
                          <TableCell sx={{ width: 120, maxWidth: 130 }}>
                            <Typography noWrap sx={{ fontSize: 12.5 }}>
                              {event.eventType || 'Unspecified'}
                            </Typography>
                          </TableCell>
                        ) : null}
                        {visibleColumns.package ? (
                          <TableCell sx={{ width: 150, maxWidth: 160 }}>
                            <Typography noWrap sx={{ fontSize: 12.5 }}>
                              {event.packageName || 'Unspecified'}
                            </Typography>
                          </TableCell>
                        ) : null}
                        {visibleColumns.amount ? (
                          <TableCell sx={{ fontWeight: 650, whiteSpace: 'nowrap', fontSize: 12.5 }}>
                            {event.agreedAmount == null ? '-' : peso.format(event.agreedAmount)}
                          </TableCell>
                        ) : null}
                        {visibleColumns.balance ? (
                          <TableCell sx={{ fontWeight: 650, whiteSpace: 'nowrap', fontSize: 12.5, color: getBalance(event) > 0 ? '#f43f5e' : 'var(--muted)' }}>
                            {event.agreedAmount == null ? '-' : peso.format(getBalance(event))}
                          </TableCell>
                        ) : null}
                        {visibleColumns.pipeline ? (
                          <TableCell sx={{ minWidth: 130 }}>
                            <Chip
                              label={event.pipelineStage || inferPipelineStage(event.status)}
                              size='small'
                              variant='outlined'
                            />
                          </TableCell>
                        ) : null}
                        {visibleColumns.source ? (
                          <TableCell sx={{ width: 130, maxWidth: 150 }}>
                            <Typography noWrap sx={{ fontSize: 12.5 }}>
                              {event.bookingSource || 'Unknown'}
                            </Typography>
                          </TableCell>
                        ) : null}
                        {visibleColumns.status ? (
                          <TableCell>
                            <Chip
                              label={event.status || 'No status'}
                              size='small'
                              sx={{
                                background: tone.bg,
                                color: tone.color,
                                border: `1px solid ${tone.border}`,
                                fontWeight: 620,
                              }}
                            />
                          </TableCell>
                        ) : null}
                        <TableCell align='right'>
                          <IconButton sx={{ color: 'var(--muted)' }} onClick={() => openEditDialog(event)} aria-label={`Edit ${event.name}`}>
                            <FiEdit3 />
                          </IconButton>
                          <IconButton
                            sx={{ color: '#f43f5e' }}
                            onClick={() => void handleDelete(event.id)}
                            disabled={deletingEventId === event.id}
                            aria-label={`Delete ${event.name}`}
                          >
                            <FiTrash2 />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component='div'
              count={eventsTotal}
              page={safePage}
              onPageChange={(_, nextPage) => setPage(nextPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(event) => {
                setRowsPerPage(Number(event.target.value))
                setPage(0)
              }}
              rowsPerPageOptions={[10, 25, 50]}
              sx={{
                color: 'var(--muted)',
                borderTop: '1px solid var(--borderSoft)',
                '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                  fontSize: 12.5,
                },
                '& .MuiSvgIcon-root, & .MuiTablePagination-actions button': {
                  color: 'var(--muted)',
                },
              }}
            />
          </Box>
        ) : null}

        {viewMode === 'calendar' ? (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: '1fr 320px' },
              gap: 2,
            }}
          >
            <Box component={Card} sx={{ background: 'var(--panel)', borderRadius: 3, overflow: 'hidden' }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: { xs: 2, md: 2.5 },
                  borderBottom: '1px solid var(--borderSoft)',
                  background: 'var(--panelSoft)',
                }}
              >
                <Typography sx={{ fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>
                  {monthLabel.format(getMonthDate(selectedMonth))}
                </Typography>
                <TextField
                  type='month'
                  size='small'
                  value={selectedMonth}
                  onChange={(event) => setSelectedMonth(event.target.value)}
                />
              </Box>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
                  borderBottom: '1px solid var(--borderSoft)',
                  background: 'var(--panel)',
                }}
              >
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <Typography
                    key={day}
                    sx={{
                      padding: { xs: 1.1, md: 1.4 },
                      fontSize: 11,
                      fontWeight: 650,
                      color: 'var(--muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                    }}
                  >
                    {day}
                  </Typography>
                ))}
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))' }}>
                {calendarDays.map((cell, index) => (
                  <Box
                    key={`${cell.date?.toISOString() ?? 'blank'}-${index}`}
                    sx={{
                      minHeight: { xs: 92, md: 124 },
                      padding: { xs: 1, md: 1.25 },
                      borderRight: index % 7 === 6 ? 'none' : '1px solid var(--borderSoft)',
                      borderBottom: index >= calendarDays.length - 7 ? 'none' : '1px solid var(--borderSoft)',
                      background: cell.date ? 'var(--panel)' : 'var(--panelSoft)',
                      overflow: 'hidden',
                    }}
                  >
                    {cell.date ? (
                      <>
                        <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)' }}>
                          {cell.date.getDate()}
                        </Typography>
                        <Stack spacing={0.45} sx={{ marginTop: '0.45rem' }}>
                          {cell.events.slice(0, 3).map((event) => (
                            <Box
                              key={event.id}
                              role='button'
                              tabIndex={0}
                              onClick={() => setCalendarEventDetails(event)}
                              onKeyDown={(keyboardEvent) => {
                                if (keyboardEvent.key === 'Enter' || keyboardEvent.key === ' ') {
                                  keyboardEvent.preventDefault()
                                  setCalendarEventDetails(event)
                                }
                              }}
                              sx={{
                                borderLeft: `3px solid ${isCancelled(event.status) ? '#f43f5e' : 'var(--accent)'}`,
                                background: isCancelled(event.status)
                                  ? 'color-mix(in srgb, #f43f5e 12%, var(--panel))'
                                  : 'color-mix(in srgb, var(--accent) 12%, var(--panel))',
                                color: 'var(--text)',
                                padding: '0.42rem 0.55rem',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                outline: 'none',
                                transition: 'transform 120ms ease, background 120ms ease',
                                '&:hover, &:focus-visible': {
                                  transform: 'translateY(-1px)',
                                  background: isCancelled(event.status)
                                    ? 'color-mix(in srgb, #f43f5e 18%, var(--panel))'
                                    : 'color-mix(in srgb, var(--accent) 18%, var(--panel))',
                                },
                              }}
                            >
                              <Typography noWrap sx={{ fontSize: 11.5, fontWeight: 600 }}>
                                {event.name}
                              </Typography>
                            </Box>
                          ))}
                          {cell.events.length > 3 ? (
                            <Typography sx={{ fontSize: 11, color: 'var(--muted)', fontWeight: 560 }}>
                              +{cell.events.length - 3} more
                            </Typography>
                          ) : null}
                        </Stack>
                      </>
                    ) : null}
                  </Box>
                ))}
              </Box>
            </Box>

            <Box component={Card} sx={{ background: 'var(--panel)', borderRadius: 3, padding: { xs: 2, md: 2.5 } }}>
              <Typography sx={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>This month</Typography>
              <Typography sx={{ fontSize: 13, color: 'var(--muted)', marginTop: '0.25rem' }}>
                {selectedMonthEvents.length} events scheduled
              </Typography>
              <Divider sx={{ margin: '1rem 0', borderColor: 'var(--borderSoft)' }} />
              <Stack spacing={1}>
                {selectedMonthEvents.slice(0, 12).map((event) => (
                  <Box
                    key={event.id}
                    role='button'
                    tabIndex={0}
                    onClick={() => setCalendarEventDetails(event)}
                    onKeyDown={(keyboardEvent) => {
                      if (keyboardEvent.key === 'Enter' || keyboardEvent.key === ' ') {
                        keyboardEvent.preventDefault()
                        setCalendarEventDetails(event)
                      }
                    }}
                    sx={{
                      borderBottom: '1px solid var(--borderSoft)',
                      paddingBottom: 1.25,
                      cursor: 'pointer',
                      borderRadius: 1.5,
                      outline: 'none',
                      '&:hover, &:focus-visible': {
                        background: 'var(--panelSoft)',
                      },
                    }}
                  >
                    <Typography sx={{ fontWeight: 650, color: 'var(--text)' }}>{event.name}</Typography>
                    <Typography sx={{ fontSize: 13, color: 'var(--muted)' }}>
                      {event.eventDate} | {event.eventTime || 'No time'}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          </Box>
        ) : null}

        {viewMode === 'analytics' ? (
          <>
            <Box
              component={Card}
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.65rem',
                alignItems: 'center',
                marginBottom: 2,
                background: 'var(--panel)',
                borderRadius: 3,
                padding: { xs: 1.5, md: 2 },
              }}
            >
              <Typography sx={{ fontSize: 13, fontWeight: 650, color: 'var(--text)', marginRight: '0.25rem' }}>
                Pipeline year
              </Typography>
              <TextField
                select
                size='small'
                value={yearFilter}
                onChange={(event) => setYearFilter(event.target.value)}
                sx={{ minWidth: 150 }}
              >
                {yearOptions.map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </TextField>
              <Typography sx={{ fontSize: 12.5, color: 'var(--muted)' }}>
                Analytics exclude records without both date and time.
              </Typography>
            </Box>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', lg: '1.25fr 0.85fr' },
                gap: 2,
              }}
            >
            <AnalyticsCard
              title='Active pipeline by year'
              description='Non-cancelled scheduled revenue grouped by event year.'
            >
              <Stack spacing={1.1} sx={{ marginTop: '1.3rem' }}>
                {yearlyPipeline.map(([year, value]) => (
                  <DataBar
                    key={year}
                    label={year}
                    value={peso.format(value.revenue)}
                    helper={`${value.count} active events | avg ${peso.format(average(value.revenue, value.count))}`}
                    percentage={(value.revenue / maxYearlyPipeline) * 100}
                    color='linear-gradient(90deg, var(--accent3), var(--accent))'
                  />
                ))}
              </Stack>
            </AnalyticsCard>

            <AnalyticsCard
              title='Business composition'
              description='Revenue split by event type for the selected pipeline scope.'
            >
              <DonutChart
                slices={eventTypeRevenue.slice(0, 5).map(([label, value], index) => ({
                  label,
                  value: value.revenue,
                  color: ['#14b8a6', '#4f46e5', '#f59e0b', '#38bdf8', '#f43f5e'][index],
                }))}
              />
            </AnalyticsCard>
            <AnalyticsCard
              title='Monthly revenue'
              description='Non-cancelled agreed amounts over the latest active months.'
            >
              <Box sx={{ display: 'flex', alignItems: 'end', gap: '0.7rem', height: 280, marginTop: '1.4rem' }}>
                {monthlyRevenue.map((item) => (
                  <Box key={item.label} sx={{ flex: 1, minWidth: 0 }}>
                    <Box
                      sx={{
                        height: `${Math.max((item.revenue / maxMonthlyRevenue) * 220, 8)}px`,
                        background: 'linear-gradient(180deg, var(--accent), var(--accent3))',
                        borderRadius: '9px 9px 3px 3px',
                        boxShadow: '0 10px 22px color-mix(in srgb, var(--accent) 25%, transparent)',
                      }}
                    />
                    <Typography noWrap sx={{ fontSize: 11, color: 'var(--muted)', marginTop: '0.5rem', textAlign: 'center' }}>
                      {item.label}
                    </Typography>
                    <Typography noWrap sx={{ fontSize: 12, fontWeight: 650, textAlign: 'center', color: 'var(--text)' }}>
                      {peso.format(item.revenue)}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </AnalyticsCard>

            <AnalyticsCard
              title='Status mix'
              description='Operational state of all records, including cancelled leads.'
            >
              <Stack spacing={1.1} sx={{ marginTop: '1.3rem' }}>
                {statusMix.map(([status, value]) => (
                  <DataBar
                    key={status}
                    label={status}
                    value={`${value.count} events`}
                    helper={peso.format(value.revenue)}
                    percentage={(value.count / maxStatusCount) * 100}
                    color={
                      isCancelled(status)
                        ? 'linear-gradient(90deg, #fb7185, #f43f5e)'
                        : isDone(status)
                          ? 'linear-gradient(90deg, #34d399, var(--accent))'
                          : 'linear-gradient(90deg, var(--accent3), var(--accent))'
                    }
                  />
                ))}
              </Stack>
            </AnalyticsCard>

            <AnalyticsCard
              title='Pipeline stages'
              description='Stage distribution using the standardized sales pipeline.'
            >
              <Stack spacing={1.1} sx={{ marginTop: '1.3rem' }}>
                {pipelineMix.map(([stage, value]) => (
                  <DataBar
                    key={stage}
                    label={stage}
                    value={`${value.count} events`}
                    helper={peso.format(value.revenue)}
                    percentage={(value.count / maxPipelineCount) * 100}
                    color={
                      stage === 'Cancelled' || stage === 'Lost'
                        ? 'linear-gradient(90deg, #fb7185, #f43f5e)'
                        : stage === 'Completed'
                          ? 'linear-gradient(90deg, #34d399, var(--accent))'
                          : 'linear-gradient(90deg, var(--accent3), var(--accent))'
                    }
                  />
                ))}
              </Stack>
            </AnalyticsCard>

            <AnalyticsCard
              title='Revenue by event type'
              description='Which event categories are driving the most non-cancelled revenue.'
            >
              <Stack spacing={1.1} sx={{ marginTop: '1.3rem' }}>
                {eventTypeRevenue.map(([eventType, value]) => (
                  <DataBar
                    key={eventType}
                    label={eventType}
                    value={peso.format(value.revenue)}
                    helper={`${value.count} events | avg ${peso.format(average(value.revenue, value.count))}`}
                    percentage={(value.revenue / maxEventTypeRevenue) * 100}
                    color='linear-gradient(90deg, var(--accent), var(--accent3))'
                  />
                ))}
              </Stack>
            </AnalyticsCard>

            <AnalyticsCard
              title='Revenue by package'
              description='Package-level revenue and average value for active bookings.'
            >
              <Stack spacing={1.1} sx={{ marginTop: '1.3rem' }}>
                {packageRevenue.map(([packageName, value]) => (
                  <DataBar
                    key={packageName}
                    label={packageName}
                    value={peso.format(value.revenue)}
                    helper={`${value.count} events | avg ${peso.format(average(value.revenue, value.count))}`}
                    percentage={(value.revenue / maxPackageRevenue) * 100}
                  />
                ))}
              </Stack>
            </AnalyticsCard>

            <AnalyticsCard
              title='Top locations'
              description='Most repeated active event locations from the tracker.'
            >
              <Stack spacing={1.1} sx={{ marginTop: '1.3rem' }}>
                {topLocations.map(([location, count]) => (
                  <DataBar
                    key={location}
                    label={location}
                    value={`${count} events`}
                    percentage={(count / maxLocationCount) * 100}
                    color='linear-gradient(90deg, #38bdf8, var(--accent3))'
                  />
                ))}
              </Stack>
            </AnalyticsCard>

            <AnalyticsCard
              title='Booking source value'
              description='Where the highest-value active bookings are coming from.'
            >
              <Stack spacing={1.1} sx={{ marginTop: '1.3rem' }}>
                {sourceRevenue.map(([source, value]) => (
                  <DataBar
                    key={source}
                    label={source}
                    value={peso.format(value.revenue)}
                    helper={`${value.count} events | avg ${peso.format(average(value.revenue, value.count))}`}
                    percentage={(value.revenue / maxSourceRevenue) * 100}
                    color='linear-gradient(90deg, #38bdf8, var(--accent))'
                  />
                ))}
              </Stack>
            </AnalyticsCard>

            <AnalyticsCard
              title='Booking quality'
              description='Quick read on completed job value and cancellation pressure.'
            >
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.75rem',
                  marginTop: '1.2rem',
                }}
              >
                {[
                  ['Average completed', peso.format(averageCompletedBooking)],
                  ['Active events', String(activeEvents.length)],
                  ['Cancelled records', String(analyticsEvents.filter((event) => isCancelled(event.status)).length)],
                  ['Cancellation rate', `${cancellationRate}%`],
                  ['Done rate', `${doneRate}%`],
                ].map(([label, value]) => (
                  <Box
                    key={label}
                    sx={{
                      background: 'var(--panelSoft)',
                      border: '1px solid var(--borderSoft)',
                      borderRadius: '12px',
                      padding: '0.8rem',
                    }}
                  >
                    <Typography sx={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {label}
                    </Typography>
                    <Typography sx={{ fontSize: 20, color: 'var(--text)', fontWeight: 700, marginTop: '0.35rem' }}>
                      {value}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </AnalyticsCard>
            </Box>
          </>
        ) : null}

        {viewMode === 'clients' || viewMode === 'venues' ? (
          <Box
            component={Card}
            sx={{
              background: 'var(--panel)',
              borderRadius: 3,
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '1rem',
                alignItems: 'center',
                padding: { xs: 2, md: 2.5 },
                background: 'var(--panelSoft)',
                borderBottom: '1px solid var(--borderSoft)',
              }}
            >
              <Box>
                <Typography sx={{ fontSize: 17, fontWeight: 700, color: 'var(--text)' }}>
                  {viewMode === 'clients' ? 'All Clients' : 'All Venues'}
                </Typography>
                <Typography sx={{ fontSize: 12.5, color: 'var(--muted)', marginTop: '0.15rem' }}>
                  Aggregated relationship value, activity, and booking quality.
                </Typography>
              </Box>
            </Box>
            <TableContainer sx={{ maxHeight: 680 }}>
              <Table stickyHeader size='small'>
                <TableHead>
                  <TableRow>
                    {[
                      viewMode === 'clients' ? 'Client' : 'Venue',
                      'Revenue',
                      'Events',
                      'Active',
                      'Done',
                      'Cancelled',
                      'Avg value',
                      'Latest',
                      viewMode === 'clients' ? 'Top venue' : 'Top client',
                      'Top package',
                      'Top type',
                    ].map((header) => (
                      <TableCell
                        key={header}
                        sx={{
                          fontSize: 11,
                          fontWeight: 650,
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          color: 'var(--muted)',
                          background: 'var(--panelSoft)',
                          borderColor: 'var(--borderSoft)',
                        }}
                      >
                        {header}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(viewMode === 'clients' ? clientSummaries : venueSummaries).map((item) => (
                    <TableRow
                      key={item.name}
                      hover
                      sx={{
                        '& td': {
                          color: 'var(--text)',
                          borderColor: 'var(--borderSoft)',
                          fontSize: 12.5,
                          py: 1.3,
                          px: 1.75,
                        },
                        '&:hover td': {
                          background: 'var(--panelSoft)',
                        },
                      }}
                    >
                      <TableCell sx={{ maxWidth: 260 }}>
                        <Typography noWrap sx={{ fontSize: 13.5, fontWeight: 650, color: 'var(--text)' }}>
                          {item.name}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 650, whiteSpace: 'nowrap' }}>{peso.format(item.revenue)}</TableCell>
                      <TableCell>{item.count}</TableCell>
                      <TableCell>{item.activeCount}</TableCell>
                      <TableCell>{item.doneCount}</TableCell>
                      <TableCell>{item.cancelledCount}</TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>{peso.format(item.averageRevenue)}</TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>{item.latestDate}</TableCell>
                      <TableCell sx={{ maxWidth: 220 }}>
                        <Typography noWrap sx={{ fontSize: 12.5 }}>
                          {viewMode === 'clients' ? item.topLocation : item.topClient}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ maxWidth: 180 }}>
                        <Typography noWrap sx={{ fontSize: 12.5 }}>{item.topPackage}</Typography>
                      </TableCell>
                      <TableCell sx={{ maxWidth: 160 }}>
                        <Typography noWrap sx={{ fontSize: 12.5 }}>{item.topType}</Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        ) : null}
      </Box>

      <Dialog
        open={Boolean(calendarEventDetails)}
        onClose={() => setCalendarEventDetails(null)}
        fullWidth
        maxWidth='sm'
        slotProps={{
          paper: {
            sx: {
              background: theme.panel,
              color: theme.text,
              border: `1px solid ${theme.border}`,
              borderRadius: '18px',
            },
          },
        }}
      >
        {calendarEventDetails ? (
          <>
            <DialogTitle sx={{ pb: 1 }}>
              <Typography sx={{ fontSize: 22, fontWeight: 700, color: theme.text }}>
                {calendarEventDetails.name || 'Untitled event'}
              </Typography>
              <Stack direction='row' spacing={1} sx={{ mt: 1, flexWrap: 'wrap', rowGap: 1 }}>
                <Chip
                  label={calendarEventDetails.status || 'No status'}
                  size='small'
                  sx={{
                    background: statusTone(calendarEventDetails.status).bg,
                    color: statusTone(calendarEventDetails.status).color,
                    border: `1px solid ${statusTone(calendarEventDetails.status).border}`,
                  }}
                />
                <Chip
                  label={calendarEventDetails.pipelineStage || inferPipelineStage(calendarEventDetails.status)}
                  size='small'
                  variant='outlined'
                />
              </Stack>
            </DialogTitle>
            <DialogContent>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                  gap: 1.25,
                  pt: 1,
                }}
              >
                {[
                  ['Date', calendarEventDetails.eventDate || 'No date'],
                  ['Time', calendarEventDetails.eventTime || 'No time'],
                  ['Client', calendarEventDetails.clientName || 'No client'],
                  ['Venue', calendarEventDetails.location || 'No location'],
                  ['Event type', calendarEventDetails.eventType || 'Unspecified'],
                  ['Package', calendarEventDetails.packageName || 'Unspecified'],
                  ['Agreed amount', calendarEventDetails.agreedAmount == null ? '-' : peso.format(calendarEventDetails.agreedAmount)],
                  ['Amount paid', calendarEventDetails.amountPaid == null ? '-' : peso.format(calendarEventDetails.amountPaid)],
                  ['Balance', calendarEventDetails.agreedAmount == null ? '-' : peso.format(getBalance(calendarEventDetails))],
                  ['Payment due', calendarEventDetails.paymentDueDate || 'No due date'],
                  ['Booking source', calendarEventDetails.bookingSource || 'Unknown'],
                ].map(([label, value]) => (
                  <Box
                    key={label}
                    sx={{
                      background: theme.panelSoft,
                      border: `1px solid ${theme.borderSoft}`,
                      borderRadius: 2,
                      p: 1.5,
                    }}
                  >
                    <Typography sx={{ fontSize: 11, color: theme.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {label}
                    </Typography>
                    <Typography sx={{ mt: 0.35, fontSize: 14, color: theme.text, fontWeight: 600 }}>
                      {value}
                    </Typography>
                  </Box>
                ))}
                <Box
                  sx={{
                    gridColumn: '1 / -1',
                    background: theme.panelSoft,
                    border: `1px solid ${theme.borderSoft}`,
                    borderRadius: 2,
                    p: 1.5,
                  }}
                >
                  <Typography sx={{ fontSize: 11, color: theme.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Notes
                  </Typography>
                  <Typography sx={{ mt: 0.35, fontSize: 14, color: theme.text, whiteSpace: 'pre-wrap' }}>
                    {calendarEventDetails.notes || 'No notes'}
                  </Typography>
                </Box>
              </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2.5 }}>
              <Button
                variant='outlined'
                onClick={() => setCalendarEventDetails(null)}
                sx={{ borderColor: theme.border, color: theme.text }}
              >
                Close
              </Button>
              <Button
                variant='contained'
                startIcon={<FiEdit3 />}
                onClick={() => {
                  openEditDialog(calendarEventDetails)
                  setCalendarEventDetails(null)
                }}
              >
                Edit event
              </Button>
            </DialogActions>
          </>
        ) : null}
      </Dialog>

      {dialogOpen ? (
        <EventDialog
          key={editingEvent?.id ?? 'new-event'}
          editingEvent={editingEvent}
          savingEvent={savingEvent}
          theme={theme}
          onClose={() => setDialogOpen(false)}
          onSave={handleSaveEvent}
        />
      ) : null}
      </Box>
    </ThemeProvider>
  )
}

export default BusinessManager
