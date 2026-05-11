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
        recognitionRef.current.lang = 'hi-IN'; // Default to Hindi-India for better bilingual support

        recognitionRef.current.onstart = () => {
          setState('listening');
          setTranscript('');
          transcriptRef.current = '';
          console.log("Neural ears active...");
        };

        recognitionRef.current.onresult = (event: any) => {
          let interimText = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const part = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              transcriptRef.current += part;
            } else {
              interimText += part;
            }
          }
          setTranscript(transcriptRef.current || interimText);
          
          // Ultra-sensitive silence detection (900ms for instant feel)
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = setTimeout(() => {
            if (transcriptRef.current || interimText) {
               recognitionRef.current?.stop();
            }
          }, 900);
        };

        recognitionRef.current.onend = () => {
          if (state === 'listening' || transcriptRef.current) {
            processVoiceCommand();
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error("Mic Fault:", event.error);
          if (event.error === 'network') {
            onMessage('assistant', "Neural link unstable. Check your connection, sir.");
          }
          setState('idle');
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
    // Cancel any current speech before listening
    if (synthRef.current?.speaking) {
      synthRef.current.cancel();
    }

    if (state === 'idle' || state === 'speaking') {
      try {
        // Fast start
        recognitionRef.current?.start();
      } catch (e) {
        recognitionRef.current?.stop();
        setTimeout(() => recognitionRef.current?.start(), 50);
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
    
    // Agentic Actions
    const matchesSettings = /setting|kholo|sating|open/i.test(lowerText) && /setting|sating/i.test(lowerText);
    const matchesImage = /image|photo|generator|tab|banao/i.test(lowerText) && /image|photo|generator/i.test(lowerText);

    if (matchesSettings) {
       executeAction("settings", "Accessing system settings. Interfaces engaged.");
       return;
    }
    
    if (matchesImage) {
       executeAction("image", "Switching to primary image generation matrix.");
       return;
    }

    // AI Intelligence Call
    try {
      const res = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: rawText, system: "You are SmartAI Pro Jarvis. Be very brief." })
      });
      const response = await res.text();
      const cleanResponse = response.replace(/\[ACTION:.*?\]/g, "").trim() || "Executing, sir.";
      
      onMessage('assistant', cleanResponse);
      setAiResponse(cleanResponse);
      speak(cleanResponse);
    } catch (e) {
      const fallback = "I'm having trouble with the neural core. Standing by.";
      setAiResponse(fallback);
      speak(fallback);
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
    
    if (isHindi) {
       utterance.lang = 'hi-IN';
       const hindiVoice = synthRef.current.getVoices().find(v => v.lang.includes('hi'));
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
    <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[1000] flex flex-col items-center gap-6">
      <AnimatePresence>
        {state !== 'idle' && (
          <motion.div initial={{ opacity: 0, y: 30, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 30, scale: 0.9 }} className="mb-6 px-8 py-4 rounded-[2rem] bg-[#050508]/90 border border-purple-500/40 backdrop-blur-3xl flex flex-col items-center gap-3 min-w-[340px] shadow-[0_0_100px_rgba(168,85,247,0.4)] ring-1 ring-white/10">
            <div className="flex items-center gap-4">
              {state === 'listening' && (
                <div className="flex gap-1.5 items-center h-8">
                   {waveform.map((h, i) => (<motion.div key={i} className="w-1.5 bg-purple-500 rounded-full" animate={{ height: h }} transition={{ type: 'spring', stiffness: 400 }} />))}
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400 ml-3">Neural Ears Active</span>
                </div>
              )}
              {state === 'thinking' && (<><Loader2 className="w-6 h-6 text-purple-500 animate-spin" /><span className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400">Processing Stream</span></>)}
              {state === 'speaking' && (
                 <div className="flex gap-1.5 items-center h-8">
                   {waveform.map((h, i) => (<motion.div key={i} className="w-1.5 bg-cyan-400 rounded-full" animate={{ height: h * 1.6 }} />))}
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400 ml-3">Jarvis Transmitting</span>
                </div>
              )}
            </div>
            <p className="text-[11px] text-slate-300 font-bold italic text-center max-w-[300px] line-clamp-2 opacity-80 uppercase tracking-wider">
               {transcript || "Sir, I'm analyzing your request..."}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative group">
        <AnimatePresence>{state === 'listening' && (<motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1.2 }} exit={{ opacity: 0 }} className="absolute -inset-8 rounded-full bg-purple-500/10 blur-2xl animate-neural-pulse" />)}</AnimatePresence>
        
        {/* Orbital Ring */}
        <div className={`absolute -inset-6 border border-purple-500/20 rounded-full transition-all duration-1000 ${state !== 'idle' ? 'opacity-100 rotate-180 scale-110' : 'opacity-0'}`}>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-purple-500 rounded-full shadow-[0_0_20px_#a855f7]" />
        </div>

        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.85 }} onClick={toggleListening} className={`relative w-36 h-36 rounded-full flex items-center justify-center border-2 transition-all duration-700 shadow-2xl overflow-hidden ${state === 'idle' ? 'bg-black/80 border-purple-500/40 text-purple-500 hover:border-purple-500' : state === 'listening' ? 'bg-purple-600 border-white text-white' : 'bg-[#0d111c] border-cyan-500 text-cyan-400 shadow-[0_0_50px_rgba(34,211,238,0.3)]'}`}>
          <div className="relative z-10 flex flex-col items-center">
            {state === 'idle' && <Mic className="w-16 h-16 animate-pulse" />}
            {state === 'listening' && <Mic className="w-16 h-16" />}
            {state === 'thinking' && <Loader2 className="w-16 h-16 animate-spin" />}
            {state === 'speaking' && <Volume2 className="w-16 h-16" />}
            <span className="text-[8px] font-black uppercase tracking-widest mt-2 opacity-60">System Core</span>
          </div>
          {state !== 'idle' && <div className="absolute inset-0 bg-gradient-conic from-purple-500/20 via-transparent to-purple-500/20 animate-spin-slow opacity-30" />}
        </motion.button>
      </div>
    </div>
  );
};

export default SmartAIVoiceAssistant;
