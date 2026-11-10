import { describe, expect, it } from "vitest";
import { Nickname } from "../../../../src/entities/ranking/domain/Nickname";
import { DOMAIN_ERROR_CODES } from "../../../../src/shared/domain/DomainErrorCode";

describe("Nickname (値オブジェクト)", () => {
	it("1文字から12文字の有効な文字列を渡した場合、Nicknameインスタンスが生成される", () => {
		// Arrange
		const minInput = "A";
		const maxInput = "あいうえお1234567";

		// Act
		const minResult = Nickname.create(minInput);
		const maxResult = Nickname.create(maxInput);

		// Assert
		expect(minResult.success).toBe(true);
		if (minResult.success) {
			expect(minResult.value.value).toBe("A");
		}
		expect(maxResult.success).toBe(true);
		if (maxResult.success) {
			expect(maxResult.value.value).toBe("あいうえお1234567");
		}
	});

	it("全角英数字や前後空白が含まれる場合、NFKC正規化およびトリムされた値になる", () => {
		// Arrange
		const rawInput = "  Ｔｙｐｅｒ＿０１  ";

		// Act
		const result = Nickname.create(rawInput);

		// Assert
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.value.value).toBe("Typer_01");
		}
	});

	it("空文字または13文字以上の文字列を渡した場合、INVALID_NICKNAME_LENGTHエラーになる", () => {
		// Arrange
		const emptyInput = "   ";
		const tooLongInput = "1234567890123";

		// Act
		const emptyResult = Nickname.create(emptyInput);
		const tooLongResult = Nickname.create(tooLongInput);

		// Assert
		expect(emptyResult.success).toBe(false);
		if (!emptyResult.success) {
			expect(emptyResult.error.code).toBe(
				DOMAIN_ERROR_CODES.INVALID_NICKNAME_LENGTH,
			);
		}
		expect(tooLongResult.success).toBe(false);
		if (!tooLongResult.success) {
			expect(tooLongResult.error.code).toBe(
				DOMAIN_ERROR_CODES.INVALID_NICKNAME_LENGTH,
			);
		}
	});

	it("HTMLタグ記号や制御文字などの禁止文字が含まれる場合、INVALID_NICKNAME_CHARACTERSエラーになる", () => {
		// Arrange
		const scriptInput = "<script>";
		const controlInput = "user\u0000name";

		// Act
		const scriptResult = Nickname.create(scriptInput);
		const controlResult = Nickname.create(controlInput);

		// Assert
		expect(scriptResult.success).toBe(false);
		if (!scriptResult.success) {
			expect(scriptResult.error.code).toBe(
				DOMAIN_ERROR_CODES.INVALID_NICKNAME_CHARACTERS,
			);
		}
		expect(controlResult.success).toBe(false);
		if (!controlResult.success) {
			expect(controlResult.error.code).toBe(
				DOMAIN_ERROR_CODES.INVALID_NICKNAME_CHARACTERS,
			);
		}
	});

	it("NGワードが含まれる場合、大文字小文字を問わずPROHIBITED_NICKNAMEエラーになる", () => {
		// Arrange
		const adminInput = "SuperAdmin1";

		// Act
		const result = Nickname.create(adminInput);

		// Assert
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.code).toBe(DOMAIN_ERROR_CODES.PROHIBITED_NICKNAME);
		}
	});

	it("同一の正規化文字列で生成した場合、Flyweightキャッシュにより同一参照のインスタンスが返る", () => {
		// Arrange
		const firstInput = "CyberPlayer";
		const secondInput = "  CyberPlayer  ";

		// Act
		const first = Nickname.create(firstInput);
		const second = Nickname.create(secondInput);

		// Assert
		expect(first.success && second.success).toBe(true);
		if (first.success && second.success) {
			expect(first.value).toBe(second.value);
			expect(first.value.equals(second.value)).toBe(true);
		}
	});

	it("キャッシュ上限(256件)を超えて新規生成した場合、最古のエントリが破棄され正常に新しいインスタンスが生成される", () => {
		// Arrange & Act
		for (let i = 0; i < 260; i++) {
			const res = Nickname.create(`Player_${i}`);
			expect(res.success).toBe(true);
		}
		const latest = Nickname.create("Player_260");

		// Assert
		expect(latest.success).toBe(true);
	});

	it("equalsで異なる値のNicknameまたはnull/undefinedと比較した場合、falseになる", () => {
		// Arrange
		const a = Nickname.create("Alpha");
		const b = Nickname.create("Bravo");

		// Act & Assert
		expect(a.success && b.success).toBe(true);
		if (a.success && b.success) {
			expect(a.value.equals(b.value)).toBe(false);
			expect(a.value.equals(null as unknown as Nickname)).toBe(false);
			expect(a.value.equals(undefined as unknown as Nickname)).toBe(false);
		}
	});
});
