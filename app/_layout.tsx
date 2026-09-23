import { Stack } from 'expo-router'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { LocalDatabaseProvider } from '../src/db/database'

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <LocalDatabaseProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </LocalDatabaseProvider>
    </SafeAreaProvider>
  )
}
