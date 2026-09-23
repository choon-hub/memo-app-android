import type { SQLiteDatabase } from 'expo-sqlite'

const INITIAL_SCHEMA = `
  CREATE TABLE IF NOT EXISTS daily_new (
    id TEXT PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS topics (
    id TEXT PRIMARY KEY NOT NULL,
    content TEXT NOT NULL,
    persons_json TEXT NOT NULL DEFAULT '[]',
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS workout_records (
    id TEXT PRIMARY KEY NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('chest', 'back', 'legs')),
    menu TEXT NOT NULL,
    intensity REAL NOT NULL CHECK (intensity >= 0),
    reps INTEGER NOT NULL CHECK (reps > 0),
    created_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_daily_new_created_at ON daily_new(created_at);
  CREATE INDEX IF NOT EXISTS idx_topics_created_at ON topics(created_at);
  CREATE INDEX IF NOT EXISTS idx_workout_records_category_created_at
    ON workout_records(category, created_at);
`

export async function migrateDbIfNeeded(database: SQLiteDatabase): Promise<void> {
  const versionRow = await database.getFirstAsync<{ user_version: number }>('PRAGMA user_version')
  const currentVersion = versionRow?.user_version ?? 0
  if (currentVersion < 1) {
    await database.execAsync(INITIAL_SCHEMA)
    await database.execAsync('PRAGMA user_version = 1')
  }
}
