import { type NextRequest, NextResponse } from "next/server";
import { sessionIssueRequestSchema } from "../../../features/ranking/model/schemas";
import { checkRateLimit } from "../../../shared/lib/firebase/rateLimit";
import { issuePlaySessionToken } from "../../../shared/lib/firebase/sessionToken";

const SESSION_RATE_LIMIT_WINDOW_MS = 60_000;
const SESSION_RATE_LIMIT_MAX = 30;

function extractClientIp(request: NextRequest): string {
	const forwarded = request.headers.get("x-forwarded-for");
	if (forwarded) {
		const first = forwarded.split(",")[0]?.trim();
		if (first) return first;
	}
	return request.headers.get("x-real-ip") ?? "local";
}

/**
 * ゲーム開始時に署名付きプレイセッショントークンを発行するエンドポイント (POST /api/sessions)。
 */
export async function POST(request: NextRequest) {
	const clientIp = extractClientIp(request);
	if (
		!checkRateLimit(
			`session:${clientIp}`,
			SESSION_RATE_LIMIT_WINDOW_MS,
			SESSION_RATE_LIMIT_MAX,
		)
	) {
		return NextResponse.json(
			{
				error: "リクエストが多すぎます。しばらく待ってから再試行してください。",
			},
			{ status: 429 },
		);
	}

	let rawBody: unknown;
	try {
		rawBody = await request.json();
	} catch {
		return NextResponse.json(
			{ error: "JSON形式が不正です。" },
			{ status: 400 },
		);
	}

	const parsed = sessionIssueRequestSchema.safeParse(rawBody);
	if (!parsed.success) {
		return NextResponse.json(
			{ error: "リクエストパラメータが不正です。" },
			{ status: 400 },
		);
	}

	try {
		const issued = issuePlaySessionToken(parsed.data.gameId);
		return NextResponse.json({
			sessionId: issued.sessionId,
			token: issued.token,
			issuedAt: issued.issuedAt,
		});
	} catch {
		return NextResponse.json(
			{ error: "セッショントークンの発行に失敗しました。" },
			{ status: 500 },
		);
	}
}
