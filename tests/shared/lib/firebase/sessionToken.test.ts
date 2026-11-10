import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
	issuePlaySessionToken,
	SESSION_TOKEN_TTL_MS,
	verifyPlaySessionToken,
} from "../../../../src/shared/lib/firebase/sessionToken";

const TEST_SECRET = "test-secret-key-with-sufficient-length-32bytes";

describe("sessionToken (プレイセッショントークンの署名と検証)", () => {
	it("発行したトークンを正しいゲームIDと有効期限内で検証した場合、経過時間(durationMs)が算出される", () => {
		// Arrange
		const issuedAt = 1_000_000;
		const verifiedAt = 1_015_500;
		const issued = issuePlaySessionToken("bug_invaders", issuedAt, TEST_SECRET);

		// Act
		const result = verifyPlaySessionToken(
			issued.token,
			"bug_invaders",
			verifiedAt,
			TEST_SECRET,
		);

		// Assert
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.value.sessionId).toBe(issued.sessionId);
			expect(result.value.durationMs).toBe(15_500);
		}
	});

	it("トークンの署名が改ざんされている場合、検証に失敗する", () => {
		// Arrange
		const issued = issuePlaySessionToken(
			"bug_invaders",
			1_000_000,
			TEST_SECRET,
		);
		const tamperedToken = `${issued.token}x`;

		// Act
		const result = verifyPlaySessionToken(
			tamperedToken,
			"bug_invaders",
			1_010_000,
			TEST_SECRET,
		);

		// Assert
		expect(result.success).toBe(false);
	});

	it("有効期限(2時間)を超過している場合、検証に失敗する", () => {
		// Arrange
		const issuedAt = 1_000_000;
		const issued = issuePlaySessionToken("bug_invaders", issuedAt, TEST_SECRET);

		// Act
		const result = verifyPlaySessionToken(
			issued.token,
			"bug_invaders",
			issuedAt + SESSION_TOKEN_TTL_MS + 1,
			TEST_SECRET,
		);

		// Assert
		expect(result.success).toBe(false);
	});
});
