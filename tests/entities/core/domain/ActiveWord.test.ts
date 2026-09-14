import { describe, expect, it } from "vitest";
import { ActiveWord } from "../../../../src/entities/core/domain/ActiveWord";
import { TargetWord } from "../../../../src/entities/core/domain/TargetWord";
import { TargetWordError } from "../../../../src/entities/core/domain/TargetWordError";
import { Result } from "../../../../src/shared/core/Result";
import { EntityId } from "../../../../src/shared/domain/EntityId";

describe("TargetWord", () => {
	it("読みが空の場合はエラーを返す", () => {
		const result = TargetWord.create("林檎", "");
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toBeInstanceOf(TargetWordError);
			expect(result.error.code).toBe("INVALID_TARGET_WORD_READING");
		}
	});

	it("正常な単語と読みを渡した場合は成功する", () => {
		const result = TargetWord.create("林檎", "ringo");
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.value.word).toBe("林檎");
			expect(result.value.reading).toBe("ringo");
		}
	});

	it("equals() で同一の単語・読みを持つオブジェクトは true と判定される", () => {
		const word1 = Result.unwrap(TargetWord.create("林檎", "ringo"));
		const word2 = Result.unwrap(TargetWord.create("林檎", "ringo"));
		expect(word1.equals(word2)).toBe(true);
	});

	it("equals() で異なる読みを持つオブジェクトは false と判定される", () => {
		const word1 = Result.unwrap(TargetWord.create("林檎", "ringo"));
		const word2 = Result.unwrap(TargetWord.create("林檎", "apple"));
		expect(word1.equals(word2)).toBe(false);
	});

	it("equals() で null または undefined が渡された場合は false と判定される", () => {
		const word1 = Result.unwrap(TargetWord.create("林檎", "ringo"));
		expect(word1.equals(null as any)).toBe(false);
		expect(word1.equals(undefined as any)).toBe(false);
	});
});

describe("ActiveWord", () => {
	const createActiveWord = (word: string, reading: string) => {
		const targetResult = TargetWord.create(word, reading);
		const target = Result.unwrap(targetResult);
		const id = EntityId.create("test-id");
		return ActiveWord.create(id, target);
	};

	it("正しいキーを入力すると currentIndex が進み true を返す", () => {
		// Arrange
		const active = createActiveWord("林檎", "ringo");

		// Act
		const result = active.type("r");

		// Assert
		expect(result).toBe(true);
		expect(active.currentIndex).toBe(1);
		expect(active.isCompleted()).toBe(false);
	});

	it("間違ったキーを入力すると currentIndex は進まず false を返す", () => {
		// Arrange
		const active = createActiveWord("林檎", "ringo");

		// Act
		const result = active.type("x");

		// Assert
		expect(result).toBe(false);
		expect(active.currentIndex).toBe(0);
	});

	it("最後まで正しく入力すると isCompleted が true になる", () => {
		// Arrange
		const active = createActiveWord("林檎", "ringo");

		// Act
		active.type("r");
		active.type("i");
		active.type("n");
		active.type("g");
		const result = active.type("o");

		// Assert
		expect(result).toBe(true);
		expect(active.currentIndex).toBe(5);
		expect(active.isCompleted()).toBe(true);
	});

	it("完了後に入力しても無視されて false を返す", () => {
		// Arrange
		const active = createActiveWord("林檎", "ringo");
		for (const c of "ringo") {
			active.type(c);
		}

		// Act
		const result = active.type("a");

		// Assert
		expect(result).toBe(false);
		expect(active.currentIndex).toBe(5);
	});
});
