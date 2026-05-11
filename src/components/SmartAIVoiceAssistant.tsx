import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Loader2, Sparkles, Zap, Shield, Settings, ImageIcon, Layout } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SmartAIVoiceAssistantProps {
  onCommand: (action: string, data?: any) => void;
  onMessage: (role: 'user' | 'assistant', content: string) => void;
}

type AssistantState = 'idle' | 'listening' | 'thinking' | 'speaking';

const SmartAIVoiceAssistant: React.FC<SmartAIVoiceAssistantProps> = ({ onCommand, onMessage }) => {
  const [state, setState] = useState<AssistantState>('idle');
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const transcriptRef = useRef('');
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [waveform, setWaveform] = useState<number[]>(new Array(10).fill(5));

  const initRecognition = () => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'hi-IN';

        recognitionRef.current.onstart = () => {
          setState('listening');
          setTranscript('');
          transcriptRef.current = '';
        };

        recognitionRef.current.onresult = (event: any) => {
          let interimTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const resultText = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              transcriptRef.current += resultText;
            } else {
              interimTranscript += resultText;
            }
          }
          setTranscript(transcriptRef.current || interimTranscript);
          
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = setTimeout(() => {
            if (transcriptRef.current || interimTranscript) {
               recognitionRef.current?.stop();
            }
          }, 1000); // Super fast 1s silence detection
        };

        recognitionRef.current.onend = () => {
          if (state === 'listening' || transcriptRef.current) {
            processVoiceCommand();
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error("Mic Error:", event.error);
          if (event.error !== 'no-speech') setState('idle');
        };
      }
      synthRef.current = window.speechSynthesis;
    }
  };

  useEffect(() => {
    initRecognition();
    return () => { if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current); };
  }, []);

  useEffect(() => {
    let animationId: number;
    if (state === 'speaking' || state === 'listening') {
      const updateWaveform = () => {
        setWaveform(Array.from({ length: 10 }, () => Math.random() * (state === 'speaking' ? 40 : 20) + 5));
        animationId = requestAnimationFrame(updateWaveform);
      };
      updateWaveform();
    } else {
      setWaveform(new Array(10).fill(5));
    }
    return () => cancelAnimationFrame(animationId);
  }, [state]);

  const toggleListening = () => {
    if (state === 'idle' || state === 'speaking') {
      if (state === 'speaking') synthRef.current?.cancel();
      try {
        recognitionRef.current?.start();
      } catch (e) {
        recognitionRef.current?.stop();
        setTimeout(() => recognitionRef.current?.start(), 100);
      }
    } else {
      recognitionRef.current?.stop();
      setState('idle');
    }
  };

  const processVoiceCommand = async () => {
    const rawText = (transcriptRef.current || transcript).trim();
    if (!rawText || state === 'thinking') return;

    setState('thinking');
    onMessage('user', rawText);
    
    const lowerText = rawText.toLowerCase();
    
    // Improved Command Keywords (Loose Match)
    const isSettings = lowerText.includes("setting") || lowerText.includes("sating") || lowerText.includes("kholo");
    const isImage = lowerText.includes("image") || lowerText.includes("photo") || lowerText.includes("generator") || lowerText.includes("tab");
    const isExpert = lowerText.includes("expert") || lowerText.includes("mode") || lowerText.includes("neural");

    if (isSettings && (lowerText.includes("kholo") || lowerText.includes("open") || lowerText.includes("setting"))) {
       executeAction("settings", "Sir, I am opening the settings panel for you.");
       return;
    }
    
    if (isImage && (lowerText.includes("tab") || lowerText.includes("generator") || lowerText.includes("banao"))) {
       executeAction("image", "Switching to the Image Generation workspace.");
       return;
    }

    if (isExpert && (lowerText.includes("activate") || lowerText.includes("open") || lowerText.includes("expert"))) {
       executeAction("expert", "Expert Mode initialized. Connecting to secure servers.");
       return;
    }

    // AI Brain
    try {
      const res = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: rawText, system: "You are Jarvis. Be brief. Use [ACTION:settings] etc if asked to open tools." })
      });
      const response = await res.text();
      const cleanResponse = response.replace(/\[ACTION:.*?\]/g, "").trim() || "Task completed, sir.";
      
      if (response.includes("[ACTION:settings]")) onCommand("settings");
      if (response.includes("[ACTION:image]")) onCommand("image");

      onMessage('assistant', cleanResponse);
      setAiResponse(cleanResponse);
      speak(cleanResponse);
    } catch (e) {
      const errorMsg = "Core link unstable. Retrying in background.";
      setAiResponse(errorMsg);
      speak(errorMsg);
      setState('idle');
    }
  };

  const executeAction = (action: string, response: string, data?: any) => {
    onCommand(action, data);
    onMessage('assistant', response);
    setAiResponse(response);
    speak(response);
  };

  const speak = (text: string) => {
    if (!synthRef.current || !text) {
       setState('idle');
       return;
    }
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const isHindi = /[\u0900-\u097F]/.test(text);
    
    // Explicit Voice Selection for Hindi
    if (isHindi) {
       utterance.lang = 'hi-IN';
       const voices = synthRef.current.getVoices();
       const hindiVoice = voices.find(v => v.lang.includes('hi'));
       if (hindiVoice) utterance.voice = hindiVoice;
    } else {
       utterance.lang = 'en-US';
    }
    
    utterance.onstart = () => setState('speaking');
    utterance.onend = () => setState('idle');
    utterance.onerror = () => setState('idle');
    synthRef.current.speak(utterance);
  };

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[999] flex flex-col items-center gap-6">
      <AnimatePresence>
        {state !== 'idle' && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }} className="bg-black/95 border border-purple-500/60 backdrop-blur-3xl rounded-3xl p-6 shadow-[0_0_80px_rgba(168,85,247,0.5)] flex flex-col items-center gap-3 min-w-[320px]">
            <div className="flex items-center gap-4">
              {state === 'listening' && (
                <div className="flex gap-1.5 items-center h-6">
                   {waveform.map((h, i) => (<motion.div key={i} className="w-1.5 bg-purple-500 rounded-full" animate={{ height: h }} />))}
                   <span className="text-sm font-black text-purple-400 tracking-tighter ml-2">JARVIS LISTENING...</span>
                </div>
              )}
              {state === 'thinking' && (<><Loader2 className="w-6 h-6 text-purple-500 animate-spin" /><span className="text-sm font-black text-purple-400 tracking-tighter">PROCESSING...</span></>)}
              {state === 'speaking' && (
                 <div className="flex gap-1.5 items-center h-6">
                   {waveform.map((h, i) => (<motion.div key={i} className="w-1.5 bg-indigo-500 rounded-full" animate={{ height: h * 1.5 }} />))}
                   <span className="text-sm font-black text-indigo-400 tracking-tighter ml-2">REPLYING...</span>
                </div>
              )}
            </div>
            <p className="text-xs text-slate-300 font-medium italic text-center max-w-[280px] line-clamp-2">
               {transcript || "I am processing your voice signature..."}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} onClick={toggleListening} className={`relative w-32 h-32 rounded-full flex items-center justify-center border-2 transition-all duration-700 shadow-2xl ${state === 'idle' ? 'bg-[#0a0a0f]/90 border-purple-500/60 text-purple-500' : state === 'listening' ? 'bg-purple-600 border-white text-white scale-110 shadow-[0_0_60px_rgba(168,85,247,0.8)]' : 'bg-[#0d111c] border-indigo-500 text-indigo-400'}`}>
        <div className="relative z-10">
          {state === 'idle' && <Mic className="w-14 h-14" />}
          {state === 'listening' && <Mic className="w-14 h-14" />}
          {state === 'thinking' && <Loader2 className="w-14 h-14 animate-spin" />}
          {state === 'speaking' && <Volume2 className="w-14 h-14" />}
        </div>
        {state !== 'idle' && <div className="absolute inset-0 bg-gradient-radial from-purple-500/20 to-transparent animate-pulse" />}
      </motion.button>
    </div>
  );
};

export default SmartAIVoiceAssistant;
