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
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const [waveform, setWaveform] = useState<number[]>(new Array(15).fill(5));
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;
    }
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  const startVolumeMeter = (stream: MediaStream) => {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    const source = audioContextRef.current.createMediaStreamSource(stream);
    analyserRef.current = audioContextRef.current.createAnalyser();
    analyserRef.current.fftSize = 64;
    source.connect(analyserRef.current);

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    
    const update = () => {
      if (!analyserRef.current) return;
      analyserRef.current.getByteFrequencyData(dataArray);
      const values = Array.from(dataArray).slice(0, 15).map(v => (v / 255) * 40 + 5);
      setWaveform(values);
      animationFrameRef.current = requestAnimationFrame(update);
    };
    update();
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      startVolumeMeter(stream);
      
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
        ? 'audio/webm;codecs=opus' 
        : 'audio/webm';
        
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType });
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        processAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setState('listening');
    } catch (err) {
      console.error("Mic Access Error:", err);
      alert("Mic Access Denied! Please allow microphone access in your browser settings.");
      setState('idle');
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
    if (audioBlob.size < 1000) {
      setState('idle');
      return;
    }

    setState('thinking');
    setTranscript("Jarvis is analyzing your voice...");
    
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'voice.webm');

      // 1. Transcribe using Groq Whisper via server
      const transRes = await fetch('/api/voice/transcribe', {
        method: 'POST',
        body: formData
      });
      const transData = await transRes.json();
      const text = transData.text?.trim();

      if (!text) {
        setTranscript("I didn't catch that, sir.");
        setTimeout(() => setState('idle'), 2000);
        return;
      }

      setTranscript(text);
      onMessage('user', text);
      const lowerText = text.toLowerCase();

      // 2. Command Processing
      if (/setting|kholo|open/i.test(lowerText) && /setting/i.test(lowerText)) {
        executeAction("settings", "Opening settings for you, sir.");
        return;
      }
      if (/image|generator|tab/i.test(lowerText)) {
        executeAction("image", "Switching to the Image Generator.");
        return;
      }

      // 3. Brain Response
      const res = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text, system: "You are Jarvis. Be very brief." })
      });
      const response = await res.text();
      const cleanResponse = response.replace(/\[ACTION:.*?\]/g, "").trim() || "Executing as requested.";
      
      onMessage('assistant', cleanResponse);
      setAiResponse(cleanResponse);
      speak(cleanResponse);
    } catch (e) {
      console.error("Voice Error:", e);
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
    <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[1000] flex flex-col items-center gap-6">
      <AnimatePresence>
        {state !== 'idle' && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }} className="bg-black/95 border border-purple-500/50 backdrop-blur-3xl rounded-[3rem] p-6 shadow-[0_0_150px_rgba(168,85,247,0.5)] flex flex-col items-center gap-4 min-w-[360px]">
            <div className="flex items-center gap-5">
              {state === 'listening' && (
                <div className="flex gap-1.5 items-center h-10">
                   {waveform.map((h, i) => (<motion.div key={i} className="w-1.5 bg-purple-500 rounded-full" animate={{ height: h }} transition={{ type: 'spring', stiffness: 600 }} />))}
                   <span className="text-[10px] font-black uppercase tracking-[0.4em] text-purple-400 ml-5">Vocal Sync Active</span>
                </div>
              )}
              {state === 'thinking' && (<><Loader2 className="w-8 h-8 text-purple-500 animate-spin" /><span className="text-[10px] font-black uppercase tracking-[0.4em] text-purple-400">Whisper Core Active</span></>)}
              {state === 'speaking' && (
                 <div className="flex gap-2 items-center h-10">
                   {waveform.map((h, i) => (<motion.div key={i} className="w-2 bg-cyan-400 rounded-full" animate={{ height: h * 1.8 }} transition={{ type: 'spring', stiffness: 600 }} />))}
                   <span className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-400 ml-5">Transmission Live</span>
                </div>
              )}
            </div>
            <p className="text-[11px] text-slate-200 font-black italic text-center max-w-[300px] uppercase tracking-widest opacity-80 px-4">
               {transcript}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative group">
        <AnimatePresence>{state === 'listening' && (<motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1.4 }} exit={{ opacity: 0 }} className="absolute -inset-12 rounded-full bg-purple-500/20 blur-[50px] animate-pulse" />)}</AnimatePresence>
        
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.85 }} onClick={toggleListening} className={`relative w-24 h-24 rounded-full flex items-center justify-center border-2 transition-all duration-700 shadow-2xl ${state === 'idle' ? 'bg-[#0a0a0f] border-purple-500/50 text-purple-500' : state === 'listening' ? 'bg-red-600 border-white text-white' : 'bg-[#0d111c] border-indigo-500 text-indigo-400'}`}>
          <div className="relative z-10 flex flex-col items-center">
            {state === 'idle' && <Mic className="w-10 h-10 animate-pulse" />}
            {state === 'listening' && <MicOff className="w-10 h-10" />}
            {state === 'thinking' && <Loader2 className="w-10 h-10 animate-spin" />}
            {state === 'speaking' && <Volume2 className="w-10 h-10" />}
          </div>
          {state !== 'idle' && <div className="absolute inset-0 bg-gradient-to-t from-purple-500/20 to-transparent animate-pulse" />}
        </motion.button>
      </div>
    </div>
  );
};

export default SmartAIVoiceAssistant;
