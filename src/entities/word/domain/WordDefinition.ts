import type { WordCategoryType } from "./WordCategory";
import type { WordDifficultyType } from "./WordDifficulty";

/**
 * 辞書データに登録される単語のマスター定義を表すドメインモデル（型定義）。
 *
 * 実際のゲームプレイ中に出現する単語（ActiveWord等）のベースとなる静的なデータ構造を定義します。
 */
export interface WordDefinition {
	readonly id: string;
	readonly word: string;
	readonly readings: readonly string[];
	readonly category: WordCategoryType;
	readonly difficulty: WordDifficultyType;
	readonly description?: string;
}
