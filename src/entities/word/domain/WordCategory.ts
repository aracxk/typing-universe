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
	private constructor(public readonly value: WordCategoryType) {
		super();
	}

	/**
	 * 文字列から WordCategory を生成します。
	 *
	 * @param value カテゴリ名文字列（"it_errors", "programming", "web_tech", "general_fruits" のいずれか）
	 * @returns 有効なカテゴリの場合は WordCategory、無効な場合は Error
	 */
	public static create(value: string): Result<WordCategory, Error> {
		if (!VALID_WORD_CATEGORIES.includes(value as WordCategoryType)) {
			return Result.err(new Error(`不正なカテゴリです: ${value}`));
		}
		return Result.ok(new WordCategory(value as WordCategoryType));
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
