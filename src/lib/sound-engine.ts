/**
 * The Web Audio sound engine.
 *
 * Nothing is downloaded: every cue is synthesised from oscillators and a gain
 * envelope, so the whole palette costs a few hundred bytes and starts instantly.
 * The context is created on the first real gesture (browsers refuse to start
 * audio before one), the master gain stays low enough to sit under narration,
 * and a muted visitor never pays for a context at all.
 *
 * Cues are short on purpose: a click is 40–70 ms, a chime 260 ms. The ambient
 * telemetry pulse is a slow, low sine that only runs while the mining reactor is
 * armed and is stopped the moment the tab is hidden.
 */

export type SoundName = 'click' | 'chime' | 'claim' | 'error' | 'pulse' | 'coin';

const STORAGE_KEY = 'mineai.sound.muted';

interface ToneOptions {
  frequency: number;
  /** Final frequency for a glide; omit for a steady tone. */
  to?: number;
  duration: number;
  type?: OscillatorType;
  gain?: number;
  delay?: number;
}

class SoundEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private muted = false;
  private ambient: number | null = null;
  private listeners = new Set<(muted: boolean) => void>();

  constructor() {
    if (typeof window === 'undefined') return;
    try {
      this.muted = window.localStorage.getItem(STORAGE_KEY) === '1';
    } catch {
      this.muted = false;
    }
  }

  isMuted(): boolean {
    return this.muted;
  }

  subscribe(listener: (muted: boolean) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  setMuted(value: boolean): void {
    this.muted = value;
    try {
      window.localStorage.setItem(STORAGE_KEY, value ? '1' : '0');
    } catch {
      // Private browsing: the choice simply lasts for this page.
    }
    if (value) {
      this.stopAmbient();
      this.ctx?.suspend().catch(() => undefined);
    }
    for (const listener of this.listeners) listener(value);
  }

  toggle(): boolean {
    this.setMuted(!this.muted);
    if (!this.muted) {
      this.unlock();
      this.click();
    }
    return this.muted;
  }

  /** Call from any user gesture so the context is allowed to run. */
  unlock(): void {
    this.ensure();
  }

  private ensure(): AudioContext | null {
    if (typeof window === 'undefined' || this.muted) return null;
    if (!this.ctx) {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      try {
        this.ctx = new Ctor();
        this.master = this.ctx.createGain();
        this.master.gain.value = 0.14;
        this.master.connect(this.ctx.destination);
      } catch {
        return null;
      }
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume().catch(() => undefined);
    return this.ctx;
  }

  private tone({ frequency, to, duration, type = 'sine', gain = 0.5, delay = 0 }: ToneOptions): void {
    const ctx = this.ensure();
    if (!ctx || !this.master) return;
    const start = ctx.currentTime + delay;
    const oscillator = ctx.createOscillator();
    const envelope = ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    if (to && to !== frequency) {
      oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, to), start + duration);
    }

    // A fast attack and a smooth cosine tail: no click at either end.
    envelope.gain.setValueAtTime(0.0001, start);
    envelope.gain.exponentialRampToValueAtTime(gain, start + Math.min(0.012, duration / 3));
    envelope.gain.exponentialRampToValueAtTime(0.0001, start + duration);

    oscillator.connect(envelope);
    envelope.connect(this.master);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.02);
  }

  play(name: SoundName): void {
    if (this.muted) return;
    switch (name) {
      case 'click':
        this.tone({ frequency: 1_480, to: 920, duration: 0.05, type: 'triangle', gain: 0.32 });
        break;
      case 'chime':
        this.tone({ frequency: 659.25, duration: 0.26, type: 'sine', gain: 0.34 });
        this.tone({ frequency: 987.77, duration: 0.3, type: 'sine', gain: 0.18, delay: 0.06 });
        break;
      case 'claim':
        this.tone({ frequency: 523.25, duration: 0.16, type: 'sine', gain: 0.3 });
        this.tone({ frequency: 659.25, duration: 0.16, type: 'sine', gain: 0.28, delay: 0.08 });
        this.tone({ frequency: 783.99, duration: 0.28, type: 'sine', gain: 0.26, delay: 0.16 });
        break;
      case 'error':
        this.tone({ frequency: 233, to: 164, duration: 0.22, type: 'sawtooth', gain: 0.18 });
        break;
      case 'pulse':
        this.tone({ frequency: 96, to: 82, duration: 0.2, type: 'sine', gain: 0.22 });
        this.tone({ frequency: 1_920, duration: 0.03, type: 'triangle', gain: 0.05, delay: 0.02 });
        break;
      case 'coin':
        this.tone({ frequency: 1_176, duration: 0.12, type: 'triangle', gain: 0.2 });
        this.tone({ frequency: 1_568, duration: 0.18, type: 'triangle', gain: 0.14, delay: 0.05 });
        break;
    }
  }

  click(): void {
    this.play('click');
  }

  chime(): void {
    this.play('chime');
  }

  claim(): void {
    this.play('claim');
  }

  error(): void {
    this.play('error');
  }

  coin(): void {
    this.play('coin');
  }

  /** A slow heartbeat under the mining terminal, only while the reactor runs. */
  startAmbient(): void {
    if (this.muted || typeof window === 'undefined' || this.ambient !== null) return;
    this.ensure();
    this.ambient = window.setInterval(() => {
      if (document.visibilityState === 'visible') this.play('pulse');
    }, 3_800);
  }

  stopAmbient(): void {
    if (this.ambient !== null && typeof window !== 'undefined') {
      window.clearInterval(this.ambient);
    }
    this.ambient = null;
  }
}

export const sound = new SoundEngine();
