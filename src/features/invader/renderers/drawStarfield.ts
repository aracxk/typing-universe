import type { Star } from "./constants";

/**
 * 星空エフェクトの初期配列を生成します。
 *
 * @param width キャンバスの横幅 (px)
 * @param height キャンバスの縦幅 (px)
 * @param count 生成する星の総数
 * @returns 初期化された Star 配列
 */
export function initStars(width: number, height: number, count = 70): Star[] {
	const stars: Star[] = [];
	for (let i = 0; i < count; i++) {
		stars.push({
			x: Math.random() * width,
			y: Math.random() * height,
			speed: Math.random() * 1.5 + 0.3,
			size: Math.random() * 1.8 + 0.5,
			alpha: Math.random() * 0.7 + 0.3,
		});
	}
	return stars;
}

/**
 * 星空の位置を更新し、キャンバスに描画します。
 *
 * @param ctx 描画先の CanvasRenderingContext2D
 * @param width キャンバス幅 (px)
 * @param height キャンバス高さ (px)
 * @param stars 更新・描画対象の Star 配列
 */
export function drawStarfield(
	ctx: CanvasRenderingContext2D,
	width: number,
	height: number,
	stars: Star[],
): void {
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
}
