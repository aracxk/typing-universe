import { expect, test } from "@playwright/test";

test.describe("Ranking Page E2E", () => {
	test("ランキングページにアクセスした場合、ヘッダーとランキング見出しが表示される", async ({
		page,
	}) => {
		// Arrange & Act
		await page.goto("/ranking");

		// Assert
		await expect(page.locator("h1")).toHaveText(
			"BUG INVADERS 歴代トップ10ランキング",
		);
		await expect(page.locator("text=GLOBAL LEADERBOARD")).toBeVisible();
		await expect(page.locator("text=BUG INVADERS をプレイ")).toBeVisible();
	});
});
