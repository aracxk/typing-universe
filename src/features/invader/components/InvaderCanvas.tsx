import { useCallback, useEffect, useRef } from "react";
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

interface Laser {
	startX: number;
	startY: number;
	targetX: number;
	targetY: number;
	progress: number;
	color: string;
}

// ドット絵の定義
const SPRITE_MATRICES = [
	// Type 0: クラシックインベーダー風 (10x8)
	[
		[0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
		[0, 0, 0, 1, 0, 0, 1, 0, 0, 0],
		[0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
		[0, 1, 1, 0, 1, 1, 0, 1, 1, 0],
		[1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
		[1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
		[1, 0, 1, 0, 0, 0, 0, 1, 0, 1],
		[0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
	],
	// Type 1: スパイダー型 (10x8)
	[
		[0, 1, 0, 0, 0, 0, 0, 0, 1, 0],
		[0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
		[0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
		[1, 1, 0, 1, 1, 1, 1, 0, 1, 1],
		[1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
		[0, 0, 1, 1, 0, 0, 1, 1, 0, 0],
		[0, 1, 0, 0, 0, 0, 0, 0, 1, 0],
		[1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
	],
	// Type 2: ボスバグ (10x8)
	[
		[0, 1, 1, 0, 0, 0, 0, 1, 1, 0],
		[1, 1, 1, 1, 0, 0, 1, 1, 1, 1],
		[1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
		[1, 0, 1, 1, 0, 0, 1, 1, 0, 1],
		[1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
		[0, 1, 0, 1, 1, 1, 1, 0, 1, 0],
		[1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
		[0, 1, 1, 0, 0, 0, 0, 1, 1, 0],
	],
];

// 色定数
const COLORS = {
	bg: "#05070f",
	targetLock: "#00f3ff",
	emerald: "#00ff66",
	rose: "#ff0055",
	untyped: "#ffffff",
	typed: "#64748b",
	typingNext: "#00f3ff",
};

export function InvaderCanvas({ engine }: InvaderCanvasProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	// オフスクリーンキャンバスによるスプライトキャッシュ
	const spriteCacheRef = useRef<Map<string, HTMLCanvasElement>>(new Map());

	// 描画キャッシュの生成
	const getCachedSprite = useCallback(
		(type: number, color: string, isTarget: boolean) => {
			const key = `${type}-${color}-${isTarget}`;
			const cached = spriteCacheRef.current.get(key);
			if (cached) {
				return cached;
			}

			const cacheCanvas = document.createElement("canvas");
			const p = type === 2 ? 4 : 3; // 1ピクセル幅 (ボスは少し大きい)
			const matrix = SPRITE_MATRICES[type];
			const rows = matrix.length;
			const cols = matrix[0].length;
			cacheCanvas.width = cols * p;
			cacheCanvas.height = rows * p;

			const ctx = cacheCanvas.getContext("2d");
			if (ctx) {
				ctx.fillStyle = isTarget ? "#ffffff" : color;
				for (let r = 0; r < rows; r++) {
					for (let c = 0; c < cols; c++) {
						if (matrix[r][c] === 1) {
							ctx.fillRect(c * p, r * p, p, p);
						}
					}
				}
			}

			spriteCacheRef.current.set(key, cacheCanvas);
			return cacheCanvas;
		},
		[],
	);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		let animationFrameId: number;
		let time = 0;
		const particles: Particle[] = [];
		const lasers: Laser[] = [];
		const prevInvaders = new Map<string, { x: number; y: number }>();
		const stars: {
			x: number;
			y: number;
			speed: number;
			size: number;
			alpha: number;
		}[] = [];

		let lastCorrectTyped = engine.correctTyped;

		// 星の初期化
		for (let i = 0; i < 70; i++) {
			stars.push({
				x: Math.random() * canvas.width,
				y: Math.random() * canvas.height,
				speed: Math.random() * 1.5 + 0.3,
				size: Math.random() * 1.8 + 0.5,
				alpha: Math.random() * 0.7 + 0.3,
			});
		}

		const drawScanlines = (
			ctx: CanvasRenderingContext2D,
			width: number,
			height: number,
		) => {
			// 走査線を描画（半透明の黒線）
			ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
			for (let i = 0; i < height; i += 4) {
				ctx.fillRect(0, i, width, 1);
			}
		};

		const spawnExplosion = (x: number, y: number, color: string) => {
			for (let i = 0; i < 24; i++) {
				const angle = Math.random() * Math.PI * 2;
				const speed = Math.random() * 4 + 1.5;
				particles.push({
					x,
					y,
					vx: Math.cos(angle) * speed,
					vy: Math.sin(angle) * speed,
					life: 1.0,
					maxLife: Math.random() * 0.5 + 0.5,
					color,
					size: Math.random() * 3 + 1.5,
				});
			}
		};

		const fireLaser = (targetX: number, targetY: number) => {
			lasers.push({
				startX: canvas.width / 2,
				startY: canvas.height - 18,
				targetX,
				targetY,
				progress: 0,
				color: COLORS.targetLock,
			});
		};

		const render = () => {
			time += 0.05;
			const width = canvas.width;
			const height = canvas.height;

			// 背景のクリア
			ctx.fillStyle = COLORS.bg;
			ctx.fillRect(0, 0, width, height);

			// 星の描画と更新
			ctx.fillStyle = "#ffffff";
			for (const star of stars) {
				star.y += star.speed;
				if (star.y > height) {
					star.y = 0;
					star.x = Math.random() * width;
				}
				ctx.globalAlpha = star.alpha;
				ctx.fillRect(star.x, star.y, star.size, star.size);
			}
			ctx.globalAlpha = 1.0;

			const focusedId = engine.focusedInvaderId;
			if (engine.correctTyped > lastCorrectTyped && focusedId) {
				const focused = engine.invaders.find((inv) => inv.id.equals(focusedId));
				if (focused) fireLaser(focused.x, focused.y + 10);
				lastCorrectTyped = engine.correctTyped;
			} else if (engine.correctTyped > lastCorrectTyped) {
				lastCorrectTyped = engine.correctTyped; // 見失った場合のフォールバック
			}

			// 状態の取得
			const currentInvaders = engine.invaders;
			const currentInvaderIds = new Set(
				currentInvaders.map((inv) => inv.id.value),
			);

			// 撃破・被弾エフェクトの発生判定
			for (const [id, pos] of prevInvaders.entries()) {
				if (!currentInvaderIds.has(id)) {
					if (pos.y < height - 50) {
						spawnExplosion(pos.x, pos.y, COLORS.emerald); // 撃破
					} else {
						spawnExplosion(pos.x, pos.y, COLORS.rose); // 被弾
					}
				}
			}

			prevInvaders.clear();
			for (const invader of currentInvaders) {
				prevInvaders.set(invader.id.value, { x: invader.x, y: invader.y });
			}

			// レーザーの更新と描画
			for (let i = lasers.length - 1; i >= 0; i--) {
				const l = lasers[i];
				l.progress += 0.25;

				ctx.strokeStyle = l.color;
				ctx.lineWidth = 3;
				ctx.beginPath();
				ctx.moveTo(l.startX, l.startY);
				const curX = l.startX + (l.targetX - l.startX) * l.progress;
				const curY = l.startY + (l.targetY - l.startY) * l.progress;
				ctx.lineTo(curX, curY);
				ctx.stroke();

				ctx.fillStyle = "#ffffff";
				ctx.beginPath();
				ctx.arc(curX, curY, 4, 0, Math.PI * 2);
				ctx.fill();

				if (l.progress >= 1) lasers.splice(i, 1);
			}

			// 敵の描画
			ctx.textAlign = "center";
			for (const invader of currentInvaders) {
				const isTarget = engine.focusedInvaderId?.equals(invader.id) || false;
				const wordLength = invader.activeWord.target.word.length;
				const type = wordLength > 7 ? 2 : wordLength > 4 ? 1 : 0;
				const bugColor =
					type === 2
						? COLORS.rose
						: type === 1
							? COLORS.targetLock
							: COLORS.emerald;

				// ふわふわアニメーション
				const bobY = invader.y + Math.sin(time + invader.x) * 4;

				ctx.save();
				ctx.translate(invader.x, bobY);

				// キャッシュされたドット絵を描画
				const sprite = getCachedSprite(type, bugColor, isTarget);
				ctx.drawImage(sprite, -sprite.width / 2, -sprite.height / 2);

				// ロックオン枠
				if (isTarget) {
					ctx.strokeStyle = COLORS.targetLock;
					ctx.lineWidth = 1.5;
					ctx.strokeRect(-28, -24, 56, 48);
					ctx.fillStyle = COLORS.targetLock;
					ctx.fillRect(-30, -26, 6, 2);
					ctx.fillRect(-30, -26, 2, 6);
					ctx.fillRect(24, -26, 6, 2);
					ctx.fillRect(28, -26, 2, 6);
				}

				// 単語バブルの描画
				const activeWord = invader.activeWord;
				const readings = activeWord.target.readings[0];

				ctx.font = 'bold 14px "Share Tech Mono", monospace';
				const textWidth = ctx.measureText(readings).width;
				const bubbleY = 28;

				ctx.fillStyle = isTarget
					? "rgba(0, 15, 30, 0.9)"
					: "rgba(10, 15, 26, 0.75)";
				ctx.strokeStyle = isTarget
					? COLORS.targetLock
					: "rgba(255, 255, 255, 0.2)";
				ctx.lineWidth = 1;
				ctx.fillRect(-textWidth / 2 - 8, bubbleY - 14, textWidth + 16, 20);
				ctx.strokeRect(-textWidth / 2 - 8, bubbleY - 14, textWidth + 16, 20);

				let curX = -textWidth / 2;
				ctx.textAlign = "left";
				for (let i = 0; i < readings.length; i++) {
					const char = readings[i];
					const w = ctx.measureText(char).width;

					if (isTarget) {
						if (i < activeWord.currentIndex) {
							ctx.fillStyle = COLORS.typed; // 済
						} else if (i === activeWord.currentIndex) {
							ctx.fillStyle = COLORS.typingNext; // 次
						} else {
							ctx.fillStyle = COLORS.untyped; // 未
						}
					} else {
						ctx.fillStyle = i === 0 ? "#ffe600" : "#cbd5e1"; // ターゲット外
					}

					ctx.fillText(char, curX, bubbleY);
					curX += w;
				}

				// 画面上部に日本語ターゲット
				ctx.fillStyle = "#ffffff";
				ctx.font = "bold 12px sans-serif";
				ctx.textAlign = "center";
				ctx.fillText(activeWord.target.word, 0, -32);

				ctx.restore();
			}

			// パーティクルの更新と描画
			for (let i = particles.length - 1; i >= 0; i--) {
				const p = particles[i];
				p.x += p.vx;
				p.y += p.vy;
				p.life -= 0.03;

				if (p.life <= 0) {
					particles.splice(i, 1);
					continue;
				}

				ctx.globalAlpha = p.life / p.maxLife;
				ctx.fillStyle = p.color;
				ctx.fillRect(p.x, p.y, p.size, p.size);
				ctx.globalAlpha = 1.0;
			}

			// 砲台（プレイヤー）の描画
			const cx = width / 2;
			const cy = height - 18;
			let angle = -Math.PI / 2;
			const targetId = engine.focusedInvaderId;
			if (targetId) {
				const target = engine.invaders.find((i) => i.id.equals(targetId));
				if (target) {
					angle = Math.atan2(target.y - cy, target.x - cx);
				}
			}

			ctx.save();
			ctx.translate(cx, cy);
			ctx.fillStyle = "#00f3ff";
			ctx.fillRect(-18, -4, 36, 12);
			ctx.fillStyle = "#0284c7";
			ctx.fillRect(-12, -8, 24, 6);
			ctx.rotate(angle + Math.PI / 2);
			ctx.fillStyle = "#00ff66";
			ctx.fillRect(-4, -20, 8, 18);
			ctx.restore();

			// 防衛ラインの描画
			const lineY = height - 50;
			ctx.strokeStyle = "rgba(255, 0, 85, 0.4)";
			ctx.lineWidth = 2;
			ctx.setLineDash([8, 8]);
			ctx.beginPath();
			ctx.moveTo(0, lineY);
			ctx.lineTo(width, lineY);
			ctx.stroke();
			ctx.setLineDash([]);
			ctx.font = '10px "Share Tech Mono", monospace';
			ctx.fillStyle = "rgba(255, 0, 85, 0.7)";
			ctx.fillText("CRITICAL DEFENSE PERIMETER", 15, lineY - 6);

			// CRTスキャンライン
			drawScanlines(ctx, width, height);

			// ゲームオーバー判定
			if (engine.status === "gameover") {
				ctx.fillStyle = "rgba(15, 23, 42, 0.8)";
				ctx.fillRect(0, 0, width, height);
			} else {
				animationFrameId = requestAnimationFrame(render);
			}
		};

		// 初期描画の開始
		render();

		return () => {
			if (animationFrameId) cancelAnimationFrame(animationFrameId);
		};
	}, [engine, getCachedSprite]);

	return (
		<canvas
			ref={canvasRef}
			width={800}
			height={600}
			className="w-full h-full block cursor-crosshair"
		/>
	);
}
