import { describe, expect, it } from "vitest";
import { Invader } from "../../../../src/entities/invader/domain/Invader";
import { InvaderGameEngine } from "../../../../src/entities/invader/domain/InvaderGameEngine";
import { ActiveWord } from "../../../../src/entities/word/domain/ActiveWord";
import { TargetWord } from "../../../../src/entities/word/domain/TargetWord";
import { EntityId } from "../../../../src/shared/domain/EntityId";

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

describe("InvaderGameEngine", () => {
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
			expect(engine.focusedInvaderId).toBeNull();
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
			expect(engine.focusedInvaderId?.value).toBe("inv-1");
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

	describe("エッジケースとランク計算のカバレッジ", () => {
		it("どの敵にもマッチしない入力をした場合、ミスとして処理されfalseを返す", () => {
			const engine = InvaderGameEngine.create(EntityId.create("engine-1"), 600);
			engine.spawn(createTestInvader("inv-1", "桃", "momo"));
			const matched = engine.type("z");
			expect(matched).toBe(false);
			expect(engine.combo).toBe(0);
			expect(engine.focusedInvaderId).toBeNull();
		});

		it("スコアに応じたランクを返すこと", () => {
			const engine = InvaderGameEngine.create(EntityId.create("engine-1"), 600);
			expect(engine.rank).toBe("C (JUNIOR DEV)");

			const setScoreAndAcc = (s: number, acc: number) => {
				// biome-ignore lint/suspicious/noExplicitAny: テスト目的でのプライベート変数アクセス
				(engine as any)._metrics._score = s;
				// biome-ignore lint/suspicious/noExplicitAny: テスト目的でのプライベート変数アクセス
				(engine as any)._metrics._totalTyped = 100;
				// biome-ignore lint/suspicious/noExplicitAny: テスト目的でのプライベート変数アクセス
				(engine as any)._metrics._correctTyped = acc;
			};

			setScoreAndAcc(3000, 100);
			expect(engine.rank).toBe("B (MID-LEVEL)");

			setScoreAndAcc(6000, 100);
			expect(engine.rank).toBe("A (SENIOR DEV)");

			setScoreAndAcc(10000, 100);
			expect(engine.rank).toBe("S (TECH LEAD)");

			setScoreAndAcc(15000, 94);
			expect(engine.rank).toBe("S (TECH LEAD)");

			setScoreAndAcc(15000, 95);
			expect(engine.rank).toBe("S+ (GOD ENGINEER)");
		});
	});
});

describe("残りのカバレッジ", () => {
	it("フォーカス中の敵が防衛ラインに到達した場合、フォーカスとコンボがリセットされる", () => {
		const engine = InvaderGameEngine.create(EntityId.create("engine-1"), 600);
		engine.spawn(createTestInvader("inv-1", "林檎", "ringo", 595));

		// フォーカスをセット (1文字打つ)
		engine.type("r");
		expect(engine.combo).toBe(1);
		expect(engine.focusedInvaderId?.value).toBe("inv-1");

		// 防衛ラインを越えさせる
		engine.tick(1000);
		expect(engine.focusedInvaderId).toBeNull();
		expect(engine.combo).toBe(0);
	});

	it("ターゲット未定の場合、最も下の敵（yが大きい）が優先してフォーカスされる", () => {
		const engine = InvaderGameEngine.create(EntityId.create("engine-1"), 600);
		// 上の敵
		engine.spawn(createTestInvader("inv-top", "林檎", "ringo", 100));
		// 下の敵
		engine.spawn(createTestInvader("inv-bottom", "理解", "rikai", 500));

		// 両方に共通の先頭文字 'r' を打つ
		engine.type("r");
		// 下の敵が優先してフォーカスされるべき
		expect(engine.focusedInvaderId?.value).toBe("inv-bottom");
	});
});

describe("ゲームオーバー時の動作", () => {
	it("ゲームオーバー状態ではspawn, tick, typeが無視されること", () => {
		const engine = InvaderGameEngine.create(EntityId.create("engine-1"), 600);
		// ライフを0にしてgameoverにする
		engine.spawn(createTestInvader("inv-1", "林檎", "ringo", 595));
		engine.spawn(createTestInvader("inv-2", "蜜柑", "mikan", 595));
		engine.spawn(createTestInvader("inv-3", "西瓜", "suika", 595));
		engine.tick(1000);
		expect(engine.status).toBe("gameover");

		// spawnが無効
		engine.spawn(createTestInvader("inv-4", "葡萄", "budou", 0));
		expect(engine.invaders).toHaveLength(0);

		// tickが無効 (エラーにならない)
		engine.tick(1000);

		// typeが無効
		const matched = engine.type("r");
		expect(matched).toBe(false);
	});

	it("フォーカス中の敵IDが配列に存在しない場合、スキップして新たな敵を探す", () => {
		const engine = InvaderGameEngine.create(EntityId.create("eng-1"), 500);
		engine.spawn(createTestInvader("inv-1", "桃", "momo", 20));

		(engine as unknown as { _focusedInvaderId: EntityId })._focusedInvaderId =
			EntityId.create("non-existent");

		const matched = engine.type("m");
		expect(matched).toBe(true);
		expect(engine.focusedInvaderId?.value).toBe("inv-1");
	});
});

describe("ブランチカバレッジの網羅", () => {
	it("tick時に防衛ラインに到達しない分岐", () => {
		const engine = InvaderGameEngine.create(EntityId.create("engine-1"), 600);
		engine.spawn(createTestInvader("inv-1", "林檎", "ringo", 0));
		engine.tick(10); // yが10増えるだけ
		expect(engine.invaders).toHaveLength(1);
	});

	it("maxComboを超えないコンボ増加の分岐", () => {
		const engine = InvaderGameEngine.create(EntityId.create("engine-1"), 600);
		engine.spawn(createTestInvader("inv-1", "林檎", "ringo", 0));
		// 2回成功 (combo=2, maxCombo=2)
		engine.type("r");
		engine.type("i");
		expect(engine.combo).toBe(2);
		expect(engine.maxCombo).toBe(2);

		// 1回失敗 (combo=0, maxCombo=2)
		engine.type("x");
		expect(engine.combo).toBe(0);

		// 1回成功 (combo=1, maxCombo=2) -> これでelse分岐に入る
		engine.type("n");
		expect(engine.combo).toBe(1);
		expect(engine.maxCombo).toBe(2); // 超えない
	});
});
