import { Pressable, StyleSheet, Text, View } from 'react-native'
import { colors } from '../theme/colors'
import { spacing } from '../theme/spacing'

export function ErrorBanner({ message, onDismiss }: { message: string; onDismiss?: () => void }) {
  return (
    <View style={styles.container} accessibilityRole="alert">
      <Text style={styles.message}>{message}</Text>
      {onDismiss ? (
        <Pressable onPress={onDismiss} accessibilityRole="button">
          <Text style={styles.dismiss}>閉じる</Text>
        </Pressable>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.dangerBackground,
    borderRadius: 10,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  message: {
    color: colors.danger,
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
  },
  dismiss: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '700',
  },
})
