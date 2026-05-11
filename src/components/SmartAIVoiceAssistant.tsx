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
  const [aiResponse, setAiResponse] = useState('');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const [waveform, setWaveform] = useState<number[]>(new Array(10).fill(5));

  useEffect(() => {
    if (typeof window !== 'undefined') {
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

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        processAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setState('listening');
    } catch (err) {
      console.error("Mic Access Error:", err);
      onMessage('assistant', "I can't access your microphone, sir. Please check permissions.");
    }
  };

  const toggleListening = () => {
    if (synthRef.current?.speaking) synthRef.current.cancel();

    if (state === 'idle' || state === 'speaking') {
      startRecording();
    } else if (state === 'listening') {
      mediaRecorderRef.current?.stop();
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    setState('thinking');
    
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob);

      // 1. Transcribe using Groq Whisper
      const transRes = await fetch('/api/voice/transcribe', {
        method: 'POST',
        body: formData
      });
      const transData = await transRes.json();
      const text = transData.text?.trim();

      if (!text) {
        setState('idle');
        return;
      }

      onMessage('user', text);
      const lowerText = text.toLowerCase();

      // 2. Local Command Handling
      if (/setting|kholo|open/i.test(lowerText) && /setting/i.test(lowerText)) {
        executeAction("settings", "Opening settings panel for you, sir.");
        return;
      }
      if (/image|generator|tab/i.test(lowerText)) {
        executeAction("image", "Switching to the Image Generator.");
        return;
      }

      // 3. Brain Response via NVIDIA NIM
      const res = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text, system: "You are Jarvis. Be very brief." })
      });
      const response = await res.text();
      const cleanResponse = response.replace(/\[ACTION:.*?\]/g, "").trim() || "Confirmed, sir.";
      
      onMessage('assistant', cleanResponse);
      setAiResponse(cleanResponse);
      speak(cleanResponse);
    } catch (e) {
      console.error("Voice Process Error:", e);
      const fallback = "Connecting to backup neural relay...";
      onMessage('assistant', fallback);
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
          <motion.div initial={{ opacity: 0, y: 30, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 30, scale: 0.9 }} className="mb-6 px-8 py-4 rounded-[2.5rem] bg-[#050508]/95 border border-purple-500/50 backdrop-blur-3xl flex flex-col items-center gap-3 min-w-[340px] shadow-[0_0_120px_rgba(168,85,247,0.6)] ring-1 ring-white/10">
            <div className="flex items-center gap-4">
              {state === 'listening' && (
                <div className="flex gap-2 items-center h-8">
                   {waveform.map((h, i) => (<motion.div key={i} className="w-1.5 bg-purple-500 rounded-full" animate={{ height: h }} transition={{ type: 'spring', stiffness: 500 }} />))}
                   <span className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-400 ml-3">Neural Recording</span>
                </div>
              )}
              {state === 'thinking' && (<><Loader2 className="w-6 h-6 text-purple-500 animate-spin" /><span className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-400">Whisper Processing</span></>)}
              {state === 'speaking' && (
                 <div className="flex gap-2 items-center h-8">
                   {waveform.map((h, i) => (<motion.div key={i} className="w-1.5 bg-cyan-400 rounded-full" animate={{ height: h * 1.6 }} transition={{ type: 'spring', stiffness: 500 }} />))}
                   <span className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400 ml-3">Jarvis Transmitting</span>
                </div>
              )}
            </div>
            <p className="text-[11px] text-slate-300 font-bold italic text-center max-w-[300px] line-clamp-2 opacity-90 uppercase tracking-widest leading-relaxed">
               {state === 'listening' ? "Tap again to finish speaking..." : state === 'thinking' ? "Analyzing audio stream..." : "System stabilized."}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative group">
        <AnimatePresence>{state === 'listening' && (<motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1.3 }} exit={{ opacity: 0 }} className="absolute -inset-10 rounded-full bg-purple-500/20 blur-3xl" />)}</AnimatePresence>
        
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.85 }} onClick={toggleListening} className={`relative w-44 h-44 rounded-full flex items-center justify-center border-2 transition-all duration-700 shadow-2xl ${state === 'idle' ? 'bg-black/90 border-purple-500/50 text-purple-500' : state === 'listening' ? 'bg-red-600 border-white text-white' : 'bg-[#0a0c14] border-cyan-500 text-cyan-400'}`}>
          <div className="relative z-10 flex flex-col items-center">
            {state === 'idle' && <Mic className="w-24 h-24 animate-pulse" />}
            {state === 'listening' && <MicOff className="w-24 h-24" />}
            {state === 'thinking' && <Loader2 className="w-24 h-24 animate-spin" />}
            {state === 'speaking' && <Volume2 className="w-24 h-24" />}
            <span className="text-[10px] font-black uppercase tracking-[0.2em] mt-3 opacity-80">Neural Core</span>
          </div>
          {state !== 'idle' && <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-500/20 via-transparent to-transparent animate-pulse" />}
        </motion.button>
      </div>
    </div>
  );
};

export default SmartAIVoiceAssistant;
