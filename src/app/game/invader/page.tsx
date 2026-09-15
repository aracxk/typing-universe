"use client";

import { useInvaderGame } from "../../../features/invader/hooks/useInvaderGame";

export default function InvaderGamePage() {
	const engine = useInvaderGame();

	return (
		<main className="relative w-full max-w-2xl mx-auto h-[600px] bg-slate-900 overflow-hidden text-white mt-10 rounded-lg shadow-2xl font-mono border-4 border-slate-800">
			{/* Header / Score */}
			<div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center bg-slate-800/80 z-10 border-b border-slate-700">
				<div className="text-xl font-bold tracking-widest text-emerald-400">
					SCORE: {engine.score}
				</div>
				<div className="text-sm text-slate-400">TYPE TO DEFEND</div>
			</div>

			{/* Game Area */}
			<div className="relative w-full h-full">
				{engine.invaders.map((invader) => {
					const isFocused = engine.focusedInvaderId?.equals(invader.id);
					const activeWord = invader.activeWord;
					const currentIndex = activeWord.currentIndex;
					const readings = activeWord.target.readings[0]; // 単純化のため1つ目の読みを表示

					const typed = readings.slice(0, currentIndex);
					const remaining = readings.slice(currentIndex);

					return (
						<div
							key={invader.id.value}
							className={`absolute flex flex-col items-center transition-all duration-75 ease-linear ${
								isFocused
									? "scale-110 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]"
									: "opacity-90"
							}`}
							style={{
								left: `${invader.x}px`,
								top: `${invader.y}px`,
							}}
						>
							{/* Invader Sprite Mock */}
							<div className="text-2xl mb-1">[v]</div>

							{/* Word Display */}
							<div className="bg-slate-800 px-2 py-1 rounded shadow-lg border border-slate-600 flex flex-col items-center min-w-[80px]">
								<div className="text-lg font-bold text-white mb-0.5">
									{activeWord.target.word}
								</div>
								<div className="text-sm font-mono tracking-wider flex">
									<span className="text-emerald-400">{typed}</span>
									<span className="text-slate-400">{remaining}</span>
								</div>
							</div>
						</div>
					);
				})}
			</div>

			{/* Game Over Screen */}
			{engine.status === "gameover" && (
				<div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center z-20">
					<h1 className="text-5xl font-black text-rose-500 mb-4 animate-pulse">
						GAME OVER
					</h1>
					<p className="text-2xl mb-8">FINAL SCORE: {engine.score}</p>
					<button
						type="button"
						className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold rounded shadow-lg transition-colors"
						onClick={() => window.location.reload()}
					>
						TRY AGAIN
					</button>
				</div>
			)}

			{/* Player Base / Earth */}
			<div className="absolute bottom-0 left-0 w-full h-4 bg-emerald-600/30 border-t border-emerald-500/50"></div>
		</main>
	);
}
