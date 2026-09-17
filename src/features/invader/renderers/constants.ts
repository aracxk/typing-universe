/**
 * 画面上の演出用パーティクル。
 */
export interface Particle {
	x: number;
	y: number;
	vx: number;
	vy: number;
	life: number;
	maxLife: number;
	color: string;
	size: number;
}

/**
 * プレイヤーから発射される迎撃レーザービーム。
 */
export interface Laser {
	startX: number;
	startY: number;
	targetX: number;
	targetY: number;
	progress: number;
	color: string;
}

/**
 * 背景の星。
 */
export interface Star {
	x: number;
	y: number;
	speed: number;
	size: number;
	alpha: number;
}

/**
 * インベーダーのドット絵マトリクス定義。
 * 0: クラシック風 (10x8)
 * 1: スパイダー型 (10x8)
 * 2: ボスバグ型 (10x8)
 */
export const SPRITE_MATRICES: readonly (readonly (readonly number[])[])[] = [
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

/**
 * ネオンアーケード配色のカラーパレット定数。
 */
export const CANVAS_COLORS = {
	bg: "#05070f",
	targetLock: "#00f3ff",
	emerald: "#00ff66",
	rose: "#ff0055",
	untyped: "#ffffff",
	typed: "#64748b",
	typingNext: "#00f3ff",
} as const;
