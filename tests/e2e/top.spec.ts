import { expect, test } from "@playwright/test";

test.describe("Top Page E2E", () => {
	test("トップページが表示され、各要素が存在すること", async ({ page }) => {
		await page.goto("/");

		// タイトルが表示されていること
		await expect(page.locator("h1")).toHaveText("TYPING UNIVERSE");

		// Bug Invadersのカードが存在すること
		const invaderCard = page.locator("text=BUG INVADERS");
		await expect(invaderCard).toBeVisible();

		// Coming Soonのカードが存在すること
		const rpgCard = page.locator("text=Typing RPG");
		await expect(rpgCard).toBeVisible();

		// 「プレイする」をクリックして遷移すること
		await page.locator("text=プレイする").click();
		await expect(page).toHaveURL(/.*\/game\/invader/);
	});
});
