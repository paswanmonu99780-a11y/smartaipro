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
        recognitionRef.current.continuous = true; // Use continuous for better transcription
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
            if (event.results[i].isFinal) {
              transcriptRef.current += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }
          setTranscript(transcriptRef.current || interimTranscript);
          
          // Reset silence timer whenever we get a result
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = setTimeout(() => {
            if (transcriptRef.current || interimTranscript) {
              recognitionRef.current?.stop();
            }
          }, 1500); // 1.5 seconds of silence and we process
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
    }
  };

  useEffect(() => {
    initRecognition();
    synthRef.current = window.speechSynthesis;
    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };
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
    
    // Command Logic
    if (lowerText.includes("settings") || lowerText.includes("setting kholo")) {
       executeAction("settings", "Opening settings panel.");
       return;
    }
    
    if (lowerText.includes("image") || lowerText.includes("generator") || lowerText.includes("tab")) {
       executeAction("image", "Switching to Image Generator.");
       return;
    }

    // AI Call
    try {
      const res = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: rawText, system: "You are Jarvis. Be brief." })
      });
      const response = await res.text();
      const cleanResponse = response.replace(/\[ACTION:.*?\]/g, "").trim() || "Yes, sir.";
      onMessage('assistant', cleanResponse);
      setAiResponse(cleanResponse);
      speak(cleanResponse);
    } catch (e) {
      const errorMsg = "Core connection error. Please retry.";
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
    utterance.lang = isHindi ? 'hi-IN' : 'en-US';
    utterance.onstart = () => setState('speaking');
    utterance.onend = () => setState('idle');
    utterance.onerror = () => setState('idle');
    synthRef.current.speak(utterance);
  };

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[999] flex flex-col items-center gap-6">
      <AnimatePresence>
        {state !== 'idle' && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }} className="bg-black/90 border border-purple-500/50 backdrop-blur-2xl rounded-3xl p-5 shadow-[0_0_60px_rgba(168,85,247,0.4)] flex flex-col items-center gap-3 min-w-[300px]">
            <div className="flex items-center gap-4">
              {state === 'listening' && (
                <div className="flex gap-1.5 items-center h-6">
                   {waveform.map((h, i) => (<motion.div key={i} className="w-1.5 bg-purple-500 rounded-full" animate={{ height: h }} />))}
                   <span className="text-sm font-bold text-purple-400 animate-pulse ml-2">JARVIS LISTENING...</span>
                </div>
              )}
              {state === 'thinking' && (<><Loader2 className="w-6 h-6 text-purple-500 animate-spin" /><span className="text-sm font-bold text-purple-400">ANALYZING...</span></>)}
              {state === 'speaking' && (
                 <div className="flex gap-1.5 items-center h-6">
                   {waveform.map((h, i) => (<motion.div key={i} className="w-1.5 bg-indigo-500 rounded-full" animate={{ height: h * 1.5 }} />))}
                   <span className="text-sm font-bold text-indigo-400 ml-2">REPLYING...</span>
                </div>
              )}
            </div>
            <p className="text-xs text-slate-300 italic text-center max-w-[280px]">{transcript || "Processing..."}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={toggleListening} className={`relative w-28 h-28 rounded-full flex items-center justify-center border-2 transition-all duration-700 shadow-2xl ${state === 'idle' ? 'bg-[#0a0a0f] border-purple-500/50 text-purple-500' : state === 'listening' ? 'bg-purple-600 border-white text-white' : 'bg-[#0d111c] border-indigo-500 text-indigo-400'}`}>
        <div className="relative z-10">
          {state === 'idle' && <Mic className="w-12 h-12" />}
          {state === 'listening' && <Mic className="w-12 h-12" />}
          {state === 'thinking' && <Loader2 className="w-12 h-12 animate-spin" />}
          {state === 'speaking' && <Volume2 className="w-12 h-12" />}
        </div>
        {state === 'listening' && <div className="absolute inset-0 rounded-full bg-purple-400/20 animate-pulse" />}
      </motion.button>
    </div>
  );
};

export default SmartAIVoiceAssistant;
