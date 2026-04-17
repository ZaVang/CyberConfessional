import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  const typingIntervalRef = useRef(null);

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
    
    typingIntervalRef.current = setInterval(() => {
      if (currentIndex < currentQ.text.length) {
        setDisplayedText(currentQ.text.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(typingIntervalRef.current);
        setIsTyping(false);
      }
    }, msPerChar); 

    const handleKeyDown = (e) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        if (isTyping) {
          skipTyping();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearInterval(typingIntervalRef.current);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [step, currentQ?.text]); 

  const skipTyping = () => {
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }
    setDisplayedText(currentQ.text);
    setIsTyping(false);
  };

  const handleOptionClick = (option) => {
    if (isFadingOut || isInitializing || isTyping) return;

    setSelectedOption(option);

    setTimeout(() => {
      setIsFadingOut(true);
    }, 500);

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
    }, 1300);
  };

  const submitCalibration = async (finalAnswers) => {
    try {
        const res = await fetch('http://localhost:8888/api/gate/calibrate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: username, answers: finalAnswers })
        });
        const data = await res.json();
        setTimeout(() => {
            onComplete(username, data.user_id || null);
        }, 1500);
    } catch (err) {
        onComplete(username, null);
    }
  };

  // Terminal Style Initialization Screen
  if (isInitializing) {
    return (
      <div className="w-full h-screen flex items-center justify-center font-mono relative z-10">
        {/* CRT Overlay */}
        <div className="crt-overlay"></div>
        
        <div className="z-10 text-center animate-fade-in">
          <pre className="text-primary text-xs leading-tight mb-8" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
{`
╔═══════════════════════════════════════╗
║   INITIALIZING SOUL CALIBRATION...   ║
╚═══════════════════════════════════════╝
`}
          </pre>
          <div className="text-primary text-xl tracking-[0.2em] uppercase animate-blink cursor-blink">
            &gt; {t('onboarding_everything')}.
          </div>
          <div className="text-muted text-sm tracking-[0.4em] mt-8">
            // {language === 'en' ? 'Everything in its right place' : '万物皆在它应在的位置'}
          </div>
          
          {/* Loading Animation */}
          <div className="mt-12">
            <span className="loading-indicator">
              <span className="loading-dots">
                <span className="loading-dot"></span>
                <span className="loading-dot"></span>
                <span className="loading-dot"></span>
              </span>
              PROCESSING...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex items-center justify-center p-4 md:p-8 relative z-10 overflow-hidden">
      {/* CRT Overlay */}
      <div className="crt-overlay"></div>
      
      {/* Progress Indicator */}
      <div className="absolute top-10 text-tertiary font-mono text-sm tracking-[0.4em] uppercase">
        <span className="text-secondary">$</span> CALIBRATION_PHASE: 0{step + 1} / 04
      </div>

      {/* Question Card - Terminal Style */}
      <div className={`terminal-panel-bright p-8 md:p-12 max-w-3xl w-full flex flex-col transition-all duration-500 font-mono animate-slide-up ${isFadingOut ? 'opacity-0 translate-y-4' : ''}`}>
        
        {/* Question Text */}
        <div className="min-h-[120px] mb-12 text-left relative">
          <div className="text-xs text-secondary uppercase tracking-wider mb-4">
            <span className="text-muted">//</span> QUESTION_{step + 1}
          </div>
          <p className="text-text-primary text-lg md:text-xl leading-relaxed">
            {displayedText}
            {isTyping && <span className="text-secondary cursor-blink">_</span>}
          </p>
          
          {isTyping && (
            <button 
              onClick={skipTyping}
              className="absolute -bottom-8 right-0 text-[10px] text-muted hover:text-primary uppercase tracking-wider font-mono transition-colors"
            >
              [ {t('onboarding_skip')} ]
            </button>
          )}
        </div>

        {/* Options - Terminal Style */}
        <div className="flex flex-col w-full gap-4 font-mono transition-all duration-300 pt-6 border-t border-border">
          <button 
            onClick={() => handleOptionClick('A')}
            className={`w-full py-4 px-6 border transition-all duration-300 tracking-wider text-left ${
              selectedOption === 'A' 
                ? 'border-primary text-primary bg-surface' 
                : selectedOption 
                  ? 'border-border text-muted opacity-30 pointer-events-none' 
                  : 'border-border text-text-primary hover:border-primary hover:text-primary cursor-pointer'
            }`}
          >
            <span className="text-muted mr-4">[A]</span> {currentQ?.optionA}
          </button>

          <button 
            onClick={() => handleOptionClick('B')}
            className={`w-full py-4 px-6 border transition-all duration-300 tracking-wider text-left ${
              selectedOption === 'B' 
                ? 'border-secondary text-secondary bg-surface' 
                : selectedOption
                  ? 'border-border text-muted opacity-30 pointer-events-none' 
                  : 'border-border text-text-primary hover:border-secondary hover:text-secondary cursor-pointer'
            }`}
          >
            <span className="text-muted mr-4">[B]</span> {currentQ?.optionB}
          </button>
  
          <button 
            onClick={() => handleOptionClick('C')}
            className={`w-full py-4 px-6 border transition-all duration-300 tracking-wider text-left ${
                selectedOption === 'C' 
                  ? 'border-tertiary text-tertiary bg-surface' 
                  : selectedOption
                    ? 'border-border text-muted opacity-30 pointer-events-none' 
                    : 'border-border text-text-primary hover:border-tertiary hover:text-tertiary cursor-pointer'
            }`}
          >
            <span className="text-muted mr-4">[C]</span> {currentQ?.optionC}
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mt-8">
          <div className="flex justify-between text-xs text-muted uppercase tracking-wider mb-2">
            <span>PROGRESS</span>
            <span>{Math.round(((step + 1) / 4) * 100)}%</span>
          </div>
          <div className="progress-bar">
            <div className="fill" style={{ width: `${((step + 1) / 4) * 100}%` }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CyberOnboarding;
