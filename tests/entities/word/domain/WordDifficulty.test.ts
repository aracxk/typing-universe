import { describe, expect, it } from "vitest";
import { WordDifficulty } from "../../../../src/entities/word/domain/WordDifficulty";
import { Result } from "../../../../src/shared/core/Result";

describe("WordDifficulty", () => {
	it("有効な難易度名を指定した場合、WordDifficultyインスタンスが生成される", () => {
		// Arrange
		const validName = "easy";

		// Act
		const result = WordDifficulty.create(validName);

		// Assert
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.value.value).toBe("easy");
		}
	});

	it("無効な難易度名を指定した場合、エラーが返される", () => {
		// Arrange
		const invalidName = "extreme";

		// Act
		const result = WordDifficulty.create(invalidName);

		// Assert
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.message).toContain("不正な難易度です");
		}
	});

	it("同じ難易度値を持つインスタンス同士を比較した場合、trueになる", () => {
		// Arrange
		const diff1 = WordDifficulty.create("normal");
		const diff2 = WordDifficulty.create("normal");

		// Act & Assert
		if (diff1.success && diff2.success) {
			expect(diff1.value.equals(diff2.value)).toBe(true);
		}
	});

	it("異なる難易度値を持つインスタンス同士を比較した場合、falseになる", () => {
		// Arrange
		const diff1 = WordDifficulty.create("normal");
		const diff2 = WordDifficulty.create("hard");

		// Act & Assert
		if (diff1.success && diff2.success) {
			expect(diff1.value.equals(diff2.value)).toBe(false);
		}
	});

	it("nullまたはundefinedと比較した場合、falseになる", () => {
		// Arrange
		const diff = WordDifficulty.create("easy");

		// Act & Assert
		if (diff.success) {
			// @ts-expect-error テスト目的でnullを渡す
			expect(diff.value.equals(null)).toBe(false);
			// @ts-expect-error テスト目的でundefinedを渡す
			expect(diff.value.equals(undefined)).toBe(false);
		}
	});
	it("Flyweightパターンにより同一の難易度には同じインスタンスを返す", () => {
		// Arrange & Act
		const diff1 = Result.unwrap(WordDifficulty.create("normal"));
		const diff2 = Result.unwrap(WordDifficulty.create("normal"));

		// Assert
		expect(diff1).toBe(diff2);
	});
});
