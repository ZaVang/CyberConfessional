import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

const MermaidDAG = ({ chartString }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    // 1. Initialize Cyberpunk Theme
    mermaid.initialize({
      startOnLoad: false,
      theme: 'base',
      themeVariables: {
        background: 'transparent',
        primaryColor: '#050505',
        primaryBorderColor: '#00F0FF',
        primaryTextColor: '#E0E0E0',
        lineColor: '#FF003C',
        textColor: '#00F0FF',
        fontFamily: 'monospace',
        fontSize: '12px',
        edgeLabelBackground: '#00313E',
      }
    });

    // 2. Render Diagram
    if (containerRef.current && chartString) {
      // Clear previous content
      containerRef.current.innerHTML = '';
      
      const uniqueId = `cybergraph-${Math.random().toString(36).substr(2, 9)}`;
      
      try {
        mermaid.render(uniqueId, chartString).then((result) => {
          if (containerRef.current) {
            containerRef.current.innerHTML = result.svg;
          }
        }).catch((err) => {
          console.error("Mermaid Render Error:", err);
        });
      } catch (e) {
        console.error("Mermaid Sync Error:", e);
      }
    }
  }, [chartString]);

  return (
    <div className="w-full h-full min-h-[250px] p-4 flex justify-center items-center border border-gray-800 rounded-lg bg-black/40 backdrop-blur-sm transition-all hover:border-cyan-500/30">
      <div ref={containerRef} className="mermaid-container w-full flex justify-center overflow-x-auto" />
    </div>
  );
};

export default MermaidDAG;
