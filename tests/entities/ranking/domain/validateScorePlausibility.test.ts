import { describe, expect, it } from "vitest";
import {
	type ScoreSubmission,
	VALID_RANKED_GAME_IDS,
} from "../../../../src/entities/ranking/domain/ScoreSubmission";
import {
	MAX_PLAY_DURATION_MS,
	MIN_PLAY_DURATION_MS,
	validateScorePlausibility,
} from "../../../../src/entities/ranking/domain/validateScorePlausibility";
import { DOMAIN_ERROR_CODES } from "../../../../src/shared/domain/DomainErrorCode";

function createValidSubmission(
	overrides: Partial<ScoreSubmission> = {},
): ScoreSubmission {
	return {
		gameId: VALID_RANKED_GAME_IDS[0],
		score: 2400,
		kills: 6,
		maxCombo: 24,
		correctTyped: 24,
		totalTyped: 26,
		stage: 2,
		durationMs: 15_000,
		...overrides,
	};
}

describe("validateScorePlausibility (スコア妥当性検証)", () => {
	it("すべての不変条件を満たす正常なスコア送信データの場合、検証に成功する", () => {
		// Arrange
		const submission = createValidSubmission();

		// Act
		const result = validateScorePlausibility(submission);

		// Assert
		expect(result.success).toBe(true);
	});

	it("撃破数0かつスコア0で最短プレイ時間(5000ms)ちょうどの場合、検証に成功する", () => {
		// Arrange
		const submission = createValidSubmission({
			score: 0,
			kills: 0,
			maxCombo: 0,
			correctTyped: 0,
			totalTyped: 0,
			stage: 1,
			durationMs: MIN_PLAY_DURATION_MS,
		});

		// Act
		const result = validateScorePlausibility(submission);

		// Assert
		expect(result.success).toBe(true);
	});

	it("数値フィールドに小数が含まれる場合、INVALID_SCORE_SUBMISSIONエラーになる", () => {
		// Arrange
		const submission = createValidSubmission({ score: 100.5 });

		// Act
		const result = validateScorePlausibility(submission);

		// Assert
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.code).toBe(
				DOMAIN_ERROR_CODES.INVALID_SCORE_SUBMISSION,
			);
		}
	});

	it("負の数値または0以下のステージが含まれる場合、INVALID_SCORE_SUBMISSIONエラーになる", () => {
		// Arrange
		const negativeScore = createValidSubmission({ score: -100 });
		const zeroStage = createValidSubmission({ stage: 0 });

		// Act
		const res1 = validateScorePlausibility(negativeScore);
		const res2 = validateScorePlausibility(zeroStage);

		// Assert
		expect(res1.success).toBe(false);
		expect(res2.success).toBe(false);
	});

	it("プレイ時間が5000ms未満または2時間を超える場合、INVALID_SCORE_SUBMISSIONエラーになる", () => {
		// Arrange
		const tooShort = createValidSubmission({
			durationMs: MIN_PLAY_DURATION_MS - 1,
		});
		const tooLong = createValidSubmission({
			durationMs: MAX_PLAY_DURATION_MS + 1,
		});

		// Act
		const shortResult = validateScorePlausibility(tooShort);
		const longResult = validateScorePlausibility(tooLong);

		// Assert
		expect(shortResult.success).toBe(false);
		expect(longResult.success).toBe(false);
	});

	it("正解打鍵数が総打鍵数を超えている場合、INVALID_SCORE_SUBMISSIONエラーになる", () => {
		// Arrange
		const submission = createValidSubmission({
			correctTyped: 30,
			totalTyped: 29,
		});

		// Act
		const result = validateScorePlausibility(submission);

		// Assert
		expect(result.success).toBe(false);
	});

	it("最大コンボ数が正解打鍵数を超えている場合、INVALID_SCORE_SUBMISSIONエラーになる", () => {
		// Arrange
		const submission = createValidSubmission({
			maxCombo: 25,
			correctTyped: 24,
			totalTyped: 25,
		});

		// Act
		const result = validateScorePlausibility(submission);

		// Assert
		expect(result.success).toBe(false);
	});

	it("撃破数が正解打鍵数を超えている場合、INVALID_SCORE_SUBMISSIONエラーになる", () => {
		// Arrange
		const submission = createValidSubmission({
			kills: 12,
			correctTyped: 10,
			totalTyped: 12,
			maxCombo: 10,
			stage: 3,
		});

		// Act
		const result = validateScorePlausibility(submission);

		// Assert
		expect(result.success).toBe(false);
	});

	it("到達ステージが撃破数(6キルごとに+1)と整合しない場合、INVALID_SCORE_SUBMISSIONエラーになる", () => {
		// Arrange
		const submission = createValidSubmission({
			kills: 6,
			stage: 5,
		});

		// Act
		const result = validateScorePlausibility(submission);

		// Assert
		expect(result.success).toBe(false);
	});

	it("撃破数が0にもかかわらずスコアが1以上の場合、INVALID_SCORE_SUBMISSIONエラーになる", () => {
		// Arrange
		const submission = createValidSubmission({
			kills: 0,
			stage: 1,
			score: 100,
		});

		// Act
		const result = validateScorePlausibility(submission);

		// Assert
		expect(result.success).toBe(false);
	});

	it("スコアが理論上限値ちょうどの場合に成功し、理論上限値+1の場合にINVALID_SCORE_SUBMISSIONエラーになる", () => {
		// Arrange: correctTyped=20, maxCombo=10 -> multiplier = 1 + floor(10/5)*0.2 = 1.4 -> maxScore = 20 * 100 * 1.4 = 2800
		const exactLimit = createValidSubmission({
			kills: 5,
			stage: 1,
			correctTyped: 20,
			totalTyped: 20,
			maxCombo: 10,
			score: 2800,
		});
		const overLimit = createValidSubmission({
			kills: 5,
			stage: 1,
			correctTyped: 20,
			totalTyped: 20,
			maxCombo: 10,
			score: 2801,
		});

		// Act
		const exactResult = validateScorePlausibility(exactLimit);
		const overResult = validateScorePlausibility(overLimit);

		// Assert
		expect(exactResult.success).toBe(true);
		expect(overResult.success).toBe(false);
	});

	it("打鍵速度が秒間20打鍵の上限ちょうどの場合に成功し、上限+1の場合にINVALID_SCORE_SUBMISSIONエラーになる", () => {
		// Arrange: durationMs = 5000ms (5秒) -> 上限総打鍵数 = 5 * 20 = 100
		const exactSpeed = createValidSubmission({
			durationMs: 5000,
			totalTyped: 100,
		});
		const overSpeed = createValidSubmission({
			durationMs: 5000,
			totalTyped: 101,
		});

		// Act
		const exactResult = validateScorePlausibility(exactSpeed);
		const overResult = validateScorePlausibility(overSpeed);

		// Assert
		expect(exactResult.success).toBe(true);
		expect(overResult.success).toBe(false);
	});
});
