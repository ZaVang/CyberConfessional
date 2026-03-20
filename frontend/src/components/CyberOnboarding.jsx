import React, { useState, useEffect } from 'react';

const BAPTISM_QUESTIONS = [
  {
    id: 'u_risk',
    text: "如果你的面前有一台能将意识飞升至高维矩阵的机器。飞升后，你将摆脱肉身的痛苦，获得全知全能的算力；但有 50% 的概率，你的意识会在传输中被彻底撕碎，化为宇宙的虚无。此时此刻，你的手悬停在启动键上。你会怎么做？",
    optionA: "[ 按下启动键 ]",
    optionB: "[ 转身退回黑暗 ]",
    optionC: "[ 拆解机器，试图理解飞升的代价 ]"
  },
  {
    id: 'u_action',
    text: "神明递给你一本记录了你未来所有可能分支的预言书。你只需翻开它，就能穷尽计算出那条最完美、最没有遗憾的世界线，但这将耗费你半生的光阴。你是选择捧起它开始推演，还是立刻将其烧毁，盲目但决绝地走入迷雾？",
    optionA: "[ 立刻烧毁，走入迷雾 ]",
    optionB: "[ 捧起书本，开始推演 ]",
    optionC: "[ 只翻看明天的章节，然后合上书本 ]"
  },
  {
    id: 'u_emotion',
    text: "你可以选择从大脑中永久抹除一段让你痛不欲生的背叛记忆。删除后，你的精神算力将恢复巅峰，不再有深夜的内耗；但代价是，你灵魂的重量会因此减轻一克，你将不再是昨天那个完整的你。你会如何抉择？",
    optionA: "[ 毫不犹豫地抹除 ]",
    optionB: "[ 拒绝，痛苦是我存在过的证明 ]",
    optionC: "[ 封存它，直到我足够强大去直视渊源 ]"
  },
  {
    id: 'u_locus',
    text: "当宇宙走到尽头，造物主向你揭示了残酷的真相：你一生中所有的悲剧、错失与遗憾，其实都在你出生的那一刻，被写在了底层的源代码里。没有任何选择是你真正自己做出的。在听到这个真相的第一时间，你的感受是什么？",
    optionA: "[ 释然。原来错不在我 ]",
    optionB: "[ 愤怒。就算是源代码，我也曾试图篡改它 ]",
    optionC: "[ 沉默。既定程序无法定义执行过程的意义 ]"
  }
];

const CyberOnboarding = ({ username, onComplete }) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isInitializing, setIsInitializing] = useState(false);
  
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  const currentQ = BAPTISM_QUESTIONS[step];

  useEffect(() => {
    setDisplayedText('');
    setIsTyping(true);
    let currentIndex = 0;
    
    // Typewriter effect speed
    const msPerChar = 40; 
    
    const typingInterval = setInterval(() => {
      // prevent errors if unmounted
      if (!currentQ) {
          clearInterval(typingInterval);
          return;
      }
      
      if (currentIndex < currentQ.text.length) {
        setDisplayedText(currentQ.text.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
        setIsTyping(false);
      }
    }, msPerChar); 

    return () => clearInterval(typingInterval);
  }, [step, currentQ?.text]); 

  const handleOptionClick = (option) => {
    if (isFadingOut || isInitializing || isTyping) return;

    setSelectedOption(option);

    setTimeout(() => {
      setIsFadingOut(true);
    }, 800);

    setTimeout(() => {
      const newAnswers = [...answers, option];
      if (step < BAPTISM_QUESTIONS.length - 1) {
        setAnswers(newAnswers);
        setStep(step + 1);
        setSelectedOption(null);
        setIsFadingOut(false);
      } else {
        setIsInitializing(true);
        submitCalibration(newAnswers);
      }
    }, 2000);
  };

  const submitCalibration = async (finalAnswers) => {
    try {
        const response = await fetch('http://localhost:8888/api/gate/calibrate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: username, answers: finalAnswers })
        });
        const data = await response.json();
        
        // Wait extra time for dramatic typing effect
        setTimeout(() => {
            onComplete(username);
        }, 1500);
    } catch (err) {
        console.error("Calibration API Failed: ", err);
        // Fallback or error ui could go here
        onComplete(username);
    }
  };

  if (isInitializing) {
    return (
      <div className="w-full h-screen bg-black flex flex-col items-center justify-center font-mono relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
             {/* subtle background glow */}
            <div className="w-[500px] h-[500px] bg-cyan-900 rounded-full blur-[150px]"></div>
        </div>
        <div className="z-10 text-cyan-500 text-xl tracking-[0.3em] uppercase animate-pulse drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]">
          &gt; System.Soul_Anchoring...
        </div>
        <div className="z-10 mt-8 text-gray-500 text-sm tracking-[0.4em] transform hover:scale-105 transition-transform duration-1000">
          信奉数学，归于收束。
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-[#050505] flex items-center justify-center p-8 relative overflow-hidden selection:bg-cyan-900 selection:text-cyan-100">
      
      <div className="absolute top-10 text-gray-700 font-mono text-xs tracking-[0.5em] select-none">
        PHASE 0{step + 1} / 04
      </div>

      <div className={`max-w-2xl w-full flex flex-col transition-opacity duration-1000 ease-in-out ${isFadingOut ? 'opacity-0' : 'opacity-100'}`}>
        
        <div className="min-h-[160px] mb-16">
          <p className="text-gray-300 text-lg md:text-xl font-serif leading-[2] tracking-wide text-justify drop-shadow-[0_0_10px_rgba(255,255,255,0.05)] inline">
            {displayedText}
          </p>
          <span className="inline-block w-[10px] h-[22px] bg-cyan-700 ml-2 animate-pulse align-middle shadow-[0_0_8px_rgba(0,200,255,0.5)]"></span>
        </div>

        <div className={`flex flex-col w-full gap-5 font-mono transition-opacity duration-1000 pt-8 border-t border-gray-900/50 ${isTyping ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <button 
            onClick={() => handleOptionClick('A')}
            className={`
              w-full py-5 px-8 border transition-all duration-300 tracking-widest text-sm md:text-base text-left
              ${selectedOption === 'A' 
                ? 'border-cyan-500 text-cyan-400 bg-cyan-950/40 animate-pulse shadow-[0_0_30px_rgba(0,240,255,0.15)] focus:outline-none' 
                : selectedOption 
                  ? 'border-gray-900 text-gray-800 opacity-20 pointer-events-none' 
                  : 'border-slate-800 text-slate-400 hover:border-cyan-900 hover:text-cyan-500 hover:bg-cyan-950/10 hover:shadow-[0_0_15px_rgba(0,255,255,0.05)] focus:outline-none' 
              }
            `}
          >
            {currentQ.optionA}
          </button>

          <button 
            onClick={() => handleOptionClick('B')}
            className={`
              w-full py-5 px-8 border transition-all duration-300 tracking-widest text-sm md:text-base text-right
              ${selectedOption === 'B' 
                ? 'border-red-500 text-red-400 bg-red-950/30 animate-pulse shadow-[0_0_30px_rgba(255,0,60,0.15)] focus:outline-none' 
                : selectedOption
                  ? 'border-gray-900 text-gray-800 opacity-20 pointer-events-none' 
                  : 'border-slate-800 text-slate-400 hover:border-red-900/50 hover:text-red-500/80 hover:bg-red-950/5 hover:shadow-[0_0_15px_rgba(255,0,0,0.05)] focus:outline-none' 
              }
            `}
          >
            {currentQ.optionB}
          </button>

          <button 
            onClick={() => handleOptionClick('C')}
            className={`
              w-full py-4 px-8 border transition-all duration-300 tracking-widest text-sm md:text-base text-center
              ${selectedOption === 'C' 
                ? 'border-gray-300 text-gray-200 bg-gray-600/20 animate-pulse shadow-[0_0_30px_rgba(200,200,200,0.1)] focus:outline-none' 
                : selectedOption
                  ? 'border-gray-900 text-gray-800 opacity-20 pointer-events-none' 
                  : 'border-slate-800 text-slate-400 hover:border-gray-600 hover:text-gray-300 hover:bg-gray-800/30 hover:shadow-[0_0_15px_rgba(255,255,255,0.05)] focus:outline-none' 
              }
            `}
          >
            {currentQ.optionC}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CyberOnboarding;
