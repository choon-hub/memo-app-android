import type { WorkoutCategory } from '../types/domain'
import { dateInputToIso } from './date'

export type CsvImportError = {
  row: number
  reason: string
}

export type CsvImportResult<T> =
  { success: true; rows: T[] } | { success: false; errors: CsvImportError[] }

export type DailyNewCsvInput = {
  title: string
  content: string
  created_at?: string
}

export type TopicCsvInput = {
  content: string
  created_at?: string
}

export type WorkoutCsvInput = {
  category: WorkoutCategory
  menu: string
  intensity: number
  reps: number
  created_at?: string
}

export type DailyNewMigrationInput = {
  id: string
  title: string
  content: string
  created_at: string
}
export type TopicMigrationInput = {
  id: string
  content: string
  persons_json: string
  created_at: string
}
export type WorkoutMigrationInput = WorkoutCsvInput & { id: string; created_at: string }

const WORKOUT_CATEGORIES: WorkoutCategory[] = ['chest', 'back', 'legs']

function required(
  value: string | undefined,
  field: string,
  row: number,
  errors: CsvImportError[],
): string | undefined {
  const trimmed = value?.trim() ?? ''
  if (!trimmed) errors.push({ row, reason: `${field} は必須です` })
  return trimmed || undefined
}

function optionalDate(
  value: string | undefined,
  row: number,
  errors: CsvImportError[],
): string | undefined {
  const trimmed = value?.trim() ?? ''
  if (!trimmed) return undefined
  try {
    return dateInputToIso(trimmed)
  } catch {
    errors.push({ row, reason: 'date は YYYY-MM-DD 形式で指定してください' })
    return undefined
  }
}

function exactIsoDate(
  value: string | undefined,
  field: string,
  row: number,
  errors: CsvImportError[],
): string | undefined {
  const trimmed = value?.trim() ?? ''
  if (!trimmed) {
    errors.push({ row, reason: `${field} は必須です` })
    return undefined
  }
  if (
    !/^\d{4}-\d{2}-\d{2}T.+(?:Z|[+-]\d{2}:\d{2})$/.test(trimmed) ||
    Number.isNaN(new Date(trimmed).getTime())
  ) {
    errors.push({ row, reason: `${field} はISO 8601形式で指定してください` })
    return undefined
  }
  return trimmed
}

function category(
  value: string | undefined,
  row: number,
  errors: CsvImportError[],
): WorkoutCategory | undefined {
  const trimmed = value?.trim() ?? ''
  if (!WORKOUT_CATEGORIES.includes(trimmed as WorkoutCategory)) {
    errors.push({ row, reason: 'category は chest/back/legs のいずれかで指定してください' })
    return undefined
  }
  return trimmed as WorkoutCategory
}

function nonNegativeNumber(
  value: string | undefined,
  field: string,
  row: number,
  errors: CsvImportError[],
): number | undefined {
  const trimmed = value?.trim() ?? ''
  const number = Number(trimmed)
  if (!trimmed || !Number.isFinite(number) || number < 0) {
    errors.push({ row, reason: `${field} は0以上の数値で指定してください` })
    return undefined
  }
  return number
}

function positiveInteger(
  value: string | undefined,
  field: string,
  row: number,
  errors: CsvImportError[],
): number | undefined {
  const trimmed = value?.trim() ?? ''
  const number = Number(trimmed)
  if (!trimmed || !Number.isInteger(number) || number <= 0) {
    errors.push({ row, reason: `${field} は正の整数で指定してください` })
    return undefined
  }
  return number
}

export function importDailyNewRows(
  rows: Record<string, string>[],
): CsvImportResult<DailyNewCsvInput> {
  const errors: CsvImportError[] = []
  const result: DailyNewCsvInput[] = []
  rows.forEach((row, index) => {
    const rowNumber = index + 1
    const title = required(row.title, 'title', rowNumber, errors)
    const content = required(row.content, 'content', rowNumber, errors)
    const created_at = optionalDate(row.date, rowNumber, errors)
    if (title && content && (!row.date?.trim() || created_at)) {
      result.push({ title, content, ...(created_at ? { created_at } : {}) })
    }
  })
  return errors.length ? { success: false, errors } : { success: true, rows: result }
}

export function importTopicRows(rows: Record<string, string>[]): CsvImportResult<TopicCsvInput> {
  const errors: CsvImportError[] = []
  const result: TopicCsvInput[] = []
  rows.forEach((row, index) => {
    const rowNumber = index + 1
    const content = required(row.content, 'content', rowNumber, errors)
    const created_at = optionalDate(row.date, rowNumber, errors)
    if (content && (!row.date?.trim() || created_at)) {
      result.push({ content, ...(created_at ? { created_at } : {}) })
    }
  })
  return errors.length ? { success: false, errors } : { success: true, rows: result }
}

export function importWorkoutRows(
  rows: Record<string, string>[],
): CsvImportResult<WorkoutCsvInput> {
  const errors: CsvImportError[] = []
  const result: WorkoutCsvInput[] = []
  rows.forEach((row, index) => {
    const rowNumber = index + 1
    const recordCategory = category(row.category, rowNumber, errors)
    const menu = required(row.menu, 'menu', rowNumber, errors)
    const intensity = nonNegativeNumber(row.intensity, 'intensity', rowNumber, errors)
    const reps = positiveInteger(row.reps, 'reps', rowNumber, errors)
    const created_at = optionalDate(row.date, rowNumber, errors)
    if (
      recordCategory &&
      menu &&
      intensity !== undefined &&
      reps !== undefined &&
      (!row.date?.trim() || created_at)
    ) {
      result.push({
        category: recordCategory,
        menu,
        intensity,
        reps,
        ...(created_at ? { created_at } : {}),
      })
    }
  })
  return errors.length ? { success: false, errors } : { success: true, rows: result }
}

export function importDailyNewMigrationRows(
  rows: Record<string, string>[],
): CsvImportResult<DailyNewMigrationInput> {
  const errors: CsvImportError[] = []
  const result: DailyNewMigrationInput[] = []
  rows.forEach((row, index) => {
    const rowNumber = index + 1
    const id = required(row.id, 'id', rowNumber, errors)
    const title = required(row.title, 'title', rowNumber, errors)
    const content = required(row.content, 'content', rowNumber, errors)
    const created_at = exactIsoDate(row.created_at, 'created_at', rowNumber, errors)
    if (id && title && content && created_at) result.push({ id, title, content, created_at })
  })
  return errors.length ? { success: false, errors } : { success: true, rows: result }
}

export function importTopicMigrationRows(
  rows: Record<string, string>[],
): CsvImportResult<TopicMigrationInput> {
  const errors: CsvImportError[] = []
  const result: TopicMigrationInput[] = []
  rows.forEach((row, index) => {
    const rowNumber = index + 1
    const id = required(row.id, 'id', rowNumber, errors)
    const content = required(row.content, 'content', rowNumber, errors)
    const persons_json = required(row.persons_json, 'persons_json', rowNumber, errors)
    const created_at = exactIsoDate(row.created_at, 'created_at', rowNumber, errors)
    if (id && content && persons_json && created_at) {
      try {
        const persons = JSON.parse(persons_json)
        if (!Array.isArray(persons) || persons.some((person) => typeof person !== 'string')) {
          throw new Error('invalid')
        }
        result.push({ id, content, persons_json, created_at })
      } catch {
        errors.push({ row: rowNumber, reason: 'persons_json は文字列配列のJSONで指定してください' })
      }
    }
  })
  return errors.length ? { success: false, errors } : { success: true, rows: result }
}

export function importWorkoutMigrationRows(
  rows: Record<string, string>[],
): CsvImportResult<WorkoutMigrationInput> {
  const errors: CsvImportError[] = []
  const result: WorkoutMigrationInput[] = []
  rows.forEach((row, index) => {
    const rowNumber = index + 1
    const id = required(row.id, 'id', rowNumber, errors)
    const recordCategory = category(row.category, rowNumber, errors)
    const menu = required(row.menu, 'menu', rowNumber, errors)
    const intensity = nonNegativeNumber(row.intensity, 'intensity', rowNumber, errors)
    const reps = positiveInteger(row.reps, 'reps', rowNumber, errors)
    const created_at = exactIsoDate(row.created_at, 'created_at', rowNumber, errors)
    if (
      id &&
      recordCategory &&
      menu &&
      intensity !== undefined &&
      reps !== undefined &&
      created_at
    ) {
      result.push({ id, category: recordCategory, menu, intensity, reps, created_at })
    }
  })
  return errors.length ? { success: false, errors } : { success: true, rows: result }
}
