import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import type { WorkoutRecord } from '../../types/domain'
import { confirmAction } from '../../components/ConfirmDialog'
import { colors } from '../../theme/colors'
import { spacing } from '../../theme/spacing'
import { formatDate } from '../../utils/date'

type WorkoutListProps = {
  items: WorkoutRecord[]
  onEdit: (item: WorkoutRecord) => void
  onCopy: (item: WorkoutRecord) => void
  onRemove: (id: string) => void
}

export function WorkoutList({ items, onEdit, onCopy, onRemove }: WorkoutListProps) {
  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      scrollEnabled={false}
      ListEmptyComponent={<Text style={styles.empty}>まだ筋トレ記録がありません</Text>}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.date}>{formatDate(item.created_at)}</Text>
            <View style={styles.actions}>
              <Pressable onPress={() => onCopy(item)}>
                <Text style={styles.action}>コピー</Text>
              </Pressable>
              <Pressable onPress={() => onEdit(item)}>
                <Text style={styles.action}>編集</Text>
              </Pressable>
              <Pressable
                onPress={() =>
                  confirmAction('この筋トレ記録を削除しますか？', () => onRemove(item.id))
                }
              >
                <Text style={[styles.action, styles.delete]}>削除</Text>
              </Pressable>
            </View>
          </View>
          <View style={styles.record}>
            <Text style={styles.menu}>{item.menu}</Text>
            <Text style={styles.stats}>
              {item.intensity} kg × {item.reps} 回
            </Text>
          </View>
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
    gap: spacing.sm,
  },
  action: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  delete: {
    color: colors.danger,
  },
  record: {
    alignItems: 'baseline',
    flexDirection: 'row',
    gap: spacing.md,
  },
  menu: {
    color: colors.text,
    flex: 1,
    fontSize: 17,
    fontWeight: '800',
  },
  stats: {
    color: colors.text,
    fontSize: 14,
  },
})
