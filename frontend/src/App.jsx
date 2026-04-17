import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import CyberParamsPanel from './components/CyberParamsPanel';
import MermaidDAG from './components/MermaidDAG';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import CyberLogin from './components/CyberLogin';
import CyberOnboarding from './components/CyberOnboarding';
import BackgroundMantras from './components/BackgroundMantras';
import UserDashboard from './components/UserDashboard';
import BackgroundAudio from './components/BackgroundAudio';
import VoidReceipt from './components/VoidReceipt';
import VoidSeaEngine from './components/VoidSeaEngine';
import { LanguageProvider, useLanguage } from './components/LanguageContext';

function AppContent() {
  const { t, toggleLanguage, language } = useLanguage();
  const [appState, setAppState] = useState('login'); // 'login' | 'onboarding' | 'confessional'
  const [activeTab, setActiveTab] = useState('altar'); // 'altar' | 'archives'
  const [userId, setUserId] = useState('');   // username string
  const [soulId, setSoulId] = useState('');   // UUID string for API calls
  const [resonanceAlert, setResonanceAlert] = useState(null); // null | { count: number }
  
  const [messages, setMessages] = useState([]);
  const [confession, setConfession] = useState('');
  const [futureAspiration, setFutureAspiration] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [viewingReceipt, setViewingReceipt] = useState(null);
  const typingTimeoutRef = useRef(null);
  const [isComputing, setIsComputing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false); // Used when waiting for LLM
  const [logs, setLogs] = useState([]);
  const [result, setResult] = useState(null);
  const [isDataExpanded, setIsDataExpanded] = useState(false);
  const logContainerRef = useRef(null);

  const simulateLogs = async (signal) => {
    const sequence = [
      { text: t('login_parsing'), type: 'system' },
      { text: "[System] Parsing pathetic human error logs...", type: 'engine' },
      { text: "[Engine] Extracting fatal flaw (Latent Variable U)...", type: 'engine' },
      { text: "[System] Calculating slow suffocation (Macro Environment Z)...", type: 'system' },
      { text: "[Engine] Identifying self-sabotage mechanisms (Mediation M)...", type: 'engine' },
      { text: "> Arresting time-line anomalies...", type: 'success' },
      { text: "[System] Rejecting escapism. Escapism is invalid...", type: 'warning' },
      { text: "> Everything in its right place. Executing verdict...", type: 'success' }
    ];

    for (const msg of sequence) {
      if (!signal.active) break;
      setLogs(prev => [...prev, msg]);
      await new Promise(r => setTimeout(r, 400 + Math.random() * 300));
    }
  };

  const handleConfess = async () => {
    if (!confession.trim()) return;

    const newMessages = [...messages, { role: 'user', content: confession }];
    setMessages(newMessages);
    setConfession('');

    setIsGenerating(true);
    setIsComputing(true);
    setLogs([]);
    setResult(null);
    setIsDataExpanded(false);

    let simulationSignal = { active: true };

    try {
      const response = await fetch('http://localhost:8888/confess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: newMessages, 
          username: userId,
          future_aspiration: futureAspiration.trim() || null
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Temporal breakdown');
      }

      const data = await response.json();
      setIsGenerating(false);

      if (!data.is_complete) {
        // It's a clarification question
        setMessages(prev => [...prev, { role: 'assistant', content: data.clarification_question }]);
        setIsComputing(false);
        return;
      }

      // If complete, start simulation logs
      const logPromise = simulateLogs(simulationSignal);
      await logPromise;
      
      let verdictText = data.verdict;
      try {
        const parsedVerdict = JSON.parse(data.verdict);
        verdictText = parsedVerdict.message || data.verdict;
      } catch (e) {}

      setMessages(prev => [...prev, { role: 'assistant', content: verdictText, isVerdict: true }]);
      setResult(data);
    } catch (err) {
      simulationSignal.active = false;
      setIsGenerating(false);
      setLogs(prev => [...prev, { text: `[Error] ${err.message}. Ensure backend is running.`, type: 'error' }]);
    } finally {
      setIsComputing(false);
    }
  };

  // Resonance polling: check for new signals when in confessional
  useEffect(() => {
    if (appState !== 'confessional' || !soulId) return;
    const checkResonances = async () => {
      try {
        const res = await fetch(`http://localhost:8888/api/receipts/resonances/${soulId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.new_resonance_count > 0) {
            setResonanceAlert({ count: data.new_resonance_count });
          }
        }
      } catch(e) {}
    };
    checkResonances();
    const interval = setInterval(checkResonances, 30000); // every 30s
    return () => clearInterval(interval);
  }, [appState, soulId]);

  const dismissResonanceAlert = async () => {
    setResonanceAlert(null);
    if (!soulId) return;
    try {
      await fetch(`http://localhost:8888/api/receipts/resonances/${soulId}/dismiss`, { method: 'POST' });
    } catch(e) {}
  };

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // Helper for causal nodes
  const getCausalNodes = (result) => {
    if (!result) return [];
    return [
      {
        type: 'treatment',
        symbol: 'X',
        name: 'Decision',
        value: result.engine_input.factual.X === 1 ? 'ACTION' : 'NO_ACTION',
        desc: 'Selected intervention point'
      },
      {
        type: 'outcome',
        symbol: 'Y',
        name: 'Reality',
        value: result.engine_input.factual.Y === 1 ? 'POSITIVE' : 'NEGATIVE',
        desc: 'Observed temporal outcome'
      },
      {
        type: 'latent',
        symbol: 'U',
        name: 'Hidden Fate',
        value: result.engine_output.inferred_latents.U_hidden?.toFixed(4) || '0.0000',
        desc: 'Deep latent cognition bias'
      }
    ];
  };

  const [zVal, setZVal] = useState(1.0);
  const [mBias, setMBias] = useState(0.0);
  const [isSimulating, setIsSimulating] = useState(false);
  const debounceTimer = useRef(null);

  // 当结果返回时，同步初始参数
  useEffect(() => {
    if (result && result.engine_input) {
      setZVal(result.engine_input.graph_params.z_val || 1.0);
      setMBias(result.engine_input.graph_params.m_weights.bias || 0.0);
    }
  }, [result?.confession]); // 仅在告解内容变化（新告解）时同步，避免模拟时被重置

  const handleSimulate = async (newZ, newMBias) => {
    if (!result) return;
    
    setIsSimulating(true);
    try {
      const response = await fetch('http://localhost:8888/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          engine_input: result.engine_input,
          new_z: newZ,
          new_m_bias: newMBias
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // 更新结果中的概率和 Mermaid 图，但不替换整个结果（保留判词）
        setResult(prev => ({
          ...prev,
          engine_output: {
            ...prev.engine_output,
            counterfactual_prob: data.counterfactual_prob,
            inferred_latents: data.inferred_latents
          },
          mermaid_chart: data.mermaid_chart
        }));
      }
    } catch (err) {
      console.error("Simulation failed:", err);
    } finally {
      setIsSimulating(false);
    }
  };

  const onZChange = (val) => {
    setZVal(val);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => handleSimulate(val, mBias), 150);
  };

  const onMChange = (val) => {
    setMBias(val);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => handleSimulate(zVal, val), 150);
  };

  const handleLoginSuccess = (isNewUser, usernameStr, uuidStr) => {
    setUserId(usernameStr);
    setSoulId(uuidStr || '');
    if (isNewUser) {
      setAppState('onboarding');
    } else {
      setAppState('confessional');
    }
  };

  const handleCalibrationComplete = (usernameStr, uuidStr) => {
    setUserId(usernameStr);
    setSoulId(uuidStr || '');
    setAppState('confessional');
  };

  const getIsCatharsisActive = () => {
    if (!result || !result.verdict) return false;
    let text = result.verdict;
    try {
      const parsed = JSON.parse(text);
      text = parsed.message || text;
    } catch(e) {}
    return Boolean(typeof text === 'string' && text.match(/<catharsis>([\s\S]*?)<\/catharsis>/i));
  };
  const isCatharsisActive = getIsCatharsisActive();

  // Extract probability
  const prob = result?.engine_output?.counterfactual_prob 
    ? (result.engine_output.counterfactual_prob * 100).toFixed(2) 
    : '0.00';

  return (
    <>
      <BackgroundAudio isPlaying={appState !== 'login'} isCatharsisActive={isCatharsisActive} />
      <BackgroundMantras isCatharsisActive={isCatharsisActive} />
      <VoidSeaEngine onReceiptClick={(r) => setViewingReceipt(r)} soulId={soulId} />
      
      {/* CRT Overlay Effect - Global */}
      <div className="crt-overlay"></div>
      
      {/* Resonance Interference Notification - Terminal Style */}
      {resonanceAlert && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 animate-fade-in"
          onClick={dismissResonanceAlert}
        >
          <div
            className="relative terminal-panel border-tertiary max-w-md p-8 text-center"
            onClick={e => e.stopPropagation()}
          >
            <div className="text-tertiary text-xs uppercase tracking-[0.4em] mb-6 animate-blink cursor-blink">
              // RESONANCE_INTERFERENCE_DETECTED
            </div>
            <div className="text-4xl mb-4 text-tertiary">[~]</div>
            <p className="text-text-primary text-sm leading-loose mb-2">{t('resonance_alert_body')}</p>
            <p className="text-tertiary text-xs mb-8">
              SIGNAL_COUNT: <span className="text-primary font-bold text-lg">{resonanceAlert.count}</span>
            </p>
            <button
              onClick={dismissResonanceAlert}
              className="terminal-btn w-full"
            >
              <span className="text-secondary">$</span> ACKNOWLEDGE
            </button>
          </div>
        </div>
      )}
      
      {/* Language Toggle */}
      <button 
        onClick={toggleLanguage}
        className="fixed top-6 right-6 z-[100] terminal-input px-3 py-1 text-xs uppercase tracking-widest hover:border-primary transition-all"
        style={{ maxWidth: '80px' }}
      >
        {language === 'en' ? 'EN | 中' : '中 | EN'}
      </button>
      
      {appState === 'login' && <CyberLogin onLogin={handleLoginSuccess} />}
      
      {appState === 'onboarding' && <CyberOnboarding username={userId} onComplete={handleCalibrationComplete} />}

      {appState === 'confessional' && (
        <div className={`altar-container font-mono relative z-10 w-full min-h-screen ${isCatharsisActive ? 'catharsis-mode' : ''}`}>
          {/* Header - Terminal Style */}
          <header className="sacred-header">
            <h1 className="glitch" data-text={t('altar_header')}>
              {t('altar_header')}
            </h1>
            <div className="cross-icon"></div>
            <p className="mono subtitle mb-4">// {t('altar_subtitle')}</p>
            
            {/* Tab Navigation - Terminal Style */}
            <div className="tab-container mt-6">
              <button 
                onClick={() => setActiveTab('altar')}
                className={`tab ${activeTab === 'altar' ? 'active' : ''}`}
              >
                {t('tab_altar')}
              </button>
              <button 
                onClick={() => setActiveTab('archives')}
                className={`tab ${activeTab === 'archives' ? 'active' : ''}`}
              >
                {t('tab_archives')}
              </button>
            </div>
          </header>

          {/* Main Area */}
          <main className="confession-zone">
            {activeTab === 'archives' ? (
              <UserDashboard />
            ) : (
              <>
                {!result && !(isComputing && !isGenerating) && (
                  <div className="input-wrapper w-full">
                    {/* Conversation History */}
                    {messages.length > 0 && (
                      <div className="messages-container mb-8 max-h-[400px] overflow-y-auto pr-2">
                        {messages.map((msg, idx) => {
                          let mainText = msg.content;
                          let catharsisText = null;
                          
                          // Parse out catharsis tag if present
                          const catharsisMatch = msg.content.match(/<catharsis>([\s\S]*?)<\/catharsis>/i);
                          if (catharsisMatch) {
                            catharsisText = catharsisMatch[1].trim();
                            mainText = msg.content.replace(catharsisMatch[0], '').trim();
                          }

                          return (
                            <div 
                              key={idx} 
                              className={`message ${msg.role === 'user' ? 'message-user' : 'message-assistant'} ${msg.isVerdict ? 'message-verdict' : ''}`}
                            >
                              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                                {msg.isVerdict ? (
                                  <details className="cursor-pointer group">
                                    <summary className="cursor-pointer text-xs uppercase tracking-widest text-secondary mb-3 hover:text-primary transition-colors">
                                      [+] VERDICT_ARCHIVE
                                    </summary>
                                    <div className="mt-4 pl-4 border-l-2 border-primary/30">
                                      <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                                        {mainText}
                                      </ReactMarkdown>
                                      {catharsisText && (
                                        <div className="mt-6 p-4 border border-secondary bg-surface text-text-primary">
                                          <div className="text-xs text-secondary uppercase tracking-wider mb-2">// CATHARSIS_UNLOCKED</div>
                                          <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                                            {catharsisText}
                                          </ReactMarkdown>
                                        </div>
                                      )}
                                    </div>
                                  </details>
                                ) : (
                                  <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                                    {msg.content}
                                  </ReactMarkdown>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Input Header */}
                    <div className="input-header">
                      <span className="text-secondary">$</span> confession_input:
                    </div>

                    <textarea
                      value={confession}
                      onChange={(e) => {
                        setConfession(e.target.value);
                        setIsTyping(true);
                        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                        typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 150);
                      }}
                      placeholder={messages.length === 0 ? t('input_placeholder') : t('reply_placeholder')}
                      className={`neon-input ${isTyping ? 'cursor-blink' : ''}`}
                      spellCheck="false"
                    />
                    
                    {/* Future Aspiration Input (Optional) - Terminal Style */}
                    <div className="w-full mt-0">
                       <div className="text-[10px] uppercase tracking-[0.2em] mb-2 text-muted flex justify-between border-l-2 border-border pl-3">
                          <span><span className="text-secondary">$</span> future_aspiration (optional)</span>
                          <span className="opacity-50">// TODO</span>
                       </div>
                       <textarea
                        value={futureAspiration}
                        onChange={(e) => setFutureAspiration(e.target.value)}
                        placeholder={t('future_placeholder')}
                        className="aspiration-input"
                        spellCheck="false"
                      />
                    </div>

                    <button
                      onClick={handleConfess}
                      disabled={isGenerating}
                      className={`sacred-btn ${isGenerating ? 'loading' : ''}`}
                    >
                      {isGenerating ? (
                        <>
                          <span className="loading-indicator">
                            <span className="loading-dots">
                              <span className="loading-dot"></span>
                              <span className="loading-dot"></span>
                              <span className="loading-dot"></span>
                            </span>
                            PROCESSING...
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="text-secondary">$</span> {t('btn_initiate')}
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Loading Logs - Terminal Output Style */}
                {(isComputing && !isGenerating && !result) && (
                  <div ref={logContainerRef} className="engine-logs">
                    <div className="engine-logs-header">SYSTEM_OUTPUT</div>
                    {logs.map((log, i) => (
                      <div 
                        key={i} 
                        className={`log-entry ${log.type || ''}`}
                      >
                        {log.text}
                      </div>
                    ))}
                    {logs.some(l => l.type === 'error') && (
                      <button onClick={() => { setLogs([]); setIsComputing(false); }} className="retry-btn">
                        RESET_TEMPORAL_ANOMALY
                      </button>
                    )}
                  </div>
                )}

                {/* Verdict Results */}
                {result && !isComputing && (
                  <div className={`verdict-container ${isDataExpanded ? 'grid grid-cols-1 lg:grid-cols-[3fr_7fr] gap-8' : 'flex flex-col items-center'}`}>
                    <div className={`${isDataExpanded ? '' : 'w-full max-w-3xl mx-auto'}`}>
                      <h2 className="priest-title glitch" data-text={t('verdict_title')}>
                        {t('verdict_title')}
                      </h2>
                      <div className="priest-text">
                        {(() => {
                          let text = result.verdict;
                          try {
                            const parsedVerdict = JSON.parse(result.verdict);
                            text = parsedVerdict.message || result.verdict;
                          } catch (e) {}

                          let mainText = text;
                          let catharsisText = null;
                          const catharsisMatch = text.match(/<catharsis>([\s\S]*?)<\/catharsis>/i);
                          if (catharsisMatch) {
                            catharsisText = catharsisMatch[1].trim();
                            mainText = text.replace(catharsisMatch[0], '').trim();
                          }

                          return (
                            <div className="animate-slide-up">
                              <ReactMarkdown 
                                remarkPlugins={[remarkMath]} 
                                rehypePlugins={[rehypeKatex]}
                              >
                                {mainText}
                              </ReactMarkdown>
                              
                              {catharsisText && (
                                <div className="mt-6 p-6 border border-secondary bg-surface animate-slide-up" style={{ animationDelay: '0.4s' }}>
                                  <div className="text-xs text-secondary uppercase tracking-wider mb-3">
                                    <span className="text-secondary">[+]</span> CATHARSIS_UNLOCKED
                                  </div>
                                  <div className="text-text-primary leading-relaxed">
                                    <ReactMarkdown 
                                      remarkPlugins={[remarkMath]} 
                                      rehypePlugins={[rehypeKatex]}
                                    >
                                      {catharsisText}
                                    </ReactMarkdown>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>

                      {/* Action Buttons - Terminal Style */}
                      <div className="flex gap-4 mt-8 flex-wrap justify-center">
                        <button
                          onClick={() => setIsDataExpanded(!isDataExpanded)}
                          className="terminal-btn"
                        >
                          <span className="text-tertiary">[</span> 
                          {isDataExpanded ? 'COLLAPSE' : 'EXPAND'} 
                          <span className="text-tertiary">]</span> CAUSAL_DATA
                        </button>
                        <button
                          onClick={() => setShowReceipt(true)}
                          className="terminal-btn border-secondary text-secondary"
                        >
                          <span className="text-secondary">$</span> GENERATE_RECEIPT
                        </button>
                        <button
                          onClick={() => {
                            setMessages([]);
                            setResult(null);
                            setLogs([]);
                            setIsDataExpanded(false);
                          }}
                          className="terminal-btn"
                        >
                          <span className="text-muted">$</span> NEW_CONFESSION
                        </button>
                      </div>
                    </div>

                    {/* Expanded Data View - Terminal Style */}
                    {isDataExpanded && (
                      <div className="animate-slide-up">
                        {/* Causal Panel */}
                        <CyberParamsPanel
                          prob={prob}
                          causalNodes={getCausalNodes(result)}
                          zVal={zVal}
                          mBias={mBias}
                          onZChange={onZChange}
                          onMChange={onMChange}
                          isSimulating={isSimulating}
                        />

                        {/* Mermaid DAG - Terminal Styled */}
                        {result.mermaid_chart && (
                          <div className="terminal-panel mt-6">
                            <div className="text-xs text-tertiary uppercase tracking-wider mb-4 border-b border-border pb-2">
                              <span className="text-secondary">$</span> CAUSAL_GRAPH_STRUCTURE
                            </div>
                            <MermaidDAG chart={result.mermaid_chart} />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </main>

          {/* Footer - Terminal Style */}
          <footer className="mt-auto pt-8 text-center border-t border-border">
            <p className="text-muted text-xs uppercase tracking-widest">
              <span className="text-primary">[</span> Cyber Confessional v2.0 <span className="text-primary">]</span>
              <span className="mx-2">|</span>
              <span className="text-secondary">$</span> ALL_SYSTEMS_NOMINAL
            </p>
          </footer>
        </div>
      )}

      {/* Void Receipt Modal */}
      {showReceipt && result && (
        <VoidReceipt 
          result={result} 
          confession={confession || messages[messages.length - 1]?.content}
          zVal={zVal}
          mBias={mBias}
          onClose={() => setShowReceipt(false)}
          soulId={soulId}
        />
      )}

      {/* View Receipt Modal */}
      {viewingReceipt && (
        <VoidReceipt 
          result={{
            verdict: viewingReceipt.verdict_text,
            engine_output: {
              inferred_latents: { U_hidden: viewingReceipt.prob_score / 100 },
              counterfactual_prob: viewingReceipt.prob_score / 100
            },
            engine_input: {
              factual: { Y: viewingReceipt.is_catharsis ? 1 : 0 }
            }
          }}
          confession={viewingReceipt.confession_text}
          zVal={viewingReceipt.z_val}
          mBias={viewingReceipt.m_bias}
          onClose={() => setViewingReceipt(null)}
          isReadOnly={true}
          soulId={soulId}
        />
      )}
    </>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default App;
