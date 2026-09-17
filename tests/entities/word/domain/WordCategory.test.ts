import { describe, expect, it } from "vitest";
import { WordCategory } from "../../../../src/entities/word/domain/WordCategory";
import { Result } from "../../../../src/shared/core/Result";

describe("WordCategory", () => {
	it("有効なカテゴリ名を指定した場合、WordCategoryインスタンスが生成される", () => {
		// Arrange
		const validName = "it_errors";

		// Act
		const result = WordCategory.create(validName);

		// Assert
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.value.value).toBe("it_errors");
		}
	});

	it("無効なカテゴリ名を指定した場合、エラーが返される", () => {
		// Arrange
		const invalidName = "invalid_category";

		// Act
		const result = WordCategory.create(invalidName);

		// Assert
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.message).toContain("不正なカテゴリです");
		}
	});

	it("同じカテゴリ値を持つインスタンス同士を比較した場合、trueになる", () => {
		// Arrange
		const cat1 = WordCategory.create("programming");
		const cat2 = WordCategory.create("programming");

		// Act & Assert
		if (cat1.success && cat2.success) {
			expect(cat1.value.equals(cat2.value)).toBe(true);
		}
	});

	it("異なるカテゴリ値を持つインスタンス同士を比較した場合、falseになる", () => {
		// Arrange
		const cat1 = WordCategory.create("programming");
		const cat2 = WordCategory.create("web_tech");

		// Act & Assert
		if (cat1.success && cat2.success) {
			expect(cat1.value.equals(cat2.value)).toBe(false);
		}
	});

	it("nullまたはundefinedと比較した場合、falseになる", () => {
		// Arrange
		const cat = WordCategory.create("it_errors");

		// Act & Assert
		if (cat.success) {
			// @ts-expect-error テスト目的でnullを渡す
			expect(cat.value.equals(null)).toBe(false);
			// @ts-expect-error テスト目的でundefinedを渡す
			expect(cat.value.equals(undefined)).toBe(false);
		}
	});
	it("Flyweightパターンにより同一のカテゴリには同じインスタンスを返す", () => {
		// Arrange & Act
		const cat1 = Result.unwrap(WordCategory.create("programming"));
		const cat2 = Result.unwrap(WordCategory.create("programming"));

		// Assert
		expect(cat1).toBe(cat2);
	});
});
