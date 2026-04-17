import React, { useState } from 'react';
import { useLanguage } from './LanguageContext';

export default function VoidReceipt({ result, confession, zVal, mBias, onClose, isReadOnly = false, soulId = null }) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  // Safely extract causal values
  const latentU = result?.engine_output?.inferred_latents?.U_hidden?.toFixed(4) || '0.0000';
  const realityY = result?.engine_input?.factual?.Y === 1 ? 'POSITIVE' : 'NEGATIVE';
  const prob = result?.engine_output?.counterfactual_prob ? (result.engine_output.counterfactual_prob * 100).toFixed(2) : 'ERR';

  const isCatharsis = result?.verdict?.includes('<catharsis>');

  const [castStatus, setCastStatus] = useState(null); // 'casting' | 'success' | null
  const [showConsent, setShowConsent] = useState(false);

  const handleCopy = () => {
    const receiptText = `
========================================
     VOID RECEIPT
     Causal Analysis Output
========================================
[ Transaction ID: TX-${Math.random().toString(36).substr(2, 9).toUpperCase()} ]
${isReadOnly ? '[ VIEW ONLY MODE ]' : ''}

CONFESSION:
"${confession || 'Encrypted Truth'}"

CAUSAL ASSESSMENTS:
  > Z (Macro Env):  ${zVal}
  > U (Latent):    ${latentU}
  > M (Mediation): ${mBias}
  > Y (Reality):   ${realityY}

TOTAL KARMA BALANCE: ${prob}%

STATUS: ${isCatharsis ? '[ LIBERATED ]' : '[ BOUND ]'}

========================================
NO REFUNDS ON DESTINY.
EVERYTHING IN ITS RIGHT PLACE.
========================================
`;
    navigator.clipboard.writeText(receiptText);
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
        is_catharsis: Boolean(result?.verdict?.includes('<catharsis>')),
        soul_id: soulId || null
      };
      
      const response = await fetch('http://localhost:8888/api/receipts/cast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        setCastStatus('success');
        setTimeout(() => onClose(), 1500);
      } else {
        setCastStatus(null);
      }
    } catch(err) {
      setCastStatus(null);
    }
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 transition-all duration-500 ${castStatus === 'success' ? 'opacity-0 scale-90' : 'animate-fade-in'}`}
      onClick={(e) => {
        if (e.target === e.currentTarget && !castStatus) onClose();
      }}
    >
      {/* CRT Overlay */}
      <div className="crt-overlay"></div>

      {/* Terminal-style Receipt */}
      <div className="relative w-full max-w-md bg-surface border border-primary overflow-hidden">
        
        {/* Receipt Header - ASCII style */}
        <div className="bg-primary text-background p-3">
          <pre className="text-[8px] leading-tight text-center" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
{`
╔═══════════════════════════════════════╗
║      V O I D   R E C E I P T          ║
╚═══════════════════════════════════════╝
`}
          </pre>
          <div className="text-center text-xs uppercase tracking-widest mt-1">
            {t('receipt_title')}
          </div>
          <div className="text-center text-[10px] mt-1 opacity-80">
            TX-{Math.random().toString(36).substr(2, 9).toUpperCase()}
          </div>
        </div>
        
        <div className="p-6">
          {/* Confession Item */}
          <div className="mb-6 pb-4 border-b border-dashed border-primary/50">
            <div className="text-xs text-tertiary uppercase tracking-wider mb-2">
              <span className="text-secondary">$</span> confession_input:
            </div>
            <div className="text-sm text-text-primary italic pl-4 border-l-2 border-primary/30">
              "{confession || 'Encrypted Truth'}"
            </div>
            {isReadOnly && (
              <div className="text-xs text-secondary mt-2 uppercase tracking-wider">
                [ {t('receipt_view_only')} ]
              </div>
            )}
          </div>

          {/* Causal Data */}
          <div className="space-y-3 mb-6">
            <div className="flex justify-between items-center terminal-card">
              <span className="text-xs text-muted uppercase tracking-wider">
                <span className="text-tertiary">[Z]</span> Macro Env
              </span>
              <span className="text-primary font-bold">{Number(zVal).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center terminal-card">
              <span className="text-xs text-muted uppercase tracking-wider">
                <span className="text-secondary">[U]</span> Latent Fate
              </span>
              <span className="text-secondary font-bold">{latentU}</span>
            </div>
            <div className="flex justify-between items-center terminal-card">
              <span className="text-xs text-muted uppercase tracking-wider">
                <span className="text-tertiary">[M]</span> Mediation
              </span>
              <span className="text-primary font-bold">{Number(mBias).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center terminal-card">
              <span className="text-xs text-muted uppercase tracking-wider">
                <span className="text-tertiary">[Y]</span> Reality
              </span>
              <span className={`${realityY === 'POSITIVE' ? 'text-primary' : 'text-error'} font-bold`}>
                {realityY === 'POSITIVE' ? (t('language') === 'zh' ? '积极' : 'POSITIVE') : (t('language') === 'zh' ? '消极' : 'NEGATIVE')}
              </span>
            </div>
          </div>

          {/* Total */}
          <div className="bg-surface border border-secondary p-4 mb-6">
            <div className="flex justify-between items-end">
              <span className="text-xs text-secondary uppercase tracking-wider font-bold">
                <span className="text-muted">$</span> TOTAL_BALANCE
              </span>
              <span className="text-2xl font-bold text-primary">{prob}%</span>
            </div>
          </div>

          {/* Status */}
          <div className="text-center mb-6 terminal-card border-secondary">
            <div className="text-xs text-secondary uppercase tracking-widest mb-2">
              <span className="text-muted">@</span> VERDICT
            </div>
            <div className={`text-lg font-bold ${isCatharsis ? 'text-primary' : 'text-error'}`}>
              {isCatharsis ? `[ ${t('receipt_liberated')} ]` : `[ ${t('receipt_guilty')} ]`}
            </div>
          </div>

          {/* Footer Message */}
          <div className="text-center text-xs text-muted uppercase tracking-wider leading-loose">
            Everything in its right place.<br/>
            NO REFUNDS ON DESTINY.
          </div>

          {/* Timestamp */}
          <div className="text-center mt-4 pt-4 border-t border-border">
            <span className="text-[10px] text-muted uppercase tracking-widest">
              {new Date().toLocaleDateString()} | {new Date().toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="absolute right-4 bottom-8 lg:right-8 lg:top-8 flex flex-col gap-3 pointer-events-auto z-[60]">
        {castStatus === 'success' ? (
           <div className="terminal-btn border-primary text-primary px-6 py-3">
             [+] {t('receipt_cast_success')}
           </div>
        ) : isReadOnly ? (
          <button 
            onClick={onClose}
            className="terminal-btn"
          >
            <span className="text-muted">$</span> EXIT
          </button>
        ) : showConsent ? (
          <div className="terminal-card border-error p-4 max-w-sm">
            <div className="text-error text-xs uppercase tracking-wider mb-3 font-bold">
              [!] WARNING
            </div>
            <p className="text-text-primary text-xs leading-relaxed mb-4 whitespace-pre-line">
              {t('consent_body')}
            </p>
            <div className="flex flex-col gap-2">
              <button 
                onClick={handleCast}
                disabled={castStatus === 'casting'}
                className="terminal-btn border-secondary text-secondary"
              >
                {castStatus === 'casting' ? (
                  <span className="loading-indicator">
                    <span className="loading-dots">
                      <span className="loading-dot"></span>
                      <span className="loading-dot"></span>
                      <span className="loading-dot"></span>
                    </span>
                  </span>
                ) : (
                  <><span className="text-primary">$</span> CONFIRM CAST</>
                )}
              </button>
              <button 
                onClick={() => setShowConsent(false)}
                className="terminal-btn"
              >
                <span className="text-muted">$</span> ABORT
              </button>
            </div>
          </div>
        ) : (
          <>
            <button 
              onClick={() => setShowConsent(true)}
              className="terminal-btn border-secondary text-secondary animate-blink"
            >
              <span className="text-secondary">$</span> CAST_TO_VOID
            </button>
            <button 
              onClick={handleCopy}
              className={`terminal-btn ${copied ? 'border-primary text-primary' : ''}`}
            >
              {copied ? (
                <><span className="text-primary">*</span> COPIED</>
              ) : (
                <><span className="text-muted">$</span> COPY_ASCII</>
              )}
            </button>
            <button 
              onClick={onClose}
              className="terminal-btn"
            >
              <span className="text-muted">$</span> CLOSE
            </button>
          </>
        )}
      </div>
    </div>
  );
}
