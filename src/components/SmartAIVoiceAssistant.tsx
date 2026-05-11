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
  const [waveform, setWaveform] = useState<number[]>(new Array(10).fill(5));

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'hi-IN';

        recognitionRef.current.onstart = () => {
          setState('listening');
          setTranscript('');
          transcriptRef.current = '';
        };

        recognitionRef.current.onresult = (event: any) => {
          const text = event.results[event.resultIndex][0].transcript;
          setTranscript(text);
          transcriptRef.current = text;
        };

        recognitionRef.current.onend = () => {
          setTimeout(() => {
            processVoiceCommand();
          }, 300);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech Error:", event.error);
          setState('idle');
        };
      }
      synthRef.current = window.speechSynthesis;
    }
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
    const rawText = transcriptRef.current.trim();
    if (!rawText) {
      setState('idle');
      return;
    }

    const lowerText = rawText.toLowerCase();
    onMessage('user', rawText); // Sync user transcript to main chat
    
    // 1. Direct Command Check (Navigation)
    if (lowerText.includes("settings") || lowerText.includes("setting kholo") || lowerText.includes("setting dikhao")) {
       executeAction("settings", "Opening settings panel for you, sir.");
       return;
    }
    
    if (lowerText.includes("image") || lowerText.includes("photo") || lowerText.includes("generator") || lowerText.includes("tab par jao")) {
       executeAction("image", "Switching to Image Generator.");
       return;
    }

    if (lowerText.includes("expert mode") || lowerText.includes("neural link")) {
       executeAction("expert", "Activating Expert Mode.");
       return;
    }

    if (lowerText.includes("banao") || lowerText.includes("generate") || lowerText.includes("create")) {
       if (lowerText.includes("image") || lowerText.includes("photo")) {
          const subject = rawText.replace(/generate|banao|create|image|photo|an|a/gi, "").trim();
          executeAction("generate_image", `Generating image for ${subject || 'you'}.`, subject);
          return;
       }
    }

    // 2. Chat Brain (Always use NVIDIA via Server)
    setState('thinking');
    try {
      const system = "You are SmartAI Pro Jarvis. Use NVIDIA NIM brain. Be brief. Use tags like [ACTION:settings] if needed.";
      const res = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: rawText, system })
      });
      
      const response = await res.text();
      
      if (response.includes("[ACTION:settings]")) onCommand("settings");
      if (response.includes("[ACTION:image]")) onCommand("image");
      
      const cleanResponse = response.replace(/\[ACTION:.*?\]/g, "").trim() || "Action completed, sir.";
      onMessage('assistant', cleanResponse); // Sync AI response to main chat
      setAiResponse(cleanResponse);
      speak(cleanResponse);
    } catch (e) {
      const fallback = "Connecting to backup neural core...";
      setAiResponse(fallback);
      speak(fallback);
      setState('idle');
    }
  };

  const executeAction = (action: string, response: string, data?: any) => {
    onCommand(action, data);
    onMessage('assistant', response); // Sync action confirmation to main chat
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
                   <span className="text-sm font-bold text-purple-400 animate-pulse ml-2">LISTENING...</span>
                </div>
              )}
              {state === 'thinking' && (<><Loader2 className="w-6 h-6 text-purple-500 animate-spin" /><span className="text-sm font-bold text-purple-400">NVIDIA BRAIN...</span></>)}
              {state === 'speaking' && (
                 <div className="flex gap-1.5 items-center h-6">
                   {waveform.map((h, i) => (<motion.div key={i} className="w-1.5 bg-indigo-500 rounded-full" animate={{ height: h * 1.5 }} />))}
                   <span className="text-sm font-bold text-indigo-400 ml-2">JARVIS SPEAKING</span>
                </div>
              )}
            </div>
            <p className="text-xs text-slate-300 italic text-center max-w-[280px]">{transcript || (state === 'speaking' ? aiResponse : "Sir, NVIDIA core is ready...")}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative group">
        <AnimatePresence>{state === 'listening' && (<div className="absolute -inset-4 rounded-full bg-purple-600/30 animate-pulse-ring" />)}</AnimatePresence>
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={toggleListening} className={`relative w-28 h-28 rounded-full flex items-center justify-center border-2 transition-all duration-700 shadow-2xl ${state === 'idle' ? 'bg-[#0a0a0f] border-purple-500/50 text-purple-500' : state === 'listening' ? 'bg-purple-600 border-white text-white scale-110 shadow-[0_0_50px_rgba(168,85,247,0.8)]' : 'bg-[#0d111c] border-indigo-500 text-indigo-400'}`}>
          <div className="relative z-10">
            {state === 'idle' && <Mic className="w-12 h-12" />}
            {state === 'listening' && <Mic className="w-12 h-12" />}
            {state === 'thinking' && <Loader2 className="w-12 h-12 animate-spin" />}
            {state === 'speaking' && <Volume2 className="w-12 h-12" />}
          </div>
          {state !== 'idle' && <div className="absolute inset-0 bg-gradient-to-t from-purple-500/20 to-transparent animate-pulse" />}
        </motion.button>
      </div>
    </div>
  );
};

export default SmartAIVoiceAssistant;
