export const formatDisplayDate = (value: string) => {
  if (!value) return ''

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

export const formatCurrency = (value: string) => {
  const amount = Number(value)

  if (Number.isNaN(amount)) {
    return value ? `P${value}` : ''
  }

  return new Intl.NumberFormat('en-PH', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}
