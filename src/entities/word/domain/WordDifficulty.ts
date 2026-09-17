import { Result } from "../../../shared/core/Result";
import { ValueObject } from "../../../shared/domain/ValueObject";

export type WordDifficultyType = "easy" | "normal" | "hard";

export const VALID_WORD_DIFFICULTIES: readonly WordDifficultyType[] = [
	"easy",
	"normal",
	"hard",
] as const;

/**
 * 単語の難易度（easy, normal, hard）を表す値オブジェクト。
 *
 * 文字数や単語構造に基づき、ゲーム進行・ステージ難易度と連動します。
 */
export class WordDifficulty extends ValueObject {
	private static readonly _cache = new Map<
		WordDifficultyType,
		WordDifficulty
	>();

	private constructor(public readonly value: WordDifficultyType) {
		super();
	}

	/**
	 * 文字列から WordDifficulty を生成します。
	 * Flyweightパターンにより、同じ難易度のインスタンスはキャッシュから再利用されます。
	 *
	 * @param value 難易度名文字列
	 * @returns 成功時は WordDifficulty、失敗時は Error を含む Result
	 */
	public static create(value: string): Result<WordDifficulty, Error> {
		if (!VALID_WORD_DIFFICULTIES.includes(value as WordDifficultyType)) {
			return Result.err(new Error(`不正な難易度です: ${value}`));
		}

		const typedValue = value as WordDifficultyType;
		let instance = WordDifficulty._cache.get(typedValue);
		if (!instance) {
			instance = new WordDifficulty(typedValue);
			WordDifficulty._cache.set(typedValue, instance);
		}

		return Result.ok(instance);
	}

	/**
	 * 他の WordDifficulty との値の一致を判定します。
	 *
	 * @param other 比較対象の WordDifficulty
	 * @returns 難易度文字列が一致する場合 true
	 */
	public equals(other: this): boolean {
		if (other === null || other === undefined) {
			return false;
		}
		return this.value === other.value;
	}
}
