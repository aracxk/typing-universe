import { Result } from "../../../shared/core/Result";
import { Entity } from "../../../shared/domain/Entity";
import type { EntityId } from "../../../shared/domain/EntityId";
import type { ActiveWord } from "../../word/domain/ActiveWord";
import { InvaderError } from "./InvaderError";

/**
 * インベーダー（画面上部から迫りくる敵）を表すエンティティ。
 *
 * プレイヤーが入力すべき単語（ActiveWord）と、2Dキャンバス上の位置（px）・落下速度（px/sec）を保持します。
 */
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

	/**
	 * インベーダーのインスタンスを生成するファクトリメソッド。
	 *
	 * @param id インベーダーの一意な識別子
	 * @param activeWord 紐付けるタイピング対象の単語
	 * @param x 初期X座標 (0以上のpx)
	 * @param y 初期Y座標 (0以上のpx。負数はエラー)
	 * @param speed 落下速度 (px/sec。0より大きい正数)
	 * @returns 成功時は Invader、不正な座標や速度の場合は InvaderError
	 */
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
	 * 経過時間に応じてインベーダーのY座標を下方向へ更新します。
	 *
	 * @param deltaTimeMs 前回フレームからの経過時間（ミリ秒）
	 */
	public tick(deltaTimeMs: number): void {
		const seconds = deltaTimeMs / 1000;
		this._y += this._speed * seconds;
	}

	/**
	 * インベーダーが撃破されたか（紐付く ActiveWord のタイピングが完了したか）を判定します。
	 *
	 * @returns 単語の入力が完了していれば true
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
