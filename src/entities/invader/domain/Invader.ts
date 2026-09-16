import { Result } from "../../../shared/core/Result";
import { Entity } from "../../../shared/domain/Entity";
import type { EntityId } from "../../../shared/domain/EntityId";
import type { ActiveWord } from "../../word/domain/ActiveWord";
import { InvaderError } from "./InvaderError";

export class Invader extends Entity<EntityId> {
	private _x: number;
	private _y: number;
	private _speed: number; // Y軸方向のピクセル毎秒（px/sec）

	private constructor(
		id: EntityId,
		public readonly activeWord: ActiveWord,
		x: number,
		y: number,
		speed: number,
	) {
		super(id);
		this._x = x;
		this._y = y;
		this._speed = speed;
	}

	public static create(
		id: EntityId,
		activeWord: ActiveWord,
		x: number,
		y: number,
		speed: number,
	): Result<Invader, InvaderError> {
		if (x < 0 || y < 0) {
			return Result.err(
				new InvaderError(
					"INVALID_INVADER_COORDINATE",
					"座標は0以上である必要があります。",
				),
			);
		}
		if (speed <= 0) {
			return Result.err(
				new InvaderError(
					"INVALID_INVADER_SPEED",
					"速度は0より大きい必要があります。",
				),
			);
		}
		return Result.ok(new Invader(id, activeWord, x, y, speed));
	}

	/**
	 * 時間経過（deltaTime: ms）に合わせてY座標を更新する
	 */
	public tick(deltaTimeMs: number): void {
		const seconds = deltaTimeMs / 1000;
		this._y += this._speed * seconds;
	}

	/**
	 * インベーダーが撃破されたか（入力完了したか）
	 */
	public isDead(): boolean {
		return this.activeWord.isCompleted();
	}

	get x(): number {
		return this._x;
	}

	get y(): number {
		return this._y;
	}

	get speed(): number {
		return this._speed;
	}
}
