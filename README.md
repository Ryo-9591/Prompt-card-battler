# Prompt Card Battler

テキストプロンプトからカードを生成し、対戦するAI搭載トレーディングカードゲームです。

## 特徴

- **カード生成 (Card Crafting)**: シンプルなテキスト入力から、独自のステータス、能力、そしてAIによるイラストを持つカードを生成します。
- **デッキ構築 (Deck Building)**: 生成したカードから5〜8枚を選んで最強のチームを編成します。
- **オートバトル (Auto-Battle)**: 属性相性やキーワード能力を駆使した、見ているだけで楽しい自動戦闘システム。
- **技術スタック**: Next.js 15, Tailwind CSS v4, Google Gemini API, Pollinations.ai, Zustand, Docker.

## 前提条件 (Prerequisites)

このプロジェクトを実行するには、以下のAPIが必要です：

- **Google Gemini API Key** (無料枠あり)
    - モデル: `gemini-1.5-flash` (カードデータ生成用)
- **画像生成**
    - **Pollinations.ai** を使用 (APIキー不要・無料)

環境:
- Node.js 18+ または Docker

## 始め方 (Getting Started)

### ローカル開発 (Local Development)

1.  リポジトリをクローンします。
2.  依存関係をインストールします:
    ```bash
    npm install
    ```
3.  プロジェクトルートに `.env.local` ファイルを作成し、Gemini APIキーを設定します:
    ```env
    GEMINI_API_KEY=your-gemini-api-key-here
    ```
4.  開発サーバーを起動します:
    ```bash
    npm run dev
    ```
5.  ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

### Dockerでの実行

1.  Docker Composeを使用してビルド・起動します:
    ```bash
    docker-compose up --build
    ```
    *注意: 環境変数 `GEMINI_API_KEY` が設定されていることを確認するか、`docker-compose.yml` に直接記述してください。*

## ゲームルール

- **属性相性**:
    - 火 (Fire) > 自然 (Nature) > 水 (Water) > 火 (Fire)
    - 光 (Light) と 闇 (Dark) は互いに大ダメージ（相互弱点）
- **キーワード能力**:
    - **Rush (速攻)**: 召喚されたターンに即座に攻撃できる。
    - **Guard (守護)**: 敵はこのユニットを先に攻撃しなければならない。
    - **Combo (連撃)**: 1ターンに2回攻撃を行う。
    - **Revenge (復讐)**: 破壊されたときに敵にダメージを与える。
    - **Pierce (貫通)**: Guard (守護) を無視してリーダーや他のユニットを攻撃できる。
- **デッキサイズ**: 5枚〜8枚で編成する必要があります。
