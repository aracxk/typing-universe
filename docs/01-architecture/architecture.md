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
