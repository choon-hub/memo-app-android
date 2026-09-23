import { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { CsvImportSection } from '../../components/CsvImportSection'
import { ErrorBanner } from '../../components/ErrorBanner'
import { LoadingOverlay } from '../../components/LoadingOverlay'
import { ScreenContainer } from '../../components/ScreenContainer'
import { ScreenHeader } from '../../components/ScreenHeader'
import type { Topic } from '../../types/domain'
import { importTopicMigrationRows, importTopicRows } from '../../utils/csvImport'
import { colors } from '../../theme/colors'
import { spacing } from '../../theme/spacing'
import { TopicForm } from './TopicForm'
import { TopicList } from './TopicList'
import { useTopics } from './useTopics'

export function TopicsScreen() {
  const {
    items,
    persons,
    selectedPerson,
    setSelectedPerson,
    clearPersonFilter,
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
  } = useTopics()
  const [editing, setEditing] = useState<Topic | null>(null)

  return (
    <View style={styles.root}>
      <ScreenContainer>
        <ScreenHeader title="日々のトピック" />
        {error ? <ErrorBanner message={error} onDismiss={clearError} /> : null}
        <TopicForm
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
        {persons.length ? (
          <View style={styles.filterSection}>
            <View style={styles.filterHeader}>
              <Text style={styles.sectionTitle}>人物で絞り込み</Text>
              {selectedPerson ? (
                <Pressable onPress={clearPersonFilter}>
                  <Text style={styles.clearFilter}>解除</Text>
                </Pressable>
              ) : null}
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.filters}>
                {persons.map((person) => (
                  <Pressable
                    key={person}
                    onPress={() => setSelectedPerson(person)}
                    style={[styles.filterChip, selectedPerson === person && styles.activeFilter]}
                  >
                    <Text
                      style={[
                        styles.filterText,
                        selectedPerson === person && styles.activeFilterText,
                      ]}
                    >
                      {person}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </View>
        ) : null}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>記録一覧</Text>
          <Pressable style={styles.sortButton} onPress={toggleSortOrder}>
            <Text style={styles.sortText}>{sortOrder === 'desc' ? '新しい順' : '古い順'}</Text>
          </Pressable>
        </View>
        <TopicList items={items} onEdit={setEditing} onRemove={(id) => void remove(id)} />
        <CsvImportSection
          title="CSVインポート"
          columns={['content', 'date']}
          validate={importTopicRows}
          onImport={createMany}
          loading={loading}
        />
        <CsvImportSection
          title="移行用CSVインポート（人物タグ・ID保持）"
          columns={['id', 'content', 'persons_json', 'created_at']}
          validate={importTopicMigrationRows}
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
  filterSection: {
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
  },
  filterHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: spacing.lg,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
  },
  clearFilter: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  filters: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  filterChip: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  activeFilter: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  activeFilterText: {
    color: colors.card,
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
