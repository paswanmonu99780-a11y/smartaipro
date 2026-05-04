import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, X, Languages } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AIVoiceAvatarProps {
  isActive: boolean;
  onClose: () => void;
  onTranscript: (text: string, lang: string) => void;
  isThinking: boolean;
  lastAiMessage: string;
}

const AIVoiceAvatar: React.FC<AIVoiceAvatarProps> = ({ 
  isActive, 
  onClose, 
  onTranscript, 
  isThinking, 
  lastAiMessage 
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [language, setLanguage] = useState<'en-US' | 'hi-IN'>('hi-IN');
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const lastSpokenRef = useRef<string>('');
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Speech Recognition and Synth
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        // Set continuous to true to prevent early cut-offs
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = language;

        recognitionRef.current.onresult = (event: any) => {
          let finalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            }
          }

          if (finalTranscript) {
            console.log("STT: Final transcript chunk:", finalTranscript);
            
            // Clear previous timer and wait for silence before submitting
            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
            
            silenceTimerRef.current = setTimeout(() => {
              console.log("STT: Submitting after stability delay:", finalTranscript);
              onTranscript(finalTranscript, language);
              recognitionRef.current?.stop();
              setIsListening(false);
            }, 1500); // 1.5s silence before assuming user is done
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error("STT: Recognition error:", event.error);
          if (event.error !== 'no-speech') setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
      
      const synth = window.speechSynthesis;
      synthRef.current = synth;
// ... rest of useEffect logic

      const loadVoices = () => {
        const voices = synth.getVoices();
        if (voices.length > 0) {
          console.log(`TTS: ${voices.length} voices loaded`);
          setVoicesLoaded(true);
        }
      };

      loadVoices();
      if (synth.onvoiceschanged !== undefined) {
        synth.onvoiceschanged = loadVoices;
      }
      
      // Some browsers need a periodic check
      const voiceInterval = setInterval(() => {
        if (synth.getVoices().length > 0) {
          setVoicesLoaded(true);
          clearInterval(voiceInterval);
        }
      }, 500);

      return () => clearInterval(voiceInterval);
    }
  }, [onTranscript, language]);

  // Handle listening loop
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (isActive && !isThinking && !isSpeaking && !isListening) {
      timeoutId = setTimeout(startListening, 1000);
    }
    return () => {
      clearTimeout(timeoutId);
    };
  }, [isActive, isThinking, isSpeaking, isListening]);

  // Handle speaking AI messages
  useEffect(() => {
    if (isActive && lastAiMessage && lastAiMessage !== lastSpokenRef.current && !isThinking) {
      console.log("TTS: New message, starting speak cycle");
      speak(lastAiMessage);
      lastSpokenRef.current = lastAiMessage;
    }
  }, [lastAiMessage, isThinking, isActive]);

  // Update lastSpokenRef when opening
  useEffect(() => {
    if (isActive) {
      console.log("TTS: Voice Avatar opened");
      // If there's already a message when opening, speak it if it hasn't been spoken yet
      if (lastAiMessage && lastAiMessage !== lastSpokenRef.current) {
        console.log("TTS: Speaking existing message on open");
        speak(lastAiMessage);
        lastSpokenRef.current = lastAiMessage;
      }
      
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        window.speechSynthesis.resume();
      }
    } else {
      stopSpeaking();
    }
  }, [isActive]); // Only react to isActive changes

  const startListening = () => {
    if (recognitionRef.current && !isListening && !isSpeaking && !isThinking && isActive) {
      try {
        recognitionRef.current.lang = language;
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        // Already started
      }
    }
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  const speak = (text: string) => {
    if (!synthRef.current || !text) return;

    // Clean text: remove markdown, code blocks, emojis, and noisy punctuation
    let cleanText = text
      // Remove code blocks
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`([^`]+)`/g, '$1')
      // Remove markdown formatting
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/[#*_~`]/g, '')
      // Remove emojis (all Unicode emoji ranges)
      .replace(/[\u{1F600}-\u{1F64F}]/gu, '')
      .replace(/[\u{1F300}-\u{1F5FF}]/gu, '')
      .replace(/[\u{1F680}-\u{1F6FF}]/gu, '')
      .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '')
      .replace(/[\u{2600}-\u{26FF}]/gu, '')
      .replace(/[\u{2700}-\u{27BF}]/gu, '')
      .replace(/[\u{FE00}-\u{FE0F}]/gu, '')
      .replace(/[\u{1F900}-\u{1F9FF}]/gu, '')
      .replace(/[\u{1FA00}-\u{1FA6F}]/gu, '')
      .replace(/[\u{1FA70}-\u{1FAFF}]/gu, '')
      .replace(/[\u{200D}]/gu, '')
      .replace(/[\u{20E3}]/gu, '')
      // Remove bullet points and list markers
      .replace(/^[\s]*[-•▪▸►→]\s*/gm, '')
      // Remove noisy standalone punctuation (.,;:/\|) but keep them as natural pauses
      .replace(/[;:\/\\|@#$%^&*(){}[\]<>~`]+/g, ' ')
      // Remove repeated dots/commas that TTS reads out
      .replace(/\.{2,}/g, '.')
      .replace(/,{2,}/g, ',')
      .replace(/_{2,}/g, ' ')
      .replace(/-{2,}/g, ' ')
      // Remove URLs
      .replace(/https?:\/\/\S+/g, '')
      // Clean extra whitespace
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) return;

    // Limit total length
    cleanText = cleanText.substring(0, 1500);

    stopSpeaking();
    synthRef.current.cancel();
    synthRef.current.resume();

    // Break text into sentences for natural speech flow
    const sentences = cleanText
      .split(/(?<=[.!?\u0964\u0965])\s+/)  // Split on sentence-ending punctuation (including Hindi purna viram ।)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    // If no sentence breaks found, split on commas for smaller chunks
    let chunks = sentences;
    if (chunks.length <= 1 && cleanText.length > 150) {
      chunks = cleanText
        .split(/(?<=,)\s+/)
        .map(s => s.trim())
        .filter(s => s.length > 0);
    }

    // Select voice once for all chunks
    const voices = synthRef.current.getVoices();
    let voice: SpeechSynthesisVoice | null = null;

    if (language === 'hi-IN') {
      // Priority order for Hindi voices
      voice = voices.find(v => v.lang === 'hi-IN' && (v.name.includes('Google') || v.name.includes('Premium'))) || null;
      if (!voice) voice = voices.find(v => v.lang === 'hi-IN') || null;
      if (!voice) voice = voices.find(v => v.lang.startsWith('hi')) || null;
      if (!voice) voice = voices.find(v => v.name.toLowerCase().includes('hindi') || v.name.includes('Kalpana') || v.name.includes('Hemant')) || null;
    } else {
      voice = voices.find(v => v.lang === 'en-US' && v.name.includes('Google')) || null;
      if (!voice) voice = voices.find(v => v.lang === 'en-US') || null;
      if (!voice) voice = voices.find(v => v.lang.startsWith('en')) || null;
    }

    if (voice) {
      console.log("TTS: Selected voice:", voice.name, voice.lang);
    } else {
      console.warn("TTS: No specific voice found for", language, "- using browser default");
    }

    // Speak chunks one by one
    let chunkIndex = 0;

    const speakNextChunk = () => {
      if (chunkIndex >= chunks.length || !synthRef.current) {
        setIsSpeaking(false);
        if (isActive) setTimeout(startListening, 800);
        return;
      }

      const chunkText = chunks[chunkIndex];
      chunkIndex++;

      const utterance = new SpeechSynthesisUtterance(chunkText);
      utterance.lang = language;
      utterance.rate = language === 'hi-IN' ? 0.9 : 1.0;  // Slightly slower for Hindi clarity
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      if (voice) utterance.voice = voice;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        // Small pause between sentences for natural flow
        setTimeout(speakNextChunk, 200);
      };
      utterance.onerror = (e) => {
        console.error("TTS chunk error:", e);
        // Try next chunk on error
        setTimeout(speakNextChunk, 100);
      };

      utteranceRef.current = utterance;
      synthRef.current?.speak(utterance);
    };

    // Start speaking first chunk with small delay
    setTimeout(() => {
      setIsSpeaking(true);
      speakNextChunk();
    }, 100);
  };

  // Pre-load voices
  useEffect(() => {
    const loadVoices = () => {
      if (synthRef.current) {
        synthRef.current.getVoices();
      }
    };
    loadVoices();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const toggleLanguage = () => {
    const newLang = language === 'en-US' ? 'hi-IN' : 'en-US';
    setLanguage(newLang);
    stopSpeaking();
    if (isListening) {
      recognitionRef.current?.stop();
    }
  };

  if (!isActive) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-2xl"
    >
      {/* Top Controls */}
      <div className="absolute top-8 left-8 flex items-center gap-4">
        <button 
          onClick={() => speak(language === 'hi-IN' ? 'Namaste, main theek se kaam kar raha hoon' : 'Hello, my voice system is active')}
          className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-slate-500 hover:text-white transition-all border border-white/10"
        >
          Test Audio
        </button>
      </div>

      <div className="absolute top-8 right-8 flex items-center gap-4">
        <button 
          onClick={toggleLanguage}
          className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-2xl text-white transition-all border border-white/10 group"
        >
          <Languages className="w-5 h-5 text-indigo-400 group-hover:rotate-12 transition-transform" />
          <span className="text-sm font-black uppercase tracking-widest">
            {language === 'en-US' ? 'English' : 'Hindi'}
          </span>
        </button>
        <button 
          onClick={() => { stopSpeaking(); onClose(); }}
          className="p-4 bg-white/10 hover:bg-red-500/20 rounded-2xl text-white transition-all border border-white/10 hover:border-red-500/50"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="flex flex-col items-center gap-16">
        {/* 3D AI Assistant Face */}
        <div className="relative w-80 h-80">
          {/* Reactive Outer Glows */}
          <div className={`absolute inset-0 bg-indigo-500/20 blur-[120px] rounded-full transition-all duration-700 ${isSpeaking ? 'scale-150 opacity-100' : (isListening ? 'scale-110 opacity-70' : 'scale-100 opacity-30')}`} />
          <div className={`absolute inset-0 bg-blue-500/10 blur-[80px] rounded-full transition-all duration-1000 ${isSpeaking ? 'animate-pulse' : ''}`} />
          
          {/* Main Sphere */}
          <div className={`relative w-full h-full rounded-full bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 shadow-[0_0_80px_rgba(79,70,229,0.4)] border border-white/20 overflow-hidden flex items-center justify-center transition-transform duration-500 ${isSpeaking ? 'scale-105' : 'scale-100'}`}>
            {/* Animated Grid Lines */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" 
                 style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
            
            {/* Eyes */}
            <div className="flex gap-16 z-10">
              <motion.div 
                animate={{ 
                  scaleY: isSpeaking ? [1, 0.2, 1] : 1,
                  height: isListening ? [24, 40, 24] : 24,
                  opacity: isThinking ? [0.4, 1, 0.4] : 1
                }}
                transition={{ repeat: Infinity, duration: isThinking ? 1.5 : 0.6 }}
                className="w-5 h-6 bg-white rounded-full shadow-[0_0_20px_#fff]" 
              />
              <motion.div 
                animate={{ 
                  scaleY: isSpeaking ? [1, 0.2, 1] : 1,
                  height: isListening ? [24, 40, 24] : 24,
                  opacity: isThinking ? [0.4, 1, 0.4] : 1
                }}
                transition={{ repeat: Infinity, duration: isThinking ? 1.5 : 0.6 }}
                className="w-5 h-6 bg-white rounded-full shadow-[0_0_20px_#fff]" 
              />
            </div>

            {/* Mouth/Sound Waves */}
            <div className="absolute bottom-20 flex items-center gap-1.5 h-12">
              {[...Array(7)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ 
                    height: isSpeaking ? [8, 48, 8] : (isListening ? [4, 20, 4] : 6),
                    opacity: isSpeaking ? 1 : 0.5
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 0.3, 
                    delay: i * 0.05 
                  }}
                  className="w-1.5 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                />
              ))}
            </div>

            {/* Pulsing Core */}
            <motion.div 
              animate={{ 
                opacity: [0.1, 0.3, 0.1],
                scale: [0.9, 1.1, 0.9]
              }}
              transition={{ repeat: Infinity, duration: 4 }}
              className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent pointer-events-none" 
            />
          </div>
        </div>

        {/* Status Section */}
        <div className="text-center space-y-8">
          <div className="space-y-2">
            <h2 className="text-4xl font-black text-white uppercase tracking-tighter">
              {isSpeaking ? (language === 'hi-IN' ? 'AI bol raha hai...' : 'AI is speaking...') : 
               (isListening ? (language === 'hi-IN' ? 'Main sun raha hoon...' : 'Listening to you...') : 
               (isThinking ? (language === 'hi-IN' ? 'Soch raha hoon...' : 'Thinking...') : 
               (language === 'hi-IN' ? 'Taiyaar' : 'Ready')))}
            </h2>
            <p className="text-indigo-400 font-black uppercase tracking-[0.3em] text-xs">
              {isListening ? 'Speak now' : (isThinking ? 'Processing neural link' : 'Neural Link Active')}
            </p>
          </div>

          <div className="flex items-center justify-center gap-6">
            <div className={`p-6 rounded-[2rem] transition-all duration-500 border ${isListening ? 'bg-red-500 border-red-400 text-white shadow-[0_0_40px_rgba(239,68,68,0.4)] scale-110' : 'bg-white/5 border-white/10 text-slate-500'}`}>
              <Mic className={`w-8 h-8 ${isListening ? 'animate-pulse' : ''}`} />
            </div>
            
            <button 
              onClick={() => lastAiMessage && speak(lastAiMessage)}
              disabled={!lastAiMessage || isThinking}
              className={`p-6 rounded-[2rem] transition-all duration-500 border ${isSpeaking ? 'bg-indigo-500 border-indigo-400 text-white shadow-[0_0_40px_rgba(79,70,229,0.4)] scale-110' : 'bg-white/5 border-white/10 text-indigo-400/50 hover:bg-white/10'}`}
              title="Repeat last response"
            >
              <Volume2 className={`w-8 h-8 ${isSpeaking ? 'animate-pulse' : ''}`} />
            </button>
          </div>

          <p className="text-slate-500 text-sm font-bold uppercase tracking-[0.2em] max-w-md">
            {language === 'hi-IN' ? 'Bina kisi dar ke bolein, main aapki madad ke liye taiyaar hoon' : 'Speak naturally, I am here to assist your creative process'}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default AIVoiceAvatar;
