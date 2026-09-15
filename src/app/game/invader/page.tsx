"use client";

import { InvaderCanvas } from "../../../features/invader/components/InvaderCanvas";
import { useInvaderGame } from "../../../features/invader/hooks/useInvaderGame";

export default function InvaderGamePage() {
	const engine = useInvaderGame();

	return (
		<main className="relative w-full h-screen flex flex-col items-center justify-center bg-slate-950 font-mono">
			<div className="mb-4 text-center">
				<h1 className="text-3xl font-black text-emerald-400 tracking-widest">
					BUG INVADERS
				</h1>
				<p className="text-slate-400 text-sm mt-1">
					TYPE TO DEFEND YOUR SYSTEM
				</p>
			</div>

			<InvaderCanvas engine={engine} />

			{engine.status === "gameover" && (
				<div className="mt-6 flex flex-col items-center">
					<button
						type="button"
						className="px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold rounded shadow-lg transition-colors cursor-pointer"
						onClick={() => window.location.reload()}
					>
						REBOOT SYSTEM (TRY AGAIN)
					</button>
				</div>
			)}
		</main>
	);
}
