type Props = {
	soundEnabled: boolean;
	onToggleSound: () => void;
};

export function InvaderHeader({ soundEnabled, onToggleSound }: Props) {
	return (
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
					onClick={onToggleSound}
					className="px-3 py-1.5 rounded border border-cyan-800 hover:border-cyan-500 bg-slate-900 text-xs text-cyan-300 transition"
				>
					SOUND: {soundEnabled ? "[ON]" : "[OFF]"}
				</button>
			</div>
		</header>
	);
}
