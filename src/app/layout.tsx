import { GoogleAnalytics } from "@next/third-parties/google";
import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({
	variable: "--font-inter",
	subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
	variable: "--font-space-grotesk",
	subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
	variable: "--font-jetbrains-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	metadataBase: new URL(
		process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
	),
	title: {
		default: "Typing Universe | タイピングゲーム・プラットフォーム",
		template: "%s | Typing Universe",
	},
	description:
		"複数のタイピングゲームを切り替えて遊べるWebアプリケーション。迫りくるバグをタイピングで迎撃せよ！",
	openGraph: {
		title: "Typing Universe",
		description: "複数のタイピングゲームを切り替えて遊べるWebアプリケーション",
		url: "/",
		siteName: "Typing Universe",
		locale: "ja_JP",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "Typing Universe",
		description: "複数のタイピングゲームを切り替えて遊べるWebアプリケーション",
	},
};

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html
			lang="ja"
			className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} h-full antialiased`}
		>
			<body className="min-h-full flex flex-col font-sans bg-background text-on-surface dark">
				{children}
			</body>
			{process.env.NEXT_PUBLIC_GA_ID && (
				<GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
			)}
		</html>
	);
}
