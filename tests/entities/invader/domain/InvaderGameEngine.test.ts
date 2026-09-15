import { describe, expect, it } from "vitest";
import { ActiveWord } from "../../../../src/entities/core/domain/ActiveWord";
import { TargetWord } from "../../../../src/entities/core/domain/TargetWord";
import { Invader } from "../../../../src/entities/invader/domain/Invader";
import { InvaderGameEngine } from "../../../../src/entities/invader/domain/InvaderGameEngine";
import { EntityId } from "../../../../src/shared/domain/EntityId";

describe("InvaderGameEngine", () => {
	const createTestInvader = (
		idStr: string,
		word: string,
		reading: string,
		y = 0,
	) => {
		const targetResult = TargetWord.create(word, [reading]);
		if (!targetResult.success) throw new Error("Invalid target");
		const target = targetResult.value;

		const activeWord = ActiveWord.create(
			EntityId.create(`word-${idStr}`),
			target,
		);

		const invResult = Invader.create(
			EntityId.create(idStr),
			activeWord,
			100,
			y,
			10,
		);
		if (!invResult.success) throw new Error("Invalid invader");

		return invResult.value;
	};

	describe("初期状態", () => {
		it("初期状態ではスコア0、ライフ3、コンボ0であること", () => {
			const engine = InvaderGameEngine.create(EntityId.create("engine-1"), 600);
			expect(engine.score).toBe(0);
			expect(engine.lives).toBe(3);
			expect(engine.combo).toBe(0);
			expect(engine.maxCombo).toBe(0);
			expect(engine.kills).toBe(0);
			expect(engine.stageLevel).toBe(1);
			expect(engine.accuracy).toBe(100);
		});
	});

	describe("タイピングの成功とコンボ", () => {
		it("タイピングに成功した場合、コンボと正解率が上昇すること", () => {
			const engine = InvaderGameEngine.create(EntityId.create("engine-1"), 600);
			const invader = createTestInvader("inv-1", "林檎", "ringo");
			engine.spawn(invader);

			const matched = engine.type("r");
			expect(matched).toBe(true);
			expect(engine.combo).toBe(1);
			expect(engine.maxCombo).toBe(1);
			expect(engine.totalTyped).toBe(1);
			expect(engine.correctTyped).toBe(1);
			expect(engine.accuracy).toBe(100);
		});

		it("タイピングに失敗した場合、コンボがリセットされること", () => {
			const engine = InvaderGameEngine.create(EntityId.create("engine-1"), 600);
			const invader = createTestInvader("inv-1", "林檎", "ringo");
			engine.spawn(invader);

			engine.type("r");
			expect(engine.combo).toBe(1);

			// ミスタイプ
			const matched = engine.type("x");
			expect(matched).toBe(false);
			expect(engine.combo).toBe(0);
			expect(engine.maxCombo).toBe(1); // 最大コンボは保持される
			expect(engine.totalTyped).toBe(2);
			expect(engine.correctTyped).toBe(1);
			expect(engine.accuracy).toBe(50); // 1/2
		});

		it("敵を撃破した場合、文字数とコンボ倍率に応じたスコアが加算されること", () => {
			const engine = InvaderGameEngine.create(EntityId.create("engine-1"), 600);
			// 2文字の単語
			const invader = createTestInvader("inv-1", "林檎", "abc");
			engine.spawn(invader);

			engine.type("a");
			engine.type("b");
			engine.type("c"); // コンボ3

			expect(engine.kills).toBe(1);
			// 2文字 * 100 * (1 + floor(3/5)*0.2) = 200 * 1 = 200
			expect(engine.score).toBe(200);
		});

		it("6キルごとにステージレベルが上がること", () => {
			const engine = InvaderGameEngine.create(EntityId.create("engine-1"), 600);
			for (let i = 0; i < 6; i++) {
				const inv = createTestInvader(`inv-${i}`, "a", "a");
				engine.spawn(inv);
				engine.type("a");
			}
			expect(engine.kills).toBe(6);
			expect(engine.stageLevel).toBe(2);
		});
	});

	describe("ライフとゲームオーバー", () => {
		it("敵が防衛ラインに到達した場合、ライフが1減ること", () => {
			const engine = InvaderGameEngine.create(EntityId.create("engine-1"), 600);
			// y=595からスタートし、speed=10でtickすれば600を越える
			const invader = createTestInvader("inv-1", "林檎", "ringo", 595);
			engine.spawn(invader);

			engine.tick(1000); // 1秒経過 (y += 10)

			expect(engine.lives).toBe(2);
			expect(engine.invaders).toHaveLength(0);
			expect(engine.status).toBe("playing");
		});

		it("ライフが0になった場合、ステータスがgameoverになること", () => {
			const engine = InvaderGameEngine.create(EntityId.create("engine-1"), 600);

			// 3体の敵を最下部に到達させる
			for (let i = 0; i < 3; i++) {
				const invader = createTestInvader(`inv-${i}`, "林檎", "ringo", 595);
				engine.spawn(invader);
			}

			engine.tick(1000);

			expect(engine.lives).toBe(0);
			expect(engine.status).toBe("gameover");
		});
	});
});
