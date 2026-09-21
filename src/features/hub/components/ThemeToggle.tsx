"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return <div className="w-8 h-8" />; // hydration mismatch 防ぐプレースホルダー
	}

	return (
		<button
			type="button"
			onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
			className="p-2 rounded-full bg-surface-container hover:bg-surface-container-high transition-colors text-outline hover:text-on-surface"
			aria-label="テーマを切り替える"
		>
			{theme === "dark" ? (
				<Sun className="w-4 h-4" />
			) : (
				<Moon className="w-4 h-4" />
			)}
		</button>
	);
}
