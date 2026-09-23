import { ActivityIndicator, StyleSheet, View } from 'react-native'
import { colors } from '../theme/colors'

export function LoadingOverlay({ visible }: { visible: boolean }) {
  if (!visible) return null
  return (
    <View style={styles.container} pointerEvents="none">
      <ActivityIndicator color={colors.primary} size="small" />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 18,
    top: 18,
  },
})
