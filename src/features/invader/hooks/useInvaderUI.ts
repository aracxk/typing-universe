import { useEffect, useState } from "react";
import type { InvaderGameEngine } from "../../../entities/invader/domain/InvaderGameEngine";
import type { SoundEngine } from "../../../shared/lib/audio/SoundEngine";

export function useInvaderUI(engine: InvaderGameEngine, sound: SoundEngine) {
	const [soundEnabled, setSoundEnabled] = useState(true);
	const [hasStarted, setHasStarted] = useState(false);

	useEffect(() => {
		if (engine.status === "playing" && engine.score > 0) {
			setHasStarted(true);
		}
	}, [engine.status, engine.score]);

	const toggleSound = () => {
		const enabled = sound.toggle();
		setSoundEnabled(enabled);
	};

	return {
		soundEnabled,
		hasStarted,
		toggleSound,
	};
}
