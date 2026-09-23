import { Pressable, StyleSheet, Text, View } from 'react-native'
import { CsvImportSection } from '../../components/CsvImportSection'
import { ErrorBanner } from '../../components/ErrorBanner'
import { LoadingOverlay } from '../../components/LoadingOverlay'
import { ScreenContainer } from '../../components/ScreenContainer'
import { ScreenHeader } from '../../components/ScreenHeader'
import type { DailyNew } from '../../types/domain'
import { importDailyNewMigrationRows, importDailyNewRows } from '../../utils/csvImport'
import { colors } from '../../theme/colors'
import { spacing } from '../../theme/spacing'
import { DailyNewForm } from './DailyNewForm'
import { DailyNewList } from './DailyNewList'
import { useDailyNew } from './useDailyNew'
import { useState } from 'react'

export function DailyNewScreen() {
  const {
    items,
    sortOrder,
    loading,
    error,
    create,
    createMany,
    importMany,
    update,
    remove,
    toggleSortOrder,
    clearError,
  } = useDailyNew()
  const [editing, setEditing] = useState<DailyNew | null>(null)

  return (
    <View style={styles.root}>
      <ScreenContainer>
        <ScreenHeader title="1日1新" />
        {error ? <ErrorBanner message={error} onDismiss={clearError} /> : null}
        <DailyNewForm
          key={editing?.id ?? 'new'}
          loading={loading}
          editing={editing}
          onCancelEdit={() => setEditing(null)}
          onSubmit={(input) => {
            if (editing) {
              void update(editing.id, input).then((succeeded) => {
                if (succeeded) setEditing(null)
              })
            } else {
              void create(input)
            }
          }}
        />
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>記録一覧</Text>
          <Pressable style={styles.sortButton} onPress={toggleSortOrder}>
            <Text style={styles.sortText}>{sortOrder === 'desc' ? '新しい順' : '古い順'}</Text>
          </Pressable>
        </View>
        <DailyNewList items={items} onEdit={setEditing} onRemove={(id) => void remove(id)} />
        <CsvImportSection
          title="CSVインポート"
          columns={['title', 'content', 'date']}
          validate={importDailyNewRows}
          onImport={createMany}
          loading={loading}
        />
        <CsvImportSection
          title="移行用CSVインポート（ID保持）"
          columns={['id', 'title', 'content', 'created_at']}
          validate={importDailyNewMigrationRows}
          onImport={importMany}
          loading={loading}
        />
      </ScreenContainer>
      <LoadingOverlay visible={loading} />
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.background,
    flex: 1,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: spacing.lg,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  sortButton: {
    backgroundColor: colors.primarySoft,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  sortText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
})
