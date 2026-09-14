import { Entity } from "../../../shared/domain/Entity";
import type { EntityId } from "../../../shared/domain/EntityId";
import type { TargetWord } from "./TargetWord";

export class ActiveWord extends Entity<EntityId> {
	private _typedString = "";

	private constructor(
		id: EntityId,
		public readonly target: TargetWord,
	) {
		super(id);
	}

	public static create(id: EntityId, target: TargetWord): ActiveWord {
		return new ActiveWord(id, target);
	}

	public type(inputChar: string): boolean {
		if (this.isCompleted()) {
			return false;
		}

		const nextString = this._typedString + inputChar.toLowerCase();

		// 次の入力文字列がいずれかの読みのプレフィックスに一致するか判定
		const isValid = this.target.readings.some((reading) =>
			reading.toLowerCase().startsWith(nextString),
		);

		if (isValid) {
			this._typedString = nextString;
			return true;
		}
		return false;
	}

	public isCompleted(): boolean {
		return this.target.readings.some(
			(reading) => reading.toLowerCase() === this._typedString,
		);
	}

	public get currentIndex(): number {
		return this._typedString.length;
	}
}
