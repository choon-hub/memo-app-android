import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

type ExportData = {
  daily_new: {
    id: string
    title: string
    content: string
    created_at: string
  }[]
  topics: {
    id: string
    content: string
    persons: string[] | null
    created_at: string
  }[]
  workout_records: {
    id: string
    category: string
    menu: string
    intensity: number
    reps: number
    created_at: string
  }[]
}

function csvField(value: string | number): string {
  return `"${String(value).replaceAll('"', '""')}"`
}

function writeCsv(path: string, headers: string[], rows: (string | number)[][]) {
  const content = [
    headers.map(csvField).join(','),
    ...rows.map((row) => row.map(csvField).join(',')),
    '',
  ].join('\n')
  writeFileSync(path, content, 'utf8')
}

function argument(name: string): string {
  const index = process.argv.indexOf(name)
  const value = index >= 0 ? process.argv[index + 1] : undefined
  if (!value) throw new Error(`${name} の値が必要です`)
  return value
}

function main() {
  const inputPath = argument('--input')
  const outputDirectory = argument('--output-dir')
  const data = JSON.parse(readFileSync(inputPath, 'utf8')) as ExportData
  mkdirSync(outputDirectory, { recursive: true })

  writeCsv(
    join(outputDirectory, 'daily_new_migration.csv'),
    ['id', 'title', 'content', 'created_at'],
    data.daily_new.map((row) => [row.id, row.title, row.content, row.created_at]),
  )
  writeCsv(
    join(outputDirectory, 'topics_migration.csv'),
    ['id', 'content', 'persons_json', 'created_at'],
    data.topics.map((row) => [
      row.id,
      row.content,
      JSON.stringify(row.persons ?? []),
      row.created_at,
    ]),
  )
  writeCsv(
    join(outputDirectory, 'workout_records_migration.csv'),
    ['id', 'category', 'menu', 'intensity', 'reps', 'created_at'],
    data.workout_records.map((row) => [
      row.id,
      row.category,
      row.menu,
      row.intensity,
      row.reps,
      row.created_at,
    ]),
  )
}

main()
