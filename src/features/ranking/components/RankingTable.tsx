import type { RankingEntry } from "../../../entities/ranking/domain/RankingEntry";

interface RankingTableProps {
	readonly entries: readonly RankingEntry[];
	readonly isLoading?: boolean;
	readonly highlightNickname?: string | null;
	readonly compact?: boolean;
}

/**
 * ランキング上位10件を表示する純粋なテーブルUIコンポーネント。
 */
export function RankingTable({
	entries,
	isLoading = false,
	highlightNickname = null,
	compact = false,
}: RankingTableProps) {
	if (isLoading) {
		return (
			<div className="w-full py-6 text-center font-mono text-xs text-slate-400 animate-pulse">
				RANKING DATA LOADING...
			</div>
		);
	}

	if (entries.length === 0) {
		return (
			<div className="w-full py-6 text-center font-mono text-xs text-slate-400 border border-slate-800 rounded bg-slate-900/50">
				まだ記録がありません。最初のランカーになりましょう。
			</div>
		);
	}

	return (
		<div className="w-full overflow-x-auto border border-slate-800 rounded-lg bg-slate-950/80">
			<table className="w-full text-left font-mono text-xs sm:text-sm border-collapse">
				<thead>
					<tr className="border-b border-slate-800 text-slate-400 bg-slate-900/70">
						<th className="py-2 px-3 w-14">RANK</th>
						<th className="py-2 px-3">PLAYER</th>
						<th className="py-2 px-3 text-right">SCORE</th>
						{!compact && (
							<>
								<th className="py-2 px-3 text-right hidden sm:table-cell">
									KILLS
								</th>
								<th className="py-2 px-3 text-right hidden sm:table-cell">
									COMBO
								</th>
								<th className="py-2 px-3 text-right hidden md:table-cell">
									ACC
								</th>
							</>
						)}
					</tr>
				</thead>
				<tbody className="divide-y divide-slate-800/60">
					{entries.map((entry) => {
						const isHighlighted =
							highlightNickname !== null &&
							entry.nickname === highlightNickname;
						const rankColor =
							entry.rank === 1
								? "text-[#ffe600] font-black"
								: entry.rank === 2
									? "text-cyan-300 font-bold"
									: entry.rank === 3
										? "text-amber-500 font-bold"
										: "text-slate-400";

						return (
							<tr
								key={entry.id}
								className={
									isHighlighted
										? "bg-cyan-950/50 text-cyan-200"
										: "hover:bg-slate-900/40 text-slate-200"
								}
							>
								<td className={`py-2 px-3 ${rankColor}`}>#{entry.rank}</td>
								<td className="py-2 px-3 font-bold truncate max-w-[140px]">
									{entry.nickname}
								</td>
								<td className="py-2 px-3 text-right font-bold text-[#ffe600]">
									{entry.score.toLocaleString()}
								</td>
								{!compact && (
									<>
										<td className="py-2 px-3 text-right text-[#00ff66] hidden sm:table-cell">
											{entry.kills}
										</td>
										<td className="py-2 px-3 text-right text-[#ff0055] hidden sm:table-cell">
											{entry.maxCombo}
										</td>
										<td className="py-2 px-3 text-right text-[#00f3ff] hidden md:table-cell">
											{entry.accuracy}%
										</td>
									</>
								)}
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	);
}
