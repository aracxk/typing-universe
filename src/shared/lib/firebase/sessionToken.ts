import "server-only";
import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { Result } from "../../core/Result";
import type { RankedGameId } from "../../domain/GameId";

/** セッショントークンの有効期限（ミリ秒）: 2時間 */
export const SESSION_TOKEN_TTL_MS = 2 * 60 * 60 * 1000;

/**
 * 署名付きプレイセッショントークンに格納されるペイロード構造。
 */
export interface PlaySessionTokenPayload {
	readonly sessionId: string;
	readonly gameId: RankedGameId;
	readonly issuedAt: number;
}

/**
 * トークン検証成功時に返却されるセッション情報と経過時間。
 */
export interface VerifiedPlaySession {
	readonly sessionId: string;
	readonly gameId: RankedGameId;
	readonly issuedAt: number;
	readonly durationMs: number;
}

function getSessionSecret(overrideSecret?: string): string {
	const secret = overrideSecret ?? process.env.SCORE_SESSION_SECRET;
	if (!secret || secret.length < 16) {
		throw new Error(
			"SCORE_SESSION_SECRET must be configured with at least 16 characters.",
		);
	}
	return secret;
}

function signPayload(encodedPayload: string, secret: string): string {
	return createHmac("sha256", secret)
		.update(encodedPayload)
		.digest("base64url");
}

/**
 * ゲーム開始時にサーバー側でHMAC-SHA256署名付きのプレイセッショントークンを発行します。
 *
 * @param gameId プレイ対象のゲーム識別子
 * @param nowMs トークン発行時刻（ミリ秒、省略時は Date.now()）
 * @param secretOverride テスト用の署名シークレット文字列（省略時は環境変数 SCORE_SESSION_SECRET）
 * @returns 生成された sessionId, gameId, issuedAt および署名済み token 文字列
 */
export function issuePlaySessionToken(
	gameId: RankedGameId,
	nowMs: number = Date.now(),
	secretOverride?: string,
): PlaySessionTokenPayload & { readonly token: string } {
	const secret = getSessionSecret(secretOverride);
	const payload: PlaySessionTokenPayload = {
		sessionId: randomUUID(),
		gameId,
		issuedAt: nowMs,
	};

	const encodedPayload = Buffer.from(JSON.stringify(payload), "utf8").toString(
		"base64url",
	);
	const signature = signPayload(encodedPayload, secret);

	return {
		...payload,
		token: `${encodedPayload}.${signature}`,
	};
}

/**
 * クライアントから送信されたプレイセッショントークンのHMAC署名・有効期限・ゲーム識別子を検証し、
 * サーバー基準の実測プレイ時間（durationMs）を算出します。
 *
 * @param token クライアントから送信された署名付きトークン文字列
 * @param expectedGameId 期待されるゲーム識別子
 * @param nowMs 検証時刻（ミリ秒、省略時は Date.now()）
 * @param secretOverride テスト用の署名シークレット文字列（省略時は環境変数 SCORE_SESSION_SECRET）
 * @returns 検証成功時は VerifiedPlaySession、改ざん・期限切れ・形式不正時は Error を含む Result
 */
export function verifyPlaySessionToken(
	token: string,
	expectedGameId: RankedGameId,
	nowMs: number = Date.now(),
	secretOverride?: string,
): Result<VerifiedPlaySession, Error> {
	const secret = getSessionSecret(secretOverride);
	const parts = token.split(".");
	if (parts.length !== 2) {
		return Result.err(new Error("セッショントークンの形式が不正です。"));
	}

	const [encodedPayload, providedSignature] = parts;
	if (!encodedPayload || !providedSignature) {
		return Result.err(new Error("セッショントークンが空です。"));
	}

	const expectedSignature = signPayload(encodedPayload, secret);
	const providedBuf = Buffer.from(providedSignature, "utf8");
	const expectedBuf = Buffer.from(expectedSignature, "utf8");

	if (
		providedBuf.length !== expectedBuf.length ||
		!timingSafeEqual(providedBuf, expectedBuf)
	) {
		return Result.err(new Error("セッショントークンの署名が一致しません。"));
	}

	let parsed: unknown;
	try {
		const json = Buffer.from(encodedPayload, "base64url").toString("utf8");
		parsed = JSON.parse(json);
	} catch {
		return Result.err(
			new Error("セッショントークンのペイロード解析に失敗しました。"),
		);
	}

	if (
		typeof parsed !== "object" ||
		parsed === null ||
		typeof (parsed as Record<string, unknown>).sessionId !== "string" ||
		typeof (parsed as Record<string, unknown>).gameId !== "string" ||
		typeof (parsed as Record<string, unknown>).issuedAt !== "number"
	) {
		return Result.err(
			new Error("セッショントークンのペイロード構造が不正です。"),
		);
	}

	const payload = parsed as PlaySessionTokenPayload;
	if (payload.gameId !== expectedGameId) {
		return Result.err(
			new Error("セッショントークンのゲーム識別子が一致しません。"),
		);
	}

	const durationMs = nowMs - payload.issuedAt;
	if (durationMs < 0 || durationMs > SESSION_TOKEN_TTL_MS) {
		return Result.err(
			new Error("セッショントークンの有効期限が切れているか、時刻が不正です。"),
		);
	}

	return Result.ok({
		sessionId: payload.sessionId,
		gameId: payload.gameId,
		issuedAt: payload.issuedAt,
		durationMs,
	});
}
