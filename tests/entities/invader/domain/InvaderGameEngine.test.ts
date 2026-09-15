import { describe, expect, it } from "vitest";
import { ActiveWord } from "../../../../src/entities/core/domain/ActiveWord";
import { TargetWord } from "../../../../src/entities/core/domain/TargetWord";
import { Invader } from "../../../../src/entities/invader/domain/Invader";
import { InvaderGameEngine } from "../../../../src/entities/invader/domain/InvaderGameEngine";
import { Result } from "../../../../src/shared/core/Result";
import { EntityId } from "../../../../src/shared/domain/EntityId";

describe("InvaderGameEngine", () => {
	const createInvader = (
		idStr: string,
		word: string,
		readings: string[],
		y: number,
	) => {
		const target = Result.unwrap(TargetWord.create(word, readings));
		const active = ActiveWord.create(EntityId.create(`word-${idStr}`), target);
		return Result.unwrap(
			Invader.create(EntityId.create(idStr), active, 10, y, 100),
		);
	};

	it("初期化した場合、scoreが0、livesが3、statusがplayingの初期状態になる", () => {
		const engine = InvaderGameEngine.create(EntityId.create("eng-1"), 500);
		expect(engine.score).toBe(0);
		expect(engine.lives).toBe(3);
		expect(engine.status).toBe("playing");
		expect(engine.invaders.length).toBe(0);
	});

	it("spawn()を呼んだ場合、インベーダーが配列に追加される", () => {
		const engine = InvaderGameEngine.create(EntityId.create("eng-1"), 500);
		engine.spawn(createInvader("inv-1", "林檎", ["ringo"], 0));
		expect(engine.invaders.length).toBe(1);
	});

	it("tick()で敵が画面最下部を超えた場合、ライフが減少し敵が消滅するがゲームオーバーにはならない", () => {
		const engine = InvaderGameEngine.create(EntityId.create("eng-1"), 500);
		engine.spawn(createInvader("inv-1", "林檎", ["ringo"], 400));

		engine.tick(500); // 100px/s * 0.5s = 50px (y = 450)
		expect(engine.status).toBe("playing");
		expect(engine.lives).toBe(3);
		expect(engine.invaders.length).toBe(1);

		engine.tick(600); // +60px (y = 510) -> exceeds 500
		expect(engine.status).toBe("playing"); // まだライフが残っている
		expect(engine.lives).toBe(2);
		expect(engine.invaders.length).toBe(0); // 到達した敵は消える
	});

	it("tick()で敵が到達しライフが0になった場合、ゲームオーバーになる", () => {
		const engine = InvaderGameEngine.create(EntityId.create("eng-1"), 500);
		engine.spawn(createInvader("inv-1", "林檎", ["ringo"], 450));
		engine.spawn(createInvader("inv-2", "蜜柑", ["mikan"], 450));
		engine.spawn(createInvader("inv-3", "西瓜", ["suika"], 450));

		// 一気に3体が下限を超える
		engine.tick(600);

		expect(engine.status).toBe("gameover");
		expect(engine.lives).toBe(0);
		// ゲームオーバーと判定された時点で打ち切られるため、1体残る可能性があるがここでは状態を確認
	});

	it("ゲームオーバー状態の場合、spawnやtickやtypeの処理はすべて無効になる", () => {
		const engine = InvaderGameEngine.create(EntityId.create("eng-1"), 500);
		engine.spawn(createInvader("inv-1", "林檎", ["ringo"], 550));
		engine.spawn(createInvader("inv-2", "林檎", ["ringo"], 550));
		engine.spawn(createInvader("inv-3", "林檎", ["ringo"], 550));
		engine.tick(100); // 3体が一気に下限を超えてゲームオーバー
		expect(engine.status).toBe("gameover");

		// spawnが無効
		engine.spawn(createInvader("inv-4", "蜜柑", ["mikan"], 0));
		const invCount = engine.invaders.length;

		// tickが無効 (残った敵が移動しない)
		engine.tick(1000);
		expect(engine.invaders.length).toBe(invCount);

		// typeが無効
		const result = engine.type("r");
		expect(result).toBe(false);
	});

	it("フォーカス中の敵が防衛ラインに到達した場合、フォーカスがリセットされライフが減少する", () => {
		const engine = InvaderGameEngine.create(EntityId.create("eng-1"), 500);
		engine.spawn(createInvader("inv-1", "あ", ["a"], 450));

		// 強制的にフォーカスをセット
		(engine as unknown as { _focusedInvaderId: EntityId })._focusedInvaderId =
			EntityId.create("inv-1");

		engine.tick(600); // 500を超える
		expect(engine.lives).toBe(2);
		expect(engine.focusedInvaderId).toBeNull();
	});

	it("type()で正しく入力した場合、スコアが加算され敵が消滅する", () => {
		const engine = InvaderGameEngine.create(EntityId.create("eng-1"), 500);
		engine.spawn(createInvader("inv-1", "あ", ["a"], 0));

		const matched = engine.type("a");
		expect(matched).toBe(true);
		expect(engine.score).toBe(100);
		expect(engine.invaders.length).toBe(0);
		expect(engine.focusedInvaderId).toBeNull();
	});

	it("複数敵がいる状態でtype()を入力した場合、最もY座標が大きい（下に近い）敵が優先してフォーカスされる", () => {
		const engine = InvaderGameEngine.create(EntityId.create("eng-1"), 500);
		engine.spawn(createInvader("inv-top", "西瓜", ["suika"], 10));
		engine.spawn(createInvader("inv-bottom", "酸っぱい", ["suppai"], 100));

		const matched = engine.type("s");
		expect(matched).toBe(true);
		expect(engine.focusedInvaderId?.value).toBe("inv-bottom");

		engine.type("u");
		expect(
			engine.invaders.find((i) => i.id.value === "inv-bottom")?.activeWord
				.currentIndex,
		).toBe(2);
		expect(
			engine.invaders.find((i) => i.id.value === "inv-top")?.activeWord
				.currentIndex,
		).toBe(0);
	});

	it("フォーカス中の敵の入力で間違えたキーを押した場合、別の敵にフォーカスが移らずfalseを返す", () => {
		const engine = InvaderGameEngine.create(EntityId.create("eng-1"), 500);
		engine.spawn(createInvader("inv-1", "西瓜", ["suika"], 10));
		engine.spawn(createInvader("inv-2", "桃", ["momo"], 20));

		engine.type("s");
		expect(engine.focusedInvaderId?.value).toBe("inv-1");

		const matched = engine.type("m");
		expect(matched).toBe(false);
		expect(engine.focusedInvaderId?.value).toBe("inv-1");
	});

	it("フォーカス中の敵に正しく入力して倒した場合、スコアが加算されフォーカスが解除される", () => {
		const engine = InvaderGameEngine.create(EntityId.create("eng-1"), 500);
		engine.spawn(createInvader("inv-1", "桃", ["momo"], 20));

		engine.type("m");
		expect(engine.focusedInvaderId?.value).toBe("inv-1");

		engine.type("o");
		engine.type("m");
		engine.type("o");

		expect(engine.score).toBe(100);
		expect(engine.invaders.length).toBe(0);
		expect(engine.focusedInvaderId).toBeNull();
	});

	it("どの敵にもマッチしない入力をした場合、falseを返す", () => {
		const engine = InvaderGameEngine.create(EntityId.create("eng-1"), 500);
		engine.spawn(createInvader("inv-1", "桃", ["momo"], 20));

		const matched = engine.type("z");
		expect(matched).toBe(false);
		expect(engine.focusedInvaderId).toBeNull();
	});

	it("フォーカス中の敵IDが配列に存在しない場合、処理がスキップされ新規候補探しへ移行する", () => {
		const engine = InvaderGameEngine.create(EntityId.create("eng-1"), 500);
		engine.spawn(createInvader("inv-1", "桃", ["momo"], 20));

		(engine as unknown as { _focusedInvaderId: EntityId })._focusedInvaderId =
			EntityId.create("non-existent");

		const matched = engine.type("m");
		expect(matched).toBe(true);
		expect(engine.focusedInvaderId?.value).toBe("inv-1");
	});
});
