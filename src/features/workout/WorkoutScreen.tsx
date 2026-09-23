import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { CsvImportSection } from '../../components/CsvImportSection'
import { ErrorBanner } from '../../components/ErrorBanner'
import { LoadingOverlay } from '../../components/LoadingOverlay'
import { ScreenContainer } from '../../components/ScreenContainer'
import { ScreenHeader } from '../../components/ScreenHeader'
import type { WorkoutRecord } from '../../types/domain'
import { importWorkoutMigrationRows, importWorkoutRows } from '../../utils/csvImport'
import { colors } from '../../theme/colors'
import { spacing } from '../../theme/spacing'
import { WorkoutCategoryTabs } from './WorkoutCategoryTabs'
import { WorkoutForm } from './WorkoutForm'
import { WorkoutList } from './WorkoutList'
import { useWorkout } from './useWorkout'

export function WorkoutScreen() {
  const {
    items,
    menuSuggestions,
    menuCandidates,
    category,
    setCategory,
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
  } = useWorkout()
  const [editing, setEditing] = useState<WorkoutRecord | null>(null)
  const [copying, setCopying] = useState<WorkoutRecord | null>(null)

  return (
    <View style={styles.root}>
      <ScreenContainer>
        <ScreenHeader title="筋トレ" />
        {error ? <ErrorBanner message={error} onDismiss={clearError} /> : null}
        <WorkoutCategoryTabs
          value={category}
          onChange={(nextCategory) => {
            setCategory(nextCategory)
            setEditing(null)
            setCopying(null)
          }}
        />
        <WorkoutForm
          key={`${editing?.id ?? 'new'}-${copying?.id ?? 'none'}`}
          loading={loading}
          category={category}
          editing={editing}
          copying={copying}
          menuCandidates={menuCandidates}
          menuSuggestions={menuSuggestions}
          onCancelEdit={() => setEditing(null)}
          onClearCopy={() => setCopying(null)}
          onSubmit={(input) => {
            if (editing) {
              void update(editing.id, input).then((succeeded) => {
                if (succeeded) setEditing(null)
              })
            } else {
              void create({ ...input, category })
            }
          }}
        />
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>記録一覧</Text>
          <Pressable style={styles.sortButton} onPress={toggleSortOrder}>
            <Text style={styles.sortText}>{sortOrder === 'desc' ? '新しい順' : '古い順'}</Text>
          </Pressable>
        </View>
        <WorkoutList
          items={items}
          onEdit={setEditing}
          onCopy={setCopying}
          onRemove={(id) => void remove(id)}
        />
        <CsvImportSection
          title="CSVインポート"
          columns={['category', 'menu', 'intensity', 'reps', 'date']}
          validate={importWorkoutRows}
          onImport={createMany}
          loading={loading}
        />
        <CsvImportSection
          title="移行用CSVインポート（ID保持）"
          columns={['id', 'category', 'menu', 'intensity', 'reps', 'created_at']}
          validate={importWorkoutMigrationRows}
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
