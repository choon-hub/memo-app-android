import { Pressable, StyleSheet, Text, View } from 'react-native'
import type { WorkoutCategory } from '../../types/domain'
import { colors } from '../../theme/colors'
import { spacing } from '../../theme/spacing'

const tabs: { value: WorkoutCategory; label: string }[] = [
  { value: 'chest', label: '胸' },
  { value: 'back', label: '背中' },
  { value: 'legs', label: '脚' },
]

export function WorkoutCategoryTabs({
  value,
  onChange,
}: {
  value: WorkoutCategory
  onChange: (value: WorkoutCategory) => void
}) {
  return (
    <View style={styles.container}>
      {tabs.map((tab) => (
        <Pressable
          key={tab.value}
          style={[styles.tab, value === tab.value && styles.active]}
          onPress={() => onChange(tab.value)}
          accessibilityRole="tab"
          accessibilityState={{ selected: value === tab.value }}
        >
          <Text style={[styles.label, value === tab.value && styles.activeLabel]}>{tab.label}</Text>
        </Pressable>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    padding: spacing.xs,
  },
  tab: {
    alignItems: 'center',
    borderRadius: 9,
    flex: 1,
    paddingVertical: spacing.sm,
  },
  active: {
    backgroundColor: colors.primary,
  },
  label: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '800',
  },
  activeLabel: {
    color: colors.card,
  },
})
