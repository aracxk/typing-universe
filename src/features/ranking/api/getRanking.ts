import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { RankingEntry } from "../../../entities/ranking/domain/RankingEntry";
import type { RankedGameId } from "../../../entities/ranking/domain/ScoreSubmission";
import { getAdminFirestore } from "../../../shared/lib/firebase/admin";

const TOP_RANKING_LIMIT = 10;

interface FirestoreScoreDocument {
	nickname?: unknown;
	score?: unknown;
	kills?: unknown;
	maxCombo?: unknown;
	correctTyped?: unknown;
	totalTyped?: unknown;
	stage?: unknown;
	createdAt?: { toDate?: () => Date };
}

/**
 * 指定されたゲームのランキング上位10件をFirestoreから取得し、サーバーキャッシュします。
 *
 * Next.js の `"use cache"` ディレクティブと `cacheTag` を使用し、
 * 新規スコア登録時にオンデマンドでキャッシュ無効化されるまでFirestoreの読み取り回数を節約します。
 *
 * @param gameId 取得対象のゲーム識別子
 * @returns ランキング上位エントリの配列（最大10件、スコア降順）
 */
export async function getTopRankings(
	gameId: RankedGameId,
): Promise<readonly RankingEntry[]> {
	"use cache";
	cacheLife("minutes");
	cacheTag(`ranking:${gameId}`);

	try {
		const db = getAdminFirestore();
		const snapshot = await db
			.collection("games")
			.doc(gameId)
			.collection("scores")
			.orderBy("score", "desc")
			.limit(TOP_RANKING_LIMIT)
			.get();

		return snapshot.docs.map((doc, index) => {
			const data = doc.data() as FirestoreScoreDocument;
			const correctTyped =
				typeof data.correctTyped === "number" ? data.correctTyped : 0;
			const totalTyped =
				typeof data.totalTyped === "number" ? data.totalTyped : 0;
			const accuracy =
				totalTyped > 0 ? Math.round((correctTyped / totalTyped) * 100) : 100;
			const createdDate =
				data.createdAt && typeof data.createdAt.toDate === "function"
					? data.createdAt.toDate()
					: new Date(0);

			return {
				id: doc.id,
				gameId,
				rank: index + 1,
				nickname:
					typeof data.nickname === "string" ? data.nickname : "ANONYMOUS",
				score: typeof data.score === "number" ? data.score : 0,
				kills: typeof data.kills === "number" ? data.kills : 0,
				maxCombo: typeof data.maxCombo === "number" ? data.maxCombo : 0,
				accuracy,
				stage: typeof data.stage === "number" ? data.stage : 1,
				createdAtIso: createdDate.toISOString(),
			};
		});
	} catch {
		return [];
	}
}
