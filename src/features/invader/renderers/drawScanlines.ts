/**
 * レトロアーケードCRTモニター風のスキャンライン（走査線）を描画します。
 *
 * @param ctx 描画先の CanvasRenderingContext2D
 * @param width キャンバス幅 (px)
 * @param height キャンバス高さ (px)
 */
export function drawScanlines(
	ctx: CanvasRenderingContext2D,
	width: number,
	height: number,
): void {
	ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
	for (let i = 0; i < height; i += 4) {
		ctx.fillRect(0, i, width, 1);
	}
}
