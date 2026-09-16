import type { InvaderGameEngine } from "../../../../entities/invader/domain/InvaderGameEngine";

type Props = {
	engine: InvaderGameEngine;
};

export function InvaderLockonBar({ engine }: Props) {
	const getTargetText = () => {
		const targetId = engine.focusedInvaderId;
		if (!targetId) {
			return <span className="text-slate-500 italic">No Target Locked</span>;
		}
		const focused = engine.invaders.find((inv) => inv.id.equals(targetId));
		if (!focused)
			return <span className="text-slate-500 italic">No Target Locked</span>;

		const fullText = focused.activeWord.target.readings[0];
		const currentIndex = focused.activeWord.currentIndex;

		const typedPart = fullText.slice(0, currentIndex);
		const nextChar = fullText.slice(currentIndex, currentIndex + 1);
		const remainPart = fullText.slice(currentIndex + 1);

		return (
			<>
				<span className="text-slate-500">{typedPart}</span>
				<span className="text-[#00f3ff] underline font-extrabold bg-cyan-950 px-0.5 rounded">
					{nextChar}
				</span>
				<span className="text-white">{remainPart}</span>
			</>
		);
	};

	return (
		<div className="relative z-30 bg-slate-900 border-t border-cyan-950 px-4 py-3 flex items-center justify-between gap-4">
			<div className="flex items-center space-x-3 overflow-hidden">
				<span className="text-xs text-slate-400 uppercase tracking-wider whitespace-nowrap">
					LOCK ON:
				</span>
				<div className="text-lg tracking-wider font-bold truncate">
					{getTargetText()}
				</div>
			</div>
			<div className="hidden sm:flex items-center space-x-2 text-xs text-slate-400">
				<span>TYPE:</span>
				<kbd className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-cyan-300">
					A-Z
				</kbd>
				<kbd className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-cyan-300">
					-
				</kbd>
			</div>
		</div>
	);
}
