import { Entity } from "../../../shared/domain/Entity";
import type { EntityId } from "../../../shared/domain/EntityId";
import type { Invader } from "./Invader";

export type GameStatus = "playing" | "gameover";

export class InvaderGameEngine extends Entity<EntityId> {
	private _invaders: Invader[] = [];
	private _score = 0;
	private _status: GameStatus = "playing";
	private _focusedInvaderId: EntityId | null = null;
	private _gameHeight: number;

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

		for (const invader of this._invaders) {
			invader.tick(deltaTimeMs);

			if (invader.y >= this._gameHeight) {
				this._status = "gameover";
				return;
			}
		}
	}

	public type(char: string): boolean {
		if (this._status !== "playing") return false;

		if (this._focusedInvaderId) {
			const currentFocusedId = this._focusedInvaderId;
			const focused = this._invaders.find((inv) =>
				inv.id.equals(currentFocusedId),
			);
			if (focused) {
				const matched = focused.activeWord.type(char);
				if (matched && focused.isDead()) {
					this.handleKill(focused);
				}
				return matched;
			}
		}

		const candidates = this._invaders
			.filter((inv) => !inv.isDead())
			.sort((a, b) => b.y - a.y);

		for (const invader of candidates) {
			const matched = invader.activeWord.type(char);
			if (matched) {
				if (invader.isDead()) {
					this.handleKill(invader);
				} else {
					this._focusedInvaderId = invader.id;
				}
				return true;
			}
		}

		return false;
	}

	private handleKill(invader: Invader): void {
		this._score += 100;
		this._focusedInvaderId = null;
		this._invaders = this._invaders.filter((inv) => !inv.id.equals(invader.id));
	}

	get invaders(): readonly Invader[] {
		return this._invaders;
	}

	get score(): number {
		return this._score;
	}

	get status(): GameStatus {
		return this._status;
	}

	get focusedInvaderId(): EntityId | null {
		return this._focusedInvaderId;
	}
}
