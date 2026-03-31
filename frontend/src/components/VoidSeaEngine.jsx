import React, { useEffect, useState } from 'react';
import { useLanguage } from './LanguageContext';

export default function VoidSeaEngine({ onReceiptClick }) {
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
            left: Math.random() * 90 + 5, // 5% to 95% left
            duration: Math.random() * 60 + 40, // 40s to 100s
            delay: Math.random() * -60, // Start midway
            opacity: Math.random() * 0.15 + 0.05 // 0.05 to 0.20
          }));
          setDriftingReceipts(mapped);
        }
      } catch(e) {}
    };
    fetchSea();
    const interval = setInterval(fetchSea, 60000); // refresh every minute
    return () => clearInterval(interval);
  }, []);

  if (driftingReceipts.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden mix-blend-screen" style={{ opacity: 1, zIndex: 1 }}>
      {driftingReceipts.map((receipt) => (
        <div 
          key={receipt.id}
          onClick={() => onReceiptClick(receipt)}
          className="absolute bottom-[-500px] w-48 p-4 font-mono text-black jagged-receipt animate-drift shadow-[0_0_15px_rgba(255,255,255,0.1)] pointer-events-auto cursor-pointer hover:scale-110 active:scale-95 transition-transform"
          style={{
            left: `${receipt.left}%`,
            animationDuration: `${receipt.duration}s`,
            animationDelay: `${receipt.delay}s`,
            opacity: receipt.opacity,
            filter: 'contrast(1.2) sepia(0.2)'
          }}
        >
          <div className="text-[8px] tracking-widest mb-2 border-b border-dashed border-gray-400 pb-1">{t('sea_receipt')} // {receipt.id.split('-')[0]}</div>
          <div className="text-[10px] break-words italic mb-2">"{receipt.confession_text.substring(0, 100)}{receipt.confession_text.length > 100 ? '...' : ''}"</div>
          <div className="text-[8px] flex justify-between uppercase">
            <span>U:{receipt.prob_score}%</span>
            <span>{receipt.is_catharsis ? t('sea_liberated') : t('sea_guilty')}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
