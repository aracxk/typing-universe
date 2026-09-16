import { Result } from "../../../shared/core/Result";
import { ValueObject } from "../../../shared/domain/ValueObject";
import { TargetWordError } from "./TargetWordError";

export class TargetWord extends ValueObject {
	private constructor(
		public readonly word: string,
		public readonly readings: readonly string[],
	) {
		super();
	}

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
