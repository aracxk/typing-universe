import { describe, expect, it } from "vitest";
import type { WordDefinition } from "../../../../src/entities/word/domain/WordDefinition";
import { InMemoryWordRepository } from "../../../../src/entities/word/repository/WordRepository";

describe("InMemoryWordRepository", () => {
	const dummyWords: readonly WordDefinition[] = [
		{
			id: "1",
			word: "林檎",
			readings: ["ringo"],
			category: "general_fruits",
			difficulty: "easy",
		},
		{
			id: "2",
			word: "葡萄",
			readings: ["budou"],
			category: "general_fruits",
			difficulty: "normal",
		},
		{
			id: "3",
			word: "NullPointer",
			readings: ["nullpointer"],
			category: "it_errors",
			difficulty: "hard",
		},
	];

	it("getAllを呼んだ場合、登録されているすべての単語が返される", () => {
		// Arrange
		const repo = new InMemoryWordRepository();
		repo.__setWordsForTesting([...dummyWords]);

		// Act
		const words = repo.getAll();

		// Assert
		expect(words).toHaveLength(3);
	});

	it("カテゴリでフィルタした場合、一致する単語のみが返される", () => {
		// Arrange
		const repo = new InMemoryWordRepository();
		repo.__setWordsForTesting([...dummyWords]);

		// Act
		const fruits = repo.filter({ category: "general_fruits" });
		const errors = repo.filter({ category: "it_errors" });

		// Assert
		expect(fruits).toHaveLength(2);
		expect(errors).toHaveLength(1);
		expect(errors[0].id).toBe("3");
	});

	it("難易度でフィルタした場合、一致する単語のみが返される", () => {
		// Arrange
		const repo = new InMemoryWordRepository();
		repo.__setWordsForTesting([...dummyWords]);

		// Act
		const easyWords = repo.filter({ difficulty: "easy" });
		const hardWords = repo.filter({ difficulty: "hard" });

		// Assert
		expect(easyWords).toHaveLength(1);
		expect(easyWords[0].id).toBe("1");
		expect(hardWords).toHaveLength(1);
		expect(hardWords[0].id).toBe("3");
	});

	it("カテゴリと難易度の両方でフィルタした場合、両方に一致する単語のみが返される", () => {
		// Arrange
		const repo = new InMemoryWordRepository();
		repo.__setWordsForTesting([...dummyWords]);

		// Act
		const result = repo.filter({
			category: "general_fruits",
			difficulty: "normal",
		});

		// Assert
		expect(result).toHaveLength(1);
		expect(result[0].id).toBe("2");
	});

	it("一致する単語がない条件でgetRandomDefinitionを呼んだ場合、nullが返される", () => {
		// Arrange
		const repo = new InMemoryWordRepository();
		repo.__setWordsForTesting([...dummyWords]);

		// Act
		const result = repo.getRandomDefinition({
			category: "it_errors",
			difficulty: "easy",
		});

		// Assert
		expect(result).toBeNull();
	});

	it("一致する単語がある条件でgetRandomTargetWordを呼んだ場合、TargetWordが正常に返される", () => {
		// Arrange
		const repo = new InMemoryWordRepository();
		repo.__setWordsForTesting([...dummyWords]);

		// Act
		const result = repo.getRandomTargetWord({
			category: "it_errors",
			difficulty: "hard",
		});

		// Assert
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.value.word).toBe("NullPointer");
			expect(result.value.readings).toEqual(["nullpointer"]);
		}
	});

	it("一致する単語がない条件でgetRandomTargetWordを呼んだ場合、エラーが返される", () => {
		// Arrange
		const repo = new InMemoryWordRepository();
		repo.__setWordsForTesting([...dummyWords]);

		// Act
		const result = repo.getRandomTargetWord({
			category: "programming",
		});

		// Assert
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.message).toContain("見つかりませんでした");
		}
	});

	it("不正な単語データ（読みが空）が含まれる場合、getRandomTargetWordでエラーが返される", () => {
		// Arrange
		const brokenWords: readonly WordDefinition[] = [
			{
				id: "broken",
				word: "空の読み",
				readings: [],
				category: "programming",
				difficulty: "easy",
			},
		];
		const repo = new InMemoryWordRepository();
		repo.__setWordsForTesting([...brokenWords]);

		// Act
		const result = repo.getRandomTargetWord();

		// Assert
		expect(result.success).toBe(false);
	});
});
