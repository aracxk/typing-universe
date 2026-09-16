import { describe, expect, it } from "vitest";
import { Invader } from "../../../../src/entities/invader/domain/Invader";
import { InvaderError } from "../../../../src/entities/invader/domain/InvaderError";
import { ActiveWord } from "../../../../src/entities/word/domain/ActiveWord";
import { TargetWord } from "../../../../src/entities/word/domain/TargetWord";
import { Result } from "../../../../src/shared/core/Result";
import { EntityId } from "../../../../src/shared/domain/EntityId";

describe("Invader", () => {
	const createTestActiveWord = () => {
		const target = Result.unwrap(TargetWord.create("敵", ["teki"]));
		return ActiveWord.create(EntityId.create("word-1"), target);
	};

	it("正常な値を指定した場合、成功してInvaderが生成される", () => {
		const activeWord = createTestActiveWord();
		const result = Invader.create(
			EntityId.create("inv-1"),
			activeWord,
			10,
			20,
			50,
		);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.value.x).toBe(10);
			expect(result.value.y).toBe(20);
			expect(result.value.speed).toBe(50);
			expect(result.value.isDead()).toBe(false);
		}
	});

	it("X座標が負の値の場合、INVALID_INVADER_COORDINATEエラーになる", () => {
		const result = Invader.create(
			EntityId.create("inv-1"),
			createTestActiveWord(),
			-1,
			20,
			50,
		);
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toBeInstanceOf(InvaderError);
			expect(result.error.code).toBe("INVALID_INVADER_COORDINATE");
		}
	});

	it("Y座標が負の値の場合、INVALID_INVADER_COORDINATEエラーになる", () => {
		const result = Invader.create(
			EntityId.create("inv-1"),
			createTestActiveWord(),
			10,
			-5,
			50,
		);
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toBeInstanceOf(InvaderError);
			expect(result.error.code).toBe("INVALID_INVADER_COORDINATE");
		}
	});

	it("速度が0以下の場合、INVALID_INVADER_SPEEDエラーになる", () => {
		const result = Invader.create(
			EntityId.create("inv-1"),
			createTestActiveWord(),
			10,
			20,
			0,
		);
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toBeInstanceOf(InvaderError);
			expect(result.error.code).toBe("INVALID_INVADER_SPEED");
		}
	});

	it("tick() を呼んだ場合、deltaTimeMsとspeedに応じてY座標が増加する", () => {
		const invader = Result.unwrap(
			Invader.create(
				EntityId.create("inv-1"),
				createTestActiveWord(),
				10,
				20,
				100,
			),
		);
		// 100 px/sec で 500ms (0.5sec) 経過 -> Yは +50 されるはず
		invader.tick(500);
		expect(invader.y).toBe(70);

		invader.tick(100); // さらに0.1秒 -> +10
		expect(invader.y).toBe(80);
	});

	it("ActiveWordの入力が完了した場合、isDead()がtrueになる", () => {
		const activeWord = createTestActiveWord();
		const invader = Result.unwrap(
			Invader.create(EntityId.create("inv-1"), activeWord, 10, 20, 100),
		);

		expect(invader.isDead()).toBe(false);

		// "teki" を入力する
		activeWord.type("t");
		activeWord.type("e");
		activeWord.type("k");
		activeWord.type("i");

		expect(invader.isDead()).toBe(true);
	});
});
