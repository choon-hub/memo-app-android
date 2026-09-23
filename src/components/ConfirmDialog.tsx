import { Alert } from 'react-native'

export function confirmAction(message: string, onConfirm: () => void) {
  Alert.alert('確認', message, [
    { text: 'キャンセル', style: 'cancel' },
    { text: '削除する', style: 'destructive', onPress: onConfirm },
  ])
}
