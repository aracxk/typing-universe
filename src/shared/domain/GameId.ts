/**
 * ランキング機能の対象となるゲーム識別子。
 */
export type RankedGameId = "bug_invaders";

/**
 * ランキング機能の対象となる有効なゲーム識別子一覧。
 */
export const VALID_RANKED_GAME_IDS: readonly RankedGameId[] = [
	"bug_invaders",
] as const;
