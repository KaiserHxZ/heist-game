// Tiny WebAudio bleeps, made in code — no sound files, no network.
// Everything is guarded: if audio is unavailable the game plays on
// in silence. M toggles mute.

export function createSound() {
  let context = null;
  let muted = false;

  function ensure() {
    if (context) return context;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return null;
      context = new AudioContext();
    } catch {
      context = null;
    }
    return context;
  }

  function beep(frequency, seconds, kind, gainValue) {
    if (muted) return;
    const audio = ensure();
    if (!audio) return;
    try {
      if (audio.state === 'suspended') audio.resume();
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      oscillator.type = kind;
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(gainValue, audio.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + seconds);
      oscillator.connect(gain);
      gain.connect(audio.destination);
      oscillator.start();
      oscillator.stop(audio.currentTime + seconds);
    } catch {
      // Sound is decoration; a failure must never stop the game.
    }
  }

  return {
    packet() { beep(880, 0.12, 'sine', 0.08); },
    spotted() { beep(220, 0.18, 'square', 0.05); },
    caught() { beep(140, 0.4, 'sawtooth', 0.07); },
    win() { beep(660, 0.15, 'sine', 0.08); setTimeout(() => beep(990, 0.22, 'sine', 0.08), 140); },
    pod() { beep(520, 0.08, 'triangle', 0.06); },
    toggleMute() { muted = !muted; return muted; },
  };
}
