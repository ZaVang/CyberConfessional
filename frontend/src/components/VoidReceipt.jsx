import React, { useState } from 'react';
import { useLanguage } from './LanguageContext';

export default function VoidReceipt({ result, confession, zVal, mBias, onClose, isReadOnly = false }) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  // Safely extract causal values
  const latentU = result?.engine_output?.inferred_latents?.U_hidden?.toFixed(4) || '0.0000';
  const realityY = result?.engine_input?.factual?.Y === 1 ? 'POSITIVE' : 'NEGATIVE';
  const prob = result?.engine_output?.counterfactual_prob ? (result.engine_output.counterfactual_prob * 100).toFixed(2) : 'ERR';

  const generateASCII = () => {
    return `
========================================
     ${t('receipt_title').split('').join(' ')}
========================================
[ ${t('receipt_subtitle')} ]
${isReadOnly ? `[ ${t('receipt_view_only')} ]` : ''}

${t('receipt_itemized')}
"${confession || 'Unspeakable Truth'}"

CAUSAL ASSESSMENTS:
> ${t('receipt_z')} : ${zVal}
> ${t('receipt_u')} : ${latentU}
> ${t('receipt_m')} : ${mBias}
> ${t('receipt_y')} : ${realityY}

${t('receipt_total')} (TAX):
${prob}%

> VERDICT SUMMARY STATUS:
${result?.verdict?.includes('<catharsis>') ? `[ ${t('receipt_liberated')} ]` : `[ ${t('receipt_guilty')} ]`}
========================================
NO REFUNDS ON DESTINY.
EVERYTHING IN ITS RIGHT PLACE.
========================================
`;
  };

  const [castStatus, setCastStatus] = useState(null); // 'casting' | 'success' | null
  const [showConsent, setShowConsent] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(generateASCII());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCast = async () => {
    setCastStatus('casting');
    try {
      const payload = {
        confession_text: confession || 'Unspeakable Truth',
        z_val: Number(zVal),
        m_bias: Number(mBias),
        prob_score: Number(prob) || 0,
        is_catharsis: Boolean(result?.verdict?.includes('<catharsis>'))
      };
      
      const response = await fetch('http://localhost:8888/api/receipts/cast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        setCastStatus('success');
        setTimeout(() => onClose(), 1500); // Close after showing success
      } else {
        setCastStatus(null);
      }
    } catch(err) {
      setCastStatus(null);
    }
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 transition-all duration-1000 ${castStatus === 'success' ? 'opacity-0 scale-90 blur-xl' : 'animate-entry'}`}
      onClick={(e) => {
        if (e.target === e.currentTarget && !castStatus) onClose();
      }}
    >
      <div className="relative w-full max-w-sm bg-[#fdfdf9] text-black shadow-[0_0_30px_rgba(255,255,255,0.4)] overflow-hidden flex flex-col font-mono" style={{ filter: 'contrast(1.2) sepia(0.2)' }}>
        
        {/* Receipt jagged top */}
        <div className="w-full h-4" style={{ backgroundImage: 'linear-gradient(45deg, transparent 33.333%, #fdfdf9 33.333%, #fdfdf9 66.667%, transparent 66.667%), linear-gradient(-45deg, transparent 33.333%, #fdfdf9 33.333%, #fdfdf9 66.667%, transparent 66.667%)', backgroundSize: '16px 32px', backgroundPosition: '0 -16px' }}></div>
        
        <div className="px-8 py-6 flex-1 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold tracking-widest text-[#111]">{t('receipt_title')}</h2>
            <div className="text-xs uppercase tracking-widest mt-1 opacity-70">
              {t('receipt_subtitle')}
              {isReadOnly && <span className="block text-[8px] mt-1 text-red-600 font-bold tracking-normal">[{t('receipt_view_only')}]</span>}
            </div>
            <div className="font-bold text-2xl mt-4 tracking-[-0.2em]">||| || | ||| | || |</div>
            <div className="text-[10px] uppercase mt-1">TX-{Math.random().toString(36).substr(2, 9).toUpperCase()}</div>
          </div>
          
          <div className="border-b-2 border-dashed border-gray-400 pb-4 mb-4">
            <div className="text-xs text-gray-500 uppercase font-bold mb-1">{t('receipt_itemized')}</div>
            <div className="text-sm font-serif italic mb-2 break-words">"{confession || 'Unspeakable Truth'}"</div>
          </div>

          <div className="space-y-2 text-xs mb-6 uppercase">
            <div className="flex justify-between">
              <span>{t('receipt_z')}</span>
              <span className="font-bold">{Number(zVal).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>{t('receipt_u')}</span>
              <span className="font-bold">{latentU}</span>
            </div>
            <div className="flex justify-between">
              <span>{t('receipt_m')}</span>
              <span className="font-bold">{Number(mBias).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>{t('receipt_y')}</span>
              <span className="font-bold">{realityY === 'POSITIVE' ? (t('language') === 'zh' ? '积极' : 'POSITIVE') : (t('language') === 'zh' ? '消极' : 'NEGATIVE')}</span>
            </div>
          </div>

          <div className="border-y-2 border-dashed border-gray-400 py-3 mb-6 bg-gray-100/50">
            <div className="flex justify-between items-end">
              <span className="text-sm font-bold uppercase">{t('receipt_total')}</span>
              <span className="text-xl font-bold w-full text-right">{prob}%</span>
            </div>
          </div>

          <div className="text-center mb-4">
            <div className="text-[10px] opacity-80 uppercase tracking-widest leading-loose">
              {result?.verdict?.includes('<catharsis>') ? t('receipt_liberated') : t('receipt_guilty')}
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

      <div className="absolute right-4 bottom-8 lg:right-8 lg:top-8 flex flex-col gap-4 pointer-events-auto z-[60]">
        {castStatus === 'success' ? (
           <div className="text-white font-mono tracking-widest text-center px-6 py-4 border border-green-500 bg-green-900/40">
             {t('receipt_cast_success')}
           </div>
        ) : isReadOnly ? (
          <button 
            onClick={onClose}
            className="px-6 py-3 border border-gray-600 bg-black text-gray-400 font-mono tracking-widest uppercase hover:bg-white hover:text-black transition-colors shadow-2xl"
          >
            {t('receipt_exit')}
          </button>
        ) : showConsent ? (
          <div className="bg-red-950/90 border border-red-500 p-6 flex flex-col gap-4 max-w-sm ml-auto backdrop-blur-md shadow-[0_0_30px_rgba(255,0,0,0.3)]">
            <h3 className="text-red-400 font-bold uppercase tracking-widest border-b border-red-500/50 pb-2 text-sm">{t('consent_warning')}</h3>
            <p className="text-gray-300 text-[10px] font-mono leading-relaxed whitespace-pre-line">
              {t('consent_body')}
            </p>
            <div className="flex flex-col gap-2 mt-2">
              <button 
                onClick={handleCast}
                disabled={castStatus === 'casting'}
                className="px-6 py-3 border border-yellow-500 bg-yellow-600 text-black font-mono tracking-widest uppercase hover:bg-yellow-400 hover:shadow-[0_0_15px_rgba(250,204,21,0.5)] transition-all font-bold"
              >
                {castStatus === 'casting' ? t('receipt_casting') : t('consent_yes')}
              </button>
              <button 
                onClick={() => setShowConsent(false)}
                className="px-6 py-3 border border-gray-600 bg-black/50 text-gray-400 font-mono tracking-widest uppercase hover:text-white transition-colors"
              >
                {t('cancel')}
              </button>
            </div>
          </div>
        ) : (
          <>
            <button 
              onClick={() => setShowConsent(true)}
              className="px-6 py-4 border border-yellow-600 bg-yellow-900/20 text-yellow-500 font-mono tracking-widest uppercase hover:bg-yellow-500 hover:text-black transition-all shadow-[0_0_15px_rgba(234,179,8,0.3)] animate-pulse"
            >
              {t('receipt_cast')}
            </button>
            <button 
              onClick={handleCopy}
              className="px-6 py-3 border border-gray-500 bg-black text-gray-200 font-mono tracking-widest uppercase hover:bg-white hover:text-black transition-colors shadow-2xl"
            >
              {copied ? t('receipt_copied') : t('receipt_copy')}
            </button>
            <button 
              onClick={onClose}
              className="px-6 py-3 border border-red-900 bg-black/60 text-red-500 font-mono tracking-widest uppercase hover:bg-red-900 hover:text-white transition-colors text-center shadow-2xl"
            >
              {t('close')}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
