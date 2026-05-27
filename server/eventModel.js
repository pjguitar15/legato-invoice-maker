import { randomUUID } from 'node:crypto'

const normalizeText = (value, fallback = '') =>
  typeof value === 'string' ? value.trim() : fallback

const normalizeAmount = (value) => {
  if (value === '' || value == null) return null

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

const normalizeStatus = (status) => normalizeText(status).toLowerCase()

export const inferPipelineStage = (status) => {
  const normalized = normalizeStatus(status)
  if (normalized.includes('cancel')) return 'Cancelled'
  if (normalized.includes('lost')) return 'Lost'
  if (normalized.includes('done') || normalized.includes('complete')) return 'Completed'
  if (normalized.includes('deposit') || normalized.includes('paid')) return 'Deposit Paid'
  if (normalized.includes('quote')) return 'Quoted'
  if (normalized.includes('inquir')) return 'Inquiry'
  return 'Booked'
}

export const normalizeEventForStorage = (event, options = {}) => {
  const now = new Date().toISOString()
  const status = normalizeText(event.status, 'No status') || 'No status'

  return {
    id: normalizeText(event.id) || randomUUID(),
    name: normalizeText(event.name),
    agreedAmount: normalizeAmount(event.agreedAmount),
    amountPaid: normalizeAmount(event.amountPaid),
    bookingSource: normalizeText(event.bookingSource, 'Unknown') || 'Unknown',
    clientName: normalizeText(event.clientName),
    eventDate: normalizeText(event.eventDate),
    eventType: normalizeText(event.eventType),
    eventTime: normalizeText(event.eventTime),
    location: normalizeText(event.location),
    notes: normalizeText(event.notes),
    packageName: normalizeText(event.packageName),
    paymentDueDate: normalizeText(event.paymentDueDate),
    pipelineStage: normalizeText(event.pipelineStage) || inferPipelineStage(status),
    status,
    createdAt: event.createdAt || now,
    updatedAt: options.preserveUpdatedAt ? event.updatedAt || now : now,
  }
}

export const serializeEvent = (event) => {
  if (!event) return null

  const { _id, ...rest } = event
  return {
    ...rest,
    mongoId: _id?.toString(),
  }
}
