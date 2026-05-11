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
  const [language, setLanguage] = useState('hi-IN'); // Default to Hindi-India

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const [waveform, setWaveform] = useState<number[]>(new Array(10).fill(10));

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = language;

        recognitionRef.current.onstart = () => {
          setState('listening');
          setTranscript('');
        };

        recognitionRef.current.onresult = (event: any) => {
          const current = event.resultIndex;
          const transcriptText = event.results[current][0].transcript;
          setTranscript(transcriptText);
        };

        recognitionRef.current.onend = () => {
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
  }, [language, state]);

  // Handle waveform animation during speaking
  useEffect(() => {
    let animationId: number;
    if (state === 'speaking') {
      const updateWaveform = () => {
        const newData = Array.from({ length: 10 }, () => Math.random() * 40 + 5);
        setWaveform(newData);
        animationId = requestAnimationFrame(updateWaveform);
      };
      updateWaveform();
    } else if (state === 'listening') {
       const updateWaveform = () => {
        const newData = Array.from({ length: 10 }, () => Math.random() * 20 + 5);
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
    } else if (state === 'listening') {
      recognitionRef.current?.stop();
    } else if (state === 'speaking') {
      synthRef.current?.cancel();
      setState('idle');
    }
  };

  const processVoiceCommand = async () => {
    if (!transcript.trim()) {
      setState('idle');
      return;
    }

    setState('thinking');
    
    // Check for direct website control commands
    const lowerTranscript = transcript.toLowerCase();
    
    if (lowerTranscript.includes("settings") || lowerTranscript.includes("setting kholo")) {
      executeAction("settings", "Opening settings for you, sir.");
      return;
    }

    // Advanced Intent: Generate Image
    if (lowerTranscript.includes("generate") || lowerTranscript.includes("banao") || lowerTranscript.includes("create")) {
      if (lowerTranscript.includes("image") || lowerTranscript.includes("photo") || lowerTranscript.includes("picture")) {
        const subject = transcript.replace(/generate|banao|create|image|photo|picture|an|a/gi, "").trim();
        executeAction("generate_image", `Generating an image of ${subject || 'what you requested'}.`, subject);
        return;
      }
    }

    // Advanced Intent: Optimize Prompt
    if (lowerTranscript.includes("optimize") || lowerTranscript.includes("prompt likho") || lowerTranscript.includes("describe")) {
      setState('thinking');
      const optimizedPrompt = await fetchGroqResponse(`Write a highly detailed, professional AI image generation prompt for: ${transcript}. Return ONLY the prompt, no extra text.`);
      executeAction("set_prompt", "I've written an optimized prompt for you. You can see it in the input field.", optimizedPrompt);
      return;
    }

    if (lowerTranscript.includes("image") || lowerTranscript.includes("photo banao")) {
      executeAction("image", "Switching to Image Generator.");
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
    if (lowerTranscript.includes("workflow") || lowerTranscript.includes("kaam start karo")) {
      executeAction("workflow", "Opening Workflow Builder.");
      return;
    }
    if (lowerTranscript.includes("ai tools") || lowerTranscript.includes("tools dikhao")) {
      executeAction("tools", "Navigating to AI Tools section.");
      return;
    }

    // If not a direct hardcoded command, ask AI Brain
    try {
      const systemPrompt = `You are SmartAI Pro, a futuristic Jarvis-like assistant. 
      You can control the website using these tags:
      - [ACTION:settings] to open settings
      - [ACTION:image] to open image generator
      - [ACTION:expert] to activate expert mode
      - [ACTION:admin] to open admin panel
      - [ACTION:home] to go to home/chat
      
      If the user asks to do something, include the tag and a brief confirmation. 
      Respond in the user's language (Hindi/English). Keep it short and premium.`;

      const response = await fetchGroqResponse(transcript, systemPrompt);
      
      // Parse Actions from AI Response
      if (response.includes("[ACTION:settings]")) onCommand("settings");
      if (response.includes("[ACTION:image]")) onCommand("image");
      if (response.includes("[ACTION:expert]")) onCommand("expert");
      if (response.includes("[ACTION:admin]")) onCommand("admin");
      if (response.includes("[ACTION:home]")) onCommand("home");
      
      // Clean the response for speaking
      const cleanResponse = response.replace(/\[ACTION:.*?\]/g, "").trim();
      setAiResponse(cleanResponse);
      speak(cleanResponse);
    } catch (error) {
      console.error("AI Brain Error:", error);
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
        body: JSON.stringify({ 
          prompt: text,
          system: system || "You are SmartAI Pro, a futuristic AI. Respond concisely."
        })
      });
      
      // Since it's a stream in the existing app, we'll collect it or use the non-stream version if available
      // For the sake of "complete system", I'll assume a standard response here or handle the stream
      if (res.ok) {
        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let fullText = '';
        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            fullText += decoder.decode(value);
          }
          return fullText.trim();
        }
      }
      return "I processed your request, but the connection was interrupted.";
    } catch (e) {
      return "Internal neural error. Please try again.";
    }
  };

  const speak = (text: string) => {
    if (!synthRef.current) return;
    
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Auto detect language for TTS (simple check)
    const isHindi = /[\u0900-\u097F]/.test(text);
    utterance.lang = isHindi ? 'hi-IN' : 'en-US';
    
    // Try to find a good voice
    const voices = synthRef.current.getVoices();
    const preferredVoice = voices.find(v => v.lang.includes(isHindi ? 'hi' : 'en') && v.name.includes('Google'));
    if (preferredVoice) utterance.voice = preferredVoice;
    
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    
    utterance.onstart = () => setState('speaking');
    utterance.onend = () => setState('idle');
    utterance.onerror = () => setState('idle');
    
    synthRef.current.speak(utterance);
  };

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-4">
      {/* Interaction Feedback Overlay */}
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
                <>
                  <div className="flex gap-1">
                    {waveform.map((h, i) => (
                      <motion.div 
                        key={i} 
                        className="w-1 bg-purple-500 rounded-full" 
                        animate={{ height: h }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest text-purple-400 animate-pulse">Listening...</span>
                </>
              )}
              {state === 'thinking' && (
                <>
                  <Loader2 className="w-4 h-4 text-purple-500 animate-spin" />
                  <span className="text-xs font-black uppercase tracking-widest text-purple-400">Thinking...</span>
                </>
              )}
              {state === 'speaking' && (
                <>
                   <div className="flex gap-1 items-center h-4">
                    {waveform.map((h, i) => (
                      <motion.div 
                        key={i} 
                        className="w-1 bg-indigo-400 rounded-full" 
                        animate={{ height: h * 1.5 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest text-indigo-400">SmartAI Speaking...</span>
                </>
              )}
            </div>
            
            <p className="text-[10px] text-slate-300 font-medium text-center max-w-[250px] line-clamp-2 italic">
              {state === 'listening' ? (transcript || "...") : (state === 'speaking' ? aiResponse : "")}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Floating Button */}
      <div className="relative group">
        {/* Animated Rings */}
        <AnimatePresence>
          {state === 'listening' && (
            <>
              <div className="absolute inset-0 rounded-full bg-purple-500/20 animate-pulse-ring" />
              <div className="absolute inset-0 rounded-full bg-purple-500/10 animate-pulse-ring [animation-delay:0.5s]" />
              <div className="absolute inset-0 rounded-full bg-purple-500/5 animate-pulse-ring [animation-delay:1s]" />
            </>
          )}
        </AnimatePresence>

        {/* Outer Rotating Frame (Jarvis Style) */}
        <div className={`absolute -inset-4 border border-purple-500/20 rounded-full transition-opacity duration-500 ${state !== 'idle' ? 'opacity-100' : 'opacity-0'}`}>
          <div className="absolute inset-0 animate-neural-spin">
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-purple-500 rounded-full shadow-[0_0_10px_#a855f7]" />
             <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-purple-500 rounded-full shadow-[0_0_10px_#a855f7]" />
          </div>
        </div>

        {/* The Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleListening}
          className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 border shadow-2xl overflow-hidden
            ${state === 'idle' ? 'bg-[#0a0a0f]/80 border-purple-500/30 text-purple-500 hover:border-purple-500 neural-glow' : 
              state === 'listening' ? 'bg-purple-600 border-purple-400 text-white shadow-[0_0_40px_rgba(168,85,247,0.6)]' :
              state === 'thinking' ? 'bg-[#0a0a0f]/90 border-purple-500 text-purple-400' :
              'bg-[#0d111c] border-indigo-500 text-indigo-400 shadow-[0_0_40px_rgba(99,102,241,0.4)]'}
          `}
        >
          {/* Glassmorphism Highlight */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
          
          {/* Internal Content */}
          <div className="relative z-10">
            {state === 'idle' && <Mic className="w-8 h-8 animate-float" />}
            {state === 'listening' && <Mic className="w-8 h-8" />}
            {state === 'thinking' && <Loader2 className="w-8 h-8 animate-spin" />}
            {state === 'speaking' && <Volume2 className="w-8 h-8" />}
          </div>

          {/* Holographic Scan Effect */}
          {state !== 'idle' && <div className="absolute inset-0 hologram-effect opacity-30" />}
          
          {/* Particle Background Simulation (CSS based) */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
             {[...Array(6)].map((_, i) => (
               <div 
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full opacity-20"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animation: `float ${2 + Math.random() * 3}s linear infinite`
                }}
               />
             ))}
          </div>
        </motion.button>
      </div>

      {/* Quick Status Dot */}
      <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded-full border border-white/5 backdrop-blur-md">
        <div className={`w-1.5 h-1.5 rounded-full ${state === 'idle' ? 'bg-purple-500 shadow-[0_0_5px_#a855f7]' : 'bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]'}`} />
        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500">Neural Link Stable</span>
      </div>
    </div>
  );
};

export default SmartAIVoiceAssistant;
