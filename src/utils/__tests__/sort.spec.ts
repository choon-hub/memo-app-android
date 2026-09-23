import { sortByDate } from '../sort'

describe('sortByDate', () => {
  const items = [
    { id: 'old', created_at: '2026-01-01T00:00:00.000Z' },
    { id: 'new', created_at: '2026-09-01T00:00:00.000Z' },
  ]

  it('sorts in both directions without mutating the source', () => {
    expect(sortByDate(items, 'desc').map((item) => item.id)).toEqual(['new', 'old'])
    expect(sortByDate(items, 'asc').map((item) => item.id)).toEqual(['old', 'new'])
    expect(items[0].id).toBe('old')
  })
})
