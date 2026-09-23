import type { SQLiteDatabase } from 'expo-sqlite'
import { createDailyNewRepository } from '../dailyNewRepository'
import { createTopicsRepository } from '../topicsRepository'
import { createWorkoutRepository } from '../workoutRepository'

jest.mock('expo-crypto', () => ({
  randomUUID: (() => {
    let counter = 0
    return jest.fn(() => `generated-id-${counter++}`)
  })(),
}))

type Row = Record<string, unknown>

class MemoryDatabase {
  daily: Row[] = []
  topics: Row[] = []
  workouts: Row[] = []
  lastQuery = ''

  async runAsync(sql: string, ...parameters: unknown[]) {
    this.lastQuery = sql
    if (sql.startsWith('INSERT INTO daily_new')) {
      const [id, title, content, createdAt] = parameters.map(String)
      if (this.daily.some((row) => row.id === id)) throw new Error('duplicate')
      this.daily.push({ id, title, content, created_at: createdAt })
    } else if (sql.startsWith('INSERT INTO topics')) {
      const [id, content, personsJson, createdAt] = parameters.map(String)
      if (this.topics.some((row) => row.id === id)) throw new Error('duplicate')
      this.topics.push({ id, content, persons_json: personsJson, created_at: createdAt })
    } else if (sql.startsWith('INSERT INTO workout_records')) {
      const [id, category, menu, intensity, reps, createdAt] = parameters
      if (this.workouts.some((row) => row.id === id)) throw new Error('duplicate')
      this.workouts.push({ id, category, menu, intensity, reps, created_at: createdAt })
    } else if (sql.startsWith('DELETE FROM daily_new')) {
      this.daily = this.daily.filter((row) => row.id !== parameters[0])
    } else if (sql.startsWith('DELETE FROM topics')) {
      this.topics = this.topics.filter((row) => row.id !== parameters[0])
    } else if (sql.startsWith('DELETE FROM workout_records')) {
      this.workouts = this.workouts.filter((row) => row.id !== parameters[0])
    }
    return { changes: 1 }
  }

  async getAllAsync<T>(sql: string, ...parameters: unknown[]): Promise<T[]> {
    this.lastQuery = sql
    if (sql.includes('FROM daily_new')) return [...this.daily] as T[]
    if (sql.includes('FROM topics')) return [...this.topics] as T[]
    if (sql.includes('FROM workout_records')) {
      const rows =
        parameters.length > 0
          ? this.workouts.filter((row) => row.category === parameters[0])
          : this.workouts
      return [...rows] as T[]
    }
    return []
  }

  async getFirstAsync<T>(sql: string, ...parameters: unknown[]): Promise<T | null> {
    this.lastQuery = sql
    const rows = await this.getAllAsync<T>(sql, ...parameters)
    return rows[0] ?? null
  }

  async withTransactionAsync(callback: () => Promise<void>) {
    const snapshot = {
      daily: structuredClone(this.daily),
      topics: structuredClone(this.topics),
      workouts: structuredClone(this.workouts),
    }
    try {
      await callback()
    } catch (error) {
      this.daily = snapshot.daily
      this.topics = snapshot.topics
      this.workouts = snapshot.workouts
      throw error
    }
  }
}

function databaseForTest(database: MemoryDatabase): SQLiteDatabase {
  return database as unknown as SQLiteDatabase
}

describe('SQLite repositories', () => {
  it('rolls back a failed DailyNew batch', async () => {
    const database = new MemoryDatabase()
    const repository = createDailyNewRepository(databaseForTest(database))

    await expect(
      repository.createMany([
        { title: '成功', content: '保存されない' },
        { title: '', content: '必須エラー' },
      ]),
    ).rejects.toThrow('タイトルと内容は必須です')
    await expect(repository.list()).resolves.toEqual([])
  })

  it('round-trips topic persons and rejects broken JSON', async () => {
    const database = new MemoryDatabase()
    const repository = createTopicsRepository(databaseForTest(database))
    await repository.create({ content: '会話', persons: ['A', 'A', ' B '] })

    await expect(repository.list()).resolves.toEqual([
      expect.objectContaining({ content: '会話', persons: ['A', 'B'] }),
    ])

    database.topics[0].persons_json = '{broken'
    await expect(repository.list()).rejects.toThrow('persons_json が壊れています')
  })

  it('filters workout records in the SQL repository query', async () => {
    const database = new MemoryDatabase()
    const repository = createWorkoutRepository(databaseForTest(database))
    await repository.create({ category: 'chest', menu: 'ベンチ', intensity: 0, reps: 10 })
    await repository.create({ category: 'back', menu: '懸垂', intensity: 0, reps: 5 })

    await expect(repository.list('back')).resolves.toEqual([
      expect.objectContaining({ category: 'back', menu: '懸垂' }),
    ])
    expect(database.lastQuery).toContain('WHERE category = ?')
  })
})
