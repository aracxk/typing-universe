import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		environment: "jsdom",
		exclude: ["tests/e2e/**", "node_modules/**"],
		coverage: {
			provider: "v8",
			reporter: ["text", "json-summary", "json", "html"],
			include: ["src/entities/**/domain/**/*.ts"],
			thresholds: {
				lines: 100,
				functions: 100,
				branches: 100,
				statements: 100,
			},
		},
	},
});
