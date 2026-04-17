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
      {/* CRT Overlay */}
      <div className="crt-overlay"></div>

      {/* Header */}
      <div className="mb-8 flex items-center justify-between border-b border-primary pb-4">
        <h2 className="text-primary text-2xl font-bold uppercase tracking-widest">
          <span className="text-secondary">$</span> {t('dash_title')}
        </h2>
        <span className="text-muted text-xs uppercase tracking-wider">
          [ ONLINE_ARCHIVES ]
        </span>
      </div>

      {error && (
        <div className="terminal-card border-error mb-4">
          <span className="text-error">[!] ERROR:</span> {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full max-w-7xl mx-auto">
        {/* User List Panel */}
        <div className="col-span-1 terminal-panel flex flex-col h-[70vh] overflow-hidden">
          <h3 className="text-tertiary uppercase tracking-widest text-sm mb-4 pb-2 border-b border-border">
            <span className="text-secondary">$</span> ANCHORED_SOULS
          </h3>
          
          {loading && !selectedUser && (
            <div className="text-secondary">
              <span className="loading-indicator">
                <span className="loading-dots">
                  <span className="loading-dot"></span>
                  <span className="loading-dot"></span>
                  <span className="loading-dot"></span>
                </span>
                SCANNING...
              </span>
            </div>
          )}

          <div className="flex-1 overflow-y-auto">
            <div className="flex flex-col gap-3">
              {users.map(u => (
                <div
                  key={u.id}
                  onClick={() => fetchUserGraph(u.id)}
                  className={`terminal-card cursor-pointer transition-all ${
                    selectedUser?.id === u.id 
                      ? 'border-primary' 
                      : 'hover:border-tertiary'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-lg text-primary">{u.username}</span>
                    <span className="text-[10px] text-muted uppercase border border-border px-2 py-1">
                      Logs: {u.confession_count}
                    </span>
                  </div>
                  {u.global_persona_summary && (
                    <p className="text-sm text-muted mt-2 line-clamp-2 italic">
                      // {u.global_persona_summary}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* User Details & Graph Panel */}
        <div className="col-span-1 lg:col-span-2 flex flex-col gap-6">
          {selectedUser ? (
            <>
              {/* Profile Card */}
              <div className="terminal-panel border-secondary">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-primary uppercase tracking-wider">
                      @ {selectedUser.username}
                    </h3>
                    <div className="text-xs text-muted mt-1 uppercase tracking-widest">
                      <span className="text-secondary">ID:</span> {selectedUser.id}
                    </div>
                  </div>
                  <span className="text-xs text-tertiary uppercase border border-tertiary px-3 py-1">
                    ACTIVE
                  </span>
                </div>

                {/* Persona Summary */}
                <div className="mb-6 pb-4 border-b border-border">
                  <div className="text-xs text-tertiary uppercase tracking-widest mb-2 font-bold">
                    <span className="text-secondary">$</span> PERSONA_ABSTRACT
                  </div>
                  <p className="text-text-primary leading-relaxed pl-4 border-l-2 border-primary/30">
                    {selectedUser.global_persona_summary || t('dash_no_abstract')}
                  </p>
                </div>

                {/* 4D Matrix - Terminal Style Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="terminal-card text-center">
                    <div className="text-[10px] uppercase text-muted mb-1 tracking-wider">
                      <span className="text-secondary">[R]</span> Risk
                    </div>
                    <div className="text-tertiary font-bold">{selectedUser.u_risk_mean?.toFixed(2) || '0.00'}</div>
                  </div>
                  <div className="terminal-card text-center">
                    <div className="text-[10px] uppercase text-muted mb-1 tracking-wider">
                      <span className="text-secondary">[A]</span> Action
                    </div>
                    <div className="text-tertiary font-bold">{selectedUser.u_action_mean?.toFixed(2) || '0.00'}</div>
                  </div>
                  <div className="terminal-card text-center">
                    <div className="text-[10px] uppercase text-muted mb-1 tracking-wider">
                      <span className="text-secondary">[E]</span> Emotion
                    </div>
                    <div className="text-tertiary font-bold">{selectedUser.u_emotion_mean?.toFixed(2) || '0.00'}</div>
                  </div>
                  <div className="terminal-card text-center">
                    <div className="text-[10px] uppercase text-muted mb-1 tracking-wider">
                      <span className="text-secondary">[L]</span> Locus
                    </div>
                    <div className="text-tertiary font-bold">{selectedUser.u_locus_mean?.toFixed(2) || '0.00'}</div>
                  </div>
                </div>
              </div>

              {/* Graph / Logs Container */}
              <div className="terminal-panel flex flex-col" style={{ minHeight: '880px' }}>
                {/* Tab Header */}
                <div className="text-xs text-muted uppercase tracking-widest mb-4 font-bold flex justify-between items-center border-b border-border pb-3">
                  <div className="flex gap-4">
                    <button
                      onClick={() => setActiveView('graph')}
                      className={`transition-all ${
                        activeView === 'graph' 
                          ? 'text-primary border-b border-primary pb-1' 
                          : 'hover:text-primary'
                      }`}
                    >
                      <span className="text-secondary">$</span> CAUSAL_NETWORK
                    </button>
                    <button
                      onClick={() => setActiveView('logs')}
                      className={`transition-all ${
                        activeView === 'logs' 
                          ? 'text-error border-b border-error pb-1' 
                          : 'hover:text-error'
                      }`}
                    >
                      <span className="text-secondary">$</span> {t('dash_archives')}
                    </button>
                  </div>
                  {loading && (
                    <span className="text-secondary">
                      <span className="loading-dots inline-flex gap-1">
                        <span className="loading-dot"></span>
                        <span className="loading-dot"></span>
                        <span className="loading-dot"></span>
                      </span>
                    </span>
                  )}
                </div>

                {/* Content Area */}
                <div className="flex-1 terminal-card border-border overflow-hidden relative">
                  {activeView === 'graph' ? (
                    graphData ? (
                      <KarmaNetwork3D graphData={graphData} />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-muted italic">
                        <span className="text-secondary">$</span> Awaiting data stream...
                      </div>
                    )
                  ) : (
                    <div className="absolute inset-0 overflow-y-auto">
                      {logs.length > 0 ? (
                        <div className="flex flex-col gap-4 p-4">
                          {logs.map((log) => (
                            <ConfessionLogItem key={log.id} log={log} t={t} />
                          ))}
                        </div>
                      ) : (
                        <div className="h-full flex items-center justify-center text-muted italic">
                          <span className="text-secondary">$</span> No archives found.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center terminal-panel border-dashed">
              <div className="text-center text-muted">
                <div className="text-4xl mb-4 text-border">[?]</div>
                <p className="text-sm uppercase tracking-widest">
                  <span className="text-secondary">$</span> {t('dash_select_hint')}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper component for log items - Terminal Style
const ConfessionLogItem = ({ log, t }) => {
  const [expanded, setExpanded] = useState(false);
  const isCatharsis = log?.verdict?.includes('<catharsis>');
  
  return (
    <div className="terminal-card border-border hover:border-primary transition-all">
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs text-muted uppercase tracking-wider">
          <span className="text-secondary">#</span> {log.id}
        </span>
        <span className={`text-xs uppercase border px-2 py-0.5 ${
          isCatharsis ? 'border-primary text-primary' : 'border-error text-error'
        }`}>
          {isCatharsis ? 'LIBERATED' : 'BOUND'}
        </span>
      </div>
      
      <div className="text-sm text-text-primary mb-3 pl-4 border-l-2 border-primary/30">
        "{log.confession_text}"
      </div>
      
      <div className="flex justify-between items-center text-xs text-muted">
        <span>
          <span className="text-tertiary">P:</span> {log.prob_score?.toFixed(2) || '0.00'}%
        </span>
        <span>{new Date(log.created_at).toLocaleDateString()}</span>
      </div>
      
      {expanded && log.engine_output && (
        <div className="mt-4 pt-4 border-t border-border">
          <pre className="text-xs text-muted overflow-x-auto whitespace-pre-wrap">
            {JSON.stringify(log.engine_output, null, 2)}
          </pre>
        </div>
      )}
      
      <button 
        onClick={() => setExpanded(!expanded)}
        className="mt-2 text-xs text-tertiary hover:text-primary uppercase tracking-wider"
      >
        {expanded ? '[-] COLLAPSE' : '[+] EXPAND'}
      </button>
    </div>
  );
};

export default UserDashboard;
