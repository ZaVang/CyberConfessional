import React from 'react';

const TYPE_STYLES = {
  treatment: { border: 'border-gray-500/50', text: 'text-gray-200', bg: 'bg-black/40' },
  outcome: { border: 'border-gray-400/50', text: 'text-gray-100', bg: 'bg-black/40' },
  latent: { border: 'border-red-500/60', text: 'text-red-400', bg: 'bg-red-950/30', glow: 'drop-shadow-[0_0_8px_rgba(255,51,51,0.6)]' },
  confounder: { border: 'border-gray-400/50', text: 'text-gray-300', bg: 'bg-gray-800/40' },
  mediator: { border: 'border-yellow-500/60', text: 'text-yellow-400', bg: 'bg-yellow-950/30' }
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
    <div className="flex flex-col gap-8 p-8 glass-panel rounded-md shadow-lg font-mono antialiased animate-entry delay-300 border border-gray-600/50 w-full max-w-4xl mx-auto">
      
      <div className="border-b border-gray-600/80 pb-3 mb-2 flex items-center justify-between">
        <h3 className="text-gray-200 text-lg tracking-[0.2em] uppercase font-bold glitch" data-text="> System.Diagnostic_Logs">&gt; System.Diagnostic_Logs</h3>
      </div>

      {/* Top: Variables Horizontal */}
      <div className="flex flex-col gap-4">
        <div className="text-sm text-gray-300 uppercase tracking-widest mb-1 font-bold italic opacity-90">Causal State Variables</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {causalNodes.map((node, index) => {
            const style = TYPE_STYLES[node.type] || TYPE_STYLES.outcome;
            
            return (
              <div key={index} className={`p-5 border rounded-sm relative overflow-hidden ${style.bg} ${style.border} transition-colors hover:bg-gray-800/60`}>
                <div className="flex items-center gap-2 mb-2">
                  {node.type === 'latent' && (
                    <span className="w-2.5 h-2.5 rounded-none bg-red-500 animate-pulse shadow-[0_0_10px_rgba(255,51,51,0.8)]"></span>
                  )}
                  <span className={`text-sm font-bold uppercase tracking-wider ${style.text}`}>
                    [{node.symbol}] {node.name}
                  </span>
                </div>
                <div className="flex flex-col mt-2">
                  <span className={`text-3xl font-bold font-mono ${style.text} ${style.glow || ''} tracking-tight`}>
                    {node.value}
                  </span>
                  <span className="text-xs text-gray-400 uppercase tracking-widest mt-3 font-mono italic border-t border-gray-700/80 pt-2">
                    {node.desc || 'Variable'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Middle: Sliders Horizontal */}
      <div className="p-6 md:p-8 border border-gray-600/60 bg-black/50 rounded-md">
        <div className="text-sm text-gray-300 uppercase tracking-[0.15em] mb-8 font-bold border-b border-gray-600/60 pb-3 italic">
          &gt; Manual_Intervention_Sandbox
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Slider Z */}
          <div className="slider-group">
            <div className="flex justify-between text-sm mb-4">
               <span className="text-gray-300 uppercase tracking-wide font-mono font-bold">Macro Env (Z)</span>
               <span className="text-gray-200 font-bold px-3 py-1 bg-gray-800 border border-gray-600 rounded-sm">{zVal}</span>
            </div>
            <input 
              type="range" 
              min="-3" 
              max="3" 
              step="0.1" 
              value={zVal} 
              onChange={(e) => onZChange(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-gray-700 rounded-none appearance-none cursor-pointer accent-gray-400 hover:accent-white transition-colors"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-4 uppercase tracking-widest font-mono italic font-medium">
              <span>Favorable (-3)</span>
              <span className="opacity-40">|</span>
              <span>Neutral (0)</span>
              <span className="opacity-40">|</span>
              <span>Abyss (+3)</span>
            </div>
          </div>

          {/* Slider M */}
          <div className="slider-group">
            <div className="flex justify-between text-sm mb-4">
              <span className="text-gray-300 uppercase tracking-wide font-mono font-bold">Mediation Flaw (M)</span>
              <span className="text-red-400 font-bold px-3 py-1 bg-red-950/40 border border-red-800/60 rounded-sm">{mBias}</span>
            </div>
            <input 
              type="range" 
              min="-10" 
              max="10" 
              step="0.5" 
              value={mBias} 
              onChange={(e) => onMChange(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-gray-700 rounded-none appearance-none cursor-pointer accent-red-500 hover:accent-red-400 transition-colors"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-4 uppercase tracking-widest font-mono italic font-medium">
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
      <div className="mt-4 flex justify-between items-center pt-6 border-t border-gray-600/80">
        <div>
          <span className="text-sm text-gray-400 block uppercase tracking-[0.2em] mb-2 font-mono font-bold">Calculated Predictability</span>
          <span className="text-6xl text-white font-bold tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
            {prob}%
          </span>
        </div>
        <div className="text-right">
          <span className="text-sm text-gray-400 block uppercase tracking-[0.2em] mb-3 font-mono font-bold">Engine Status</span>
          <span className={`text-base px-5 py-2 rounded-sm border ${isSimulating ? 'text-red-400 border-red-500/60 bg-red-950/30' : 'text-green-400 border-green-500/60 bg-green-950/30'} font-bold uppercase tracking-widest shadow-lg`}>
            {isSimulating ? '> Calculating...' : '> Convergence Reached'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CyberParamsPanel;
