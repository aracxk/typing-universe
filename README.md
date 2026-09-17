# Typing Universe

🎮 **[Play Now (Vercel Live Demo)](https://typing-universe-opal.vercel.app/game/invader)**

「Typing Universe」は、複数の異なるタイピングゲームを一つのプラットフォーム上で切り替えて遊べるWebアプリケーションです。（初期は「インベーダー形式」のタイピングゲームから実装を進めます）

## テクノロジースタック

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Lint / Format**: Biome
- **Test**: Vitest
- **Git Hooks**: Husky + lint-staged

## アーキテクチャ

本プロジェクトは **Feature-Sliced Design (FSD)** を採用しており、将来的に複数のゲームが追加されても互いに干渉しないよう、ドメイン（`core` や `invader` など）ごとに厳密に境界を設けています。
また、Reactのレンダリングサイクルに依存しない純粋なドメインロジック（Entity）を構築し、UIとゲームループを分離することでパフォーマンスを担保します。

詳細な設計やエージェント開発ルールについては以下のドキュメントを参照してください：
- [コーディング・設計規約 (Conventions)](./docs/00-meta/conventions.md)
- [NotebookLM(Jules/Spark)連携・自動同期について](./docs/06-operations/google-docs-sync-setup.md)

## 開発セットアップ

```bash
# パッケージのインストール
npm install

# 開発サーバーの起動
npm run dev

# テストの実行
npm run test
```

> **Note**
> コミット時には Husky がフックされ、自動的に Biome によるコードの静的解析とフォーマット（`biome check --write`）が実行されます。
