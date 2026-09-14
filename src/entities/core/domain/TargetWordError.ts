import { DomainError } from "../../../shared/domain/DomainError";
import type { DomainErrorCode } from "../../../shared/domain/DomainErrorCode";

export class TargetWordError extends DomainError {
	public readonly code: DomainErrorCode = "INVALID_TARGET_WORD_READING";

	constructor(message: string) {
		super(message);
	}
}
