import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import CyberParamsPanel from './components/CyberParamsPanel';
import MermaidDAG from './components/MermaidDAG';

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
      await new Promise(r => setTimeout(r, 400 + Math.random() * 300));
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
      const response = await fetch('http://localhost:8888/confess', {
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
      setLogs(prev => [...prev, `[Error] ${err.message}. Ensure backend is running.`]);
    } finally {
      setIsComputing(false);
    }
  };

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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

  return (
    <div className="altar-container font-mono">
      {/* Header */}
      <header className="sacred-header">
        <h1>THE CYBER CONFESSIONAL</h1>
        <div className="cross-icon">†</div>
        <p className="mono subtitle">In math we trust, in causality we converge.</p>
      </header>

      {/* Main Area */}
      <main className="confession-zone">
        {!result && !isComputing && (
          <div className="input-wrapper w-full">
            <textarea
              value={confession}
              onChange={(e) => setConfession(e.target.value)}
              placeholder="Confess your regrets... What world-line do you seek?"
              className="neon-input w-full p-4 border-b border-cyan-500/20 bg-transparent text-xl font-serif text-gray-200 focus:outline-none focus:border-cyan-500 transition-all h-[250px] resize-none"
            />
            <button
              onClick={handleConfess}
              className="sacred-btn mt-12 px-8 py-3 border border-[#00f0ff] text-[#00f0ff] hover:bg-[#00f0ff] hover:text-black transition-all tracking-[0.2em] uppercase font-bold"
            >
              RUN COUNTERFACTUAL
            </button>
          </div>
        )}

        {/* Loading Logs */}
        {(isComputing || (logs.length > 0 && !result)) && (
          <div className="engine-logs mono w-full p-8 bg-black/50 border border-[#1a1a1a] text-[#00ff41] text-sm h-[400px] overflow-y-auto">
            {logs.map((log, i) => (
              <div key={i} className={`log-entry mb-2 flex gap-2 ${log.includes('[Error]') ? 'error-text text-[#ff003c]' : 'opacity-80'}`}>
                <span>&gt; {log}</span>
              </div>
            ))}
            {logs.some(l => l.includes('[Error]')) && (
              <button onClick={() => { setLogs([]); setConfession(''); }} className="retry-btn mt-4 text-xs text-gray-500 underline uppercase tracking-widest hover:text-gray-300">
                RESET TEMPORAL ANOMALY
              </button>
            )}
            <div ref={logEndRef} />
          </div>
        )}

        {/* Verdict Results */}
        {result && !isComputing && (
          <div className="verdict-container grid grid-cols-1 lg:grid-cols-[3fr_7fr] gap-12 w-full">
            <div className="narrative-panel">
              <h2 className="priest-title text-[#ff003c] text-3xl font-bold mb-6 uppercase tracking-widest">The Verdict</h2>
              <div className="priest-text font-serif text-lg leading-loose text-gray-200 pr-8 whitespace-pre-wrap">
                {(() => {
                  try {
                    const parsedVerdict = JSON.parse(result.verdict);
                    return parsedVerdict.message || result.verdict;
                  } catch (e) {
                    return result.verdict;
                  }
                })()}
              </div>
              <button
                onClick={() => setResult(null)}
                className="retry-btn mt-8 text-xs text-gray-500 underline uppercase tracking-widest hover:text-gray-300"
              >
                NEW CONFESSION
              </button>
            </div>

            <div className="data-panel space-y-6 flex-1">
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
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="philosophical-footer mt-24 pt-8 border-t border-[#111] text-center mb-12">
        <p className="text-gray-600 text-[13px] leading-relaxed max-w-2xl mx-auto uppercase tracking-wider font-bold">
          "人总是经常后悔，总是会回想若是当初做的决定不一样，现在是什么样子。但是无论如何，过去无法改变，我们应当避免沉溺过去，而是积极展望未来。赛博神父借助因果推断的思想，帮你探索另一种情况的平行宇宙世界线是否发生了跃迁，亦或是收束到了同个结局。愿你放下执念，大步向前。"
        </p>
      </footer>
    </div>
  );
}

export default App;
