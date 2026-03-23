import React, { useRef, useEffect } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import SpriteText from 'three-spritetext';
import * as THREE from 'three';

const KarmaNetwork3D = ({ graphData }) => {
  const fgRef = useRef();

  useEffect(() => {
    if (fgRef.current && graphData?.nodes?.length > 0) {
      fgRef.current.d3Force('charge').strength(-400); // repulse nodes heavily for better spacing
      fgRef.current.cameraPosition({ z: 400 }, null, 1000);
    }
  }, [graphData]);

  const getNodeColor = (type) => {
    switch (type) {
      case 'Z': return '#3b82f6'; // Blue for Environment
      case 'M': return '#EAB308'; // Yellow for Mechanism
      case 'X': return '#22c55e'; // Green for Actions
      case 'Y': return '#a855f7'; // Purple for Outcomes
      case 'U': return '#FF003C'; // Red for Latents
      default: return '#ffffff';
    }
  };

  if (!graphData || !graphData.nodes || graphData.nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full w-full text-gray-600 italic font-serif">
        Awaiting World-line Extrapolation...
      </div>
    );
  }

  return (
    <div className="w-full h-full cursor-move relative bg-black/40">
      <ForceGraph3D
        ref={fgRef}
        graphData={graphData}
        backgroundColor="rgba(0,0,0,0)" // Transparent background
        
        // Nodes
        nodeColor={(n) => getNodeColor(n.node_type)}
        nodeRelSize={6}
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
          sprite.color = getNodeColor(node.node_type);
          sprite.textHeight = 6;
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
        
        // Interactivity
        onNodeClick={(node) => {
           // Smoothly zoom in to the clicked node
           const distance = 100;
           const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);
           fgRef.current.cameraPosition(
             { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }, // pos
             node, // lookAt
             1500  // ms transition
           );
        }}
      />
      
      {/* HUD overlay */}
      <div className="absolute bottom-4 right-4 bg-black/60 p-4 border border-cyan-900/50 pointer-events-none text-[10px] uppercase text-gray-500">
        <div className="flex items-center gap-2 mb-1"><div className="w-3 h-3 bg-[#3b82f6] rounded-full"></div> Z: Environment Confounds</div>
        <div className="flex items-center gap-2 mb-1"><div className="w-3 h-3 bg-[#FF003C] rounded-full"></div> U: Subconscious Latents</div>
        <div className="flex items-center gap-2 mb-1"><div className="w-3 h-3 bg-[#EAB308] rounded-full"></div> M: Flawed Mechanisms</div>
        <div className="flex items-center gap-2 mb-1"><div className="w-3 h-3 bg-[#22c55e] rounded-full"></div> X: World-line Decisions</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-[#a855f7] rounded-full"></div> Y: Realized Outcomes</div>
      </div>
      
      <div className="absolute top-4 left-4 pointer-events-none text-xs text-cyan-500/50 uppercase tracking-widest font-bold">
        Left Click: Rotate | Right Click: Pan | Scroll: Zoom | Click Node: Focus
      </div>
    </div>
  );
};

export default KarmaNetwork3D;
