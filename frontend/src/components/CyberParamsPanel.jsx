import React from 'react';

const TYPE_STYLES = {
  treatment: { border: 'border-gray-600/30', text: 'text-gray-400', bg: 'bg-transparent' },
  outcome: { border: 'border-gray-500/30', text: 'text-gray-300', bg: 'bg-transparent' },
  latent: { border: 'border-red-600/40', text: 'text-red-500', bg: 'bg-black', glow: 'drop-shadow-[0_0_5px_rgba(204,0,0,0.8)]' },
  confounder: { border: 'border-gray-500/40', text: 'text-gray-400', bg: 'bg-gray-900/20' },
  mediator: { border: 'border-yellow-600/40', text: 'text-yellow-500', bg: 'bg-black' }
};

const CyberParamsPanel = ({ 
  prob, 
  causalNodes = [], 
  zVal, 
  mBias, 
  onZChange, 
  onMChange,
  isSimulating = false
}) => {
  return (
    <div className="flex flex-col gap-8 p-8 bg-black/90 border border-gray-700/60 rounded-sm shadow-none font-mono antialiased">
      
      <div className="border-b border-gray-700/80 pb-3 mb-2 flex items-center justify-between">
        <h3 className="text-gray-300 text-base tracking-[0.2em] uppercase font-bold glitch" data-text="> System.Diagnostic_Logs">&gt; System.Diagnostic_Logs</h3>
      </div>

      {/* Top: Variables Horizontal */}
      <div className="flex flex-col gap-4">
        <div className="text-xs text-gray-500 uppercase tracking-widest mb-1 font-bold italic opacity-70">Causal State Variables</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {causalNodes.map((node, index) => {
            const style = TYPE_STYLES[node.type] || TYPE_STYLES.outcome;
            
            return (
              <div key={index} className={`p-4 border rounded-sm relative overflow-hidden ${style.bg} ${style.border} transition-none`}>
                <div className="flex items-center gap-2 mb-2">
                  {node.type === 'latent' && (
                    <span className="w-2 h-2 rounded-none bg-red-600 animate-pulse shadow-none"></span>
                  )}
                  <span className={`text-xs font-bold uppercase tracking-wider ${style.text}`}>
                    [{node.symbol}] {node.name}
                  </span>
                </div>
                <div className="flex flex-col mt-1">
                  <span className={`text-2xl font-bold font-mono ${style.text} ${style.glow || ''} tracking-tight`}>
                    {node.value}
                  </span>
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest mt-2 font-mono italic border-t border-gray-800/50 pt-1">
                    {node.desc || 'Variable'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Middle: Sliders Horizontal */}
      <div className="p-6 border border-gray-700/50 bg-black rounded-sm">
        <div className="text-xs text-gray-400 uppercase tracking-[0.15em] mb-8 font-bold border-b border-gray-700/40 pb-2 italic">
          &gt; Manual_Intervention_Sandbox
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Slider Z */}
          <div className="slider-group">
            <div className="flex justify-between text-xs mb-4">
               <span className="text-gray-400 uppercase tracking-wide font-mono">Macro Env (Z)</span>
               <span className="text-gray-300 font-bold px-3 py-1 bg-gray-900 border border-gray-700 rounded-sm">{zVal}</span>
            </div>
            <input 
              type="range" 
              min="-3" 
              max="3" 
              step="0.1" 
              value={zVal} 
              onChange={(e) => onZChange(parseFloat(e.target.value))}
              className="w-full h-1 bg-gray-800 rounded-none appearance-none cursor-pointer accent-gray-500 hover:accent-gray-400 transition-none"
            />
            <div className="flex justify-between text-[10px] text-gray-600 mt-3 uppercase tracking-widest font-mono italic">
              <span>Favorable (-3)</span>
              <span className="opacity-40">|</span>
              <span>Neutral (0)</span>
              <span className="opacity-40">|</span>
              <span>Abyss (+3)</span>
            </div>
          </div>

          {/* Slider M */}
          <div className="slider-group">
            <div className="flex justify-between text-xs mb-4">
              <span className="text-gray-400 uppercase tracking-wide font-mono">Mediation Flaw (M)</span>
              <span className="text-red-500 font-bold px-3 py-1 bg-red-950/20 border border-red-900/40 rounded-sm">{mBias}</span>
            </div>
            <input 
              type="range" 
              min="-10" 
              max="10" 
              step="0.5" 
              value={mBias} 
              onChange={(e) => onMChange(parseFloat(e.target.value))}
              className="w-full h-1 bg-gray-800 rounded-none appearance-none cursor-pointer accent-red-600 hover:accent-red-500 transition-none"
            />
            <div className="flex justify-between text-[10px] text-gray-600 mt-3 uppercase tracking-widest font-mono italic">
              <span>Rational (-10)</span>
              <span className="opacity-40">|</span>
              <span>Neutral (0)</span>
              <span className="opacity-40">|</span>
              <span>Self-Destruct (+10)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom: Probability Summary */}
      <div className="mt-2 flex justify-between items-center pt-6 border-t border-gray-800">
        <div>
          <span className="text-xs text-gray-500 block uppercase tracking-[0.2em] mb-1 font-mono">Calculated Predictability</span>
          <span className="text-5xl text-gray-300 font-bold tracking-tighter">
            {prob}%
          </span>
        </div>
        <div className="text-right">
          <span className="text-xs text-gray-500 block uppercase tracking-[0.2em] mb-2 font-mono">Engine Status</span>
          <span className={`text-sm px-4 py-1 rounded-none border ${isSimulating ? 'text-red-500 border-red-600/40 bg-black' : 'text-green-500 border-green-600/40 bg-black'} font-bold uppercase tracking-widest`}>
            {isSimulating ? '> Calculating...' : '> Convergence Reached'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CyberParamsPanel;
