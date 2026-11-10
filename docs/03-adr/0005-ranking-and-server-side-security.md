# ADR 0005: グローバルランキングとサーバーサイド多層防御の設計

- **ステータス**: 承認済 (Accepted)
- **日付**: 2026-10-18

## コンテキスト

「Typing Universe」において、プレイヤーのリプレイ動機を高め他者の存在を可視化するため、Firestore を用いたグローバルランキング機能を導入する。
しかし、ログイン不要のブラウザゲームという性質上、以下のリスクが存在する。

1. ブラウザの DevTools やスクリプトから直接 Firestore を操作されるリスク（データの改ざん・全件取得・削除）。
2. クライアント側で計算されたスコアやプレイ時間を偽装して送信されるリスク。
3. 大量のリクエスト送信やページリロードにより Firestore の無料枠（Sparkプラン）が枯渇するリスク。
4. 本番環境（Vercel）に GCP サービスアカウントの JSON 秘密鍵を配置することによる鍵漏えいリスク。

## 決定事項

1. **クライアント直接アクセスの完全禁止 (`firestore.rules`)**
   - Firestore の Security Rules は `allow read, write: if false;` とし、ブラウザからの直接アクセスを完全に遮断する。
   - すべての読み書きは Next.js サーバー上の `firebase-admin` 経由で行う。
   - 併せて、プレゼンス用 Realtime Database (`database.rules.json`) もセッション単位の書き込みおよび `true` または削除のみを許可するルールへ厳格化する。

2. **HMAC署名付きセッショントークンとドメイン妥当性検証**
   - ゲーム開始時に `POST /api/sessions` でサーバー時刻を含む HMAC-SHA256 署名付きトークンを発行する。
   - スコア送信時（`POST /api/scores`）にサーバー側で経過時間 `durationMs` を算出し、クライアント申告のプレイ時間は信用しない。
   - Firestore のドキュメントIDに `sessionId` を使用し、`create()` メソッドで保存することで同一トークンの二重送信（リプレイ攻撃）を防止する。
   - `entities/ranking/domain/validateScorePlausibility.ts` にて、打鍵数・コンボ数・撃破数・到達ステージ・理論最大スコア・人間の最大打鍵速度（秒間20打鍵）の不変条件を純粋関数として検証する。

3. **Next.js 16 Cache Components (`"use cache"`) による読み取り最適化**
   - `next.config.ts` で `cacheComponents: true` を有効化し、ランキング取得関数（`getTopRankings`）に `"use cache"`、`cacheLife("minutes")`、`cacheTag("ranking:bug_invaders")` を適用する。
   - 新規スコア登録成功時に `revalidateTag("ranking:bug_invaders", { expire: 0 })` を呼び出し、オンデマンドでキャッシュを更新する。

4. **Workload Identity 連携による鍵レス認証**
   - Terraform (`infra/main.tf`) にて専用サービスアカウントおよび Workload Identity Pool / OIDC Provider を定義し、JSON 秘密鍵を発行せずに Vercel から GCP へ認証できる構成を採用する。

## 結果・影響

- 素人のスコア改ざん、理論値を超えるチート送信、同一セッションのリプレイ送信がサーバー境界とドメイン層で確実に拒否される。
- ランキング閲覧時の Firestore 読み取り回数がキャッシュにより最小化され、Spark プランの無料枠内で安全に運用できる。
- ドメイン層の `Nickname` および `validateScorePlausibility` は外部依存を持たない純粋な TypeScript として実装され、Vitest によりカバレッジ 100% で保証される。
