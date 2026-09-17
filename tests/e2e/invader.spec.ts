import { expect, test } from "@playwright/test";

test.describe("Invader Game E2E", () => {
	test("ゲームの初期化と開始ができること", async ({ page }) => {
		// ゲームページにアクセス
		await page.goto("/game/invader");

		// 初期UIの確認
		const scoreLocator = page
			.locator("text=SCORE:")
			.locator("xpath=..")
			.locator("span")
			.nth(1);
		await expect(scoreLocator).toHaveText("000000");

		// 「PRESS [SPACE] TO START」が表示されるまで待機（isReadyになるまで）
		const startPrompt = page.locator("text=PRESS [SPACE] TO START");
		await expect(startPrompt).toBeVisible();

		// スペースキーを押してゲームを開始
		await page.keyboard.press("Space");

		// スタート画面が消えること
		await expect(startPrompt).toBeHidden();
	});
});
