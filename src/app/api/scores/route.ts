import { type NextRequest, NextResponse } from "next/server";
import { getTopRankings } from "../../../features/ranking/api/getRanking";
import { submitScoreRecord } from "../../../features/ranking/api/submitScore";
import {
	rankedGameIdSchema,
	scoreSubmitRequestSchema,
} from "../../../features/ranking/model/schemas";
import { checkRateLimit } from "../../../shared/lib/firebase/rateLimit";

const SCORE_SUBMIT_RATE_LIMIT_WINDOW_MS = 60_000;
const SCORE_SUBMIT_RATE_LIMIT_MAX = 5;

function extractClientIp(request: NextRequest): string {
	const forwarded = request.headers.get("x-forwarded-for");
	if (forwarded) {
		const first = forwarded.split(",")[0]?.trim();
		if (first) return first;
	}
	return request.headers.get("x-real-ip") ?? "local";
}

/**
 * 指定されたゲームのトップ10ランキングを取得するエンドポイント (GET /api/scores?gameId=bug_invaders)。
 */
export async function GET(request: NextRequest) {
	const gameIdParam =
		request.nextUrl.searchParams.get("gameId") ?? "bug_invaders";
	const parsedGameId = rankedGameIdSchema.safeParse(gameIdParam);

	if (!parsedGameId.success) {
		return NextResponse.json(
			{ error: "指定されたゲームIDが不正です。" },
			{ status: 400 },
		);
	}

	const entries = await getTopRankings(parsedGameId.data);
	return NextResponse.json({ entries });
}

/**
 * ゲームオーバー時にスコアを検証・保存するエンドポイント (POST /api/scores)。
 */
export async function POST(request: NextRequest) {
	const clientIp = extractClientIp(request);
	if (
		!checkRateLimit(
			`score-submit:${clientIp}`,
			SCORE_SUBMIT_RATE_LIMIT_WINDOW_MS,
			SCORE_SUBMIT_RATE_LIMIT_MAX,
		)
	) {
		return NextResponse.json(
			{
				error:
					"スコア送信の回数制限に達しました。1分ほど待ってから再試行してください。",
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

	const parsed = scoreSubmitRequestSchema.safeParse(rawBody);
	if (!parsed.success) {
		return NextResponse.json(
			{
				error:
					parsed.error.issues[0]?.message ?? "送信データの形式が不正です。",
			},
			{ status: 400 },
		);
	}

	const result = await submitScoreRecord(parsed.data);
	if (!result.success) {
		return NextResponse.json(
			{ error: result.error.message },
			{ status: result.error.status },
		);
	}

	return NextResponse.json(result.value, { status: 201 });
}
