import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import { revalidateTag } from "next/cache";
import { Nickname } from "../../../entities/ranking/domain/Nickname";
import { validateScorePlausibility } from "../../../entities/ranking/domain/validateScorePlausibility";
import { Result } from "../../../shared/core/Result";
import { getAdminFirestore } from "../../../shared/lib/firebase/admin";
import { verifyPlaySessionToken } from "../../../shared/lib/firebase/sessionToken";
import type { ScoreSubmitRequestInput } from "../model/schemas";

/**
 * スコア登録成功時のレスポンスデータ。
 */
export interface SubmitScoreSuccess {
	readonly rank: number;
	readonly isTopTen: boolean;
	readonly nickname: string;
	readonly score: number;
}

/**
 * スコア送信リクエストを検証し、Firestoreへ保存した上で順位を算出・キャッシュを無効化します。
 *
 * @param input Zodスキーマ検証済みのスコア送信リクエスト
 * @returns 成功時は順位情報を含む SubmitScoreSuccess、失敗時はステータスコードとメッセージを含む Result
 */
export async function submitScoreRecord(
	input: ScoreSubmitRequestInput,
): Promise<
	Result<
		SubmitScoreSuccess,
		{ readonly status: number; readonly message: string }
	>
> {
	const sessionResult = verifyPlaySessionToken(
		input.sessionToken,
		input.gameId,
	);
	if (!sessionResult.success) {
		return Result.err({
			status: 400,
			message: sessionResult.error.message,
		});
	}

	const nicknameResult = Nickname.create(input.nickname);
	if (!nicknameResult.success) {
		return Result.err({
			status: 400,
			message: nicknameResult.error.message,
		});
	}

	const plausibilityResult = validateScorePlausibility({
		gameId: input.gameId,
		score: input.score,
		kills: input.kills,
		maxCombo: input.maxCombo,
		correctTyped: input.correctTyped,
		totalTyped: input.totalTyped,
		stage: input.stage,
		durationMs: sessionResult.value.durationMs,
	});
	if (!plausibilityResult.success) {
		return Result.err({
			status: 400,
			message: plausibilityResult.error.message,
		});
	}

	const db = getAdminFirestore();
	const scoresCollection = db
		.collection("games")
		.doc(input.gameId)
		.collection("scores");
	const docRef = scoresCollection.doc(sessionResult.value.sessionId);

	try {
		await docRef.create({
			nickname: nicknameResult.value.value,
			score: input.score,
			kills: input.kills,
			maxCombo: input.maxCombo,
			correctTyped: input.correctTyped,
			totalTyped: input.totalTyped,
			stage: input.stage,
			durationMs: sessionResult.value.durationMs,
			createdAt: FieldValue.serverTimestamp(),
			schemaVersion: 1,
		});
	} catch (err) {
		const code = (err as { code?: unknown })?.code;
		if (code === 6 || code === "already-exists") {
			return Result.err({
				status: 409,
				message: "このプレイセッションのスコアは既に登録されています。",
			});
		}
		return Result.err({
			status: 500,
			message: "スコアの保存中にサーバーエラーが発生しました。",
		});
	}

	let rank = 1;
	try {
		const higherCountSnap = await scoresCollection
			.where("score", ">", input.score)
			.count()
			.get();
		rank = higherCountSnap.data().count + 1;
	} catch {
		rank = 1;
	}

	revalidateTag(`ranking:${input.gameId}`, { expire: 0 });

	return Result.ok({
		rank,
		isTopTen: rank <= 10,
		nickname: nicknameResult.value.value,
		score: input.score,
	});
}
