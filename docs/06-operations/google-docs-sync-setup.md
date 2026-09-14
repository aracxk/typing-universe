# Google Docs 自動同期設定手順

本プロジェクトでは `mtf-tradeai` での知見を活かし、設計ドキュメント（アーキテクチャやユビキタス言語など）をNotebookLMなどの外部AIに読ませるために、GitHubからGoogle Docsへ自動同期する仕組みを導入しています。

## 同期対象
- `docs/01-architecture/architecture.md`
- `docs/02-domain-models/ubiquitous-language.md`

## 初回セットアップ手順

### 1. GCPサービスアカウントの用意
1. Google Cloud Consoleでプロジェクトを作成または選択する。
2. 「Google Docs API」を有効にする。
3. サービスアカウントを作成（ロール付与は不要）し、JSONキーを生成・ダウンロードする。
4. JSONキー内の `client_email` を控える。

### 2. Google Docsの準備
1. Google Docsで空のドキュメントを2つ作成する。
2. 各ドキュメントの共有設定で、控えた `client_email` を「編集者」として追加する。
3. URL（`https://docs.google.com/document/d/DOCUMENT_ID/edit`）から、それぞれの `DOCUMENT_ID` を抽出する。

### 3. GitHub Secretsの設定
対象リポジトリの Settings > Secrets and variables > Actions に以下のSecretを登録する。

| Secret名 | 設定値 |
| --- | --- |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | ダウンロードしたJSONファイルの全文 |
| `DOCS_ARCHITECTURE_DOC_ID` | アーキテクチャ用ドキュメントのID |
| `DOCS_UBIQUITOUS_DOC_ID` | ユビキタス言語用ドキュメントのID |

## 運用
`main` ブランチにMarkdownがPushされると、GitHub Actionsが起動してGoogle Docsの内容が最新のMarkdownで全文上書きされます。Google Docs側での直接編集は次回の同期で消えるため、必ずMarkdownを修正してください。
