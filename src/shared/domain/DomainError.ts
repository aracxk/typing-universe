import type { DomainErrorCode } from "./DomainErrorCode";

/**
 * ドメイン層で発生するすべてのエラーの基底クラス
 *
 * 責務:
 * - すべてのドメインエラーに機械判別用の `code`（DomainErrorCode）を強制する。
 * - 標準の Error クラスを継承し、スタックトレースとメッセージを保持する。
 */
export abstract class DomainError extends Error {
	abstract readonly code: DomainErrorCode;

	constructor(message: string) {
		super(message);
		this.name = this.constructor.name;
		// TypeScript/V8 環境でのプロトタイプチェーン復元
		Object.setPrototypeOf(this, new.target.prototype);
	}
}
