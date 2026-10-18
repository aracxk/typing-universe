import "server-only";
import {
	type App,
	applicationDefault,
	getApps,
	initializeApp,
} from "firebase-admin/app";
import { type Firestore, getFirestore } from "firebase-admin/firestore";

let adminApp: App | null = null;

/**
 * サーバー専用の Firebase Admin SDK アプリケーションインスタンスを取得または初期化します。
 *
 * Workload Identity 連携またはローカルの Application Default Credentials (ADC) を用いて認証するため、
 * サービスアカウント秘密鍵ファイルをリポジトリや環境変数に保持しません。
 *
 * @returns 初期化済みの Firebase Admin App
 */
export function getAdminApp(): App {
	if (adminApp) {
		return adminApp;
	}

	const existingApps = getApps();
	if (existingApps.length > 0 && existingApps[0]) {
		adminApp = existingApps[0];
		return adminApp;
	}

	const projectId =
		process.env.FIREBASE_PROJECT_ID ??
		process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

	adminApp = initializeApp({
		credential: applicationDefault(),
		projectId,
	});

	return adminApp;
}

/**
 * サーバー専用の Firestore インスタンスを取得します。
 *
 * @returns Firestore インスタンス
 */
export function getAdminFirestore(): Firestore {
	return getFirestore(getAdminApp());
}
