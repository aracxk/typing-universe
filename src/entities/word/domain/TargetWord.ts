import { Result } from "../../../shared/core/Result";
import { ValueObject } from "../../../shared/domain/ValueObject";
import { TargetWordError } from "./TargetWordError";

/**
 * タイピング出題対象となる不変の単語（値オブジェクト）。
 *
 * 表示用の単語文字列と、1つ以上のローマ字入力用読み仮名（プレフィックス判定用）を保持します。
 */
export class TargetWord extends ValueObject {
	private constructor(
		public readonly word: string,
		public readonly readings: readonly string[],
	) {
		super();
	}

	/**
	 * TargetWord のインスタンスを生成します。
	 *
	 * @param word 画面に表示する単語表記（例: "林檎", "404 NotFound"）
	 * @param readings タイピング入力用の読み仮名配列。1件以上の非空文字列が必要（例: ["ringo"]）
	 * @returns 生成成功時は TargetWord、readings が空または空文字を含む場合は TargetWordError
	 */
	public static create(
		word: string,
		readings: string[],
	): Result<TargetWord, TargetWordError> {
		if (readings.length === 0) {
			return Result.err(
				new TargetWordError("読み (readings) が空の単語は作成できません。"),
			);
		}
		if (readings.some((r) => r.length === 0)) {
			return Result.err(
				new TargetWordError("空の読みを含むことはできません。"),
			);
		}
		return Result.ok(new TargetWord(word, [...readings]));
	}

	/**
	 * 他の TargetWord と値の完全一致（単語および読み仮名リスト）を検証します。
	 *
	 * @param other 比較対象の TargetWord
	 * @returns 表記と読みが完全に一致する場合 true
	 */
	public equals(other: this): boolean {
		if (other === null || other === undefined) {
			return false;
		}
		if (
			this.word !== other.word ||
			this.readings.length !== other.readings.length
		) {
			return false;
		}
		return this.readings.every((r, i) => r === other.readings[i]);
	}
}
