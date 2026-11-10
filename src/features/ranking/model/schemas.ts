import { z } from "zod";
import { VALID_RANKED_GAME_IDS } from "../../../entities/ranking/domain/ScoreSubmission";

/**
 * ランキング対象ゲームIDのZodスキーマ。
 */
export const rankedGameIdSchema = z.enum(
	VALID_RANKED_GAME_IDS as [
		(typeof VALID_RANKED_GAME_IDS)[0],
		...(typeof VALID_RANKED_GAME_IDS)[number][],
	],
);

/**
 * プレイセッショントークン発行リクエスト（POST /api/sessions）のZodスキーマ。
 * 未知のフィールドは strict() により拒否します。
 */
export const sessionIssueRequestSchema = z
	.object({
		gameId: rankedGameIdSchema,
	})
	.strict();

/**
 * クライアント・サーバー境界でのニックネーム文字列のZodスキーマ。
 */
export const nicknameStringSchema = z
	.string()
	.trim()
	.min(1, "ニックネームを1文字以上で入力してください。")
	.max(12, "ニックネームは12文字以内で入力してください。");

/**
 * スコア送信リクエスト（POST /api/scores）のZodスキーマ。
 * 未知のフィールドは strict() により拒否します。
 */
export const scoreSubmitRequestSchema = z
	.object({
		gameId: rankedGameIdSchema,
		sessionToken: z.string().min(10).max(1024),
		nickname: nicknameStringSchema,
		score: z.number().int().nonnegative().max(10_000_000),
		kills: z.number().int().nonnegative().max(100_000),
		maxCombo: z.number().int().nonnegative().max(100_000),
		correctTyped: z.number().int().nonnegative().max(100_000),
		totalTyped: z.number().int().nonnegative().max(100_000),
		stage: z.number().int().min(1).max(10_000),
	})
	.strict();

export type ScoreSubmitRequestInput = z.infer<typeof scoreSubmitRequestSchema>;
