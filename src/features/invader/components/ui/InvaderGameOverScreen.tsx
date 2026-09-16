import type { InvaderGameEngine } from "../../../../entities/invader/domain/InvaderGameEngine";

type Props = {
	engine: InvaderGameEngine;
};

export function InvaderGameOverScreen({ engine }: Props) {
	return (
		<div className="absolute inset-0 z-30 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
			<h2
				className="text-4xl text-[#ff0055] font-bold mb-2 tracking-widest"
				style={{ textShadow: "0 0 10px rgba(255,0,85,0.7)" }}
			>
				SERVER DOWN!!
			</h2>
			<p className="text-slate-400 text-sm mb-6">
				本番環境がバグによってクラッシュしました。
			</p>

			<div className="bg-slate-900/90 border border-slate-700 rounded-lg p-5 max-w-md w-full mb-6 space-y-2 text-left">
				<div className="flex justify-between border-b border-slate-800 pb-2">
					<span className="text-slate-400">FINAL SCORE</span>
					<span className="text-[#ffe600] font-bold text-lg">
						{engine.score}
					</span>
				</div>
				<div className="flex justify-between mt-2">
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
				<div className="flex justify-between items-center pt-2 border-t border-slate-800 mt-2">
					<span className="text-slate-400">ENGINEER RANK</span>
					<span className="text-xl text-[#00f3ff] font-black">
						{engine.rank}
					</span>
				</div>
			</div>

			<button
				type="button"
				className="px-6 py-3 bg-[#00ff66] text-black font-bold rounded animate-pulse cursor-pointer"
				onClick={() => window.location.reload()}
			>
				PRESS [SPACE] TO RETRY
			</button>
		</div>
	);
}
