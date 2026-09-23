import { useState } from 'react'
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker'
import { colors } from '../theme/colors'
import { spacing } from '../theme/spacing'
import { formatDate, isValidDateInput } from '../utils/date'

type CalendarFieldProps = {
  label: string
  value: string
  onChange: (value: string) => void
}

export function CalendarField({ label, value, onChange }: CalendarFieldProps) {
  const [open, setOpen] = useState(false)
  const [year, month, day] = value.split('-').map(Number)
  const selectedDate =
    isValidDateInput(value) && year && month && day ? new Date(year, month - 1, day) : new Date()

  const handleChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') setOpen(false)
    if (event.type === 'set' && date) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      onChange(`${year}-${month}-${day}`)
    }
  }

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        style={styles.input}
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`${label} ${value}`}
      >
        <Text style={styles.value}>
          {value ? formatDate(`${value}T00:00:00.000Z`) : '日付を選択'}
        </Text>
        <Text style={styles.icon}>▣</Text>
      </Pressable>
      {open ? (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleChange}
        />
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
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
    alignItems: 'center',
    backgroundColor: colors.input,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 46,
    paddingHorizontal: spacing.md,
  },
  value: {
    color: colors.text,
    fontSize: 14,
  },
  icon: {
    color: colors.primary,
    fontSize: 17,
  },
})
