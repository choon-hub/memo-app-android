import { parseCsv } from '../parseCsv'

describe('parseCsv', () => {
  it('parses quoted commas, escaped quotes, multiline fields, and CRLF', () => {
    expect(
      parseCsv('title,content\r\n"hello, world","line 1\r\nline 2"\r\n"say ""hi""",ok'),
    ).toEqual([
      { title: 'hello, world', content: 'line 1\nline 2' },
      { title: 'say "hi"', content: 'ok' },
    ])
  })

  it('reports column count errors and unterminated quotes', () => {
    expect(() => parseCsv('a,b\nonly-one')).toThrow('expected 2 columns')
    expect(() => parseCsv('a,b\n"not closed,value')).toThrow('quoted field is not closed')
  })
})
