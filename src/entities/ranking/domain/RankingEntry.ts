import type { RankedGameId } from "./ScoreSubmission";

/**
 * ランキング一覧に表示される1件分のスコアレコード（不変データ）。
 */
export interface RankingEntry {
	readonly id: string;
	readonly gameId: RankedGameId;
	readonly rank: number;
	readonly nickname: string;
	readonly score: number;
	readonly kills: number;
	readonly maxCombo: number;
	readonly accuracy: number;
	readonly stage: number;
	readonly createdAtIso: string;
}
