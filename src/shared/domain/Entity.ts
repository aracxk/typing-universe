import type { ValueObject } from "./ValueObject";

/**
 * すべてのエンティティ（Entity / 集約ルート）の共通基底クラス
 *
 * 責務:
 * - 「必ず一意なID（識別子）を持つこと」を型レベルで義務付ける。
 * - エンティティの同一性を「IDの一致（this._id.equals(other._id)）」によって保証する。
 * - ライフサイクル（状態変化）を持つオブジェクトの目印となる。
 */
export abstract class Entity<ID extends ValueObject> {
	constructor(protected readonly _id: ID) {}

	/**
	 * 一意な識別子（ID）を取得する
	 */
	public get id(): ID {
		return this._id;
	}

	/**
	 * 2つのエンティティが「同じ個体（同じID）」であるかを判定する
	 * ※ 属性（タイトルや価格）が変わっても、IDが同一であれば同じエンティティとして扱う
	 */
	public equals(other?: Entity<ID>): boolean {
		if (other === null || other === undefined) {
			return false;
		}
		if (this === other) {
			return true;
		}
		return this._id.equals(other._id);
	}
}
