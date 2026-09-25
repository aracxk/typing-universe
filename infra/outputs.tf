output "firebase_app_id" {
  value       = google_firebase_web_app.default.app_id
  description = "Firebase Web App の ID"
}

output "firestore_id" {
  value       = google_firestore_database.default.name
  description = "Firestore Database の名前"
}

output "rtdb_url" {
  value       = google_firebase_database_instance.default.database_url
  description = "Realtime Database の URL"
}

# Webアプリ設定情報の取得（自動的に生成される構成情報を出力）
data "google_firebase_web_app_config" "default" {
  provider   = google-beta
  project    = var.gcp_project_id
  web_app_id = google_firebase_web_app.default.app_id
}

output "firebase_config_json" {
  value       = jsonencode({
    appId             = google_firebase_web_app.default.app_id
    apiKey            = data.google_firebase_web_app_config.default.api_key
    authDomain        = data.google_firebase_web_app_config.default.auth_domain
    databaseURL       = lookup(data.google_firebase_web_app_config.default, "database_url", "")
    storageBucket     = lookup(data.google_firebase_web_app_config.default, "storage_bucket", "")
    messagingSenderId = lookup(data.google_firebase_web_app_config.default, "messaging_sender_id", "")
    projectId         = var.gcp_project_id
  })
  description = "クライアント用 .env に貼り付けるための Firebase Config (JSON)"
  sensitive   = true # コンソールにそのまま出さないようにする
}
