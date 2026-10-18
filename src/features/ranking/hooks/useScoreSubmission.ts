import { type FormEvent, useCallback, useEffect, useState } from "react";
import { Nickname } from "../../../entities/ranking/domain/Nickname";
import type { RankingEntry } from "../../../entities/ranking/domain/RankingEntry";
import type { RankedGameId } from "../../../entities/ranking/domain/ScoreSubmission";
import { nicknameStringSchema } from "../model/schemas";

const NICKNAME_STORAGE_KEY = "typing_universe_nickname";

/**
 * スコア送信完了時のサーバー応答データ。
 */
export interface ScoreSubmitResponse {
	readonly rank: number;
	readonly isTopTen: boolean;
	readonly nickname: string;
	readonly score: number;
}

/**
 * スコア送信対象となるゲームプレイ統計データ。
 */
export interface GameOverStats {
	readonly gameId: RankedGameId;
	readonly sessionToken: string | null;
	readonly score: number;
	readonly kills: number;
	readonly maxCombo: number;
	readonly correctTyped: number;
	readonly totalTyped: number;
	readonly stage: number;
}

export type SubmissionStatus = "idle" | "submitting" | "submitted" | "error";

/**
 * ゲームオーバー画面におけるニックネーム管理・スコア送信・ランキング一覧取得を統括するカスタムフック。
 *
 * UIコンポーネント(.tsx)から useState / useEffect を完全に分離し、
 * localStorage へのニックネーム永続化と Zod / ValueObject による境界検証を担います。
 *
 * @param stats ゲーム終了時点のスコア統計およびセッショントークン
 * @returns フォーム状態、ランキング配列、および送信ハンドラ
 */
export function useScoreSubmission(stats: GameOverStats) {
	const [nickname, setNickname] = useState<string>("");
	const [status, setStatus] = useState<SubmissionStatus>("idle");
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [result, setResult] = useState<ScoreSubmitResponse | null>(null);
	const [rankings, setRankings] = useState<readonly RankingEntry[]>([]);
	const [isLoadingRankings, setIsLoadingRankings] = useState<boolean>(true);

	const fetchRankings = useCallback(async () => {
		setIsLoadingRankings(true);
		try {
			const response = await fetch(
				`/api/scores?gameId=${encodeURIComponent(stats.gameId)}`,
			);
			if (response.ok) {
				const data = (await response.json()) as {
					entries?: readonly RankingEntry[];
				};
				if (Array.isArray(data.entries)) {
					setRankings(data.entries);
				}
			}
		} catch {
			// ネットワークエラー時は空リストを維持
		} finally {
			setIsLoadingRankings(false);
		}
	}, [stats.gameId]);

	useEffect(() => {
		try {
			const saved = window.localStorage.getItem(NICKNAME_STORAGE_KEY);
			if (saved) {
				setNickname(saved);
			}
		} catch {
			// プライベートブラウジング等で localStorage が無効な場合は無視
		}
		fetchRankings();
	}, [fetchRankings]);

	const handleSubmit = useCallback(
		async (e: FormEvent<HTMLFormElement>) => {
			e.preventDefault();
			if (status === "submitting" || status === "submitted") return;

			setErrorMessage(null);

			const zodParsed = nicknameStringSchema.safeParse(nickname);
			if (!zodParsed.success) {
				setStatus("error");
				setErrorMessage(
					zodParsed.error.issues[0]?.message ??
						"ニックネームを正しく入力してください。",
				);
				return;
			}

			const voResult = Nickname.create(zodParsed.data);
			if (!voResult.success) {
				setStatus("error");
				setErrorMessage(voResult.error.message);
				return;
			}

			if (!stats.sessionToken) {
				setStatus("error");
				setErrorMessage(
					"プレイセッション情報が取得できませんでした。再プレイしてお試しください。",
				);
				return;
			}

			setStatus("submitting");

			try {
				window.localStorage.setItem(NICKNAME_STORAGE_KEY, voResult.value.value);
			} catch {
				// localStorage 保存失敗時は無視
			}

			try {
				const response = await fetch("/api/scores", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						gameId: stats.gameId,
						sessionToken: stats.sessionToken,
						nickname: voResult.value.value,
						score: stats.score,
						kills: stats.kills,
						maxCombo: stats.maxCombo,
						correctTyped: stats.correctTyped,
						totalTyped: stats.totalTyped,
						stage: stats.stage,
					}),
				});

				const body = (await response.json()) as {
					error?: string;
					rank?: number;
					isTopTen?: boolean;
					nickname?: string;
					score?: number;
				};

				if (!response.ok || typeof body.rank !== "number") {
					setStatus("error");
					setErrorMessage(
						body.error ??
							"スコアの登録に失敗しました。時間をおいてお試しください。",
					);
					return;
				}

				setResult({
					rank: body.rank,
					isTopTen: Boolean(body.isTopTen),
					nickname: body.nickname ?? voResult.value.value,
					score: body.score ?? stats.score,
				});
				setStatus("submitted");
				await fetchRankings();
			} catch {
				setStatus("error");
				setErrorMessage("通信エラーが発生しました。接続を確認してください。");
			}
		},
		[nickname, stats, status, fetchRankings],
	);

	return {
		nickname,
		setNickname,
		status,
		errorMessage,
		result,
		rankings,
		isLoadingRankings,
		handleSubmit,
	};
}
