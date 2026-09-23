import type { SQLiteDatabase } from 'expo-sqlite'
import * as Crypto from 'expo-crypto'
import type { DailyNew } from '../../types/domain'

export type DailyNewInput = {
  title: string
  content: string
  created_at?: string
  id?: string
}

export type DailyNewMigrationInput = {
  id: string
  title: string
  content: string
  created_at: string
}

function normalizeInput(input: DailyNewInput): DailyNewInput {
  const title = input.title.trim()
  const content = input.content.trim()
  if (!title || !content) throw new Error('タイトルと内容は必須です')
  return { ...input, title, content }
}

async function insertOne(database: SQLiteDatabase, input: DailyNewInput): Promise<DailyNew> {
  const normalized = normalizeInput(input)
  const record: DailyNew = {
    id: normalized.id ?? Crypto.randomUUID(),
    title: normalized.title,
    content: normalized.content,
    created_at: normalized.created_at ?? new Date().toISOString(),
  }
  await database.runAsync(
    'INSERT INTO daily_new (id, title, content, created_at) VALUES (?, ?, ?, ?)',
    record.id,
    record.title,
    record.content,
    record.created_at,
  )
  return record
}

export function createDailyNewRepository(database: SQLiteDatabase) {
  return {
    async list(): Promise<DailyNew[]> {
      return database.getAllAsync<DailyNew>(
        'SELECT id, title, content, created_at FROM daily_new ORDER BY created_at DESC',
      )
    },

    async create(input: DailyNewInput): Promise<DailyNew> {
      let inserted: DailyNew | undefined
      await database.withTransactionAsync(async () => {
        inserted = await insertOne(database, input)
      })
      if (!inserted) throw new Error('作成した1日1新を取得できませんでした')
      return inserted
    },

    async createMany(inputs: DailyNewInput[]): Promise<DailyNew[]> {
      const inserted: DailyNew[] = []
      await database.withTransactionAsync(async () => {
        for (const input of inputs) inserted.push(await insertOne(database, input))
      })
      return inserted
    },

    async importMany(inputs: DailyNewMigrationInput[]): Promise<DailyNew[]> {
      const inserted: DailyNew[] = []
      await database.withTransactionAsync(async () => {
        for (const input of inputs) inserted.push(await insertOne(database, input))
      })
      return inserted
    },

    async update(id: string, input: Omit<DailyNewInput, 'id'>): Promise<DailyNew> {
      const normalized = normalizeInput(input)
      const result = await database.runAsync(
        'UPDATE daily_new SET title = ?, content = ?, created_at = COALESCE(?, created_at) WHERE id = ?',
        normalized.title,
        normalized.content,
        normalized.created_at ?? null,
        id,
      )
      if (result.changes === 0) throw new Error('更新対象の1日1新が見つかりません')
      const updated = await database.getFirstAsync<DailyNew>(
        'SELECT id, title, content, created_at FROM daily_new WHERE id = ?',
        id,
      )
      if (!updated) throw new Error('更新した1日1新を取得できませんでした')
      return updated
    },

    async remove(id: string): Promise<void> {
      const result = await database.runAsync('DELETE FROM daily_new WHERE id = ?', id)
      if (result.changes === 0) throw new Error('削除対象の1日1新が見つかりません')
    },
  }
}
