import { Lock, Play, Rocket, TerminalSquare } from "lucide-react";
import Link from "next/link";

export type GameCardProps = {
	title: string;
	description: string;
	version?: string;
	status: "active" | "locked";
	difficulty?: string;
	minSpeed?: string;
	combatMode?: string;
	href?: string;
};

export const GameCard = ({
	title,
	description,
	version,
	status,
	difficulty,
	minSpeed,
	combatMode,
	href,
}: GameCardProps) => {
	const isLocked = status === "locked";

	const CardContent = () => (
		<div className="flex flex-col h-full rounded-lg border border-outline-variant/50 bg-surface-container-low/80 p-5 shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-primary-container hover:shadow-[0_0_25px_rgba(0,243,255,0.15)] relative overflow-hidden group">
			{/* Header */}
			<div className="flex items-center justify-between pb-3 border-b border-outline-variant/30 mb-4 relative z-10">
				<div className="flex items-center gap-2">
					<span
						className={`w-2 h-2 rounded-full ${isLocked ? "bg-error" : "bg-primary-container animate-pulse"}`}
					/>
					<span
						className={`text-xs font-mono font-bold ${isLocked ? "text-error" : "text-primary-container"}`}
					>
						{isLocked ? "開発中" : "稼働中"}
					</span>
				</div>
				{version && (
					<span className="px-2 py-0.5 rounded bg-surface-container border border-outline-variant/40 text-outline text-xs font-mono">
						{version}
					</span>
				)}
			</div>

			{/* Visual Banner */}
			<div className="relative h-40 rounded overflow-hidden border border-outline-variant/40 bg-surface-container mb-5 flex items-center justify-center">
				<div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/30 to-transparent z-10" />
				{isLocked ? (
					<Rocket className="w-16 h-16 text-outline opacity-50 relative z-0" />
				) : (
					<>
						<div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiMwYTBkMWEiPjwvcmVjdD48cGF0aCBkPSJNMCAwdjhINFYweiIgZmlsbD0iIzFhMjAyYyI+PC9wYXRoPjwvc3ZnPg==')] opacity-30 z-0" />
						<TerminalSquare className="w-20 h-20 text-secondary-container opacity-80 group-hover:scale-110 transition-transform duration-500 relative z-0" />
					</>
				)}

				<div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs font-mono z-20">
					{isLocked && (
						<span className="text-error bg-surface-container-lowest/80 px-2 py-0.5 rounded border border-error/30 flex items-center gap-1">
							<Lock className="w-3 h-3" /> ロックされています
						</span>
					)}
				</div>
			</div>

			{/* Info */}
			<div className="flex-1">
				<h3 className="font-display text-2xl font-bold text-primary tracking-tight mb-2">
					{title}
				</h3>
				<p className="text-sm text-on-surface-variant leading-relaxed mb-4">
					{description}
				</p>
			</div>

			{/* Metrics */}
			{!isLocked && (
				<div className="grid grid-cols-3 gap-2 pt-1 border-t border-outline-variant/30 mb-4">
					<div className="p-2 rounded bg-surface-container border border-outline-variant/30 text-center">
						<div className="text-outline text-[10px] font-mono">難易度</div>
						<div className="text-primary-container text-xs font-mono font-bold mt-1">
							{difficulty}
						</div>
					</div>
					<div className="p-2 rounded bg-surface-container border border-outline-variant/30 text-center">
						<div className="text-outline text-[10px] font-mono">推奨速度</div>
						<div className="text-secondary-container text-xs font-mono font-bold mt-1">
							{minSpeed}
						</div>
					</div>
					<div className="p-2 rounded bg-surface-container border border-outline-variant/30 text-center">
						<div className="text-outline text-[10px] font-mono">モード</div>
						<div className="text-primary text-xs font-mono font-bold mt-1">
							{combatMode}
						</div>
					</div>
				</div>
			)}

			{/* Action */}
			<div className="pt-4 border-t border-outline-variant/20 flex items-center justify-end">
				{isLocked ? (
					<button
						type="button"
						disabled
						className="px-6 py-2 rounded bg-surface-container text-outline text-sm font-bold tracking-wider border border-outline-variant/50 cursor-not-allowed flex items-center gap-2"
					>
						<Lock className="w-4 h-4" />
						ロック中
					</button>
				) : (
					<button
						type="button"
						className="px-6 py-2 rounded bg-primary-container text-on-primary text-sm font-bold tracking-wider shadow-[0_0_15px_rgba(0,243,255,0.4)] group-hover:scale-105 group-hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
					>
						<Play className="w-4 h-4" />
						プレイする
					</button>
				)}
			</div>
		</div>
	);

	if (isLocked || !href) {
		return (
			<div className="h-full">
				<CardContent />
			</div>
		);
	}

	return (
		<Link href={href} className="h-full block">
			<CardContent />
		</Link>
	);
};
