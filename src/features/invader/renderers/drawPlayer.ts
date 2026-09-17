import type { InvaderGameEngine } from "../../../entities/invader/domain/InvaderGameEngine";

/**
 * 画面下部のプレイヤー砲台を描画します。
 * ロックオン中の敵がいる場合は、その敵の方向へ砲塔が回転します。
 *
 * @param ctx 描画先の CanvasRenderingContext2D
 * @param width キャンバス幅 (px)
 * @param height キャンバス高さ (px)
 * @param engine ターゲット情報取得元の InvaderGameEngine
 */
export function drawPlayer(
	ctx: CanvasRenderingContext2D,
	width: number,
	height: number,
	engine: InvaderGameEngine,
): void {
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

	// 台座ベース
	ctx.fillStyle = "#00f3ff";
	ctx.fillRect(-18, -4, 36, 12);
	ctx.fillStyle = "#0284c7";
	ctx.fillRect(-12, -8, 24, 6);

	// 回転砲塔
	ctx.rotate(angle + Math.PI / 2);
	ctx.fillStyle = "#00ff66";
	ctx.fillRect(-4, -20, 8, 18);

	ctx.restore();
}
