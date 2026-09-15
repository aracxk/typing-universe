import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";
import { ActiveWord } from "../../../entities/core/domain/ActiveWord";
import { TargetWord } from "../../../entities/core/domain/TargetWord";
import { Invader } from "../../../entities/invader/domain/Invader";
import { InvaderGameEngine } from "../../../entities/invader/domain/InvaderGameEngine";
import { Result } from "../../../shared/core/Result";
import { EntityId } from "../../../shared/domain/EntityId";

class GameStore {
	public engine: InvaderGameEngine;
	private listeners: Set<() => void> = new Set();
	private lastTime = performance.now();
	private rafId: number | null = null;
	private invaderIdCounter = 0;
	private nextSpawnTime = 0;
	public tickCount = 0; // Reactの再レンダリングトリガー用

	constructor() {
		this.engine = InvaderGameEngine.create(EntityId.create("engine"), 600);
	}

	public subscribe = (listener: () => void) => {
		this.listeners.add(listener);
		return () => {
			this.listeners.delete(listener);
		};
	};

	public getSnapshot = () => {
		return this.tickCount;
	};

	private notify() {
		this.tickCount++;
		for (const listener of this.listeners) {
			listener();
		}
	}

	public start() {
		this.lastTime = performance.now();
		this.nextSpawnTime = performance.now() + 1000;
		const loop = (time: number) => {
			if (this.engine.status === "gameover") return;

			const deltaTime = time - this.lastTime;
			this.lastTime = time;

			if (time > this.nextSpawnTime) {
				this.spawnRandomInvader();
				this.nextSpawnTime = time + 2000;
			}

			this.engine.tick(deltaTime);
			this.notify();
			this.rafId = requestAnimationFrame(loop);
		};
		this.rafId = requestAnimationFrame(loop);
	}

	public stop() {
		if (this.rafId) {
			cancelAnimationFrame(this.rafId);
			this.rafId = null;
		}
	}

	public handleType(key: string) {
		if (this.engine.status === "gameover") return;
		if (/^[a-z]$/i.test(key)) {
			this.engine.type(key);
			this.notify();
		}
	}

	private spawnRandomInvader() {
		const words = [
			{ w: "林檎", r: ["ringo"] },
			{ w: "蜜柑", r: ["mikan"] },
			{ w: "西瓜", r: ["suika"] },
			{ w: "葡萄", r: ["budou"] },
		];
		const pick = words[Math.floor(Math.random() * words.length)];
		const targetResult = TargetWord.create(pick.w, pick.r);
		if (!targetResult.success) return;

		this.invaderIdCounter++;
		const active = ActiveWord.create(
			EntityId.create(`word-${this.invaderIdCounter}`),
			targetResult.value,
		);

		const x = Math.random() * 400 + 50;
		const speed = Math.random() * 30 + 30;

		const invResult = Invader.create(
			EntityId.create(`inv-${this.invaderIdCounter}`),
			active,
			x,
			0,
			speed,
		);
		if (invResult.success) {
			this.engine.spawn(invResult.value);
		}
	}
}

export function useInvaderGame() {
	const storeRef = useRef<GameStore | null>(null);

	if (!storeRef.current) {
		storeRef.current = new GameStore();
	}

	const store = storeRef.current;

	// Reactに状態変更を検知させるため、tickCountを監視させる
	useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);

	useEffect(() => {
		store.start();
		return () => store.stop();
	}, [store]);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.ctrlKey || e.metaKey || e.altKey) return;
			store.handleType(e.key);
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [store]);

	// 実態（エンジン）はそのまま返す
	return store.engine;
}
