import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from './LanguageContext';

const CyberOnboarding = ({ username, onComplete }) => {
  const { t, language } = useLanguage();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isInitializing, setIsInitializing] = useState(false);
  
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  const BAPTISM_QUESTIONS = useMemo(() => [
    {
      id: 'u_risk',
      text: t('q1_text'),
      optionA: t('q1_a'),
      optionB: t('q1_b'),
      optionC: t('q1_c')
    },
    {
      id: 'u_action',
      text: t('q2_text'),
      optionA: t('q2_a'),
      optionB: t('q2_b'),
      optionC: t('q2_c')
    },
    {
      id: 'u_emotion',
      text: t('q3_text'),
      optionA: t('q3_a'),
      optionB: t('q3_b'),
      optionC: t('q3_c')
    },
    {
      id: 'u_locus',
      text: t('q4_text'),
      optionA: t('q4_a'),
      optionB: t('q4_b'),
      optionC: t('q4_c')
    }
  ], [language, t]);

  const currentQ = useMemo(() => BAPTISM_QUESTIONS[step], [BAPTISM_QUESTIONS, step]);

  useEffect(() => {
    setDisplayedText('');
    setIsTyping(true);
    let currentIndex = 0;
    
    if (!currentQ) return;
    
    // Typewriter effect speed
    const msPerChar = 40; 
    
    const typingInterval = setInterval(() => {
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
        await fetch('http://localhost:8888/api/gate/calibrate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: username, answers: finalAnswers })
        });
        
        setTimeout(() => {
            onComplete(username);
        }, 1500);
    } catch (err) {
        onComplete(username);
    }
  };

  if (isInitializing) {
    return (
      <div className="w-full h-screen bg-black flex flex-col items-center justify-center font-mono relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
            <div className="w-[500px] h-[500px] bg-gray-900 rounded-full blur-[150px]"></div>
        </div>
        <div className="z-10 text-gray-500 text-xl tracking-[0.2em] uppercase animate-pulse drop-shadow-[0_0_8px_rgba(107,114,128,0.8)] font-mono glitch" data-text={`> ${t('onboarding_everything')}.`}>
          &gt; {t('onboarding_everything')}.
        </div>
        <div className="z-10 mt-8 text-gray-600 text-sm tracking-[0.4em] transform hover:scale-105 transition-transform duration-1000">
          ({language === 'en' ? 'Everything in its right place' : '万物皆在它应在的位置'})
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex items-center justify-center p-4 md:p-8 relative z-10 overflow-hidden selection:bg-gray-700 selection:text-white">
      
      <div className="absolute top-10 text-gray-400 font-mono text-sm tracking-[0.4em] select-none animate-entry delay-100">
        {t('onboarding_phase')} 0{step + 1} / 04
      </div>

      <div className="glass-panel p-8 md:p-12 max-w-3xl w-full flex flex-col transition-opacity duration-[4000ms] ease-in-out font-mono animate-entry delay-200">
        
        <div className="min-h-[160px] mb-16 text-left">
          <p className="text-gray-100 text-xl md:text-2xl font-serif leading-[2.2] tracking-wider text-justify drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] inline font-medium">
            {displayedText}
          </p>
          <span className="inline-block w-[12px] h-[26px] bg-red-600 ml-2 animate-pulse align-middle shadow-[0_0_8px_rgba(255,51,51,0.6)]"></span>
        </div>

        <div className="flex flex-col w-full gap-5 font-mono transition-opacity duration-1000 pt-8 border-t border-gray-900/50">
          <button 
            onClick={() => handleOptionClick('A')}
            className={`w-full py-5 px-8 border transition-all duration-300 tracking-wider text-base md:text-lg text-left font-mono font-medium ${
              selectedOption === 'A' 
                ? 'border-gray-500 text-white bg-gray-800/80 shadow-[0_0_20px_rgba(255,255,255,0.1)]' 
                : selectedOption 
                  ? 'border-gray-900 text-gray-700 opacity-20 pointer-events-none' 
                  : 'border-gray-700 text-gray-300 hover:border-gray-400 hover:text-white hover:bg-gray-800/50 cursor-pointer'
            }`}
          >
            {currentQ?.optionA}
          </button>

          <button 
            onClick={() => handleOptionClick('B')}
            className={`w-full py-5 px-8 border transition-all duration-300 tracking-wider text-base md:text-lg text-right font-mono font-medium ${
              selectedOption === 'B' 
                ? 'border-red-500 text-red-100 bg-red-900/60 shadow-[0_0_30px_rgba(255,51,51,0.3)]' 
                : selectedOption
                  ? 'border-gray-900 text-gray-700 opacity-20 pointer-events-none' 
                  : 'border-gray-700 text-gray-300 hover:border-red-700/80 hover:text-red-400 hover:bg-red-950/40 cursor-pointer'
            }`}
          >
            {currentQ?.optionB}
          </button>

          <button 
            onClick={() => handleOptionClick('C')}
            className={`w-full py-5 px-8 border transition-all duration-300 tracking-wider text-base md:text-lg text-center font-mono font-medium ${
              selectedOption === 'C' 
                ? 'border-green-500 text-green-100 bg-green-900/50 shadow-[0_0_30px_rgba(0,255,65,0.2)]' 
                : selectedOption
                  ? 'border-gray-900 text-gray-700 opacity-20 pointer-events-none' 
                  : 'border-gray-700 text-gray-300 hover:border-green-800/60 hover:text-green-400 hover:bg-green-950/30 cursor-pointer'
            }`}
          >
            {currentQ?.optionC}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CyberOnboarding;