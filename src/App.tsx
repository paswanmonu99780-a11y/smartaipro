import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Image as ImageIcon, LogOut, Send, Plus, Zap, Sparkles, Github, Download, Video, User, CreditCard, Eye, EyeOff, Shield, Copy, Check, Search, Mic, RefreshCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import AdminPanel from './AdminPanel';

type Tab = 'chat' | 'image' | 'video' | 'profile' | 'admin';
type SmartMode = 'normal' | 'creative' | 'expert';
interface Message { id: string; role: 'user' | 'assistant'; content: string; }

function AdBanner() {
  const adRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!adRef.current) return;
    const container = adRef.current;
    container.innerHTML = '';
    const configScript = document.createElement('script');
    configScript.text = `
      atOptions = {
        'key' : 'cb07926d8c0a4b4aa3010551e8596427',
        'format' : 'iframe',
        'height' : 50,
        'width' : 320,
        'params' : {}
      };
    `;
    container.appendChild(configScript);
    const invokeScript = document.createElement('script');
    invokeScript.src = 'https://www.highperformanceformat.com/cb07926d8c0a4b4aa3010551e8596427/invoke.js';
    invokeScript.async = true;
    container.appendChild(invokeScript);
  }, []);
  return <div ref={adRef} className="w-full flex justify-center py-2" style={{ minHeight: 50 }} />;
}

const SIDEBAR_ITEMS = [
  { name: 'Conversation', icon: MessageSquare, tab: 'chat' as Tab },
  { name: 'Creation', icon: ImageIcon, tab: 'image' as Tab },
  { name: 'Neural Motion', icon: Video, tab: 'video' as Tab },
  { name: 'Profile', icon: User, tab: 'profile' as Tab },
  { name: 'Admin', icon: Shield, tab: 'admin' as Tab },
];

const MOBILE_TABS = [
  { name: 'Chat', icon: MessageSquare, tab: 'chat' as Tab },
  { name: 'Image', icon: ImageIcon, tab: 'image' as Tab },
  { name: 'Video', icon: Video, tab: 'video' as Tab },
  { name: 'Profile', icon: User, tab: 'profile' as Tab },
];

const PLANS = [
  { name: 'Basic', price: 'Free', features: ['100 Credits','Standard Response','720p Energy'], color: 'slate-400' },
  { name: 'Pro', price: '₹99', features: ['10,000 Credits','Expert Mode Enabled','2K Intelligence'], color: 'indigo-500', popular: true },
  { name: 'Ultra', price: '₹199', features: ['Unlimited Pixels','Zero Latency','4K Imagination'], color: 'emerald-500' },
];

const ASPECTS = ['1:1','16:9','9:16','4:3'] as const;
const STYLES = ['realistic','anime','oil painting','cyberpunk','minimalist','3d render','minecraft'];

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('chat');
  const [smartMode, setSmartMode] = useState<SmartMode>('normal');
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [credits, setCredits] = useState(100);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [loginContactType, setLoginContactType] = useState<'email' | 'mobile'>('email');
  const [loginMobile, setLoginMobile] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupMobile, setSignupMobile] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupReferCode, setSignupReferCode] = useState('');
  const [signupContactType, setSignupContactType] = useState<'email' | 'mobile'>('email');
  const [showPassword, setShowPassword] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [currentChatId, setCurrentChatId] = useState<string>(Date.now().toString());
  const [chatHistory, setChatHistory] = useState<Array<{id: string, title: string, messages: Message[]}>>([]);
  const [messages, setMessages] = useState<Message[]>([{ id: '1', role: 'assistant', content: 'Neural link established. I am SmartAI Pro. How can I assist your creative process?' }]);
  const chatFileInput = useRef<HTMLInputElement>(null);
  const [imgPrompt, setImgPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImg, setGeneratedImg] = useState<string | null>(null);
  const [imgAspect, setImgAspect] = useState<'1:1' | '16:9' | '9:16' | '4:3'>('1:1');
  const [imgStyle, setImgStyle] = useState('realistic');
  const [videoPrompt, setVideoPrompt] = useState('');
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [plan, setPlan] = useState<'Basic' | 'Pro' | 'Ultra'>('Basic');
  const [imgQuality, setImgQuality] = useState('720p');
  const [displayName, setDisplayName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [tempDisplayName, setTempDisplayName] = useState('');
  const [tempAvatar, setTempAvatar] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [showPrompts, setShowPrompts] = useState(true);
  const [negativePrompt, setNegativePrompt] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [imageHistory, setImageHistory] = useState<Array<{url: string; prompt: string; style: string; quality: string; aspect: string; date: string}>>([]);
  const [showHistory, setShowHistory] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const SUGGESTED_PROMPTS = [
    "Write a catchy slogan for a bakery",
    "Explain quantum physics like I'm five",
    "Code a simple React counter component",
    "Create a 5-day travel itinerary for Tokyo",
    "How to make a perfect cup of coffee?"
  ];

  useEffect(() => {
    // Migrate old accounts to new format on app load
    const users = getUsers();
    let needsSave = false;
    const migratedUsers = users.map((u: any) => {
      if (!u.referralCode) {
        needsSave = true;
        return {
          ...u,
          email: u.email || '',
          mobile: u.mobile || '',
          password: u.password || '',
          credits: typeof u.credits === 'number' ? u.credits : 100,
          plan: u.plan || 'Basic',
          displayName: u.displayName || u.name || 'User',
          avatar: u.avatar || '',
          name: u.name || u.displayName || 'User',
          referCode: u.referCode || '',
          referralCode: generateReferralCode(u.email || u.mobile || u.displayName || u.name || 'user'),
          referredBy: '',
          referralRewarded: false,
          deviceId: getDeviceId(),
          referralEarnings: 0
        };
      }
      return u;
    });
    if (needsSave) {
      saveUsers(migratedUsers);
    }

    const saved = localStorage.getItem('smartai_session');
    if (!saved) {
      const params = new URLSearchParams(window.location.search);
      const refCode = params.get('ref');
      if (refCode) {
        setSignupReferCode(refCode);
        setAuthMode('signup');
      }
    }
    if (saved) {
      const d = JSON.parse(saved);
      // Also migrate session if needed
      if (!d.referralCode) {
        d.referralCode = generateReferralCode(d.email || d.mobile || d.displayName || 'user');
        d.referredBy = d.referredBy || '';
        d.referralRewarded = d.referralRewarded || false;
        d.deviceId = d.deviceId || getDeviceId();
        d.referralEarnings = d.referralEarnings || 0;
        localStorage.setItem('smartai_session', JSON.stringify(d));
      }
      setCredits(typeof d.credits === 'number' ? d.credits : 100);
      setEmail(d.email || '');
      setPlan(d.plan || 'Basic');
      setDisplayName(d.displayName || d.email?.split('@')[0] || 'User');
      setAvatar(d.avatar || '');
      setIsLoggedIn(true);
    }
    const hist = localStorage.getItem('smartai_image_history');
    if (hist) { setImageHistory(JSON.parse(hist)); }
    
    // Load chat history
    const savedChats = localStorage.getItem('smartai_chat_history');
    if (savedChats) { 
      const chats = JSON.parse(savedChats); 
      setChatHistory(chats);
      if (chats.length > 0) {
        setCurrentChatId(chats[0].id);
        setMessages(chats[0].messages);
      }
    }
  }, []);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isAiThinking]);

  const getUsers = (): Array<{email: string; password: string; credits: number; plan: string; displayName: string; avatar: string; name: string; mobile: string; referCode: string; referralCode: string; referredBy: string; referralRewarded: boolean; deviceId: string; referralEarnings: number}> => {
    const data = localStorage.getItem('smartai_users');
    return data ? JSON.parse(data) : [];
  };
  const saveUsers = (users: Array<{email: string; password: string; credits: number; plan: string; displayName: string; avatar: string; name: string; mobile: string; referCode: string; referralCode: string; referredBy: string; referralRewarded: boolean; deviceId: string; referralEarnings: number}>) => {
    localStorage.setItem('smartai_users', JSON.stringify(users));
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginContactType === 'email' && !email) return alert('Please enter email address');
    if (loginContactType === 'mobile' && !loginMobile) return alert('Please enter mobile number');
    if (!password) return alert('Please enter password');
    setIsAuthenticating(true);
    setTimeout(() => {
      const users = getUsers();
      const user = users.find(u => {
        const userEmail = (u.email || '').trim();
        const userMobile = (u.mobile || '').trim();
        const inputEmail = (email || '').trim();
        const inputMobile = (loginMobile || '').trim();
        const matchContact = loginContactType === 'email' 
          ? userEmail === inputEmail 
          : userMobile === inputMobile;
        return matchContact && u.password === password;
      });
      if (user) {
        // Backward compatibility: ensure existing users have referral code
        if (!user.referralCode) {
          user.referralCode = generateReferralCode(user.email || user.mobile || user.displayName);
          user.referredBy = user.referredBy || '';
          user.referralRewarded = user.referralRewarded !== undefined ? user.referralRewarded : false;
          user.deviceId = user.deviceId || getDeviceId();
          user.referralEarnings = user.referralEarnings || 0;
          const userIdx = users.findIndex(u => u.email === user.email || u.mobile === user.mobile);
          if (userIdx !== -1) {
            users[userIdx] = user;
            saveUsers(users);
          }
        }
        localStorage.setItem('smartai_session', JSON.stringify(user));
        setCredits(typeof user.credits === 'number' ? user.credits : 100);
        setPlan((user.plan as 'Basic' | 'Pro' | 'Ultra') || 'Basic');
        setDisplayName(user.displayName || user.email?.split('@')[0] || 'User');
        setAvatar(user.avatar || '');
        setEmail(user.email || '');
        setIsLoggedIn(true);
      } else {
        const contactLabel = loginContactType === 'email' ? 'email' : 'mobile number';
        alert(`Invalid ${contactLabel} or password. Please try again.`);
      }
      setIsAuthenticating(false);
    }, 800);
  };
  const syncUserData = (updates: Partial<{credits: number; plan: string; displayName: string; avatar: string; referralRewarded: boolean; referralEarnings: number}>) => {
    const session = localStorage.getItem('smartai_session');
    if (session) {
      const d = JSON.parse(session);
      Object.assign(d, updates);
      localStorage.setItem('smartai_session', JSON.stringify(d));
      
      const users = getUsers();
      const idx = users.findIndex((u: any) => 
        (d.email && u.email === d.email) || (d.mobile && u.mobile === d.mobile)
      );
      if (idx !== -1) {
        Object.assign(users[idx], updates);
        saveUsers(users);
      }
    }
  };

  const handleSignup = () => {
    if (!signupName || !password || !signupConfirmPassword) return alert('Please fill all required fields');
    if (signupContactType === 'email' && !email) return alert('Please enter email address');
    if (signupContactType === 'mobile' && !signupMobile) return alert('Please enter mobile number');
    if (password !== signupConfirmPassword) return alert('Password and confirm password do not match');
    setIsAuthenticating(true);
    setTimeout(() => {
      const users = getUsers();
      
      // Check for duplicate email
      if (signupContactType === 'email' && email && users.find((u: any) => u.email === email)) {
        alert('Account already exists with this email. Please login instead.');
        setIsAuthenticating(false);
        return;
      }
      
      // Check for duplicate mobile
      if (signupContactType === 'mobile' && signupMobile && users.find((u: any) => u.mobile === signupMobile)) {
        alert('Account already exists with this mobile number. Please login instead.');
        setIsAuthenticating(false);
        return;
      }
      
      // Check for duplicate display name
      if (users.find((u: any) => u.displayName?.toLowerCase() === signupName.toLowerCase())) {
        alert('This display name is already taken. Please choose a different name.');
        setIsAuthenticating(false);
        return;
      }
      
      // Validate referral code if provided
      let referredBy = '';
      if (signupReferCode) {
        const referrer = users.find((u: any) => u.referralCode === signupReferCode);
        if (!referrer) {
          alert('Invalid referral code. Please check and try again, or leave it empty.');
          setIsAuthenticating(false);
          return;
        }
        // Prevent self-referral
        if (referrer.email === email || referrer.mobile === signupMobile) {
          alert('You cannot use your own referral code.');
          setIsAuthenticating(false);
          return;
        }
        referredBy = signupReferCode;
      }

      const userEmail = signupContactType === 'email' ? email : '';
      const userMobile = signupContactType === 'mobile' ? signupMobile : '';
      const newUser = { 
        email: userEmail, 
        password, 
        credits: 100, 
        plan: 'Basic', 
        displayName: signupName, 
        avatar: '', 
        name: signupName, 
        mobile: userMobile, 
        referCode: signupReferCode,
        referralCode: generateReferralCode(userEmail || userMobile || signupName),
        referredBy: referredBy,
        referralRewarded: false,
        deviceId: getDeviceId(),
        referralEarnings: 0
      };
      users.push(newUser);
      saveUsers(users);
      localStorage.setItem('smartai_session', JSON.stringify(newUser));
      setCredits(100);
      setPlan('Basic');
      setDisplayName(signupName);
      setAvatar('');
      setIsLoggedIn(true);
      
if (referredBy) {
        alert("Account created successfully! You have been referred by a friend. Send your first message to claim +50 bonus credits!");
      } else {
        alert('Account created successfully!');
      }
      setIsAuthenticating(false);
    }, 800);
  };
  const handleForgotPassword = () => {
    if (!resetEmail) return alert('Please enter your email');
    const users = getUsers();
    const user = users.find(u => u.email === resetEmail);
    if (!user) return alert('No account found with this email.');
    if (!newPassword) return alert('Please enter a new password');
    user.password = newPassword;
    saveUsers(users);
    alert('Password reset successful! Please login with your new password.');
    setAuthMode('login');
    setEmail(resetEmail);
    setResetEmail('');
    setNewPassword('');
  };
  const handleLogout = () => { localStorage.removeItem('smartai_session'); window.location.reload(); };
  const handleSaveProfile = () => {
    syncUserData({ displayName: tempName, avatar: tempAvatar });
    setDisplayName(tempName);
    setAvatar(tempAvatar);
    setIsEditingProfile(false);
  };

  const getDeviceId = () => {
    let deviceId = localStorage.getItem('smartai_device_id');
    if (!deviceId) {
      deviceId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('smartai_device_id', deviceId);
    }
    return deviceId;
  };

  const generateReferralCode = (email: string) => {
    const hash = email.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0);
    const suffix = Math.abs(hash).toString(36).substring(0, 4).toUpperCase();
    return `SMART${suffix}${Math.floor(Math.random() * 90 + 10)}`;
  };

  const processReferralReward = () => {
    const session = localStorage.getItem('smartai_session');
    if (!session) return;
    const d = JSON.parse(session);
    if (!d.referredBy || d.referralRewarded) return;

    const users = getUsers();
    const referrer = users.find((u: any) => u.referralCode === d.referredBy);
    if (!referrer) return;

    const newCredits = (d.credits || 0) + 50;
    const newReferralEarnings = (d.referralEarnings || 0) + 50;
    d.credits = newCredits;
    d.referralRewarded = true;
    d.referralEarnings = newReferralEarnings;
    localStorage.setItem('smartai_session', JSON.stringify(d));

    const referrerIdx = users.findIndex((u: any) => u.referralCode === d.referredBy);
    if (referrerIdx !== -1) {
      users[referrerIdx].credits = (users[referrerIdx].credits || 0) + 50;
      users[referrerIdx].referralEarnings = (users[referrerIdx].referralEarnings || 0) + 50;
      saveUsers(users);
    }

    alert('Referral reward credited! You and your friend got +50 credits.');
  };

  const getCurrentUserReferralData = () => {
    const session = localStorage.getItem('smartai_session');
    if (!session) return null;
    const d = JSON.parse(session);
    return {
      referralCode: d.referralCode || '',
      referralEarnings: d.referralEarnings || 0,
      referredBy: d.referredBy || ''
    };
  };

  const copyToClipboard = async (text: string, type: 'code' | 'link') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'code') { setCopiedCode(true); setTimeout(() => setCopiedCode(false), 2000); }
      else { setCopiedLink(true); setTimeout(() => setCopiedLink(false), 2000); }
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      if (type === 'code') { setCopiedCode(true); setTimeout(() => setCopiedCode(false), 2000); }
      else { setCopiedLink(true); setTimeout(() => setCopiedLink(false), 2000); }
    }
  };
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => { setTempAvatar(ev.target?.result as string); };
      reader.readAsDataURL(file);
    }
  };
  const avatarColors = ['bg-indigo-600','bg-emerald-600','bg-rose-600','bg-amber-600','bg-cyan-600','bg-violet-600'];
  const PREMIUM_STYLES = ['anime','cyberpunk','minecraft'];
  const isStyleLocked = (style: string) => {
    if (style === 'realistic') return false;
    if (plan !== 'Basic') return false;
    return PREMIUM_STYLES.includes(style);
  };
  const normalizePrompt = (value: string) => value.replace(/\s+/g, ' ').trim();

  const handleNewChat = () => {
    const newChat: { id: string; title: string; messages: Message[] } = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [{ id: Date.now().toString(), role: 'assistant' as const, content: 'Neural link established. I am SmartAI Pro. How can I assist your creative process?' }]
    };
    const updatedHistory = [newChat, ...chatHistory];
    setChatHistory(updatedHistory);
    setCurrentChatId(newChat.id);
    setMessages(newChat.messages);
    localStorage.setItem('smartai_chat_history', JSON.stringify(updatedHistory));
  };

  const handleDownloadChat = () => {
    const text = messages.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRegenerateResponse = async () => {
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
    if (lastUserMsg) {
      setChatInput(lastUserMsg.content);
      // We don't call handleSendMessage directly here because we want to replace the last assistant message
      // But for simplicity in this demo, we'll just set the input and let the user click send or we can trigger it
      // Let's implement a cleaner way:
      setMessages(prev => prev.slice(0, -1)); // Remove last assistant response
      // Now trigger send
      setTimeout(() => {
        const sendBtn = document.querySelector('button[title="Send Message"]') as HTMLButtonElement;
        sendBtn?.click();
      }, 100);
    }
  };

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }
    const Recognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new Recognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setChatInput(prev => prev + ' ' + transcript);
    };
    recognition.start();
  };

  const handleUpdateProfile = () => {
    if (!tempDisplayName.trim()) return;
    setDisplayName(tempDisplayName);
    setAvatar(tempAvatar);
    setIsEditingProfile(false);
    
    // Persist to session
    const session = JSON.parse(localStorage.getItem('smartai_session') || '{}');
    if (session.user) {
      session.user.displayName = tempDisplayName;
      session.user.avatar = tempAvatar;
      localStorage.setItem('smartai_session', JSON.stringify(session));
    }
  };

  const copyReferralCode = () => {
    const code = getCurrentUserReferralData()?.referralCode;
    if (code) {
      navigator.clipboard.writeText(code);
      alert('Referral code copied to clipboard!');
    }
  };

  const handleSelectChat = (chatId: string) => {
    const chat = chatHistory.find(c => c.id === chatId);
    if (chat) {
      setCurrentChatId(chatId);
      setMessages(chat.messages);
    }
  };

  const updateCurrentChatHistory = (chatId: string, title: string, chatMessages: Message[]) => {
    setChatHistory(prev => {
      const exists = prev.some(chat => chat.id === chatId);
      const updated = exists
        ? prev.map(chat => chat.id === chatId ? { ...chat, title, messages: chatMessages } : chat)
        : [{ id: chatId, title, messages: chatMessages }, ...prev];

      localStorage.setItem('smartai_chat_history', JSON.stringify(updated));
      return updated;
    });
  };

  const buildContextualPrompt = (history: Message[], latestUserPrompt: string) => {
    const recentMessages = history
      .filter(m => m.content?.trim())
      .slice(-12)
      .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content.trim()}`)
      .join('\n');

    const contextualPrompt = [
      'Continue this conversation naturally.',
      'Remember previous user details/instructions from this chat and do not ask for same details again unless needed.',
      '',
      'Conversation history:',
      recentMessages || '(no previous context)',
      `User: ${latestUserPrompt}`,
      'Assistant:'
    ].join('\n');

    return contextualPrompt.slice(-7000);
  };

    // Streaming chat response (ChatGPT-style token-by-token UI)
    const handleSendMessage = async () => {
      const prompt = normalizePrompt(chatInput);
      if (!prompt || isAiThinking) return;

      // Check and process referral reward on first message
      processReferralReward();

      const userMsg: Message = { id: Date.now().toString(), role: 'user' as const, content: prompt };
      const assistantId = (Date.now() + 1).toString();
      const assistantMsg: Message = { id: assistantId, role: 'assistant' as const, content: '' };
      const optimisticMessages = [...messages, userMsg, assistantMsg];
      const title = prompt.length > 25 ? `${prompt.substring(0, 25)}...` : prompt;

      setMessages(optimisticMessages);
      setChatInput('');
      setIsAiThinking(true);
      updateCurrentChatHistory(currentChatId, title, optimisticMessages);

      const systemPrompt = 'You are a helpful AI assistant. Provide accurate and useful answers. If you are unsure, say clearly that you are unsure.';
      const contextualPrompt = buildContextualPrompt(messages, prompt);

      let renderedText = '';
      const appendWithTyping = async (text: string) => {
        const step = 6;
        for (let i = 0; i < text.length; i += step) {
          renderedText += text.slice(i, i + step);
          const partialText = renderedText;
          setIsAiThinking(false);
          setMessages(prev => prev.map(msg => msg.id === assistantId ? { ...msg, content: partialText } : msg));
          await new Promise(resolve => setTimeout(resolve, 10));
        }
      };

      const fetchLegacyChatText = async (seed: number, promptText: string) => {
        const legacyUrl = `/api/chat?prompt=${encodeURIComponent(promptText)}&seed=${seed}&system=${encodeURIComponent(systemPrompt)}&json=false`;
        const legacyRes = await fetch(legacyUrl, { method: 'GET', cache: 'no-store' });
        if (!legacyRes.ok) {
          const errText = (await legacyRes.text()).trim();
          throw new Error(errText || `Legacy chat request failed (${legacyRes.status})`);
        }
        return (await legacyRes.text()).trim();
      };

      const generateAssistantText = async (seed: number, promptText: string) => {
        renderedText = '';
        setMessages(prev => prev.map(msg => msg.id === assistantId ? { ...msg, content: '' } : msg));

        try {
          const response = await fetch('/api/chat/stream', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: promptText, seed, system: systemPrompt })
          });

          if (response.ok && response.body) {
            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
              const { value, done } = await reader.read();
              if (done) break;
              if (!value) continue;

              const chunk = decoder.decode(value, { stream: true });
              if (chunk) {
                await appendWithTyping(chunk);
              }
            }

            const tail = decoder.decode();
            if (tail) {
              await appendWithTyping(tail);
            }

            return renderedText.trim();
          }

          const legacyText = await fetchLegacyChatText(seed, promptText);
          await appendWithTyping(legacyText);
          return renderedText.trim();
        } catch {
          const legacyText = await fetchLegacyChatText(seed, promptText);
          await appendWithTyping(legacyText);
          return renderedText.trim();
        }
      };

      try {
        const seed = Math.floor(Math.random() * 0xFFFFFFFF);
        let finalText = '';

        try {
          finalText = await generateAssistantText(seed, contextualPrompt);
        } catch {
          finalText = await generateAssistantText(seed + 1, prompt);
        }

        finalText = finalText || 'Sorry, I could not generate a response right now.';
        const finalMessages = optimisticMessages.map(msg => msg.id === assistantId ? { ...msg, content: finalText } : msg);

        setMessages(finalMessages);
        updateCurrentChatHistory(currentChatId, title, finalMessages);
      } catch (error: any) {
        console.error('Chat stream error:', error);
        const fallbackText = `Maaf kijiye, abhi response generate nahi ho paaya. Aapka prompt: "${prompt}". Kripya dubara try karein.`;
        const fallbackMessages = optimisticMessages.map(msg => msg.id === assistantId ? { ...msg, content: fallbackText } : msg);
        setMessages(fallbackMessages);
        updateCurrentChatHistory(currentChatId, title, fallbackMessages);
      } finally {
        setIsAiThinking(false);
      }
    };

  const getDimensions = (quality: string, aspect: string): [number, number] => {
    const longEdge = { '720p': 512, '1080p': 768, '2K': 1024, '4K': 1024 }[quality] || 512;
    if (aspect === '1:1') return [longEdge, longEdge];
    if (aspect === '16:9') return [longEdge, Math.round(longEdge * 9 / 16)];
    if (aspect === '9:16') return [Math.round(longEdge * 9 / 16), longEdge];
    if (aspect === '4:3') return [longEdge, Math.round(longEdge * 3 / 4)];
    return [longEdge, longEdge];
  };

  const generateImageProxyUrl = (promptText: string, seedOverride?: number) => {
    const [w, h] = getDimensions(imgQuality, imgAspect);
    const fullPrompt = `${promptText}${imgStyle === 'realistic' ? '' : `, ${imgStyle} style`}${negativePrompt.trim() ? ` ### Negative: ${negativePrompt.trim()}` : ''}`;
    const seed = seedOverride ?? Math.floor(Math.random()*999999);
    const params = new URLSearchParams({
      width: String(w),
      height: String(h),
      seed: String(seed),
      model: 'flux',
      nologo: 'true'
    });
    return `/api/image?prompt=${encodeURIComponent(fullPrompt)}&${params.toString()}`;
  };

  const handleGenerateImage = async () => {
    const cleanedPrompt = normalizePrompt(imgPrompt);
    if (!cleanedPrompt || isGenerating) return;
    if (isStyleLocked(imgStyle)) { alert('This style requires Pro plan. Please upgrade to use it.'); setIsPricingOpen(true); return; }
    if (credits < 5) { alert('Insufficient credits (5 required).'); setIsPricingOpen(true); return; }

    // Capture current credits value synchronously to avoid stale closure bugs
    const startingCredits = credits;

    setIsGenerating(true);
    setGeneratedImg(null);

    const tryLoadImage = (url: string) => new Promise<boolean>((resolve) => {
      const img = new Image();
      img.decoding = 'async';
      img.loading = 'eager';
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });

    const baseSeed = Math.floor(Math.random() * 999999);
    const urls = [baseSeed, baseSeed + 1, baseSeed + 2].map(seed => {
      const proxyUrl = generateImageProxyUrl(cleanedPrompt, seed);
      return `${proxyUrl}&t=${Date.now()}-${seed}&nocache=1`;
    });

    let finalUrl: string | null = null;
    for (const candidate of urls) {
      const ok = await tryLoadImage(candidate);
      if (ok) {
        finalUrl = candidate;
        break;
      }
    }

    if (!finalUrl) {
      setIsGenerating(false);
      alert('Image generation failed. Kripya prompt thoda detail me likhein aur dubara try karein.');
      return;
    }

    // Deduct credits ONLY after successful generation to avoid stale-closure bugs
    const newCredits = startingCredits - 5;
    setCredits(newCredits);
    syncUserData({ credits: newCredits });

    setGeneratedImg(finalUrl);
    setIsGenerating(false);
    const newItem = { url: finalUrl, prompt: cleanedPrompt, style: imgStyle, quality: imgQuality, aspect: imgAspect, date: new Date().toLocaleString() };
    const newHistory = [newItem, ...imageHistory].slice(0, 50);
    setImageHistory(newHistory);
    localStorage.setItem('smartai_image_history', JSON.stringify(newHistory));
  };

  const handleEnhancePrompt = async () => {
    if (!imgPrompt.trim() || isEnhancing) return;
    setIsEnhancing(true);
    try {
      const systemPrompt = "You are a prompt engineering expert. Expand the user's short image prompt into a highly detailed, descriptive, and artistic prompt. Keep it under 400 characters. Return ONLY the expanded prompt.";
      const seed = Math.floor(Math.random() * 0xFFFFFFFF);
      const url = `/api/chat?prompt=${encodeURIComponent(`Expand this prompt: ${imgPrompt}`)}&seed=${seed}&system=${encodeURIComponent(systemPrompt)}&json=false`;
      const res = await fetch(url);
      if (res.ok) {
        const text = await res.text();
        if (text.trim()) setImgPrompt(text.trim());
      }
    } catch (e) {
      console.error('Enhance prompt failed:', e);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!videoPrompt.trim() || isGeneratingVideo) return;
    if (credits < 50) { alert('Insufficient credits (50 required).'); setIsPricingOpen(true); return; }
    setIsGeneratingVideo(true);
    setTimeout(() => { setIsGeneratingVideo(false); alert('Demo: Real video generation is coming soon.'); }, 1500);
  };

  const handleSelectPlan = async (plan: (typeof PLANS)[number]) => {
    if (plan.name === 'Basic') { alert('You are already on the Basic plan.'); setIsPricingOpen(false); return; }
      // Removed session check for demo - payment will work without login issue
      const saved = localStorage.getItem('smartai_session');
      const user = saved ? JSON.parse(saved) : { email: 'demo@user.com' };
    try {
      // Fixed plan name and email values
      const res = await fetch('/api/payment/create-order', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ 
          plan: plan.name, 
          email: 'demo@payment.com' 
        }) 
      });
      const data = await res.json();
      if (!res.ok) { alert(data.error || 'Failed to create order'); return; }
      const options = {
        key: data.key_id, amount: data.amount, currency: data.currency,
        name: 'SmartAI Pro', description: `${plan.name} Plan Subscription`, order_id: data.order_id,
        handler: async (response: any) => {
          try {
            const verifyRes = await fetch('/api/payment/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ razorpay_order_id: response.razorpay_order_id, razorpay_payment_id: response.razorpay_payment_id, razorpay_signature: response.razorpay_signature, plan: plan.name, email: user.email }) });
            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.success) {
              const newCredits = verifyData.credits || (plan.name === 'Pro' ? 10000 : 999999);
              setCredits(newCredits); setPlan(plan.name as 'Pro' | 'Ultra');
              syncUserData({ credits: newCredits, plan: plan.name });
              alert(`Payment successful! You now have ${newCredits.toLocaleString()} credits.`);
              setIsPricingOpen(false);
            } else { alert(verifyData.error || 'Payment verification failed'); }
          } catch (e) { alert('Verification error'); }
        },
        prefill: { email: user.email }, theme: { color: '#4f46e5' }
      };
      const rzp = new (window as any).Razorpay(options); rzp.open();
    } catch (e) { alert('Payment initiation failed'); }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center p-4 font-sans">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md bg-slate-900/50 border border-slate-800 rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(79,70,229,0.3)]"><Zap className="text-white w-7 h-7 fill-white" /></div>
            <h1 className="text-3xl font-medium tracking-tight text-white italic">SmartAI <span className="font-light text-slate-400 not-italic">Pro</span></h1>
            <p className="text-slate-500 text-sm mt-2 font-serif italic text-center">Modern intelligence for the creative mind</p>
          </div>

          {authMode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">

              <div className="flex gap-2 mb-2">
                <button 
                  type="button" 
                  onClick={() => setLoginContactType('email')}
                  className={`flex-1 py-2 rounded-lg text-sm uppercase tracking-widest font-bold transition-all ${loginContactType === 'email' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                >
                  Email
                </button>
                <button 
                  type="button" 
                  onClick={() => setLoginContactType('mobile')}
                  className={`flex-1 py-2 rounded-lg text-sm uppercase tracking-widest font-bold transition-all ${loginContactType === 'mobile' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                >
                  Mobile
                </button>
              </div>

              {loginContactType === 'email' && (
              <div><label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Email Address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500/50 transition-all font-mono text-sm" placeholder="name@example.com" /></div>
              )}

              {loginContactType === 'mobile' && (
              <div><label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Mobile Number</label>
                <input type="tel" value={loginMobile} onChange={e => setLoginMobile(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500/50 transition-all font-mono text-sm" placeholder="+91 98765 43210" /></div>
              )}
              <div><label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:border-indigo-500/50 transition-all font-mono text-sm" 
                    placeholder="••••••••" 
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div className="pt-2 flex flex-col gap-3 text-sm uppercase tracking-widest font-bold">
                <button type="submit" disabled={isAuthenticating} className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-500 transition-all active:scale-95 shadow-lg shadow-indigo-600/20 disabled:opacity-50 flex items-center justify-center gap-2">{isAuthenticating ? 'Logging in...' : 'Login'}</button>
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 mt-2">
                <button type="button" onClick={() => setAuthMode('signup')} className="hover:text-indigo-400 transition-colors">Don't have an account? Sign Up</button>
                <button type="button" onClick={() => setAuthMode('forgot')} className="hover:text-indigo-400 transition-colors">Forgot Password?</button>
              </div>
            </form>
          )}

           {authMode === 'signup' && (
             <div className="space-y-3">
               <div><label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Full Name *</label>
                 <input type="text" required value={signupName} onChange={e => setSignupName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500/50 transition-all font-mono text-sm" placeholder="John Doe" /></div>
               
               <div className="flex gap-2 mb-2">
                 <button 
                   type="button" 
                   onClick={() => setSignupContactType('email')}
                   className={`flex-1 py-2 rounded-lg text-sm uppercase tracking-widest font-bold transition-all ${signupContactType === 'email' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                 >
                   Email
                 </button>
                 <button 
                   type="button" 
                   onClick={() => setSignupContactType('mobile')}
                   className={`flex-1 py-2 rounded-lg text-sm uppercase tracking-widest font-bold transition-all ${signupContactType === 'mobile' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                 >
                   Mobile
                 </button>
               </div>

               {signupContactType === 'email' && (
               <div><label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Email Address *</label>
                 <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500/50 transition-all font-mono text-sm" placeholder="name@example.com" /></div>
               )}

               {signupContactType === 'mobile' && (
               <div><label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Mobile Number *</label>
                 <input type="tel" value={signupMobile} onChange={e => setSignupMobile(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500/50 transition-all font-mono text-sm" placeholder="+91 98765 43210" /></div>
               )}
              <div><label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Password *</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:border-indigo-500/50 transition-all font-mono text-sm" 
                    placeholder="••••••••" 
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div><label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Confirm Password *</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required 
                    value={signupConfirmPassword} 
                    onChange={e => setSignupConfirmPassword(e.target.value)} 
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:border-indigo-500/50 transition-all font-mono text-sm" 
                    placeholder="••••••••" 
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div><label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Refer Code (Optional)</label>
                <input type="text" value={signupReferCode} onChange={e => setSignupReferCode(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500/50 transition-all font-mono text-sm" placeholder="Enter refer code" /></div>
              <div className="pt-2 flex flex-col gap-3 text-sm uppercase tracking-widest font-bold">
                <button onClick={handleSignup} disabled={isAuthenticating} className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-500 transition-all active:scale-95 shadow-lg shadow-indigo-600/20 disabled:opacity-50 flex items-center justify-center gap-2">{isAuthenticating ? 'Creating account...' : 'Sign Up'}</button>
              </div>
              <div className="text-center text-[10px] text-slate-500 mt-2">
                <button onClick={() => setAuthMode('login')} className="hover:text-indigo-400 transition-colors">Already have an account? Login</button>
              </div>
            </div>
          )}

          {authMode === 'forgot' && (
            <div className="space-y-4">
              <div><label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Email</label>
                <input type="email" required value={resetEmail} onChange={e => setResetEmail(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500/50 transition-all font-mono text-sm" placeholder="name@example.com" /></div>
              <div><label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">New Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required 
                    value={newPassword} 
                    onChange={e => setNewPassword(e.target.value)} 
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:border-indigo-500/50 transition-all font-mono text-sm" 
                    placeholder="••••••••" 
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div className="pt-2 flex flex-col gap-3 text-sm uppercase tracking-widest font-bold">
                <button onClick={handleForgotPassword} disabled={isAuthenticating} className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-500 transition-all active:scale-95 shadow-lg shadow-indigo-600/20 disabled:opacity-50 flex items-center justify-center gap-2">Reset Password</button>
              </div>
              <div className="text-center text-[10px] text-slate-500 mt-2">
                <button onClick={() => setAuthMode('login')} className="hover:text-indigo-400 transition-colors">Back to Login</button>
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-slate-800 flex justify-between items-center text-slate-600"><Github className="w-4 h-4 cursor-pointer hover:text-white transition-colors" /><span className="text-[9px] uppercase tracking-[0.3em] font-mono">Kernel v2.4.0_Stable</span></div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex font-sans overflow-hidden">
      <AnimatePresence>
        {isPricingOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-3 sm:p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 md:p-8 max-w-sm sm:max-w-2xl md:max-w-4xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4 md:mb-8"><h2 className="text-xl sm:text-2xl md:text-3xl font-bold italic tracking-tight">Upgrade Your Neural Link</h2><button onClick={() => setIsPricingOpen(false)} className="p-2 hover:bg-white/5 rounded-full"><Plus className="w-5 h-5 md:w-6 md:h-6 rotate-45" /></button></div>
              <div className="grid md:grid-cols-3 gap-3 md:gap-6">
                {[{ name: "Basic", price: "Free", features: ["100 Credits","Standard Response","720p Energy"], color: "slate-400" },{ name: "Pro", price: "₹99", features: ["10,000 Credits","Expert Mode Enabled","2K Intelligence"], color: "indigo-500", popular: true },{ name: "Ultra", price: "₹199", features: ["Unlimited Pixels","Zero Latency","4K Imagination"], color: "emerald-500" }].map((plan) => (
                  <div key={plan.name} className={`p-3 sm:p-4 md:p-6 rounded-2xl border ${plan.popular ? "border-indigo-600 bg-indigo-600/5" : "border-slate-800 bg-slate-950/50"} relative flex flex-col`}>
                    {plan.popular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[8px] md:text-[9px] px-2 md:px-3 py-1 rounded-full uppercase tracking-widest font-bold">Most Popular</span>}
                    <h3 className="text-base sm:text-lg md:text-xl font-bold mb-1">{plan.name}</h3>
                    <div className="mb-2 md:mb-4"><span className="text-lg sm:text-xl md:text-2xl font-bold">{plan.price}</span><span className="text-slate-500 text-xs"> /month</span></div>
                    <ul className="space-y-1 md:space-y-3 mb-4 md:mb-8 flex-1">{plan.features.map(f => <li key={f} className="text-[10px] md:text-xs text-slate-400 flex items-center gap-2"><div className={`w-1 h-1 rounded-full bg-${plan.color}`}></div> {f}</li>)}</ul>
                    <button onClick={() => handleSelectPlan(plan)} className={`w-full py-2 md:py-3 rounded-xl font-bold text-[9px] md:text-[10px] uppercase tracking-widest transition-all ${plan.popular ? "bg-indigo-600 text-white" : "bg-white text-black hover:bg-slate-200"}`}>Select {plan.name}</button>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <aside className="hidden md:flex w-72 bg-slate-950 border-r border-slate-800 flex-col p-6 overflow-y-auto">
        <div className="flex items-center gap-3 mb-10"><div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white">S</div><span className="text-xl font-medium tracking-tight text-white">SmartAI <span className="font-light text-slate-400 italic">Pro</span></span></div>
        <div className="mb-8 p-4 bg-indigo-600/10 border border-indigo-600/20 rounded-2xl flex items-center justify-between">
          <div><span className="text-xs uppercase font-bold text-slate-500 tracking-widest">Credits</span><div className="text-2xl font-bold text-white mt-1">{credits.toLocaleString()}</div></div>
          <div className="w-10 h-10 bg-indigo-600/20 rounded-full flex items-center justify-center"><Sparkles className="w-5 h-5 text-indigo-400" /></div>
        </div>
        {activeTab === 'chat' && (
          <div className="mb-4">
            <button onClick={handleNewChat} className="w-full flex items-center gap-2 px-4 py-3 rounded-xl bg-indigo-600/10 border border-indigo-600/20 text-indigo-400 hover:bg-indigo-600/20 transition-all">
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">New Chat</span>
            </button>
            
            <div className="mt-4 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search chats..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-600"
              />
            </div>
            
            <div className="mt-3 space-y-1 max-h-60 overflow-y-auto">
              {chatHistory.filter(chat => chat.title.toLowerCase().includes(searchQuery.toLowerCase())).map((chat) => (
                <button 
                  key={chat.id} 
                  onClick={() => handleSelectChat(chat.id)} 
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all truncate ${currentChatId === chat.id ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                >
                  {chat.title}
                </button>
              ))}
            </div>
          </div>
        )}
        
        <nav className="space-y-2 flex-1">{SIDEBAR_ITEMS.map(item => (<button key={item.tab} onClick={() => setActiveTab(item.tab)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === item.tab ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-600/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}><item.icon className="w-5 h-5" /><span className="text-base font-medium">{item.name}</span></button>))}</nav>
        <div className="mt-auto pt-6 border-t border-slate-800">
          <button onClick={() => setIsPricingOpen(true)} className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-indigo-600/10 border border-indigo-600/20 text-indigo-400 hover:bg-indigo-600/20 transition-all text-[10px] font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" /> Upgrade Plan
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-20 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-950/50 backdrop-blur-sm">
          <div className="flex items-center gap-4 md:hidden"><div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white">S</div><span className="font-medium tracking-tight">SmartAI Pro</span></div>
          <div className="hidden md:flex items-center gap-2 bg-slate-900 rounded-lg p-1 border border-slate-800">{(['normal','creative','expert'] as SmartMode[]).map(mode => {
            const locked = mode === 'expert' && plan === 'Basic';
            return (<button key={mode} onClick={() => locked ? setIsPricingOpen(true) : setSmartMode(mode)} className={`relative px-4 py-1.5 rounded-md text-sm font-bold uppercase tracking-widest transition-all ${smartMode === mode ? 'bg-indigo-600 text-white' : locked ? 'text-slate-600 cursor-pointer opacity-60' : 'text-slate-500 hover:text-white'}`}>{mode}{locked && <span className="absolute -top-1.5 -right-1 bg-indigo-600 text-white text-[5px] px-1 rounded-full uppercase tracking-wider">PRO</span>}</button>);
          })}</div>
          <div className="flex items-center gap-4"><span className="text-xs text-slate-500 font-mono hidden sm:block">{email}</span><div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center text-sm font-bold text-slate-400 overflow-hidden">
                    {avatar ? <img src={avatar} alt="avatar" className="w-full h-full object-cover" /> : <span>{displayName.charAt(0).toUpperCase()}</span>}
                  </div></div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 pb-44 md:pb-6">
{activeTab === 'chat' && (
            <div className="max-w-3xl mx-auto h-full flex flex-col">
              <div className="flex-1 space-y-6 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Active Link</h2>
                  <button onClick={handleDownloadChat} className="flex items-center gap-2 text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors bg-indigo-600/5 px-3 py-1.5 rounded-lg border border-indigo-600/10">
                    <Download className="w-3 h-3" /> Export Chat
                  </button>
                </div>

                {messages.map((msg, idx) => (
                  <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[85%] p-4 rounded-2xl relative group ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-900 border border-slate-800 text-slate-300'}`}>
                      <p className="text-base leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      
                      {msg.role === 'assistant' && (
                        <div className="absolute -bottom-6 left-0 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all">
                          <button onClick={() => copyToClipboard(msg.content, 'code')} title="Copy Message" className="text-slate-500 hover:text-white transition-colors">
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          {idx === messages.length - 1 && (
                            <button onClick={handleRegenerateResponse} title="Regenerate Response" className="text-slate-500 hover:text-white transition-colors">
                              <RefreshCcw className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
                {isAiThinking && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start"><div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl"><div className="flex gap-1"><motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-2 h-2 bg-indigo-500 rounded-full" /><motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-2 h-2 bg-indigo-500 rounded-full" /><motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-2 h-2 bg-indigo-500 rounded-full" /></div></div></motion.div>)}
<div ref={chatEndRef} /></div>
              {smartMode === 'expert' && plan !== 'Basic' && (

                <div className="mb-2">
                  {attachedImage && (
                    <div className="relative inline-block mr-2 mb-2">
                      <img src={attachedImage} alt="Attached" className="w-20 h-20 object-cover rounded-xl border border-slate-700" />
                      <button onClick={() => { setAttachedImage(null); setAttachedFile(null); }} className="absolute -top-2 -right-2 w-5 h-5 bg-red-600 rounded-full text-white text-xs flex items-center justify-center">×</button>
                    </div>
                  )}
                </div>
              )}
              
              {showPrompts && messages.length <= 1 && (
                <div className="mb-4 overflow-x-auto whitespace-nowrap pb-2 flex gap-2 no-scrollbar">
                  {SUGGESTED_PROMPTS.map((p, i) => (
                    <button key={i} onClick={() => setChatInput(p)} className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-full text-[10px] font-medium text-slate-400 hover:text-white hover:border-indigo-600/50 transition-all">
                      {p}
                    </button>
                  ))}
                  <button onClick={() => setShowPrompts(false)} className="text-slate-600 hover:text-white px-2">×</button>
                </div>
              )}

              <div className="fixed bottom-[4.5rem] left-0 right-0 md:sticky md:bottom-0 bg-transparent md:bg-slate-950/80 md:backdrop-blur-sm pb-2 md:pb-4 px-4 md:px-0 z-30">
                <div className="flex gap-2 items-end bg-slate-900 border border-slate-800 rounded-2xl p-2">
                  
                  {smartMode === 'expert' && plan !== 'Basic' && (
                    <>
                      <input type="file" ref={chatFileInput} accept="image/*,.pdf,.txt,.docx,.xlsx" className="hidden" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setAttachedFile(file);
                          if (file.type.startsWith('image/')) {
                            const reader = new FileReader();
                            reader.onload = (ev) => setAttachedImage(ev.target?.result as string);
                            reader.readAsDataURL(file);
                          }
                        }
                      }} />
                      <button onClick={() => chatFileInput.current?.click()} className="bg-slate-800 hover:bg-slate-700 text-slate-400 p-3 rounded-xl transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                      </button>
                    </>
                  )}
                  
                  <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSendMessage();
                    }
                  }} placeholder="Enter your prompt..." className="flex-1 bg-transparent px-4 py-3 text-sm outline-none placeholder:text-slate-600 z-[9999] pointer-events-auto cursor-text" autoComplete="off" />
                  
                  <button onClick={startListening} title="Voice Input" className={`p-3 rounded-xl transition-all ${isListening ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
                    <Mic className="w-4 h-4" />
                  </button>

                  <button onClick={handleSendMessage} disabled={isAiThinking || !chatInput.trim()} title="Send Message" className="bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"><Send className="w-4 h-4" /></button>
                </div>
                {smartMode === 'expert' && plan !== 'Basic' && <div className="text-center mt-2"><span className="ml-3 text-green-500">✓ File Upload Enabled (PRO)</span></div>}
              </div>
            </div>
          )}

          {activeTab === 'image' && (
            <div className="max-w-3xl mx-auto pb-20">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 mb-8 relative">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-3xl font-bold italic tracking-tight">Image Synthesis</h2>
                  <button 
                    onClick={handleEnhancePrompt} 
                    disabled={isEnhancing || !imgPrompt.trim()}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${isEnhancing ? 'bg-indigo-600 animate-pulse text-white' : 'bg-indigo-600/10 text-indigo-400 border border-indigo-600/20 hover:bg-indigo-600/20'}`}
                  >
                    <Sparkles className="w-3.5 h-3.5" /> {isEnhancing ? 'Enhancing...' : 'Magic Prompt'}
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs uppercase font-bold text-slate-500 tracking-widest block mb-2">Prompt</label>
                    <textarea value={imgPrompt} onChange={e => setImgPrompt(e.target.value)} placeholder="Describe the image you want to generate..." className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-base h-32 resize-none outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-600" />
                  </div>

                  <div>
                    <label className="text-xs uppercase font-bold text-slate-500 tracking-widest block mb-2">Negative Prompt (Optional)</label>
                    <textarea value={negativePrompt} onChange={e => setNegativePrompt(e.target.value)} placeholder="What to exclude? (e.g. blurry, low quality, text...)" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm h-20 resize-none outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-600" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 mb-6">
                  <div>
                    <label className="text-xs uppercase font-bold text-slate-500 tracking-widest block mb-2">Aspect Ratio</label>
                    <select value={imgAspect} onChange={e => setImgAspect(e.target.value as any)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500/50 transition-all appearance-none cursor-pointer">
                      {ASPECTS.map(a => (<option key={a} value={a}>{a}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs uppercase font-bold text-slate-500 tracking-widest block mb-2">Style</label>
                    <select value={imgStyle} onChange={e => {
                      const s = e.target.value;
                      if (isStyleLocked(s)) { setIsPricingOpen(true); } else { setImgStyle(s); }
                    }} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500/50 transition-all appearance-none cursor-pointer">
                      {STYLES.map(s => {
                        const locked = isStyleLocked(s);
                        return (<option key={s} value={s} className={locked ? 'text-slate-600' : 'text-white'}>{s}{locked ? ' 🔒 PRO' : PREMIUM_STYLES.includes(s) && plan === 'Basic' ? ' ⭐' : ''}</option>);
                      })}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs uppercase font-bold text-slate-500 tracking-widest block mb-2">Quality</label>
<select value={imgQuality} onChange={e => {
                      const q = e.target.value;
                      const locked = (q === '2K' || q === '4K') && plan === 'Basic';
                      if (locked) { setIsPricingOpen(true); } else { setImgQuality(q); }
                    }} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500/50 transition-all appearance-none cursor-pointer">
                      {['720p','1080p','2K','4K'].map((q: string) => {
                        const locked = (q === '2K' || q === '4K') && plan === 'Basic';
                        return (<option key={q} value={q} className={locked ? 'text-slate-600' : 'text-white'}>{q}{locked ? ' 🔒 PRO' : ''}</option>);
                      })}
                    </select>
                  </div>
                </div>
                <button onClick={handleGenerateImage} disabled={isGenerating || !imgPrompt.trim()} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-xl font-bold text-base uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {isGenerating ? (
                    <div className="flex gap-1">
                      <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-2 h-2 bg-white rounded-full" />
                      <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-2 h-2 bg-white rounded-full" />
                      <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  ) : 'Synthesize Image (5 credits)'}
                </button>
              </div>
              
              {generatedImg && (<motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative group mb-10"><img src={generatedImg} alt="Generated" className="w-full rounded-3xl border border-slate-800 shadow-2xl" /><a href={generatedImg} download className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm p-3 rounded-xl opacity-0 group-hover:opacity-100 transition-all"><Download className="w-5 h-5 text-white" /></a></motion.div>)}
              
              {imageHistory.length > 0 && (
                <div className="mt-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold italic tracking-tight text-white">Art Gallery</h3>
                    <button onClick={() => setShowHistory(!showHistory)} className="text-xs uppercase tracking-widest font-bold text-indigo-400 hover:text-indigo-300 transition-colors bg-indigo-600/10 px-4 py-2 rounded-full border border-indigo-600/20">{showHistory ? 'Collapse' : 'Expand All'}</button>
                  </div>
                  <div className={`grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 ${showHistory ? '' : 'max-h-[32rem] overflow-hidden relative'}`}>
                    {!showHistory && <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-950 to-transparent z-10" />}
                    {imageHistory.map((item, i) => (
                      <motion.div key={i} whileHover={{ y: -5 }} className="relative group rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-lg">
                        <img src={item.url} alt={item.prompt} className="w-full aspect-square object-cover" loading="lazy" />
                        <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-all flex flex-col justify-end p-4">
                          <p className="text-[10px] text-white line-clamp-3 mb-3 leading-relaxed italic">"{item.prompt}"</p>
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">{item.style} • {item.quality}</span>
                            <a href={item.url} download className="bg-white text-black p-2 rounded-lg hover:bg-slate-200 transition-colors"><Download className="w-3.5 h-3.5" /></a>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="mt-12 pt-12 border-t border-slate-800">
                <p className="text-center text-[10px] uppercase font-bold text-slate-600 tracking-[0.3em] mb-4">Advertisement</p>
                <AdBanner />
              </div>
            </div>
          )}



{activeTab === 'video' && (
            <div className="max-w-3xl mx-auto">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">
                <h2 className="text-2xl font-bold mb-6 italic tracking-tight">Neural Motion</h2>
                <textarea value={videoPrompt} onChange={e => setVideoPrompt(e.target.value)} placeholder="Describe the video you want to generate..." className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm h-32 resize-none outline-none focus:border-indigo-500/50 transition-all mb-4 placeholder:text-slate-600" />
                <button onClick={handleGenerateVideo} disabled={isGeneratingVideo || !videoPrompt.trim()} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-xl font-bold text-sm uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2">{isGeneratingVideo ? 'Rendering...' : 'Generate Video (10 credits)'}</button>
                <p className="text-center mt-3 text-xs text-indigo-400 font-bold uppercase tracking-widest">Coming Soon</p>
              </div>
              <div className="mt-6"><AdBanner /></div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="max-w-4xl mx-auto space-y-6 pb-20">
              {/* Header Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 blur-3xl rounded-full -mr-16 -mt-16" />
                <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                  <div className="relative group">
                    <div className="w-28 h-28 bg-indigo-600 rounded-full flex items-center justify-center text-4xl font-bold text-white shadow-2xl overflow-hidden border-4 border-slate-800">
                      {avatar ? <img src={avatar} alt="avatar" className="w-full h-full object-cover" /> : <span>{displayName.charAt(0).toUpperCase()}</span>}
                    </div>
                    <button 
                      onClick={() => {
                        setTempDisplayName(displayName);
                        setTempAvatar(avatar);
                        setIsEditingProfile(true);
                      }}
                      className="absolute bottom-0 right-0 bg-indigo-500 hover:bg-indigo-400 text-white p-2 rounded-lg shadow-lg transition-all"
                    >
                      <User className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h2 className="text-3xl font-bold text-white mb-1 flex items-center justify-center md:justify-start gap-3">
                      {displayName}
                      <span className={`text-[10px] uppercase px-2 py-0.5 rounded-full ${plan === 'Basic' ? 'bg-slate-800 text-slate-500' : 'bg-indigo-600 text-white animate-pulse'}`}>{plan}</span>
                    </h2>
                    <p className="text-slate-400 text-lg mb-3">{email}</p>
                    <div className="flex items-center justify-center md:justify-start gap-4">
                      <span className="bg-indigo-600/10 text-indigo-400 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-indigo-600/20">Member Since May 2024</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Editing Modal Logic */}
              {isEditingProfile && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900 border border-indigo-600/30 rounded-3xl p-8 shadow-2xl">
                  <h3 className="text-xl font-bold mb-6 italic tracking-tight text-white">Edit Profile</h3>
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="text-xs uppercase font-bold text-slate-500 tracking-widest block mb-2">Display Name</label>
                      <input type="text" value={tempDisplayName} onChange={e => setTempDisplayName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500/50 transition-all" />
                    </div>
                    <div>
                      <label className="text-xs uppercase font-bold text-slate-500 tracking-widest block mb-2">Avatar URL</label>
                      <input type="text" value={tempAvatar} onChange={e => setTempAvatar(e.target.value)} placeholder="https://example.com/avatar.jpg" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500/50 transition-all" />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={handleUpdateProfile} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-bold transition-all">Save Changes</button>
                    <button onClick={() => setIsEditingProfile(false)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl font-bold transition-all">Cancel</button>
                  </div>
                </motion.div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Subscription Card */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-indigo-600/20 rounded-xl flex items-center justify-center"><CreditCard className="w-5 h-5 text-indigo-400" /></div>
                    <h3 className="text-lg font-bold text-white">Subscription</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-slate-950 rounded-2xl border border-slate-800/50">
                      <span className="text-slate-500 text-sm">Available Credits</span>
                      <span className="text-2xl font-bold text-white">{credits.toLocaleString()}</span>
                    </div>
                    <button onClick={() => setIsPricingOpen(true)} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2">
                      <Sparkles className="w-4 h-4" /> {plan === 'Basic' ? 'Upgrade to Pro' : 'Manage Subscription'}
                    </button>
                  </div>
                </div>

                {/* Referral Card */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-green-600/20 rounded-xl flex items-center justify-center"><Zap className="w-5 h-5 text-green-400" /></div>
                    <h3 className="text-lg font-bold text-white">Refer & Earn</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800/50">
                      <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-2">Your Referral Code</p>
                      <div className="flex items-center justify-between">
                        <code className="text-lg font-bold text-indigo-400">{getCurrentUserReferralData()?.referralCode || 'N/A'}</code>
                        <button onClick={copyReferralCode} className="text-slate-400 hover:text-white transition-colors"><Copy className="w-4 h-4" /></button>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-500 text-center">Share this code to earn 100 bonus credits for every successful signup!</p>
                  </div>
                </div>
              </div>

              {/* Usage Stats Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-amber-600/20 rounded-xl flex items-center justify-center"><Sparkles className="w-5 h-5 text-amber-400" /></div>
                  <h3 className="text-lg font-bold text-white">Usage Analytics</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800/50 text-center">
                    <p className="text-2xl font-bold text-white mb-1">{messages.filter(m => m.role === 'user').length}</p>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Prompts Sent</p>
                  </div>
                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800/50 text-center">
                    <p className="text-2xl font-bold text-white mb-1">{imageHistory.length}</p>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Images Created</p>
                  </div>
                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800/50 text-center">
                    <p className="text-2xl font-bold text-white mb-1">0</p>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Videos Rendered</p>
                  </div>
                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800/50 text-center">
                    <p className="text-2xl font-bold text-white mb-1">{credits < 500 ? 'Level 1' : 'Level 2'}</p>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">User Rank</p>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={() => setActiveTab('chat')} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2">
                  <MessageSquare className="w-4 h-4" /> Go to Workspace
                </button>
                <button onClick={handleLogout} className="flex-1 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-600/20 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2">
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </div>
          )}

          {activeTab === 'admin' && (
            <div className="max-w-3xl mx-auto">
              <AdminPanel />
              <AdBanner />
            </div>
          )}
        </div>
      </main>

      {/* Mobile Ad Banner - Only show when NOT on chat tab */}
      {activeTab !== 'chat' && (
        <div className="md:hidden fixed bottom-16 left-0 right-0 z-30 bg-slate-950 border-t border-slate-800">
          <AdBanner />
        </div>
      )}

      {/* Mobile Bottom Panel - Sidebar Content */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/30 backdrop-blur-md border-t border-slate-800/30 p-2 md:p-4">
        <div className="flex items-center justify-between mb-1 md:mb-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 md:w-6 md:h-6 bg-indigo-600 rounded-md flex items-center justify-center font-bold text-white text-[10px] md:text-xs">S</div>
            <span className="text-xs md:text-sm font-medium tracking-tight text-white">SmartAI <span className="font-light text-slate-400 italic">Pro</span></span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 text-indigo-400" />
            <span className="text-sm md:text-lg font-bold text-white">{credits.toLocaleString()}</span>
            <span className="text-[8px] md:text-[9px] text-slate-500 uppercase tracking-widest">credits</span>
          </div>
        </div>
        <nav className="flex justify-around">
          {SIDEBAR_ITEMS.map(item => (
            <button key={item.tab} onClick={() => setActiveTab(item.tab)} className={`flex flex-col items-center gap-0.5 md:gap-1 px-2 py-1 md:px-3 md:py-2 rounded-xl transition-all ${activeTab === item.tab ? 'text-indigo-400 bg-indigo-600/10 border border-indigo-600/20' : 'text-slate-400 hover:text-white'}`}>
              <item.icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
              <span className="text-[11px] md:text-sm font-medium">{item.name}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
