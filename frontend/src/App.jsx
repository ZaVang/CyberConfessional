import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [confession, setConfession] = useState('');
  const [isComputing, setIsComputing] = useState(false);
  const [logs, setLogs] = useState([]);
  const [result, setResult] = useState(null);
  const logEndRef = useRef(null);

  const simulateLogs = async (signal) => {
    const sequence = [
      "[System] Connecting to World-line Observation Node...",
      "[LLM] Extracting Treatment X (Decision)...",
      "[LLM] Extracting Outcome Y (Reality)...",
      "[Engine] Identifying Latent Variable U (Hidden Fate)...",
      "[Engine] Initializing Bayesian Abduction Module...",
      "[Engine] Simulating 100,000 Monte Carlo parallel universes...",
      "[Engine] Applying do(X) intervention operator...",
      "[System] World-line collision confirmed. Convergence starting..."
    ];

    for (const msg of sequence) {
      if (!signal.active) break;
      setLogs(prev => [...prev, msg]);
      await new Promise(r => setTimeout(r, 600 + Math.random() * 400));
    }
  };

  const handleConfess = async () => {
    if (!confession.trim()) return;
    
    setIsComputing(true);
    setLogs([]);
    setResult(null);
    
    const simulationSignal = { active: true };
    const logPromise = simulateLogs(simulationSignal);
    
    try {
      const response = await fetch('http://localhost:8000/confess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confession }),
      });
      
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Temporal breakdown');
      }
      
      const data = await response.json();
      await logPromise; 
      setResult(data);
    } catch (err) {
      simulationSignal.active = false;
      setLogs(prev => [...prev, `[Error] ${err.message}. Ensure backend is running and API keys are set.`]);
    } finally {
      setIsComputing(false);
    }
  };

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="altar-container">
      {/* Header */}
      <header className="sacred-header">
        <div className="cross-icon">†</div>
        <h1>THE CYBER CONFESSIONAL</h1>
        <p className="mono subtitle">In math we trust, in causality we converge.</p>
      </header>

      {/* Main Area */}
      <main className="confession-zone">
        {!result && !isComputing && (
          <div className="input-wrapper">
            <textarea
              value={confession}
              onChange={(e) => setConfession(e.target.value)}
              placeholder="Confess your regrets... What world-line do you seek?"
              className="neon-input"
            />
            <button onClick={handleConfess} className="sacred-btn">
              RUN COUNTERFACTUAL
            </button>
          </div>
        )}

        {/* Loading Logs & Errors */}
        {(isComputing || (logs.length > 0 && !result)) && (
          <div className="engine-logs mono">
            {logs.map((log, i) => (
              <div key={i} className={`log-entry ${log.includes('[Error]') ? 'error-text' : ''}`}>{log}</div>
            ))}
            {logs.some(l => l.includes('[Error]')) && (
              <button onClick={() => {setLogs([]); setConfession('');}} className="retry-btn mono">
                RESET TEMPORAL ANOMALY
              </button>
            )}
            <div ref={logEndRef} />
          </div>
        )}

        {/* Verdict Results */}
        {result && !isComputing && (
          <div className="verdict-container">
            <div className="narrative-panel">
              <h2 className="priest-title">The Verdict</h2>
              <p className="priest-text">
                {(() => {
                  try {
                    const parsedVerdict = JSON.parse(result.verdict);
                    return parsedVerdict.message || result.verdict;
                  } catch (e) {
                    return result.verdict;
                  }
                })()}
              </p>
              <button onClick={() => setResult(null)} className="retry-btn mono">
                NEW CONFESSION
              </button>
            </div>

            
            <div className="data-panel mono">
              <div className="data-card">
                <h3>CAUSAL DATA</h3>
                <div className="stat">
                  <span className="label">CF SUCCESS PROB:</span>
                  <div className="progress-bar">
                    <div 
                      className="fill" 
                      style={{ width: `${result.engine_output.counterfactual_prob * 100}%` }}
                    />
                  </div>
                  <span className="value">{(result.engine_output.counterfactual_prob * 100).toFixed(4)}%</span>
                </div>
                <div className="stat">
                  <span className="label">PARALLEL UNIVERSES:</span>
                  <span className="value">{result.engine_output.retained_universes.toLocaleString()}</span>
                </div>
                <div className="stat">
                  <span className="label">LATENT FATE (U):</span>
                  <span className="value">{result.engine_output.inferred_latents.U_hidden.toFixed(6)}</span>
                </div>
                <div className="engine-msg">{result.engine_output.message}</div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="philosophical-footer">
        <p>
          "人总是经常后悔，总是会回想若是当初做的决定不一样，现在是什么样子。但是无论如何，过去无法改变，我们应当避免沉溺过去，而是积极展望未来。赛博神父借助因果推断的思想，帮你探索另一种情况的平行宇宙世界线是否发生了跃迁，亦或是收束到了同个结局。愿你放下执念，大步向前。"
        </p>
      </footer>
    </div>
  );
}

export default App;
