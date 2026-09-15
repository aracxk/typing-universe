/**
 * システム全体のドメインエラーコード一覧（一元管理）
 *
 * ビジネスルール（不変条件）違反が発生した際に、
 * 機械判別用の一意な識別子として使用する。
 */
export const DOMAIN_ERROR_CODES = {
	// 共通
	INVALID_ENTITY_ID: "INVALID_ENTITY_ID",
	// タイピング集約 (core)
	INVALID_TARGET_WORD_READING: "INVALID_TARGET_WORD_READING",
	ACTIVE_WORD_ALREADY_COMPLETED: "ACTIVE_WORD_ALREADY_COMPLETED",
	// インベーダー集約 (invader)
	INVALID_INVADER_COORDINATE: "INVALID_INVADER_COORDINATE",
	INVALID_INVADER_SPEED: "INVALID_INVADER_SPEED",
} as const;

/**
 * ドメインエラーコード型
 */
export type DomainErrorCode =
	(typeof DOMAIN_ERROR_CODES)[keyof typeof DOMAIN_ERROR_CODES];
