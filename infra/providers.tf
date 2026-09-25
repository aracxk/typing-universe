# プロバイダの設定
# Firebaseのリソース（Web AppやDatabase）の多くは、まだベータ版APIで提供されているため、
# google-beta プロバイダをメインで使用します。

terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.gcp_project_id
  region  = var.region
}

provider "google-beta" {
  project = var.gcp_project_id
  region  = var.region
}
