import { StyleSheet, Text, View } from 'react-native'
import { colors } from '../theme/colors'
import { spacing } from '../theme/spacing'

export function ScreenHeader({ title }: { title: string }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '800',
  },
})
