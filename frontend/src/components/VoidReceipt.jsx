import React, { useState } from 'react';

export default function VoidReceipt({ result, confession, zVal, mBias, onClose }) {
  const [copied, setCopied] = useState(false);

  // Safely extract causal values
  const latentU = result?.engine_output?.inferred_latents?.U_hidden?.toFixed(4) || '0.0000';
  const realityY = result?.engine_input?.factual?.Y === 1 ? 'POSITIVE' : 'NEGATIVE';
  const prob = result?.engine_output?.counterfactual_prob ? (result.engine_output.counterfactual_prob * 100).toFixed(2) : 'ERR';

  const generateASCII = () => {
    return `
========================================
     C Y B E R   C O N F E S S I O N
========================================
[ RECEIPT OF DESTINY ]

ANOMALY LOGGED:
"${confession || 'Unspeakable Truth'}"

CAUSAL ASSESSMENTS:
> Environment Bias (Z) : ${zVal}
> Latent Fate (U)      : ${latentU}
> Self-Sabotage (M)    : ${mBias}
> Destiny Reality (Y)  : ${realityY}

CAUSAL PROBABILITY SCORE (TAX):
${prob}%

> VERDICT SUMMARY STATUS:
${result?.verdict?.includes('<catharsis>') ? '[ CATHARSIS ACHIEVED. SOUL LIBERATED. ]' : '[ GUILTY OF ESCAPISM. KARMA POLICE DISPATCHED. ]'}
========================================
NO REFUNDS ON DESTINY.
EVERYTHING IN ITS RIGHT PLACE.
========================================
`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateASCII());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-entry">
      <div className="relative w-full max-w-sm bg-[#fdfdf9] text-black shadow-[0_0_30px_rgba(255,255,255,0.4)] overflow-hidden flex flex-col font-mono" style={{ filter: 'contrast(1.2) sepia(0.2)' }}>
        
        {/* Receipt jagged top */}
        <div className="w-full h-4" style={{ backgroundImage: 'linear-gradient(45deg, transparent 33.333%, #fdfdf9 33.333%, #fdfdf9 66.667%, transparent 66.667%), linear-gradient(-45deg, transparent 33.333%, #fdfdf9 33.333%, #fdfdf9 66.667%, transparent 66.667%)', backgroundSize: '16px 32px', backgroundPosition: '0 -16px' }}></div>
        
        <div className="px-8 py-6 flex-1 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold tracking-widest text-[#111]">CYBER CONFESSIONAL</h2>
            <div className="text-xs uppercase tracking-widest mt-1 opacity-70">RECEIPT OF DESTINY</div>
            <div className="font-bold text-2xl mt-4 tracking-[-0.2em]">||| || | ||| | || |</div>
            <div className="text-[10px] uppercase mt-1">TX-{Math.random().toString(36).substr(2, 9).toUpperCase()}</div>
          </div>
          
          <div className="border-b-2 border-dashed border-gray-400 pb-4 mb-4">
            <div className="text-xs text-gray-500 uppercase font-bold mb-1">Itemized Anomaly:</div>
            <div className="text-sm font-serif italic mb-2 break-words">"{confession || 'Unspeakable Truth'}"</div>
          </div>

          <div className="space-y-2 text-xs mb-6 uppercase">
            <div className="flex justify-between">
              <span>Environment Tax (Z)</span>
              <span className="font-bold">{Number(zVal).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Latent Fate (U)</span>
              <span className="font-bold">{latentU}</span>
            </div>
            <div className="flex justify-between">
              <span>Self-Sabotage Surcharge (M)</span>
              <span className="font-bold">{Number(mBias).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Observed Reality (Y)</span>
              <span className="font-bold">{realityY}</span>
            </div>
          </div>

          <div className="border-y-2 border-dashed border-gray-400 py-3 mb-6 bg-gray-100/50">
            <div className="flex justify-between items-end">
              <span className="text-sm font-bold uppercase">Total Causal Probability</span>
              <span className="text-xl font-bold w-full text-right">{prob}%</span>
            </div>
          </div>

          <div className="text-center mb-4">
            <div className="text-[10px] opacity-80 uppercase tracking-widest leading-loose">
              {result?.verdict?.includes('<catharsis>') ? 'STATUS: SOUL LIBERATED' : 'STATUS: KARMA POLICE DISPATCHED'}
              <br/>
              Everything in its right place.<br/>
              NO REFUNDS ON DESTINY.
            </div>
          </div>
          
          <div className="text-center mb-4 mt-6">
            <div className="text-[9px] uppercase tracking-widest mt-1 opacity-60 flex justify-between">
                <span>TERMS & CONDITIONS APPLY</span>
                <span>{new Date().toLocaleDateString()}</span>
            </div>
          </div>
          
        </div>

        {/* Receipt jagged bottom */}
        <div className="w-full h-4 mt-auto rotate-180" style={{ backgroundImage: 'linear-gradient(45deg, transparent 33.333%, #fdfdf9 33.333%, #fdfdf9 66.667%, transparent 66.667%), linear-gradient(-45deg, transparent 33.333%, #fdfdf9 33.333%, #fdfdf9 66.667%, transparent 66.667%)', backgroundSize: '16px 32px', backgroundPosition: '0 -16px' }}></div>
      </div>

      <div className="absolute right-4 bottom-8 lg:right-8 lg:top-8 flex flex-col gap-4">
        <button 
          onClick={handleCopy}
          className="px-6 py-3 border border-gray-500 bg-black text-gray-200 font-mono tracking-widest uppercase hover:bg-white hover:text-black transition-colors shadow-2xl"
        >
          {copied ? 'ASCII COPIED TO CLIPBOARD' : 'COPY ASCII RECEIPT'}
        </button>
        <button 
          onClick={onClose}
          className="px-6 py-3 border border-red-900 bg-black/60 text-red-500 font-mono tracking-widest uppercase hover:bg-red-900 hover:text-white transition-colors text-center shadow-2xl"
        >
          DISCARD RECEIPT
        </button>
      </div>
    </div>
  );
}
