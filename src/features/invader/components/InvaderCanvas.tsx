import { useEffect, useRef } from "react";
import type { InvaderGameEngine } from "../../../entities/invader/domain/InvaderGameEngine";

interface InvaderCanvasProps {
	engine: InvaderGameEngine;
}

interface Particle {
	x: number;
	y: number;
	vx: number;
	vy: number;
	life: number;
	maxLife: number;
	color: string;
	size: number;
}

export function InvaderCanvas({ engine }: InvaderCanvasProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		let animationFrameId: number;
		const particles: Particle[] = [];
		const prevInvaders = new Map<string, { x: number; y: number }>();

		// レトロなCRT風のスキャンライン描画
		const drawScanlines = (
			ctx: CanvasRenderingContext2D,
			width: number,
			height: number,
		) => {
			ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
			for (let i = 0; i < height; i += 4) {
				ctx.fillRect(0, i, width, 1);
			}
		};

		const spawnExplosion = (x: number, y: number, color: string) => {
			for (let i = 0; i < 30; i++) {
				const angle = Math.random() * Math.PI * 2;
				const speed = Math.random() * 3 + 1;
				particles.push({
					x,
					y,
					vx: Math.cos(angle) * speed,
					vy: Math.sin(angle) * speed,
					life: 1.0,
					maxLife: Math.random() * 0.5 + 0.5,
					color,
					size: Math.random() * 3 + 1,
				});
			}
		};

		const render = () => {
			const width = canvas.width;
			const height = canvas.height;

			// 背景のクリア
			ctx.fillStyle = "#0f172a"; // slate-900
			ctx.fillRect(0, 0, width, height);

			// 状態の取得
			const currentInvaders = engine.invaders;
			const currentInvaderIds = new Set(
				currentInvaders.map((inv) => inv.id.value),
			);

			// 撃破判定（前回いて、今回いなくて、最下部に到達していないもの）
			for (const [id, pos] of prevInvaders.entries()) {
				if (!currentInvaderIds.has(id)) {
					if (pos.y < height - 20) {
						// 防衛ライン到達以外の消滅＝撃破とみなす
						spawnExplosion(pos.x, pos.y, "#34d399"); // emerald-400
					} else {
						// 防衛ライン到達（ダメージ）
						spawnExplosion(pos.x, pos.y, "#f43f5e"); // rose-500
					}
				}
			}

			// 現在の敵の位置を保存
			prevInvaders.clear();
			for (const invader of currentInvaders) {
				prevInvaders.set(invader.id.value, { x: invader.x, y: invader.y });
			}

			// 敵の描画
			ctx.textAlign = "center";
			for (const invader of currentInvaders) {
				const isFocused = engine.focusedInvaderId?.equals(invader.id);
				const activeWord = invader.activeWord;
				const currentIndex = activeWord.currentIndex;
				const readings = activeWord.target.readings[0];

				const typed = readings.slice(0, currentIndex);
				const remaining = readings.slice(currentIndex);

				// 敵のシンボル
				ctx.fillStyle = isFocused ? "#34d399" : "#94a3b8"; // emerald-400 or slate-400
				ctx.font = "bold 24px monospace";
				ctx.fillText("[v]", invader.x, invader.y - 10);

				// 日本語ターゲット（林檎など）
				ctx.fillStyle = "#ffffff";
				ctx.font = "bold 16px sans-serif";
				ctx.fillText(activeWord.target.word, invader.x, invader.y + 10);

				// ローマ字ターゲット
				ctx.font = "bold 14px monospace";
				const totalWidth = ctx.measureText(readings).width;
				let startX = invader.x - totalWidth / 2;

				ctx.textAlign = "left";
				ctx.fillStyle = "#34d399"; // emerald-400 (typed)
				ctx.fillText(typed, startX, invader.y + 30);

				startX += ctx.measureText(typed).width;
				ctx.fillStyle = "#94a3b8"; // slate-400 (remaining)
				ctx.fillText(remaining, startX, invader.y + 30);
				ctx.textAlign = "center"; // 戻す
			}

			// パーティクルの描画と更新
			for (let i = particles.length - 1; i >= 0; i--) {
				const p = particles[i];
				p.x += p.vx;
				p.y += p.vy;
				p.life -= 0.02;

				if (p.life <= 0) {
					particles.splice(i, 1);
					continue;
				}

				ctx.globalAlpha = p.life / p.maxLife;
				ctx.fillStyle = p.color;
				ctx.beginPath();
				ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
				ctx.fill();
				ctx.globalAlpha = 1.0;
			}

			// UI情報の描画 (Score, Lives)
			ctx.textAlign = "left";
			ctx.fillStyle = "#34d399";
			ctx.font = "bold 20px monospace";
			ctx.fillText(`SCORE: ${engine.score}`, 20, 30);

			ctx.textAlign = "right";
			ctx.fillStyle = "#f43f5e";
			ctx.fillText(
				`SHIELD: ${"[+] ".repeat(Math.max(0, engine.lives))}`,
				width - 20,
				30,
			);

			// 防衛ラインの描画
			ctx.fillStyle = "rgba(16, 185, 129, 0.2)"; // emerald-500 with opacity
			ctx.fillRect(0, height - 10, width, 10);
			ctx.fillStyle = "#10b981";
			ctx.fillRect(0, height - 10, width, 2);

			// CRTスキャンライン
			drawScanlines(ctx, width, height);

			// ゲームオーバー判定
			if (engine.status === "gameover") {
				ctx.fillStyle = "rgba(15, 23, 42, 0.8)";
				ctx.fillRect(0, 0, width, height);

				ctx.textAlign = "center";
				ctx.fillStyle = "#f43f5e";
				ctx.font = "black 48px sans-serif";
				ctx.fillText("GAME OVER", width / 2, height / 2 - 20);

				ctx.fillStyle = "#ffffff";
				ctx.font = "bold 24px monospace";
				ctx.fillText(
					`FINAL SCORE: ${engine.score}`,
					width / 2,
					height / 2 + 30,
				);
			}

			animationFrameId = requestAnimationFrame(render);
		};

		render();

		return () => cancelAnimationFrame(animationFrameId);
	}, [engine]);

	return (
		<canvas
			ref={canvasRef}
			width={600}
			height={600}
			className="w-full max-w-2xl mx-auto rounded-lg shadow-2xl border-4 border-slate-800 block"
		/>
	);
}
