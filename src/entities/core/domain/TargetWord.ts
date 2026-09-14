/**
 * 出題される単語を表すValue Object
 */
export class TargetWord {
	constructor(
		public readonly word: string,
		public readonly reading: string, // 今回はシンプルにアルファベットの読みを直接保持すると仮定
	) {
		if (reading.length === 0) {
			throw new Error("TargetWord must have a reading");
		}
	}
}
