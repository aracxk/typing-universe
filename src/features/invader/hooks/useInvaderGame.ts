import { useEffect, useRef, useSyncExternalStore } from "react";
import { InvaderGameStore } from "../store/InvaderGameStore";

export function useInvaderGame() {
	const storeRef = useRef<InvaderGameStore | null>(null);

	if (!storeRef.current) {
		storeRef.current = new InvaderGameStore();
	}

	const store = storeRef.current;

	useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);

	useEffect(() => {
		return () => store.stop();
	}, [store]);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.ctrlKey || e.metaKey || e.altKey) return;
			if (e.code === "Space" && store.engine.status !== "playing") {
				e.preventDefault();
				store.start();
				return;
			}
			store.handleType(e.key);
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [store]);

	return { engine: store.engine, sound: store.sound };
}
