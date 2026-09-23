import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import type { DailyNew } from '../../types/domain'
import { confirmAction } from '../../components/ConfirmDialog'
import { colors } from '../../theme/colors'
import { spacing } from '../../theme/spacing'
import { formatDate } from '../../utils/date'

type DailyNewListProps = {
  items: DailyNew[]
  onEdit: (item: DailyNew) => void
  onRemove: (id: string) => void
}

export function DailyNewList({ items, onEdit, onRemove }: DailyNewListProps) {
  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      scrollEnabled={false}
      ListEmptyComponent={<Text style={styles.empty}>まだ記録がありません</Text>}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.date}>{formatDate(item.created_at)}</Text>
            <View style={styles.actions}>
              <Pressable onPress={() => onEdit(item)} accessibilityRole="button">
                <Text style={styles.action}>編集</Text>
              </Pressable>
              <Pressable
                onPress={() => confirmAction('この1日1新を削除しますか？', () => onRemove(item.id))}
                accessibilityRole="button"
              >
                <Text style={[styles.action, styles.delete]}>削除</Text>
              </Pressable>
            </View>
          </View>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.content}>{item.content}</Text>
        </View>
      )}
    />
  )
}

const styles = StyleSheet.create({
  empty: {
    color: colors.muted,
    fontSize: 14,
    padding: spacing.xl,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    elevation: 1,
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.lg,
    shadowColor: '#656CEE',
    shadowOpacity: 0.06,
    shadowRadius: 10,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  date: {
    color: colors.muted,
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  action: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  delete: {
    color: colors.danger,
  },
  title: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  content: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 22,
  },
})
