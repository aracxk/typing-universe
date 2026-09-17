/**
 * 複数ゲーム間で共通して利用されるタイピング評価指標（メトリクス）。
 *
 * 打鍵の正誤からコンボ数、正確性、スコアの算出、およびプログラマーランクの評価を一元管理します。
 */
export class TypingMetrics {
	private _score = 0;
	private _combo = 0;
	private _maxCombo = 0;
	private _totalTyped = 0;
	private _correctTyped = 0;
	private _kills = 0; // 撃破/クリア回数

	/**
	 * 正しい打鍵として記録し、コンボを増加させます。
	 */
	public recordHit(): void {
		this._totalTyped++;
		this._correctTyped++;
		this._combo++;
		if (this._combo > this._maxCombo) {
			this._maxCombo = this._combo;
		}
	}

	/**
	 * 誤った打鍵として記録し、コンボをリセットします。
	 */
	public recordMiss(): void {
		this._totalTyped++;
		this._combo = 0;
	}

	/**
	 * ターゲット撃破時のスコア加算とキル数記録を行います。
	 *
	 * コンボ数に応じてスコアに倍率（Multiplier）がかかります。
	 * @param baseScore ターゲットの基礎スコア (0以上)
	 */
	public recordKill(baseScore: number): void {
		if (baseScore < 0) {
			throw new Error("baseScore must be greater than or equal to 0");
		}
		this._kills++;
		const multiplier = 1 + Math.floor(this._combo / 5) * 0.2;
		this._score += Math.round(baseScore * multiplier);
	}

	/**
	 * ライフ減少や防衛失敗などで強制的にコンボをリセットします。
	 */
	public resetCombo(): void {
		this._combo = 0;
	}

	get score(): number {
		return this._score;
	}

	get combo(): number {
		return this._combo;
	}

	get maxCombo(): number {
		return this._maxCombo;
	}

	get totalTyped(): number {
		return this._totalTyped;
	}

	get correctTyped(): number {
		return this._correctTyped;
	}

	get kills(): number {
		return this._kills;
	}

	/**
	 * 入力の正確性（%）を算出します。
	 */
	get accuracy(): number {
		if (this._totalTyped === 0) return 100;
		return Math.round((this._correctTyped / this._totalTyped) * 100);
	}

	/**
	 * スコアと正確性に基づき、プログラマーとしてのランクを決定します。
	 */
	get rank(): string {
		if (this._score >= 15000 && this.accuracy >= 95) return "S+ (GOD ENGINEER)";
		if (this._score >= 10000) return "S (TECH LEAD)";
		if (this._score >= 6000) return "A (SENIOR DEV)";
		if (this._score >= 3000) return "B (MID-LEVEL)";
		return "C (JUNIOR DEV)";
	}
}
