import React, { useEffect, useState } from 'react';
import { useLanguage } from './LanguageContext';

export default function VoidSeaEngine({ onReceiptClick, soulId }) {
  const { t } = useLanguage();
  const [driftingReceipts, setDriftingReceipts] = useState([]);

  useEffect(() => {
    const fetchSea = async () => {
      try {
        const res = await fetch('http://localhost:8888/api/receipts/drift');
        if (res.ok) {
          const data = await res.json();
          const mapped = data.map(r => ({
            ...r,
            left: Math.random() * 90 + 5,
            duration: Math.random() * 60 + 40,
            delay: Math.random() * -60,
            opacity: Math.random() * 0.15 + 0.05,
            resonateStatus: null // null | 'sending' | 'sent'
          }));
          setDriftingReceipts(mapped);
        }
      } catch(e) {}
    };
    fetchSea();
    const interval = setInterval(fetchSea, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleResonate = async (e, receiptId) => {
    e.stopPropagation(); // Don't open receipt view
    setDriftingReceipts(prev =>
      prev.map(r => r.id === receiptId ? { ...r, resonateStatus: 'sending' } : r)
    );
    try {
      await fetch(`http://localhost:8888/api/receipts/${receiptId}/resonate`, {
        method: 'POST'
      });
      setDriftingReceipts(prev =>
        prev.map(r => r.id === receiptId
          ? { ...r, resonateStatus: 'sent', resonance_count: (r.resonance_count || 0) + 1 }
          : r
        )
      );
    } catch(e) {
      setDriftingReceipts(prev =>
        prev.map(r => r.id === receiptId ? { ...r, resonateStatus: null } : r)
      );
    }
  };

  if (driftingReceipts.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 1 }}>
      {driftingReceipts.map((receipt) => (
        <div
          key={receipt.id}
          onClick={() => onReceiptClick(receipt)}
          className="absolute bottom-[-500px] w-48 font-mono text-black jagged-receipt animate-drift shadow-[0_0_15px_rgba(255,255,255,0.1)] pointer-events-auto cursor-pointer hover:scale-105 active:scale-95 transition-transform"
          style={{
            left: `${receipt.left}%`,
            animationDuration: `${receipt.duration}s`,
            animationDelay: `${receipt.delay}s`,
            opacity: Math.random() * 0.3 + 0.2, // Increased from 0.05-0.2 to 0.2-0.5
            filter: 'contrast(1.1) sepia(0.1)'
          }}
        >
          <div className="p-4">
            <div className="text-[8px] tracking-widest mb-2 border-b border-dashed border-gray-400 pb-1">
              {t('sea_receipt')} // {receipt.id.split('-')[0]}
            </div>
            <div className="text-[10px] break-words italic mb-2">
              "{receipt.confession_text.substring(0, 100)}{receipt.confession_text.length > 100 ? '...' : ''}"
            </div>
            <div className="text-[8px] flex justify-between uppercase mb-2">
              <span>U:{receipt.prob_score}%</span>
              <span>{receipt.is_catharsis ? t('sea_liberated') : t('sea_guilty')}</span>
            </div>

            {/* Resonance Button - Made more prominent */}
            <button
              onClick={(e) => handleResonate(e, receipt.id)}
              disabled={receipt.resonateStatus === 'sending' || receipt.resonateStatus === 'sent'}
              className={`w-full text-[9px] uppercase tracking-widest py-2 border-2 transition-all font-bold mt-3 shadow-sm
                ${receipt.resonateStatus === 'sent'
                  ? 'border-green-600 text-green-700 bg-green-100/50'
                  : 'border-[#ff003c] text-[#ff003c] hover:bg-[#ff003c] hover:text-white bg-white/40'
                }`}
            >
              {receipt.resonateStatus === 'sending'
                ? t('sea_resonating')
                : receipt.resonateStatus === 'sent'
                  ? t('sea_resonated')
                  : `${t('sea_resonate')}${receipt.resonance_count > 0 ? ` (${receipt.resonance_count})` : ''}`
              }
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
