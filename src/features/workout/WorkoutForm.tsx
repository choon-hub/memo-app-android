import { useState } from 'react'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import type { WorkoutCategory, WorkoutRecord } from '../../types/domain'
import { CalendarField } from '../../components/CalendarField'
import { colors } from '../../theme/colors'
import { spacing } from '../../theme/spacing'
import { getTodayDateInput, toDateInputValue } from '../../utils/date'

type WorkoutFormProps = {
  loading?: boolean
  category: WorkoutCategory
  editing?: WorkoutRecord | null
  copying?: WorkoutRecord | null
  menuCandidates: string[]
  menuSuggestions: string[]
  onSubmit: (input: { menu: string; intensity: number; reps: number; created_at: string }) => void
  onCancelEdit: () => void
  onClearCopy: () => void
}

export function WorkoutForm({
  loading,
  category,
  editing,
  copying,
  menuCandidates,
  menuSuggestions,
  onSubmit,
  onCancelEdit,
  onClearCopy,
}: WorkoutFormProps) {
  const prefill = editing ?? copying
  const [menu, setMenu] = useState(prefill?.menu ?? '')
  const [intensity, setIntensity] = useState(prefill ? String(prefill.intensity) : '')
  const [reps, setReps] = useState(prefill ? String(prefill.reps) : '')
  const [date, setDate] = useState(
    prefill ? toDateInputValue(prefill.created_at) : getTodayDateInput(),
  )

  const intensityNumber = Number(intensity)
  const repsNumber = Number(reps)
  const canSubmit = Boolean(
    menu.trim() &&
    intensity !== '' &&
    Number.isFinite(intensityNumber) &&
    intensityNumber >= 0 &&
    reps !== '' &&
    Number.isInteger(repsNumber) &&
    repsNumber > 0 &&
    date &&
    !loading,
  )

  const submit = () => {
    if (!canSubmit) return
    onSubmit({
      menu: menu.trim(),
      intensity: intensityNumber,
      reps: repsNumber,
      created_at: `${date}T00:00:00.000Z`,
    })
    if (!editing) {
      setMenu('')
      setIntensity('')
      setReps('')
      setDate(getTodayDateInput())
      onClearCopy()
    }
  }

  return (
    <View style={styles.card}>
      <Text style={styles.heading}>{editing ? '筋トレ記録を編集' : 'トレーニングを記録'}</Text>
      {menuCandidates.length ? (
        <View style={styles.candidates}>
          {menuCandidates.map((candidate) => (
            <Pressable key={candidate} style={styles.chip} onPress={() => setMenu(candidate)}>
              <Text style={styles.chipText}>{candidate}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
      <View style={styles.fields}>
        <View style={styles.menuField}>
          <Text style={styles.label}>メニュー</Text>
          <TextInput
            value={menu}
            onChangeText={setMenu}
            placeholder="種目名"
            placeholderTextColor={colors.muted}
            style={styles.input}
          />
          {menuSuggestions.length ? (
            <View style={styles.suggestions}>
              {menuSuggestions.slice(0, 5).map((suggestion) => (
                <Pressable key={suggestion} onPress={() => setMenu(suggestion)}>
                  <Text style={styles.suggestion}>{suggestion}</Text>
                </Pressable>
              ))}
            </View>
          ) : null}
        </View>
        <View style={styles.numberField}>
          <Text style={styles.label}>重量 kg</Text>
          <TextInput
            value={intensity}
            onChangeText={setIntensity}
            placeholder="0"
            placeholderTextColor={colors.muted}
            keyboardType="decimal-pad"
            style={styles.input}
          />
        </View>
        <View style={styles.numberField}>
          <Text style={styles.label}>回数</Text>
          <TextInput
            value={reps}
            onChangeText={setReps}
            placeholder="1"
            placeholderTextColor={colors.muted}
            keyboardType="number-pad"
            style={styles.input}
          />
        </View>
      </View>
      <CalendarField label="日付" value={date} onChange={setDate} />
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
          <Text style={styles.submitText}>{editing ? '更新する' : '記録する'}</Text>
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
  candidates: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    backgroundColor: colors.primarySoft,
    borderRadius: 14,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  chipText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  fields: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  menuField: {
    flex: 2,
    gap: spacing.xs,
  },
  numberField: {
    flex: 1,
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
    paddingHorizontal: spacing.sm,
  },
  suggestions: {
    gap: spacing.xs,
  },
  suggestion: {
    color: colors.primary,
    fontSize: 11,
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
