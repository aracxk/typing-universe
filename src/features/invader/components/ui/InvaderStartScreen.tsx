interface Props {
	isReady?: boolean;
}

export function InvaderStartScreen({ isReady = true }: Props) {
	return (
		<div className="absolute inset-0 z-30 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
			<div className="mb-3 px-3 py-1 border border-[#00ff66]/40 rounded-full text-[#00ff66] text-xs tracking-widest animate-pulse">
				{isReady
					? "SYSTEM READY // WAITING FOR PILOT"
					: "SYSTEM BOOTING // LOADING DATA..."}
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
				<span className="text-[#ffe600] font-bold">タイピングで迎撃</span>
				し、拠点を防衛せよ。
			</p>
			{isReady ? (
				<div className="px-8 py-4 bg-[#00ff66] text-black font-bold rounded shadow-[0_0_20px_rgba(0,255,102,0.6)] animate-bounce">
					PRESS [SPACE] TO START
				</div>
			) : (
				<div className="px-8 py-4 bg-slate-700 text-slate-400 font-bold rounded">
					LOADING DATA...
				</div>
			)}
		</div>
	);
}
