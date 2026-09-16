import { describe, expect, it } from "vitest";
import { ActiveWord } from "../../../../src/entities/word/domain/ActiveWord";
import { TargetWord } from "../../../../src/entities/word/domain/TargetWord";
import { TargetWordError } from "../../../../src/entities/word/domain/TargetWordError";
import { Result } from "../../../../src/shared/core/Result";
import { EntityId } from "../../../../src/shared/domain/EntityId";

describe("TargetWord", () => {
	it("読み配列が空の場合はエラーを返す", () => {
		const result = TargetWord.create("林檎", []);
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toBeInstanceOf(TargetWordError);
			expect(result.error.code).toBe("INVALID_TARGET_WORD_READING");
		}
	});

	it("読み配列に空文字列が含まれる場合はエラーを返す", () => {
		const result = TargetWord.create("林檎", ["ringo", ""]);
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toBeInstanceOf(TargetWordError);
			expect(result.error.code).toBe("INVALID_TARGET_WORD_READING");
		}
	});

	it("正常な単語と読みを渡した場合は成功する", () => {
		const result = TargetWord.create("林檎", ["ringo"]);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.value.word).toBe("林檎");
			expect(result.value.readings).toEqual(["ringo"]);
		}
	});

	it("equals() で同一の単語・読みを持つオブジェクトは true と判定される", () => {
		const word1 = Result.unwrap(TargetWord.create("林檎", ["ringo"]));
		const word2 = Result.unwrap(TargetWord.create("林檎", ["ringo"]));
		expect(word1.equals(word2)).toBe(true);
	});

	it("equals() で異なる読みを持つオブジェクトは false と判定される", () => {
		const word1 = Result.unwrap(TargetWord.create("林檎", ["ringo"]));
		const word2 = Result.unwrap(TargetWord.create("林檎", ["apple"]));
		expect(word1.equals(word2)).toBe(false);
	});

	it("equals() で異なる読みの数を持つオブジェクトは false と判定される", () => {
		const word1 = Result.unwrap(TargetWord.create("林檎", ["ringo"]));
		const word2 = Result.unwrap(TargetWord.create("林檎", ["ringo", "rinngo"]));
		expect(word1.equals(word2)).toBe(false);
	});

	it("equals() で null または undefined が渡された場合は false と判定される", () => {
		const word1 = Result.unwrap(TargetWord.create("林檎", ["ringo"]));
		expect(word1.equals(null as unknown as TargetWord)).toBe(false);
		expect(word1.equals(undefined as unknown as TargetWord)).toBe(false);
	});
});

describe("ActiveWord", () => {
	const createActiveWord = (word: string, readings: string[]) => {
		const targetResult = TargetWord.create(word, readings);
		const target = Result.unwrap(targetResult);
		const id = EntityId.create("test-id");
		return ActiveWord.create(id, target);
	};

	it("正しいキーを入力すると currentIndex が進み true を返す", () => {
		const active = createActiveWord("林檎", ["ringo"]);
		const result = active.type("r");
		expect(result).toBe(true);
		expect(active.currentIndex).toBe(1);
		expect(active.isCompleted()).toBe(false);
	});

	it("間違ったキーを入力すると currentIndex は進まず false を返す", () => {
		const active = createActiveWord("林檎", ["ringo"]);
		const result = active.type("x");
		expect(result).toBe(false);
		expect(active.currentIndex).toBe(0);
	});

	it("最後まで正しく入力すると isCompleted が true になる", () => {
		const active = createActiveWord("林檎", ["ringo"]);
		"ring".split("").forEach((c) => {
			active.type(c);
		});
		const result = active.type("o");
		expect(result).toBe(true);
		expect(active.currentIndex).toBe(5);
		expect(active.isCompleted()).toBe(true);
	});

	it("完了後に入力しても無視されて false を返す", () => {
		const active = createActiveWord("林檎", ["ringo"]);
		for (const c of "ringo") {
			active.type(c);
		}
		const result = active.type("a");
		expect(result).toBe(false);
		expect(active.currentIndex).toBe(5);
	});

	it("揺らぎ吸収: 複数の読み(shi/si)がある場合、どちらの入力経路でも受容できる (shiルート)", () => {
		const active = createActiveWord("し", ["shi", "si"]);
		expect(active.type("s")).toBe(true); // "s" matches both "shi" and "si"
		expect(active.type("h")).toBe(true); // "sh" matches "shi"
		expect(active.type("i")).toBe(true); // "shi" matches "shi"
		expect(active.isCompleted()).toBe(true);
	});

	it("揺らぎ吸収: 複数の読み(shi/si)がある場合、どちらの入力経路でも受容できる (siルート)", () => {
		const active = createActiveWord("し", ["shi", "si"]);
		expect(active.type("s")).toBe(true); // "s" matches both "shi" and "si"
		expect(active.type("i")).toBe(true); // "si" matches "si"
		expect(active.isCompleted()).toBe(true);
	});
});
