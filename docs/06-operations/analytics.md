# アナリティクス (Google Analytics) 実装仕様

本プロジェクトでは、プラットフォーム上のユーザー行動（ページビュー、ゲーム開始、スコア記録等）を追跡・分析するために Google Analytics 4 (GA4) を導入しています。

## 1. アーキテクチャと使用技術
- **ライブラリ**: `@next/third-parties/google`
  - Next.js 公式のサードパーティ最適化ライブラリを使用し、XSSリスクの排除とスクリプトの非同期・遅延ロード（パフォーマンス最適化）を実現しています。
- **ベース注入箇所**: `src/app/layout.tsx`
  - ルートレイアウトにて `<GoogleAnalytics />` コンポーネントを配置し、全ページ共通のPV計測を行っています。

## 2. セキュリティと環境変数
GAの測定ID（Measurement ID）はソースコード内にハードコードせず、必ず環境変数から注入する設計としています。
これにより、リポジトリが公開（Public）であっても、第三者による Measurement Protocol スパム（偽データの送信）リスクを低減しています。

**【ローカル開発時の設定】**
Vercelの環境変数設定、またはローカルの `.env.local` ファイルに以下を設定してください。
```env
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```
※この環境変数が設定されていない場合、トラッキングスクリプト自体がレンダリングされません（開発中の無駄なイベント送信を防止）。

## 3. カスタムイベントの実装方法 (FSD準拠)
各ゲーム特有のイベント（ゲーム開始、ゲームオーバー等）は、UIコンポーネントに直書きせず、ドメイン機能として切り出されたユーティリティ関数を使用します。

### 実装場所
- `src/shared/lib/analytics/events.ts`

### イベント定義
現在定義されているイベントの型と使用方法は以下の通りです。

```typescript
// 例: インベーダーゲーム開始時の送信
import { sendGameEvent } from "@/shared/lib/analytics/events";

sendGameEvent({
  action: "game_start",
  gameName: "invader"
});
```

### 拡張について
新しいゲーム（例：`typing-rpg`）を追加する際は、`events.ts` 内の `GameName` 型（Union Type）に新しいゲーム名を追加することで、イベント名が分散するのを防ぎ、型安全なトラッキングを維持してください。
