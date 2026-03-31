import React, { useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext';
import MermaidDAG from './MermaidDAG';
import KarmaNetwork3D from './KarmaNetwork3D';

const UserDashboard = () => {
  const { t } = useLanguage();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [graphData, setGraphData] = useState(null);
  const [logs, setLogs] = useState([]);
  const [activeView, setActiveView] = useState('graph'); // 'graph' | 'logs'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:8888/api/users/');
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserGraph = async (userId) => {
    try {
      setLoading(true);
      setGraphData(null);
      const res = await fetch(`http://localhost:8888/api/users/${userId}/graph`);
      if (!res.ok) throw new Error("Failed to fetch user graph");
      const data = await res.json();
      setSelectedUser(data.user);

      // Convert Edges to Links for react-force-graph-3d
      const links = data.edges.map(e => ({
        source: e.source,
        target: e.target,
        relationship: e.relationship
      }));

      setGraphData({ nodes: data.nodes, links });

      // Also fetch logs
      const logRes = await fetch(`http://localhost:8888/api/users/${userId}/logs`);
      if (logRes.ok) {
        const logData = await logRes.json();
        setLogs(logData);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col min-h-screen text-gray-200 p-8 pt-24 font-mono">
      <h2 className="text-[#00f0ff] text-2xl font-bold uppercase tracking-widest mb-8 border-b border-[#00f0ff]/30 pb-4">
        {t('dash_title')}
      </h2>

      {error && <div className="text-[#ff003c] mb-4">Error: {error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full max-w-7xl mx-auto">
        {/* User List Panel */}
        <div className="col-span-1 border border-cyan-900/50 bg-black/40 p-6 flex flex-col h-[70vh] overflow-y-auto custom-scrollbar">
          <h3 className="text-gray-400 uppercase tracking-widest text-sm mb-6 pb-2 border-b border-gray-800">{t('dash_anchored')}</h3>
          {loading && !selectedUser && <div className="text-cyan-500 animate-pulse">{t('loading')}</div>}

          <div className="flex flex-col gap-4">
            {users.map(u => (
              <div
                key={u.id}
                onClick={() => fetchUserGraph(u.id)}
                className={`p-4 border cursor-pointer transition-all duration-300 ${selectedUser?.id === u.id ? 'border-[#00f0ff] bg-cyan-950/30' : 'border-gray-800 hover:border-cyan-700/50 hover:bg-white/5'}`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-lg text-cyan-300">{u.username}</span>
                  <span className="text-xs bg-gray-900 px-2 py-1 uppercase border border-gray-700">Logs: {u.confession_count}</span>
                </div>
                {u.global_persona_summary && (
                  <p className="text-sm font-serif text-gray-400 mt-2 line-clamp-2 italic">
                    {u.global_persona_summary}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* User Details & Graph Panel */}
        <div className="col-span-1 lg:col-span-2 flex flex-col gap-6">
          {selectedUser ? (
            <>
              {/* Profile Card */}
              <div className="border border-[#ff003c]/30 bg-[#1a0509]/50 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-[#ff003c] uppercase">{selectedUser.username}</h3>
                    <div className="text-xs text-gray-500 mt-1 uppercase tracking-widest">Soul ID: {selectedUser.id}</div>
                  </div>
                </div>

                <div className="mb-6 pb-4 border-b border-[#ff003c]/20">
                  <div className="text-xs text-gray-500 uppercase tracking-widest mb-2 font-bold">{t('dash_persona')}</div>
                  <p className="font-serif text-gray-300 leading-relaxed">
                    {selectedUser.global_persona_summary || t('dash_no_abstract')}
                  </p>
                </div>

                {/* 4D Matrix */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-black/50 p-3 border border-gray-800 text-center">
                    <div className="text-[10px] uppercase text-gray-500 mb-1">Risk Aversion</div>
                    <div className="text-cyan-400 font-bold">{selectedUser.u_risk_mean.toFixed(2)}</div>
                  </div>
                  <div className="bg-black/50 p-3 border border-gray-800 text-center">
                    <div className="text-[10px] uppercase text-gray-500 mb-1">Action Paralysis</div>
                    <div className="text-cyan-400 font-bold">{selectedUser.u_action_mean.toFixed(2)}</div>
                  </div>
                  <div className="bg-black/50 p-3 border border-gray-800 text-center">
                    <div className="text-[10px] uppercase text-gray-500 mb-1">Emotional Bias</div>
                    <div className="text-cyan-400 font-bold">{selectedUser.u_emotion_mean.toFixed(2)}</div>
                  </div>
                  <div className="bg-black/50 p-3 border border-gray-800 text-center">
                    <div className="text-[10px] uppercase text-gray-500 mb-1">External Locus</div>
                    <div className="text-cyan-400 font-bold">{selectedUser.u_locus_mean.toFixed(2)}</div>
                  </div>
                </div>
              </div>

              {/* Graph / Logs Container */}
              <div className="border border-cyan-900/50 p-6 h-[880px] bg-black/60 flex flex-col">
                <div className="text-xs text-gray-500 uppercase tracking-widest mb-4 font-bold flex justify-between items-center flex-none">
                  <div className="flex gap-4">
                    <button
                      onClick={() => setActiveView('graph')}
                      className={`transition-all ${activeView === 'graph' ? 'text-cyan-400 border-b border-cyan-400' : 'hover:text-gray-300'}`}
                    >
                      {t('dash_network') || 'Causal Network'}
                    </button>
                    <button
                      onClick={() => setActiveView('logs')}
                      className={`transition-all ${activeView === 'logs' ? 'text-[#ff003c] border-b border-[#ff003c]' : 'hover:text-gray-300'}`}
                    >
                      {t('dash_archives')}
                    </button>
                  </div>
                  {loading && <span className="text-cyan-500 animate-pulse">{t('dash_syncing')}</span>}
                </div>
                <div className="flex-1 rounded border border-gray-900 overflow-hidden relative min-h-0">
                  {activeView === 'graph' ? (
                    graphData ? (
                      <KarmaNetwork3D graphData={graphData} />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-600 italic font-serif z-10 text-center px-4">
                        {t('dash_waiting')}
                      </div>
                    )
                  ) : (
                    <div className="absolute inset-0 overflow-y-auto custom-scrollbar bg-black/40 p-4">
                      {logs.length > 0 ? (
                        <div className="flex flex-col gap-4">
                          {logs.map((log) => (
                            <ConfessionLogItem key={log.id} log={log} t={t} />
                          ))}
                        </div>
                      ) : (
                        <div className="h-full flex items-center justify-center text-gray-600 italic">
                          {t('dash_no_logs')}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center border border-dashed border-gray-800 text-gray-600 font-serif text-lg text-center px-8">
              {t('dash_select_hint')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper component for log items
const ConfessionLogItem = ({ log, t }) => {
  const [expanded, setExpanded] = useState(false);
  const [decryptedText, setDecryptedText] = useState('');
  const [isDecrypting, setIsDecrypting] = useState(false);
  const indexRef = React.useRef(0);

  useEffect(() => {
    if (expanded && !isDecrypting && decryptedText === '') {
      setIsDecrypting(true);
      indexRef.current = 0;
      const fullText = log.verdict_text;
      const interval = setInterval(() => {
        indexRef.current += 15; // Decrypting speed
        setDecryptedText(fullText.slice(0, indexRef.current));
        if (indexRef.current >= fullText.length) {
          clearInterval(interval);
          setIsDecrypting(false);
        }
      }, 20);
      return () => clearInterval(interval);
    }
  }, [expanded, log.verdict_text]);

  const hexId = log.id.split('-')[0].toUpperCase();
  const date = new Date(log.created_at).toLocaleString();

  return (
    <div className="border border-gray-800 bg-black/20 overflow-hidden transition-all duration-500">
      <div
        onClick={() => setExpanded(!expanded)}
        className="p-3 flex justify-between items-center cursor-pointer hover:bg-white/5 active:bg-white/10"
      >
        <div className="flex items-center gap-3">
          <span className="text-[10px] bg-gray-900 px-2 py-1 border border-gray-700 text-gray-500 font-bold">LOG-0x{hexId}</span>
          <span className="text-xs text-gray-400 font-mono">{date}</span>
        </div>
        <div className="text-[#ff003c] text-[10px] tracking-widest font-bold uppercase">
          {expanded ? t('dash_log_close') : t('dash_log_decrypt')}
        </div>
      </div>

      {expanded && (
        <div className="p-4 border-t border-gray-800 bg-black/40 animate-entry">
          <div className="mb-4">
            <div className="text-[9px] uppercase text-gray-600 font-bold mb-1">{t('dash_log_recovered')}</div>
            <p className="text-sm text-gray-300 font-serif italic border-l border-gray-700 pl-3">"{log.content}"</p>
          </div>

          {log.future_aspiration && (
            <div className="mb-4">
              <div className="text-[9px] uppercase text-red-900 font-bold mb-1">{t('dash_log_aspiration')}</div>
              <p className="text-xs text-red-500 font-mono border-l border-red-950 pl-3">"{log.future_aspiration}"</p>
            </div>
          )}

          <div className="mt-4">
            <div className="text-[9px] uppercase text-gray-600 font-bold mb-2">{t('dash_log_verdict')} {isDecrypting && <span className="animate-pulse text-red-500 inline-block w-2 bg-red-500 h-2 ml-1"></span>}</div>
            <div className="text-sm font-serif leading-relaxed text-gray-200 whitespace-pre-wrap">
              {decryptedText}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
