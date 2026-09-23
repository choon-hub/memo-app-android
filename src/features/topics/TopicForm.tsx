import { useState } from 'react'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import type { Topic } from '../../types/domain'
import { CalendarField } from '../../components/CalendarField'
import { colors } from '../../theme/colors'
import { spacing } from '../../theme/spacing'
import { getTodayDateInput, toDateInputValue } from '../../utils/date'
import { PersonTagInput } from './PersonTagInput'

type TopicFormProps = {
  loading?: boolean
  editing?: Topic | null
  onSubmit: (input: { content: string; persons: string[]; created_at: string }) => void
  onCancelEdit: () => void
}

export function TopicForm({ loading, editing, onSubmit, onCancelEdit }: TopicFormProps) {
  const [content, setContent] = useState(editing?.content ?? '')
  const [persons, setPersons] = useState<string[]>(editing?.persons ?? [])
  const [date, setDate] = useState(
    editing ? toDateInputValue(editing.created_at) : getTodayDateInput(),
  )

  const canSubmit = Boolean(content.trim() && date && !loading)
  const submit = () => {
    if (!canSubmit) return
    onSubmit({
      content: content.trim(),
      persons,
      created_at: `${date}T00:00:00.000Z`,
    })
    if (!editing) {
      setContent('')
      setPersons([])
      setDate(getTodayDateInput())
    }
  }

  return (
    <View style={styles.card}>
      <Text style={styles.heading}>{editing ? 'トピックを編集' : '今日のトピック'}</Text>
      <View style={styles.field}>
        <Text style={styles.label}>トピック</Text>
        <TextInput
          value={content}
          onChangeText={setContent}
          placeholder="今日あったことを書いてみましょう…"
          placeholderTextColor={colors.muted}
          style={[styles.input, styles.textarea]}
          multiline
          textAlignVertical="top"
        />
      </View>
      <CalendarField label="日付" value={date} onChange={setDate} />
      <View style={styles.field}>
        <Text style={styles.label}>人物</Text>
        <PersonTagInput persons={persons} onChange={setPersons} />
      </View>
      <View style={styles.actions}>
        {editing ? (
          <Pressable style={styles.cancelButton} onPress={onCancelEdit}>
            <Text style={styles.cancelText}>キャンセル</Text>
          </Pressable>
        ) : null}
        <Pressable
          style={[styles.submitButton, !canSubmit && styles.disabled]}
          onPress={submit}
          disabled={!canSubmit}
        >
          <Text style={styles.submitText}>{editing ? '更新する' : '追加する'}</Text>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    elevation: 2,
    gap: spacing.md,
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
    shadowColor: '#656CEE',
    shadowOpacity: 0.08,
    shadowRadius: 14,
  },
  heading: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  field: {
    gap: spacing.xs,
  },
  label: {
    color: colors.label,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: colors.input,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.text,
    fontSize: 14,
    minHeight: 46,
    paddingHorizontal: spacing.md,
  },
  textarea: {
    minHeight: 92,
    paddingTop: spacing.md,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'flex-end',
  },
  cancelButton: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 46,
    paddingHorizontal: spacing.lg,
  },
  cancelText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  submitButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
    minHeight: 46,
  },
  submitText: {
    color: colors.card,
    fontSize: 15,
    fontWeight: '800',
  },
  disabled: {
    opacity: 0.4,
  },
})
