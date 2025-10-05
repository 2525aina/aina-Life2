# aina-Life2 - ペットケア管理アプリ

## 概要

aina-Life2は、Next.jsとFirebaseで構築された、ペットの健康と日々の活動を管理するためのモダンなWebアプリケーションです。大切なペットとの生活をより豊かに、そして楽しくサポートすることを目的としています。

## 主な機能

| カテゴリ | 機能名 | 詳細 |
| :--- | :--- | :--- |
| **ユーザー管理** | ユーザー認証 | パスワードレス（メールリンク）、Google、匿名でのログインに対応。 |
| | アカウント連携 | 匿名ユーザーがデータを保持したまま正規アカウントへ移行可能。 |
| | プロフィール管理 | ユーザー名の設定・変更ができます。 |
| **ペット管理** | ペット情報登録 | 複数ペットの登録（名前、種類、誕生日など）。編集・削除も可能です。 |
| | ペット画像 | 各ペットにプロフィール画像を設定できます。 |
| | 健康記録 | 体重を記録し、グラフで推移を視覚的に確認できます。 |
| | ペット切り替え | ヘッダーから簡単に表示するペットを切り替えられます。 |
| **タスク・ログ管理**| タスク設定 | ペットごとに日々のタスク（ご飯、散歩など）を登録・編集・削除できます。 |
| | タスクのカスタマイズ | タスクごとに色を設定可能。表示順の並べ替えにも対応しています。 |
| | ログ記録 | ホーム画面からワンクリックでタスクの実行を記録できます。 |
| | ログ閲覧 | タイムライン形式で日々の記録を閲覧。日付ナビゲーションで過去のログも確認可能です。|
| **UI/UX** | レスポンシブデザイン | スマートフォンからデスクトップまで、各種デバイスに最適化された表示。 |
| | モダンなUI | Shadcn/uiを採用し、洗練されたデザインと直感的な操作性を実現しています。 |
| | 各種UIコンポーネント | ローディング表示、通知（Toast）、日付時刻ピッカーなど、UXを向上させる要素を実装。|

## 使用技術

-   **フレームワーク:** Next.js (App Router)
-   **言語:** TypeScript
-   **UIライブラリ:** React
-   **CSSフレームワーク:** Tailwind CSS
-   **UIコンポーネント:** Shadcn/ui
-   **バックエンド:** Firebase (Authentication, Firestore)
-   **日付操作:** date-fns
-   **アイコン:** lucide-react

## セットアップ方法

プロジェクトをローカル環境でセットアップし、実行するための手順です。

1.  **リポジトリをクローンします:**
    ```bash
    git clone https://github.com/2525aina/aina-Life2.git
    cd aina-Life2
    ```

2.  **依存関係をインストールします:**
    ```bash
    npm install
    ```

3.  **Firebaseプロジェクトの設定:**
    *   [Firebaseコンソール](https://console.firebase.google.com/)で新しいプロジェクトを作成し、Webアプリを追加します。
    *   プロジェクトのルートディレクトリに `.env.local` ファイルを作成し、Firebaseの構成情報を設定します。以下は例です。
        ```
        NEXT_PUBLIC_FIREBASE_API_KEY="YOUR_API_KEY"
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="YOUR_AUTH_DOMAIN"
        NEXT_PUBLIC_FIREBASE_PROJECT_ID="YOUR_PROJECT_ID"
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="YOUR_STORAGE_BUCKET"
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="YOUR_MESSAGING_SENDER_ID"
        NEXT_PUBLIC_FIREBASE_APP_ID="YOUR_APP_ID"
        NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="YOUR_MEASUREMENT_ID"
        NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true # エミュレータを使用する場合
        ```
    *   Firebaseエミュレータを使用する場合は、`firebase.json` と `.firebaserc` がプロジェクトルートに存在することを確認し、以下のコマンドで起動します。
        ```bash
        npm install -g firebase-tools
        firebase emulators:start
        ```

4.  **開発サーバーを起動します:**
    ```bash
    rm -rf .next
    rm -rf node_modules
    sudo chown -R 501:20 "/Users/nakajimadaichi/.npm"
    npm install
    npm run dev
    ```

5.  ブラウザで `http://localhost:3000` にアクセスすると、アプリケーションが表示されます。
6.  公開
    ```bash
    npm run lint
    npm run build
    firebase deploy --only hosting
    ```

## 使い方

1.  ログインページから新しいアカウントを作成するか、既存のGoogleアカウントでログインします。
2.  ログイン後、ヘッダーのナビゲーションから「ペット管理」ページへ移動し、新しいペットを登録します。
3.  「タスク管理」ページで、登録したペットに日々のタスク（例: ご飯、散歩）を登録します。
4.  ホーム画面に戻ると、選択中のペットのタスクボタンが表示されます。タスクボタンをクリックすると、そのタスクの実行ログが記録されます。
5.  ホーム画面の日付ナビゲーションを使って、過去の記録を確認したり、手動でログを追加・編集・削除したりできます。

## 今後の展望

aina-Life2は、ユーザーの皆様からのフィードバックを元に、継続的なアップデートを計画しています。

### 最近実装された主な機能

*   **UI/UXの改善:** ローディング表示、エラー通知(Toast)、日付ピッカーの改善を行いました。
*   **ペット管理:** 画像アップロード、年齢表示、体重の記録とグラフ表示機能を追加しました。
*   **タスク管理:** タスクの色分けや並べ替え機能のUIを改善しました。
*   **認証機能:** パスワードレス、匿名ログイン、アカウント連携など、認証方法を拡充しました。

### 今後の開発予定

*   **機能の深化:**
    *   ペットの健康記録（体温、食事、投薬、通院履歴など）の更なる詳細化
    *   ペットの共有機能
    *   タスクのリマインダー通知機能
    *   プロフィール画像のアップロード
*   **技術的な改善:**
    *   オフラインサポートの検討
    *   テストコードの導入による品質向上
    *   パフォーマンスモニタリングの導入
*   **その他:**
    *   アクセシビリティの向上
    *   データのエクスポート/インポート機能