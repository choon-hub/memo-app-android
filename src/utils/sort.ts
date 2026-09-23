import type { SortOrder } from '../types/domain'

export function sortByDate<T extends { created_at: string }>(items: T[], order: SortOrder): T[] {
  return [...items].sort((a, b) => {
    const difference = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    return order === 'desc' ? -difference : difference
  })
}
