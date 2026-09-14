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
