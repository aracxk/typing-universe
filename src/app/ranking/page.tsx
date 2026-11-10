import Link from "next/link";
import { Suspense } from "react";
import { getTopRankings } from "../../features/ranking/api/getRanking";
import { RankingTable } from "../../features/ranking/components/RankingTable";

async function BugInvadersRankingBoard() {
	const entries = await getTopRankings("bug_invaders");
	return <RankingTable entries={entries} />;
}

export default function RankingPage() {
	return (
		<main className="min-h-screen flex flex-col bg-[#05070f] text-slate-200 font-mono selection:bg-cyan-900">
			<header className="w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
				<Link
					href="/"
					className="font-display font-bold text-cyan-400 tracking-widest text-lg hover:text-cyan-300 transition-colors"
				>
					TYPING UNIVERSE
				</Link>
				<div className="flex items-center gap-4 text-xs">
					<Link
						href="/"
						className="px-3 py-1.5 rounded border border-slate-700 hover:border-slate-500 text-slate-300 transition-colors"
					>
						ホームへ戻る
					</Link>
					<Link
						href="/game/invader"
						className="px-3 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 text-black font-bold transition-colors"
					>
						BUG INVADERS をプレイ
					</Link>
				</div>
			</header>

			<section className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6">
				<div className="space-y-2 border-b border-slate-800 pb-4">
					<div className="text-xs text-cyan-400 tracking-widest font-bold">
						GLOBAL LEADERBOARD
					</div>
					<h1 className="text-2xl sm:text-3xl font-bold text-white tracking-wide">
						BUG INVADERS 歴代トップ10ランキング
					</h1>
					<p className="text-xs sm:text-sm text-slate-400">
						サーバー側でプレイ時間・理論上限を検証通過した歴代上位10名の防衛記録です。
					</p>
				</div>

				<Suspense fallback={<RankingTable entries={[]} isLoading={true} />}>
					<BugInvadersRankingBoard />
				</Suspense>
			</section>
		</main>
	);
}
