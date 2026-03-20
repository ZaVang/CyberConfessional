import React from 'react';
import { MANTRAS } from '../config/mantras';

export default function BackgroundMantras() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-[#020202] selection:bg-transparent">
      {/* Gradient mask to make edges fade out */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-[#020202] via-transparent to-[#020202] pointer-events-none"></div>

      {/* Left/Right masks so the text fades on the sides too */}
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#020202] via-transparent to-[#020202] pointer-events-none"></div>

      <div className="absolute inset-0 flex flex-col justify-evenly opacity-40 transform -rotate-[4deg] scale-125">
        {MANTRAS.map((text, i) => {
          // Repeat text enough times to span incredibly wide and avoid visible looping seams
          const repeatedText = Array(15).fill(text).join(' ♦  ');
          const isReverse = i % 2 !== 0;
          return (
            <div key={i} className="w-[400vw] flex">
              <div
                className={`font-serif tracking-[0.3em] text-xl lg:text-2xl text-[#00f0ff] uppercase ${isReverse ? 'animate-[marquee_90s_linear_infinite_reverse]' : 'animate-[marquee_120s_linear_infinite]'}`}
                style={{
                  textShadow: '0 0 10px rgba(0,240,255,0.8), 0 0 20px rgba(0,240,255,0.4)',
                  whiteSpace: 'nowrap'
                }}
              >
                {repeatedText}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
