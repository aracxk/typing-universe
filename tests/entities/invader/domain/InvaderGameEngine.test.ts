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

	it("初期状態は正しく設定される", () => {
		const engine = InvaderGameEngine.create(EntityId.create("eng-1"), 500);
		expect(engine.score).toBe(0);
		expect(engine.status).toBe("playing");
		expect(engine.invaders.length).toBe(0);
	});

	it("spawn() でインベーダーが追加される", () => {
		const engine = InvaderGameEngine.create(EntityId.create("eng-1"), 500);
		engine.spawn(createInvader("inv-1", "林檎", ["ringo"], 0));
		expect(engine.invaders.length).toBe(1);
	});

	it("tick() でインベーダーが移動し、Y座標がゲーム画面の高さを超えるとゲームオーバーになる", () => {
		const engine = InvaderGameEngine.create(EntityId.create("eng-1"), 500);
		engine.spawn(createInvader("inv-1", "林檎", ["ringo"], 400));

		engine.tick(500); // 100px/s * 0.5s = 50px (y = 450)
		expect(engine.status).toBe("playing");

		engine.tick(600); // +60px (y = 510) -> gameover
		expect(engine.status).toBe("gameover");
	});

	it("ゲームオーバー後は spawn や tick や type が無効になる", () => {
		const engine = InvaderGameEngine.create(EntityId.create("eng-1"), 500);
		engine.spawn(createInvader("inv-1", "林檎", ["ringo"], 550));
		engine.tick(100); // 直ちにゲームオーバーになる
		expect(engine.status).toBe("gameover");

		engine.spawn(createInvader("inv-2", "蜜柑", ["mikan"], 0));
		expect(engine.invaders.length).toBe(1); // 追加されない

		engine.tick(1000); // y=550から移動しない
		expect(engine.invaders[0].y).toBe(560); // tick(100)で10進んでいる

		const result = engine.type("r");
		expect(result).toBe(false);
	});

	it("type() で正しく入力するとスコアが加算され、インベーダーが削除される", () => {
		const engine = InvaderGameEngine.create(EntityId.create("eng-1"), 500);
		engine.spawn(createInvader("inv-1", "あ", ["a"], 0));

		const matched = engine.type("a");
		expect(matched).toBe(true);
		expect(engine.score).toBe(100);
		expect(engine.invaders.length).toBe(0);
		expect(engine.focusedInvaderId).toBeNull();
	});

	it("type() で複数インベーダーがいる場合、一番下にいる敵（Y座標が最大）を優先してフォーカスする", () => {
		const engine = InvaderGameEngine.create(EntityId.create("eng-1"), 500);
		// Y座標が違う敵をスポーン。同じ開始文字 's' を持つ。
		engine.spawn(createInvader("inv-top", "西瓜", ["suika"], 10));
		engine.spawn(createInvader("inv-bottom", "酸っぱい", ["suppai"], 100));

		const matched = engine.type("s");
		expect(matched).toBe(true);
		expect(engine.focusedInvaderId?.value).toBe("inv-bottom");

		// フォーカスされた後は、フォーカスされた敵に入力が向かう
		engine.type("u"); // suppai の2文字目
		expect(
			engine.invaders.find((i) => i.id.value === "inv-bottom")?.activeWord
				.currentIndex,
		).toBe(2);
		expect(
			engine.invaders.find((i) => i.id.value === "inv-top")?.activeWord
				.currentIndex,
		).toBe(0);
	});

	it("フォーカス中の敵の入力に失敗した場合、別の敵にはフォーカスが移らず false を返す", () => {
		const engine = InvaderGameEngine.create(EntityId.create("eng-1"), 500);
		engine.spawn(createInvader("inv-1", "西瓜", ["suika"], 10));
		engine.spawn(createInvader("inv-2", "桃", ["momo"], 20));

		engine.type("s"); // inv-1 がフォーカスされる
		expect(engine.focusedInvaderId?.value).toBe("inv-1");

		const matched = engine.type("m"); // 間違えたキー
		expect(matched).toBe(false);
		expect(engine.focusedInvaderId?.value).toBe("inv-1"); // フォーカスは外れない
	});

	it("フォーカス中の敵に正しく入力して倒した場合はスコアが加算されフォーカスが解除される", () => {
		const engine = InvaderGameEngine.create(EntityId.create("eng-1"), 500);
		engine.spawn(createInvader("inv-1", "桃", ["momo"], 20));

		// 最初の一文字でフォーカス
		engine.type("m");
		expect(engine.focusedInvaderId?.value).toBe("inv-1");

		// 残りを入力して倒す
		engine.type("o");
		engine.type("m");
		engine.type("o");

		expect(engine.score).toBe(100);
		expect(engine.invaders.length).toBe(0);
		expect(engine.focusedInvaderId).toBeNull();
	});

	it("フォーカスがなく、どの敵にもマッチしない入力の場合は false を返す", () => {
		const engine = InvaderGameEngine.create(EntityId.create("eng-1"), 500);
		engine.spawn(createInvader("inv-1", "桃", ["momo"], 20));

		const matched = engine.type("z");
		expect(matched).toBe(false);
		expect(engine.focusedInvaderId).toBeNull();
	});

	it("フォーカス中の敵IDが設定されているが、実際のインベーダー配列に存在しない場合は処理がスキップされ候補探しに戻る", () => {
		const engine = InvaderGameEngine.create(EntityId.create("eng-1"), 500);
		engine.spawn(createInvader("inv-1", "桃", ["momo"], 20));

		// 強制的にプライベート変数 _focusedInvaderId に存在しないIDを入れる
		(engine as unknown as { _focusedInvaderId: EntityId })._focusedInvaderId =
			EntityId.create("non-existent");

		// 存在しない敵へのフォーカスは無視され、新規ターゲット(inv-1)にヒットするか検証
		const matched = engine.type("m");
		expect(matched).toBe(true);
		expect(engine.focusedInvaderId?.value).toBe("inv-1");
	});
});
