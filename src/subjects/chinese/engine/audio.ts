/** Tiny WebAudio beeps — no asset files needed */

let ctx: AudioContext | null = null;

function ac(): AudioContext | null {
  try {
    if (!ctx) ctx = new AudioContext();
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq: number, dur: number, type: OscillatorType = "sine", gain = 0.04) {
  const c = ac();
  if (!c) return;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.value = gain;
  o.connect(g);
  g.connect(c.destination);
  const t = c.currentTime;
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.start(t);
  o.stop(t + dur);
}

export const Sfx = {
  ok(enabled: boolean) {
    if (!enabled) return;
    tone(660, 0.08, "triangle", 0.05);
    setTimeout(() => tone(880, 0.1, "triangle", 0.04), 60);
  },
  bad(enabled: boolean) {
    if (!enabled) return;
    tone(200, 0.15, "sawtooth", 0.03);
  },
  combo(enabled: boolean) {
    if (!enabled) return;
    tone(520, 0.05);
    setTimeout(() => tone(720, 0.05), 50);
    setTimeout(() => tone(960, 0.08), 100);
  },
  win(enabled: boolean) {
    if (!enabled) return;
    [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => tone(f, 0.12, "square", 0.035), i * 90));
  },
  tap(enabled: boolean) {
    if (!enabled) return;
    tone(400, 0.03, "square", 0.02);
  },
};
