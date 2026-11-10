import type { FormEvent } from "react";
import type {
	ScoreSubmitResponse,
	SubmissionStatus,
} from "../hooks/useScoreSubmission";

interface ScoreSubmitFormProps {
	readonly nickname: string;
	readonly onNicknameChange: (value: string) => void;
	readonly status: SubmissionStatus;
	readonly errorMessage: string | null;
	readonly result: ScoreSubmitResponse | null;
	readonly canSubmit: boolean;
	readonly onSubmit: (e: FormEvent<HTMLFormElement>) => void;
}

/**
 * ゲームオーバー画面でニックネーム入力とスコア送信を行う純粋なフォームUIコンポーネント。
 */
export function ScoreSubmitForm({
	nickname,
	onNicknameChange,
	status,
	errorMessage,
	result,
	canSubmit,
	onSubmit,
}: ScoreSubmitFormProps) {
	if (status === "submitted" && result) {
		return (
			<div className="w-full bg-slate-900/90 border border-cyan-500/40 rounded-lg p-3 text-center space-y-1">
				<div className="text-xs text-cyan-300 font-bold tracking-wider">
					SCORE REGISTERED
				</div>
				<div className="text-sm text-slate-200">
					<span className="font-bold text-white">{result.nickname}</span>{" "}
					さんの順位:{" "}
					<span className="text-lg font-black text-[#ffe600]">
						#{result.rank}
					</span>
					{result.isTopTen && (
						<span className="ml-2 px-2 py-0.5 text-[10px] bg-[#00ff66]/20 text-[#00ff66] border border-[#00ff66]/40 rounded">
							TOP 10 IN
						</span>
					)}
				</div>
			</div>
		);
	}

	if (!canSubmit) {
		return (
			<div className="w-full text-xs text-slate-500 py-1">
				スコア 0 または 5秒未満のプレイはランキング登録対象外です。
			</div>
		);
	}

	return (
		<form onSubmit={onSubmit} className="w-full space-y-2">
			<div className="flex flex-col sm:flex-row gap-2">
				<input
					type="text"
					value={nickname}
					onChange={(e) => onNicknameChange(e.target.value)}
					placeholder="ニックネーム (1〜12文字)"
					maxLength={12}
					disabled={status === "submitting"}
					aria-label="ニックネーム"
					className="flex-1 px-3 py-2 rounded bg-slate-950 border border-slate-700 text-slate-100 text-xs sm:text-sm font-mono focus:outline-none focus:border-cyan-400"
				/>
				<button
					type="submit"
					disabled={status === "submitting" || nickname.trim().length === 0}
					className="px-4 py-2 rounded bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-800 disabled:text-slate-500 text-black font-bold text-xs sm:text-sm cursor-pointer transition-colors"
				>
					{status === "submitting" ? "送信中..." : "スコアを登録"}
				</button>
			</div>
			{errorMessage && (
				<p className="text-xs text-[#ff0055] text-left">{errorMessage}</p>
			)}
		</form>
	);
}
