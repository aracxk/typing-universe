"use client";

import { InvaderCanvas } from "../../../features/invader/components/InvaderCanvas";
import { InvaderGameOverScreen } from "../../../features/invader/components/ui/InvaderGameOverScreen";
import { InvaderHeader } from "../../../features/invader/components/ui/InvaderHeader";
import { InvaderHUD } from "../../../features/invader/components/ui/InvaderHUD";
import { InvaderLockonBar } from "../../../features/invader/components/ui/InvaderLockonBar";
import { InvaderStartScreen } from "../../../features/invader/components/ui/InvaderStartScreen";
import { useInvaderGame } from "../../../features/invader/hooks/useInvaderGame";
import { useInvaderUI } from "../../../features/invader/hooks/useInvaderUI";

export default function InvaderGamePage() {
	const { engine, sound, hasStarted, isReady } = useInvaderGame();
	const { soundEnabled, toggleSound } = useInvaderUI(sound);

	return (
		<main className="min-h-screen flex flex-col items-center justify-center p-2 sm:p-6 bg-[#05070f] text-slate-200 font-mono overflow-x-hidden selection:bg-cyan-900">
			<InvaderHeader soundEnabled={soundEnabled} onToggleSound={toggleSound} />

			<div className="w-full max-w-4xl relative border-[12px] border-[#1a202c] rounded-[18px] bg-black overflow-hidden flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_30px_rgba(0,243,255,0.2)]">
				<InvaderHUD engine={engine} />

				<div className="relative w-full aspect-[4/3] bg-[#05070f]">
					<InvaderCanvas engine={engine} />

					{engine.status === "playing" && !hasStarted && engine.score === 0 && (
						<InvaderStartScreen isReady={isReady} />
					)}

					{engine.status === "gameover" && (
						<InvaderGameOverScreen engine={engine} />
					)}
				</div>

				<InvaderLockonBar engine={engine} />
			</div>
		</main>
	);
}
