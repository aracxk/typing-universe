import { CANVAS_COLORS, type Laser } from "./constants";

/**
 * プレイヤーの砲台からターゲット敵へ向かうレーザーを追加します。
 *
 * @param lasers レーザー管理配列
 * @param canvasWidth キャンバス幅 (px)
 * @param canvasHeight キャンバス高さ (px)
 * @param targetX ターゲットのX座標 (px)
 * @param targetY ターゲットのY座標 (px)
 */
export function fireLaser(
	lasers: Laser[],
	canvasWidth: number,
	canvasHeight: number,
	targetX: number,
	targetY: number,
): void {
	lasers.push({
		startX: canvasWidth / 2,
		startY: canvasHeight - 18,
		targetX,
		targetY,
		progress: 0,
		color: CANVAS_COLORS.targetLock,
	});
}

/**
 * アクティブなレーザーの進行度を更新し、キャンバスに描画します。到達したレーザーは削除されます。
 *
 * @param ctx 描画先の CanvasRenderingContext2D
 * @param lasers 更新・描画対象の Laser 配列
 */
export function drawLasers(
	ctx: CanvasRenderingContext2D,
	lasers: Laser[],
): void {
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

		if (l.progress >= 1) {
			lasers.splice(i, 1);
		}
	}
}
