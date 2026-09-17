import type { InvaderGameEngine } from "../../../entities/invader/domain/InvaderGameEngine";
import { CANVAS_COLORS } from "./constants";

/**
 * 画面上のすべての敵インベーダー、ロックオン枠、タイピング単語バブルを描画します。
 *
 * @param ctx 描画先の CanvasRenderingContext2D
 * @param engine 敵リストおよびロックオン状態取得元の InvaderGameEngine
 * @param time アニメーション用の経過時間係数
 * @param getCachedSprite ドット絵スプライトキャッシュを取得する関数
 */
export function drawInvaders(
	ctx: CanvasRenderingContext2D,
	engine: InvaderGameEngine,
	time: number,
	getCachedSprite: (
		type: number,
		color: string,
		isTarget: boolean,
	) => HTMLCanvasElement,
): void {
	ctx.textAlign = "center";

	for (const invader of engine.invaders) {
		const isTarget = engine.focusedInvaderId?.equals(invader.id) || false;
		const wordLength = invader.activeWord.target.word.length;
		const type = wordLength > 7 ? 2 : wordLength > 4 ? 1 : 0;
		const bugColor =
			type === 2
				? CANVAS_COLORS.rose
				: type === 1
					? CANVAS_COLORS.targetLock
					: CANVAS_COLORS.emerald;

		// 上下の浮遊アニメーション
		const bobY = invader.y + Math.sin(time + invader.x) * 4;

		ctx.save();
		ctx.translate(invader.x, bobY);

		// キャッシュされたドット絵を描画
		const sprite = getCachedSprite(type, bugColor, isTarget);
		ctx.drawImage(sprite, -sprite.width / 2, -sprite.height / 2);

		// ロックオン枠の描画
		if (isTarget) {
			ctx.strokeStyle = CANVAS_COLORS.targetLock;
			ctx.lineWidth = 1.5;
			ctx.strokeRect(-28, -24, 56, 48);
			ctx.fillStyle = CANVAS_COLORS.targetLock;
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
			? CANVAS_COLORS.targetLock
			: "rgba(255, 255, 255, 0.2)";
		ctx.lineWidth = 1;
		ctx.fillRect(-textWidth / 2 - 8, bubbleY - 14, textWidth + 16, 20);
		ctx.strokeRect(-textWidth / 2 - 8, bubbleY - 14, textWidth + 16, 20);

		// 読み仮名の文字ごとの進捗色分け（済・次・未）
		let curX = -textWidth / 2;
		ctx.textAlign = "left";
		for (let i = 0; i < readings.length; i++) {
			const char = readings[i];
			const w = ctx.measureText(char).width;

			if (isTarget) {
				if (i < activeWord.currentIndex) {
					ctx.fillStyle = CANVAS_COLORS.typed; // 入力済み
				} else if (i === activeWord.currentIndex) {
					ctx.fillStyle = CANVAS_COLORS.typingNext; // 次に入力すべき文字
				} else {
					ctx.fillStyle = CANVAS_COLORS.untyped; // 未入力
				}
			} else {
				ctx.fillStyle = i === 0 ? "#ffe600" : "#cbd5e1"; // ターゲット外
			}

			ctx.fillText(char, curX, bubbleY);
			curX += w;
		}

		// 画面上部に日本語表記を表示
		ctx.fillStyle = "#ffffff";
		ctx.font = "bold 12px sans-serif";
		ctx.textAlign = "center";
		ctx.fillText(activeWord.target.word, 0, -32);

		ctx.restore();
	}
}
