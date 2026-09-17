import { useState } from "react";
import type { SoundEngine } from "../../../shared/lib/audio/SoundEngine";

/**
 * インベーダーゲーム画面のUIローカル状態（サウンドON/OFF等）を管理するカスタムフック。
 *
 * @param sound 音声再生を制御する SoundEngine インスタンス
 * @returns soundEnabled（現在のサウンド状態）、toggleSound（切り替え関数）
 */
export function useInvaderUI(sound: SoundEngine) {
	const [soundEnabled, setSoundEnabled] = useState(true);

	const toggleSound = () => {
		const enabled = sound.toggle();
		setSoundEnabled(enabled);
	};

	return {
		soundEnabled,
		toggleSound,
	};
}
