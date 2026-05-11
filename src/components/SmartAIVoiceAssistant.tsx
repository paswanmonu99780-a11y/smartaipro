import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Loader2, Sparkles, Zap, Shield, Settings, ImageIcon, Layout } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SmartAIVoiceAssistantProps {
  onCommand: (action: string, data?: any) => void;
}

type AssistantState = 'idle' | 'listening' | 'thinking' | 'speaking';

const SmartAIVoiceAssistant: React.FC<SmartAIVoiceAssistantProps> = ({ onCommand }) => {
  const [state, setState] = useState<AssistantState>('idle');
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [language, setLanguage] = useState('hi-IN'); 

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [waveform, setWaveform] = useState<number[]>(new Array(10).fill(5));

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true; // Use continuous to manually handle silence
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = language;

        recognitionRef.current.onstart = () => {
          setState('listening');
          setTranscript('');
        };

        recognitionRef.current.onresult = (event: any) => {
          // Clear previous silence timer
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

          let interimTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              setTranscript(prev => prev + event.results[i][0].transcript);
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }
          
          // If we have interim results, update transcript for feedback
          if (interimTranscript) {
            setTranscript(interimTranscript);
          }

          // Start a 2-second silence timer to auto-process
          silenceTimerRef.current = setTimeout(() => {
            console.log("Silence detected, stopping recognition...");
            recognitionRef.current?.stop();
          }, 2000);
        };

        recognitionRef.current.onend = () => {
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          if (state === 'listening') {
             processVoiceCommand();
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech Recognition Error:", event.error);
          setState('idle');
        };
      }
      synthRef.current = window.speechSynthesis;
    }
    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };
  }, [language, state]);

  // Handle waveform animation
  useEffect(() => {
    let animationId: number;
    if (state === 'speaking' || state === 'listening') {
      const updateWaveform = () => {
        const newData = Array.from({ length: 10 }, () => Math.random() * (state === 'speaking' ? 40 : 20) + 5);
        setWaveform(newData);
        animationId = requestAnimationFrame(updateWaveform);
      };
      updateWaveform();
    } else {
      setWaveform(new Array(10).fill(5));
    }
    return () => cancelAnimationFrame(animationId);
  }, [state]);

  const toggleListening = () => {
    if (state === 'idle') {
      recognitionRef.current?.start();
    } else {
      recognitionRef.current?.stop();
      if (state === 'speaking') {
        synthRef.current?.cancel();
        setState('idle');
      }
    }
  };

  const processVoiceCommand = async () => {
    const rawText = transcript.trim();
    if (!rawText) {
      setState('idle');
      return;
    }

    setState('thinking');
    const lowerTranscript = rawText.toLowerCase();
    console.log("Processing Voice Command:", lowerTranscript);
    
    // 1. Navigation Commands
    if (lowerTranscript.includes("settings") || lowerTranscript.includes("setting kholo") || lowerTranscript.includes("setting dikhao")) {
      executeAction("settings", "Opening settings for you, sir.");
      return;
    }

    if (lowerTranscript.includes("image") || lowerTranscript.includes("photo banao") || lowerTranscript.includes("image generator") || lowerTranscript.includes("tab par jao")) {
      executeAction("image", "Switching to Image Generator tab.");
      return;
    }

    if (lowerTranscript.includes("expert mode") || lowerTranscript.includes("expert mode activate")) {
      executeAction("expert", "Activating Expert Mode. Neural links established.");
      return;
    }

    if (lowerTranscript.includes("admin") || lowerTranscript.includes("admin panel")) {
      executeAction("admin", "Accessing Admin Panel.");
      return;
    }

    // 2. Active Generation Commands
    if (lowerTranscript.includes("generate") || lowerTranscript.includes("banao") || lowerTranscript.includes("create")) {
      if (lowerTranscript.includes("image") || lowerTranscript.includes("photo") || lowerTranscript.includes("picture")) {
        const subject = rawText.replace(/generate|banao|create|image|photo|picture|an|a/gi, "").trim();
        executeAction("generate_image", `Generating an image of ${subject || 'what you requested'}.`, subject);
        return;
      }
    }

    // 3. Prompt Optimization
    if (lowerTranscript.includes("optimize") || lowerTranscript.includes("prompt likho") || lowerTranscript.includes("describe")) {
      const optimizedPrompt = await fetchGroqResponse(`Write a highly detailed, professional AI image generation prompt for: ${rawText}. Return ONLY the prompt, no extra text.`);
      executeAction("set_prompt", "I've written an optimized prompt for you. You can see it in the input field.", optimizedPrompt);
      return;
    }

    // 4. Default: AI Brain
    try {
      const systemPrompt = `You are SmartAI Pro, a futuristic Jarvis-like assistant. 
      Website tags: [ACTION:settings], [ACTION:image], [ACTION:expert], [ACTION:admin], [ACTION:home].
      Respond in the user's language. Keep it short.`;

      const response = await fetchGroqResponse(rawText, systemPrompt);
      
      if (response.includes("[ACTION:settings]")) onCommand("settings");
      if (response.includes("[ACTION:image]")) onCommand("image");
      if (response.includes("[ACTION:expert]")) onCommand("expert");
      if (response.includes("[ACTION:admin]")) onCommand("admin");
      if (response.includes("[ACTION:home]")) onCommand("home");
      
      const cleanResponse = response.replace(/\[ACTION:.*?\]/g, "").trim();
      setAiResponse(cleanResponse);
      speak(cleanResponse);
    } catch (error) {
      const errorMsg = "I'm having trouble connecting to my brain right now.";
      setAiResponse(errorMsg);
      speak(errorMsg);
    }
  };

  const executeAction = (action: string, response: string, data?: any) => {
    onCommand(action, data);
    setAiResponse(response);
    speak(response);
  };

  const fetchGroqResponse = async (text: string, system?: string) => {
    try {
      const res = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text, system })
      });
      if (res.ok && res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let fullText = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          fullText += decoder.decode(value);
        }
        return fullText.trim();
      }
      return "I processed your request, but the connection was interrupted.";
    } catch (e) {
      return "Internal neural error.";
    }
  };

  const speak = (text: string) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const isHindi = /[\u0900-\u097F]/.test(text);
    utterance.lang = isHindi ? 'hi-IN' : 'en-US';
    const voices = synthRef.current.getVoices();
    const preferredVoice = voices.find(v => v.lang.includes(isHindi ? 'hi' : 'en') && v.name.includes('Google'));
    if (preferredVoice) utterance.voice = preferredVoice;
    utterance.onstart = () => setState('speaking');
    utterance.onend = () => setState('idle');
    utterance.onerror = () => setState('idle');
    synthRef.current.speak(utterance);
  };

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-4">
      <AnimatePresence>
        {state !== 'idle' && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            className="mb-4 px-6 py-3 rounded-2xl bg-black/60 backdrop-blur-xl border border-purple-500/30 flex flex-col items-center gap-2 min-w-[200px] shadow-[0_0_30px_rgba(168,85,247,0.2)]"
          >
            <div className="flex items-center gap-3">
              {state === 'listening' && (
                <div className="flex gap-1">
                  {waveform.map((h, i) => (
                    <motion.div key={i} className="w-1 bg-purple-500 rounded-full" animate={{ height: h }} transition={{ type: 'spring', stiffness: 300, damping: 20 }} />
                  ))}
                  <span className="ml-2 text-xs font-black uppercase tracking-widest text-purple-400 animate-pulse">Listening...</span>
                </div>
              )}
              {state === 'thinking' && (
                <>
                  <Loader2 className="w-4 h-4 text-purple-500 animate-spin" />
                  <span className="text-xs font-black uppercase tracking-widest text-purple-400">Thinking...</span>
                </>
              )}
              {state === 'speaking' && (
                <div className="flex gap-1 items-center h-4">
                  {waveform.map((h, i) => (
                    <motion.div key={i} className="w-1 bg-indigo-400 rounded-full" animate={{ height: h * 1.5 }} transition={{ type: 'spring', stiffness: 300, damping: 15 }} />
                  ))}
                  <span className="ml-2 text-xs font-black uppercase tracking-widest text-indigo-400">Speaking...</span>
                </div>
              )}
            </div>
            <p className="text-[10px] text-slate-300 font-medium text-center max-w-[250px] line-clamp-2 italic">{transcript || "..."}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative group">
        <AnimatePresence>
          {state === 'listening' && (
            <div className="absolute inset-0 rounded-full bg-purple-500/20 animate-pulse-ring" />
          )}
        </AnimatePresence>

        <div className={`absolute -inset-4 border border-purple-500/20 rounded-full transition-opacity duration-500 ${state !== 'idle' ? 'opacity-100' : 'opacity-0'}`}>
          <div className="absolute inset-0 animate-neural-spin">
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-purple-500 rounded-full shadow-[0_0_10px_#a855f7]" />
             <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-purple-500 rounded-full shadow-[0_0_10px_#a855f7]" />
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleListening}
          className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 border shadow-2xl overflow-hidden
            ${state === 'idle' ? 'bg-[#0a0a0f]/80 border-purple-500/30 text-purple-500 neural-glow' : 
              state === 'listening' ? 'bg-purple-600 border-purple-400 text-white shadow-[0_0_40px_rgba(168,85,247,0.6)]' :
              state === 'thinking' ? 'bg-[#0a0a0f]/90 border-purple-500 text-purple-400' :
              'bg-[#0d111c] border-indigo-500 text-indigo-400'}
          `}
        >
          <div className="relative z-10">
            {state === 'idle' && <Mic className="w-8 h-8 animate-float" />}
            {state === 'listening' && <Mic className="w-8 h-8" />}
            {state === 'thinking' && <Loader2 className="w-8 h-8 animate-spin" />}
            {state === 'speaking' && <Volume2 className="w-8 h-8" />}
          </div>
          {state !== 'idle' && <div className="absolute inset-0 hologram-effect opacity-30" />}
        </motion.button>
      </div>
      <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded-full border border-white/5 backdrop-blur-md">
        <div className={`w-1.5 h-1.5 rounded-full ${state === 'idle' ? 'bg-purple-500' : 'bg-emerald-500 animate-pulse'}`} />
        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500">Neural Link Stable</span>
      </div>
    </div>
  );
};

export default SmartAIVoiceAssistant;
