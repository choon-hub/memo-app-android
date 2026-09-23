# memo-app Android

Nuxt版の記録機能を、Expo Router + React Native + SQLiteでAndroid向けに移植したアプリです。
データは端末内SQLiteに保存し、Supabaseやネットワーク接続を必要としません。

## セットアップ

```bash
npm install
npx expo prebuild --platform android
npm run android
```

`npm run android` で実機またはエミュレーターへdevelopment buildをインストールするには、
Android SDKと`adb`を設定してください。Expo Goで画面を確認する場合は`npm start`を使用できます。

## 検証コマンド

```bash
npm test
npm run lint
npm run typecheck
npx expo-doctor
npx expo export --platform android
```

APKはEASのpreview profileで生成できます。

```bash
npx eas build --platform android --profile preview
```

## データ移行

既存Supabaseの実データはリポジトリへ保存せず、`scripts/README.md`の移行用CSV仕様に従って
アプリ内の「移行用CSVインポート」から登録してください。必要に応じて
`scripts/convert-supabase-export.ts`でローカルJSONエクスポートを移行CSVへ変換できます。
