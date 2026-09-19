import { HeroSection } from "../features/hub/components/HeroSection";
import { ThemeToggle } from "../features/hub/components/ThemeToggle";
import { GAMES } from "../features/hub/data/games";
import { GameCard } from "../shared/ui/GameCard";

export default function Home() {
	return (
		<main className="min-h-screen flex flex-col bg-background text-on-background font-body selection:bg-primary-container/30">
			{/* HUD Navigation (簡易版) */}
			<header className="fixed top-0 w-full h-14 bg-surface-container-lowest/80 backdrop-blur-md border-b border-outline-variant/40 z-50 flex items-center px-6 justify-between">
				<div className="font-display font-bold text-primary tracking-widest text-lg">
					TYPING UNIVERSE
				</div>
				<div className="flex items-center gap-6">
					<div className="hidden md:flex gap-6 font-mono text-xs text-outline">
						<span className="text-primary-container">ゲーム</span>
						<span className="hover:text-on-surface cursor-pointer">
							ランキング
						</span>
						<span className="hover:text-on-surface cursor-pointer">ログ</span>
					</div>
					<ThemeToggle />
				</div>
			</header>

			<HeroSection />

			{/* Game Cards Section */}
			<section className="flex-1 w-full max-w-7xl mx-auto px-6 py-16 relative z-10">
				<div className="flex items-center gap-4 mb-8 border-b border-outline-variant/20 pb-4">
					<h2 className="font-display text-2xl font-bold text-primary">
						ゲーム一覧
					</h2>
					<div className="hidden md:flex gap-2">
						<span className="px-3 py-1 rounded bg-surface-container text-primary-container font-mono text-xs border border-primary-container/30">
							すべて
						</span>
						<span className="px-3 py-1 rounded bg-surface-container-low text-outline font-mono text-xs border border-outline-variant/30 hover:border-outline-variant cursor-pointer">
							防衛
						</span>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{GAMES.map((game) => (
						<GameCard key={game.title} {...game} />
					))}
				</div>
			</section>

			{/* Footer */}
			<footer className="border-t border-outline-variant/30 bg-surface-container-lowest py-6 px-6 text-outline text-xs">
				<div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
					<div className="flex items-center gap-3">
						<span className="font-display text-primary font-bold">
							TYPING UNIVERSE
						</span>
						<span className="text-outline-variant">|</span>
						<span className="font-mono">Typing Universe v1.0.0</span>
					</div>
					<div className="flex items-center gap-2 font-mono">
						<span className="w-1.5 h-1.5 rounded-full bg-secondary-fixed" />
						<span className="text-secondary-fixed">全システム正常稼働中</span>
					</div>
				</div>
			</footer>
		</main>
	);
}
