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

function App() {
  const [appState, setAppState] = useState('login'); // 'login' | 'onboarding' | 'confessional'
  const [activeTab, setActiveTab] = useState('altar'); // 'altar' | 'archives'
  const [userId, setUserId] = useState('');
  
  const [messages, setMessages] = useState([]);
  const [confession, setConfession] = useState('');
  const [isComputing, setIsComputing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false); // Used when waiting for LLM
  const [logs, setLogs] = useState([]);
  const [result, setResult] = useState(null);
  const [isDataExpanded, setIsDataExpanded] = useState(false);
  const logContainerRef = useRef(null);

  const simulateLogs = async (signal) => {
    const sequence = [
      "> Karma Police Protocol Initiated...",
      "[System] Parsing pathetic human error logs...",
      "[Engine] Extracting fatal flaw (Latent Variable U)...",
      "[System] Calculating slow suffocation (Macro Environment Z)...",
      "[Engine] Identifying self-sabotage mechanisms (Mediation M)...",
      "> Arresting time-line anomalies...",
      "[System] Rejecting escapism. Escapism is invalid...",
      "> Everything in its right place. Executing verdict..."
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
        body: JSON.stringify({ messages: newMessages, username: userId }),
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
      setLogs(prev => [...prev, `[Error] ${err.message}. Ensure backend is running.`]);
    } finally {
      setIsComputing(false);
    }
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
        value: result.engine_input.factual.X === 1 ? 'Action Taken' : 'No Action',
        desc: 'Selected intervention point'
      },
      {
        type: 'outcome',
        symbol: 'Y',
        name: 'Reality',
        value: result.engine_input.factual.Y === 1 ? 'Positive' : 'Negative',
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

  const handleLoginSuccess = (isNewUser, usernameStr) => {
    setUserId(usernameStr);
    if (isNewUser) {
      setAppState('onboarding');
    } else {
      setAppState('confessional');
    }
  };

  const handleCalibrationComplete = (usernameStr) => {
    setUserId(usernameStr);
    setAppState('confessional');
  };

  return (
    <>
      <BackgroundAudio isPlaying={appState !== 'login'} />
      <BackgroundMantras />
      
      {appState === 'login' && <CyberLogin onLogin={handleLoginSuccess} />}
      
      {appState === 'onboarding' && <CyberOnboarding username={userId} onComplete={handleCalibrationComplete} />}

      {appState === 'confessional' && (
        <div className="altar-container font-mono relative z-10 w-full min-h-screen">
          {/* Header */}
          <header className="sacred-header">
            <h1>THE CYBER CONFESSIONAL</h1>
            <div className="cross-icon">†</div>
            <p className="mono subtitle mb-4">&gt; Are you such a dreamer, to put the world to rights?</p>
            
            <div className="flex gap-4 justify-center mt-6">
              <button 
                onClick={() => setActiveTab('altar')}
                className={`px-6 py-2 border tracking-widest uppercase transition-all ${activeTab === 'altar' ? 'border-[#cc0000] text-[#cc0000] bg-black' : 'border-gray-800 text-gray-500 hover:border-gray-600'}`}
              >
                World-line Altar
              </button>
              <button 
                onClick={() => setActiveTab('archives')}
                className={`px-6 py-2 border tracking-widest uppercase transition-all ${activeTab === 'archives' ? 'border-[#00ff00] text-[#00ff00] bg-green-950/20' : 'border-gray-800 text-gray-500 hover:border-gray-600'}`}
              >
                Soul Archives (Dashboard)
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
          <div className="input-wrapper w-full flex flex-col items-center">
            {/* Conversation History */}
            {messages.length > 0 && (
              <div className="w-full mb-8 space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar text-left animate-entry">
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
                    <div key={idx} className={`p-5 glass-panel border ${msg.role === 'user' ? 'border-gray-500/30 bg-gray-900/40 text-gray-200 ml-12' : 'border-red-500/40 bg-black/60 text-gray-100 mr-12'} rounded-sm`}>
                      <div className="text-xs uppercase tracking-[0.2em] mb-3 opacity-60 font-mono font-bold text-gray-400">
                        {msg.role === 'user' ? 'Soul Identity' : 'Karma Police'}
                      </div>
                      {msg.isVerdict ? (
                        <details className="cursor-pointer group">
                          <summary className="font-mono text-sm tracking-widest text-red-400 opacity-80 hover:opacity-100 transition-opacity flex items-center gap-2 outline-none">
                             <span className="text-lg leading-none transform group-open:rotate-180 transition-transform">▾</span> PREVIOUS VERDICT ARCHIVE
                          </summary>
                          <div className="mt-4 font-serif text-base leading-relaxed text-gray-300 border-l-2 border-red-500/20 pl-4 py-2">
                            <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                              {mainText}
                            </ReactMarkdown>
                            {catharsisText && (
                              <div className="mt-6 p-6 border-l-2 border-white/60 bg-white/5 text-white/90 font-serif leading-loose tracking-wide drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">
                                <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                                  {catharsisText}
                                </ReactMarkdown>
                              </div>
                            )}
                          </div>
                        </details>
                      ) : (
                        <div className="font-serif text-lg leading-relaxed whitespace-pre-wrap">
                          {msg.content}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <textarea
              value={confession}
              onChange={(e) => setConfession(e.target.value)}
              placeholder={messages.length === 0 ? "Input failure parameters... What world-line anomaly do you seek to arrest?" : "Reply to the Karma Police..."}
              className="neon-input w-full p-4 border-b border-gray-600/20 bg-transparent text-xl font-serif text-gray-200 focus:outline-none focus:border-gray-500 transition-all h-[150px] resize-none"
            />
            <button
              onClick={handleConfess}
              disabled={isGenerating}
              className="sacred-btn mt-12 px-8 py-3 border border-gray-500 text-gray-300 hover:bg-gray-500 hover:text-black transition-all tracking-[0.2em] uppercase font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? "> ARRESTING ANOMALIES..." : "INITIATE KARMA POLICE PROTOCOL"}
            </button>
          </div>
        )}

        {/* Loading Logs */}
        {(isComputing && !isGenerating && !result) && (
          <div ref={logContainerRef} className="engine-logs mono w-full p-8 bg-black/50 border border-[#1a1a1a] text-[#00ff41] text-sm h-[400px] overflow-y-auto">
            {logs.map((log, i) => (
              <div key={i} className={`log-entry mb-2 flex gap-2 ${log.includes('[Error]') ? 'error-text text-[#cc0000]' : 'opacity-80'}`}>
                <span>&gt; {log}</span>
              </div>
            ))}
            {logs.some(l => l.includes('[Error]')) && (
              <button onClick={() => { setLogs([]); setIsComputing(false); }} className="retry-btn mt-4 text-xs text-gray-500 underline uppercase tracking-widest hover:text-gray-300">
                RESET TEMPORAL ANOMALY
              </button>
            )}
          </div>
        )}

        {/* Verdict Results */}
        {result && !isComputing && (
          <div className={`verdict-container w-full transition-all duration-700 ${isDataExpanded ? 'grid grid-cols-1 lg:grid-cols-[3fr_7fr] gap-12' : 'flex flex-col items-center max-w-4xl mx-auto'}`}>
            <div className={`narrative-panel ${isDataExpanded ? '' : 'w-full'}`}>
              <h2 className="priest-title text-[#cc0000] text-3xl font-bold mb-6 uppercase tracking-widest text-center lg:text-left glitch" data-text="> TERMINAL VERDICT">&gt; TERMINAL VERDICT</h2>
              <div className={`priest-text font-serif text-lg md:text-xl leading-loose text-gray-200 whitespace-pre-wrap ${isDataExpanded ? 'pr-8' : ''}`}>
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
                    <div className="animate-entry delay-100">
                      <ReactMarkdown 
                        remarkPlugins={[remarkMath]} 
                        rehypePlugins={[rehypeKatex]}
                      >
                        {mainText}
                      </ReactMarkdown>
                      
                      {catharsisText && (
                        <div className="catharsis-block mt-10 p-6 md:p-8 border-l-2 border-white/60 bg-white/5 backdrop-blur-sm shadow-[0_4px_30px_rgba(255,255,255,0.02)] transition-all animate-entry delay-400">
                          <div className="text-white/95 font-serif text-lg md:text-xl leading-loose tracking-wide drop-shadow-[0_0_12px_rgba(255,255,255,0.15)]">
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
              <div className="flex gap-6 mt-12 mb-8 justify-center lg:justify-start">
                <button
                  onClick={() => setIsDataExpanded(!isDataExpanded)}
                  className="px-6 py-3 border border-gray-700 text-gray-400 text-sm md:text-base uppercase tracking-widest hover:bg-gray-900/40 hover:border-gray-500 hover:text-gray-200 transition-all duration-300 focus:outline-none shadow-[0_0_15px_rgba(107,114,128,0.05)] hover:shadow-[0_0_20px_rgba(107,114,128,0.2)]"
                >
                  {isDataExpanded ? 'HIDE CAUSAL DATA' : 'EXTRACT CAUSAL DATA'}
                </button>
                <button
                  onClick={() => { setResult(null); setIsDataExpanded(false); setLogs([]); }}
                  className="px-6 py-3 border border-red-900 text-red-500 text-sm md:text-base uppercase tracking-widest hover:bg-black hover:border-red-600 hover:text-red-400 transition-all duration-300 focus:outline-none shadow-[0_0_15px_rgba(204,0,0,0.05)] hover:shadow-[0_0_20px_rgba(204,0,0,0.2)]"
                >
                  CONTINUE ASKING
                </button>
                <button
                  onClick={() => { setResult(null); setIsDataExpanded(false); setLogs([]); setConfession(''); setMessages([]); }}
                  className="px-6 py-3 border border-gray-800 text-gray-500 text-sm md:text-base uppercase tracking-widest hover:bg-gray-900/60 hover:border-gray-500 hover:text-gray-300 transition-all duration-300 focus:outline-none"
                >
                  NEW CONFESSION
                </button>
              </div>
            </div>

            {isDataExpanded && (
              <div className="data-panel space-y-6 flex-1 w-full animate-[fadeIn_0.5s_ease-out]">
                <CyberParamsPanel
                  prob={(result.engine_output.counterfactual_prob * 100).toFixed(2)}
                  causalNodes={getCausalNodes(result)}
                  zVal={zVal}
                  mBias={mBias}
                  onZChange={onZChange}
                  onMChange={onMChange}
                  isSimulating={isSimulating}
                />
                <div className="p-4 border border-[#1a1a1a] bg-black/40 min-h-[400px] flex flex-col">
                  <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-4 mono font-bold">Causal Topology</div>
                  <div className="flex-1">
                    <MermaidDAG chartString={result.mermaid_chart} />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="philosophical-footer mt-24 pt-8 border-t border-[#111] text-center mb-12">
        <p className="text-gray-500 text-sm leading-[2.5] max-w-2xl mx-auto uppercase tracking-widest font-mono font-bold animate-entry opacity-60 hover:opacity-100 transition-opacity">
          &gt; Everything in its right place.<br/>
          &gt; In math we trust, In causality we converge.
        </p>
      </footer>
        </div>
      )}
    </>
  );
}

export default App;
