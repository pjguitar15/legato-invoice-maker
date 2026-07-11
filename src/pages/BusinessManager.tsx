import { useDeferredValue, useEffect, useMemo, useState, type FormEvent, type MouseEvent, type ReactNode } from 'react'
import { useDragScroll } from '../hooks/useDragScroll'
import {
  Autocomplete,
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
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { alpha, createTheme, ThemeProvider } from '@mui/material/styles'
import { Link as RouterLink, useNavigate } from 'react-router'
import {
  FiBarChart2,
  FiCalendar,
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
  FiCircle,
  FiCopy,
  FiLogOut,
  FiMapPin,
  FiUsers,
  FiEdit3,
  FiDollarSign,
  FiFilter,
  FiFileText,
  FiMoon,
  FiPlus,
  FiSearch,
  FiSun,
  FiTrash2,
  FiX,
} from 'react-icons/fi'

const expenseTypes = [
  'Crew salary',
  'Crew food',
  'Gas',
  'Toll Fee/RFID',
  'Lalamove',
  'Reinforcements',
  'Others',
] as const

type ExpenseType = (typeof expenseTypes)[number]

type EventExpense = {
  id: string
  type: ExpenseType
  amount: number
  note: string
  crewId: string
  crewName: string
}

type EventExpenseFormValue = Omit<EventExpense, 'amount'> & { amount: string }
type EventOptionKind = 'eventType' | 'package' | 'crew'
type NewEventOption = { inputValue: string; label: string; isNew: true }
type CrewMember = { id: string; name: string }

type EventRecord = {
  id: string
  name: string
  agreedAmount: number | null
  amountPaid: number | null
  bookingSource: string
  clientName: string
  eventDate: string
  eventEndDate: string
  eventType: string
  eventTime: string
  expenses: EventExpense[]
  expenseCount: number
  expenseTotal: number
  location: string
  notes: string
  packageName: string
  pipelineStage: string
  status: string
  recurringSeriesId: string
}

type EventFormValues = Omit<EventRecord, 'id' | 'agreedAmount' | 'amountPaid' | 'expenses' | 'expenseCount' | 'expenseTotal' | 'recurringSeriesId'> & {
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
  | 'paid'
  | 'balance'
  | 'expenses'
  | 'income'
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
  hideDone: boolean
  packageFilter: string
  page: number
  query: string
  rowsPerPage: number
  savedView: SavedView
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
  crews: CrewMember[]
  eventTypes: string[]
  packages: string[]
  statuses: string[]
  years: string[]
}

type EventSummary = {
  activeCount: number
  bookedValue: number
  completedRevenue: number
  totalExpenses: number
  scheduledCount: number
  currentMonthRevenue: number
  topClient: string
  topClientRevenue: number
  averageMonthlyRevenue: number
  strongestMonth: string
  strongestMonthRevenue: number
  weakestMonth: string
  weakestMonthRevenue: number
}

type CrewPayrollSummary = {
  crewId: string
  crewName: string
  totalIncome: number
  paymentCount: number
  eventCount: number
}

type CrewPayrollRecord = {
  eventId: string
  eventName: string
  eventDate: string
  crewId: string
  crewName: string
  amount: number
  note: string
}

const tableColumns: Array<{ key: ColumnKey; label: string }> = [
  { key: 'event', label: 'Event' },
  { key: 'date', label: 'Date' },
  { key: 'client', label: 'Client' },
  { key: 'location', label: 'Location' },
  { key: 'type', label: 'Type' },
  { key: 'package', label: 'Package' },
  { key: 'amount', label: 'Amount' },
  { key: 'paid', label: 'Paid' },
  { key: 'balance', label: 'Balance' },
  { key: 'expenses', label: 'Total Expenses' },
  { key: 'income', label: 'Income' },
  { key: 'source', label: 'Source' },
  { key: 'status', label: 'Status' },
]

const eventStatuses = [
  'Inquiry',
  'Quoted',
  'Pencil Book',
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
  { key: 'unpaid', label: 'Has balance' },
  { key: 'needsData', label: 'Needs data' },
  { key: 'completed', label: 'Done' },
]

const managerThemes = {
  light: {
    page: '#f6f7f9',
    pageGlow:
      'linear-gradient(180deg, rgba(15, 23, 42, 0.035), transparent 260px)',
    panel: '#ffffff',
    panelSoft: '#f4f6f8',
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
    shadow: '0 12px 32px rgba(15, 23, 42, 0.07)',
  },
  dark: {
    page: '#080b12',
    pageGlow:
      'linear-gradient(180deg, rgba(45, 212, 191, 0.08), transparent 280px)',
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
  { name: 'eventDate', label: 'Start date' },
  { name: 'eventEndDate', label: 'End date' },
  { name: 'eventTime', label: 'Ingress time' },
  { name: 'eventType', label: 'Event type' },
  { name: 'packageName', label: 'Package' },
  { name: 'agreedAmount', label: 'Agreed amount' },
  { name: 'amountPaid', label: 'Amount paid' },
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
      borderRadius: 6,
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
            borderRadius: 8,
            boxShadow: 'none',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 8,
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
            borderRadius: 8,
            backgroundImage: 'none',
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 8,
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
            borderRadius: 6,
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

const getLocalDateInputValue = (date = new Date()) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const emptyForm: EventFormValues = {
  name: '',
  agreedAmount: '',
  amountPaid: '',
  bookingSource: 'Unknown',
  clientName: '',
  eventDate: getLocalDateInputValue(),
  eventEndDate: getLocalDateInputValue(),
  eventType: '',
  eventTime: '',
  location: '',
  notes: '',
  packageName: '',
  pipelineStage: 'Booked',
  status: 'Booked',
}

const formatYearMonth = (ym: string) => {
  if (!ym || ym === '-') return '-'
  const [year, month] = ym.split('-')
  return new Date(Number(year), Number(month) - 1, 1).toLocaleString('default', { month: 'long', year: 'numeric' })
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

const tableDateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
})

const formatTableDate = (value: string) => {
  if (!value) return 'No date'

  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) return value

  const [, year, month, day] = match
  const date = new Date(Number(year), Number(month) - 1, Number(day))
  return Number.isNaN(date.getTime()) ? value : tableDateFormatter.format(date)
}

const formatEventDateRange = (event: Pick<EventRecord, 'eventDate' | 'eventEndDate'>) => {
  if (!event.eventEndDate || event.eventEndDate === event.eventDate) {
    return formatTableDate(event.eventDate)
  }
  return `${formatTableDate(event.eventDate)} – ${formatTableDate(event.eventEndDate)}`
}

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

const toTimeInputValue = (value: string) => {
  const normalized = value.trim()
  if (/^([01]\d|2[0-3]):[0-5]\d$/.test(normalized)) return normalized

  const match = normalized.match(/^(1[0-2]|0?\d)(?::([0-5]\d))?\s*(am|pm)/i)
  if (!match) return ''

  let hours = Number(match[1]) % 12
  if (match[3].toLowerCase() === 'pm') hours += 12
  return `${String(hours).padStart(2, '0')}:${match[2] || '00'}`
}

const formatIngressTime = (value: string) => {
  const timeValue = toTimeInputValue(value)
  if (!timeValue) return value || 'Not set'
  const [hours, minutes] = timeValue.split(':').map(Number)
  return new Intl.DateTimeFormat('en-PH', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(2000, 0, 1, hours, minutes))
}

const formatCrewEventBrief = (event: EventRecord) => [
  'CREW EVENT BRIEF',
  '',
  `Event: ${event.name || 'Untitled event'}`,
  `Date: ${formatEventDateRange(event)}`,
  `Ingress: ${formatIngressTime(event.eventTime)}`,
  `Venue: ${event.location || 'Not set'}`,
  `Event type: ${event.eventType || 'Not set'}`,
  `Package: ${event.packageName || 'Not set'}`,
  `Status: ${event.status || 'Not set'}`,
].join('\n')

const copyTextToClipboard = async (text: string) => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }

  const textArea = document.createElement('textarea')
  textArea.value = text
  textArea.style.position = 'fixed'
  textArea.style.opacity = '0'
  document.body.appendChild(textArea)
  textArea.select()
  const copied = document.execCommand('copy')
  textArea.remove()
  if (!copied) throw new Error('Copy is not supported by this browser')
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
  eventEndDate: event.eventEndDate || event.eventDate || '',
  eventType: event.eventType || '',
  eventTime: event.eventTime || '',
  expenses: Array.isArray(event.expenses)
    ? event.expenses.map((expense) => ({
        id: expense.id,
        type: expenseTypes.includes(expense.type) ? expense.type : 'Others',
        amount: typeof expense.amount === 'number' && Number.isFinite(expense.amount) ? expense.amount : 0,
        note: expense.note || '',
        crewId: expense.crewId || '',
        crewName: expense.crewName || '',
      }))
    : [],
  expenseCount: typeof event.expenseCount === 'number' ? event.expenseCount : event.expenses?.length ?? 0,
  expenseTotal: typeof event.expenseTotal === 'number'
    ? event.expenseTotal
    : event.expenses?.reduce((total, expense) => total + (Number(expense.amount) || 0), 0) ?? 0,
  location: event.location || '',
  notes: event.notes || '',
  packageName: event.packageName || '',
  pipelineStage: event.pipelineStage || inferPipelineStage(event.status || ''),
  status: event.status || 'No status',
  recurringSeriesId: event.recurringSeriesId || '',
})

const toFormValues = (event: EventRecord): EventFormValues => ({
  ...event,
  eventTime: toTimeInputValue(event.eventTime),
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
    sortDirection: params.sortDirection,
    sortField: params.sortField,
  })

  if (params.query.trim()) searchParams.set('q', params.query.trim())
  if (params.yearFilter !== 'All') searchParams.set('year', params.yearFilter)
  if (params.statusFilter !== 'All') searchParams.set('status', params.statusFilter)
  if (params.packageFilter !== 'All') searchParams.set('packageName', params.packageFilter)
  if (params.eventTypeFilter !== 'All') searchParams.set('eventType', params.eventTypeFilter)
  if (params.hideDone && params.savedView !== 'completed') searchParams.set('hideDone', 'true')

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

const fetchCompletedIncomeBreakdownFromApi = async (yearFilter: string, signal?: AbortSignal) => {
  const limit = 100
  const records: EventRecord[] = []
  let page = 0
  let total = 0

  do {
    const result = await fetchEventsFromApi(
      {
        eventTypeFilter: 'All',
        hideDone: false,
        packageFilter: 'All',
        page,
        query: '',
        rowsPerPage: limit,
        savedView: 'completed',
        sortDirection: 'desc',
        sortField: 'eventDate',
        statusFilter: 'All',
        yearFilter,
      },
      signal,
    )

    records.push(...result.data)
    total = result.meta.total
    page += 1
    if (result.data.length === 0) break
  } while (records.length < total)

  return records.filter((event) => !isCancelled(event.status))
}

const fetchEventFacetsFromApi = async (signal?: AbortSignal) => {
  const response = await fetch('/api/events/facets', { signal })

  if (!response.ok) {
    throw new Error(await readApiError(response))
  }

  const body = (await response.json()) as { data?: Partial<EventFacets> }

  return {
    crews: body.data?.crews ?? [],
    eventTypes: body.data?.eventTypes ?? [],
    packages: body.data?.packages ?? [],
    statuses: body.data?.statuses ?? [],
    years: body.data?.years ?? [],
  }
}

const fetchEventSummaryFromApi = async (yearFilter: string, signal?: AbortSignal) => {
  const searchParams = new URLSearchParams()
  if (yearFilter !== 'All') searchParams.set('year', yearFilter)

  const response = await fetch(`/api/events/summary?${searchParams.toString()}`, { signal })

  if (!response.ok) {
    throw new Error(await readApiError(response))
  }

  const body = (await response.json()) as { data?: Partial<EventSummary> }

  const d = body.data
  return {
    activeCount: d?.activeCount ?? 0,
    bookedValue: d?.bookedValue ?? 0,
    completedRevenue: d?.completedRevenue ?? 0,
    totalExpenses: d?.totalExpenses ?? 0,
    scheduledCount: d?.scheduledCount ?? 0,
    currentMonthRevenue: d?.currentMonthRevenue ?? 0,
    topClient: d?.topClient ?? '-',
    topClientRevenue: d?.topClientRevenue ?? 0,
    averageMonthlyRevenue: d?.averageMonthlyRevenue ?? 0,
    strongestMonth: d?.strongestMonth ?? '-',
    strongestMonthRevenue: d?.strongestMonthRevenue ?? 0,
    weakestMonth: d?.weakestMonth ?? '-',
    weakestMonthRevenue: d?.weakestMonthRevenue ?? 0,
  }
}

const saveEventToApi = async (event: EventRecord, editingId?: string, repeatWeekly = false) => {
  const response = await fetch(editingId ? `/api/events/${editingId}` : '/api/events', {
    method: editingId ? 'PUT' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...event, repeatWeekly }),
  })

  if (!response.ok) {
    throw new Error(await readApiError(response))
  }

  const body = (await response.json()) as { data?: Partial<EventRecord> }
  return normalizeEventRecord(body.data ?? event)
}

const createEventOption = async (kind: EventOptionKind, value: string) => {
  const response = await fetch('/api/events/options', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ kind, value }),
  })
  if (!response.ok) throw new Error(await readApiError(response))
  const body = (await response.json()) as { data: { id: string; kind: EventOptionKind; value: string } }
  return body.data
}

const deleteEventOption = async (kind: EventOptionKind, value: string) => {
  const response = await fetch(`/api/events/options/${kind}?value=${encodeURIComponent(value)}`, {
    method: 'DELETE',
  })
  if (!response.ok) throw new Error(await readApiError(response))
}

const fetchCrewPayrollFromApi = async (yearFilter: string, signal?: AbortSignal) => {
  const searchParams = new URLSearchParams()
  if (yearFilter !== 'All') searchParams.set('year', yearFilter)
  const response = await fetch(`/api/events/analytics/crew?${searchParams.toString()}`, { signal })
  if (!response.ok) throw new Error(await readApiError(response))
  const body = (await response.json()) as {
    data?: { crews?: CrewPayrollSummary[]; records?: CrewPayrollRecord[] }
  }
  return {
    crews: body.data?.crews ?? [],
    records: body.data?.records ?? [],
  }
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
const shiftMonthKey = (monthKey: string, offset: number) => {
  const monthDate = getMonthDate(monthKey)
  return getDateKey(new Date(monthDate.getFullYear(), monthDate.getMonth() + offset, 1)).slice(0, 7)
}

const average = (total: number, count: number) =>
  count === 0 ? 0 : Math.round(total / count)

const hasSchedule = (event: EventRecord) => Boolean(event.eventDate.trim())

const getBalance = (event: EventRecord) =>
  Math.max((event.agreedAmount ?? 0) - (event.amountPaid ?? 0), 0)

const getIncome = (event: EventRecord) =>
  (event.agreedAmount ?? 0) - event.expenseTotal

const getGross = (records: EventRecord[]) =>
  records.reduce((sum, event) => sum + (event.agreedAmount ?? 0), 0)

const getExpenses = (records: EventRecord[]) =>
  records.reduce((sum, event) => sum + event.expenseTotal, 0)

const formatPercent = (part: number, total: number) =>
  total > 0 ? `${Math.round((part / total) * 100)}%` : '0%'

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
  if (normalizeStatus(status) === 'pencil book') {
    return { bg: '#f5eadc', color: '#7c4a21', border: '#d6b98c' }
  }
  if (isDone(status)) return { bg: '#ecfdf3', color: '#027a48', border: '#abefc6' }
  if (isCancelled(status)) return { bg: '#fff1f3', color: '#c01048', border: '#fecdd6' }
  return { bg: '#eff8ff', color: '#175cd3', border: '#b2ddff' }
}

const DashboardMetric = ({
  label,
  value,
  detail,
  accent,
  onClick,
}: {
  label: string
  value: ReactNode
  detail: string
  accent: string
  onClick?: () => void
}) => (
  <Card
    role={onClick ? 'button' : undefined}
    tabIndex={onClick ? 0 : undefined}
    onClick={onClick}
    onKeyDown={(event) => {
      if (!onClick) return
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        onClick()
      }
    }}
    sx={{
      position: 'relative',
      borderRadius: '8px',
      background: 'var(--panel)',
      minWidth: { xs: 'min(78vw, 280px)', sm: 0 },
      scrollSnapAlign: { xs: 'start', sm: 'none' },
      overflow: 'hidden',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'border-color 160ms ease, transform 160ms ease',
      '&:hover': onClick
        ? {
            borderColor: 'var(--accent)',
            transform: 'translateY(-1px)',
          }
        : undefined,
      '&:focus-visible': onClick
        ? {
            outline: '2px solid var(--accent)',
            outlineOffset: 2,
          }
        : undefined,
      '&::before': {
        content: '""',
        position: 'absolute',
        inset: '0 auto 0 0',
        width: 5,
        background: accent,
      },
    }}
  >
    <CardContent sx={{ padding: { xs: 1.75, md: 2.5 }, '&:last-child': { paddingBottom: { xs: 1.75, md: 2.5 } } }}>
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
        component='div'
        sx={{
          fontSize: { xs: 22, md: 30 },
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
      borderRadius: '8px',
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
        <TableCell sx={{ width: 44, px: 1 }}>
          <TableSkeletonLine width={24} height={24} />
        </TableCell>
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
        {visibleColumns.paid ? (
          <TableCell>
            <TableSkeletonLine width={70} />
          </TableCell>
        ) : null}
        {visibleColumns.balance ? (
          <TableCell>
            <TableSkeletonLine width={70} />
          </TableCell>
        ) : null}
        {visibleColumns.expenses ? (
          <TableCell>
            <TableSkeletonLine width={82} />
          </TableCell>
        ) : null}
        {visibleColumns.income ? (
          <TableCell>
            <TableSkeletonLine width={76} />
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
  crewOptions,
  editingEvent,
  eventTypeOptions,
  initialTab,
  packageOptions,
  savingEvent,
  theme,
  onClose,
  onOptionsChanged,
  onSave,
}: {
  crewOptions: CrewMember[]
  editingEvent: EventRecord | null
  eventTypeOptions: string[]
  initialTab: 'details' | 'expenses'
  packageOptions: string[]
  savingEvent: boolean
  theme: ManagerTheme
  onClose: () => void
  onOptionsChanged: () => void
  onSave: (values: EventFormValues, expenses: EventExpense[], repeatWeekly: boolean) => Promise<void>
}) => {
  const initialValues = editingEvent ? toFormValues(editingEvent) : emptyForm
  const [activeTab, setActiveTab] = useState<'details' | 'expenses'>(initialTab)
  const [expenses, setExpenses] = useState<EventExpenseFormValue[]>(
    () => editingEvent?.expenses.map((expense) => ({ ...expense, amount: String(expense.amount) })) ?? [],
  )
  const [expenseError, setExpenseError] = useState('')
  const [availableEventTypes, setAvailableEventTypes] = useState(eventTypeOptions)
  const [availablePackages, setAvailablePackages] = useState(packageOptions)
  const [availableCrew, setAvailableCrew] = useState(crewOptions)
  const [eventTypeValue, setEventTypeValue] = useState(initialValues.eventType)
  const [packageValue, setPackageValue] = useState(initialValues.packageName)
  const [optionError, setOptionError] = useState('')
  const [dateError, setDateError] = useState('')
  const [repeatWeekly, setRepeatWeekly] = useState(false)
  const [savingOption, setSavingOption] = useState(false)
  const [deletingOption, setDeletingOption] = useState(false)
  const [optionToDelete, setOptionToDelete] = useState<{ kind: EventOptionKind; value: string } | null>(null)
  const expenseTotal = expenses.reduce((total, expense) => total + (Number(expense.amount) || 0), 0)

  const getOptionValue = (option: string | NewEventOption) => (
    typeof option === 'string' ? option : option.inputValue
  )

  const handleOptionChange = async (
    kind: Exclude<EventOptionKind, 'crew'>,
    option: string | NewEventOption | null,
  ) => {
    const setValue = kind === 'eventType' ? setEventTypeValue : setPackageValue
    if (!option) {
      setValue('')
      return
    }

    if (typeof option === 'string') {
      setValue(option)
      return
    }

    setSavingOption(true)
    setOptionError('')
    try {
      await createEventOption(kind, option.inputValue)
      const setOptions = kind === 'eventType' ? setAvailableEventTypes : setAvailablePackages
      setOptions((current) => [...current, option.inputValue].sort((a, b) => a.localeCompare(b)))
      setValue(option.inputValue)
      onOptionsChanged()
    } catch (error) {
      setOptionError(error instanceof Error ? error.message : 'Failed to add option')
    } finally {
      setSavingOption(false)
    }
  }

  const handleCrewChange = async (
    expenseId: string,
    option: string | NewEventOption | null,
  ) => {
    if (!option) {
      updateExpense(expenseId, { crewId: '', crewName: '' })
      return
    }

    if (typeof option === 'string') {
      const crew = availableCrew.find((member) => member.name === option)
      updateExpense(expenseId, { crewId: crew?.id || '', crewName: option })
      return
    }

    setSavingOption(true)
    setOptionError('')
    try {
      const created = await createEventOption('crew', option.inputValue)
      const crew = { id: created.id, name: created.value }
      setAvailableCrew((current) => [...current, crew].sort((a, b) => a.name.localeCompare(b.name)))
      updateExpense(expenseId, { crewId: crew.id, crewName: crew.name })
      onOptionsChanged()
    } catch (error) {
      setOptionError(error instanceof Error ? error.message : 'Failed to add crew member')
    } finally {
      setSavingOption(false)
    }
  }

  const handleDeleteOption = async () => {
    if (!optionToDelete) return
    setDeletingOption(true)
    setOptionError('')
    try {
      await deleteEventOption(optionToDelete.kind, optionToDelete.value)
      if (optionToDelete.kind === 'crew') {
        setAvailableCrew((current) => current.filter((member) => member.name !== optionToDelete.value))
      } else {
        const setOptions = optionToDelete.kind === 'eventType' ? setAvailableEventTypes : setAvailablePackages
        setOptions((current) => current.filter((value) => value !== optionToDelete.value))
      }
      setOptionToDelete(null)
      onOptionsChanged()
    } catch (error) {
      setOptionError(error instanceof Error ? error.message : 'Failed to delete option')
    } finally {
      setDeletingOption(false)
    }
  }

  const addExpense = () => {
    setExpenses((current) => [
      { id: `expense-${Date.now()}`, type: 'Crew salary', amount: '', note: '', crewId: '', crewName: '' },
      ...current,
    ])
  }

  const updateExpense = (id: string, updates: Partial<EventExpenseFormValue>) => {
    setExpenses((current) => current.map((expense) => (
      expense.id === id ? { ...expense, ...updates } : expense
    )))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const values = eventFormFields.reduce((current, { name }) => {
      current[name] = String(formData.get(name) ?? '')
      return current
    }, {} as EventFormValues)

    const normalizedExpenses = expenses.map((expense) => ({
      ...expense,
      amount: Number(expense.amount),
    }))

    if (values.eventEndDate && values.eventEndDate < values.eventDate) {
      setDateError('End date cannot be before the start date.')
      setActiveTab('details')
      return
    }

    if (repeatWeekly && new Date(`${values.eventDate}T00:00:00`).getDay() !== 0) {
      setDateError('A recurring Sunday schedule must start on a Sunday.')
      setActiveTab('details')
      return
    }

    if (expenses.some((expense) => expense.amount.trim() === '') || normalizedExpenses.some((expense) => !Number.isFinite(expense.amount) || expense.amount < 0)) {
      setExpenseError('Enter a valid amount of zero or greater for every expense.')
      setActiveTab('expenses')
      return
    }
    if (expenses.some((expense) => expense.type === 'Crew salary' && !expense.crewId)) {
      setExpenseError('Select a crew member for every crew salary expense.')
      setActiveTab('expenses')
      return
    }

    setExpenseError('')
    setDateError('')
    await onSave(values, normalizedExpenses, repeatWeekly)
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
            borderRadius: '8px',
          },
        },
      }}
    >
      <Box
        component='form'
        onSubmit={handleSubmit}
        onKeyDown={(event) => {
          if (event.key === 'Enter') event.preventDefault()
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            background: theme.field,
            color: theme.text,
            borderRadius: '8px',
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
        <DialogTitle sx={{ fontWeight: 700, color: theme.text, pb: 1 }}>
          {editingEvent ? 'Edit event' : 'Add event'}
        </DialogTitle>
        <DialogContent>
          <Tabs
            value={activeTab}
            onChange={(_, tab: 'details' | 'expenses') => setActiveTab(tab)}
            sx={{ mb: 2, borderBottom: `1px solid ${theme.border}` }}
          >
            <Tab value='details' label='Event details' />
            <Tab
              value='expenses'
              label={editingEvent ? `Expenses${expenses.length ? ` (${expenses.length})` : ''}` : 'Expenses'}
              disabled={!editingEvent}
            />
          </Tabs>
          {optionError ? (
            <Typography sx={{ color: '#f43f5e', fontSize: 13, fontWeight: 650, mb: 1.5 }}>
              {optionError}
            </Typography>
          ) : null}
          {dateError ? (
            <Typography sx={{ color: '#f43f5e', fontSize: 13, fontWeight: 650, mb: 1.5 }}>
              {dateError}
            </Typography>
          ) : null}
          <Box
            sx={{
              display: activeTab === 'details' ? 'grid' : 'none',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
              gap: 1.5,
              paddingTop: 1,
            }}
          >
            {eventFormFields.map(({ name, label }) => {
              if (name === 'eventType' || name === 'packageName') {
                const kind: EventOptionKind = name === 'eventType' ? 'eventType' : 'package'
                const options = name === 'eventType' ? availableEventTypes : availablePackages
                const value = name === 'eventType' ? eventTypeValue : packageValue
                return (
                  <Box key={name} sx={{ display: 'contents' }}>
                    <input type='hidden' name={name} value={value} />
                    <Autocomplete<string | NewEventOption, false, false, true>
                      freeSolo
                      selectOnFocus
                      clearOnBlur
                      handleHomeEndKeys
                      disabled={savingOption || deletingOption}
                      options={options}
                      value={value}
                      filterOptions={(availableOptions, params) => {
                        const inputValue = params.inputValue.trim()
                        const normalizedInput = inputValue.toLocaleLowerCase()
                        const filtered = availableOptions.filter((option) => {
                          if (typeof option !== 'string') return false
                          return !normalizedInput || option.toLocaleLowerCase().includes(normalizedInput)
                        })
                        const exactMatch = options.some(
                          (option) => option.toLocaleLowerCase() === normalizedInput,
                        )
                        if (inputValue && !exactMatch) {
                          filtered.push({
                            inputValue,
                            label: `Add “${inputValue}” as a new ${kind === 'eventType' ? 'event type' : 'package'}`,
                            isNew: true,
                          })
                        }
                        return filtered
                      }}
                      getOptionLabel={(option) => (
                        typeof option === 'string' ? option : option.label
                      )}
                      isOptionEqualToValue={(option, selectedValue) => (
                        getOptionValue(option).toLocaleLowerCase()
                          === getOptionValue(selectedValue).toLocaleLowerCase()
                      )}
                      onChange={(_, option) => void handleOptionChange(kind, option)}
                      renderOption={(props, option) => (
                        <Box
                          component='li'
                          {...props}
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            gap: 1,
                            '& .delete-event-option': { opacity: 0 },
                            '&:hover .delete-event-option, &:focus-within .delete-event-option': { opacity: 1 },
                          }}
                        >
                          {typeof option === 'string' ? (
                            <>
                              <Typography sx={{ fontSize: 14 }}>{option}</Typography>
                              <IconButton
                                className='delete-event-option'
                                size='small'
                                tabIndex={-1}
                                aria-label={`Delete ${option}`}
                                onMouseDown={(event) => event.preventDefault()}
                                onClick={(event) => {
                                  event.preventDefault()
                                  event.stopPropagation()
                                  setOptionToDelete({ kind, value: option })
                                }}
                                sx={{ color: '#f43f5e', transition: 'opacity 120ms ease' }}
                              >
                                <FiX size={15} />
                              </IconButton>
                            </>
                          ) : (
                            <Stack direction='row' spacing={1} sx={{ alignItems: 'center' }}>
                              <FiPlus />
                              <Typography sx={{ fontSize: 14, fontWeight: 650 }}>{option.label}</Typography>
                            </Stack>
                          )}
                        </Box>
                      )}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={label}
                          helperText='Choose an option or type to add a new one'
                        />
                      )}
                    />
                  </Box>
                )
              }

              return (
                <TextField
                  key={name}
                  name={name}
                  label={label}
                  type={
                    name === 'eventDate' || name === 'eventEndDate'
                      ? 'date'
                      : name === 'eventTime'
                        ? 'time'
                      : name === 'agreedAmount' || name === 'amountPaid'
                        ? 'number'
                        : 'text'
                  }
                  select={name === 'status' || name === 'bookingSource'}
                  defaultValue={initialValues[name]}
                  required={name === 'name' || name === 'eventDate' || name === 'eventEndDate'}
                  multiline={name === 'notes'}
                  minRows={name === 'notes' ? 3 : undefined}
                  sx={{ gridColumn: name === 'location' || name === 'notes' ? '1 / -1' : undefined }}
                  slotProps={name === 'eventDate' || name === 'eventEndDate' || name === 'eventTime'
                    ? {
                        inputLabel: { shrink: true },
                        htmlInput: {
                          ...(name === 'eventTime' ? { step: 300 } : {}),
                          onClick: (event: MouseEvent<HTMLInputElement>) => event.currentTarget.showPicker?.(),
                        },
                      }
                    : undefined}
                >
                  {name === 'status'
                    ? Array.from(new Set([...eventStatuses, initialValues.status])).map((status) => (
                        <MenuItem key={status} value={status}>
                          {status}
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
              )
            })}
            {!editingEvent ? (
              <FormControlLabel
                sx={{ gridColumn: '1 / -1', color: theme.text, mt: 0.5 }}
                control={<Checkbox checked={repeatWeekly} onChange={(event) => setRepeatWeekly(event.target.checked)} />}
                label={(
                  <Box>
                    <Typography sx={{ fontSize: 14, fontWeight: 650 }}>Repeat every Sunday</Typography>
                    <Typography sx={{ fontSize: 12, color: theme.muted }}>
                      Sundays are added automatically. Deleting one skips only that date.
                    </Typography>
                  </Box>
                )}
              />
            ) : null}
          </Box>
          <Box sx={{ display: activeTab === 'expenses' ? 'block' : 'none' }}>
            {expenseError ? (
              <Typography sx={{ color: '#f43f5e', fontSize: 13, fontWeight: 650, mb: 1.5 }}>
                {expenseError}
              </Typography>
            ) : null}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 2,
                mb: 2,
              }}
            >
              <Box>
                <Typography sx={{ fontWeight: 700 }}>Event expenses</Typography>
                <Typography sx={{ color: theme.muted, fontSize: 13 }}>
                  Track costs without adding another permanent table column.
                </Typography>
              </Box>
              <Button type='button' variant='outlined' startIcon={<FiPlus />} onClick={addExpense}>
                Add expense
              </Button>
            </Box>

            {expenses.length === 0 ? (
              <Box sx={{ border: `1px dashed ${theme.border}`, borderRadius: '8px', p: 4, textAlign: 'center' }}>
                <Typography sx={{ color: theme.muted }}>No expenses recorded for this event.</Typography>
                <Button type='button' startIcon={<FiPlus />} onClick={addExpense} sx={{ mt: 1 }}>
                  Add the first expense
                </Button>
              </Box>
            ) : (
              <Stack spacing={1.25}>
                {expenses.map((expense) => (
                  <Box
                    key={expense.id}
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: {
                        xs: '1fr auto',
                        sm: expense.type === 'Crew salary'
                          ? '170px 170px 130px 1fr auto'
                          : '180px 150px 1fr auto',
                      },
                      gap: 1,
                      alignItems: 'center',
                      p: 1.25,
                      border: `1px solid ${theme.border}`,
                      borderRadius: '8px',
                    }}
                  >
                    <TextField
                      select
                      label='Expense type'
                      value={expense.type}
                      onChange={(event) => {
                        const type = event.target.value as ExpenseType
                        updateExpense(expense.id, {
                          type,
                          ...(type === 'Crew salary' ? {} : { crewId: '', crewName: '' }),
                        })
                      }}
                    >
                      {expenseTypes.map((type) => <MenuItem key={type} value={type}>{type}</MenuItem>)}
                    </TextField>
                    {expense.type === 'Crew salary' ? (
                      <Autocomplete<string | NewEventOption, false, false, true>
                        freeSolo
                        selectOnFocus
                        clearOnBlur
                        disabled={savingOption || deletingOption}
                        options={availableCrew.map((crew) => crew.name)}
                        value={expense.crewName}
                        filterOptions={(options, params) => {
                          const inputValue = params.inputValue.trim()
                          const normalizedInput = inputValue.toLocaleLowerCase()
                          const filtered = options.filter((option) => (
                            typeof option === 'string'
                            && (!normalizedInput || option.toLocaleLowerCase().includes(normalizedInput))
                          ))
                          const exactMatch = availableCrew.some(
                            (crew) => crew.name.toLocaleLowerCase() === normalizedInput,
                          )
                          if (inputValue && !exactMatch) {
                            filtered.push({
                              inputValue,
                              label: `Add “${inputValue}” as crew`,
                              isNew: true,
                            })
                          }
                          return filtered
                        }}
                        getOptionLabel={(option) => typeof option === 'string' ? option : option.label}
                        onChange={(_, option) => void handleCrewChange(expense.id, option)}
                        renderOption={(props, option) => (
                          <Box
                            component='li'
                            {...props}
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              gap: 1,
                              '& .delete-crew-option': { opacity: 0 },
                              '&:hover .delete-crew-option, &:focus-within .delete-crew-option': { opacity: 1 },
                            }}
                          >
                            {typeof option === 'string' ? (
                              <>
                                <Typography sx={{ fontSize: 14 }}>{option}</Typography>
                                <IconButton
                                  className='delete-crew-option'
                                  size='small'
                                  tabIndex={-1}
                                  onMouseDown={(event) => event.preventDefault()}
                                  onClick={(event) => {
                                    event.preventDefault()
                                    event.stopPropagation()
                                    setOptionToDelete({ kind: 'crew', value: option })
                                  }}
                                  sx={{ color: '#f43f5e' }}
                                >
                                  <FiX size={15} />
                                </IconButton>
                              </>
                            ) : (
                              <Stack direction='row' spacing={1} sx={{ alignItems: 'center' }}>
                                <FiPlus />
                                <Typography sx={{ fontSize: 14, fontWeight: 650 }}>{option.label}</Typography>
                              </Stack>
                            )}
                          </Box>
                        )}
                        renderInput={(params) => <TextField {...params} label='Crew member' />}
                      />
                    ) : null}
                    <TextField
                      label='Amount'
                      type='number'
                      value={expense.amount}
                      slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
                      onChange={(event) => updateExpense(expense.id, { amount: event.target.value })}
                      sx={{ gridColumn: { xs: '1 / 2', sm: 'auto' } }}
                    />
                    <TextField
                      label='Note (optional)'
                      value={expense.note}
                      onChange={(event) => updateExpense(expense.id, { note: event.target.value })}
                      sx={{ gridColumn: { xs: '1 / -1', sm: 'auto' }, gridRow: { xs: 2, sm: 'auto' } }}
                    />
                    <IconButton
                      type='button'
                      aria-label={`Remove ${expense.type} expense`}
                      onClick={() => setExpenses((current) => current.filter((item) => item.id !== expense.id))}
                      sx={{ color: '#f43f5e', gridColumn: { xs: 2, sm: 'auto' }, gridRow: { xs: 1, sm: 'auto' } }}
                    >
                      <FiTrash2 />
                    </IconButton>
                  </Box>
                ))}
              </Stack>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Typography sx={{ fontWeight: 700 }}>Total expenses: {peso.format(expenseTotal)}</Typography>
            </Box>
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
            disabled={savingEvent || savingOption || deletingOption}
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
      {optionToDelete ? (
        <Dialog
          open
          onClose={() => {
            if (!deletingOption) setOptionToDelete(null)
          }}
          maxWidth='xs'
          fullWidth
          slotProps={{
            paper: {
              sx: {
                background: theme.panel,
                color: theme.text,
                border: `1px solid ${theme.border}`,
                borderRadius: '8px',
              },
            },
          }}
        >
          <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
            Delete {optionToDelete.kind === 'eventType'
              ? 'event type'
              : optionToDelete.kind === 'crew'
                ? 'crew member'
                : 'package'}?
          </DialogTitle>
          <DialogContent>
            <Typography sx={{ color: theme.muted, fontSize: 14 }}>
              <strong style={{ color: theme.text }}>{optionToDelete.value}</strong> will be removed from future dropdowns. Existing events using it will keep their current value.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
            <Button
              variant='outlined'
              disabled={deletingOption}
              onClick={() => setOptionToDelete(null)}
              sx={{ borderColor: theme.border, color: theme.text }}
            >
              Cancel
            </Button>
            <Button
              variant='contained'
              disabled={deletingOption}
              onClick={() => void handleDeleteOption()}
              sx={{ background: '#e11d48', '&:hover': { background: '#be123c' } }}
            >
              {deletingOption ? 'Deleting...' : 'Delete option'}
            </Button>
          </DialogActions>
        </Dialog>
      ) : null}
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
    crews: [],
    eventTypes: [],
    packages: [],
    statuses: [],
    years: [],
  })
  const [eventSummary, setEventSummary] = useState<EventSummary>({
    activeCount: 0,
    bookedValue: 0,
    completedRevenue: 0,
    totalExpenses: 0,
    scheduledCount: 0,
    currentMonthRevenue: 0,
    topClient: '-',
    topClientRevenue: 0,
    averageMonthlyRevenue: 0,
    strongestMonth: '-',
    strongestMonthRevenue: 0,
    weakestMonth: '-',
    weakestMonthRevenue: 0,
  })
  const [savingEvent, setSavingEvent] = useState(false)
  const [deletingEventId, setDeletingEventId] = useState('')
  const [markingDoneId, setMarkingDoneId] = useState('')
  const [copiedEventId, setCopiedEventId] = useState('')
  const [confirmDoneEvent, setConfirmDoneEvent] = useState<EventRecord | null>(null)
  const [confirmDeleteEvent, setConfirmDeleteEvent] = useState<EventRecord | null>(null)
  const eventsTableRef = useDragScroll<HTMLDivElement>()
  const [viewMode, setViewMode] = useState<ViewMode>('events')
  const [analyticsTab, setAnalyticsTab] = useState<'business' | 'crew'>('business')
  const [crewPayroll, setCrewPayroll] = useState<{ crews: CrewPayrollSummary[]; records: CrewPayrollRecord[] }>({ crews: [], records: [] })
  const [crewPayrollLoading, setCrewPayrollLoading] = useState(false)
  const [query, setQuery] = useState('')
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState('All')
  const [packageFilter, setPackageFilter] = useState('All')
  const [eventTypeFilter, setEventTypeFilter] = useState('All')
  const [yearFilter, setYearFilter] = useState('All')
  const [savedView, setSavedView] = useState<SavedView>('all')
  const [hideDone, setHideDone] = useState(true)
  const [sortField, setSortField] = useState<SortField>('eventDate')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [visibleColumns, setVisibleColumns] = useState<Record<ColumnKey, boolean>>({
    event: true,
    date: true,
    client: true,
    location: true,
    type: true,
    package: true,
    amount: true,
    paid: true,
    balance: true,
    expenses: true,
    income: true,
    source: false,
    status: true,
  })
  const [propertiesAnchor, setPropertiesAnchor] = useState<HTMLElement | null>(null)
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthKey())
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(25)
  const [editingEvent, setEditingEvent] = useState<EventRecord | null>(null)
  const [dialogInitialTab, setDialogInitialTab] = useState<'details' | 'expenses'>('details')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [calendarEventDetails, setCalendarEventDetails] = useState<EventRecord | null>(null)
  const [incomeBreakdownOpen, setIncomeBreakdownOpen] = useState(false)
  const [incomeBreakdownMode, setIncomeBreakdownMode] = useState<'completed' | 'month'>('completed')
  const [incomeBreakdownEvents, setIncomeBreakdownEvents] = useState<EventRecord[]>([])
  const [currentMonthIncomeEvents, setCurrentMonthIncomeEvents] = useState<EventRecord[]>([])
  const [incomeBreakdownLoading, setIncomeBreakdownLoading] = useState(false)
  const [incomeBreakdownError, setIncomeBreakdownError] = useState('')
  const [colorMode, setColorMode] = useState<ColorMode>('dark')
  const navigate = useNavigate()
  const theme = managerThemes[colorMode]
  const muiTheme = useMemo(() => buildMuiTheme(colorMode), [colorMode])
  const deferredQuery = useDeferredValue(query)
  const eventListParams = useMemo<EventListParams>(
    () => ({
      eventTypeFilter,
      hideDone,
      packageFilter,
      page,
      query: deferredQuery,
      rowsPerPage,
      savedView,
      sortDirection,
      sortField,
      statusFilter,
      yearFilter,
    }),
    [
      eventTypeFilter,
      hideDone,
      packageFilter,
      page,
      deferredQuery,
      rowsPerPage,
      savedView,
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

  useEffect(() => {
    const controller = new AbortController()

    fetchEventSummaryFromApi(yearFilter, controller.signal)
      .then(setEventSummary)
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return
        setEventsError(error instanceof Error ? error.message : 'Failed to load event summary')
      })

    return () => controller.abort()
  }, [eventsRevision, yearFilter])

  useEffect(() => {
    if (viewMode !== 'analytics') return
    const controller = new AbortController()
    setCrewPayrollLoading(true)
    fetchCrewPayrollFromApi(yearFilter, controller.signal)
      .then(setCrewPayroll)
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return
        setEventsError(error instanceof Error ? error.message : 'Failed to load crew payroll')
      })
      .finally(() => {
        if (!controller.signal.aborted) setCrewPayrollLoading(false)
      })
    return () => controller.abort()
  }, [eventsRevision, viewMode, yearFilter])

  useEffect(() => {
    const controller = new AbortController()
    setIncomeBreakdownLoading(true)
    setIncomeBreakdownError('')

    const selectedCompletedEvents = fetchCompletedIncomeBreakdownFromApi(yearFilter, controller.signal)
    const allCompletedEvents =
      yearFilter === 'All'
        ? selectedCompletedEvents
        : fetchCompletedIncomeBreakdownFromApi('All', controller.signal)

    Promise.all([selectedCompletedEvents, allCompletedEvents])
      .then(([selectedEvents, allEvents]) => {
        setIncomeBreakdownEvents(selectedEvents)
        setCurrentMonthIncomeEvents(
          allEvents.filter((event) => getMonthKey(event.eventDate) === getCurrentMonthKey()),
        )
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return
        setIncomeBreakdownEvents([])
        setCurrentMonthIncomeEvents([])
        setIncomeBreakdownError(error instanceof Error ? error.message : 'Failed to load completed event income')
      })
      .finally(() => {
        if (!controller.signal.aborted) setIncomeBreakdownLoading(false)
      })

    return () => controller.abort()
  }, [eventsRevision, yearFilter])

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

  const monthlyExpenseRate = useMemo(() => {
    const totals = new Map<string, { label: string; revenue: number; expenses: number; count: number }>()

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
        expenses: 0,
        count: 0,
      }
      current.revenue += event.agreedAmount ?? 0
      current.expenses += event.expenseTotal
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

  const expenseTypeTotals = useMemo(() => {
    const totals = new Map<ExpenseType, { amount: number; count: number }>()

    events.forEach((event) => {
      if (!hasSchedule(event)) return
      if (yearFilter !== 'All' && getEventYear(event) !== yearFilter) return
      if (isCancelled(event.status)) return

      event.expenses.forEach((expense) => {
        const current = totals.get(expense.type) ?? { amount: 0, count: 0 }
        current.amount += expense.amount
        current.count += 1
        totals.set(expense.type, current)
      })
    })

    return Array.from(totals.entries())
      .sort((a, b) => b[1].amount - a[1].amount)
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

  const workflowStatusMix = useMemo(() => {
    const totals = new Map<string, { count: number; revenue: number }>()

    events.forEach((event) => {
      if (!hasSchedule(event)) return
      if (yearFilter !== 'All' && getEventYear(event) !== yearFilter) return

      const key = eventStatuses.includes(event.status)
        ? event.status
        : inferPipelineStage(event.status)
      const current = totals.get(key) ?? { count: 0, revenue: 0 }
      current.count += 1
      current.revenue += event.agreedAmount ?? 0
      totals.set(key, current)
    })

    return eventStatuses
      .map((stage) => [stage, totals.get(stage) ?? { count: 0, revenue: 0 }] as const)
      .filter(([, value]) => value.count > 0)
  }, [events, yearFilter])

  const yearlyRevenue = useMemo(() => {
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
        .filter((event) => {
          const monthStart = `${selectedMonth}-01`
          const monthEnd = getDateKey(new Date(getMonthDate(selectedMonth).getFullYear(), getMonthDate(selectedMonth).getMonth() + 1, 0))
          return event.eventDate <= monthEnd && (event.eventEndDate || event.eventDate) >= monthStart
        })
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
        events: selectedMonthEvents.filter((event) => (
          event.eventDate <= key && (event.eventEndDate || event.eventDate) >= key
        )),
      })
    }

    while (cells.length % 7 !== 0) {
      cells.push({ date: null, events: [] })
    }

    return cells
  }, [selectedMonth, selectedMonthEvents])

  const openCreateDialog = () => {
    setEditingEvent(null)
    setDialogInitialTab('details')
    setDialogOpen(true)
  }

  const openEditDialog = (event: EventRecord, initialTab: 'details' | 'expenses' = 'details') => {
    setEditingEvent(event)
    setDialogInitialTab(initialTab)
    setDialogOpen(true)
  }

  const handleDelete = async (eventId: string) => {
    setDeletingEventId(eventId)
    setEventsError('')

    try {
      await deleteEventFromApi(eventId)
      setConfirmDeleteEvent(null)
      setCalendarEventDetails((current) => (current?.id === eventId ? null : current))
      setEventsRevision((current) => current + 1)
      setFacetsRevision((current) => current + 1)
    } catch (error) {
      setEventsError(error instanceof Error ? error.message : 'Failed to delete event')
    } finally {
      setDeletingEventId('')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('legato-auth')
    navigate('/login')
  }

  const handleMarkDone = async (event: EventRecord) => {
    setMarkingDoneId(event.id)
    setEventsError('')
    try {
      const updated: EventRecord = { ...event, status: 'Completed', pipelineStage: 'Completed' }
      await saveEventToApi(updated, event.id)
      setEventsRevision((current) => current + 1)
      setFacetsRevision((current) => current + 1)
    } catch (error) {
      setEventsError(error instanceof Error ? error.message : 'Failed to update event')
    } finally {
      setMarkingDoneId('')
    }
  }

  const handleCopyCrewBrief = async (event: EventRecord) => {
    setEventsError('')
    try {
      await copyTextToClipboard(formatCrewEventBrief(event))
      setCopiedEventId(event.id)
      window.setTimeout(() => {
        setCopiedEventId((current) => (current === event.id ? '' : current))
      }, 2000)
    } catch (error) {
      setEventsError(error instanceof Error ? error.message : 'Failed to copy crew event brief')
    }
  }

  const handleSaveEvent = async (values: EventFormValues, expenses: EventExpense[], repeatWeekly: boolean) => {
    const nextEvent: EventRecord = {
      ...values,
      id: editingEvent?.id ?? `evt-${Date.now()}`,
      agreedAmount: parseAmountInput(values.agreedAmount),
      amountPaid: parseAmountInput(values.amountPaid),
      pipelineStage: inferPipelineStage(values.status),
      expenses,
      expenseCount: expenses.length,
      expenseTotal: expenses.reduce((total, expense) => total + expense.amount, 0),
      recurringSeriesId: editingEvent?.recurringSeriesId || '',
    }

    setSavingEvent(true)
    setEventsError('')

    try {
      await saveEventToApi(nextEvent, editingEvent?.id, repeatWeekly)
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
  const maxMonthlyExpenses = Math.max(...monthlyExpenseRate.map((item) => item.expenses), 1)
  const totalExpenseTypeAmount = expenseTypeTotals.reduce((sum, [, value]) => sum + value.amount, 0)
  const maxExpenseTypeAmount = Math.max(...expenseTypeTotals.map(([, value]) => value.amount), 1)
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
  const maxWorkflowStatusCount = Math.max(
    ...workflowStatusMix.map(([, value]) => value.count),
    1,
  )
  const maxYearlyRevenue = Math.max(
    ...yearlyRevenue.map(([, value]) => value.revenue),
    1,
  )
  const completedIncomeGross = getGross(incomeBreakdownEvents)
  const completedIncomeExpenses = getExpenses(incomeBreakdownEvents)
  const completedIncomeNet = completedIncomeGross - completedIncomeExpenses
  const currentMonthKey = getCurrentMonthKey()
  const currentMonthCompletedEvents = currentMonthIncomeEvents
  const currentMonthGross = getGross(currentMonthCompletedEvents)
  const currentMonthExpenses = getExpenses(currentMonthCompletedEvents)
  const currentMonthNet = currentMonthGross - currentMonthExpenses
  const completedExpenseRate = formatPercent(completedIncomeExpenses, completedIncomeGross)
  const currentMonthExpenseRate = formatPercent(currentMonthExpenses, currentMonthGross)
  const selectedIncomeBreakdownEvents =
    incomeBreakdownMode === 'month' ? currentMonthCompletedEvents : incomeBreakdownEvents
  const selectedIncomeBreakdownGross = getGross(selectedIncomeBreakdownEvents)
  const selectedIncomeBreakdownExpenses = getExpenses(selectedIncomeBreakdownEvents)
  const selectedIncomeBreakdownNet = selectedIncomeBreakdownGross - selectedIncomeBreakdownExpenses
  const selectedIncomeBreakdownExpenseRate = formatPercent(
    selectedIncomeBreakdownExpenses,
    selectedIncomeBreakdownGross,
  )
  const selectedIncomeBreakdownTitle =
    incomeBreakdownMode === 'month' ? 'Earnings this month' : 'Completed event income'
  const selectedIncomeBreakdownPeriod =
    incomeBreakdownMode === 'month'
      ? formatYearMonth(currentMonthKey)
      : yearFilter === 'All'
        ? 'All years'
        : yearFilter
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
          borderRadius: '8px',
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
            flexDirection: { xs: 'row', sm: 'column', md: 'row' },
            justifyContent: 'space-between',
            gap: { xs: 0.75, sm: '1rem' },
            alignItems: { xs: 'center', sm: 'stretch', md: 'flex-end' },
            marginBottom: { xs: 1.5, md: 2.5 },
            borderRadius: '8px',
            background: 'var(--panel)',
            borderLeft: '4px solid var(--accent)',
            padding: { xs: 1, sm: 2.5, md: 3.25 },
          }}
        >
          <Box>
            <Typography
              sx={{
                display: { xs: 'none', sm: 'block' },
                fontSize: 12,
                fontWeight: 650,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--muted)',
              }}
            >
              Legato Operations
            </Typography>
            <Typography
              component='h1'
              sx={{
                fontSize: { xs: 24, md: 36 },
                lineHeight: 1,
                fontWeight: 720,
                letterSpacing: 0,
                marginTop: { xs: 0, sm: '0.35rem' },
                color: 'var(--text)',
              }}
            >
              <Box component='span' sx={{ display: { xs: 'inline', sm: 'none' } }}>Events</Box>
              <Box component='span' sx={{ display: { xs: 'none', sm: 'inline' } }}>Event Business Tracker</Box>
            </Typography>
            <Typography sx={{ display: { xs: 'none', sm: 'block' }, color: 'var(--muted)', marginTop: '0.55rem', maxWidth: 620 }}>
              Track events, booking status, revenue, packages, and the working calendar from one API-backed operations dashboard.
            </Typography>
          </Box>

          <Stack
            direction='row'
            spacing={1}
            sx={{
              width: { xs: 'auto', sm: '100%', md: 'auto' },
              '& .mobile-header-action': {
                minWidth: { xs: 0, sm: 64 },
                width: { xs: 36, sm: 'auto' },
                flex: '0 0 auto',
                px: { xs: 0, sm: 2 },
              },
              '& .mobile-header-action .MuiButton-startIcon': {
                margin: { xs: 0, sm: '0 8px 0 -4px' },
              },
            }}
          >
            <Button
              className='mobile-header-action'
              aria-label={colorMode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              variant='outlined'
              startIcon={colorMode === 'light' ? <FiMoon /> : <FiSun />}
              onClick={() =>
                setColorMode((current) => (current === 'light' ? 'dark' : 'light'))
              }
              sx={{
                borderColor: 'var(--border)',
                color: 'var(--text)',
                background: 'var(--panel)',
                borderRadius: '8px',
                fontWeight: 650,
                textTransform: 'none',
                minHeight: { xs: 36, sm: 42 },
                '&:hover': {
                  borderColor: 'var(--accent)',
                  background: 'var(--panelSoft)',
                },
              }}
            >
              <Box component='span' sx={{ display: { xs: 'none', sm: 'inline' } }}>
                {colorMode === 'light' ? 'Dark' : 'Light'}
              </Box>
            </Button>
            <Button
              className='mobile-header-action'
              aria-label='Log out'
              variant='outlined'
              startIcon={<FiLogOut />}
              onClick={handleLogout}
              sx={{
                borderColor: 'var(--border)',
                color: 'var(--muted)',
                background: 'var(--panel)',
                borderRadius: '8px',
                fontWeight: 620,
                textTransform: 'none',
                minHeight: { xs: 36, sm: 42 },
                '&:hover': {
                  borderColor: '#f43f5e',
                  color: '#f43f5e',
                  background: 'var(--panelSoft)',
                },
              }}
            >
              <Box component='span' sx={{ display: { xs: 'none', sm: 'inline' } }}>Logout</Box>
            </Button>
            <Button
              className='mobile-header-action'
              aria-label='Open invoice maker'
              component={RouterLink}
              to='/invoice-templates'
              variant='outlined'
              startIcon={<FiFileText />}
              sx={{
                borderColor: 'var(--border)',
                color: 'var(--text)',
                background: 'var(--panel)',
                borderRadius: '8px',
                fontWeight: 620,
                textTransform: 'none',
                minHeight: { xs: 36, sm: 42 },
                '&:hover': {
                  borderColor: 'var(--accent)',
                  background: 'var(--panelSoft)',
                },
              }}
            >
              <Box component='span' sx={{ display: { xs: 'none', sm: 'inline' } }}>Invoice maker</Box>
            </Button>
            <Button
              className='mobile-header-action'
              aria-label='Add event'
              variant='contained'
              startIcon={<FiPlus />}
              onClick={openCreateDialog}
              disabled={eventsLoading}
              sx={{
                background: 'var(--primary)',
                color: 'var(--primaryText)',
                borderRadius: '8px',
                boxShadow: 'none',
                fontWeight: 650,
                textTransform: 'none',
                minHeight: { xs: 36, sm: 42 },
                '&:hover': {
                  background: 'var(--primaryHover)',
                  boxShadow: 'none',
                },
              }}
            >
              <Box component='span' sx={{ display: { xs: 'none', sm: 'inline' } }}>Add event</Box>
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
          aria-label='Business summary metrics'
          sx={{
            display: { xs: 'flex', sm: 'grid' },
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' },
            overflowX: { xs: 'auto', sm: 'visible' },
            overscrollBehaviorX: 'contain',
            scrollSnapType: { xs: 'x mandatory', sm: 'none' },
            scrollbarWidth: 'none',
            WebkitOverflowScrolling: 'touch',
            '&::-webkit-scrollbar': { display: 'none' },
            gap: 1.5,
            marginBottom: 2,
            paddingBottom: { xs: 0.5, sm: 0 },
          }}
        >
          <DashboardMetric
            label='Completed event income'
            value={
              incomeBreakdownLoading ? (
                'Loading...'
              ) : (
                <Box sx={{ display: 'grid', gap: 0.4 }}>
                  <Box component='span'>Gross {peso.format(completedIncomeGross)}</Box>
                  <Box component='span' sx={{ fontSize: { xs: 16, md: 18 }, color: 'text.secondary', fontWeight: 650 }}>
                    Net {peso.format(completedIncomeNet)}
                  </Box>
                </Box>
              )
            }
            detail={`Expenses ${peso.format(completedIncomeExpenses)} (${completedExpenseRate} of gross)${yearFilter === 'All' ? '' : ` in ${yearFilter}`}`}
            accent='#34d399'
            onClick={() => {
              setIncomeBreakdownMode('completed')
              setIncomeBreakdownOpen(true)
            }}
          />
          <DashboardMetric
            label='Earnings this month'
            value={
              incomeBreakdownLoading ? (
                'Loading...'
              ) : (
                <Box sx={{ display: 'grid', gap: 0.4 }}>
                  <Box component='span'>Month gross {peso.format(currentMonthGross)}</Box>
                  <Box component='span' sx={{ fontSize: { xs: 16, md: 18 }, color: 'text.secondary', fontWeight: 650 }}>
                    Month net {peso.format(currentMonthNet)}
                  </Box>
                </Box>
              )
            }
            detail={`Done this month - Expenses ${peso.format(currentMonthExpenses)} (${currentMonthExpenseRate} of gross)`}
            accent='#f59e0b'
            onClick={() => {
              setIncomeBreakdownMode('month')
              setIncomeBreakdownOpen(true)
            }}
          />
          <DashboardMetric
            label='Total expenses'
            value={peso.format(eventSummary.totalExpenses)}
            detail={`All recorded event expenses${yearFilter === 'All' ? '' : ` in ${yearFilter}`}`}
            accent='#f43f5e'
          />
          <DashboardMetric
            label='Top client'
            value={eventSummary.topClient}
            detail={eventSummary.topClientRevenue > 0 ? `${peso.format(eventSummary.topClientRevenue)} total booked` : 'No client data yet'}
            accent='#a78bfa'
          />
          <DashboardMetric
            label='Avg monthly income'
            value={peso.format(eventSummary.averageMonthlyRevenue)}
            detail='Average monthly revenue across all recorded months'
            accent='var(--accent2)'
          />
          <DashboardMetric
            label='Strongest month'
            value={formatYearMonth(eventSummary.strongestMonth)}
            detail={eventSummary.strongestMonthRevenue > 0 ? `${peso.format(eventSummary.strongestMonthRevenue)} in revenue` : 'No data yet'}
            accent='#34d399'
          />
          <DashboardMetric
            label='Weakest month'
            value={formatYearMonth(eventSummary.weakestMonth)}
            detail={eventSummary.weakestMonthRevenue > 0 ? `${peso.format(eventSummary.weakestMonthRevenue)} in revenue` : 'No data yet'}
            accent='#fb923c'
          />
        </Box>

        <Box
          component={Card}
          sx={{
            display: 'flex',
            flexWrap: { xs: 'nowrap', sm: 'wrap' },
            gap: 0.75,
            background: 'var(--panel)',
            borderRadius: '8px',
            padding: 0.75,
            marginBottom: 1.5,
            alignItems: 'center',
            overflowX: { xs: 'auto', sm: 'visible' },
            overscrollBehaviorX: 'contain',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
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
                flex: '0 0 auto',
                minHeight: 38,
                whiteSpace: 'nowrap',
                borderRadius: '8px',
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
          <Box sx={{ display: { xs: 'none', sm: 'block' }, flex: 1 }} />
          <Button
            onClick={(event) => setPropertiesAnchor(event.currentTarget)}
            sx={{
              flex: '0 0 auto',
              borderRadius: '8px',
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
              display: { xs: 'none', sm: 'inline-flex' },
              borderRadius: '8px',
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
                borderRadius: '8px',
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
              borderRadius: '8px',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexWrap: { xs: 'nowrap', sm: 'wrap' },
                gap: 1,
                padding: { xs: 1.5, md: 2 },
                borderBottom: '1px solid var(--borderSoft)',
                background: 'var(--panel)',
                overflowX: { xs: 'auto', sm: 'visible' },
                overscrollBehaviorX: 'contain',
                scrollbarWidth: 'none',
                '&::-webkit-scrollbar': { display: 'none' },
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
                    if (item.key === 'completed') setHideDone(false)
                  }}
                  sx={{ flex: '0 0 auto', borderRadius: '8px', px: 0.5 }}
                />
              ))}
              <Box sx={{ display: { xs: 'none', sm: 'block' }, flex: 1 }} />
              <Chip
                label={hideDone ? 'Show done' : 'Hide done'}
                clickable
                variant='outlined'
                onClick={() => {
                  setHideDone((prev) => !prev)
                  setPage(0)
                }}
                sx={{
                  flex: '0 0 auto',
                  borderRadius: '8px',
                  px: 0.5,
                  borderColor: hideDone ? 'var(--border)' : '#22c55e',
                  color: hideDone ? 'var(--muted)' : '#22c55e',
                }}
              />
            </Box>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: 'minmax(0, 1fr) auto', md: '1.35fr repeat(5, minmax(130px, 1fr))' },
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
              <Button
                variant={mobileFiltersOpen ? 'contained' : 'outlined'}
                startIcon={<FiFilter />}
                onClick={() => setMobileFiltersOpen((open) => !open)}
                aria-expanded={mobileFiltersOpen}
                sx={{
                  display: { xs: 'inline-flex', md: 'none' },
                  minWidth: 44,
                  px: 1.25,
                  '& .MuiButton-startIcon': { margin: 0 },
                }}
              >
                <Box component='span' sx={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
                  {mobileFiltersOpen ? 'Hide filters' : 'Show filters'}
                </Box>
              </Button>
              <TextField
                select
                label='Year'
                value={yearFilter}
                onChange={(event) => {
                  setYearFilter(event.target.value)
                  setPage(0)
                }}
                size='small'
                sx={{ display: { xs: mobileFiltersOpen ? 'inline-flex' : 'none', md: 'inline-flex' }, gridColumn: { xs: '1 / -1', md: 'auto' } }}
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
                sx={{ display: { xs: mobileFiltersOpen ? 'inline-flex' : 'none', md: 'inline-flex' }, gridColumn: { xs: '1 / -1', md: 'auto' } }}
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
                sx={{ display: { xs: mobileFiltersOpen ? 'inline-flex' : 'none', md: 'inline-flex' }, gridColumn: { xs: '1 / -1', md: 'auto' } }}
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
                sx={{ display: { xs: mobileFiltersOpen ? 'inline-flex' : 'none', md: 'inline-flex' }, gridColumn: { xs: '1 / -1', md: 'auto' } }}
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
                sx={{ display: { xs: mobileFiltersOpen ? 'inline-flex' : 'none', md: 'inline-flex' }, gridColumn: { xs: '1 / -1', md: 'auto' } }}
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
                sx={{ display: { xs: mobileFiltersOpen ? 'inline-flex' : 'none', md: 'inline-flex' }, gridColumn: { xs: '1 / -1', md: 'auto' } }}
              >
                <MenuItem value='asc'>Ascending</MenuItem>
                <MenuItem value='desc'>Descending</MenuItem>
              </TextField>
            </Box>

            <TableContainer
              ref={eventsTableRef}
              sx={{
                maxHeight: 620,
                scrollbarWidth: 'none',
                '&::-webkit-scrollbar': { display: 'none' },
              }}
            >
              <Table stickyHeader size='small'>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: 44, px: 1 }} />
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
                      <TableCell colSpan={visibleTableColumns.length + 2} align='center' sx={{ py: 5, color: 'text.secondary' }}>
                        No events match this view.
                      </TableCell>
                    </TableRow>
                  ) : null}
                  {events.map((event) => {
                    const tone = statusTone(event.status)
                    const eventIsDone = isDone(event.status)

                    return (
                      <TableRow
                        key={event.id}
                        hover
                        sx={{
                          opacity: eventIsDone ? 0.6 : 1,
                          transition: 'opacity 150ms ease',
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
                        <TableCell sx={{ width: 44, px: 1, py: 0 }}>
                          {eventIsDone ? (
                            <IconButton
                              size='small'
                              disabled
                              title='Done'
                              sx={{ color: '#22c55e', opacity: 1, '&.Mui-disabled': { color: '#22c55e' } }}
                            >
                              <FiCheckCircle size={17} />
                            </IconButton>
                          ) : (
                            <Tooltip title='Click to mark as done' placement='right' arrow>
                              <span>
                                <IconButton
                                  size='small'
                                  onClick={() => setConfirmDoneEvent(event)}
                                  disabled={markingDoneId === event.id}
                                  aria-label={`Mark ${event.name} as done`}
                                  sx={{
                                    color: 'var(--faint)',
                                    '&:hover': { color: '#22c55e' },
                                    transition: 'color 150ms ease',
                                  }}
                                >
                                  <FiCircle size={17} />
                                </IconButton>
                              </span>
                            </Tooltip>
                          )}
                        </TableCell>
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
                            <Typography sx={{ fontSize: 12.5, fontWeight: 600 }}>{formatEventDateRange(event)}</Typography>
                            <Typography sx={{ fontSize: 12, color: 'var(--muted)' }}>Ingress: {formatIngressTime(event.eventTime)}</Typography>
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
                        {visibleColumns.paid ? (
                          <TableCell sx={{ fontWeight: 650, whiteSpace: 'nowrap', fontSize: 12.5, color: 'var(--muted)' }}>
                            {event.amountPaid == null ? '-' : peso.format(event.amountPaid)}
                          </TableCell>
                        ) : null}
                        {visibleColumns.balance ? (
                          <TableCell sx={{ fontWeight: 650, whiteSpace: 'nowrap', fontSize: 12.5, color: getBalance(event) > 0 ? '#f43f5e' : 'var(--muted)' }}>
                            {event.agreedAmount == null ? '-' : peso.format(getBalance(event))}
                          </TableCell>
                        ) : null}
                        {visibleColumns.expenses ? (
                          <TableCell sx={{ fontWeight: 650, whiteSpace: 'nowrap', fontSize: 12.5, color: 'var(--muted)' }}>
                            {peso.format(event.expenseTotal)}
                          </TableCell>
                        ) : null}
                        {visibleColumns.income ? (
                          <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap', fontSize: 12.5, color: getIncome(event) < 0 ? '#f43f5e' : 'var(--text)' }}>
                            {event.agreedAmount == null ? '-' : peso.format(getIncome(event))}
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
                          <Tooltip title={copiedEventId === event.id ? 'Copied crew-safe brief' : 'Copy crew-safe brief'}>
                            <IconButton
                              sx={{ color: copiedEventId === event.id ? '#22c55e' : 'var(--muted)' }}
                              onClick={() => void handleCopyCrewBrief(event)}
                              aria-label={`Copy crew-safe brief for ${event.name || 'event'}`}
                            >
                              {copiedEventId === event.id ? <FiCheckCircle /> : <FiCopy />}
                            </IconButton>
                          </Tooltip>
                          {event.expenseCount > 0 ? (
                            <Tooltip title={`${event.expenseCount} expense${event.expenseCount === 1 ? '' : 's'} · ${peso.format(event.expenseTotal)}`}>
                              <IconButton
                                sx={{ color: 'var(--accent)' }}
                                onClick={() => openEditDialog(event, 'expenses')}
                                aria-label={`View expenses for ${event.name}`}
                              >
                                <FiDollarSign />
                              </IconButton>
                            </Tooltip>
                          ) : null}
                          <IconButton sx={{ color: 'var(--muted)' }} onClick={() => openEditDialog(event)} aria-label={`Edit ${event.name}`}>
                            <FiEdit3 />
                          </IconButton>
                          <IconButton
                            sx={{ color: '#f43f5e' }}
                            onClick={() => setConfirmDeleteEvent(event)}
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
            <Box component={Card} sx={{ background: 'var(--panel)', borderRadius: '8px', overflow: 'hidden' }}>
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
                <Stack direction='row' spacing={0.5} sx={{ alignItems: 'center' }}>
                  <Tooltip title='Previous month'>
                    <IconButton
                      size='small'
                      onClick={() => setSelectedMonth((current) => shiftMonthKey(current, -1))}
                      aria-label='Go to previous month'
                      sx={{ color: 'var(--muted)' }}
                    >
                      <FiChevronLeft />
                    </IconButton>
                  </Tooltip>
                  <TextField
                    type='month'
                    size='small'
                    value={selectedMonth}
                    onChange={(event) => setSelectedMonth(event.target.value)}
                  />
                  <Tooltip title='Next month'>
                    <IconButton
                      size='small'
                      onClick={() => setSelectedMonth((current) => shiftMonthKey(current, 1))}
                      aria-label='Go to next month'
                      sx={{ color: 'var(--muted)' }}
                    >
                      <FiChevronRight />
                    </IconButton>
                  </Tooltip>
                </Stack>
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

            <Box component={Card} sx={{ background: 'var(--panel)', borderRadius: '8px', padding: { xs: 2, md: 2.5 } }}>
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
                      borderRadius: '8px',
                      outline: 'none',
                      '&:hover, &:focus-visible': {
                        background: 'var(--panelSoft)',
                      },
                    }}
                  >
                    <Typography sx={{ fontWeight: 650, color: 'var(--text)' }}>{event.name}</Typography>
                    <Typography sx={{ fontSize: 13, color: 'var(--muted)' }}>
                      {formatEventDateRange(event)} | Ingress: {formatIngressTime(event.eventTime)}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          </Box>
        ) : null}

        {viewMode === 'analytics' ? (
          <>
            <Box component={Card} sx={{ display: 'flex', alignItems: 'center', gap: 1, background: 'var(--panel)', mb: 2, px: { xs: 1, md: 2 } }}>
              <Tabs value={analyticsTab} onChange={(_, value: 'business' | 'crew') => setAnalyticsTab(value)} sx={{ flex: 1 }}>
                <Tab value='business' label='Business analytics' />
                <Tab value='crew' label='Crew payroll' />
              </Tabs>
              <TextField
                select
                size='small'
                label='Year'
                value={yearFilter}
                onChange={(event) => setYearFilter(event.target.value)}
                sx={{ minWidth: 110 }}
              >
                {yearOptions.map((year) => <MenuItem key={year} value={year}>{year}</MenuItem>)}
              </TextField>
            </Box>
            <Box sx={{ display: analyticsTab === 'business' ? 'contents' : 'none' }}>
            <Box
              component={Card}
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.65rem',
                alignItems: 'center',
                marginBottom: 2,
                background: 'var(--panel)',
                borderRadius: '8px',
                padding: { xs: 1.5, md: 2 },
              }}
            >
              <Typography sx={{ fontSize: 13, fontWeight: 650, color: 'var(--text)', marginRight: '0.25rem' }}>
                Revenue year
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
                Analytics exclude only records without an event date.
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
              title='Active revenue by year'
              description='Non-cancelled scheduled revenue grouped by event year.'
            >
              <Stack spacing={1.1} sx={{ marginTop: '1.3rem' }}>
                {yearlyRevenue.map(([year, value]) => (
                  <DataBar
                    key={year}
                    label={year}
                    value={peso.format(value.revenue)}
                    helper={`${value.count} active events | avg ${peso.format(average(value.revenue, value.count))}`}
                    percentage={(value.revenue / maxYearlyRevenue) * 100}
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
                        borderRadius: '8px 8px 3px 3px',
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
              title='Monthly expense rate'
              description='Expenses as a share of non-cancelled gross revenue by month.'
            >
              <Stack spacing={1.1} sx={{ marginTop: '1.3rem' }}>
                {monthlyExpenseRate.map((item) => (
                  <DataBar
                    key={item.label}
                    label={item.label}
                    value={`${formatPercent(item.expenses, item.revenue)} of gross`}
                    helper={`${peso.format(item.expenses)} expenses | ${peso.format(item.revenue)} gross`}
                    percentage={(item.expenses / maxMonthlyExpenses) * 100}
                    color='linear-gradient(90deg, #fb7185, #f59e0b)'
                  />
                ))}
                {monthlyExpenseRate.length === 0 ? (
                  <Typography sx={{ color: 'var(--muted)', mt: 2 }}>No expense data for this period.</Typography>
                ) : null}
              </Stack>
            </AnalyticsCard>

            <AnalyticsCard
              title='Expenses by category'
              description='Largest non-cancelled expense categories for the selected year.'
            >
              <Stack spacing={1.1} sx={{ marginTop: '1.3rem' }}>
                {expenseTypeTotals.map(([type, value]) => (
                  <DataBar
                    key={type}
                    label={type}
                    value={peso.format(value.amount)}
                    helper={`${value.count} records | ${formatPercent(value.amount, totalExpenseTypeAmount)} of expenses`}
                    percentage={(value.amount / maxExpenseTypeAmount) * 100}
                    color='linear-gradient(90deg, #f43f5e, #f59e0b)'
                  />
                ))}
                {expenseTypeTotals.length === 0 ? (
                  <Typography sx={{ color: 'var(--muted)', mt: 2 }}>No expense categories for this period.</Typography>
                ) : null}
              </Stack>
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
              title='Event statuses'
              description='Distribution using the standardized event workflow.'
            >
              <Stack spacing={1.1} sx={{ marginTop: '1.3rem' }}>
                {workflowStatusMix.map(([stage, value]) => (
                  <DataBar
                    key={stage}
                    label={stage}
                    value={`${value.count} events`}
                    helper={peso.format(value.revenue)}
                    percentage={(value.count / maxWorkflowStatusCount) * 100}
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
                      borderRadius: '8px',
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
            </Box>

            {analyticsTab === 'crew' ? (
              <Stack spacing={2}>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
                    gap: 1.5,
                  }}
                >
                  {[
                    ['Crew members paid', crewPayroll.crews.length],
                    ['Salary payments', crewPayroll.records.length],
                    ['Total crew payroll', peso.format(crewPayroll.crews.reduce((sum, crew) => sum + crew.totalIncome, 0))],
                  ].map(([label, value]) => (
                    <Card key={label} sx={{ background: 'var(--panel)', p: 2 }}>
                      <Typography sx={{ color: 'var(--muted)', fontSize: 12, fontWeight: 650, textTransform: 'uppercase' }}>
                        {label}
                      </Typography>
                      <Typography sx={{ color: 'var(--text)', fontSize: 25, fontWeight: 700, mt: 0.5 }}>
                        {value}
                      </Typography>
                    </Card>
                  ))}
                </Box>

                <AnalyticsCard
                  title='Crew earnings'
                  description='Total salary recorded per crew member for the selected year.'
                >
                  {crewPayrollLoading ? (
                    <Skeleton variant='rounded' height={180} sx={{ mt: 2 }} />
                  ) : crewPayroll.crews.length === 0 ? (
                    <Typography sx={{ color: 'var(--muted)', mt: 2 }}>No crew salary records for this period.</Typography>
                  ) : (
                    <Stack spacing={1.1} sx={{ mt: 2 }}>
                      {crewPayroll.crews.map((crew) => (
                        <DataBar
                          key={crew.crewId}
                          label={crew.crewName}
                          value={peso.format(crew.totalIncome)}
                          helper={`${crew.paymentCount} payments across ${crew.eventCount} events`}
                          percentage={(crew.totalIncome / Math.max(...crewPayroll.crews.map((item) => item.totalIncome), 1)) * 100}
                          color='linear-gradient(90deg, var(--accent3), var(--accent))'
                        />
                      ))}
                    </Stack>
                  )}
                </AnalyticsCard>

                <Box component={Card} sx={{ background: 'var(--panel)', overflow: 'hidden' }}>
                  <Box sx={{ p: 2, borderBottom: '1px solid var(--borderSoft)' }}>
                    <Typography sx={{ color: 'var(--text)', fontSize: 18, fontWeight: 700 }}>Salary records</Typography>
                    <Typography sx={{ color: 'var(--muted)', fontSize: 13 }}>Individual crew payments recorded against events.</Typography>
                  </Box>
                  <TableContainer sx={{ maxHeight: 440 }}>
                    <Table stickyHeader size='small'>
                      <TableHead>
                        <TableRow>
                          <TableCell>Crew</TableCell>
                          <TableCell>Event</TableCell>
                          <TableCell>Date</TableCell>
                          <TableCell>Note</TableCell>
                          <TableCell align='right'>Income</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {crewPayroll.records.map((record, index) => (
                          <TableRow key={`${record.eventId}-${record.crewId}-${index}`}>
                            <TableCell sx={{ fontWeight: 650 }}>{record.crewName}</TableCell>
                            <TableCell>{record.eventName || 'Untitled event'}</TableCell>
                            <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatTableDate(record.eventDate)}</TableCell>
                            <TableCell>{record.note || '-'}</TableCell>
                            <TableCell align='right' sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>{peso.format(record.amount)}</TableCell>
                          </TableRow>
                        ))}
                        {!crewPayrollLoading && crewPayroll.records.length === 0 ? (
                          <TableRow><TableCell colSpan={5} align='center' sx={{ py: 4, color: 'var(--muted)' }}>No salary records found.</TableCell></TableRow>
                        ) : null}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              </Stack>
            ) : null}
          </>
        ) : null}

        {viewMode === 'clients' || viewMode === 'venues' ? (
          <Box
            component={Card}
            sx={{
              background: 'var(--panel)',
              borderRadius: '8px',
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
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatTableDate(item.latestDate)}</TableCell>
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
              borderRadius: '8px',
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
                  ['Date', formatEventDateRange(calendarEventDetails)],
                  ['Ingress time', formatIngressTime(calendarEventDetails.eventTime)],
                  ['Client', calendarEventDetails.clientName || 'No client'],
                  ['Venue', calendarEventDetails.location || 'No location'],
                  ['Event type', calendarEventDetails.eventType || 'Unspecified'],
                  ['Package', calendarEventDetails.packageName || 'Unspecified'],
                  ['Agreed amount', calendarEventDetails.agreedAmount == null ? '-' : peso.format(calendarEventDetails.agreedAmount)],
                  ['Amount paid', calendarEventDetails.amountPaid == null ? '-' : peso.format(calendarEventDetails.amountPaid)],
                  ['Balance', calendarEventDetails.agreedAmount == null ? '-' : peso.format(getBalance(calendarEventDetails))],
                  ['Booking source', calendarEventDetails.bookingSource || 'Unknown'],
                ].map(([label, value]) => (
                  <Box
                    key={label}
                    sx={{
                      background: theme.panelSoft,
                      border: `1px solid ${theme.borderSoft}`,
                      borderRadius: '8px',
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
                    borderRadius: '8px',
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

      <Dialog
        open={incomeBreakdownOpen}
        onClose={() => setIncomeBreakdownOpen(false)}
        fullWidth
        maxWidth='sm'
        slotProps={{
          paper: {
            sx: {
              background: theme.panel,
              color: theme.text,
              border: `1px solid ${theme.border}`,
              borderRadius: '8px',
            },
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography sx={{ fontSize: 22, fontWeight: 700, color: theme.text }}>
            {selectedIncomeBreakdownTitle}
          </Typography>
          <Typography sx={{ mt: 0.5, fontSize: 13, color: theme.muted }}>
            {selectedIncomeBreakdownPeriod} breakdown - {incomeBreakdownLoading ? 'Loading events' : `${selectedIncomeBreakdownEvents.length} events`}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
              gap: 1,
              mb: 2,
            }}
          >
            <Box sx={{ background: theme.panelSoft, border: `1px solid ${theme.borderSoft}`, borderRadius: '8px', p: 1.5 }}>
              <Typography sx={{ fontSize: 11, color: theme.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Gross
              </Typography>
              <Typography sx={{ mt: 0.35, fontSize: 20, color: theme.text, fontWeight: 750 }}>
                {incomeBreakdownLoading ? 'Loading...' : peso.format(selectedIncomeBreakdownGross)}
              </Typography>
            </Box>
            <Box sx={{ background: theme.panelSoft, border: `1px solid ${theme.borderSoft}`, borderRadius: '8px', p: 1.5 }}>
              <Typography sx={{ fontSize: 11, color: theme.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Expenses ({selectedIncomeBreakdownExpenseRate})
              </Typography>
              <Typography sx={{ mt: 0.35, fontSize: 20, color: theme.text, fontWeight: 750 }}>
                {incomeBreakdownLoading ? 'Loading...' : peso.format(selectedIncomeBreakdownExpenses)}
              </Typography>
            </Box>
            <Box sx={{ background: theme.panelSoft, border: `1px solid ${theme.borderSoft}`, borderRadius: '8px', p: 1.5 }}>
              <Typography sx={{ fontSize: 11, color: theme.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Net
              </Typography>
              <Typography sx={{ mt: 0.35, fontSize: 20, color: theme.text, fontWeight: 750 }}>
                {incomeBreakdownLoading ? 'Loading...' : peso.format(selectedIncomeBreakdownNet)}
              </Typography>
            </Box>
          </Box>

          {incomeBreakdownError ? (
            <Box sx={{ background: 'color-mix(in srgb, #f43f5e 10%, transparent)', border: '1px solid #f43f5e', borderRadius: '8px', p: 1.5 }}>
              <Typography sx={{ color: '#f43f5e', fontSize: 14, fontWeight: 650 }}>
                {incomeBreakdownError}
              </Typography>
            </Box>
          ) : null}

          {!incomeBreakdownError && !incomeBreakdownLoading ? (
            selectedIncomeBreakdownEvents.length > 0 ? (
              <TableContainer sx={{ maxHeight: 360, border: `1px solid ${theme.borderSoft}`, borderRadius: '8px' }}>
                <Table stickyHeader size='small'>
                  <TableHead>
                    <TableRow>
                      <TableCell>Event</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell align='right'>Gross</TableCell>
                      <TableCell align='right'>Expenses</TableCell>
                      <TableCell align='right'>Net</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedIncomeBreakdownEvents.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell sx={{ maxWidth: 240 }}>
                          <Typography noWrap sx={{ fontSize: 13, fontWeight: 650, color: theme.text }}>
                            {event.name || 'Untitled event'}
                          </Typography>
                          <Typography noWrap sx={{ mt: 0.2, fontSize: 12, color: theme.muted }}>
                            {event.clientName || 'No client'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatEventDateRange(event)}</TableCell>
                        <TableCell align='right' sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                          {peso.format(event.agreedAmount ?? 0)}
                        </TableCell>
                        <TableCell align='right' sx={{ whiteSpace: 'nowrap' }}>
                          {peso.format(event.expenseTotal)}
                        </TableCell>
                        <TableCell align='right' sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                          {peso.format(getIncome(event))}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={2} sx={{ fontWeight: 750 }}>
                        Total
                      </TableCell>
                      <TableCell align='right' sx={{ fontWeight: 750, whiteSpace: 'nowrap' }}>
                        {peso.format(selectedIncomeBreakdownGross)}
                      </TableCell>
                      <TableCell align='right' sx={{ fontWeight: 750, whiteSpace: 'nowrap' }}>
                        {peso.format(selectedIncomeBreakdownExpenses)}
                      </TableCell>
                      <TableCell align='right' sx={{ fontWeight: 750, whiteSpace: 'nowrap' }}>
                        {peso.format(selectedIncomeBreakdownNet)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ background: theme.panelSoft, border: `1px solid ${theme.borderSoft}`, borderRadius: '8px', p: 2 }}>
                <Typography sx={{ color: theme.muted, fontSize: 14 }}>
                  {incomeBreakdownMode === 'month'
                    ? 'No completed event income found for this month.'
                    : 'No completed event income found for this filter.'}
                </Typography>
              </Box>
            )
          ) : null}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            variant='outlined'
            onClick={() => setIncomeBreakdownOpen(false)}
            sx={{ borderColor: theme.border, color: theme.text, textTransform: 'none', fontWeight: 620 }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {dialogOpen ? (
        <EventDialog
          key={editingEvent?.id ?? 'new-event'}
          crewOptions={eventFacets.crews}
          editingEvent={editingEvent}
          eventTypeOptions={eventFacets.eventTypes}
          initialTab={dialogInitialTab}
          packageOptions={eventFacets.packages}
          savingEvent={savingEvent}
          theme={theme}
          onClose={() => setDialogOpen(false)}
          onOptionsChanged={() => setFacetsRevision((current) => current + 1)}
          onSave={handleSaveEvent}
        />
      ) : null}

      {confirmDoneEvent ? (
        <Dialog
          open
          onClose={() => setConfirmDoneEvent(null)}
          maxWidth='xs'
          fullWidth
          slotProps={{
            paper: {
              sx: {
                background: theme.panel,
                border: `1px solid ${theme.border}`,
                borderRadius: '8px',
              },
            },
          }}
        >
          <DialogTitle sx={{ fontWeight: 700, color: theme.text, pb: 1 }}>
            Mark as done?
          </DialogTitle>
          <DialogContent>
            <Typography sx={{ color: theme.muted, fontSize: 14 }}>
              This will mark <strong style={{ color: theme.text }}>{confirmDoneEvent.name || 'this event'}</strong> as done and move it to Completed. You can still edit it afterwards.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
            <Button
              onClick={() => setConfirmDoneEvent(null)}
              variant='outlined'
              sx={{ borderColor: theme.border, color: theme.text, textTransform: 'none', fontWeight: 620 }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                const target = confirmDoneEvent
                setConfirmDoneEvent(null)
                void handleMarkDone(target)
              }}
              variant='contained'
              disabled={markingDoneId === confirmDoneEvent.id}
              sx={{
                background: '#22c55e',
                color: '#fff',
                textTransform: 'none',
                fontWeight: 650,
                boxShadow: 'none',
                '&:hover': { background: '#16a34a', boxShadow: 'none' },
              }}
            >
              Yes, mark done
            </Button>
          </DialogActions>
        </Dialog>
      ) : null}
      {confirmDeleteEvent ? (
        <Dialog
          open
          onClose={() => {
            if (!deletingEventId) setConfirmDeleteEvent(null)
          }}
          maxWidth='xs'
          fullWidth
          slotProps={{
            paper: {
              sx: {
                background: theme.panel,
                border: `1px solid ${theme.border}`,
                borderRadius: '8px',
              },
            },
          }}
        >
          <DialogTitle sx={{ fontWeight: 700, color: theme.text, pb: 1 }}>
            {confirmDeleteEvent.recurringSeriesId ? 'Skip this Sunday?' : 'Delete event?'}
          </DialogTitle>
          <DialogContent>
            <Typography sx={{ color: theme.muted, fontSize: 14 }}>
              {confirmDeleteEvent.recurringSeriesId ? (
                <>This removes only <strong style={{ color: theme.text }}>{formatTableDate(confirmDeleteEvent.eventDate)}</strong>. The Feast remains scheduled on every other Sunday.</>
              ) : (
                <>This will permanently delete <strong style={{ color: theme.text }}>{confirmDeleteEvent.name || 'this event'}</strong> and its expense records. This action cannot be undone.</>
              )}
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
            <Button
              onClick={() => setConfirmDeleteEvent(null)}
              variant='outlined'
              disabled={Boolean(deletingEventId)}
              sx={{ borderColor: theme.border, color: theme.text, textTransform: 'none', fontWeight: 620 }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => void handleDelete(confirmDeleteEvent.id)}
              variant='contained'
              disabled={deletingEventId === confirmDeleteEvent.id}
              sx={{
                background: '#e11d48',
                color: '#fff',
                textTransform: 'none',
                fontWeight: 650,
                boxShadow: 'none',
                '&:hover': { background: '#be123c', boxShadow: 'none' },
              }}
            >
              {deletingEventId === confirmDeleteEvent.id
                ? 'Removing...'
                : confirmDeleteEvent.recurringSeriesId ? 'Skip this Sunday' : 'Delete event'}
            </Button>
          </DialogActions>
        </Dialog>
      ) : null}
      </Box>
    </ThemeProvider>
  )
}

export default BusinessManager
