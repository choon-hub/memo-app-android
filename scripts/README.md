# CSV移行スクリプト

既存Supabaseのデータは、Supabaseダッシュボードまたは既存環境で安全にCSVへ
エクスポートしてから、アプリの「移行用CSVインポート」で端末へ登録します。

3テーブルをJSON配列としてまとめたローカルエクスポートがある場合は、次の変換スクリプトで
移行CSVを生成できます。入力JSONや生成CSVに認証情報を含めないでください。

```bash
node --experimental-strip-types scripts/convert-supabase-export.ts \
  --input ./supabase-export.json \
  --output-dir ./migration-csv
```

入力JSONの形式は `{ "daily_new": [], "topics": [], "workout_records": [] }` です。

移行CSVは以下の列を保持してください。

- `daily_new_migration.csv`: `id,title,content,created_at`
- `topics_migration.csv`: `id,content,persons_json,created_at`
- `workout_records_migration.csv`: `id,category,menu,intensity,reps,created_at`

このリポジトリには実データやSupabase認証情報を保存しません。CSVには改行・カンマ・
ダブルクォートが含まれる可能性があるため、RFC 4180互換のCSVエクスポートを使用してください。
