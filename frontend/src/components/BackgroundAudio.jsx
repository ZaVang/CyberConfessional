import React, { useEffect, useRef } from 'react';

const BackgroundAudio = ({ isPlaying, isCatharsisActive }) => {
  const audioCtxRef = useRef(null);
  const oscillatorsRef = useRef([]);
  const gainNodeRef = useRef(null);

  useEffect(() => {
    if (isPlaying && !audioCtxRef.current) {
      // Initialize Web Audio API
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;

      // Master Gain - kept very low so it doesn't annoy the user
      const masterGain = ctx.createGain();
      masterGain.gain.value = 0.08; 
      masterGain.connect(ctx.destination);
      gainNodeRef.current = masterGain;

      // Deep Synth Drone (Sine + Triangle)
      const osc1 = ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(55, ctx.currentTime); // Low A (A1)

      const osc2 = ctx.createOscillator();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(54.5, ctx.currentTime); // Slight detune for phasing

      const droneGain = ctx.createGain();
      droneGain.gain.value = 0.6;
      osc1.connect(droneGain);
      osc2.connect(droneGain);
      droneGain.connect(masterGain);

      // Pink noise (Deep sea rumble)
      const bufferSize = ctx.sampleRate * 2; // 2 seconds of noise
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      
      // Pink noise algorithm
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        let white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        output[i] *= 0.11; // compensation
        b6 = white * 0.115926;
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      // Lowpass filter for the noise
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 200; // Muffled underwater sound

      noiseSource.connect(filter);
      filter.connect(masterGain);

      // Start everything
      osc1.start();
      osc2.start();
      noiseSource.start();

      oscillatorsRef.current = [osc1, osc2, noiseSource];
      
      audioCtxRef.current._osc2 = osc2;
      audioCtxRef.current._filter = filter;
      audioCtxRef.current._masterGain = masterGain;
    }

    return () => {
      // Audio nodes continue autonomously, no strict cleanup mapped to simplify things,
      // as it's meant to play indefinitely once interaction started.
    };
  }, [isPlaying]);

  useEffect(() => {
    if (audioCtxRef.current && audioCtxRef.current._osc2) {
      const ctx = audioCtxRef.current;
      const now = ctx.currentTime;
      if (isCatharsisActive) {
        ctx._osc2.frequency.linearRampToValueAtTime(65.41, now + 3);
        ctx._filter.frequency.linearRampToValueAtTime(800, now + 3);
        ctx._masterGain.gain.linearRampToValueAtTime(0.12, now + 3);
      } else {
        ctx._osc2.frequency.linearRampToValueAtTime(54.5, now + 2);
        ctx._filter.frequency.linearRampToValueAtTime(200, now + 2);
        ctx._masterGain.gain.linearRampToValueAtTime(0.08, now + 2);
      }
    }
  }, [isCatharsisActive]);

  return null;
};

export default BackgroundAudio;
