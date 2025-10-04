# ハードコーディングされた値の一覧

## 日本語テキスト

| ファイル名 | 行数 | 値 | 役割/コンテキスト |
|---|---|---|---|
| `lib/utils.ts` | 41 | `0日` | 年齢計算の単位 |
| `components/ui/AccountLinker.tsx` | 44 | `確認のため、メールアドレスを再度入力してください。` | プロンプトメッセージ |
| `components/ui/AccountLinker.tsx` | 59 | `メールアドレスを連携しました！` | 成功通知 (toast) |
| `components/ui/AccountLinker.tsx` | 73 | `このメールアドレスアカウントが既に使用されています。登録されていないメールアドレスを使用してください。` | エラー通知 (toast) |
| `components/ui/AccountLinker.tsx` | 83 | `連携セッションが見つかりません。再度ゲストとしてログインしてからお試しください。` | エラー通知 (toast) |
| `components/ui/AccountLinker.tsx` | 98 | `Googleアカウントを連携しました！` | 成功通知 (toast) |
| `components/ui/AccountLinker.tsx` | 110 | `このGoogleアカウントは既に使用されています。登録されていないGoogleアカウントを使用してください。` | エラー通知 (toast) |
| `components/ui/AccountLinker.tsx` | 123 | `メールアドレスを入力してください。` | エラー通知 (toast) |
| `components/ui/AccountLinker.tsx` | 127 | `有効なメールアドレスを入力してください。` | エラー通知 (toast) |
| `components/ui/AccountLinker.tsx` | 173 | `リンクを送信` | ボタンテキスト |
| `components/ui/AccountLinker.tsx` | 199 | `Googleアカウントと連携` | ボタンテキスト |


## URL

| ファイル名 | 行数 | 値 | 役割/コンテキスト |
|---|---|---|---|
| `lib/firebase.ts` | 40 | `http://localhost:9099` | Firebase Authエミュレータ接続 |
| `app/layout.tsx` | 33 | `https://aina-life-dev.web.app` | OGP/メタデータ URL |
| `app/layout.tsx` | 37 | `https://aina-life-dev.web.app/huku.png` | OGP/メタデータ 画像URL |
| `app/layout.tsx` | 49 | `https://aina-life-dev.web.app/huku.png` | Twitterカード 画像URL |

## マジックナンバー

（UIのクラス名などに含まれる数値はノイズが多いため、計算式や条件比較、設定値などで使われている特徴的なものを中心に抜粋しています）

| ファイル名 | 行数 | 値 | 役割/コンテキスト |
|---|---|---|---|
| `lib/firebase.ts` | 40 | `9099` | Firebase Authエミュレータのポート番号 |
| `lib/firebase.ts` | 41 | `8080` | Firestoreエミュレータのポート番号 |
| `lib/firebase.ts` | 42 | `9199` | Storageエミュレータのポート番号 |
| `app/layout.tsx` | 38 | `1070` | OGP画像の幅 |
| `app/layout.tsx` | 39 | `1070` | OGP画像の高さ |
| `components/PetAddForm.tsx` | 129 | `1024` | ファイルサイズ計算 (KB) |
| `components/TaskSelector.tsx` | 31 | `1000` | `setInterval` の時間 (1秒) |
| `components/WeightChart.tsx` | 78 | `300` | グラフの高さ |
| `hooks/useLogs.ts` | 118 | `999` | `setHours` のミリ秒設定 |

## カラーコード

| ファイル名 | 行数 | 値 | 役割/コンテキスト |
|---|---|---|---|
| `hooks/useUser.ts` | 144-149 | `#e5e7eb`, `#6b7280`, `#4b5563`, `#9ca3af` | DB保存用のデフォルト配色設定 |
| `components/TaskHistory.tsx` | 54, 64, 65 | `#FFFFFF` | デフォルトの文字色 |
| `components/TaskForm.tsx` | 36, 51 | `#000000` | フォームの初期値 (背景色) |
| `components/TaskForm.tsx` | 37, 48, 51 | `#FFFFFF` | フォームの初期値 (文字色) |
| `components/WeightChart.tsx` | 109 | `#8884d8` | グラフの線の色 |
| `hooks/useLogs.ts` | 179-187 | `#e5e7eb`, `#6b7280`, `#4b5563`, `#cccccc`, `#000000` | ログ表示のフォールバック色 |
| `hooks/useLogs.ts` | 196, 197 | `#6b7280`, `#ff0000` | 削除済みログのデフォルト色 |
| `app/layout.tsx` | 54 | `#000000` | メタデータ (テーマカラー) |
| `app/profile/page.tsx` | 65-77, 124-129, 471-492 | `#e5e7eb`, `#6b7280`, `#4b5563`, `#9ca3af` | UIのフォールバック配色設定 |
