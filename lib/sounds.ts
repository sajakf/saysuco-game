"use client";

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
}

function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = "sine",
  volume = 0.3,
  delay = 0
): void {
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime + delay);
    gain.gain.setValueAtTime(0, ctx.currentTime + delay);
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + delay + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);

    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + duration);
  } catch {}
}

function playNoise(duration: number, volume = 0.1, delay = 0): void {
  try {
    const ctx = getCtx();
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, ctx.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);

    source.connect(gain);
    gain.connect(ctx.destination);
    source.start(ctx.currentTime + delay);
  } catch {}
}

export const sounds = {
  // Smooth pop when placing a piece — like a thick acai scoop
  place(): void {
    playTone(220, 0.08, "triangle", 0.25);
    playTone(330, 0.12, "sine", 0.15, 0.04);
  },

  // Blender whir for AI move
  aiMove(): void {
    playTone(180, 0.06, "sawtooth", 0.1);
    playTone(160, 0.08, "square", 0.07, 0.04);
  },

  // Victory — upbeat juice bar jingle
  win(): void {
    const notes = [523, 659, 784, 1047];
    notes.forEach((f, i) => playTone(f, 0.25, "triangle", 0.3, i * 0.15));
    playTone(1047, 0.5, "sine", 0.2, 0.65);
  },

  // Defeat — deep thud like an empty cup
  lose(): void {
    playTone(220, 0.3, "sawtooth", 0.25);
    playTone(160, 0.4, "triangle", 0.2, 0.1);
    playTone(110, 0.5, "sine", 0.15, 0.2);
  },

  // Draw — neutral
  draw(): void {
    playTone(440, 0.15, "sine", 0.2);
    playTone(440, 0.15, "sine", 0.15, 0.25);
  },

  // Timer tick — like ice cubes
  tick(): void {
    playTone(800, 0.04, "square", 0.08);
  },

  // Urgent tick for last 10 seconds
  urgentTick(): void {
    playTone(1000, 0.05, "square", 0.12);
    playTone(600, 0.04, "square", 0.08, 0.06);
  },

  // Promo unlock — celebratory
  promo(): void {
    const melody = [523, 659, 784, 1047, 1175, 1047, 784, 1047, 1319];
    melody.forEach((f, i) => playTone(f, 0.2, "triangle", 0.35, i * 0.12));
  },

  // Button click
  click(): void {
    playTone(600, 0.05, "square", 0.1);
  },

  // Winning line highlight
  winLine(): void {
    playTone(880, 0.1, "triangle", 0.2);
    playTone(1100, 0.15, "sine", 0.25, 0.1);
  },

  // Correct trivia answer
  correct(): void {
    playTone(660, 0.12, "triangle", 0.25);
    playTone(880, 0.2, "sine", 0.3, 0.1);
  },

  // Wrong trivia answer
  wrong(): void {
    playTone(300, 0.15, "sawtooth", 0.2);
    playTone(220, 0.25, "square", 0.15, 0.1);
  },
};
