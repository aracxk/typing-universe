import { Entity } from "../../../shared/domain/Entity";
import type { EntityId } from "../../../shared/domain/EntityId";
import type { Invader } from "./Invader";

export type GameStatus = "playing" | "gameover";

export class InvaderGameEngine extends Entity<EntityId> {
	private _invaders: Invader[] = [];
	private _score = 0;
	private _lives = 3;
	private _status: GameStatus = "playing";
	private _focusedInvaderId: EntityId | null = null;
	private _gameHeight: number;

	// 新規追加: コンボと精度管理
	private _combo = 0;
	private _maxCombo = 0;
	private _totalTyped = 0;
	private _correctTyped = 0;
	private _kills = 0;
	private _stageLevel = 1;

	private constructor(id: EntityId, gameHeight: number) {
		super(id);
		this._gameHeight = gameHeight;
	}

	public static create(id: EntityId, gameHeight: number): InvaderGameEngine {
		return new InvaderGameEngine(id, gameHeight);
	}

	public spawn(invader: Invader): void {
		if (this._status !== "playing") return;
		this._invaders.push(invader);
	}

	public tick(deltaTimeMs: number): void {
		if (this._status !== "playing") return;

		for (let i = this._invaders.length - 1; i >= 0; i--) {
			const invader = this._invaders[i];
			invader.tick(deltaTimeMs);

			if (invader.y >= this._gameHeight) {
				this._lives -= 1;

				if (this._focusedInvaderId?.equals(invader.id)) {
					this._focusedInvaderId = null;
					this._combo = 0; // 防衛失敗でロックオン解除される場合、コンボも切れる
				}
				this._invaders.splice(i, 1);

				if (this._lives <= 0) {
					this._status = "gameover";
					return;
				}
			}
		}
	}

	public type(char: string): boolean {
		if (this._status !== "playing") return false;

		this._totalTyped++; // 打鍵総数の加算

		if (this._focusedInvaderId) {
			const currentFocusedId = this._focusedInvaderId;
			const focused = this._invaders.find((inv) =>
				inv.id.equals(currentFocusedId),
			);
			if (focused) {
				const matched = focused.activeWord.type(char);
				if (matched) {
					this.handleHit();
					if (focused.isDead()) {
						this.handleKill(focused);
					}
					return true;
				} else {
					this.handleMiss();
					return false;
				}
			}
		}

		// ターゲット未定の場合、最も下の敵から探索
		const candidates = this._invaders
			.filter((inv) => !inv.isDead())
			.sort((a, b) => b.y - a.y);

		for (const invader of candidates) {
			const matched = invader.activeWord.type(char);
			if (matched) {
				this._focusedInvaderId = invader.id;
				this.handleHit();
				if (invader.isDead()) {
					this.handleKill(invader);
				}
				return true;
			}
		}

		this.handleMiss();
		return false;
	}

	private handleHit(): void {
		this._correctTyped++;
		this._combo++;
		if (this._combo > this._maxCombo) {
			this._maxCombo = this._combo;
		}
	}

	private handleMiss(): void {
		this._combo = 0; // ミスでコンボリセット
	}

	private handleKill(invader: Invader): void {
		this._kills++;
		this._focusedInvaderId = null;

		// スコア計算：文字数 × (1 + (コンボ数/5) * 0.2)
		const baseScore = invader.activeWord.target.word.length * 100;
		const multiplier = 1 + Math.floor(this._combo / 5) * 0.2;
		this._score += Math.round(baseScore * multiplier);

		// レベルアップ判定 (6キルごと)
		if (this._kills % 6 === 0) {
			this._stageLevel++;
		}

		this._invaders = this._invaders.filter((inv) => !inv.id.equals(invader.id));
	}

	get invaders(): readonly Invader[] {
		return this._invaders;
	}

	get score(): number {
		return this._score;
	}

	get lives(): number {
		return this._lives;
	}

	get status(): GameStatus {
		return this._status;
	}

	get focusedInvaderId(): EntityId | null {
		return this._focusedInvaderId;
	}

	get combo(): number {
		return this._combo;
	}

	get maxCombo(): number {
		return this._maxCombo;
	}

	get totalTyped(): number {
		return this._totalTyped;
	}

	get correctTyped(): number {
		return this._correctTyped;
	}

	get kills(): number {
		return this._kills;
	}

	get stageLevel(): number {
		return this._stageLevel;
	}

	get accuracy(): number {
		if (this._totalTyped === 0) return 100;
		return Math.round((this._correctTyped / this._totalTyped) * 100);
	}

	get rank(): string {
		if (this._score >= 15000 && this.accuracy >= 95) return "S+ (GOD ENGINEER)";
		if (this._score >= 10000) return "S (TECH LEAD)";
		if (this._score >= 6000) return "A (SENIOR DEV)";
		if (this._score >= 3000) return "B (MID-LEVEL)";
		return "C (JUNIOR DEV)";
	}
}
