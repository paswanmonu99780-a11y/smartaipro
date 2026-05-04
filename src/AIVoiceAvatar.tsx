import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';

interface AIVoiceAvatarProps {
  isOpen: boolean;
  onClose: () => void;
  onSendMessage: (message: string) => Promise<string>;
  lastAIMessage?: string;
}

export default function AIVoiceAvatar({ isOpen, onClose, onSendMessage, lastAIMessage }: AIVoiceAvatarProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [status, setStatus] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
  const [blinkLeft, setBlinkLeft] = useState(false);
  const [blinkRight, setBlinkRight] = useState(false);
  const [mouthOpen, setMouthOpen] = useState(0);
  const [lookX, setLookX] = useState(0);
  const [lookY, setLookY] = useState(0);
  const [emotion, setEmotion] = useState<'neutral' | 'happy' | 'thinking' | 'surprised'>('neutral');
  const [displayText, setDisplayText] = useState('');
  const [eyebrowOffset, setEyebrowOffset] = useState(0);

  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const recognitionRef = useRef<any>(null);
  const animFrameRef = useRef<number>(0);
  const mouthAnimRef = useRef<number>(0);

  // Random blink effect
  useEffect(() => {
    if (!isOpen) return;
    const blinkInterval = setInterval(() => {
      const side = Math.random() > 0.7 ? 'both' : Math.random() > 0.5 ? 'left' : 'right';
      if (side === 'both' || side === 'left') setBlinkLeft(true);
      if (side === 'both' || side === 'right') setBlinkRight(true);
      setTimeout(() => { setBlinkLeft(false); setBlinkRight(false); }, 150);
    }, 2800 + Math.random() * 2000);
    return () => clearInterval(blinkInterval);
  }, [isOpen]);

  // Eye tracking - follow mouse
  useEffect(() => {
    if (!isOpen) return;
    const handleMouseMove = (e: MouseEvent) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const dx = (e.clientX - cx) / cx;
      const dy = (e.clientY - cy) / cy;
      setLookX(dx * 4);
      setLookY(dy * 3);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isOpen]);

  // Animate mouth when speaking
  const animateMouth = (speaking: boolean) => {
    if (!speaking) { setMouthOpen(0); return; }
    let t = 0;
    const anim = () => {
      t += 0.3;
      setMouthOpen(Math.abs(Math.sin(t)) * 12 + Math.abs(Math.sin(t * 0.7)) * 6);
      mouthAnimRef.current = requestAnimationFrame(anim);
    };
    mouthAnimRef.current = requestAnimationFrame(anim);
  };

  // Speak text with Web Speech API
  const speak = (text: string) => {
    if (isMuted || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;

    // Pick a good voice
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v =>
      v.name.includes('Google') && v.lang.startsWith('en')
    ) || voices.find(v => v.lang.startsWith('en-US')) || voices[0];
    if (preferred) utterance.voice = preferred;

    utterance.rate = 1.05;
    utterance.pitch = 1.1;
    utterance.volume = 1;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setStatus('speaking');
      setEmotion('happy');
      setEyebrowOffset(-2);
      animateMouth(true);
    };
    utterance.onend = () => {
      setIsSpeaking(false);
      setStatus('idle');
      setEmotion('neutral');
      setEyebrowOffset(0);
      cancelAnimationFrame(mouthAnimRef.current);
      setMouthOpen(0);
    };

    // Stream text display
    let charIdx = 0;
    const charInterval = setInterval(() => {
      if (charIdx < text.length) {
        setDisplayText(text.substring(0, charIdx + 1));
        charIdx++;
      } else {
        clearInterval(charInterval);
      }
    }, 30);

    window.speechSynthesis.speak(utterance);
  };

  // Speak last AI message when it changes
  useEffect(() => {
    if (isOpen && lastAIMessage) {
      setDisplayText('');
      speak(lastAIMessage);
    }
  }, [lastAIMessage, isOpen]);

  // Start voice recognition
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice input is not supported in your browser. Please use Chrome.');
      return;
    }
    window.speechSynthesis.cancel();
    cancelAnimationFrame(mouthAnimRef.current);
    setMouthOpen(0);
    setIsSpeaking(false);

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setStatus('listening');
      setEmotion('neutral');
      setEyebrowOffset(2);
      setTranscript('');
      setDisplayText('Listening...');
    };

    recognition.onresult = (event: any) => {
      const interim = Array.from(event.results)
        .map((r: any) => r[0].transcript)
        .join('');
      setTranscript(interim);
      setDisplayText(interim);
    };

    recognition.onend = async () => {
      setIsListening(false);
      setEyebrowOffset(0);
      if (transcript.trim()) {
        setStatus('thinking');
        setEmotion('thinking');
        setDisplayText('Thinking...');
        try {
          const reply = await onSendMessage(transcript.trim());
          speak(reply);
        } catch {
          speak("Sorry, I couldn't process that. Please try again.");
          setStatus('idle');
          setEmotion('neutral');
        }
      } else {
        setStatus('idle');
        setDisplayText('');
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
      setStatus('idle');
      setEmotion('neutral');
      setDisplayText('Could not hear you. Try again.');
    };

    recognition.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
    setStatus('idle');
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    cancelAnimationFrame(mouthAnimRef.current);
    setMouthOpen(0);
    setIsSpeaking(false);
    setStatus('idle');
  };

  // Emotion-based face colors
  const skinGrad = emotion === 'thinking'
    ? ['#6366f1', '#8b5cf6']
    : emotion === 'happy'
    ? ['#4f46e5', '#7c3aed']
    : ['#3730a3', '#5b21b6'];

  const glowColor = emotion === 'happy' ? 'rgba(99,102,241,0.5)' : emotion === 'thinking' ? 'rgba(139,92,246,0.4)' : 'rgba(79,70,229,0.3)';

  const eyeColor = status === 'listening' ? '#34d399' : status === 'speaking' ? '#a78bfa' : '#818cf8';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ type: 'spring', damping: 20, stiffness: 200 }}
          className="fixed inset-0 z-[200] flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)' }}
        >
          <div className="relative flex flex-col items-center gap-6 w-full max-w-lg px-4">
            {/* Close Button */}
            <button
              onClick={() => { stopSpeaking(); stopListening(); onClose(); }}
              className="absolute top-0 right-4 p-2 text-slate-400 hover:text-white bg-slate-800 rounded-full z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Title */}
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400">AI Voice Assistant</p>

            {/* 3D Face SVG */}
            <motion.div
              animate={{
                rotateY: lookX * 2,
                rotateX: -lookY * 2,
              }}
              style={{ perspective: 600, transformStyle: 'preserve-3d' }}
              className="relative"
            >
              {/* Glow Ring */}
              <div
                className="absolute inset-0 rounded-full blur-2xl"
                style={{ background: glowColor, transform: 'scale(1.3)', zIndex: -1 }}
              />

              <svg width="220" height="220" viewBox="0 0 220 220" style={{ filter: `drop-shadow(0 0 30px ${glowColor})` }}>
                <defs>
                  <radialGradient id="faceGrad" cx="40%" cy="35%">
                    <stop offset="0%" stopColor={skinGrad[0]} />
                    <stop offset="100%" stopColor={skinGrad[1]} />
                  </radialGradient>
                  <radialGradient id="eyeGrad" cx="40%" cy="35%">
                    <stop offset="0%" stopColor="#c7d2fe" />
                    <stop offset="100%" stopColor={eyeColor} />
                  </radialGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                  <linearGradient id="neckGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={skinGrad[1]} />
                    <stop offset="100%" stopColor="transparent" />
                  </linearGradient>
                </defs>

                {/* Neck */}
                <rect x="85" y="175" width="50" height="30" rx="10" fill="url(#neckGrad)" opacity="0.7" />

                {/* Head */}
                <motion.ellipse
                  cx="110" cy="105" rx="88" ry="95"
                  fill="url(#faceGrad)"
                  animate={{ ry: [95, 97, 95] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                />

                {/* Cheek highlights */}
                <ellipse cx="62" cy="125" rx="18" ry="12" fill="rgba(255,255,255,0.07)" />
                <ellipse cx="158" cy="125" rx="18" ry="12" fill="rgba(255,255,255,0.07)" />

                {/* Forehead shine */}
                <ellipse cx="95" cy="65" rx="28" ry="16" fill="rgba(255,255,255,0.12)" />

                {/* LEFT Eyebrow */}
                <motion.path
                  d={`M 60 ${74 + eyebrowOffset} Q 78 ${68 + eyebrowOffset} 96 ${72 + eyebrowOffset}`}
                  stroke="rgba(255,255,255,0.85)" strokeWidth="3.5" fill="none" strokeLinecap="round"
                  animate={{ d: emotion === 'surprised'
                    ? `M 60 ${66 + eyebrowOffset} Q 78 ${60 + eyebrowOffset} 96 ${64 + eyebrowOffset}`
                    : emotion === 'thinking'
                    ? `M 60 ${76 + eyebrowOffset} Q 78 ${70 + eyebrowOffset} 96 ${68 + eyebrowOffset}`
                    : `M 60 ${74 + eyebrowOffset} Q 78 ${68 + eyebrowOffset} 96 ${72 + eyebrowOffset}`
                  }}
                  transition={{ duration: 0.4 }}
                />

                {/* RIGHT Eyebrow */}
                <motion.path
                  d={`M 124 ${72 + eyebrowOffset} Q 142 ${68 + eyebrowOffset} 160 ${74 + eyebrowOffset}`}
                  stroke="rgba(255,255,255,0.85)" strokeWidth="3.5" fill="none" strokeLinecap="round"
                  animate={{ d: emotion === 'surprised'
                    ? `M 124 ${64 + eyebrowOffset} Q 142 ${60 + eyebrowOffset} 160 ${66 + eyebrowOffset}`
                    : emotion === 'thinking'
                    ? `M 124 ${68 + eyebrowOffset} Q 142 ${70 + eyebrowOffset} 160 ${76 + eyebrowOffset}`
                    : `M 124 ${72 + eyebrowOffset} Q 142 ${68 + eyebrowOffset} 160 ${74 + eyebrowOffset}`
                  }}
                  transition={{ duration: 0.4 }}
                />

                {/* LEFT Eye socket */}
                <ellipse cx={78 + lookX} cy={100 + lookY} rx="22" ry={blinkLeft ? 1.5 : 17} fill="rgba(0,0,20,0.7)"
                  style={{ transition: 'ry 0.08s' }} />

                {/* LEFT Eye iris */}
                {!blinkLeft && <>
                  <circle cx={78 + lookX} cy={100 + lookY} r="12" fill="url(#eyeGrad)" filter="url(#glow)" />
                  <circle cx={78 + lookX} cy={100 + lookY} r="7" fill={eyeColor} opacity="0.9" />
                  <circle cx={78 + lookX} cy={100 + lookY} r="4" fill="rgba(0,0,0,0.9)" />
                  <circle cx={82 + lookX} cy={96 + lookY} r="2.5" fill="white" opacity="0.95" />
                  <circle cx={75 + lookX} cy={103 + lookY} r="1" fill="white" opacity="0.5" />
                </>}

                {/* RIGHT Eye socket */}
                <ellipse cx={142 + lookX} cy={100 + lookY} rx="22" ry={blinkRight ? 1.5 : 17} fill="rgba(0,0,20,0.7)"
                  style={{ transition: 'ry 0.08s' }} />

                {/* RIGHT Eye iris */}
                {!blinkRight && <>
                  <circle cx={142 + lookX} cy={100 + lookY} r="12" fill="url(#eyeGrad)" filter="url(#glow)" />
                  <circle cx={142 + lookX} cy={100 + lookY} r="7" fill={eyeColor} opacity="0.9" />
                  <circle cx={142 + lookX} cy={100 + lookY} r="4" fill="rgba(0,0,0,0.9)" />
                  <circle cx={146 + lookX} cy={96 + lookY} r="2.5" fill="white" opacity="0.95" />
                  <circle cx={139 + lookX} cy={103 + lookY} r="1" fill="white" opacity="0.5" />
                </>}

                {/* Nose */}
                <path d="M 105 115 Q 100 128 90 133 Q 110 138 130 133 Q 120 128 115 115"
                  fill="rgba(0,0,0,0.15)" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />

                {/* MOUTH */}
                <motion.path
                  d={emotion === 'happy' || status === 'speaking'
                    ? `M 78 152 Q 110 ${162 + mouthOpen} 142 152`
                    : emotion === 'thinking'
                    ? `M 82 154 Q 110 150 138 154`
                    : `M 82 152 Q 110 ${158 + mouthOpen * 0.5} 138 152`
                  }
                  stroke="rgba(255,255,255,0.8)" strokeWidth="3" fill="none" strokeLinecap="round"
                  animate={{ d: emotion === 'happy' || status === 'speaking'
                    ? `M 78 152 Q 110 ${162 + mouthOpen} 142 152`
                    : `M 82 152 Q 110 ${158 + mouthOpen * 0.5} 138 152`
                  }}
                  transition={{ duration: 0.08 }}
                />
                {/* Upper lip when open */}
                {mouthOpen > 4 && (
                  <motion.path
                    d={`M 82 152 Q 110 ${145} 138 152`}
                    stroke="rgba(255,255,255,0.6)" strokeWidth="2" fill="none" strokeLinecap="round"
                  />
                )}
                {/* Inner mouth (teeth/dark) */}
                {mouthOpen > 5 && (
                  <ellipse cx="110" cy={157 + mouthOpen * 0.3} rx={mouthOpen * 1.5} ry={mouthOpen * 0.6}
                    fill="rgba(0,0,30,0.8)" />
                )}

                {/* Thinking pulse dots */}
                {status === 'thinking' && [0, 1, 2].map(i => (
                  <motion.circle
                    key={i}
                    cx={95 + i * 15} cy="168" r="4"
                    fill={eyeColor}
                    animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
                    transition={{ duration: 0.8, delay: i * 0.2, repeat: Infinity }}
                  />
                ))}

                {/* Listening wave rings */}
                {status === 'listening' && [1, 2, 3].map(i => (
                  <motion.circle
                    key={i}
                    cx="110" cy="105" rx="0" ry="0" r={80 + i * 20}
                    stroke="#34d399" strokeWidth="1.5" fill="none"
                    animate={{ r: [80 + i * 15, 100 + i * 15], opacity: [0.6, 0] }}
                    transition={{ duration: 1.5, delay: i * 0.4, repeat: Infinity }}
                  />
                ))}

                {/* Circuit pattern overlay */}
                <g opacity="0.08" stroke="white" strokeWidth="0.8">
                  <line x1="30" y1="80" x2="50" y2="80" /><line x1="50" y1="80" x2="50" y2="60" />
                  <line x1="170" y1="80" x2="190" y2="80" /><line x1="190" y1="80" x2="190" y2="60" />
                  <line x1="30" y1="140" x2="45" y2="140" /><line x1="170" y1="140" x2="185" y2="140" />
                  <circle cx="30" cy="80" r="3" fill="white" /><circle cx="190" cy="80" r="3" fill="white" />
                </g>
              </svg>

              {/* Status ring */}
              <motion.div
                className="absolute inset-0 rounded-full border-2 pointer-events-none"
                style={{ borderColor: status === 'listening' ? '#34d399' : status === 'speaking' ? '#a78bfa' : 'transparent' }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
            </motion.div>

            {/* Status Badge */}
            <div className="flex items-center gap-2">
              <motion.div
                className="w-2 h-2 rounded-full"
                style={{ background: status === 'listening' ? '#34d399' : status === 'speaking' ? '#a78bfa' : status === 'thinking' ? '#fbbf24' : '#4f46e5' }}
                animate={{ scale: [1, 1.4, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                {status === 'idle' ? 'SmartAI Ready' : status === 'listening' ? 'Listening...' : status === 'thinking' ? 'Processing...' : 'Speaking...'}
              </span>
            </div>

            {/* Text Display */}
            <div className="w-full min-h-[72px] bg-slate-900/60 border border-slate-700 rounded-2xl px-5 py-4 text-sm text-slate-300 leading-relaxed font-medium text-center">
              {displayText || <span className="text-slate-600 text-[11px] uppercase tracking-widest">Press the mic to talk to me</span>}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4">
              {/* Mute toggle */}
              <button
                onClick={() => { setIsMuted(!isMuted); if (!isMuted) stopSpeaking(); }}
                className={`p-3 rounded-full border transition-all ${isMuted ? 'border-red-500/50 bg-red-600/10 text-red-400' : 'border-slate-700 bg-slate-800 text-slate-400 hover:text-white'}`}
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>

              {/* Main Mic Button */}
              <motion.button
                onClick={isListening ? stopListening : startListening}
                whileTap={{ scale: 0.92 }}
                className={`w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transition-all ${
                  isListening
                    ? 'bg-red-600 shadow-red-600/40 animate-pulse'
                    : 'bg-indigo-600 shadow-indigo-600/40 hover:bg-indigo-500'
                }`}
              >
                {isListening ? <MicOff className="w-8 h-8 text-white" /> : <Mic className="w-8 h-8 text-white" />}
              </motion.button>

              {/* Stop speaking */}
              <button
                onClick={stopSpeaking}
                disabled={!isSpeaking}
                className="p-3 rounded-full border border-slate-700 bg-slate-800 text-slate-400 hover:text-white transition-all disabled:opacity-30"
              >
                <VolumeX className="w-5 h-5" />
              </button>
            </div>

            <p className="text-[9px] text-slate-600 uppercase tracking-widest">
              Tap mic to speak • Voice powered by Web Speech API
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
