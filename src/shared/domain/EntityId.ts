import { ValueObject } from "./ValueObject";

/**
 * エンティティの識別子（ID）の共通基底クラス
 */
export class EntityId extends ValueObject {
	private constructor(public readonly value: string) {
		super();
	}

	public static create(value: string): EntityId {
		return new EntityId(value);
	}

	public equals(other: this): boolean {
		if (other === null || other === undefined) {
			return false;
		}
		return this.value === other.value;
	}
}
