import type { PropsWithChildren } from 'react'
import { SQLiteProvider, useSQLiteContext } from 'expo-sqlite'
import type { SQLiteDatabase } from 'expo-sqlite'
import { migrateDbIfNeeded } from './migrations'

export function LocalDatabaseProvider({ children }: PropsWithChildren) {
  return (
    <SQLiteProvider databaseName="memo-app.db" onInit={migrateDbIfNeeded}>
      {children}
    </SQLiteProvider>
  )
}

export function useDatabase(): SQLiteDatabase {
  return useSQLiteContext()
}
