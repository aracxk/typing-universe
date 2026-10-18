"use client";

import Link from "next/link";
import {
	type GameOverStats,
	useScoreSubmission,
} from "../hooks/useScoreSubmission";
import { RankingTable } from "./RankingTable";
import { ScoreSubmitForm } from "./ScoreSubmitForm";

interface GameOverRankingSectionProps {
	readonly stats: GameOverStats;
}

/**
 * ゲームオーバー画面内に組み込まれるスコア登録フォームとトップ10ランキング表示セクション。
 *
 * 状態管理とAPI通信はすべて useScoreSubmission カスタムフックに委譲し、
 * コンポーネント自体は純粋なプレゼンテーション層として振る舞います。
 */
export function GameOverRankingSection({ stats }: GameOverRankingSectionProps) {
	const {
		nickname,
		setNickname,
		status,
		errorMessage,
		result,
		rankings,
		isLoadingRankings,
		handleSubmit,
	} = useScoreSubmission(stats);

	const canSubmit = stats.score > 0 && Boolean(stats.sessionToken);

	return (
		<div className="w-full max-w-md space-y-4">
			<ScoreSubmitForm
				nickname={nickname}
				onNicknameChange={setNickname}
				status={status}
				errorMessage={errorMessage}
				result={result}
				canSubmit={canSubmit}
				onSubmit={handleSubmit}
			/>

			<div className="space-y-1.5 text-left">
				<div className="flex items-center justify-between">
					<span className="text-[11px] font-bold tracking-wider text-cyan-400">
						TOP 10 RANKING
					</span>
					<Link
						href="/ranking"
						className="text-[11px] text-slate-400 hover:text-cyan-300 underline"
					>
						全ランキングを見る
					</Link>
				</div>
				<div className="max-h-36 overflow-y-auto">
					<RankingTable
						entries={rankings}
						isLoading={isLoadingRankings}
						highlightNickname={result?.nickname ?? null}
						compact
					/>
				</div>
			</div>
		</div>
	);
}
