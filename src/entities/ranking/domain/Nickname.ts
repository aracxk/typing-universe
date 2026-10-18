import { Result } from "../../../shared/core/Result";
import { DOMAIN_ERROR_CODES } from "../../../shared/domain/DomainErrorCode";
import { ValueObject } from "../../../shared/domain/ValueObject";
import { RankingError } from "./RankingError";

const MIN_NICKNAME_LENGTH = 1;
const MAX_NICKNAME_LENGTH = 12;

/**
 * 許可される文字種:
 * 半角英数字、ひらがな(\u3040-\u309F)、カタカナ(\u30A0-\u30FF)、
 * CJK統合漢字(\u4E00-\u9FFF)、長音符・中黒、アンダースコア、ハイフン、ドット、半角スペース。
 */
const ALLOWED_NICKNAME_PATTERN =
	/^[a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF_\-. ]+$/;

/**
 * 簡易NGワード一覧（小文字正規化後に部分一致で検査）。
 */
const PROHIBITED_WORDS: readonly string[] = [
	"admin",
	"moderator",
	"system",
	"fuck",
	"shit",
	"死ね",
	"殺す",
] as const;

/**
 * ランキングに表示するプレイヤーのニックネームを表す値オブジェクト (Value Object)。
 *
 * Unicode正規化(NFKC)および前後空白トリムを行った上で、1〜12文字の長さ制約、
 * 許可文字種制約、NGワード制約を保証します。
 * Flyweightパターンにより同一文字列のインスタンスをキャッシュ・再利用します。
 */
export class Nickname extends ValueObject {
	private static readonly _cache = new Map<string, Nickname>();
	private static readonly _maxCacheSize = 256;

	private constructor(public readonly value: string) {
		super();
	}

	/**
	 * 入力文字列を正規化・検証し、Nickname インスタンスを生成します。
	 *
	 * @param rawInput ユーザー入力のニックネーム文字列（NFKC正規化・トリム後に1〜12文字）
	 * @returns 成功時は Nickname、文字数超過・禁止文字・NGワード時は RankingError を含む Result
	 */
	public static create(rawInput: string): Result<Nickname, RankingError> {
		const normalized = rawInput.normalize("NFKC").trim();

		if (
			normalized.length < MIN_NICKNAME_LENGTH ||
			normalized.length > MAX_NICKNAME_LENGTH
		) {
			return Result.err(
				new RankingError(
					DOMAIN_ERROR_CODES.INVALID_NICKNAME_LENGTH,
					`ニックネームは${MIN_NICKNAME_LENGTH}文字以上${MAX_NICKNAME_LENGTH}文字以内で入力してください。`,
				),
			);
		}

		if (!ALLOWED_NICKNAME_PATTERN.test(normalized)) {
			return Result.err(
				new RankingError(
					DOMAIN_ERROR_CODES.INVALID_NICKNAME_CHARACTERS,
					"ニックネームに使用できない文字が含まれています。",
				),
			);
		}

		const lower = normalized.toLowerCase();
		for (const word of PROHIBITED_WORDS) {
			if (lower.includes(word)) {
				return Result.err(
					new RankingError(
						DOMAIN_ERROR_CODES.PROHIBITED_NICKNAME,
						"使用できないワードが含まれています。",
					),
				);
			}
		}

		const cached = Nickname._cache.get(normalized);
		if (cached) {
			return Result.ok(cached);
		}

		if (Nickname._cache.size >= Nickname._maxCacheSize) {
			Nickname._cache.clear();
		}

		const instance = new Nickname(normalized);
		Nickname._cache.set(normalized, instance);
		return Result.ok(instance);
	}

	/**
	 * 他の Nickname と文字列表現が一致するかを判定します。
	 *
	 * @param other 比較対象の Nickname
	 * @returns 正規化済みニックネーム文字列が一致する場合 true
	 */
	public equals(other: this): boolean {
		if (other === null || other === undefined) {
			return false;
		}
		return this.value === other.value;
	}
}
