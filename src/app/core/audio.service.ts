import { Injectable, signal } from '@angular/core';

/**
 * Generative ambient soundscape built with the Web Audio API.
 *
 * Instead of shipping copyrighted film music, we synthesise a slow, evolving
 * cinematic drone (à la Interstellar / Avatar): a couple of detuned low
 * oscillators, a shimmering high pad and a very slow LFO on the filter. It is
 * intentionally *very* subtle and can be paused at any time.
 */
@Injectable({ providedIn: 'root' })
export class AudioService {
  readonly playing = signal(false);
  private ctx?: AudioContext;
  private master?: GainNode;
  private nodes: AudioNode[] = [];

  toggle(): void {
    this.playing() ? this.stop() : this.start();
  }

  start(): void {
    if (this.playing()) return;
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    if (!Ctx) return;
    this.ctx = new Ctx();
    const ctx = this.ctx;

    this.master = ctx.createGain();
    this.master.gain.value = 0.0001;
    this.master.connect(ctx.destination);

    // Gentle low-pass to keep everything soft and distant.
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 600;
    filter.Q.value = 0.7;
    filter.connect(this.master);

    // Slow LFO sweeping the filter cutoff for movement.
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 0.05;
    lfoGain.gain.value = 220;
    lfo.connect(lfoGain).connect(filter.frequency);
    lfo.start();

    // Root drone chord — a low, spacious minor-ish stack.
    const freqs = [55, 82.4, 110, 164.8]; // A1, E2, A2, E3
    for (const f of freqs) {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = f;
      // slight detune per voice for a warm, breathing chorus
      osc.detune.value = (Math.random() - 0.5) * 8;
      const g = ctx.createGain();
      g.gain.value = 0.18;
      osc.connect(g).connect(filter);
      osc.start();
      this.nodes.push(osc, g);
    }

    // High shimmering pad, very quiet.
    const shimmer = ctx.createOscillator();
    shimmer.type = 'triangle';
    shimmer.frequency.value = 880;
    const shimmerGain = ctx.createGain();
    shimmerGain.gain.value = 0.015;
    const shimmerLfo = ctx.createOscillator();
    const shimmerLfoGain = ctx.createGain();
    shimmerLfo.frequency.value = 0.08;
    shimmerLfoGain.gain.value = 0.012;
    shimmerLfo.connect(shimmerLfoGain).connect(shimmerGain.gain);
    shimmer.connect(shimmerGain).connect(this.master);
    shimmer.start();
    shimmerLfo.start();

    this.nodes.push(lfo, lfoGain, filter, shimmer, shimmerGain, shimmerLfo, shimmerLfoGain);

    // Fade in slowly to a whisper-quiet level.
    this.master.gain.setValueAtTime(0.0001, ctx.currentTime);
    this.master.gain.exponentialRampToValueAtTime(0.32, ctx.currentTime + 4);

    this.playing.set(true);
  }

  stop(): void {
    if (!this.ctx || !this.master) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(this.master.gain.value, now);
    this.master.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);
    setTimeout(() => {
      this.ctx?.close().catch(() => {});
      this.ctx = undefined;
      this.master = undefined;
      this.nodes = [];
    }, 1700);
    this.playing.set(false);
  }
}
