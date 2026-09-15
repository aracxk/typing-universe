import { useEffect, useRef, useSyncExternalStore } from "react";
import { ActiveWord } from "../../../entities/core/domain/ActiveWord";
import { TargetWord } from "../../../entities/core/domain/TargetWord";
import { Invader } from "../../../entities/invader/domain/Invader";
import { InvaderGameEngine } from "../../../entities/invader/domain/InvaderGameEngine";
import { EntityId } from "../../../shared/domain/EntityId";

class GameStore {
	public engine: InvaderGameEngine;
	private listeners: Set<() => void> = new Set();
	private lastTime = performance.now();
	private rafId: number | null = null;
	private invaderIdCounter = 0;
	private nextSpawnTime = 0;

	// Reactへの再描画トリガー用
	public tickCount = 0;
	private lastScore = 0;
	private lastLives = 3;
	private lastStatus = "playing";

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

	private notifyIfChanged() {
		if (
			this.engine.score !== this.lastScore ||
			this.engine.lives !== this.lastLives ||
			this.engine.status !== this.lastStatus
		) {
			this.lastScore = this.engine.score;
			this.lastLives = this.engine.lives;
			this.lastStatus = this.engine.status;

			this.tickCount++;
			for (const listener of this.listeners) {
				listener();
			}
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
			this.notifyIfChanged(); // Canvasが独立描画するため、スコア・ライフ変動時のみReactを再描画する
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
			this.notifyIfChanged();
		}
	}

	private spawnRandomInvader() {
		const words = [
			{ w: "林檎", r: ["ringo"] },
			{ w: "蜜柑", r: ["mikan"] },
			{ w: "西瓜", r: ["suika"] },
			{ w: "葡萄", r: ["budou"] },
			{ w: "苺", r: ["ichigo"] },
			{ w: "無花果", r: ["ichijiku"] },
			{ w: "檸檬", r: ["remon"] },
		];
		const pick = words[Math.floor(Math.random() * words.length)];
		const targetResult = TargetWord.create(pick.w, pick.r);
		if (!targetResult.success) return;

		this.invaderIdCounter++;
		const active = ActiveWord.create(
			EntityId.create(`word-${this.invaderIdCounter}`),
			targetResult.value,
		);

		const x = Math.random() * 400 + 100;
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

	return store.engine;
}
