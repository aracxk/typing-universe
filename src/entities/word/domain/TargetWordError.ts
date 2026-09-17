import { DomainError } from "../../../shared/domain/DomainError";
import type { DomainErrorCode } from "../../../shared/domain/DomainErrorCode";

/**
 * TargetWord のバリデーション違反（読み仮名が空、または空文字が含まれるなど）を表すドメインエラー。
 */
export class TargetWordError extends DomainError {
	public readonly code: DomainErrorCode = "INVALID_TARGET_WORD_READING";

	constructor(message: string) {
		super(message);
	}
}
