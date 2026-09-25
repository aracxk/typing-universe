# 1. GCPプロジェクトで必要なAPIを有効化する
resource "google_project_service" "default" {
  provider = google-beta
  project  = var.gcp_project_id
  for_each = toset([
    "firebase.googleapis.com",
    "firestore.googleapis.com",
    "firebasedatabase.googleapis.com",
    "identitytoolkit.googleapis.com"
  ])
  service            = each.key
  disable_on_destroy = false
}

# 2. GCPプロジェクトに Firebase を紐付け（有効化）
resource "google_firebase_project" "default" {
  provider = google-beta
  project  = var.gcp_project_id

  depends_on = [google_project_service.default]
}

# 3. Firebase Web App (クライアント連携用アプリ) の登録
resource "google_firebase_web_app" "default" {
  provider     = google-beta
  project      = var.gcp_project_id
  display_name = "typing-universe-web"

  depends_on = [google_firebase_project.default]
}

# 4. Firestore Database の作成 (Native モード = 本番モード相当)
resource "google_firestore_database" "default" {
  provider    = google-beta
  project     = var.gcp_project_id
  name        = "(default)"
  location_id = var.firestore_location
  type        = "FIRESTORE_NATIVE"

  # Firestore APIが有効になってから作成する
  depends_on = [google_project_service.default]
}

# 5. Realtime Database (RTDB) の作成
resource "google_firebase_database_instance" "default" {
  provider    = google-beta
  project     = var.gcp_project_id
  instance_id = "${var.gcp_project_id}-rtdb" # 一意なインスタンス名
  region      = var.rtdb_location
  type        = "USER_DATABASE"

  depends_on = [google_firebase_project.default]
}
