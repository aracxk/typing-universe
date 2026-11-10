variable "gcp_project_id" {
  description = "ベースとなる Google Cloud プロジェクトのID"
  type        = string
}

variable "region" {
  description = "デフォルトのリージョン（Cloud Functions等のデプロイ先）"
  type        = string
  default     = "asia-northeast1"
}

variable "firestore_location" {
  description = "Firestore のロケーション（一度設定すると変更不可）"
  type        = string
  default     = "asia-northeast1"
}

variable "rtdb_location" {
  description = "Realtime Database のロケーション"
  type        = string
  default     = "asia-southeast1"
}

variable "vercel_oidc_issuer_uri" {
  description = "Vercel OIDC プロバイダーの Issuer URI（Workload Identity 連携用）"
  type        = string
  default     = "https://oidc.vercel.com"
}

variable "vercel_oidc_subject" {
  description = "Vercel 側から許可する OIDC subject（未設定時はバインディングをスキップ）"
  type        = string
  default     = ""
}
