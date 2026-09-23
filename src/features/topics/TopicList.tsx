import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import type { Topic } from '../../types/domain'
import { confirmAction } from '../../components/ConfirmDialog'
import { colors } from '../../theme/colors'
import { spacing } from '../../theme/spacing'
import { formatDate } from '../../utils/date'

type TopicListProps = {
  items: Topic[]
  onEdit: (item: Topic) => void
  onRemove: (id: string) => void
}

export function TopicList({ items, onEdit, onRemove }: TopicListProps) {
  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      scrollEnabled={false}
      ListEmptyComponent={<Text style={styles.empty}>まだトピックがありません</Text>}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.date}>{formatDate(item.created_at)}</Text>
            <View style={styles.actions}>
              <Pressable onPress={() => onEdit(item)}>
                <Text style={styles.action}>編集</Text>
              </Pressable>
              <Pressable
                onPress={() =>
                  confirmAction('このトピックを削除しますか？', () => onRemove(item.id))
                }
              >
                <Text style={[styles.action, styles.delete]}>削除</Text>
              </Pressable>
            </View>
          </View>
          <Text style={styles.content}>{item.content}</Text>
          {item.persons.length ? (
            <View style={styles.tags}>
              {item.persons.map((person) => (
                <Text key={person} style={styles.tag}>
                  {person}
                </Text>
              ))}
            </View>
          ) : null}
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
  content: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 22,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tag: {
    backgroundColor: colors.primarySoft,
    borderRadius: 12,
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
    overflow: 'hidden',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
})
