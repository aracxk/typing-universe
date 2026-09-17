import { Entity } from "../../../shared/domain/Entity";
import type { EntityId } from "../../../shared/domain/EntityId";
import { TypingMetrics } from "../../core/domain/TypingMetrics";
import type { Invader } from "./Invader";

/**
 * ゲームの進行状態（プレイ中かゲームオーバーか）。
 */
export type GameStatus = "playing" | "gameover";

/**
 * インベーダーゲームのコアルールと進行状態を管理するドメインエンジン（エンティティ）。
 *
 * 敵のスポーン・落下（Tick）、タイピング判定（ターゲットロックオンと撃破）、
 * ライフ減少、ゲームオーバー判定を一元管理します。
 * スコアやコンボなどのタイピング評価は TypingMetrics に委譲します。
 */
export class InvaderGameEngine extends Entity<EntityId> {
	private _invaders: Invader[] = [];
	private _lives = 3;
	private _status: GameStatus = "playing";
	private _focusedInvaderId: EntityId | null = null;
	private _gameHeight: number;

	// コアのタイピング評価基盤をコンポジション
	private readonly _metrics = new TypingMetrics();
	private _stageLevel = 1;

	private constructor(id: EntityId, gameHeight: number) {
		super(id);
		this._gameHeight = gameHeight;
	}

	/**
	 * インベーダーゲームエンジンのインスタンスを生成します。
	 *
	 * @param id エンジンの一意な識別子
	 * @param gameHeight キャンバスの底辺Y座標（防衛失敗判定となる高さpx）
	 * @returns 生成された InvaderGameEngine
	 */
	public static create(id: EntityId, gameHeight: number): InvaderGameEngine {
		return new InvaderGameEngine(id, gameHeight);
	}

	/**
	 * 敵インベーダーを画面上に出現させます。ゲームオーバー時は無視されます。
	 *
	 * @param invader 追加する Invader インスタンス
	 */
	public spawn(invader: Invader): void {
		if (this._status !== "playing") return;
		this._invaders.push(invader);
	}

	/**
	 * 時間経過に合わせて全ての敵を前進させ、底辺到達時の被弾・ゲームオーバー判定を行います。
	 *
	 * @param deltaTimeMs 前回フレームからの経過時間（ミリ秒）
	 */
	public tick(deltaTimeMs: number): void {
		if (this._status !== "playing") return;

		for (let i = this._invaders.length - 1; i >= 0; i--) {
			const invader = this._invaders[i];
			invader.tick(deltaTimeMs);

			if (invader.y >= this._gameHeight) {
				this._lives -= 1;

				if (this._focusedInvaderId?.equals(invader.id)) {
					this._focusedInvaderId = null;
					this._metrics.resetCombo(); // 防衛失敗でロックオン解除される場合、コンボも切れる
				}
				this._invaders.splice(i, 1);

				if (this._lives <= 0) {
					this._status = "gameover";
					return;
				}
			}
		}
	}

	/**
	 * プレイヤーのキーボード打鍵を処理し、ロックオン中または最も手前の敵に対して正誤判定を行います。
	 *
	 * @param char 入力された1文字
	 * @returns いずれかの敵に適合した場合は true、ミスの場合は false（コンボリセット）
	 */
	public type(char: string): boolean {
		if (this._status !== "playing") return false;

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
		this._metrics.recordHit();
	}

	private handleMiss(): void {
		this._metrics.recordMiss();
	}

	private handleKill(invader: Invader): void {
		this._focusedInvaderId = null;

		const baseScore = invader.activeWord.target.word.length * 100;
		this._metrics.recordKill(baseScore);

		// レベルアップ判定 (6キルごと)
		if (this._metrics.kills > 0 && this._metrics.kills % 6 === 0) {
			this._stageLevel++;
		}

		this._invaders = this._invaders.filter((inv) => !inv.id.equals(invader.id));
	}

	get invaders(): readonly Invader[] {
		return this._invaders;
	}

	get score(): number {
		return this._metrics.score;
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
		return this._metrics.combo;
	}

	get maxCombo(): number {
		return this._metrics.maxCombo;
	}

	get totalTyped(): number {
		return this._metrics.totalTyped;
	}

	get correctTyped(): number {
		return this._metrics.correctTyped;
	}

	get kills(): number {
		return this._metrics.kills;
	}

	get stageLevel(): number {
		return this._stageLevel;
	}

	get accuracy(): number {
		return this._metrics.accuracy;
	}

	get rank(): string {
		return this._metrics.rank;
	}
}
