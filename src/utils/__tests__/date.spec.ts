import { dateInputToIso, formatDate, isValidDateInput, toDateInputValue } from '../date'

describe('date utilities', () => {
  it('converts date-only values without timezone drift', () => {
    expect(dateInputToIso('2026-09-23')).toBe('2026-09-23T00:00:00.000Z')
    expect(toDateInputValue('2026-09-23T00:00:00.000Z')).toBe('2026-09-23')
    expect(formatDate('2026-09-23T00:00:00.000Z')).toContain('2026')
  })

  it('rejects malformed and impossible dates', () => {
    expect(isValidDateInput('2026-02-29')).toBe(false)
    expect(isValidDateInput('2026-09-23')).toBe(true)
    expect(() => dateInputToIso('2026/09/23')).toThrow()
  })
})
