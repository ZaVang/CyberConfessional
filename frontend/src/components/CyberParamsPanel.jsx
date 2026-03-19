import React from 'react';

const TYPE_STYLES = {
  treatment: { border: 'border-cyan-500/30', text: 'text-cyan-400', bg: 'bg-transparent' },
  outcome: { border: 'border-gray-500/30', text: 'text-gray-300', bg: 'bg-transparent' },
  latent: { border: 'border-red-500/40', text: 'text-red-500', bg: 'bg-red-950/20', glow: 'drop-shadow-[0_0_5px_rgba(255,0,60,0.8)]' },
  confounder: { border: 'border-purple-500/40', text: 'text-purple-400', bg: 'bg-purple-900/20' },
  mediator: { border: 'border-yellow-500/40', text: 'text-yellow-400', bg: 'bg-yellow-900/20' }
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
    <div className="flex flex-col gap-8 p-8 bg-black/90 border border-cyan-500/40 rounded-xl shadow-[0_0_40px_rgba(0,240,255,0.15)] font-serif antialiased">
      
      <div className="border-b border-cyan-500/50 pb-3 mb-2">
        <h3 className="text-cyan-400 text-base tracking-[0.2em] uppercase font-bold">&gt; System.Causal_Metrics</h3>
      </div>

      {/* Top: Variables Horizontal */}
      <div className="flex flex-col gap-4">
        <div className="text-xs text-gray-500 uppercase tracking-widest mb-1 font-bold italic opacity-70">Causal State Variables</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {causalNodes.map((node, index) => {
            const style = TYPE_STYLES[node.type] || TYPE_STYLES.outcome;
            
            return (
              <div key={index} className={`p-4 border rounded-lg relative overflow-hidden ${style.bg} ${style.border} transition-all hover:scale-[1.05] hover:shadow-[0_0_15px_rgba(0,0,0,0.5)]`}>
                <div className="flex items-center gap-2 mb-2">
                  {node.type === 'latent' && (
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_#ff003c]"></span>
                  )}
                  <span className={`text-xs font-bold uppercase tracking-wider ${style.text}`}>
                    [{node.symbol}] {node.name}
                  </span>
                </div>
                <div className="flex flex-col mt-1">
                  <span className={`text-2xl font-bold font-mono ${style.text} ${style.glow || ''} tracking-tight`}>
                    {node.value}
                  </span>
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest mt-2 font-serif italic border-t border-gray-800/50 pt-1">
                    {node.desc || 'Variable'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Middle: Sliders Horizontal */}
      <div className="p-6 border border-cyan-500/30 bg-cyan-950/20 rounded-xl shadow-inner">
        <div className="text-xs text-cyan-400 uppercase tracking-[0.15em] mb-8 font-bold border-b border-cyan-500/20 pb-2 italic">
          &gt; Manual_Intervention_Sandbox
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Slider Z */}
          <div className="slider-group">
            <div className="flex justify-between text-xs mb-4">
              <span className="text-gray-300 uppercase tracking-wide font-serif">环境干预器 (Z)</span>
              <span className="text-cyan-400 font-bold px-3 py-1 bg-cyan-500/10 border border-cyan-500/40 rounded-md shadow-[0_0_10px_rgba(0,240,255,0.1)]">{zVal}</span>
            </div>
            <input 
              type="range" 
              min="-3" 
              max="3" 
              step="0.1" 
              value={zVal} 
              onChange={(e) => onZChange(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyan-500 hover:accent-cyan-400 transition-all"
            />
            <div className="flex justify-between text-[10px] text-gray-500 mt-3 uppercase tracking-widest font-serif italic">
              <span>顺风局 (-3)</span>
              <span className="opacity-40">|</span>
              <span>中立 (0)</span>
              <span className="opacity-40">|</span>
              <span>绝境 (+3)</span>
            </div>
          </div>

          {/* Slider M */}
          <div className="slider-group">
            <div className="flex justify-between text-xs mb-4">
              <span className="text-gray-300 uppercase tracking-wide font-serif">行为阻断器 (M)</span>
              <span className="text-yellow-400 font-bold px-3 py-1 bg-yellow-500/10 border border-yellow-500/40 rounded-md shadow-[0_0_10px_rgba(234,179,8,0.1)]">{mBias}</span>
            </div>
            <input 
              type="range" 
              min="-10" 
              max="10" 
              step="0.5" 
              value={mBias} 
              onChange={(e) => onMChange(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-yellow-500 hover:accent-yellow-400 transition-all"
            />
            <div className="flex justify-between text-[10px] text-gray-500 mt-3 uppercase tracking-widest font-serif italic">
              <span>绝对理性 (-10)</span>
              <span className="opacity-40">|</span>
              <span>平衡 (0)</span>
              <span className="opacity-40">|</span>
              <span>致命失控 (+10)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom: Probability Summary */}
      <div className="mt-2 flex justify-between items-center pt-6 border-t border-gray-800">
        <div>
          <span className="text-xs text-gray-400 block uppercase tracking-[0.2em] mb-1 font-serif">Success Probability</span>
          <span className="text-5xl text-green-400 font-bold drop-shadow-[0_0_15px_rgba(0,255,101,0.6)] tracking-tighter">
            {prob}%
          </span>
        </div>
        <div className="text-right">
          <span className="text-xs text-gray-400 block uppercase tracking-[0.2em] mb-2 font-serif">System Status</span>
          <span className={`text-sm px-4 py-1 rounded border ${isSimulating ? 'text-yellow-400 border-yellow-500/40 bg-yellow-950/20' : 'text-cyan-400 border-cyan-500/40 bg-cyan-950/20'} animate-pulse font-bold uppercase tracking-widest`}>
            {isSimulating ? 'Simulating...' : 'Converged'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CyberParamsPanel;
