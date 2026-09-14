import { Result } from "../../../shared/core/Result";
import { ValueObject } from "../../../shared/domain/ValueObject";
import { TargetWordError } from "./TargetWordError";

/**
 * 出題される単語を表すValue Object
 */
export class TargetWord extends ValueObject {
	private constructor(
		public readonly word: string,
		public readonly reading: string,
	) {
		super();
	}

	/**
	 * TargetWordを生成するファクトリメソッド
	 */
	public static create(
		word: string,
		reading: string,
	): Result<TargetWord, TargetWordError> {
		if (reading.length === 0) {
			return Result.err(
				new TargetWordError("読み (reading) が空の単語は作成できません。"),
			);
		}
		return Result.ok(new TargetWord(word, reading));
	}

	public equals(other: this): boolean {
		if (other === null || other === undefined) {
			return false;
		}
		return this.word === other.word && this.reading === other.reading;
	}
}
