import "server-only";

interface RateLimitBucket {
	count: number;
	resetAtMs: number;
}

const buckets = new Map<string, RateLimitBucket>();
const MAX_BUCKETS = 1024;

/**
 * 同一識別子（IPアドレス等）からの過剰なAPIリクエストを抑制するベストエフォートのインメモリ・レートリミッター。
 *
 * @param key クライアント識別子（IPアドレスなど）
 * @param windowMs カウント対象の時間ウィンドウ（ミリ秒）
 * @param maxRequests 時間ウィンドウ内の最大許可リクエスト数
 * @param nowMs 現在時刻（ミリ秒、省略時は Date.now()）
 * @returns 許可される場合は true、制限超過時は false
 */
export function checkRateLimit(
	key: string,
	windowMs: number,
	maxRequests: number,
	nowMs: number = Date.now(),
): boolean {
	if (buckets.size >= MAX_BUCKETS) {
		for (const [k, bucket] of buckets) {
			if (bucket.resetAtMs <= nowMs) {
				buckets.delete(k);
			}
		}
	}

	const current = buckets.get(key);
	if (!current || current.resetAtMs <= nowMs) {
		buckets.set(key, {
			count: 1,
			resetAtMs: nowMs + windowMs,
		});
		return true;
	}

	if (current.count >= maxRequests) {
		return false;
	}

	current.count += 1;
	return true;
}
