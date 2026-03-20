import React, { useState } from 'react';

const CyberLogin = ({ onLogin }) => {
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
        onLogin(data.is_new, data.username || username.trim());
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
    <div className="w-full h-screen bg-black flex flex-col items-center justify-center font-serif text-gray-200">
      <div className="max-w-md w-full px-8 flex flex-col items-center">
        <h1 className="text-gray-400 text-xl tracking-[0.3em] mb-12 animate-pulse text-center">
          今天，是哪个迷途的灵魂来到了祭坛？
        </h1>
        
        <form onSubmit={handleLogin} className="w-full flex flex-col items-center">
          <input 
            type="text" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="输入你的代号..."
            className="w-full bg-transparent border-b border-gray-700 text-center text-xl pb-2 focus:outline-none focus:border-cyan-500 transition-colors duration-500 tracking-widest text-cyan-50 placeholder-gray-800 font-mono"
            autoFocus
          />
          
          <button 
            type="submit" 
            disabled={isLoading || !username.trim()}
            className={`mt-12 w-full py-3 border tracking-[0.5em] focus:outline-none transition-all duration-500 font-mono text-sm
              ${(!isLoading && username.trim()) 
                ? 'border-cyan-800 text-cyan-600 hover:border-cyan-400 hover:text-cyan-300 hover:shadow-[0_0_15px_rgba(0,255,255,0.2)] hover:bg-cyan-950/20' 
                : 'border-gray-900 text-gray-800 opacity-50 cursor-not-allowed'
              }
            `}
          >
            {isLoading ? '解析中...' : '觐见 (Seek Audience)'}
          </button>
        </form>

        {errorMsg && (
          <p className="mt-8 text-red-500 font-mono text-sm tracking-widest text-center animate-pulse">
            &gt; {errorMsg}
          </p>
        )}
      </div>
    </div>
  );
};

export default CyberLogin;
