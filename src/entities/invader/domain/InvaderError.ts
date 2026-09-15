import { DomainError } from "../../../shared/domain/DomainError";
import type { DomainErrorCode } from "../../../shared/domain/DomainErrorCode";

export class InvaderError extends DomainError {
	constructor(
		public readonly code: DomainErrorCode,
		message: string,
	) {
		super(message);
	}
}
