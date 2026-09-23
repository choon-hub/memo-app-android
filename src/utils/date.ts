const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

export function toDateInputValue(isoString: string): string {
  const date = new Date(isoString)
  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, '0'),
    String(date.getUTCDate()).padStart(2, '0'),
  ].join('-')
}

export function getTodayDateInput(): string {
  const now = new Date()
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-')
}

export function dateInputToIso(dateInput: string): string {
  if (!DATE_PATTERN.test(dateInput)) {
    throw new Error('日付は YYYY-MM-DD 形式で指定してください')
  }

  const [year, month, day] = dateInput.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new Error('存在しない日付です')
  }
  return `${dateInput}T00:00:00.000Z`
}

export function isValidDateInput(dateInput: string): boolean {
  try {
    dateInputToIso(dateInput)
    return true
  } catch {
    return false
  }
}
