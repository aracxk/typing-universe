import { Entity } from "../../../shared/domain/Entity";
import type { EntityId } from "../../../shared/domain/EntityId";
import type { TargetWord } from "./TargetWord";

/**
 * プレイヤーが現在入力中の単語を管理するEntity
 */
export class ActiveWord extends Entity<EntityId> {
	private _currentIndex = 0;

	private constructor(
		id: EntityId,
		public readonly target: TargetWord,
	) {
		super(id);
	}

	public static create(id: EntityId, target: TargetWord): ActiveWord {
		return new ActiveWord(id, target);
	}

	/**
	 * キー入力が正しい文字か判定し、正しければ内部状態を進める
	 * @param inputChar 入力された1文字
	 * @returns 正しくマッチしたか
	 */
	public type(inputChar: string): boolean {
		if (this.isCompleted()) {
			return false;
		}

		const expectedChar = this.target.reading[this._currentIndex];
		// TODO: ローマ字の揺らぎ吸収（shi/siなど）は後日ストラテジー等で拡張する。
		if (inputChar.toLowerCase() === expectedChar.toLowerCase()) {
			this._currentIndex++;
			return true;
		}
		return false;
	}

	/**
	 * 入力がすべて完了しているかを返す
	 */
	public isCompleted(): boolean {
		return this._currentIndex >= this.target.reading.length;
	}

	/**
	 * 現在どこまで入力したかのインデックス
	 */
	public get currentIndex(): number {
		return this._currentIndex;
	}
}
