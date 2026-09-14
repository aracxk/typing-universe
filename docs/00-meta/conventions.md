# コーディング・設計規約 (Conventions)

本ドキュメントは、`typing-universe` プロジェクト全体で一貫した設計・命名・構造を保つための規約です。
Feature-Sliced Design (FSD) に適合させた独自の構造を採用しています。

---

## 1. 命名規則

| 種類 | 規約 | 例 | 備考 |
| :--- | :--- | :--- | :--- |
| **Value Object** | PascalCase | `Score`, `TypingSpeed`, `PlayerName` | 原則イミュータブル |
| **Entity / 集約** | PascalCase | `GameSession`, `Invader` | 一意なIDとライフサイクルを持つ |
| **機能 (Feature)** | kebab-case | `invader-game`, `typing-core` | ディレクトリ名として使用 |
| **UIコンポーネント** | PascalCase | `GameCanvas`, `ScoreBoard` | Reactコンポーネント |

---

## 2. Feature-Sliced Design (FSD) の依存方向と境界（Bounded Context）

本プロジェクトはFSDを採用し、以下の階層（Layers）を持ちます。
さらに、複数ゲームの拡張性を担保するため、スライス内部で **ドメインごとのディレクトリ分割（Bounded Context）** を行います。

```text
[ features, entities などの内部構造 ]
├── core/       # 全ゲーム共通のドメイン・機能（例：GameSession, ActiveWord）
├── invader/    # インベーダー固有のドメイン・機能
└── standard/   # （将来用）通常タイピング固有のドメイン・機能
```

**依存の絶対ルール**:
1. **下向きの依存のみ許可**: 上のレイヤー（features）は下のレイヤー（entities）に依存できるが、逆は禁止。
2. **境界の越境禁止**: `core` は特定のゲーム（`invader`等）に依存してはならない。特定のゲームは `core` を利用・拡張することができる。
3. **ゲーム間の依存禁止**: `invader` と `standard` は互いに参照してはならない。

---

## 3. エラーハンドリング方針

- **ドメイン例外**: 不正な値（例：マイナスのスコア、空の入力）の生成は、専用のドメイン例外または `Result.err()` で早期に防ぐ（Fail-Fast）。

---

## 4. Git・コミット運用規約

コミットメッセージはすべて**日本語**で記述し、以下のプレフィックスを使用する。
（※AIは事前の許可なく自動でコミットしてはならない）

| プレフィックス | 用途 |
| :--- | :--- |
| **`feat`** | 新機能・ドメインモデルの実装 |
| **`fix`** | バグ修正 |
| **`docs`** | ドキュメントの追加・更新 |
| **`test`** | テストコードの追加・修正 |
| **`refactor`** | 振る舞いを変えないコードの改善 |
| **`chore`** | 環境設定、ビルド構成の変更 |

---

## 5. ドキュメントとコードの同期検証

- 定数やビジネスルールを変更した際は、インラインコメント、単体テスト、仕様書すべてで不整合がゼロであることを確認する。
- 意味のある設計決定を行った際は、ADR (Architecture Decision Record) として残す。
