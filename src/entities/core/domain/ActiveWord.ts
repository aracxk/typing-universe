import type { TargetWord } from "./TargetWord";

/**
 * プレイヤーが現在入力中の単語を管理するEntity
 */
export class ActiveWord {
	private _currentIndex = 0;

	constructor(public readonly target: TargetWord) {}

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
		// 初回は完全一致（大文字小文字は無視）のみサポート。
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
