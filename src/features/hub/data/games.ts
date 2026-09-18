import type { GameCardProps } from "@/shared/ui/GameCard";

export const GAMES: GameCardProps[] = [
	{
		title: "Bug Invaders",
		description:
			"本番環境に迫りくるバグの大群を、タイピングで次々と撃墜せよ。60FPSで動作するアーケードスタイルのタイピングシューティングゲーム。",
		version: "v1.0.0",
		status: "active",
		difficulty: "VARYING (1-10)",
		minSpeed: "65+ WPM",
		combatMode: "タイピング迎撃",
		href: "/game/invader",
	},
	{
		title: "Typing RPG",
		description:
			"現在開発中の新しいタイピングゲーム。次なるアップデートをお待ちください。",
		status: "locked",
	},
	{
		title: "Matrix Sprint",
		description:
			"60秒間のタイムアタック。限界のタイピングスピードに挑戦し、己の反射神経を試せ。",
		status: "locked",
	},
];
