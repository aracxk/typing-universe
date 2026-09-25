variable "gcp_project_id" {
  description = "ベースとなる Google Cloud プロジェクトのID"
  type        = string
}

variable "region" {
  description = "デフォルトのリージョン（Cloud Functions等のデプロイ先）"
  type        = string
  default     = "asia-northeast1" # 東京
}

variable "firestore_location" {
  description = "Firestore のロケーション（一度設定すると変更不可）"
  type        = string
  default     = "asia-northeast1" # 東京
}

variable "rtdb_location" {
  description = "Realtime Database のロケーション"
  type        = string
  default     = "asia-southeast1" # 日本に近いシンガポール（RTDBは東京リージョンが提供されていない場合があるため）
}
