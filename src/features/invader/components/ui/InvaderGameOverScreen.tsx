import type { ReactNode } from "react";
import type { InvaderGameEngine } from "../../../../entities/invader/domain/InvaderGameEngine";

type Props = {
	readonly engine: InvaderGameEngine;
	readonly onRetry?: () => void;
	readonly children?: ReactNode;
};

export function InvaderGameOverScreen({ engine, onRetry, children }: Props) {
	return (
		<div className="absolute inset-0 z-30 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-start sm:justify-center p-4 sm:p-6 text-center overflow-y-auto">
			<h2
				className="text-3xl sm:text-4xl text-[#ff0055] font-bold mb-1 tracking-widest"
				style={{ textShadow: "0 0 10px rgba(255,0,85,0.7)" }}
			>
				SERVER DOWN!!
			</h2>
			<p className="text-slate-400 text-xs sm:text-sm mb-4">
				本番環境がバグによってクラッシュしました。
			</p>

			<div className="bg-slate-900/90 border border-slate-700 rounded-lg p-4 max-w-md w-full mb-4 space-y-1.5 text-left text-xs sm:text-sm">
				<div className="flex justify-between border-b border-slate-800 pb-1.5">
					<span className="text-slate-400">FINAL SCORE</span>
					<span className="text-[#ffe600] font-bold text-base sm:text-lg">
						{engine.score}
					</span>
				</div>
				<div className="flex justify-between mt-1">
					<span className="text-slate-400">BUGS FIXED (撃破数)</span>
					<span className="text-[#00ff66] font-bold">{engine.kills}</span>
				</div>
				<div className="flex justify-between">
					<span className="text-slate-400">ACCURACY (正解率)</span>
					<span className="text-[#00f3ff] font-bold">{engine.accuracy}%</span>
				</div>
				<div className="flex justify-between">
					<span className="text-slate-400">MAX COMBO</span>
					<span className="text-[#ff0055] font-bold">{engine.maxCombo}</span>
				</div>
				<div className="flex justify-between items-center pt-1.5 border-t border-slate-800 mt-1">
					<span className="text-slate-400">ENGINEER RANK</span>
					<span className="text-base sm:text-xl text-[#00f3ff] font-black">
						{engine.rank}
					</span>
				</div>
			</div>

			{children && (
				<div className="w-full flex justify-center mb-4">{children}</div>
			)}

			<button
				type="button"
				className="px-6 py-2.5 bg-[#00ff66] text-black font-bold text-xs sm:text-sm rounded animate-pulse cursor-pointer shrink-0"
				onClick={() => {
					if (onRetry) {
						onRetry();
					} else {
						window.location.reload();
					}
				}}
			>
				PRESS [SPACE] TO RETRY
			</button>
		</div>
	);
}
