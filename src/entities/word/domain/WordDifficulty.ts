import { Result } from "../../../shared/core/Result";
import { ValueObject } from "../../../shared/domain/ValueObject";

export type WordDifficultyType = "easy" | "normal" | "hard";

export const VALID_WORD_DIFFICULTIES: readonly WordDifficultyType[] = [
	"easy",
	"normal",
	"hard",
] as const;

export class WordDifficulty extends ValueObject {
	private constructor(public readonly value: WordDifficultyType) {
		super();
	}

	public static create(value: string): Result<WordDifficulty, Error> {
		if (!VALID_WORD_DIFFICULTIES.includes(value as WordDifficultyType)) {
			return Result.err(new Error(`不正な難易度です: ${value}`));
		}
		return Result.ok(new WordDifficulty(value as WordDifficultyType));
	}

	public equals(other: this): boolean {
		if (other === null || other === undefined) {
			return false;
		}
		return this.value === other.value;
	}
}
