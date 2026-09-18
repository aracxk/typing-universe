# ADR 0004: トップページのデザインシステム適用とFSDコンポーネント分割

## ステータス
Accepted

## 背景と課題
タイピングゲームを統合するプラットフォームとしての「Typing Universe」のトップページ (`src/app/page.tsx`) において、初期実装ではデザインの方向性が定まっておらず、1ファイルへのベタ書き（モノリシックな実装）となっており、再利用性やFSD (Feature-Sliced Design) の原則から逸脱していた。
また、StitchMCPを利用してアーケード風のデザインシステムを生成したが、出力されたHTMLコードにはそのままではReactアプリとして使えないダミーテキストや英語表現が多く含まれていた。

## 決定事項
1. **デザインシステムの適用**:
   StitchMCPが生成した「Cyber Arcade HUD」のカラーパレットやフォント (`Inter`, `Space Grotesk`, `JetBrains Mono`) を `tailwind.config` (あるいは `@theme`) および `layout.tsx` に適用し、プロジェクト全体のデザインルールとして制定する。
2. **FSDに基づくコンポーネント分割**:
   トップページの要素を以下のコンポーネントとして抽出し、`page.tsx` を簡素化する。
   - `src/features/hub/components/HeroSection.tsx` (特定の機能・画面に属するUI)
   - `src/shared/ui/GameCard` (他画面や将来の別ゲーム追加時にも使い回す汎用UI)
3. **ダミーテキストの排除と完全な日本語化**:
   「ENGAGE WARP RUN」等のサイバー語録や、「〇〇人がプレイ中」といった未実装のダミー数値を徹底的に排除し、プラットフォームの目的に沿った的確な日本語テキストに書き換える。
4. **BaaS (Firebase) の利用許可**:
   （本ADRと同時に `AGENTS.md` に追記済）
   将来的に「現在〇〇人がプレイ中」といったリアルタイム同期やランキング機能を実装する場合、GA/GTM等では対応不可能なため、軽量なBaaSとして Firebase (Realtime Database / Firestore 等) の使用を許可する。

## 影響
- **保守性の向上**: `page.tsx` がスッキリし、FSDのレイヤー分け（`shared/ui`, `features/hub`）が明確になったことで、新しいゲーム（例: Typing RPG）を追加する際は `<GameCard />` を一つ追加するだけで済むようになった。
- **UXの改善**: 意味不明なダミー表記が消え、ユーザーにとって「何ができるサイトなのか」が日本語で直感的に分かるようになった。
