import React, { useState } from 'react';
import { useLanguage } from './LanguageContext';

const CyberLogin = ({ onLogin }) => {
  const { t } = useLanguage();
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username.trim()) return;

    setIsLoading(true);
    setErrorMsg('');

    try {
      const response = await fetch('http://localhost:8888/api/gate/identify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim() })
      });
      
      const data = await response.json();
      if (response.ok) {
        onLogin(data.is_new, data.username || username.trim(), data.user_id || null);
      } else {
        setErrorMsg(data.detail || '识别失败，世界线干扰。');
      }
    } catch (err) {
      setErrorMsg('网络失联，无法接入祭坛。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center font-mono text-gray-100 relative z-10 p-4">
      <div className="glass-panel max-w-lg w-full p-12 flex flex-col items-center rounded-sm animate-entry">
        <h1 className="text-gray-300 text-xl md:text-2xl tracking-[0.15em] mb-12 text-center font-mono glitch font-semibold" data-text={t('login_title')}>
          {t('login_title')}
        </h1>
        
        <form onSubmit={handleLogin} className="w-full flex flex-col items-center">
          <input 
            type="text" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder={t('login_placeholder')}
            className="w-full bg-black/40 border-b-2 border-gray-700 text-center text-2xl py-3 focus:outline-none focus:border-red-500 transition-colors duration-300 tracking-widest text-gray-100 placeholder-gray-600 font-mono"
            autoFocus
          />
          
          <button 
            type="submit" 
            disabled={isLoading || !username.trim()}
            className={`mt-12 w-full py-3 border tracking-[0.5em] focus:outline-none transition-all duration-500 font-mono text-sm
              ${(!isLoading && username.trim()) 
                ? 'border-gray-500 text-gray-200 hover:border-red-500 hover:text-red-400 hover:shadow-[0_0_20px_rgba(255,51,51,0.3)] hover:bg-red-950/40 cursor-pointer' 
                : 'border-gray-800 text-gray-600 opacity-60 cursor-not-allowed bg-black/20'
              }
            `}
          >
            {isLoading ? t('login_parsing') : t('login_init')}
          </button>
        </form>

        {errorMsg && (
          <p className="mt-8 text-red-500 font-mono text-base tracking-widest text-center glass-panel px-4 py-2 border-red-900/50">
            &gt; {errorMsg}
          </p>
        )}
      </div>
    </div>
  );
};

export default CyberLogin;
