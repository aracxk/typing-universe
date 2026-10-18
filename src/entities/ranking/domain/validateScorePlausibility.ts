import { Result } from "../../../shared/core/Result";
import { DOMAIN_ERROR_CODES } from "../../../shared/domain/DomainErrorCode";
import { RankingError } from "./RankingError";
import type { ScoreSubmission } from "./ScoreSubmission";

/** 最短有効プレイ時間（ミリ秒）: 5秒未満のゲームオーバー送信はBot・不正通信として拒否 */
export const MIN_PLAY_DURATION_MS = 5000;

/** 最長有効プレイ時間（ミリ秒）: セッショントークンの有効期限と同じ2時間 */
export const MAX_PLAY_DURATION_MS = 2 * 60 * 60 * 1000;

/** 人間の打鍵速度の上限（打鍵/秒）: 秒間20打鍵（1200 CPM / 240 WPM相当） */
export const MAX_TYPING_KEYS_PER_SECOND = 20;

/** 1文字あたりの基礎スコア倍率 */
const BASE_SCORE_PER_CHAR = 100;

/** コンボ倍率のステップ間隔 */
const COMBO_STEP = 5;

/** コンボ1ステップあたりの加算倍率 */
const COMBO_MULTIPLIER_PER_STEP = 0.2;

/**
 * 送信されたゲームスコアとプレイ統計が、ゲームのドメインルールおよび人間の限界値と整合しているかを検証します。
 *
 * 検証する不変条件:
 * 1. 各数値が非負の整数（stageは1以上）であること
 * 2. プレイ時間(durationMs)が 5,000ms 以上 7,200,000ms 以下であること
 * 3. 正解打鍵数(correctTyped) <= 総打鍵数(totalTyped) であること
 * 4. 最大コンボ数(maxCombo) <= 正解打鍵数(correctTyped) であること
 * 5. 撃破数(kills) <= 正解打鍵数(correctTyped) であること
 * 6. 到達ステージ(stage)が撃破数と整合していること（stage === floor(kills / 6) + 1）
 * 7. スコアが理論上限値（correctTyped * 100 * (1 + floor(maxCombo / 5) * 0.2)）以下であり、kills === 0 の場合は score === 0 であること
 * 8. 打鍵速度が秒間20打鍵（totalTyped <= (durationMs / 1000) * 20）以下であること
 *
 * @param submission 検証対象のスコア送信データ（durationMsの単位はミリ秒）
 * @returns すべての不変条件を満たす場合は Result.ok(undefined)、違反時は RankingError を含む Result.err
 */
export function validateScorePlausibility(
	submission: ScoreSubmission,
): Result<void, RankingError> {
	const {
		score,
		kills,
		maxCombo,
		correctTyped,
		totalTyped,
		stage,
		durationMs,
	} = submission;

	if (
		!Number.isInteger(score) ||
		!Number.isInteger(kills) ||
		!Number.isInteger(maxCombo) ||
		!Number.isInteger(correctTyped) ||
		!Number.isInteger(totalTyped) ||
		!Number.isInteger(stage) ||
		!Number.isFinite(durationMs)
	) {
		return Result.err(
			new RankingError(
				DOMAIN_ERROR_CODES.INVALID_SCORE_SUBMISSION,
				"スコア統計値はすべて整数である必要があります。",
			),
		);
	}

	if (
		score < 0 ||
		kills < 0 ||
		maxCombo < 0 ||
		correctTyped < 0 ||
		totalTyped < 0 ||
		stage < 1
	) {
		return Result.err(
			new RankingError(
				DOMAIN_ERROR_CODES.INVALID_SCORE_SUBMISSION,
				"スコア統計値に負の値または不正なステージが含まれています。",
			),
		);
	}

	if (durationMs < MIN_PLAY_DURATION_MS || durationMs > MAX_PLAY_DURATION_MS) {
		return Result.err(
			new RankingError(
				DOMAIN_ERROR_CODES.INVALID_SCORE_SUBMISSION,
				`プレイ時間が有効範囲外です（${MIN_PLAY_DURATION_MS}ms〜${MAX_PLAY_DURATION_MS}ms）。`,
			),
		);
	}

	if (correctTyped > totalTyped) {
		return Result.err(
			new RankingError(
				DOMAIN_ERROR_CODES.INVALID_SCORE_SUBMISSION,
				"正解打鍵数が総打鍵数を超えています。",
			),
		);
	}

	if (maxCombo > correctTyped) {
		return Result.err(
			new RankingError(
				DOMAIN_ERROR_CODES.INVALID_SCORE_SUBMISSION,
				"最大コンボ数が正解打鍵数を超えています。",
			),
		);
	}

	if (kills > correctTyped) {
		return Result.err(
			new RankingError(
				DOMAIN_ERROR_CODES.INVALID_SCORE_SUBMISSION,
				"撃破数が正解打鍵数を超えています。",
			),
		);
	}

	const expectedStage = Math.floor(kills / 6) + 1;
	if (stage !== expectedStage) {
		return Result.err(
			new RankingError(
				DOMAIN_ERROR_CODES.INVALID_SCORE_SUBMISSION,
				"到達ステージが撃破数と一致していません。",
			),
		);
	}

	if (kills === 0 && score > 0) {
		return Result.err(
			new RankingError(
				DOMAIN_ERROR_CODES.INVALID_SCORE_SUBMISSION,
				"撃破数が0の場合、スコアは0である必要があります。",
			),
		);
	}

	const maxMultiplier =
		1 + Math.floor(maxCombo / COMBO_STEP) * COMBO_MULTIPLIER_PER_STEP;
	const maxTheoreticalScore = Math.round(
		correctTyped * BASE_SCORE_PER_CHAR * maxMultiplier,
	);
	if (score > maxTheoreticalScore) {
		return Result.err(
			new RankingError(
				DOMAIN_ERROR_CODES.INVALID_SCORE_SUBMISSION,
				"スコアが理論上の上限値を超えています。",
			),
		);
	}

	const maxAllowedTyped = (durationMs / 1000) * MAX_TYPING_KEYS_PER_SECOND;
	if (totalTyped > maxAllowedTyped) {
		return Result.err(
			new RankingError(
				DOMAIN_ERROR_CODES.INVALID_SCORE_SUBMISSION,
				"打鍵速度が人間の上限値を超えています。",
			),
		);
	}

	return Result.ok(undefined);
}
