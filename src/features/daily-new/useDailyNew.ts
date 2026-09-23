import { useCallback, useMemo, useState } from 'react'
import { useFocusEffect } from 'expo-router'
import { useDatabase } from '../../db/database'
import {
  createDailyNewRepository,
  type DailyNewInput,
  type DailyNewMigrationInput,
} from '../../db/repositories/dailyNewRepository'
import type { DailyNew, SortOrder } from '../../types/domain'
import { sortByDate } from '../../utils/sort'

function messageFromError(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

export function useDailyNew() {
  const database = useDatabase()
  const repository = useMemo(() => createDailyNewRepository(database), [database])
  const [items, setItems] = useState<DailyNew[]>([])
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchList = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setItems(sortByDate(await repository.list(), sortOrder))
    } catch (fetchError) {
      setError(messageFromError(fetchError))
    } finally {
      setLoading(false)
    }
  }, [repository, sortOrder])

  useFocusEffect(
    useCallback(() => {
      void fetchList()
    }, [fetchList]),
  )

  const create = useCallback(
    async (input: DailyNewInput) => {
      setLoading(true)
      setError(null)
      try {
        const created = await repository.create(input)
        setItems((current) => sortByDate([...current, created], sortOrder))
      } catch (createError) {
        setError(messageFromError(createError))
      } finally {
        setLoading(false)
      }
    },
    [repository, sortOrder],
  )

  const createMany = useCallback(
    async (inputs: DailyNewInput[]): Promise<boolean> => {
      setLoading(true)
      setError(null)
      try {
        const created = await repository.createMany(inputs)
        setItems((current) => sortByDate([...current, ...created], sortOrder))
        return true
      } catch (createError) {
        setError(messageFromError(createError))
        return false
      } finally {
        setLoading(false)
      }
    },
    [repository, sortOrder],
  )

  const importMany = useCallback(
    async (inputs: DailyNewMigrationInput[]): Promise<boolean> => {
      setLoading(true)
      setError(null)
      try {
        const created = await repository.importMany(inputs)
        setItems((current) => sortByDate([...current, ...created], sortOrder))
        return true
      } catch (importError) {
        setError(messageFromError(importError))
        return false
      } finally {
        setLoading(false)
      }
    },
    [repository, sortOrder],
  )

  const update = useCallback(
    async (id: string, input: Omit<DailyNewInput, 'id'>): Promise<boolean> => {
      setLoading(true)
      setError(null)
      try {
        const updated = await repository.update(id, input)
        setItems((current) =>
          sortByDate(
            current.map((item) => (item.id === id ? updated : item)),
            sortOrder,
          ),
        )
        return true
      } catch (updateError) {
        setError(messageFromError(updateError))
        return false
      } finally {
        setLoading(false)
      }
    },
    [repository, sortOrder],
  )

  const remove = useCallback(
    async (id: string) => {
      setLoading(true)
      setError(null)
      try {
        await repository.remove(id)
        setItems((current) => current.filter((item) => item.id !== id))
      } catch (removeError) {
        setError(messageFromError(removeError))
      } finally {
        setLoading(false)
      }
    },
    [repository],
  )

  const toggleSortOrder = useCallback(() => {
    setSortOrder((current) => (current === 'desc' ? 'asc' : 'desc'))
  }, [])

  return {
    items,
    sortOrder,
    loading,
    error,
    fetchList,
    create,
    createMany,
    importMany,
    update,
    remove,
    toggleSortOrder,
    clearError: () => setError(null),
  }
}
