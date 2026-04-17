import React from 'react';
import { useLanguage } from './LanguageContext';

const TYPE_STYLES = {
  treatment: { border: 'border-primary', text: 'text-primary', bg: 'bg-surface' },
  outcome: { border: 'border-tertiary', text: 'text-tertiary', bg: 'bg-surface' },
  latent: { border: 'border-error', text: 'text-error', bg: 'bg-surface' },
  confounder: { border: 'border-secondary', text: 'text-secondary', bg: 'bg-surface' },
  mediator: { border: 'border-secondary', text: 'text-secondary', bg: 'bg-surface' }
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
  const { t } = useLanguage();
  
  return (
    <div className="terminal-panel w-full max-w-4xl mx-auto animate-slide-up">
      
      {/* Header */}
      <div className="border-b border-border pb-3 mb-6 flex items-center justify-between">
        <h3 className="text-primary text-lg tracking-[0.2em] uppercase font-bold glitch" data-text={t('params_title')}>
          {t('params_title')}
        </h3>
        <span className="text-muted text-xs uppercase tracking-wider">
          <span className="text-secondary">[</span>
          SYSTEM_ACTIVE
          <span className="text-secondary">]</span>
        </span>
      </div>

      {/* Variables Section */}
      <div className="mb-8">
        <div className="text-sm text-tertiary uppercase tracking-widest mb-4 font-bold">
          <span className="text-secondary">//</span> CAUSAL_VARIABLES
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {causalNodes.map((node, index) => {
            const style = TYPE_STYLES[node.type] || TYPE_STYLES.outcome;
            
            return (
              <div 
                key={index} 
                className={`terminal-card ${style.border} relative overflow-hidden`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center gap-2 mb-2">
                  {node.type === 'latent' && (
                    <span className="text-[8px] text-error animate-blink">●</span>
                  )}
                  <span className={`text-sm font-bold uppercase tracking-wider ${style.text}`}>
                    [{node.symbol}] {node.name}
                  </span>
                </div>
                <div className="flex flex-col mt-3">
                  <span className={`text-3xl font-bold tracking-tight ${style.text}`}>
                    {node.value}
                  </span>
                  <span className="text-xs text-muted uppercase tracking-widest mt-3 border-t border-border pt-2 italic">
                    {node.desc || 'Variable'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Intervention Sliders Section */}
      <div className="terminal-card mb-8">
        <div className="text-sm text-tertiary uppercase tracking-[0.15em] mb-6 font-bold border-b border-border pb-3">
          <span className="text-secondary">$</span> INTERVENTION_SIMULATION
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Slider Z */}
          <div className="slider-group">
            <div className="flex justify-between items-center mb-4">
               <span className="text-text-primary uppercase tracking-wide font-bold">
                 <span className="text-tertiary">[Z]</span> MACRO_ENV
               </span>
               <span className="text-primary font-bold px-3 py-1 border border-primary bg-surface">
                 {zVal}
               </span>
            </div>
            <input 
              type="range" 
              min="-3" 
              max="3" 
              step="0.1" 
              value={zVal} 
              onChange={(e) => onZChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-border appearance-none cursor-pointer accent-primary"
              style={{
                background: `linear-gradient(to right, var(--primary) 0%, var(--primary) ${((zVal + 3) / 6) * 100}%, var(--border) ${((zVal + 3) / 6) * 100}%, var(--border) 100%)`
              }}
            />
            <div className="flex justify-between text-xs text-muted mt-3 uppercase tracking-widest">
              <span>[-3] COLLAPSE</span>
              <span className="opacity-40">|</span>
              <span>[0] BASELINE</span>
              <span className="opacity-40">|</span>
              <span>[+3] THRIVE</span>
            </div>
          </div>

          {/* Slider M */}
          <div className="slider-group">
            <div className="flex justify-between items-center mb-4">
              <span className="text-text-primary uppercase tracking-wide font-bold">
                <span className="text-secondary">[M]</span> MEDIATION
              </span>
              <span className="text-error font-bold px-3 py-1 border border-error bg-surface">
                {mBias}
              </span>
            </div>
            <input 
              type="range" 
              min="-10" 
              max="10" 
              step="0.5" 
              value={mBias} 
              onChange={(e) => onMChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-border appearance-none cursor-pointer accent-error"
              style={{
                background: `linear-gradient(to right, var(--secondary) 0%, var(--secondary) ${((mBias + 10) / 20) * 100}%, var(--border) ${((mBias + 10) / 20) * 100}%, var(--border) 100%)`
              }}
            />
            <div className="flex justify-between text-xs text-muted mt-3 uppercase tracking-widest">
              <span>[-10] FULL</span>
              <span className="opacity-40">|</span>
              <span>[0] NONE</span>
              <span className="opacity-40">|</span>
              <span>[+10] BLOCK</span>
            </div>
          </div>
        </div>
      </div>

      {/* Probability Summary */}
      <div className="flex justify-between items-center pt-6 border-t border-border">
        <div>
          <span className="text-xs text-muted block uppercase tracking-[0.2em] mb-2 font-bold">
            <span className="text-secondary">$</span> PREDICTABILITY_SCORE
          </span>
          <span className="text-5xl text-primary font-bold tracking-tighter">
            {prob}%
          </span>
        </div>
        <div className="text-right">
          <span className="text-xs text-muted block uppercase tracking-[0.2em] mb-3 font-bold">
            SYSTEM_STATUS
          </span>
          <span className={`text-sm px-4 py-2 border font-bold uppercase tracking-widest ${
            isSimulating 
              ? 'text-secondary border-secondary bg-surface' 
              : 'text-primary border-primary bg-surface'
          }`}>
            {isSimulating ? (
              <>
                <span className="loading-dots inline-flex gap-1 mr-2">
                  <span className="loading-dot"></span>
                  <span className="loading-dot"></span>
                  <span className="loading-dot"></span>
                </span>
                COMPUTING...
              </>
            ) : (
              '[+] CONVERGED'
            )}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CyberParamsPanel;
