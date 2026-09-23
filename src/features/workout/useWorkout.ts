import { useCallback, useMemo, useState } from 'react'
import { useFocusEffect } from 'expo-router'
import { useDatabase } from '../../db/database'
import {
  createWorkoutRepository,
  type WorkoutInput,
  type WorkoutMigrationInput,
} from '../../db/repositories/workoutRepository'
import type { SortOrder, WorkoutCategory, WorkoutRecord } from '../../types/domain'
import { sortByDate } from '../../utils/sort'

function messageFromError(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

export function useWorkout() {
  const database = useDatabase()
  const repository = useMemo(() => createWorkoutRepository(database), [database])
  const [items, setItems] = useState<WorkoutRecord[]>([])
  const [menuRecords, setMenuRecords] = useState<Pick<WorkoutRecord, 'menu' | 'category'>[]>([])
  const [category, setCategory] = useState<WorkoutCategory>('chest')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchList = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setItems(sortByDate(await repository.list(category), sortOrder))
    } catch (fetchError) {
      setError(messageFromError(fetchError))
    } finally {
      setLoading(false)
    }
  }, [category, repository, sortOrder])

  const fetchMenuRecords = useCallback(async () => {
    try {
      setMenuRecords(await repository.listMenuRecords())
    } catch (fetchError) {
      setError(messageFromError(fetchError))
    }
  }, [repository])

  useFocusEffect(
    useCallback(() => {
      void fetchList()
      void fetchMenuRecords()
    }, [fetchList, fetchMenuRecords]),
  )

  const create = useCallback(
    async (input: WorkoutInput) => {
      setLoading(true)
      setError(null)
      try {
        const created = await repository.create(input)
        if (created.category === category) {
          setItems((current) => sortByDate([...current, created], sortOrder))
        }
        setMenuRecords((current) => [
          ...current,
          { menu: created.menu, category: created.category },
        ])
      } catch (createError) {
        setError(messageFromError(createError))
      } finally {
        setLoading(false)
      }
    },
    [category, repository, sortOrder],
  )

  const createMany = useCallback(
    async (inputs: WorkoutInput[]): Promise<boolean> => {
      setLoading(true)
      setError(null)
      try {
        const created = await repository.createMany(inputs)
        setItems((current) =>
          sortByDate(
            [...current, ...created.filter((record) => record.category === category)],
            sortOrder,
          ),
        )
        setMenuRecords((current) => [
          ...current,
          ...created.map(({ menu, category: recordCategory }) => ({
            menu,
            category: recordCategory,
          })),
        ])
        return true
      } catch (createError) {
        setError(messageFromError(createError))
        return false
      } finally {
        setLoading(false)
      }
    },
    [category, repository, sortOrder],
  )

  const importMany = useCallback(
    async (inputs: WorkoutMigrationInput[]): Promise<boolean> => {
      setLoading(true)
      setError(null)
      try {
        const created = await repository.importMany(inputs)
        setItems((current) =>
          sortByDate(
            [...current, ...created.filter((record) => record.category === category)],
            sortOrder,
          ),
        )
        setMenuRecords((current) => [
          ...current,
          ...created.map(({ menu, category: recordCategory }) => ({
            menu,
            category: recordCategory,
          })),
        ])
        return true
      } catch (importError) {
        setError(messageFromError(importError))
        return false
      } finally {
        setLoading(false)
      }
    },
    [category, repository, sortOrder],
  )

  const update = useCallback(
    async (id: string, input: Omit<WorkoutInput, 'id' | 'category'>): Promise<boolean> => {
      setLoading(true)
      setError(null)
      try {
        const before = items.find((item) => item.id === id)
        const updated = await repository.update(id, input)
        setItems((current) =>
          sortByDate(
            current.map((item) => (item.id === id ? updated : item)),
            sortOrder,
          ),
        )
        if (before) {
          setMenuRecords((current) => {
            const index = current.findIndex(
              (record) => record.menu === before.menu && record.category === before.category,
            )
            if (index === -1) return current
            return current.map((record, currentIndex) =>
              currentIndex === index ? { menu: updated.menu, category: updated.category } : record,
            )
          })
        }
        return true
      } catch (updateError) {
        setError(messageFromError(updateError))
        return false
      } finally {
        setLoading(false)
      }
    },
    [items, repository, sortOrder],
  )

  const remove = useCallback(
    async (id: string) => {
      setLoading(true)
      setError(null)
      try {
        const before = items.find((item) => item.id === id)
        await repository.remove(id)
        setItems((current) => current.filter((item) => item.id !== id))
        if (before) {
          setMenuRecords((current) => {
            const index = current.findIndex(
              (record) => record.menu === before.menu && record.category === before.category,
            )
            return index === -1
              ? current
              : current.filter((_, currentIndex) => currentIndex !== index)
          })
        }
      } catch (removeError) {
        setError(messageFromError(removeError))
      } finally {
        setLoading(false)
      }
    },
    [items, repository],
  )

  const menuSuggestions = useMemo(
    () => [...new Set(menuRecords.map((record) => record.menu))].sort((a, b) => a.localeCompare(b)),
    [menuRecords],
  )
  const menuCandidates = useMemo(
    () =>
      [
        ...new Set(
          menuRecords.filter((record) => record.category === category).map((record) => record.menu),
        ),
      ].slice(0, 5),
    [category, menuRecords],
  )

  return {
    items,
    menuRecords,
    menuSuggestions,
    menuCandidates,
    category,
    setCategory,
    sortOrder,
    loading,
    error,
    fetchList,
    fetchMenuRecords,
    create,
    createMany,
    importMany,
    update,
    remove,
    toggleSortOrder: () => setSortOrder((current) => (current === 'desc' ? 'asc' : 'desc')),
    clearError: () => setError(null),
  }
}
