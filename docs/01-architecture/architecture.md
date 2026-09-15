# アーキテクチャ設計 (Feature-Sliced Design)

本プロジェクト（`typing-universe`）では、複数ゲームの切り替えや今後の拡張性を考慮し、**Feature-Sliced Design (FSD)** を採用します。

---

## 1. FSDの目的

従来のClean Architectureでは、技術的な関心事（Controller, UseCase, Repository等）で横割り（レイヤー）にするため、特定の機能を追加・修正する際に多数のディレクトリをまたぐ必要がありました。
FSDでは「機能（Feature）」単位で縦割りにすることで、機能ごとの凝集度を高め、削除や修正を容易にします。

## 2. ディレクトリ構造とドメイン分割

以下は、上位（UIに近い）から下位（ドメインに近い）へのレイヤー構造と、各レイヤー内での**ドメイン分割（Bounded Context）**の例です。

- **`app/` / `pages/`**: 
  - 各画面のエントリーポイント（`/game/invader` 等）。
- **`widgets/`**: 
  - 画面を構成する独立したUIのブロック。
    - `widgets/core/`: 共通ヘッダー等
    - `widgets/invader/`: インベーダーゲーム全体のレイアウト等
- **`features/`**: 
  - ユーザーにとって価値のある特定の機能（操作）。
    - `features/core/`: `keyboard-input` 等
    - `features/invader/`: `spawn-invader` 等
- **`entities/`**: 
  - ビジネス上の概念やドメインロジック（DDDにおけるEntity, Value Object）。
    - `entities/core/`: `game-session`, `active-word` 等
    - `entities/invader/`: `invader`, `invader-game-engine` 等
- **`shared/`**: 
  - プロジェクト全体で使い回すUIコンポーネント（ボタン等）、ユーティリティ関数、定数。

## 3. 厳格な依存ルール

1. **下向きの依存のみ許可**：
   - 例として、`features` は `entities` を import できますが、`entities` は `features` を import できません。
2. **ドメイン（ゲーム）間の依存禁止**：
   - `core` ディレクトリ内のモジュールは、いかなる場合も `invader` 等の個別ゲームモジュールを import してはなりません。
   - `invader` は `core` のモジュールを import して利用・拡張することができます。

## 4. ドメイン駆動設計 (DDD) との融合

FSDの `entities` レイヤー内に、DDDの概念（Entity, Value Object）を配置します。
データベースは使用しませんが、ゲームのスコアや状態管理において、不正な値の混入を防ぐ（Fail-Fast）仕組みとしてValue Objectを活用します。

## 5. DDD基盤クラスの活用 (shared/domain)

より堅牢な設計とするため、`src/shared/domain/` および `src/shared/core/` に以下の基底クラス群を配置し、すべてのドメインモデルで利用します。

- **`Result<T, E>`**: 成功/失敗を型安全に返す仕組み。例外の `throw` を排除します。
- **`Entity<ID>`**: 識別子による同一性保証（`equals`）を強制します。
- **`ValueObject`**: 完全不変性と、値による同一性保証を強制します。
- **`DomainError` / `DomainErrorCode`**: システム全体のエラーを一元管理し、機械判別可能にします。

## 6. Hooksの管理・配置ルール

UIコンポーネント（`.tsx`）を純粋な描画層として保つため、状態管理や副作用（`useState`, `useEffect`等）は必ず Custom Hook に隔離し、以下のルールに従って配置します。

### ① 機能固有のHooks (features層)
- **配置先**: `src/features/[機能名]/hooks/`
- **役割**: ドメインエンティティ（entities）を操作し、特定のユースケースやビジネスロジックを実行するHook。
- **例**: `src/features/core/hooks/useTypingSession.ts`（タイピングの正誤判定やスコア状態の管理）

### ② 汎用的なHooks (shared層)
- **配置先**: `src/shared/lib/hooks/`
- **役割**: ビジネスロジックを持たない、純粋な技術的ユーティリティ。プロジェクト全体で使い回すHook。
- **例**: `useKeyPress.ts`（キーボードイベントの監視）、`useAnimationFrame.ts`（ゲームループ用のタイマー）

これにより、UI層は「Hooksが返す状態の表示」と「ユーザーアクションのHooksへの伝達」のみに徹することができます。

## 7. UI描画戦略 (DOM vs Canvas)

ゲームプレイ画面などの高頻度更新・リッチ演出が求められる領域と、メニューなどの静的領域で描画手法を使い分けます。
詳細は [UI描画戦略 (ui-rendering-strategy.md)](./ui-rendering-strategy.md) を参照してください。
