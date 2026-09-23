import { useState } from 'react'
import * as DocumentPicker from 'expo-document-picker'
import * as FileSystem from 'expo-file-system/legacy'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { parseCsv } from '../utils/parseCsv'
import type { CsvImportError, CsvImportResult } from '../utils/csvImport'
import { colors } from '../theme/colors'
import { spacing } from '../theme/spacing'

type CsvImportSectionProps<T> = {
  title: string
  columns: string[]
  validate: (rows: Record<string, string>[]) => CsvImportResult<T>
  onImport: (rows: T[]) => Promise<boolean | void> | boolean | void
  loading?: boolean
}

export function CsvImportSection<T>({
  title,
  columns,
  validate,
  onImport,
  loading = false,
}: CsvImportSectionProps<T>) {
  const [fileName, setFileName] = useState('')
  const [previewRows, setPreviewRows] = useState<Record<string, string>[]>([])
  const [payloads, setPayloads] = useState<T[]>([])
  const [errors, setErrors] = useState<CsvImportError[]>([])
  const [parseError, setParseError] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)

  const reset = () => {
    setFileName('')
    setPreviewRows([])
    setPayloads([])
    setErrors([])
    setParseError(null)
  }

  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['text/csv', 'text/comma-separated-values', 'application/csv'],
      copyToCacheDirectory: true,
      multiple: false,
    })
    if (result.canceled || !result.assets[0]) return
    const asset = result.assets[0]
    setFileName(asset.name)
    setPreviewRows([])
    setPayloads([])
    setErrors([])
    setParseError(null)
    try {
      const text = await FileSystem.readAsStringAsync(asset.uri, {
        encoding: FileSystem.EncodingType.UTF8,
      })
      const rows = parseCsv(text)
      if (!rows.length) {
        setParseError('CSVにデータ行がありません')
        return
      }
      const validation = validate(rows)
      if (validation.success) {
        setPreviewRows(rows)
        setPayloads(validation.rows)
      } else {
        setErrors(validation.errors)
      }
    } catch (error) {
      setParseError(error instanceof Error ? error.message : 'CSVの読み込みに失敗しました')
    }
  }

  const importRows = async () => {
    if (!payloads.length || loading || importing) return
    setImporting(true)
    try {
      const succeeded = await onImport(payloads)
      if (succeeded !== false) reset()
    } finally {
      setImporting(false)
    }
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Pressable style={styles.chooseButton} onPress={() => void pickFile()}>
        <Text style={styles.chooseText}>{fileName || 'CSVファイルを選択'}</Text>
      </Pressable>
      {parseError ? <Text style={styles.error}>{parseError}</Text> : null}
      {errors.length ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorTitle}>{errors.length}件のエラーがあります</Text>
          {errors.map((error, index) => (
            <Text key={`${error.row}-${index}`} style={styles.error}>
              {error.row}行目: {error.reason}
            </Text>
          ))}
        </View>
      ) : null}
      {previewRows.length ? (
        <View style={styles.preview}>
          <Text style={styles.previewTitle}>{previewRows.length}件をインポートします</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View>
              <View style={styles.row}>
                {columns.map((column) => (
                  <Text key={column} style={[styles.cell, styles.headerCell]}>
                    {column}
                  </Text>
                ))}
              </View>
              {previewRows.slice(0, 8).map((row, rowIndex) => (
                <View key={rowIndex} style={styles.row}>
                  {columns.map((column) => (
                    <Text key={column} style={styles.cell} numberOfLines={2}>
                      {row[column] ?? ''}
                    </Text>
                  ))}
                </View>
              ))}
            </View>
          </ScrollView>
          <View style={styles.actions}>
            <Pressable style={styles.cancelButton} onPress={reset}>
              <Text style={styles.cancelText}>キャンセル</Text>
            </Pressable>
            <Pressable
              style={[styles.importButton, (loading || importing) && styles.disabled]}
              onPress={() => void importRows()}
              disabled={loading || importing}
            >
              <Text style={styles.importText}>{importing ? '登録中…' : '登録する'}</Text>
            </Pressable>
          </View>
        </View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    elevation: 2,
    gap: spacing.md,
    padding: spacing.lg,
    shadowColor: '#656CEE',
    shadowOpacity: 0.08,
    shadowRadius: 14,
  },
  title: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
  },
  chooseButton: {
    backgroundColor: colors.input,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 46,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  chooseText: {
    color: colors.text,
    fontSize: 14,
  },
  errorBox: {
    backgroundColor: colors.dangerBackground,
    borderRadius: 8,
    gap: spacing.xs,
    padding: spacing.md,
  },
  errorTitle: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: '800',
  },
  error: {
    color: colors.danger,
    fontSize: 12,
    lineHeight: 18,
  },
  preview: {
    gap: spacing.sm,
  },
  previewTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    color: colors.text,
    fontSize: 12,
    minWidth: 120,
    padding: spacing.sm,
  },
  headerCell: {
    backgroundColor: colors.input,
    color: colors.muted,
    fontWeight: '800',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'flex-end',
  },
  cancelButton: {
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  cancelText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  importButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  importText: {
    color: colors.card,
    fontSize: 13,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.5,
  },
})
