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
    }, 1500);

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
    }, 5500);
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
            <div className="w-[500px] h-[500px] bg-gray-900 rounded-full blur-[150px]"></div>
        </div>
        <div className="z-10 text-gray-500 text-xl tracking-[0.2em] uppercase animate-pulse drop-shadow-[0_0_8px_rgba(107,114,128,0.8)] font-mono glitch" data-text="> Everything in its right place.">
          &gt; Everything in its right place.
        </div>
        <div className="z-10 mt-8 text-gray-600 text-sm tracking-[0.4em] transform hover:scale-105 transition-transform duration-1000">
          (万物皆在它应在的位置)
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex items-center justify-center p-4 md:p-8 relative z-10 overflow-hidden selection:bg-gray-700 selection:text-white">
      
      <div className="absolute top-10 text-gray-400 font-mono text-sm tracking-[0.4em] select-none animate-entry delay-100">
        PHASE 0{step + 1} / 04
      </div>

      <div className={`glass-panel p-8 md:p-12 max-w-3xl w-full flex flex-col transition-opacity duration-[4000ms] ease-in-out font-mono animate-entry delay-200 ${isFadingOut ? 'opacity-0' : 'opacity-100'}`}>
        
        <div className="min-h-[160px] mb-16">
          <p className="text-gray-100 text-xl md:text-2xl font-serif leading-[2.2] tracking-wider text-justify drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] inline font-medium">
            {displayedText}
          </p>
          <span className="inline-block w-[12px] h-[26px] bg-red-600 ml-2 animate-pulse align-middle shadow-[0_0_8px_rgba(255,51,51,0.6)]"></span>
        </div>

        <div className={`flex flex-col w-full gap-5 font-mono transition-opacity duration-1000 pt-8 border-t border-gray-900/50 ${isTyping ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <button 
            onClick={() => handleOptionClick('A')}
            className={`
              w-full py-5 px-8 border transition-all duration-300 tracking-wider text-base md:text-lg text-left font-mono font-medium
              ${selectedOption === 'A' 
                ? 'border-gray-500 text-white bg-gray-800/80 shadow-[0_0_20px_rgba(255,255,255,0.1)] focus:outline-none' 
                : selectedOption 
                  ? 'border-gray-900 text-gray-700 opacity-20 pointer-events-none' 
                  : 'border-gray-700 text-gray-300 hover:border-gray-400 hover:text-white hover:bg-gray-800/50 hover:shadow-[0_0_15px_rgba(255,255,255,0.08)] cursor-pointer focus:outline-none' 
              }
            `}
          >
            {currentQ.optionA}
          </button>

          <button 
            onClick={() => handleOptionClick('B')}
            className={`
              w-full py-5 px-8 border transition-all duration-300 tracking-wider text-base md:text-lg text-right font-mono font-medium
              ${selectedOption === 'B' 
                ? 'border-red-500 text-red-100 bg-red-900/60 shadow-[0_0_30px_rgba(255,51,51,0.3)] focus:outline-none' 
                : selectedOption
                  ? 'border-gray-900 text-gray-700 opacity-20 pointer-events-none' 
                  : 'border-gray-700 text-gray-300 hover:border-red-700/80 hover:text-red-400 hover:bg-red-950/40 hover:shadow-[0_0_20px_rgba(255,51,51,0.15)] cursor-pointer focus:outline-none' 
              }
            `}
          >
            {currentQ.optionB}
          </button>

          <button 
            onClick={() => handleOptionClick('C')}
            className={`
              w-full py-5 px-8 border transition-all duration-300 tracking-wider text-base md:text-lg text-center font-mono font-medium
              ${selectedOption === 'C' 
                ? 'border-green-500 text-green-100 bg-green-900/50 shadow-[0_0_30px_rgba(0,255,65,0.2)] focus:outline-none' 
                : selectedOption
                  ? 'border-gray-900 text-gray-700 opacity-20 pointer-events-none' 
                  : 'border-gray-700 text-gray-300 hover:border-green-800/60 hover:text-green-400 hover:bg-green-950/30 hover:shadow-[0_0_20px_rgba(0,255,65,0.1)] cursor-pointer focus:outline-none' 
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
