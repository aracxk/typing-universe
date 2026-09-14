import { describe, expect, it } from "vitest";
import { ActiveWord } from "../../../../src/entities/core/domain/ActiveWord";
import { TargetWord } from "../../../../src/entities/core/domain/TargetWord";

describe("ActiveWord", () => {
	it("正しいキーを入力すると currentIndex が進み true を返す", () => {
		// Arrange
		const target = new TargetWord("林檎", "ringo");
		const active = new ActiveWord(target);

		// Act
		const result = active.type("r");

		// Assert
		expect(result).toBe(true);
		expect(active.currentIndex).toBe(1);
		expect(active.isCompleted()).toBe(false);
	});

	it("間違ったキーを入力すると currentIndex は進まず false を返す", () => {
		// Arrange
		const target = new TargetWord("林檎", "ringo");
		const active = new ActiveWord(target);

		// Act
		const result = active.type("x");

		// Assert
		expect(result).toBe(false);
		expect(active.currentIndex).toBe(0);
	});

	it("最後まで正しく入力すると isCompleted が true になる", () => {
		// Arrange
		const target = new TargetWord("林檎", "ringo");
		const active = new ActiveWord(target);

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
		const target = new TargetWord("林檎", "ringo");
		const active = new ActiveWord(target);
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
