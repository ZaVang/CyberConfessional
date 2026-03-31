import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import SpriteText from 'three-spritetext';
import * as THREE from 'three';

const KarmaNetwork3D = ({ graphData }) => {
  const fgRef = useRef();
  const [zoom, setZoom] = useState(250);
  const [entropyThreshold, setEntropyThreshold] = useState(0); // 0-100% threshold

  // Pin the 'U' node to the center (0,0,0) forming the core of the soul
  const processedData = useMemo(() => {
    if (!graphData || !graphData.nodes) return null;
    
    // 1. Calculate Decay and Filtering
    const now = new Date();
    const filteredNodes = graphData.nodes
      .map(n => {
        const lastTriggered = new Date(n.last_triggered_at);
        const ageInDays = (now - lastTriggered) / (1000 * 60 * 60 * 24);
        
        // Decay factor: trigger_count matters most, then age
        // Nodes triggered once long ago are most likely to be filtered
        const importance = (n.trigger_count * 10) / (Math.log(ageInDays + 2));
        
        // Pin U node to origin
        const baseNode = n.node_type === 'U' 
          ? { ...n, fx: 0, fy: 0, fz: 0 } 
          : { ...n };
          
        return { 
          ...baseNode, 
          importance,
          ageInDays
        };
      })
      .filter(n => {
        if (n.node_type === 'U') return true; // Always keep the core
        // Simple threshold based on trigger count for now (easier for user to understand)
        // If threshold > 0, hide nodes with trigger_count <= threshold - 1
        return n.trigger_count >= (entropyThreshold / 10);
      });

    // 2. Filter links - only keep links where both source and target exist
    const nodeIds = new Set(filteredNodes.map(n => n.id));
    const filteredLinks = (graphData.links || []).filter(l => 
      nodeIds.has(typeof l.source === 'object' ? l.source.id : l.source) && 
      nodeIds.has(typeof l.target === 'object' ? l.target.id : l.target)
    );

    return { nodes: filteredNodes, links: filteredLinks };
  }, [graphData, entropyThreshold]);

  const resetView = useCallback(() => {
    setZoom(400);
    if (fgRef.current) {
      const uNode = processedData?.nodes?.find(n => n.node_type === 'U');
      if (uNode) {
        // Lock onto the exact rendered coordinate of U, instead of assuming absolute 0
        fgRef.current.cameraPosition(
          { x: uNode.x || 0, y: uNode.y || 0, z: (uNode.z || 0) + 250 }, 
          { x: uNode.x || 0, y: uNode.y || 0, z: uNode.z || 0 }, 
          1200
        );
      } else {
        // Fallback
        fgRef.current.zoomToFit(1200, 50);
      }
    }
  }, [processedData]);

  // Only reset camera when the underlying graph data identity changes
  useEffect(() => {
    if (fgRef.current && processedData?.nodes?.length > 0) {
      const timer = setTimeout(() => resetView(), 600);
      return () => clearTimeout(timer);
    }
  }, [processedData]);

  const handleZoom = (e) => {
    const val = parseInt(e.target.value);
    setZoom(val);
    if (fgRef.current) {
      // Keep x and y relative to maintain angle, just scale distance
      // If they clicked a node, this pulls them back/pushes them in
      fgRef.current.cameraPosition({ z: val });
    }
  };

  const getNodeColor = (type, triggerCount = 1) => {
    const opacity = triggerCount > 1 ? 1 : 0.6;
    switch (type) {
      case 'Z': return `rgba(59, 130, 246, ${opacity})`; // Blue
      case 'M': return `rgba(234, 179, 8, ${opacity})`; // Yellow
      case 'X': return `rgba(34, 197, 94, ${opacity})`; // Green
      case 'Y': return `rgba(168, 85, 247, ${opacity})`; // Purple
      case 'U': return '#FF003C'; // Red for Latents (Full)
      default: return `rgba(255, 255, 255, ${opacity})`;
    }
  };

  if (!processedData || !processedData.nodes || processedData.nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full w-full text-gray-600 italic font-serif">
        Awaiting World-line Extrapolation...
      </div>
    );
  }

  // Modern grid background logic via CSS
  return (
    <div className="w-full h-full relative" style={{ 
      background: 'radial-gradient(circle at center, #0a0a0a 0%, #000000 100%)',
      backgroundImage: `linear-gradient(rgba(0, 240, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 240, 255, 0.03) 1px, transparent 1px)`,
      backgroundSize: '40px 40px'
    }}>
      <ForceGraph3D
        ref={fgRef}
        graphData={processedData}
        backgroundColor="rgba(0,0,0,0)" // Transparent background let CSS shine through
        
        // Nodes
        nodeColor={(n) => getNodeColor(n.node_type, n.trigger_count)}
        nodeRelSize={1} // We will provide custom size in nodeThreeObject or nodeVal
        nodeVal={n => {
          if (n.node_type === 'U') return 12;
          return 4 + (n.trigger_count * 2); // Scale size by frequency
        }}
        nodeResolution={32}
        
        // Node labels
        nodeThreeObject={(node) => {
          // Add a hovering textual label above the node sphere
          const group = new THREE.Group();
          
          let labelText = `[${node.node_type}] ${node.name}`;
          if (node.trigger_count > 1) {
            labelText += ` (x${node.trigger_count})`;
          }

          const sprite = new SpriteText(labelText);
          sprite.color = getNodeColor(node.node_type, node.trigger_count);
          sprite.textHeight = node.trigger_count > 1 ? 8 : 5;
          sprite.backgroundColor = 'rgba(0, 0, 0, 0.8)';
          sprite.padding = 3;
          sprite.borderRadius = 8;
          sprite.borderWidth = 0.5;
          sprite.borderColor = getNodeColor(node.node_type);
          
          sprite.position.y = 12; // float above
          group.add(sprite);

          return group;
        }}
        nodeThreeObjectExtend={true} // Keeps the default sphere + custom text
        
        // Links
        linkWidth={1.5}
        linkColor={() => 'rgba(0, 240, 255, 0.4)'}
        linkDirectionalParticles={3}
        linkDirectionalParticleWidth={2.5}
        linkDirectionalParticleSpeed={() => 0.005}
        linkDirectionalArrowLength={4}
        linkDirectionalArrowRelPos={1}
        
        warmupTicks={50}
        cooldownTicks={200}
        d3AlphaDecay={0.02}
        d3VelocityDecay={0.3}
        onEngineStop={() => {
          // Set compact forces AFTER engine initializes, then reheat so they take effect
          if (fgRef.current) {
            const charge = fgRef.current.d3Force('charge');
            const link = fgRef.current.d3Force('link');
            if (charge) charge.strength(-120);
            if (link) link.distance(55);
          }
          resetView();
        }}
        
        // Interactivity
        onNodeClick={(node) => {
           // Smoothly zoom in to the clicked node (safe absolute positioning)
           const distance = 150;
           const newPos = { 
             x: node.x || 0, 
             y: node.y || 0, 
             z: (node.z || 0) + distance 
           };
           
           setZoom(distance); // Sync the slider
           
           fgRef.current.cameraPosition(
             newPos, // Safe position, looking straight down the Z axis
             { x: node.x || 0, y: node.y || 0, z: node.z || 0 }, // Precise lookAt
             1200  // ms transition
           );
        }}
      />
      
      {/* Zoom UI & Reset Button */}
      <div className="absolute top-4 right-4 flex flex-col items-end gap-4 z-10 w-48">
        <button 
          onClick={resetView}
          className="px-4 py-2 border border-[#00f0ff] text-[#00f0ff] text-xs uppercase tracking-widest hover:bg-[#00f0ff]/20 transition-all font-bold backdrop-blur-sm"
        >
          [ RECENTER SOUL ]
        </button>
        
        <div className="flex flex-col items-center w-full bg-black/60 p-3 border border-gray-800 backdrop-blur-sm">
          <label className="text-[10px] uppercase text-gray-500 mb-2 font-bold tracking-widest w-full text-left flex justify-between">
            <span>Observation Distance</span>
            <span className="text-cyan-600">{zoom}</span>
          </label>
          <input 
            type="range" 
            min="50" max="2500" step="10"
            value={zoom} 
            onChange={handleZoom}
            className="w-full accent-[#00f0ff] cursor-pointer"
          />
        </div>

        <div className="flex flex-col items-center w-full bg-black/60 p-3 border border-gray-800 backdrop-blur-sm">
          <label className="text-[10px] uppercase text-red-500 mb-2 font-bold tracking-widest w-full text-left flex justify-between">
            <span>Noise Cancellation</span>
            <span className={entropyThreshold > 0 ? 'animate-pulse' : ''}>{entropyThreshold}%</span>
          </label>
          <input 
            type="range" 
            min="0" max="100" step="1"
            value={entropyThreshold} 
            onChange={(e) => setEntropyThreshold(parseInt(e.target.value))}
            className="w-full accent-red-600 cursor-pointer"
          />
          <div className="w-full flex justify-between text-[8px] text-gray-600 mt-1 uppercase font-bold">
            <span>Original</span>
            <span>Collapse</span>
          </div>
        </div>
      </div>

      {/* HUD overlay */}
      <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm p-4 border border-cyan-900/50 pointer-events-none text-[10px] uppercase text-gray-400">
        <div className="flex items-center gap-2 mb-2"><div className="w-3 h-3 bg-[#FF003C] rounded-full shadow-[0_0_8px_#FF003C]"></div> U: Subconscious Core (Origin)</div>
        <div className="flex items-center gap-2 mb-2"><div className="w-3 h-3 bg-[#EAB308] rounded-full shadow-[0_0_8px_#EAB308]"></div> M: Flawed Mechanisms</div>
        <div className="flex items-center gap-2 mb-2"><div className="w-3 h-3 bg-[#3b82f6] rounded-full"></div> Z: Environment Confounds</div>
        <div className="flex items-center gap-2 mb-2"><div className="w-3 h-3 bg-[#22c55e] rounded-full"></div> X: World-line Decisions</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-[#a855f7] rounded-full shadow-[0_0_8px_#a855f7]"></div> Y: Realized Outcomes</div>
      </div>
      
      <div className="absolute top-4 left-4 pointer-events-none text-xs text-cyan-500/50 uppercase tracking-widest font-bold">
        Left Click: Rotate | Right Click: Pan | Wheel: Zoom | Click Node: Inspect
      </div>
    </div>
  );
};

export default KarmaNetwork3D;
