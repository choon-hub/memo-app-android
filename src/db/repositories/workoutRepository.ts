import type { SQLiteDatabase } from 'expo-sqlite'
import * as Crypto from 'expo-crypto'
import type { WorkoutCategory, WorkoutRecord } from '../../types/domain'

export type WorkoutInput = {
  category: WorkoutCategory
  menu: string
  intensity: number
  reps: number
  created_at?: string
  id?: string
}

export type WorkoutMigrationInput = {
  id: string
  category: WorkoutCategory
  menu: string
  intensity: number
  reps: number
  created_at: string
}

function validateInput(input: WorkoutInput): WorkoutInput {
  const menu = input.menu.trim()
  if (!menu) throw new Error('メニューは必須です')
  if (!['chest', 'back', 'legs'].includes(input.category)) {
    throw new Error('カテゴリが不正です')
  }
  if (!Number.isFinite(input.intensity) || input.intensity < 0) {
    throw new Error('重量は0以上の数値で指定してください')
  }
  if (!Number.isInteger(input.reps) || input.reps <= 0) {
    throw new Error('回数は正の整数で指定してください')
  }
  return { ...input, menu }
}

async function insertOne(database: SQLiteDatabase, input: WorkoutInput): Promise<WorkoutRecord> {
  const normalized = validateInput(input)
  const record: WorkoutRecord = {
    id: normalized.id ?? Crypto.randomUUID(),
    category: normalized.category,
    menu: normalized.menu,
    intensity: normalized.intensity,
    reps: normalized.reps,
    created_at: normalized.created_at ?? new Date().toISOString(),
  }
  await database.runAsync(
    'INSERT INTO workout_records (id, category, menu, intensity, reps, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    record.id,
    record.category,
    record.menu,
    record.intensity,
    record.reps,
    record.created_at,
  )
  return record
}

export function createWorkoutRepository(database: SQLiteDatabase) {
  return {
    async list(category?: WorkoutCategory): Promise<WorkoutRecord[]> {
      if (category) {
        return database.getAllAsync<WorkoutRecord>(
          'SELECT id, category, menu, intensity, reps, created_at FROM workout_records WHERE category = ? ORDER BY created_at DESC',
          category,
        )
      }
      return database.getAllAsync<WorkoutRecord>(
        'SELECT id, category, menu, intensity, reps, created_at FROM workout_records ORDER BY created_at DESC',
      )
    },

    async listMenuRecords(): Promise<Pick<WorkoutRecord, 'menu' | 'category'>[]> {
      return database.getAllAsync<Pick<WorkoutRecord, 'menu' | 'category'>>(
        'SELECT menu, category FROM workout_records ORDER BY menu ASC',
      )
    },

    async create(input: WorkoutInput): Promise<WorkoutRecord> {
      let inserted: WorkoutRecord | undefined
      await database.withTransactionAsync(async () => {
        inserted = await insertOne(database, input)
      })
      if (!inserted) throw new Error('作成した筋トレ記録を取得できませんでした')
      return inserted
    },

    async createMany(inputs: WorkoutInput[]): Promise<WorkoutRecord[]> {
      const inserted: WorkoutRecord[] = []
      await database.withTransactionAsync(async () => {
        for (const input of inputs) inserted.push(await insertOne(database, input))
      })
      return inserted
    },

    async importMany(inputs: WorkoutMigrationInput[]): Promise<WorkoutRecord[]> {
      const inserted: WorkoutRecord[] = []
      await database.withTransactionAsync(async () => {
        for (const input of inputs) inserted.push(await insertOne(database, input))
      })
      return inserted
    },

    async update(id: string, input: Omit<WorkoutInput, 'id' | 'category'>): Promise<WorkoutRecord> {
      const normalized = validateInput({ ...input, category: 'chest' })
      const result = await database.runAsync(
        'UPDATE workout_records SET menu = ?, intensity = ?, reps = ?, created_at = COALESCE(?, created_at) WHERE id = ?',
        normalized.menu,
        normalized.intensity,
        normalized.reps,
        normalized.created_at ?? null,
        id,
      )
      if (result.changes === 0) throw new Error('更新対象の筋トレ記録が見つかりません')
      const updated = await database.getFirstAsync<WorkoutRecord>(
        'SELECT id, category, menu, intensity, reps, created_at FROM workout_records WHERE id = ?',
        id,
      )
      if (!updated) throw new Error('更新した筋トレ記録を取得できませんでした')
      return updated
    },

    async remove(id: string): Promise<void> {
      const result = await database.runAsync('DELETE FROM workout_records WHERE id = ?', id)
      if (result.changes === 0) throw new Error('削除対象の筋トレ記録が見つかりません')
    },
  }
}
