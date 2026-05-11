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
  const retryCountRef = useRef(0);
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
          retryCountRef.current = 0;
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
          
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = setTimeout(() => {
            if (transcriptRef.current || interimText) {
               recognitionRef.current?.stop();
            }
          }, 1000);
        };

        recognitionRef.current.onend = () => {
          if (state === 'listening' || transcriptRef.current) {
            processVoiceCommand();
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error("Mic Error:", event.error);
          
          if (event.error === 'network' && retryCountRef.current < 3) {
            retryCountRef.current++;
            console.log(`Retrying neural link... Attempt ${retryCountRef.current}`);
            setTimeout(() => {
              try { recognitionRef.current?.start(); } catch(e) {}
            }, 500);
            return;
          }

          if (event.error === 'network') {
            onMessage('assistant', "Neural link unstable. Switching to localized processing, sir.");
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
    if (synthRef.current?.speaking) synthRef.current.cancel();

    if (state === 'idle' || state === 'speaking') {
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
    
    // Command Processing
    if (/setting|sating|kholo|open/i.test(lowerText) && /setting|sating/i.test(lowerText)) {
       executeAction("settings", "Opening settings panel for you, sir.");
       return;
    }
    
    if (/image|photo|generator|tab/i.test(lowerText)) {
       executeAction("image", "Switching to the Image Generator.");
       return;
    }

    try {
      const res = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: rawText, system: "You are Jarvis. Be brief." })
      });
      const response = await res.text();
      const cleanResponse = response.replace(/\[ACTION:.*?\]/g, "").trim() || "Confirmed, sir.";
      
      onMessage('assistant', cleanResponse);
      setAiResponse(cleanResponse);
      speak(cleanResponse);
    } catch (e) {
      const fallback = "Connecting to backup neural relay...";
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
    <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[1000] flex flex-col items-center gap-6">
      <AnimatePresence>
        {state !== 'idle' && (
          <motion.div initial={{ opacity: 0, y: 30, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 30, scale: 0.9 }} className="mb-6 px-8 py-4 rounded-[2rem] bg-[#050508]/95 border border-purple-500/50 backdrop-blur-3xl flex flex-col items-center gap-3 min-w-[340px] shadow-[0_0_100px_rgba(168,85,247,0.5)]">
            <div className="flex items-center gap-4">
              {state === 'listening' && (
                <div className="flex gap-1.5 items-center h-8">
                   {waveform.map((h, i) => (<motion.div key={i} className="w-1.5 bg-purple-500 rounded-full" animate={{ height: h }} />))}
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400 ml-3">Neural Ears Engaged</span>
                </div>
              )}
              {state === 'thinking' && (<><Loader2 className="w-6 h-6 text-purple-500 animate-spin" /><span className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400">Processing Data</span></>)}
              {state === 'speaking' && (
                 <div className="flex gap-1.5 items-center h-8">
                   {waveform.map((h, i) => (<motion.div key={i} className="w-1.5 bg-cyan-400 rounded-full" animate={{ height: h * 1.6 }} />))}
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400 ml-3">Jarvis Transmitting</span>
                </div>
              )}
            </div>
            <p className="text-[11px] text-slate-300 font-bold italic text-center max-w-[300px] line-clamp-2 opacity-90 uppercase tracking-wider">
               {transcript || "Establishing secure connection..."}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative group">
        <AnimatePresence>{state === 'listening' && (<motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1.2 }} exit={{ opacity: 0 }} className="absolute -inset-8 rounded-full bg-purple-500/20 blur-2xl animate-pulse" />)}</AnimatePresence>
        
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.85 }} onClick={toggleListening} className={`relative w-40 h-40 rounded-full flex items-center justify-center border-2 transition-all duration-700 shadow-[0_0_60px_rgba(168,85,247,0.2)] overflow-hidden ${state === 'idle' ? 'bg-black/90 border-purple-500/40 text-purple-500' : state === 'listening' ? 'bg-purple-600 border-white text-white' : 'bg-[#0a0c14] border-cyan-500 text-cyan-400 shadow-[0_0_50px_rgba(34,211,238,0.4)]'}`}>
          <div className="relative z-10 flex flex-col items-center">
            {state === 'idle' && <Mic className="w-20 h-20 animate-pulse" />}
            {state === 'listening' && <Mic className="w-20 h-20" />}
            {state === 'thinking' && <Loader2 className="w-20 h-20 animate-spin" />}
            {state === 'speaking' && <Volume2 className="w-20 h-20" />}
            <span className="text-[9px] font-black uppercase tracking-widest mt-2 opacity-70">Neural Link</span>
          </div>
          {state !== 'idle' && <div className="absolute inset-0 bg-gradient-conic from-purple-500/30 via-transparent to-purple-500/30 animate-spin-slow opacity-40" />}
        </motion.button>
      </div>
    </div>
  );
};

export default SmartAIVoiceAssistant;
