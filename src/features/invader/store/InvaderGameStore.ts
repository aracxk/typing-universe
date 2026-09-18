import { Invader } from "../../../entities/invader/domain/Invader";
import { InvaderGameEngine } from "../../../entities/invader/domain/InvaderGameEngine";
import { ActiveWord } from "../../../entities/word/domain/ActiveWord";
import type { TargetWord } from "../../../entities/word/domain/TargetWord";
import type { WordDifficultyType } from "../../../entities/word/domain/WordDifficulty";
import {
	type IWordRepository,
	wordRepository,
} from "../../../entities/word/repository/WordRepository";
import { EntityId } from "../../../shared/domain/EntityId";
import {
	sendGameOverEvent,
	sendGameStartEvent,
} from "../../../shared/lib/analytics/events";
import { SoundEngine } from "../../../shared/lib/audio/SoundEngine";

/**
 * インベーダーゲームのUI状態とゲームループ（requestAnimationFrame）を仲介する状態管理ストア。
 *
 * React の再描画（useSyncExternalStore）を最小限に抑えつつ、
 * 60FPSのゲームループ、効果音トリガー、非同期単語ロード、キーボード入力を統括します。
 */
export class InvaderGameStore {
	public engine: InvaderGameEngine;
	public sound: SoundEngine;
	private wordRepository: IWordRepository;

	private listeners: Set<() => void> = new Set();
	private lastTime = performance.now();
	public rafId: number | null = null;
	private invaderIdCounter = 0;
	private nextSpawnTime = 0;

	public tickCount = 0;
	public hasStarted = false;
	public isReady = false;
	private lastReady = false;
	private lastScore = 0;
	private lastLives = 3;
	private lastStatus = "playing";
	private lastCombo = 0;
	private lastStage = 1;
	private lastFocusedId: string | null = null;
	private lastKills = 0;

	constructor(wordRepositoryInstance: IWordRepository = wordRepository) {
		this.engine = InvaderGameEngine.create(EntityId.create("engine"), 600);
		this.sound = new SoundEngine();
		this.wordRepository = wordRepositoryInstance;
	}

	public subscribe = (listener: () => void) => {
		this.listeners.add(listener);
		return () => {
			this.listeners.delete(listener);
		};
	};

	/**
	 * 単語データ（JSON）を非同期プリロードし、ゲームの出撃準備を整えます。
	 */
	public async initialize() {
		if (this.isReady) return;
		// インベーダーゲームで使用するデフォルトのカテゴリをロード
		await this.wordRepository.loadCategories([
			"it_errors",
			"programming",
			"web_tech",
		]);
		this.isReady = true;
		this.notifyIfChanged();
	}

	public getSnapshot = () => {
		return this.tickCount;
	};

	private notifyIfChanged() {
		let changed = false;

		if (this.engine.kills > this.lastKills) {
			this.sound.playExplode();
			this.lastKills = this.engine.kills;
		}

		if (this.engine.combo === 0 && this.lastCombo > 0) {
			this.sound.playMiss();
		} else if (this.engine.combo > this.lastCombo) {
			this.sound.playLaser();
		}

		if (this.engine.lives < this.lastLives) {
			this.sound.playDamage();
		}

		if (
			this.engine.score !== this.lastScore ||
			this.engine.lives !== this.lastLives ||
			this.engine.status !== this.lastStatus ||
			this.engine.combo !== this.lastCombo ||
			this.engine.stageLevel !== this.lastStage ||
			this.engine.focusedInvaderId?.value !== this.lastFocusedId ||
			this.isReady !== this.lastReady
		) {
			if (this.engine.status === "gameover" && this.lastStatus === "playing") {
				sendGameOverEvent(
					"bug_invaders",
					this.engine.score,
					this.engine.stageLevel,
				);
			}

			this.lastScore = this.engine.score;
			this.lastLives = this.engine.lives;
			this.lastStatus = this.engine.status;
			this.lastCombo = this.engine.combo;
			this.lastStage = this.engine.stageLevel;
			this.lastFocusedId = this.engine.focusedInvaderId?.value || null;
			this.lastReady = this.isReady;
			changed = true;
		}

		if (changed) {
			this.tickCount++;
			for (const listener of this.listeners) {
				listener();
			}
		}
	}

	/**
	 * ゲームエンジンを新規生成してゲームループ（60FPS）を開始します。
	 */
	public start() {
		this.sound.init();
		this.engine = InvaderGameEngine.create(EntityId.create("engine"), 600);
		sendGameStartEvent("bug_invaders");
		this.lastScore = 0;
		this.lastLives = 3;
		this.lastStatus = "playing";
		this.lastCombo = 0;
		this.lastStage = 1;
		this.lastKills = 0;
		this.hasStarted = true;
		this.lastFocusedId = null;
		this.invaderIdCounter = 0;
		this.tickCount++;

		this.lastTime = performance.now();
		this.nextSpawnTime = performance.now() + 200;

		const loop = (time: number) => {
			if (this.engine.status === "gameover") return;

			const deltaTime = time - this.lastTime;
			this.lastTime = time;

			if (time > this.nextSpawnTime) {
				this.spawnRandomInvader();
				const interval = Math.max(800, 2000 - this.engine.stageLevel * 150);
				this.nextSpawnTime = time + interval;
			}

			this.engine.tick(deltaTime * (1 + this.engine.stageLevel * 0.1));
			this.notifyIfChanged();
			this.rafId = requestAnimationFrame(loop);
		};
		this.rafId = requestAnimationFrame(loop);
	}

	/**
	 * ゲームループを停止し、アニメーションフレームをキャンセルします。
	 */
	public stop() {
		if (this.rafId) {
			cancelAnimationFrame(this.rafId);
			this.rafId = null;
		}
	}

	/**
	 * ユーザーのキーボード入力を処理し、ドメインエンジンのタイピング判定を実行します。
	 *
	 * @param key 入力されたキー文字列（英数字・ハイフンを小文字化して処理）
	 */
	public handleType(key: string) {
		if (this.engine.status === "gameover") return;
		if (/^[a-z0-9-]$/i.test(key)) {
			this.engine.type(key.toLowerCase());
			this.notifyIfChanged();
		}
	}

	private getDifficultyForStage(stage: number): WordDifficultyType {
		if (stage <= 1) return "easy";
		if (stage === 2) return Math.random() < 0.6 ? "easy" : "normal";
		if (stage === 3) return Math.random() < 0.7 ? "normal" : "hard";
		return Math.random() < 0.4 ? "normal" : "hard";
	}

	private spawnRandomInvader() {
		const difficulty = this.getDifficultyForStage(this.engine.stageLevel);
		const targetResult = this.wordRepository.getRandomTargetWord({
			difficulty,
		});

		if (!targetResult.success) {
			const fallback = this.wordRepository.getRandomTargetWord();
			if (!fallback.success) return;
			this.createAndSpawnInvader(fallback.value);
			return;
		}

		this.createAndSpawnInvader(targetResult.value);
	}

	private createAndSpawnInvader(target: TargetWord) {
		this.invaderIdCounter++;
		const active = ActiveWord.create(
			EntityId.create(`word-${this.invaderIdCounter}`),
			target,
		);

		const x = Math.random() * 600 + 100;
		const speed = Math.random() * 20 + 25;

		const invResult = Invader.create(
			EntityId.create(`inv-${this.invaderIdCounter}`),
			active,
			x,
			40,
			speed,
		);
		if (invResult.success) {
			this.engine.spawn(invResult.value);
		}
	}
}
