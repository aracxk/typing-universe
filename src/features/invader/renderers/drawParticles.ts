import type { Particle } from "./constants";

/**
 * 指定した座標から放射状に飛散する爆発パーティクルを生成します。
 *
 * @param particles パーティクル配列
 * @param x 爆発の中心X座標 (px)
 * @param y 爆発の中心Y座標 (px)
 * @param color パーティクルの描画色（CSSカラー文字列）
 * @param count 生成するパーティクル数（デフォルト 24）
 */
export function spawnExplosion(
	particles: Particle[],
	x: number,
	y: number,
	color: string,
	count = 24,
): void {
	for (let i = 0; i < count; i++) {
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
}

/**
 * パーティクルの寿命・速度を更新し、透明度を適用して描画します。寿命を迎えたものは削除されます。
 *
 * @param ctx 描画先の CanvasRenderingContext2D
 * @param particles 更新・描画対象の Particle 配列
 */
export function drawParticles(
	ctx: CanvasRenderingContext2D,
	particles: Particle[],
): void {
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
}
