/**
 * すべての値オブジェクト（Value Object）の共通基底クラス
 *
 * 責務:
 * - 「同値性判定（equals）を持つこと」を型レベルで義務付ける。
 * - 状態変更メソッドを持たない完全不変（Immutable）な設計の目印（マーカー）となる。
 * - 余計な便利メソッドやDB依存を一切排除した、破綻しない薄い基底クラス。
 */
export abstract class ValueObject {
	/**
	 * 2つの値オブジェクトが「同じ値」を持っているかを判定する
	 */
	public abstract equals(other: this): boolean;
}
