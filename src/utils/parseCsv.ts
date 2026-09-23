export type CsvRow = {
  line: number
  fields: string[]
}

function isEmptyRow(fields: string[]): boolean {
  return fields.length === 1 && fields[0] === ''
}

function tokenizeRows(input: string): CsvRow[] {
  const rows: CsvRow[] = []
  let field = ''
  let row: string[] = []
  let inQuotes = false
  let line = 1
  let rowStartLine = 1

  const pushField = () => {
    row.push(field)
    field = ''
  }

  const pushRow = () => {
    pushField()
    rows.push({ line: rowStartLine, fields: row })
    row = []
  }

  let index = 0
  while (index < input.length) {
    const character = input[index]

    if (inQuotes) {
      if (character === '"') {
        if (input[index + 1] === '"') {
          field += '"'
          index += 2
          continue
        }
        inQuotes = false
        index += 1
        continue
      }
      if (character === '\n') {
        line += 1
      }
      if (character === '\r' && input[index + 1] === '\n') {
        field += '\n'
        line += 1
        index += 2
        continue
      }
      field += character
      index += 1
      continue
    }

    if (character === '"') {
      inQuotes = true
    } else if (character === ',') {
      pushField()
    } else if (character === '\r') {
      // CRLF is normalized by ignoring the CR outside quoted fields.
    } else if (character === '\n') {
      pushRow()
      line += 1
      rowStartLine = line
    } else {
      field += character
    }
    index += 1
  }

  if (inQuotes) {
    throw new Error(`Line ${rowStartLine}: quoted field is not closed`)
  }
  if (field !== '' || row.length > 0) {
    pushRow()
  }
  return rows
}

export function parseCsv(input: string): Record<string, string>[] {
  const rows = tokenizeRows(input)
  if (rows.length === 0) return []

  const [header, ...dataRows] = rows
  const columns = header.fields.map((column) => column.trim())
  if (columns.length === 0 || columns.some((column) => !column)) {
    throw new Error('CSVヘッダーが不正です')
  }
  if (new Set(columns).size !== columns.length) {
    throw new Error('CSVヘッダーに重複した列があります')
  }

  return dataRows.flatMap((row) => {
    if (isEmptyRow(row.fields)) return []
    if (row.fields.length !== columns.length) {
      throw new Error(
        `Line ${row.line}: expected ${columns.length} columns but got ${row.fields.length}`,
      )
    }
    return [Object.fromEntries(columns.map((column, index) => [column, row.fields[index] ?? '']))]
  })
}
