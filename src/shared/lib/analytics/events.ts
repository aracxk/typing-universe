import { sendGAEvent } from "@next/third-parties/google";

/**
 * サポートされているゲームの識別名
 */
export type GameName = "bug_invaders" | "typing_rpg";

/**
 * ゲームのプレイ開始イベントを送信します。
 * @param gameName ゲームの識別名
 */
export const sendGameStartEvent = (gameName: GameName): void => {
	sendGAEvent("event", "game_start", {
		game_name: gameName,
	});
};

/**
 * ゲームオーバーイベントを送信します。
 * @param gameName ゲームの識別名
 * @param score 獲得した最終スコア
 * @param stageLevel 到達したステージレベル
 */
export const sendGameOverEvent = (
	gameName: GameName,
	score: number,
	stageLevel: number,
): void => {
	sendGAEvent("event", "game_over", {
		game_name: gameName,
		score: score,
		stage_level: stageLevel,
	});
};
