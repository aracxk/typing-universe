import {
	type RankedGameId,
	VALID_RANKED_GAME_IDS,
} from "../../../shared/domain/GameId";

export { type RankedGameId, VALID_RANKED_GAME_IDS };

/**
 * サーバー側で妥当性検証を行うためのスコア送信データ構造。
 *
 * すべての数値フィールドは非負整数（stageのみ1以上）であり、
 * durationMs はサーバー側の署名付きセッショントークンから算出した実測プレイ時間（ミリ秒）を表します。
 */
export interface ScoreSubmission {
	readonly gameId: RankedGameId;
	readonly score: number;
	readonly kills: number;
	readonly maxCombo: number;
	readonly correctTyped: number;
	readonly totalTyped: number;
	readonly stage: number;
	readonly durationMs: number;
}
