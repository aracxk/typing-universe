# インフラストラクチャ管理方針 (Infrastructure as Code)

本プロジェクト（Typing Universe）におけるクラウドインフラ（GCP / Firebase）の構築・運用方針を定義する。

## 1. 運用方針（クリックOpsの禁止）
- **Terraformの採用**: インフラリソース（プロジェクト設定、データベースの有効化、Webアプリの登録など）は、手動でコンソール画面からポチポチと設定する操作（クリックOps）を原則禁止とし、すべて HashiCorp Terraform による **Infrastructure as Code (IaC)** で管理する。
- **目的**: 
  - 変更履歴を Git で管理し、「誰がいつ何を設定したか」のブラックボックス化を防ぐ。
  - テスト環境や別環境を即座に再現できるスケーラビリティを担保する。

## 2. ディレクトリ構造
インフラ関連のコードは、アプリケーションコード（`src/`）とは完全に分離し、ルートの `infra/` ディレクトリ配下で管理する。

```text
infra/
 ├── providers.tf   # GCP および Google Beta プロバイダの定義
 ├── variables.tf   # プロジェクトIDやリージョンなどの変数定義
 ├── main.tf        # Firebaseの有効化、Firestore/RTDBの作成などリソース本体
 └── outputs.tf     # アプリ連携用設定値（firebaseConfig）の自動出力
```

## 3. リソースの責任分界点
インフラ構築とアプリケーション固有の設定で、使用するツールを以下のように分割する。

| 対象リソース | 管理ツール | 理由 |
| :--- | :--- | :--- |
| **GCPプロジェクト作成** | 手動 (GCP Console) | Terraformの実行基盤（土台）として1つだけ必要なため。 |
| **Firebaseインフラ構築**<br/>(DB作成, WebApp登録等) | **Terraform**<br/>(`google-beta` provider) | クラウドリソースの静的なプロビジョニングに最適なため。 |
| **セキュリティルール**<br/>(Firestore/RTDB rules) | **Firebase CLI**<br/>(`firebase deploy`) | アプリケーションのドメインロジックと密結合しており、アプリのデプロイサイクルと同期させるべきため（Terraform管理から除外）。 |

## 4. プロビジョニング手順
インフラを変更・新規構築する際の基本的なフローは以下の通り。

1. `gcloud auth application-default login` にてGCPへの操作権限を取得。
2. `cd infra`
3. `terraform init` (初回のみ)
4. `terraform plan -var="gcp_project_id=<YOUR_PROJECT_ID>"` (変更内容の確認)
5. `terraform apply -var="gcp_project_id=<YOUR_PROJECT_ID>"` (反映)
