import React from 'react';

const TEXT_CONTENT = [
  "P(Y_{x'} | x, y)", "$do(X=忏悔)", "U_hidden = 2.84", "World-line Convergence", 
  "Vanitas vanitatum dixit Ecclesiastes", "01001101 01100001 01110100 01101000",
  "Structural Causal Model", "Latent Fate", "Z_confounder", "M_mediator",
  "信奉数学，归于收束", "Abduction -> Action -> Prediction", "System.Exception",
  "† THE CYBER PRIEST †", "CAUSAL INFERENCE L1", "UNIVERSE_ID: 0x7E2",
  "REGR_001", "SIGMA = 0.95"
];

// Shuffle and repeat for seamless scrolling
const generateColumnText = () => {
  const shuffled = [...TEXT_CONTENT].sort(() => 0.5 - Math.random());
  // Repeat content to ensure it covers twice the height for animation
  return [...shuffled, ...shuffled, ...shuffled].join("   |   ");
};

const FaithCodeRain = () => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-20 flex justify-between px-10">
      
      {/* Left Code Rain: Floods downwards, cool cyan shadow */}
      <div 
        className="w-12 h-[300%] text-cyan-500 font-mono text-xs uppercase writing-vertical-rl flex items-start animate-scroll-down priest-aura"
      >
        {generateColumnText()}
      </div>

      {/* Right Code Rain: Floods upwards, warning red shadow */}
      <div 
        className="w-12 h-[300%] text-red-500 font-mono text-xs uppercase writing-vertical-rl flex items-start animate-scroll-up priest-aura-red"
      >
        {generateColumnText()}
      </div>

    </div>
  );
};

export default FaithCodeRain;
