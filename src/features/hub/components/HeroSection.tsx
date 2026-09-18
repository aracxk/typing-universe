export const HeroSection = () => {
	return (
		<section className="relative pt-24 pb-16 flex flex-col items-center justify-center text-center overflow-hidden z-10 border-b border-outline-variant/30">
			{/* Background Cyber Grid */}
			<div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik0wIDAuNWg0MCIgc3Ryb2tlPSJyZ2JhKDAsIDI0MywgMjU1LCAwLjA1KSIvPjxwYXRoIGQ9Ik0wLjUgMHY0MCIgc3Ryb2tlPSJyZ2JhKDAsIDI0MywgMjU1LCAwLjA1KSIvPjwvc3ZnPg==')] pointer-events-none" />

			{/* Ambient Glow */}
			<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-container/20 rounded-full blur-[120px] pointer-events-none" />

			<div className="relative z-10 px-4">
				<div className="mb-4 inline-flex items-center gap-2 px-3 py-1 rounded bg-surface-container border border-primary-container/40 text-primary-container font-mono text-xs">
					<span className="w-2 h-2 rounded-full bg-primary-container animate-pulse" />
					<span>システムオンライン</span>
				</div>

				<h1
					className="font-display text-5xl md:text-7xl font-bold tracking-widest mb-6 text-transparent bg-clip-text bg-gradient-to-b from-primary to-primary-container"
					style={{ textShadow: "0 0 40px rgba(0,243,255,0.3)" }}
				>
					TYPING UNIVERSE
				</h1>

				<p className="max-w-2xl mx-auto text-on-surface-variant text-lg md:text-xl font-body leading-relaxed mb-10">
					複数のタイピングゲームを統合したプラットフォーム。
					<br />
					迫りくるバグを迎撃し、ハッカーとしての腕を磨け。
				</p>
			</div>
		</section>
	);
};
