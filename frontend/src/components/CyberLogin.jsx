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
        setErrorMsg(data.detail || '[ERR] Identity verification failed');
      }
    } catch (err) {
      setErrorMsg('[ERR] Network connection lost');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center font-mono text-gray-200 relative z-10 p-4">
      {/* CRT Overlay Effect */}
      <div className="crt-overlay"></div>
      
      <div className="max-w-lg w-full animate-slide-up">
        {/* Terminal Header */}
        <div className="text-center mb-8">
          <h1 
            className="text-primary text-xl md:text-2xl tracking-[0.15em] glitch font-bold" 
            data-text={t('login_title')}
          >
            {t('login_title')}
          </h1>
        </div>
        
        {/* Login Form - Terminal Style */}
        <form onSubmit={handleLogin} className="w-full flex flex-col items-center">
          <div className="w-full terminal-panel mb-4">
            <label className="text-xs text-tertiary uppercase tracking-wider mb-2 block">
              <span className="text-secondary">$</span> identifier:
            </label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t('login_placeholder')}
              className="terminal-input"
              autoFocus
            />
          </div>
          
          <button 
            type="submit" 
            disabled={isLoading || !username.trim()}
            className={`w-full py-3 border tracking-[0.3em] transition-all duration-300 font-mono text-sm
              ${(!isLoading && username.trim()) 
                ? 'terminal-btn cursor-pointer' 
                : 'border-[#333] text-[#333] cursor-not-allowed opacity-50'
              }
            `}
          >
            {isLoading ? (
              <span className="loading-indicator">
                <span className="loading-dots">
                  <span className="loading-dot"></span>
                  <span className="loading-dot"></span>
                  <span className="loading-dot"></span>
                </span>
                {t('login_parsing')}
              </span>
            ) : (
              <>
                <span className="text-secondary">$</span> {t('login_init')}
              </>
            )}
          </button>
        </form>

        {errorMsg && (
          <div className="mt-6 terminal-card border-error">
            <p className="text-error text-sm tracking-wider">
              <span className="text-secondary">!</span> {errorMsg}
            </p>
          </div>
        )}

        {/* Footer hint */}
        <div className="mt-8 text-center">
          <p className="text-muted text-xs uppercase tracking-widest">
            <span className="text-primary">[</span> All confessions are monitored <span className="text-primary">]</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CyberLogin;
