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

## APKビルド

### EASでAPKを生成する方法（推奨）

EASの`preview` profileは`distribution: internal`と`android.buildType: apk`を使用するため、
インストール可能なAPKを生成します。初回のみExpoアカウントへのログインとEASプロジェクトの
設定が必要です。

```bash
npx eas-cli@latest login
npx eas-cli@latest build:configure
npx eas-cli@latest build --platform android --profile preview
```

ビルド完了後に表示されるURLからAPKをダウンロードできます。EAS上の既存プロジェクトへ
紐付ける場合は、`app.json`の`slug`とExpoアカウント設定を確認してください。

APKを端末へインストールする場合は、Android SDKの`adb`を使えます。

```bash
adb install -r ./memo-app.apk
```

### ローカルGradleでAPKを生成する方法

ローカルビルドにはAndroid SDK、JDK、`ANDROID_HOME`または`ANDROID_SDK_ROOT`、
`adb`が必要です。managed workflowのため`android/`ディレクトリは生成物としてGit管理外に
なっています。

```bash
npm install
npx expo prebuild --platform android
cd android
./gradlew assembleDebug
```

生成されたデバッグAPKは次の場所にあります。

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

実機またはエミュレーターへインストールするには、次を実行します。

```bash
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

配布用の署名済みAPKは、署名設定を用意したうえで`assembleRelease`を実行してください。
署名情報やキーストアはリポジトリへ保存しないでください。EASのproduction profileは
APKではなくAABを生成する設定のため、APKが必要な場合は`preview` profileを使用します。

### ビルド前の確認

```bash
npm test
npm run lint
npm run typecheck
npx expo-doctor
npx expo export --platform android
```

## データ移行

既存Supabaseの実データはリポジトリへ保存せず、`scripts/README.md`の移行用CSV仕様に従って
アプリ内の「移行用CSVインポート」から登録してください。必要に応じて
`scripts/convert-supabase-export.ts`でローカルJSONエクスポートを移行CSVへ変換できます。
