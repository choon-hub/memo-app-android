import { useState } from 'react'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { colors } from '../../theme/colors'
import { spacing } from '../../theme/spacing'

export function PersonTagInput({
  persons,
  onChange,
}: {
  persons: string[]
  onChange: (persons: string[]) => void
}) {
  const [value, setValue] = useState('')

  const add = () => {
    const person = value.trim()
    if (!person || persons.includes(person)) {
      setValue('')
      return
    }
    onChange([...persons, person])
    setValue('')
  }

  return (
    <View style={styles.container}>
      <View style={styles.inputRow}>
        <TextInput
          value={value}
          onChangeText={setValue}
          onSubmitEditing={add}
          placeholder="人物名を入力"
          placeholderTextColor={colors.muted}
          style={styles.input}
          returnKeyType="done"
        />
        <Pressable style={styles.addButton} onPress={add}>
          <Text style={styles.addText}>追加</Text>
        </Pressable>
      </View>
      <View style={styles.tags}>
        {persons.map((person) => (
          <View key={person} style={styles.tag}>
            <Text style={styles.tagText}>{person}</Text>
            <Pressable onPress={() => onChange(persons.filter((item) => item !== person))}>
              <Text style={styles.remove}>×</Text>
            </Pressable>
          </View>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  inputRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  input: {
    backgroundColor: colors.input,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.text,
    flex: 1,
    fontSize: 14,
    minHeight: 46,
    paddingHorizontal: spacing.md,
  },
  addButton: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: 8,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  addText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '800',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tag: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: 14,
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  tagText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  remove: {
    color: colors.primary,
    fontSize: 17,
    lineHeight: 17,
  },
})
