import type { InvaderGameEngine } from "../../../../entities/invader/domain/InvaderGameEngine";

type Props = {
	engine: InvaderGameEngine;
};

export function InvaderHUD({ engine }: Props) {
	return (
		<div className="relative z-30 bg-slate-950/90 border-b border-cyan-900/60 px-4 py-2 flex flex-wrap items-center justify-between text-xs gap-2">
			<div className="flex items-center space-x-6">
				<div>
					<span className="text-slate-400 text-[10px]">SCORE:</span>
					<span className="text-[#ffe600] text-sm ml-1 font-bold">
						{String(engine.score).padStart(6, "0")}
					</span>
				</div>
				<div>
					<span className="text-slate-400 text-[10px]">COMBO:</span>
					<span className="text-[#00f3ff] text-sm ml-1 font-bold">
						{engine.combo}
					</span>
				</div>
			</div>
			<div className="flex items-center space-x-6">
				<div>
					<span className="text-slate-400 text-[10px]">STAGE:</span>
					<span className="text-[#00ff66] text-sm ml-1 font-bold">
						DEBUG Lv.{engine.stageLevel}
					</span>
				</div>
				<div>
					<span className="text-slate-400 text-[10px]">SHIELD:</span>
					<span className="text-[#ff0055] text-sm ml-1">
						{"■".repeat(Math.max(0, engine.lives)) || "CRITICAL"}
					</span>
				</div>
			</div>
		</div>
	);
}
