# Google Docs 自動同期設定手順

本プロジェクトでは `mtf-tradeai` での知見を活かし、JulesやSparkといった自律エージェントに機能開発（PR作成）をさせるための情報源として、GitHubからGoogle Docs（NotebookLM）へ「プロダクト仕様」と「エンジニアリング設計」を自動同期する仕組みを導入しています。

## 同期対象
- `docs/notebooklm/プロダクト仕様.md`
- `docs/notebooklm/エンジニアリング設計.md`

## 初回セットアップ手順

### 1. GCPサービスアカウントの用意
1. Google Cloud Consoleでプロジェクトを作成または選択する。
2. 「Google Docs API」を有効にする。
3. サービスアカウントを作成（ロール付与は不要）し、JSONキーを生成・ダウンロードする。
4. JSONキー内の `client_email` を控える。

### 2. Google Docsの準備
1. Google Docsで空のドキュメントを2つ作成する。（例：「TypingUniverse プロダクト仕様」「TypingUniverse エンジニアリング設計」）
2. 各ドキュメントの共有設定で、控えた `client_email` を「編集者」として追加する。
3. URL（`https://docs.google.com/document/d/DOCUMENT_ID/edit`）から、それぞれの `DOCUMENT_ID` を抽出する。

### 3. GitHub Secretsの設定
対象リポジトリの Settings > Secrets and variables > Actions に以下のSecretを登録する。

| Secret名 | 設定値 |
| --- | --- |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | ダウンロードしたJSONファイルの全文 |
| `NOTEBOOKLM_PRODUCT_DOC_ID` | プロダクト仕様ドキュメントのID |
| `NOTEBOOKLM_ENGINEERING_DOC_ID` | エンジニアリング設計ドキュメントのID |

## 運用
`main` ブランチの対象Markdownに変更がPushされると、GitHub Actionsが起動してGoogle Docsの内容が最新のMarkdownで全文上書きされます。Google Docs側での直接編集は次回の同期で消えるため、新しい機能アイディアや仕様の変更は必ずMarkdownを修正してください。
