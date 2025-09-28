# aina-Life2 - ペットケア管理アプリ

## 概要

aina-Life2は、Next.jsとFirebaseで構築された、ペットの健康と日々の活動を管理するためのモダンなWebアプリケーションです。大切なペットとの生活をより豊かに、そして楽しくサポートすることを目的としています。

## 主な機能

-   **ユーザー認証:** メールアドレス/パスワード、Googleアカウントによる安全なログイン機能を提供します。
-   **ペット管理:** 複数のペットを登録し、名前、種類、誕生日などの情報を編集・削除できます。
-   **タスク管理:** 各ペットに紐づく日々のタスク（例: ご飯、散歩、投薬）を登録、編集、削除できます。
-   **日々の記録（ログブック）:** 登録したタスクの実行ログを簡単に記録し、タイムライン形式で閲覧できます。日付ナビゲーションにより、過去の記録もスムーズに確認可能です。
-   **レスポンシブデザイン:** スマートフォンからデスクトップまで、様々な画面サイズに対応した直感的で使いやすいUIを提供します。
-   **モダンなUI:** Shadcn/ui を活用し、洗練されたデザインと優れたユーザーエクスペリエンスを実現しています。

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
    npm run dev
    ```

5.  ブラウザで `http://localhost:3000` にアクセスすると、アプリケーションが表示されます。

## 使い方

1.  ログインページから新しいアカウントを作成するか、既存のGoogleアカウントでログインします。
2.  ログイン後、ヘッダーのナビゲーションから「ペット管理」ページへ移動し、新しいペットを登録します。
3.  「タスク管理」ページで、登録したペットに日々のタスク（例: ご飯、散歩）を登録します。
4.  ホーム画面に戻ると、選択中のペットのタスクボタンが表示されます。タスクボタンをクリックすると、そのタスクの実行ログが記録されます。
5.  ホーム画面の日付ナビゲーションを使って、過去の記録を確認したり、手動でログを追加・編集・削除したりできます。

## 今後の展望

-   ペットの共有機能の実装
-   ユーザープロフィール編集機能
-   通知機能の実装
-   ユーザー同士のチャット
-   **UI/UXの改善:**
    -   ローディング状態の視覚的な改善（スピナー、スケルトンローダーなど）
    -   更新や保存の改善（`alert()`から`toast`やインラインメッセージへ）
    -   空の状態（ペットなし、タスクなしなど）の表示強化（アイコン、イラスト、明確なCTA）
    -   エラーハンドリングの改善（`alert()`から`toast`やインラインメッセージへ）
    -   破壊的な操作に対する確認ダイアログの改善（カスタムモーダル）
    -   フォーム入力時のリアルタイムなバリデーションフィードバック
    -   日付・時刻入力の利便性向上（統合されたピッカーなど）
    -   タスクの色選択UIの導入
-   **技術的課題と機能拡張:**
    -   オフラインサポートの検討と実装
    -   リスト表示のパフォーマンス最適化（仮想化、ページネーション）
    -   Firestoreクエリのスケーラビリティの継続的な検討
    -   ユニットテスト・結合テストの導入
    -   認証フローのUI/UX改善

---