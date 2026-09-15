"use client";

import { useEffect, useState } from "react";
import { InvaderCanvas } from "../../../features/invader/components/InvaderCanvas";
import { useInvaderGame } from "../../../features/invader/hooks/useInvaderGame";

export default function InvaderGamePage() {
	const { engine, sound } = useInvaderGame();
	const [soundEnabled, setSoundEnabled] = useState(true);
	const [hasStarted, setHasStarted] = useState(false);

	// 初回起動時用の状態同期
	useEffect(() => {
		if (engine.status === "playing" && engine.score > 0) {
			setHasStarted(true);
		}
	}, [engine.status, engine.score]);

	const toggleSound = () => {
		const enabled = sound.toggle();
		setSoundEnabled(enabled);
	};

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
		<main className="min-h-screen flex flex-col items-center justify-center p-2 sm:p-6 bg-[#05070f] text-slate-200 font-mono overflow-x-hidden selection:bg-cyan-900">
			{/* Header */}
			<header className="w-full max-w-5xl mb-4 flex items-center justify-between">
				<div className="flex items-center space-x-3">
					<div className="w-8 h-8 rounded bg-gradient-to-br from-[#00f3ff] to-[#00ff66] flex items-center justify-center text-black font-bold text-sm shadow-lg">
						B
					</div>
					<div>
						<span className="text-xs text-[#00f3ff] tracking-wider block font-bold">
							BUG INVADERS
						</span>
						<span className="text-[10px] text-slate-400 block">
							TYPING DEFENSE v2.0
						</span>
					</div>
				</div>
				<div>
					<button
						type="button"
						onClick={toggleSound}
						className="px-3 py-1.5 rounded border border-cyan-800 hover:border-cyan-500 bg-slate-900 text-xs text-cyan-300 transition"
					>
						SOUND: {soundEnabled ? "[ON]" : "[OFF]"}
					</button>
				</div>
			</header>

			{/* Arcade Bezel */}
			<div className="w-full max-w-4xl relative border-[12px] border-[#1a202c] rounded-[18px] bg-black overflow-hidden flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_30px_rgba(0,243,255,0.2)]">
				{/* HUD */}
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

				{/* Game Area */}
				<div className="relative w-full aspect-[4/3] bg-[#05070f]">
					<InvaderCanvas engine={engine} />

					{/* Start Screen */}
					{engine.status === "playing" && !hasStarted && engine.score === 0 && (
						<div className="absolute inset-0 z-30 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
							<div className="mb-3 px-3 py-1 border border-[#00ff66]/40 rounded-full text-[#00ff66] text-xs tracking-widest animate-pulse">
								{"SYSTEM READY // WAITING FOR PILOT"}
							</div>
							<h1
								className="text-4xl text-[#00f3ff] font-bold mb-2 tracking-widest"
								style={{ textShadow: "0 0 10px rgba(0,243,255,0.7)" }}
							>
								BUG INVADERS
							</h1>
							<p className="text-sm text-slate-300 max-w-lg mb-8">
								本番サーバーにバグの大群が接近中！
								<br />
								迫りくるエラーを
								<span className="text-[#ffe600] font-bold">
									タイピングで迎撃
								</span>
								し、拠点を防衛せよ。
							</p>
							<div className="px-8 py-4 bg-[#00ff66] text-black font-bold rounded shadow-[0_0_20px_rgba(0,255,102,0.6)] animate-bounce">
								PRESS [SPACE] TO START
							</div>
						</div>
					)}

					{/* Game Over Screen */}
					{engine.status === "gameover" && (
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
									<span className="text-[#00ff66] font-bold">
										{engine.kills}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-slate-400">ACCURACY (正解率)</span>
									<span className="text-[#00f3ff] font-bold">
										{engine.accuracy}%
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-slate-400">MAX COMBO</span>
									<span className="text-[#ff0055] font-bold">
										{engine.maxCombo}
									</span>
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
					)}
				</div>

				{/* Lock-on Bar */}
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
			</div>
		</main>
	);
}
