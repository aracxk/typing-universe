# 1. GCPプロジェクトで必要なAPIを有効化する
resource "google_project_service" "default" {
  provider = google-beta
  project  = var.gcp_project_id
  for_each = toset([
    "firebase.googleapis.com",
    "firestore.googleapis.com",
    "firebasedatabase.googleapis.com",
    "identitytoolkit.googleapis.com",
    "iam.googleapis.com",
    "iamcredentials.googleapis.com",
    "sts.googleapis.com"
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

  depends_on = [google_project_service.default]
}

# 5. Realtime Database (RTDB) の作成
resource "google_firebase_database_instance" "default" {
  provider    = google-beta
  project     = var.gcp_project_id
  instance_id = "${var.gcp_project_id}-rtdb"
  region      = var.rtdb_location
  type        = "USER_DATABASE"

  depends_on = [google_firebase_project.default]
}

# 6. Next.js サーバー (Vercel) から Firestore にアクセスする専用サービスアカウント
resource "google_service_account" "ranking_server" {
  provider     = google-beta
  project      = var.gcp_project_id
  account_id   = "typing-universe-server"
  display_name = "Typing Universe Next.js Server (Ranking)"

  depends_on = [google_project_service.default]
}

resource "google_project_iam_member" "ranking_firestore_user" {
  provider = google-beta
  project  = var.gcp_project_id
  role     = "roles/datastore.user"
  member   = "serviceAccount:${google_service_account.ranking_server.email}"
}

# 7. Workload Identity Pool & Provider (鍵ファイル不要の OIDC 連携)
resource "google_iam_workload_identity_pool" "vercel" {
  provider                  = google-beta
  project                   = var.gcp_project_id
  workload_identity_pool_id = "vercel-pool"
  display_name              = "Vercel Workload Identity Pool"

  depends_on = [google_project_service.default]
}

resource "google_iam_workload_identity_pool_provider" "vercel_oidc" {
  provider                           = google-beta
  project                            = var.gcp_project_id
  workload_identity_pool_id          = google_iam_workload_identity_pool.vercel.workload_identity_pool_id
  workload_identity_pool_provider_id = "vercel-oidc"
  display_name                       = "Vercel OIDC Provider"

  attribute_mapping = {
    "google.subject" = "assertion.sub"
  }

  oidc {
    issuer_uri = var.vercel_oidc_issuer_uri
  }
}

resource "google_service_account_iam_member" "vercel_workload_identity_user" {
  count              = var.vercel_oidc_subject != "" ? 1 : 0
  provider           = google-beta
  service_account_id = google_service_account.ranking_server.name
  role               = "roles/iam.workloadIdentityUser"
  member             = "principal://iam.googleapis.com/${google_iam_workload_identity_pool.vercel.name}/subject/${var.vercel_oidc_subject}"
}
