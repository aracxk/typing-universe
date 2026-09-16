export class SoundEngine {
	private ctx: AudioContext | null = null;
	private enabled = true;

	public init(): void {
		if (typeof window === "undefined") return;
		if (!this.ctx) {
			const AudioContextClass =
				window.AudioContext ||
				(window as unknown as { webkitAudioContext: typeof AudioContext })
					.webkitAudioContext;
			if (AudioContextClass) {
				this.ctx = new AudioContextClass();
			}
		}
		if (this.ctx && this.ctx.state === "suspended") {
			this.ctx.resume();
		}
	}

	public toggle(): boolean {
		this.enabled = !this.enabled;
		return this.enabled;
	}

	public get isEnabled(): boolean {
		return this.enabled;
	}

	public playLaser(): void {
		if (!this.enabled || !this.ctx) return;
		const now = this.ctx.currentTime;
		const osc = this.ctx.createOscillator();
		const gain = this.ctx.createGain();

		osc.type = "square";
		osc.frequency.setValueAtTime(800, now);
		osc.frequency.exponentialRampToValueAtTime(200, now + 0.08);

		gain.gain.setValueAtTime(0.08, now);
		gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

		osc.connect(gain);
		gain.connect(this.ctx.destination);

		osc.start(now);
		osc.stop(now + 0.08);
	}

	public playExplode(): void {
		if (!this.enabled || !this.ctx) return;
		const now = this.ctx.currentTime;

		const bufferSize = this.ctx.sampleRate * 0.25;
		const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
		const data = buffer.getChannelData(0);
		for (let i = 0; i < bufferSize; i++) {
			data[i] = Math.random() * 2 - 1;
		}

		const noise = this.ctx.createBufferSource();
		noise.buffer = buffer;

		const filter = this.ctx.createBiquadFilter();
		filter.type = "lowpass";
		filter.frequency.setValueAtTime(1000, now);
		filter.frequency.exponentialRampToValueAtTime(100, now + 0.25);

		const gain = this.ctx.createGain();
		gain.gain.setValueAtTime(0.2, now);
		gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

		noise.connect(filter);
		filter.connect(gain);
		gain.connect(this.ctx.destination);

		noise.start(now);
		noise.stop(now + 0.25);
	}

	public playMiss(): void {
		if (!this.enabled || !this.ctx) return;
		const now = this.ctx.currentTime;
		const osc = this.ctx.createOscillator();
		const gain = this.ctx.createGain();

		osc.type = "sawtooth";
		osc.frequency.setValueAtTime(140, now);
		osc.frequency.setValueAtTime(110, now + 0.06);

		gain.gain.setValueAtTime(0.08, now);
		gain.gain.linearRampToValueAtTime(0.01, now + 0.1);

		osc.connect(gain);
		gain.connect(this.ctx.destination);

		osc.start(now);
		osc.stop(now + 0.1);
	}

	public playDamage(): void {
		if (!this.enabled || !this.ctx) return;
		const now = this.ctx.currentTime;
		const osc = this.ctx.createOscillator();
		const gain = this.ctx.createGain();

		osc.type = "sine";
		osc.frequency.setValueAtTime(300, now);
		osc.frequency.exponentialRampToValueAtTime(80, now + 0.3);

		gain.gain.setValueAtTime(0.25, now);
		gain.gain.linearRampToValueAtTime(0.01, now + 0.3);

		osc.connect(gain);
		gain.connect(this.ctx.destination);

		osc.start(now);
		osc.stop(now + 0.3);
	}
}
