## デプロイガイド

本番環境では **Ollama（テキスト生成）** と **Next.js（フロントエンド + API）** を別サービスとしてデプロイします。以下では、Ollamaを **Railway**、Webアプリを **Render** に配置する構成を説明します。

```
┌────────────────────┐          ┌────────────────────┐
│ Prompt Card Battler│  HTTP    │   Ollama (gemma3)   │
│  Render Web App    │ ───────▶ │  Railway Service    │
└────────────────────┘          └────────────────────┘
```

---

## 1. Railway に Ollama をデプロイ

### 1.1 前提
- Railway アカウント（無料枠でOK）
- ボリューム（永続ストレージ）機能を有効にする

### 1.2 リポジトリ構成
`deploy/railway` フォルダに、Railway 用の Dockerfile とエントリーポイントスクリプトを用意しています。

```
deploy/
└── railway/
    ├── Dockerfile
    └── entrypoint.sh
```

### 1.3 デプロイ手順
1. Railway ダッシュボードで **New Project → Deploy from GitHub repo** を選択し、本リポジトリを接続
2. サービス設定で以下を指定
   - **Root Directory**: `deploy/railway`
   - **Dockerfile Path**: `deploy/railway/Dockerfile`
   - **Service Name**: 任意（例: `prompt-card-battler-ollama`）
3. **Environment Variables**
   | 変数名 | 推奨値 | 備考 |
   | --- | --- | --- |
   | `OLLAMA_MODEL` | `gemma3:1b` | 別モデルに変更可 |
4. **Volumes**
   - Path: `/root/.ollama`
   - Size: 1GB 以上（モデルによっては追加が必要）
5. デプロイ後、**Service Settings → Networking** からパブリック URL を確認（例: `https://prompt-card-battler-ollama.up.railway.app`）

> **Tips**: 初回デプロイでモデルのダウンロードに数分かかります。Railway のログで `Starting Ollama server...` が表示されれば準備完了です。

---

## 2. Render に Next.js (Web) をデプロイ

### 2.1 手順
1. Render ダッシュボードで **New + → Web Service** を選択し、本リポジトリを選択
2. **Environment**
   - Runtime: `Node 20`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
3. **Environment Variables**
   | 変数名 | 例 | 備考 |
   | --- | --- | --- |
   | `NODE_ENV` | `production` | Render が自動設定 |
   | `OLLAMA_BASE_URL` | `https://<railway-service>.up.railway.app` | Railway 側のURL（末尾スラッシュ無し） |
   | `OLLAMA_MODEL` | `gemma3:1b` | APIレスポンスログ用。Railway側と揃える |
4. デプロイ後、`/api/generate-card` エンドポイントから Railway 上の Ollama へアクセスします。

### 2.2 動作確認
1. Render の Web サービスログで `Generating card with model: ... at https://...` を確認
2. ブラウザでアプリを開き、カード生成がモックにフォールバックしないことを確認

---

## 3. トラブルシューティング

| 症状 | 対処 |
| --- | --- |
| Render ログで `fetch failed ECONNREFUSED` | `OLLAMA_BASE_URL` が未設定、または Railway サービスがスリープ/失敗 |
| レイテンシが高い | Railway無料枠がスリープしている可能性。Proプランや他クラウドを検討 |
| モデルダウンロードで失敗 | `deploy/railway/entrypoint.sh` がリトライします。繰り返す場合は Railway のログを確認 |

---

## 4. 追加の環境変数

| 変数名 | 用途 | デフォルト |
| --- | --- | --- |
| `GEMINI_API_KEY` | 将来のGemini統合用 | `dummy-key-for-build` |
| `NEXT_PUBLIC_SITE_URL` | 必要に応じて | 未設定 |

必要に応じて `.env` や Render/Railway のダッシュボードから設定してください。

