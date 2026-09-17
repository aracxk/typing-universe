import { describe, expect, it } from "vitest";
import { TypingMetrics } from "../../../../src/entities/core/domain/TypingMetrics";

describe("TypingMetrics", () => {
	it("初期状態の確認", () => {
		const metrics = new TypingMetrics();
		expect(metrics.score).toBe(0);
		expect(metrics.combo).toBe(0);
		expect(metrics.maxCombo).toBe(0);
		expect(metrics.totalTyped).toBe(0);
		expect(metrics.correctTyped).toBe(0);
		expect(metrics.kills).toBe(0);
		expect(metrics.accuracy).toBe(100);
		expect(metrics.rank).toBe("C (JUNIOR DEV)");
	});

	it("recordHit でコンボと精度が上昇する", () => {
		const metrics = new TypingMetrics();
		metrics.recordHit();
		metrics.recordHit();

		expect(metrics.totalTyped).toBe(2);
		expect(metrics.correctTyped).toBe(2);
		expect(metrics.combo).toBe(2);
		expect(metrics.maxCombo).toBe(2);
		expect(metrics.accuracy).toBe(100);
	});

	it("recordMiss でコンボがリセットされ精度が低下する", () => {
		const metrics = new TypingMetrics();
		metrics.recordHit();
		metrics.recordMiss();

		expect(metrics.totalTyped).toBe(2);
		expect(metrics.correctTyped).toBe(1);
		expect(metrics.combo).toBe(0); // リセット
		expect(metrics.maxCombo).toBe(1); // 最大コンボは維持
		expect(metrics.accuracy).toBe(50);
	});

	it("recordKill でスコアとキル数が加算され、コンボボーナスが適用される", () => {
		const metrics = new TypingMetrics();
		// コンボボーナス: 1 + Math.floor(combo / 5) * 0.2
		// コンボ0〜4 は 1倍
		metrics.recordKill(1000);
		expect(metrics.score).toBe(1000);
		expect(metrics.kills).toBe(1);

		// コンボ5 にする
		for (let i = 0; i < 5; i++) metrics.recordHit();

		// コンボ5 は 1.2倍
		metrics.recordKill(1000);
		expect(metrics.score).toBe(1000 + 1200); // = 2200
		expect(metrics.kills).toBe(2);
	});

	it("resetCombo でコンボが0になる", () => {
		const metrics = new TypingMetrics();
		metrics.recordHit();
		metrics.recordHit();
		metrics.resetCombo();

		expect(metrics.combo).toBe(0);
		expect(metrics.maxCombo).toBe(2);
	});
	it("recordKill に負の値を渡すとエラーになる", () => {
		const metrics = new TypingMetrics();
		expect(() => metrics.recordKill(-100)).toThrow(
			"baseScore must be greater than or equal to 0",
		);
	});
});
