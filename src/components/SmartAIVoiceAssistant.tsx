import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Loader2 } from 'lucide-react';
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
  const [waveform, setWaveform] = useState<number[]>(new Array(10).fill(5));

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
          setTranscript('Suniye, Jarvis ready hai...');
          transcriptRef.current = '';
          isProcessingRef.current = false;
        };

        recognition.onresult = (event: any) => {
          let finalText = '';
          let interimText = '';
          
          for (let i = 0; i < event.results.length; i++) {
            const result = event.results[i];
            if (result.isFinal) {
              finalText += result[0].transcript;
            } else {
              interimText += result[0].transcript;
            }
          }
          
          transcriptRef.current = finalText || interimText;
          setTranscript(transcriptRef.current || 'Suniye...');
          
          // Reset silence timer on every result
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = setTimeout(() => {
            if (transcriptRef.current.trim() && !isProcessingRef.current) {
              isProcessingRef.current = true;
              recognition.stop();
            }
          }, 1500); // 1.5s silence = auto process
        };

        recognition.onend = () => {
          if (transcriptRef.current.trim() && isProcessingRef.current) {
            processVoiceCommand(transcriptRef.current.trim());
          } else {
            setState('idle');
          }
        };

        recognition.onerror = (event: any) => {
          console.error("Speech Error:", event.error);
          if (event.error === 'not-allowed') {
            alert('Mic access denied! Browser settings mein mic allow karein.');
          }
          setState('idle');
        };

        recognitionRef.current = recognition;
      }
      synthRef.current = window.speechSynthesis;
    }

    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };
  }, []);

  useEffect(() => {
    let animationId: number;
    if (state === 'speaking' || state === 'listening') {
      const updateWaveform = () => {
        setWaveform(Array.from({ length: 10 }, () => Math.random() * (state === 'speaking' ? 35 : 20) + 5));
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
        setTimeout(() => recognitionRef.current?.start(), 150);
      }
    } else if (state === 'listening') {
      if (transcriptRef.current.trim()) {
        isProcessingRef.current = true;
      }
      recognitionRef.current?.stop();
    }
  };

  const processVoiceCommand = async (rawText: string) => {
    if (!rawText) { setState('idle'); return; }

    setState('thinking');
    setTranscript(rawText);
    onMessage('user', rawText);
    
    const lowerText = rawText.toLowerCase();
    
    // Navigation Commands (Instant - No AI needed)
    if (/setting|seting|kholo|open/i.test(lowerText) && /setting|seting/i.test(lowerText)) {
      executeAction("settings", "Settings panel open kar raha hun, sir.");
      return;
    }
    if (/image|photo|generator|tab/i.test(lowerText)) {
      executeAction("image", "Image Generator par switch kar raha hun.");
      return;
    }
    if (/expert|mode/i.test(lowerText) && /expert|mode/i.test(lowerText)) {
      executeAction("expert", "Expert Mode activate ho raha hai.");
      return;
    }

    // AI Brain (Ollama → Groq → NVIDIA → Gemini)
    try {
      const res = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: rawText, 
          system: "You are Jarvis, a smart AI assistant. Answer in the same language the user speaks. Be very brief (1-2 sentences max)." 
        })
      });
      
      if (!res.ok) throw new Error('API failed');
      
      const response = await res.text();
      const cleanResponse = response.replace(/\[ACTION:.*?\]/g, "").trim() || "Ji sir, kaam ho gaya.";
      
      onMessage('assistant', cleanResponse);
      setAiResponse(cleanResponse);
      speak(cleanResponse);
    } catch (e) {
      console.error("AI Error:", e);
      const errorMsg = "Ollama se connection nahi ho pa raha. Please run: ollama serve";
      onMessage('assistant', errorMsg);
      speak(errorMsg);
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
    
    utterance.rate = 1.1;
    utterance.onstart = () => setState('speaking');
    utterance.onend = () => setState('idle');
    utterance.onerror = () => setState('idle');
    synthRef.current.speak(utterance);
  };

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[1000] flex flex-col items-center gap-4">
      <AnimatePresence>
        {state !== 'idle' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="bg-black/95 border border-purple-500/50 backdrop-blur-3xl rounded-2xl px-6 py-3 shadow-[0_0_80px_rgba(168,85,247,0.4)] flex flex-col items-center gap-2 min-w-[300px]">
            <div className="flex items-center gap-3">
              {state === 'listening' && (
                <div className="flex gap-1 items-center h-6">
                   {waveform.map((h, i) => (<motion.div key={i} className="w-1 bg-purple-500 rounded-full" animate={{ height: h }} transition={{ type: 'spring', stiffness: 500 }} />))}
                   <span className="text-[9px] font-black uppercase tracking-[0.3em] text-purple-400 ml-3">Listening</span>
                </div>
              )}
              {state === 'thinking' && (<><Loader2 className="w-5 h-5 text-purple-500 animate-spin" /><span className="text-[9px] font-black uppercase tracking-[0.3em] text-purple-400">Ollama Processing</span></>)}
              {state === 'speaking' && (
                 <div className="flex gap-1 items-center h-6">
                   {waveform.map((h, i) => (<motion.div key={i} className="w-1 bg-cyan-400 rounded-full" animate={{ height: h * 1.5 }} transition={{ type: 'spring', stiffness: 500 }} />))}
                   <span className="text-[9px] font-black uppercase tracking-[0.3em] text-cyan-400 ml-3">Speaking</span>
                </div>
              )}
            </div>
            <p className="text-[10px] text-slate-300 font-medium italic text-center max-w-[280px] line-clamp-2">
               {transcript}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.85 }} onClick={toggleListening} className={`relative w-16 h-16 rounded-full flex items-center justify-center border-2 transition-all duration-500 shadow-xl ${state === 'idle' ? 'bg-[#0a0a0f] border-purple-500/50 text-purple-500 hover:border-purple-400' : state === 'listening' ? 'bg-red-600 border-white text-white shadow-[0_0_30px_rgba(239,68,68,0.5)]' : state === 'thinking' ? 'bg-[#0d111c] border-purple-500 text-purple-400' : 'bg-[#0d111c] border-cyan-500 text-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.3)]'}`}>
        {state === 'idle' && <Mic className="w-7 h-7" />}
        {state === 'listening' && <MicOff className="w-7 h-7" />}
        {state === 'thinking' && <Loader2 className="w-7 h-7 animate-spin" />}
        {state === 'speaking' && <Volume2 className="w-7 h-7" />}
        {state === 'listening' && <div className="absolute inset-0 rounded-full bg-red-400/20 animate-ping" />}
      </motion.button>
    </div>
  );
};

export default SmartAIVoiceAssistant;
