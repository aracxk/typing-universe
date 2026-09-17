import { Result } from "../../../shared/core/Result";
import { ValueObject } from "../../../shared/domain/ValueObject";

export type WordCategoryType =
	| "it_errors"
	| "programming"
	| "web_tech"
	| "general_fruits";

export const VALID_WORD_CATEGORIES: readonly WordCategoryType[] = [
	"it_errors",
	"programming",
	"web_tech",
	"general_fruits",
] as const;

/**
 * 単語のカテゴリを表す値オブジェクト (Value Object)。
 *
 * 有効なカテゴリ（"it_errors", "programming"など）のみを許容し、不正なカテゴリの生成を防ぎます。
 */
export class WordCategory extends ValueObject {
	private static readonly _cache = new Map<WordCategoryType, WordCategory>();

	private constructor(public readonly value: WordCategoryType) {
		super();
	}

	/**
	 * 文字列から WordCategory を生成します。
	 * Flyweightパターンにより、同じカテゴリのインスタンスはキャッシュから再利用されます。
	 *
	 * @param value カテゴリ名文字列
	 * @returns 成功時は WordCategory、失敗時は Error を含む Result
	 */
	public static create(value: string): Result<WordCategory, Error> {
		if (!VALID_WORD_CATEGORIES.includes(value as WordCategoryType)) {
			return Result.err(new Error(`不正なカテゴリです: ${value}`));
		}

		const typedValue = value as WordCategoryType;
		let instance = WordCategory._cache.get(typedValue);
		if (!instance) {
			instance = new WordCategory(typedValue);
			WordCategory._cache.set(typedValue, instance);
		}

		return Result.ok(instance);
	}

	/**
	 * 他の WordCategory との値の一致を判定します。
	 *
	 * @param other 比較対象の WordCategory
	 * @returns カテゴリ文字列が一致する場合 true
	 */
	public equals(other: this): boolean {
		if (other === null || other === undefined) {
			return false;
		}
		return this.value === other.value;
	}
}
