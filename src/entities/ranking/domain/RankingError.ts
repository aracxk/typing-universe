import { DomainError } from "../../../shared/domain/DomainError";
import type { DomainErrorCode } from "../../../shared/domain/DomainErrorCode";

/**
 * ランキング集約（ニックネーム検証・スコア妥当性検証）におけるビジネスルール違反を表すドメインエラー。
 */
export class RankingError extends DomainError {
	constructor(
		public readonly code: DomainErrorCode,
		message: string,
	) {
		super(message);
	}
}
