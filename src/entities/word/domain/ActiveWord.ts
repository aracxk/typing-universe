import { Entity } from "../../../shared/domain/Entity";
import type { EntityId } from "../../../shared/domain/EntityId";
import type { TargetWord } from "./TargetWord";

/**
 * 現在タイピング進行中の単語（エンティティ）。
 *
 * 入力された打鍵文字列の状態を追跡し、TargetWord の複数の読み仮名プレフィックスとの適合判定を行います。
 */
export class ActiveWord extends Entity<EntityId> {
	private _typedString = "";

	private constructor(
		id: EntityId,
		public readonly target: TargetWord,
	) {
		super(id);
	}

	/**
	 * ActiveWord のインスタンスを生成します。
	 *
	 * @param id 単語セッションを一意に識別する EntityId
	 * @param target 出題対象となる TargetWord
	 * @returns 生成された ActiveWord
	 */
	public static create(id: EntityId, target: TargetWord): ActiveWord {
		return new ActiveWord(id, target);
	}

	/**
	 * 1文字のキー入力を受け取り、適合するか判定して状態を進めます。
	 * 入力文字は大文字・小文字を区別せず判定されます。
	 *
	 * @param inputChar 入力された1文字（例: "r", "4"）
	 * @returns 入力が有効な読みのプレフィックスに一致した場合は true、不一致または既に入力完了済みの場合は false
	 */
	public type(inputChar: string): boolean {
		if (this.isCompleted()) {
			return false;
		}

		const nextString = this._typedString + inputChar.toLowerCase();

		// 次の入力文字列がいずれかの読みのプレフィックスに一致するか判定
		const isValid = this.target.readings.some((reading) =>
			reading.toLowerCase().startsWith(nextString),
		);

		if (isValid) {
			this._typedString = nextString;
			return true;
		}
		return false;
	}

	/**
	 * 単語全体の入力が完了しているかを判定します。
	 * いずれかの読み仮名と打鍵文字列が完全一致した場合に true になります。
	 *
	 * @returns 入力完了済みであれば true
	 */
	public isCompleted(): boolean {
		return this.target.readings.some(
			(reading) => reading.toLowerCase() === this._typedString,
		);
	}

	/**
	 * 現在入力成功している文字数（0以上の整数）を取得します。
	 */
	public get currentIndex(): number {
		return this._typedString.length;
	}
}
