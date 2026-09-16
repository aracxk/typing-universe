import type { WordDefinition } from "../domain/WordDefinition";
import { GENERAL_FRUITS_WORDS } from "./categories/generalFruits";
import { IT_ERRORS_WORDS } from "./categories/itErrors";
import { PROGRAMMING_WORDS } from "./categories/programming";
import { WEB_TECH_WORDS } from "./categories/webTech";

/**
 * アプリケーション全体で利用可能なすべての単語データのマスターリスト。
 * 各カテゴリ別のファイルからインポートして結合しています。
 */
export const MASTER_WORDS: readonly WordDefinition[] = [
	...IT_ERRORS_WORDS,
	...PROGRAMMING_WORDS,
	...WEB_TECH_WORDS,
	...GENERAL_FRUITS_WORDS,
];
