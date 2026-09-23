import type { SQLiteDatabase } from 'expo-sqlite'
import * as Crypto from 'expo-crypto'
import type { Topic } from '../../types/domain'

export type TopicInput = {
  content: string
  persons?: string[]
  created_at?: string
  id?: string
}

export type TopicMigrationInput = {
  id: string
  content: string
  persons_json: string
  created_at: string
}

type TopicRow = Omit<Topic, 'persons'> & { persons_json: string }

function decodePersons(value: string): string[] {
  let parsed: unknown
  try {
    parsed = JSON.parse(value)
  } catch {
    throw new Error('topics.persons_json が壊れています')
  }
  if (!Array.isArray(parsed) || parsed.some((person) => typeof person !== 'string')) {
    throw new Error('topics.persons_json は文字列配列である必要があります')
  }
  return parsed
}

function decodeRow(row: TopicRow): Topic {
  return {
    id: row.id,
    content: row.content,
    persons: decodePersons(row.persons_json),
    created_at: row.created_at,
  }
}

function normalizePersons(persons: string[] | undefined): string[] {
  return [...new Set((persons ?? []).map((person) => person.trim()).filter(Boolean))]
}

function normalizeInput(input: TopicInput): TopicInput {
  const content = input.content.trim()
  if (!content) throw new Error('トピックの内容は必須です')
  return { ...input, content, persons: normalizePersons(input.persons) }
}

async function insertOne(database: SQLiteDatabase, input: TopicInput): Promise<Topic> {
  const normalized = normalizeInput(input)
  const record: Topic = {
    id: normalized.id ?? Crypto.randomUUID(),
    content: normalized.content,
    persons: normalized.persons ?? [],
    created_at: normalized.created_at ?? new Date().toISOString(),
  }
  await database.runAsync(
    'INSERT INTO topics (id, content, persons_json, created_at) VALUES (?, ?, ?, ?)',
    record.id,
    record.content,
    JSON.stringify(record.persons),
    record.created_at,
  )
  return record
}

async function listRows(database: SQLiteDatabase): Promise<Topic[]> {
  const rows = await database.getAllAsync<TopicRow>(
    'SELECT id, content, persons_json, created_at FROM topics ORDER BY created_at DESC',
  )
  return rows.map(decodeRow)
}

export function createTopicsRepository(database: SQLiteDatabase) {
  return {
    list: () => listRows(database),

    async create(input: TopicInput): Promise<Topic> {
      let inserted: Topic | undefined
      await database.withTransactionAsync(async () => {
        inserted = await insertOne(database, input)
      })
      if (!inserted) throw new Error('作成したトピックを取得できませんでした')
      return inserted
    },

    async createMany(inputs: TopicInput[]): Promise<Topic[]> {
      const inserted: Topic[] = []
      await database.withTransactionAsync(async () => {
        for (const input of inputs) inserted.push(await insertOne(database, input))
      })
      return inserted
    },

    async importMany(inputs: TopicMigrationInput[]): Promise<Topic[]> {
      const inserted: Topic[] = []
      await database.withTransactionAsync(async () => {
        for (const input of inputs) {
          const persons = decodePersons(input.persons_json)
          inserted.push(
            await insertOne(database, {
              id: input.id,
              content: input.content,
              persons,
              created_at: input.created_at,
            }),
          )
        }
      })
      return inserted
    },

    async update(id: string, input: Omit<TopicInput, 'id'>): Promise<Topic> {
      const normalized = normalizeInput(input)
      const result = await database.runAsync(
        'UPDATE topics SET content = ?, persons_json = ?, created_at = COALESCE(?, created_at) WHERE id = ?',
        normalized.content,
        JSON.stringify(normalized.persons ?? []),
        normalized.created_at ?? null,
        id,
      )
      if (result.changes === 0) throw new Error('更新対象のトピックが見つかりません')
      const row = await database.getFirstAsync<TopicRow>(
        'SELECT id, content, persons_json, created_at FROM topics WHERE id = ?',
        id,
      )
      if (!row) throw new Error('更新したトピックを取得できませんでした')
      return decodeRow(row)
    },

    async remove(id: string): Promise<void> {
      const result = await database.runAsync('DELETE FROM topics WHERE id = ?', id)
      if (result.changes === 0) throw new Error('削除対象のトピックが見つかりません')
    },
  }
}
