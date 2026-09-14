/**
 * 成功または失敗を表す汎用の Result 型
 *
 * @template T 成功時の値の型
 * @template E 失敗時のエラーの型
 */
export type Result<T, E> =
	| { readonly success: true; readonly value: T }
	| { readonly success: false; readonly error: E };

/**
 * Result 型を簡単に生成するためのファクトリ関数群
 */
export const Result = {
	/**
	 * 成功した Result を生成する
	 */

	/**
	 * Result が成功している場合は値を返し、失敗している場合はエラーをスローする（主にテスト用・FailFast用）
	 */
	unwrap: <T, E>(result: Result<T, E>): T => {
		if (!result.success) {
			throw new Error(
				typeof result.error === "object" && result.error !== null
					? JSON.stringify(result.error)
					: String(result.error),
			);
		}
		return result.value;
	},

	ok: <T>(value: T): Result<T, never> => ({
		success: true,
		value,
	}),

	/**
	 * 失敗した Result を生成する
	 */
	err: <E>(error: E): Result<never, E> => ({
		success: false,
		error,
	}),
};
