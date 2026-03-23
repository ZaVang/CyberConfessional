import React, { useState, useEffect } from 'react';
import MermaidDAG from './MermaidDAG';
import KarmaNetwork3D from './KarmaNetwork3D';

const UserDashboard = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [graphData, setGraphData] = useState(null);
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
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col min-h-screen text-gray-200 p-8 pt-24 font-mono">
      <h2 className="text-[#00f0ff] text-2xl font-bold uppercase tracking-widest mb-8 border-b border-[#00f0ff]/30 pb-4">
        Soul Archives (LTM Knowledge Graph)
      </h2>
      
      {error && <div className="text-[#ff003c] mb-4">Error: {error}</div>}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full max-w-7xl mx-auto">
        {/* User List Panel */}
        <div className="col-span-1 border border-cyan-900/50 bg-black/40 p-6 flex flex-col h-[70vh] overflow-y-auto custom-scrollbar">
          <h3 className="text-gray-400 uppercase tracking-widest text-sm mb-6 pb-2 border-b border-gray-800">Anchored Souls</h3>
          {loading && !selectedUser && <div className="text-cyan-500 animate-pulse">Scanning DB...</div>}
          
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
                  <div className="text-xs text-gray-500 uppercase tracking-widest mb-2 font-bold">Global Persona Abstract</div>
                  <p className="font-serif text-gray-300 leading-relaxed">
                    {selectedUser.global_persona_summary || "No abstract converged yet. Soul is still opaque."}
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
              
              {/* LTM Graph */}
              <div className="border border-cyan-900/50 p-6 flex-1 min-h-[400px] bg-black/60 flex flex-col">
                <div className="text-xs text-gray-500 uppercase tracking-widest mb-4 font-bold flex justify-between items-center">
                  <span>Causal Karma Network (LTM)</span>
                  {loading && <span className="text-cyan-500 animate-pulse">Syncing...</span>}
                </div>
                <div className="flex-1 rounded border border-gray-900 overflow-hidden relative">
                  {graphData ? (
                    <KarmaNetwork3D graphData={graphData} />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-600 italic font-serif z-10">
                      Awaiting World-line Extrapolation...
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center border border-dashed border-gray-800 text-gray-600 font-serif text-lg">
              Select a soul from the archives to view its causal destiny.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
