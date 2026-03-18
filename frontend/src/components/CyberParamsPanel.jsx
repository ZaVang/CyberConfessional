import React from 'react';

const TYPE_STYLES = {
  treatment: { border: 'border-cyan-500/30', text: 'text-cyan-400', bg: 'bg-transparent' },
  outcome: { border: 'border-gray-500/30', text: 'text-gray-300', bg: 'bg-transparent' },
  latent: { border: 'border-red-500/40', text: 'text-red-500', bg: 'bg-red-950/20', glow: 'drop-shadow-[0_0_5px_rgba(255,0,60,0.8)]' },
  confounder: { border: 'border-purple-500/40', text: 'text-purple-400', bg: 'bg-purple-900/20' },
  mediator: { border: 'border-yellow-500/40', text: 'text-yellow-400', bg: 'bg-yellow-900/20' }
};

const CyberParamsPanel = ({ prob, causalNodes = [] }) => {
  return (
    <div className="flex flex-col gap-4 p-6 bg-black/80 border border-cyan-500/30 rounded-lg shadow-[0_0_25px_rgba(0,240,255,0.1)] font-mono">
      
      <div className="border-b border-cyan-500/50 pb-2 mb-2">
        <h3 className="text-cyan-400 text-sm tracking-widest uppercase font-bold">&gt; System.Causal_Metrics</h3>
      </div>

      <div className="flex flex-col gap-3">
        {causalNodes.map((node, index) => {
          const style = TYPE_STYLES[node.type] || TYPE_STYLES.outcome;
          
          return (
            <div key={index} className={`p-3 border rounded relative overflow-hidden ${style.bg} ${style.border} transition-all hover:scale-[1.02]`}>
              <div className="flex items-center gap-2 mb-1">
                {node.type === 'latent' && (
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                )}
                <span className={`text-xs font-bold uppercase ${style.text}`}>
                  [{node.symbol}] {node.name}
                </span>
              </div>
              <div className="flex justify-between items-end mt-1">
                <span className="text-[10px] text-gray-500 uppercase tracking-tighter">{node.desc || 'System Variable'}</span>
                <span className={`text-xl font-bold ${style.text} ${style.glow || ''}`}>
                  {node.value}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex justify-between items-center pt-4 border-t border-gray-800">
        <div>
          <span className="text-[10px] text-gray-500 block uppercase tracking-widest">Counterfactual Prob</span>
          <span className="text-3xl text-green-400 font-bold drop-shadow-[0_0_10px_rgba(0,255,101,0.5)]">
            {prob}%
          </span>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-gray-500 block uppercase tracking-widest">World Status</span>
          <span className="text-xs text-cyan-400 animate-pulse font-bold uppercase">Converged</span>
        </div>
      </div>
    </div>
  );
};

export default CyberParamsPanel;
