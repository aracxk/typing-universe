import { useState } from "react";
import type { SoundEngine } from "../../../shared/lib/audio/SoundEngine";

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
