import { useCallback, useEffect, useRef } from "react";
import type { InvaderGameEngine } from "../../../entities/invader/domain/InvaderGameEngine";
import {
	CANVAS_COLORS,
	type Laser,
	type Particle,
	SPRITE_MATRICES,
	type Star,
} from "../renderers/constants";
import { drawInvaders } from "../renderers/drawInvaders";
import { drawLasers, fireLaser } from "../renderers/drawLasers";
import { drawParticles, spawnExplosion } from "../renderers/drawParticles";
import { drawPlayer } from "../renderers/drawPlayer";
import { drawScanlines } from "../renderers/drawScanlines";
import { drawStarfield, initStars } from "../renderers/drawStarfield";

/**
 * InvaderCanvas のコンポーネントProps。
 */
interface InvaderCanvasProps {
	/** ゲームエンジンのインスタンス */
	engine: InvaderGameEngine;
}

/**
 * インベーダーゲームの2Dグラフィック描画を担当するCanvasコンポーネント。
 *
 * 独立した requestAnimationFrame ループ内で星空、敵、レーザー、パーティクル、
 * プレイヤー砲台、CRTスキャンラインなどの各レンダラーを統括実行します。
 */
export function InvaderCanvas({ engine }: InvaderCanvasProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	// オフスクリーンキャンバスによるドット絵スプライトキャッシュ
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
			const p = type === 2 ? 4 : 3; // ピクセル幅 (ボスは大きく表示)
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
		const stars: Star[] = initStars(canvas.width, canvas.height, 70);

		let lastCorrectTyped = engine.correctTyped;

		const render = () => {
			time += 0.05;
			const width = canvas.width;
			const height = canvas.height;

			// 1. 背景のクリア
			ctx.fillStyle = CANVAS_COLORS.bg;
			ctx.fillRect(0, 0, width, height);

			// 2. 星空の描画
			drawStarfield(ctx, width, height, stars);

			// 3. レーザー発射判定（タイピング成功時）
			const focusedId = engine.focusedInvaderId;
			if (engine.correctTyped > lastCorrectTyped && focusedId) {
				const focused = engine.invaders.find((inv) => inv.id.equals(focusedId));
				if (focused)
					fireLaser(lasers, width, height, focused.x, focused.y + 10);
				lastCorrectTyped = engine.correctTyped;
			} else if (engine.correctTyped > lastCorrectTyped) {
				lastCorrectTyped = engine.correctTyped;
			}

			// 4. 撃破・被弾エフェクトの発生検知
			const currentInvaders = engine.invaders;
			const currentInvaderIds = new Set(
				currentInvaders.map((inv) => inv.id.value),
			);

			for (const [id, pos] of prevInvaders.entries()) {
				if (!currentInvaderIds.has(id)) {
					if (pos.y < height - 50) {
						spawnExplosion(particles, pos.x, pos.y, CANVAS_COLORS.emerald); // 撃破
					} else {
						spawnExplosion(particles, pos.x, pos.y, CANVAS_COLORS.rose); // 被弾
					}
				}
			}

			prevInvaders.clear();
			for (const invader of currentInvaders) {
				prevInvaders.set(invader.id.value, { x: invader.x, y: invader.y });
			}

			// 5. レーザー描画
			drawLasers(ctx, lasers);

			// 6. 敵インベーダー描画
			drawInvaders(ctx, engine, time, getCachedSprite);

			// 7. パーティクル描画
			drawParticles(ctx, particles);

			// 8. プレイヤー砲台描画
			drawPlayer(ctx, width, height, engine);

			// 9. クリティカル防衛ライン
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

			// 10. CRTスキャンライン
			drawScanlines(ctx, width, height);

			// 11. ゲームオーバー暗転判定
			if (engine.status === "gameover") {
				ctx.fillStyle = "rgba(15, 23, 42, 0.8)";
				ctx.fillRect(0, 0, width, height);
			} else {
				animationFrameId = requestAnimationFrame(render);
			}
		};

		// 初回描画ループ開始
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
