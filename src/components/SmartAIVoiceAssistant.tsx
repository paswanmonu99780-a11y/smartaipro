import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Loader2, Sparkles, Zap } from 'lucide-react';
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
  const isProcessingRef = useRef(false);
  const [waveform, setWaveform] = useState<number[]>(new Array(15).fill(5));

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'hi-IN';

        recognition.onstart = () => {
          setState('listening');
          setTranscript('Neural link active. Listening, sir...');
          transcriptRef.current = '';
          isProcessingRef.current = false;
        };

        recognition.onresult = (event: any) => {
          let interimText = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcriptChunk = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              transcriptRef.current += transcriptChunk;
            } else {
              interimText += transcriptChunk;
            }
          }
          
          const currentText = (transcriptRef.current + interimText).trim();
          setTranscript(currentText || 'Suniye...');
          
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = setTimeout(() => {
            if (currentText.length > 2 && !isProcessingRef.current) {
              isProcessingRef.current = true;
              recognition.stop();
            }
          }, 1800); 
        };

        recognition.onend = () => {
          if (transcriptRef.current.trim() && isProcessingRef.current) {
            processVoiceCommand(transcriptRef.current.trim());
          } else if (!isProcessingRef.current) {
            setState('idle');
          }
        };

        recognitionRef.current = recognition;
      }
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  useEffect(() => {
    let animationId: number;
    if (state !== 'idle') {
      const updateWaveform = () => {
        const multiplier = state === 'speaking' ? 40 : state === 'listening' ? 20 : 10;
        setWaveform(Array.from({ length: 15 }, () => Math.random() * multiplier + 5));
        animationId = requestAnimationFrame(updateWaveform);
      };
      updateWaveform();
    } else {
      setWaveform(new Array(15).fill(5));
    }
    return () => cancelAnimationFrame(animationId);
  }, [state]);

  const toggleListening = () => {
    if (synthRef.current?.speaking) synthRef.current.cancel();

    if (state === 'idle' || state === 'speaking') {
      try {
        recognitionRef.current?.start();
      } catch (e) {
        recognitionRef.current?.stop();
        setTimeout(() => recognitionRef.current?.start(), 200);
      }
    } else {
      isProcessingRef.current = true;
      recognitionRef.current?.stop();
    }
  };

  const processVoiceCommand = async (rawText: string) => {
    setState('thinking');
    onMessage('user', rawText);
    
    const lowerText = rawText.toLowerCase();
    
    if (/setting|seting|kholo|open/i.test(lowerText) && /setting|seting/i.test(lowerText)) {
      executeAction("settings", "Accessing system settings, sir.");
      return;
    }
    if (/image|photo|generator|tab/i.test(lowerText)) {
      executeAction("image", "Initializing image synthesis core.");
      return;
    }

    try {
      const res = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: rawText, 
          system: "You are Jarvis. Respond in the same language. Be extremely brief (max 15 words)." 
        })
      });
      
      const response = await res.text();
      const cleanResponse = response.replace(/\[ACTION:.*?\]/g, "").trim();
      
      onMessage('assistant', cleanResponse);
      speak(cleanResponse);
    } catch (e) {
      const errorMsg = "Ollama connection lost. Please run 'ollama serve', sir.";
      onMessage('assistant', errorMsg);
      speak(errorMsg);
    }
  };

  const executeAction = (action: string, response: string) => {
    onCommand(action);
    onMessage('assistant', response);
    speak(response);
  };

  const speak = (text: string) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const isHindi = /[\u0900-\u097F]/.test(text);
    utterance.lang = isHindi ? 'hi-IN' : 'en-US';
    
    if (isHindi) {
       const hindiVoice = synthRef.current.getVoices().find(v => v.lang.includes('hi'));
       if (hindiVoice) utterance.voice = hindiVoice;
    }
    
    utterance.onstart = () => setState('speaking');
    utterance.onend = () => setState('idle');
    utterance.onerror = () => setState('idle');
    synthRef.current.speak(utterance);
  };

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[1000] flex flex-col items-center gap-6">
      <AnimatePresence>
        {state !== 'idle' && (
          <motion.div initial={{ opacity: 0, y: 40, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 40, scale: 0.9 }} className="bg-black/80 border border-white/10 backdrop-blur-2xl rounded-[2.5rem] px-8 py-5 shadow-[0_0_120px_rgba(139,92,246,0.3)] flex flex-col items-center gap-4 min-w-[380px] ring-1 ring-white/5">
            <div className="flex items-center gap-6">
              <div className="flex gap-1.5 items-center h-10">
                 {waveform.map((h, i) => (
                   <motion.div key={i} className={`w-1.5 rounded-full ${state === 'speaking' ? 'bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)]' : 'bg-purple-500'}`} animate={{ height: h }} transition={{ type: 'spring', stiffness: 400 }} />
                 ))}
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 mb-1">{state} mode</span>
                <div className="h-4 overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.span key={state} initial={{ y: 20 }} animate={{ y: 0 }} exit={{ y: -20 }} className="text-[11px] font-black uppercase tracking-[0.2em] text-purple-400 block">
                      {state === 'listening' ? "Neural Link Syncing" : state === 'thinking' ? "Processing Core" : "Jarvis Transmitting"}
                    </motion.span>
                  </AnimatePresence>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-slate-300 font-bold italic text-center max-w-[320px] line-clamp-2 opacity-80 uppercase tracking-widest leading-relaxed">
               {transcript}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative">
        <AnimatePresence>{state === 'listening' && (<motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1.2 }} exit={{ opacity: 0 }} className="absolute -inset-10 rounded-full bg-purple-600/20 blur-3xl animate-pulse" />)}</AnimatePresence>
        
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={toggleListening} className={`relative w-20 h-20 rounded-full flex items-center justify-center border-2 transition-all duration-700 shadow-2xl ${state === 'idle' ? 'bg-black/90 border-purple-500/50 text-purple-500' : state === 'listening' ? 'bg-red-600 border-white text-white' : 'bg-[#0a0c14] border-cyan-500 text-cyan-400 shadow-[0_0_50px_rgba(6,182,212,0.4)]'}`}>
          <div className="relative z-10">
            {state === 'idle' && <Mic className="w-8 h-8" />}
            {state === 'listening' && <MicOff className="w-8 h-8" />}
            {state === 'thinking' && <Loader2 className="w-8 h-8 animate-spin" />}
            {state === 'speaking' && <Volume2 className="w-8 h-8" />}
          </div>
          {state !== 'idle' && <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/30 to-transparent animate-spin-slow opacity-50" />}
        </motion.button>
        
        <div className="absolute -bottom-1 -right-1">
          <Zap className={`w-6 h-6 ${state === 'idle' ? 'text-white/10' : 'text-yellow-400 animate-pulse'}`} />
        </div>
      </div>
    </div>
  );
};

export default SmartAIVoiceAssistant;
