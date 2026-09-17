import { useEffect, useRef, useSyncExternalStore } from "react";
import { InvaderGameStore } from "../store/InvaderGameStore";

/**
 * インベーダーゲームのライフサイクル、キーボード入力イベント、状態購読を提供するカスタムフック。
 *
 * @returns engine（ゲームエンジン）、sound（サウンド制御）、hasStarted（開始フラグ）、isReady（データ準備完了フラグ）
 */
export function useInvaderGame() {
	const storeRef = useRef<InvaderGameStore | null>(null);

	if (!storeRef.current) {
		storeRef.current = new InvaderGameStore();
	}

	const store = storeRef.current;

	useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);

	// 初期データのロード
	useEffect(() => {
		store.initialize();
	}, [store]);

	useEffect(() => {
		return () => store.stop();
	}, [store]);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.ctrlKey || e.metaKey || e.altKey) return;
			if (
				e.code === "Space" &&
				(store.engine.status !== "playing" || !store.rafId)
			) {
				e.preventDefault();
				if (store.isReady) {
					store.start();
				}
				return;
			}
			store.handleType(e.key);
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [store]);

	return {
		engine: store.engine,
		sound: store.sound,
		hasStarted: store.hasStarted,
		isReady: store.isReady,
	};
}
