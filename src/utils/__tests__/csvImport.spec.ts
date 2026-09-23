import { importDailyNewRows, importTopicMigrationRows, importWorkoutRows } from '../csvImport'

describe('csv validation', () => {
  it('collects every invalid workout row and allows zero intensity', () => {
    const result = importWorkoutRows([
      { category: 'chest', menu: 'push-up', intensity: '0', reps: '10', date: '2026-09-23' },
      { category: 'arms', menu: '', intensity: '-1', reps: '1.5', date: 'bad' },
    ])

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.errors).toHaveLength(5)
    }
  })

  it('creates date-normalized daily-new payloads', () => {
    const result = importDailyNewRows([{ title: '学習', content: '内容', date: '2026-09-23' }])
    expect(result).toEqual({
      success: true,
      rows: [{ title: '学習', content: '内容', created_at: '2026-09-23T00:00:00.000Z' }],
    })
  })

  it('validates migration persons_json as a string array', () => {
    expect(
      importTopicMigrationRows([
        {
          id: 'topic-1',
          content: '内容',
          persons_json: '["A","B"]',
          created_at: '2026-09-23T00:00:00.000Z',
        },
      ]),
    ).toEqual({
      success: true,
      rows: [
        {
          id: 'topic-1',
          content: '内容',
          persons_json: '["A","B"]',
          created_at: '2026-09-23T00:00:00.000Z',
        },
      ],
    })
    expect(
      importTopicMigrationRows([
        {
          id: 'topic-1',
          content: '内容',
          persons_json: '{"name":"A"}',
          created_at: '2026-09-23T00:00:00.000Z',
        },
      ]),
    ).toMatchObject({ success: false })
  })
})
