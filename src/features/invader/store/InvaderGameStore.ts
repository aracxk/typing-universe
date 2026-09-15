import { ActiveWord } from "../../../entities/core/domain/ActiveWord";
import { TargetWord } from "../../../entities/core/domain/TargetWord";
import { Invader } from "../../../entities/invader/domain/Invader";
import { InvaderGameEngine } from "../../../entities/invader/domain/InvaderGameEngine";
import { EntityId } from "../../../shared/domain/EntityId";
import { SoundEngine } from "../../../shared/lib/audio/SoundEngine";

export class InvaderGameStore {
	public engine: InvaderGameEngine;
	public sound: SoundEngine;

	private listeners: Set<() => void> = new Set();
	private lastTime = performance.now();
	public rafId: number | null = null;
	private invaderIdCounter = 0;
	private nextSpawnTime = 0;

	public tickCount = 0;
	public hasStarted = false;
	private lastHasStarted = false;
	private lastScore = 0;
	private lastLives = 3;
	private lastStatus = "playing";
	private lastCombo = 0;
	private lastStage = 1;
	private lastFocusedId: string | null = null;
	private lastKills = 0;

	constructor() {
		this.engine = InvaderGameEngine.create(EntityId.create("engine"), 600);
		this.sound = new SoundEngine();
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
		let changed = false;

		if (this.engine.kills > this.lastKills) {
			this.sound.playExplode();
			this.lastKills = this.engine.kills;
		}

		if (this.engine.combo === 0 && this.lastCombo > 0) {
			this.sound.playMiss();
		} else if (this.engine.combo > this.lastCombo) {
			this.sound.playLaser();
		}

		if (this.engine.lives < this.lastLives) {
			this.sound.playDamage();
		}

		if (
			this.engine.score !== this.lastScore ||
			this.engine.lives !== this.lastLives ||
			this.engine.status !== this.lastStatus ||
			this.engine.combo !== this.lastCombo ||
			this.engine.stageLevel !== this.lastStage ||
			this.engine.focusedInvaderId?.value !== this.lastFocusedId
		) {
			this.lastScore = this.engine.score;
			this.lastLives = this.engine.lives;
			this.lastStatus = this.engine.status;
			this.lastCombo = this.engine.combo;
			this.lastStage = this.engine.stageLevel;
			this.lastFocusedId = this.engine.focusedInvaderId?.value || null;
			changed = true;
		}

		if (changed) {
			this.tickCount++;
			for (const listener of this.listeners) {
				listener();
			}
		}
	}

	public start() {
		this.sound.init();
		this.engine = InvaderGameEngine.create(EntityId.create("engine"), 600);
		this.lastScore = 0;
		this.lastLives = 3;
		this.lastStatus = "playing";
		this.lastCombo = 0;
		this.lastStage = 1;
		this.lastKills = 0;
		this.hasStarted = true;
		this.lastFocusedId = null;
		this.invaderIdCounter = 0;
		this.tickCount++;

		this.lastTime = performance.now();
		this.nextSpawnTime = performance.now() + 500;

		const loop = (time: number) => {
			if (this.engine.status === "gameover") return;

			const deltaTime = time - this.lastTime;
			this.lastTime = time;

			if (time > this.nextSpawnTime) {
				this.spawnRandomInvader();
				const interval = Math.max(800, 2000 - this.engine.stageLevel * 150);
				this.nextSpawnTime = time + interval;
			}

			this.engine.tick(deltaTime * (1 + this.engine.stageLevel * 0.1));
			this.notifyIfChanged();
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
		if (/^[a-z-]$/i.test(key)) {
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
			{ w: "無花果", r: ["ichijiku"] },
			{ w: "SyntaxError", r: ["syntaxerror"] },
			{ w: "NullPointer", r: ["nullpointer"] },
			{ w: "404NotFound", r: ["404notfound"] },
			{ w: "InfinityLoop", r: ["infinityloop"] },
			{ w: "MemoryLeak", r: ["memoryleak"] },
		];
		const pick = words[Math.floor(Math.random() * words.length)];
		const targetResult = TargetWord.create(pick.w, pick.r);
		if (!targetResult.success) return;

		this.invaderIdCounter++;
		const active = ActiveWord.create(
			EntityId.create(`word-${this.invaderIdCounter}`),
			targetResult.value,
		);

		const x = Math.random() * 600 + 100;
		const speed = Math.random() * 15 + 10;

		const invResult = Invader.create(
			EntityId.create(`inv-${this.invaderIdCounter}`),
			active,
			x,
			-30,
			speed,
		);
		if (invResult.success) {
			this.engine.spawn(invResult.value);
		}
	}
}
