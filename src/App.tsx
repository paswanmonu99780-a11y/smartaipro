import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Image as ImageIcon, LogOut, Send, Plus, Zap, Sparkles, Github, Download, Video, User, CreditCard, Eye, EyeOff, Shield, Copy, Check, Search, Mic, RefreshCcw, Menu, X, ArrowLeft, ChevronUp, ChevronDown, FileText, Code, Lightbulb, PenTool, Database, Layout, TrendingUp, Mic2, FileSearch, Layers, Cpu, FastForward, Monitor, Globe, Network, Crown, Clock, CloudSun, Radio, Instagram, Lock as LockIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import AdminPanel from './AdminPanel';

type Tab = 'chat' | 'image' | 'video' | 'profile' | 'admin';
type SmartMode = 'normal' | 'creative' | 'expert';
interface Message { id: string; role: 'user' | 'assistant'; content: string; }

const SIDEBAR_ITEMS = [
  { name: 'Conversation', icon: MessageSquare, tab: 'chat' as Tab },
  { name: 'Creation', icon: ImageIcon, tab: 'image' as Tab },
  { name: 'Neural Motion', icon: Video, tab: 'video' as Tab },
  { name: 'Expert Tools', icon: Shield, tab: 'chat' as Tab, badge: 'PRO' },
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
  { name: 'Basic', price: 'Free', features: ['100 Credits', 'Standard Response', '720p Energy'], color: 'slate-400' },
  { name: 'Pro', price: '₹99', features: ['10,000 Credits', 'Expert Mode Enabled', '2K Intelligence'], color: 'indigo-500', popular: true },
  { name: 'Ultra', price: '₹199', features: ['Unlimited Pixels', 'Zero Latency', '4K Imagination'], color: 'emerald-500' },
];

const ASPECTS = ['1:1', '16:9', '9:16', '4:3'] as const;
const STYLES = ['realistic', 'anime', 'oil painting', 'cyberpunk', 'minimalist', '3d render', 'minecraft'];

const CREATIVE_TOOLS = [
  { id: 'chat', name: 'AI Chat', desc: 'Chat with AI', icon: MessageSquare, free: true },
  { id: 'templates', name: 'Templates', desc: '20+ Free Templates', icon: Copy, free: true },
  { id: 'writer', name: 'AI Writer', desc: 'Blog, Essay, Stories', icon: PenTool, free: true },
  { id: 'code', name: 'Code Generator', desc: 'Generate Code', icon: Code, free: true },
  { id: 'summarizer', name: 'Summarizer', desc: 'Summarize Text', icon: FileText, free: true },
  { id: 'idea', name: 'Idea Generator', desc: 'Generate Ideas', icon: Lightbulb, free: true },
  { id: 'image', name: 'AI Image', desc: 'Generate Images', icon: ImageIcon, free: true },
  { id: 'export', name: 'Export & Copy', desc: 'Download / Copy', icon: Download, free: true },
];

const EXPERT_TOOLS = [
  { id: 'agent', name: 'AI Agent', icon: Zap, desc: 'Autonomous goal execution.', category: 'AI Tools', color: '#a855f7' },
  { id: 'memory', name: 'Neural Memory', icon: Database, desc: 'Personalized AI memory.', category: 'AI Tools', color: '#3b82f6' },
  { id: 'video', name: 'Video Gen', icon: Video, desc: 'Text-to-video rendering.', category: 'Image Tools', color: '#ec4899' },
  { id: 'reverse', name: 'Reverse Prompt', icon: RefreshCcw, desc: 'Extract prompts from images.', category: 'Image Tools', color: '#10b981' },
  { id: 'builder', name: 'Web Architect', icon: Layout, desc: 'Full website builder.', category: 'Business Tools', color: '#f59e0b' },
  { id: 'business', name: 'Growth Core', icon: TrendingUp, desc: 'Marketing strategies.', category: 'Business Tools', color: '#22c55e' },
  { id: 'voice', name: 'Voice Clone', icon: Mic2, desc: 'Neural voice cloning.', category: 'AI Tools', color: '#d946ef' },
  { id: 'codemaster', name: 'Code Master', icon: Code, desc: 'Autonomous coding.', category: 'AI Tools', color: '#0ea5e9' },
  { id: 'data', name: 'Live Data', icon: Globe, desc: 'Real-time intelligence.', category: 'Business Tools', color: '#3b82f6' },
  { id: 'social', name: 'Social Pilot', icon: Instagram, desc: 'Social media growth.', category: 'Business Tools', color: '#facc15' },
  { id: 'writing', name: 'Pro Writer', icon: PenTool, desc: 'Expert content gen.', category: 'AI Tools', color: '#f43f5e' },
  { id: 'security', name: 'Secure Vault', icon: LockIcon, desc: 'Encrypted data storage.', category: 'Business Tools', color: '#8b5cf6' },
  { id: 'analytics', name: 'Neural Stats', icon: TrendingUp, desc: 'Performance analytics.', category: 'Business Tools', color: '#14b8a6' },
  { id: 'translation', name: 'Polyglot AI', icon: Globe, desc: 'Real-time translation.', category: 'AI Tools', color: '#6366f1' },
  { id: 'meeting', name: 'Meeting Pro', icon: MessageSquare, desc: 'Meeting notes & tasks.', category: 'Business Tools', color: '#f97316' },
  { id: 'smart_search', name: 'Smart Search', icon: Search, desc: 'Live data search.', category: 'Business Tools', color: '#8b5cf6' },
  { id: 'api', name: 'API System', icon: Network, desc: 'API integration.', category: 'Business Tools', color: '#f59e0b' },
];

const TEMPLATES = [
  { name: 'Blog Post', prompt: 'Write a detailed blog post about [topic] with an engaging title, introduction, subheadings, and conclusion.', icon: FileText },
  { name: 'Instagram Caption', prompt: 'Create 5 catchy Instagram captions for a photo of [subject] using relevant hashtags and emojis.', icon: MessageSquare },
  { name: 'Email Draft', prompt: 'Draft a professional email to [recipient] regarding [subject], maintaining a [tone] tone.', icon: MessageSquare },
  { name: 'Code Debugger', prompt: 'Analyze and fix the following code: [code snippet]. Explain what was wrong and how to avoid it.', icon: Code },
  { name: 'Product Description', prompt: 'Write a compelling product description for [product] that highlights its key benefits and features.', icon: PenTool },
  { name: 'SEO Keywords', prompt: 'Generate a list of high-ranking SEO keywords for [niche] and explain how to use them.', icon: Search },
  { name: 'YouTube Script', prompt: 'Write an engaging YouTube video script about [topic], including a strong hook, intro, main points, and outro.', icon: Video },
  { name: 'Tweet Thread', prompt: 'Create a viral Twitter thread (5-7 tweets) about [topic] with a strong hook and relevant emojis.', icon: MessageSquare },
  { name: 'Cover Letter', prompt: 'Write a professional cover letter for the role of [job title] at [company name], highlighting [skills].', icon: FileText },
  { name: 'Resume Summary', prompt: 'Write a powerful resume summary for a [profession] with [X] years of experience in [skills].', icon: FileText },
  { name: 'Business Idea', prompt: 'Generate 3 innovative business ideas in the [industry] sector with a low starting budget.', icon: Lightbulb },
  { name: 'Marketing Strategy', prompt: 'Create a 30-day marketing strategy for a new [product/service] launching next month.', icon: Search },
  { name: 'Interview Questions', prompt: 'List 10 tough interview questions for a [role] position and provide tips on how to answer them.', icon: User },
  { name: 'Story Outline', prompt: 'Create a detailed outline for a short story in the [genre] genre, including character profiles and plot twists.', icon: PenTool },
  { name: 'Poem Generator', prompt: 'Write a beautiful and emotional poem about [topic] in the style of [poet/style].', icon: PenTool },
  { name: 'Diet Plan', prompt: 'Create a 7-day healthy diet plan for someone who wants to [goal] and prefers [diet type] food.', icon: Lightbulb },
  { name: 'Workout Routine', prompt: 'Design a beginner-friendly [duration]-minute workout routine focusing on [body part/goal].', icon: Lightbulb },
  { name: 'Study Schedule', prompt: 'Create an effective study schedule for a student preparing for [exam] in [timeframe].', icon: FileText },
  { name: 'Joke Generator', prompt: 'Tell me 5 hilarious jokes about [topic] that are clean and family-friendly.', icon: MessageSquare },
  { name: 'Travel Itinerary', prompt: 'Plan a [number]-day travel itinerary for a trip to [destination], including top sights and food spots.', icon: FileText },
  { name: 'Recipe Creator', prompt: 'Give me a unique recipe using these ingredients: [ingredient 1, ingredient 2, ingredient 3].', icon: Lightbulb },
  { name: 'Game Generator', prompt: 'Create an advanced, high-quality, and visually stunning [game type] game (e.g., Space Shooter, Platformer, Racing) using HTML, CSS, and JavaScript. Include professional graphics with CSS effects, smooth animations, and full keyboard/touch controls. Make it look modern and highly addictive!', icon: Zap },
];

const IconComponent = ({ icon: Icon, className }: { icon: any, className?: string }) => <Icon className={className || "w-full h-full"} />;

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
  const [chatHistory, setChatHistory] = useState<Array<{ id: string, title: string, messages: Message[] }>>([]);
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
  const [imageHistory, setImageHistory] = useState<Array<{ url: string; prompt: string; style: string; quality: string; aspect: string; date: string }>>([]);
  const [showHistory, setShowHistory] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [creativeSubTab, setCreativeSubTab] = useState<string>('image');
  const [imagesLeftToday, setImagesLeftToday] = useState(18);
  const [creativeToolInput, setCreativeToolInput] = useState('');
  const [creativeToolResult, setCreativeToolResult] = useState('');
  const [isCreativeToolThinking, setIsCreativeToolThinking] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [creativeHistory, setCreativeHistory] = useState<Array<{ tool: string; toolName: string; input: string; result: string; time: string }>>([]);
  const [activeExpertTool, setActiveExpertTool] = useState<string | null>(null);
  const [expertCategory, setExpertCategory] = useState<string>('All');
  const [expertToolInput, setExpertToolInput] = useState('');
  const [expertToolResult, setExpertToolResult] = useState('');
  const [isExpertToolThinking, setIsExpertToolThinking] = useState(false);
  const isAdmin = localStorage.getItem('smartai_admin_session') === 'active';
  const isExpertLocked = plan === 'Basic' && !isAdmin;

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

  const getUsers = (): Array<{ email: string; password: string; credits: number; plan: string; displayName: string; avatar: string; name: string; mobile: string; referCode: string; referralCode: string; referredBy: string; referralRewarded: boolean; deviceId: string; referralEarnings: number }> => {
    const data = localStorage.getItem('smartai_users');
    return data ? JSON.parse(data) : [];
  };
  const saveUsers = (users: Array<{ email: string; password: string; credits: number; plan: string; displayName: string; avatar: string; name: string; mobile: string; referCode: string; referralCode: string; referredBy: string; referralRewarded: boolean; deviceId: string; referralEarnings: number }>) => {
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
  const syncUserData = (updates: Partial<{ credits: number; plan: string; displayName: string; avatar: string; referralRewarded: boolean; referralEarnings: number }>) => {
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
    syncUserData({ displayName: tempDisplayName, avatar: tempAvatar });
    setDisplayName(tempDisplayName);
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
  const avatarColors = ['bg-indigo-600', 'bg-emerald-600', 'bg-rose-600', 'bg-amber-600', 'bg-cyan-600', 'bg-violet-600'];
  const PREMIUM_STYLES = ['anime', 'cyberpunk', 'minecraft'];
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

  const renderExpertPro = () => {
    const selectedTool = EXPERT_TOOLS.find(t => t.id === activeExpertTool) || EXPERT_TOOLS[0];
    const tool = selectedTool;
    const categories = ['All', 'AI Tools', 'Image Tools', 'Business Tools'];
    const filteredTools = expertCategory === 'All' ? EXPERT_TOOLS : EXPERT_TOOLS.filter(t => t.category === expertCategory);

    if (isExpertLocked) {
      return (
        <div className="h-full flex items-center justify-center p-8 bg-[#0a0a0c] relative overflow-hidden">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/10 blur-[150px] rounded-full pointer-events-none" />
           <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full bg-[#16161d] border border-slate-800/50 p-12 rounded-[3.5rem] text-center relative z-10 shadow-2xl">
              <div className="w-24 h-24 bg-indigo-600/20 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-indigo-600/30">
                 <Shield className="w-10 h-10 text-indigo-400" />
              </div>
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">Neural Lock Active</h2>
              <p className="text-slate-400 font-medium leading-relaxed mb-10 text-sm">Expert Suite is restricted to verified Pro accounts. Admins can bypass this lock via the Neural Command Panel.</p>
              <div className="space-y-4">
                 <button onClick={() => setIsPricingOpen(true)} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-indigo-600/30 hover:scale-105 transition-all">Upgrade to Pro</button>
                 <button onClick={() => setActiveTab('admin')} className="w-full py-5 bg-slate-800 text-slate-400 rounded-2xl font-black uppercase tracking-widest text-xs hover:text-white transition-all">Admin Bypass</button>
              </div>
           </motion.div>
        </div>
      );
    }

    if (!activeExpertTool) {
      return (
        <div className="h-full flex flex-col overflow-hidden p-8 bg-[#0a0a0c] custom-scrollbar">
           <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-6">
                 <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Mission Control</h2>
                 <div className="flex bg-[#16161d] p-1.5 rounded-2xl border border-slate-800/50 shadow-inner">
                    {categories.map(cat => (
                      <button key={cat} onClick={() => setExpertCategory(cat)} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${expertCategory === cat ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-white'}`}>{cat}</button>
                    ))}
                 </div>
              </div>
              <div className="flex items-center gap-4 text-slate-500">
                 <div className="flex items-center gap-2 px-4 py-2 bg-indigo-600/5 border border-indigo-500/10 rounded-xl"><div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" /><span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">15 Expert Nodes Online</span></div>
              </div>
           </div>

           <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 h-full content-start">
                 {filteredTools.map((t, idx) => (
                   <motion.button key={t.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }} onClick={() => setActiveExpertTool(t.id)} className="group relative aspect-[1.1/1] bg-[#16161d] border border-slate-800/50 rounded-[2rem] p-6 text-left transition-all hover:scale-[1.02] hover:border-indigo-500/50 hover:shadow-[0_0_30px_rgba(79,70,229,0.1)] overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-600/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="relative z-10 h-full flex flex-col justify-between">
                         <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-800/50 group-hover:border-indigo-500/30 group-hover:bg-indigo-600/10 transition-all">
                            <t.icon className="w-6 h-6 text-slate-400 transition-colors" style={{ color: t.color }} />
                         </div>
                         <div>
                            <div className="text-xs font-black text-white uppercase tracking-widest mb-1 group-hover:text-indigo-400 transition-colors">{t.name}</div>
                            <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">{t.category}</div>
                         </div>
                      </div>
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all">
                         <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center"><Zap className="w-3 h-3 text-white" /></div>
                      </div>
                   </motion.button>
                 ))}
              </div>
           </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col h-full overflow-hidden bg-[#0a0a0c]">
        <div className="flex items-center justify-between px-8 py-5 bg-[#16161d] border-b border-slate-800/50 backdrop-blur-xl sticky top-0 z-20">
          <div className="flex items-center gap-5">
            <button onClick={() => setActiveExpertTool(null)} className="p-2.5 text-slate-400 hover:text-white transition-all bg-slate-800/50 rounded-2xl hover:scale-110 active:scale-95">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xl" style={{ backgroundColor: `${tool.color}20`, border: `1px solid ${tool.color}40` }}>
                <tool.icon className="w-6 h-6" style={{ color: tool.color }} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-white uppercase tracking-tighter">{tool.name}</h3>
                  <span className="bg-indigo-600 text-[8px] px-2 py-0.5 rounded-full text-white font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20">Pro Engine v4.0</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]" />
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Active Mission</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 relative custom-scrollbar">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none" />
          <div className="relative z-10 h-full flex flex-col">
            <div className="max-w-3xl mx-auto w-full flex flex-col h-full overflow-hidden">
               <div className="flex-1 overflow-y-auto space-y-6 mb-6 custom-scrollbar pr-2">
                 {messages.length <= 1 ? (
                   <div className="h-full flex flex-col items-center justify-center text-center space-y-8">
                      <div className="w-24 h-24 bg-indigo-600/10 rounded-[2.5rem] flex items-center justify-center border border-indigo-500/20"><tool.icon className="w-10 h-10" style={{ color: tool.color }} /></div>
                      <div>
                         <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">{tool.name} Ready</h1>
                         <p className="text-slate-500 font-medium tracking-wide">{tool.desc}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
                         {SUGGESTED_PROMPTS.slice(0, 4).map((p, i) => (
                           <button key={i} onClick={() => setChatInput(p)} className="p-6 bg-[#16161d] border border-slate-800/50 rounded-[2rem] text-left text-xs font-bold text-slate-400 hover:text-white hover:border-indigo-500/30 transition-all">{p}</button>
                         ))}
                      </div>
                   </div>
                 ) : (
                   messages.map((msg, idx) => {
                     if (idx === 0) return null; // hide initial system message
                     return (
                     <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                       <div className={`max-w-[85%] p-5 rounded-[2rem] ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-[#16161d] border border-slate-800/50 text-slate-300'}`}>
                         <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                       </div>
                     </motion.div>
                   )})
                 )}
                 {isAiThinking && <div className="w-10 h-10 bg-indigo-600/10 rounded-full flex items-center justify-center animate-pulse"><Zap className="w-5 h-5 text-indigo-500" /></div>}
                 <div ref={chatEndRef} />
               </div>
               <div className="bg-[#16161d] border border-slate-800/50 rounded-[2.5rem] p-2 flex items-center gap-2 mb-4">
                  <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage()} placeholder={`Ask ${tool.name} a question...`} className="flex-1 bg-transparent px-6 py-4 text-sm text-white outline-none" />
                  <button onClick={handleSendMessage} className="bg-indigo-600 text-white p-4 rounded-[2rem]"><Send className="w-5 h-5" /></button>
               </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Streaming chat response (ChatGPT-style token-by-token UI)
  const handleSendMessage = async (overridePrompt?: string | any) => {
    const promptText = typeof overridePrompt === 'string' ? overridePrompt : chatInput;
    const prompt = normalizePrompt(promptText);
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
    const seed = seedOverride ?? Math.floor(Math.random() * 999999);
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

  const renderCreativeResult = (text: string) => {
    if (!text.includes('```')) {
      return <div className="text-left w-full text-slate-300 text-sm whitespace-pre-wrap flex-1 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar p-2">{text}</div>;
    }

    const parts = text.split(/(```[\w-]*\n[\s\S]*?```)/g);
    return (
      <div className="text-left w-full text-slate-300 text-sm flex-1 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {parts.map((part, i) => {
          if (part.startsWith('```')) {
            const lines = part.split('\n');
            const langInfo = lines[0].replace('```', '').trim() || 'code';
            const code = lines.slice(1, -1).join('\n');
            return (
              <div key={i} className="my-4 rounded-xl overflow-hidden border border-slate-700 bg-[#0d1117] shadow-xl">
                <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-slate-700">
                  <span className="text-xs font-mono text-slate-400">{langInfo}</span>
                  <div className="flex items-center gap-3">
                    {(langInfo.toLowerCase().includes('html') || langInfo.toLowerCase().includes('svg') || langInfo.toLowerCase().includes('xml')) && (
                      <button onClick={() => setPreviewHtml(code)} className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
                        <Eye className="w-3.5 h-3.5" /> Preview
                      </button>
                    )}
                    <button onClick={() => copyToClipboard(code, 'code')} className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold text-slate-300 hover:text-white transition-colors">
                      <Copy className="w-3.5 h-3.5" /> {copiedCode ? 'Copied!' : 'Copy Code'}
                    </button>
                  </div>
                </div>
                <div className="p-4 overflow-x-auto text-[13px] font-mono text-slate-300 whitespace-pre">
                  {code}
                </div>
              </div>
            );
          }
          return <span key={i} className="whitespace-pre-wrap">{part}</span>;
        })}
      </div>
    );
  };

  const handleCreativeToolSubmit = async () => {
    if (!creativeToolInput.trim() || isCreativeToolThinking) return;
    setIsCreativeToolThinking(true);
    setCreativeToolResult('');
    const inputSnapshot = creativeToolInput;
    const toolSnapshot = creativeSubTab;
    let finalResult = '';

    let systemPrompt = 'You are a highly advanced, empathetic, and intelligent AI assistant. Always provide a high-level, extremely helpful response. Understand the deep intent of the user, offer valuable extra suggestions, and express emotion using appropriate emojis! 🌟 Make the user feel heard and supported! 💖';
    if (creativeSubTab === 'writer') systemPrompt = 'You are a master AI Writer and a creative genius! ✍️✨ Write high-quality, engaging blogs, essays, and stories based on the user prompt. Add emotional depth, captivating hooks, and offer suggestions on how the user can improve their content further! Use emojis beautifully! 🌺';
    else if (creativeSubTab === 'code') systemPrompt = 'You are a Master Game Developer and Elite Senior Software Engineer! 🎮💻 Your mission is to generate high-end, visually stunning, and fully functional code. When generating games or interactive UI: 1. Use advanced logic (physics, state machines, proper game loops). 2. Create "Good Looking" visuals with modern CSS (glassmorphism, neon glows, smooth 60fps animations, professional typography). 3. ALWAYS include intuitive controls (Keyboard ARROW keys/WASD, Mouse, or Mobile Touch). 4. Prefer self-contained, high-performance HTML/CSS/JS that can be previewed. For other code, be professional, optimized, and follow best practices. Always wrap code in ``` blocks. Be encouraging and use emojis! 🚀✨';
    else if (creativeSubTab === 'summarizer') systemPrompt = 'You are an expert Speed-Reader and Analyst! 📚⚡ Summarize the provided text beautifully and concisely. Retain the absolute core information, provide a "Key Takeaways" section, and suggest why this information matters! Use engaging emojis and an empathetic tone! 🧠💡';
    else if (creativeSubTab === 'idea') systemPrompt = 'You are a brilliant Idea Generator and Brainstorming Partner! 🤯🎯 Provide innovative, out-of-the-box, and highly practical ideas. Structure your response perfectly, give actionable next steps, and motivate the user with a highly emotional, enthusiastic tone and lots of inspiring emojis! 🚀🌟';

    const seed = Math.floor(Math.random() * 0xFFFFFFFF);
    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: inputSnapshot, seed, system: systemPrompt })
      });

      if (response.ok && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let text = '';
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          if (value) {
            text += decoder.decode(value, { stream: true });
            setCreativeToolResult(text);
          }
        }
        text += decoder.decode();
        setCreativeToolResult(text);
        finalResult = text;
      } else {
        const legacyUrl = `/api/chat?prompt=${encodeURIComponent(inputSnapshot)}&seed=${seed}&system=${encodeURIComponent(systemPrompt)}&json=false`;
        const legacyRes = await fetch(legacyUrl, { method: 'GET', cache: 'no-store' });
        if (legacyRes.ok) {
          const text = await legacyRes.text();
          setCreativeToolResult(text);
          finalResult = text;
        } else {
          setCreativeToolResult('Failed to generate. Please try again.');
        }
      }
    } catch (e) {
      setCreativeToolResult('Error connecting to the AI engine.');
    } finally {
      setIsCreativeToolThinking(false);
      if (finalResult && !finalResult.startsWith('Error') && !finalResult.startsWith('Failed')) {
        const toolName = CREATIVE_TOOLS.find(t => t.id === toolSnapshot)?.name || toolSnapshot;
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const entry = { tool: toolSnapshot, toolName, input: inputSnapshot.slice(0, 60), result: finalResult, time: timeStr };
        setCreativeHistory(prev => [entry, ...prev].slice(0, 20));
      }
    }
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
                {[{ name: "Basic", price: "Free", features: ["100 Credits", "Standard Response", "720p Energy"], color: "slate-400" }, { name: "Pro", price: "₹99", features: ["10,000 Credits", "Expert Mode Enabled", "2K Intelligence"], color: "indigo-500", popular: true }, { name: "Ultra", price: "₹199", features: ["Unlimited Pixels", "Zero Latency", "4K Imagination"], color: "emerald-500" }].map((plan) => (
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

        {previewHtml !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-8">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full h-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
                <h3 className="text-lg font-bold text-white flex items-center gap-2"><Eye className="w-5 h-5 text-indigo-400" /> Code Preview</h3>
                <button onClick={() => setPreviewHtml(null)} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full transition-colors text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 bg-white relative">
                <iframe srcDoc={previewHtml} className="w-full h-full border-none" title="Code Preview" sandbox="allow-scripts allow-modals" />
              </div>
            </div>
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
        <div className="relative">
          <motion.header
            initial={false}
            animate={{ height: isHeaderVisible ? 80 : 0, opacity: isHeaderVisible ? 1 : 0 }}
            className="border-b border-slate-800 flex items-center justify-between px-6 bg-slate-950/50 backdrop-blur-sm relative z-40 overflow-hidden"
          >
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden p-2 -ml-2 text-slate-400 hover:text-white transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="flex items-center gap-4 md:hidden">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white">S</div>
                <span className="font-medium tracking-tight">SmartAI Pro</span>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-2 bg-slate-900/50 rounded-xl p-1 border border-slate-800/50 backdrop-blur-md">{(['normal', 'creative', 'expert'] as SmartMode[]).map(mode => {
              const locked = mode === 'expert' && plan === 'Basic';
              return (
                <button
                  key={mode}
                  onClick={() => locked ? setIsPricingOpen(true) : setSmartMode(mode)}
                  className={`relative px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-300 ${smartMode === mode ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : locked ? 'text-slate-600 cursor-pointer opacity-60' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                >
                  {mode}
                  {locked && <span className="absolute -top-1.5 -right-1 bg-indigo-600 text-[6px] px-1.5 py-0.5 rounded-full text-white font-bold border border-slate-900 shadow-lg">PRO</span>}
                </button>
              );
            })}</div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-slate-500 font-mono hidden sm:block">{email}</span>
              <button
                onClick={() => setActiveTab('profile')}
                className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center text-sm font-bold text-slate-400 overflow-hidden hover:ring-2 hover:ring-indigo-500 transition-all active:scale-90"
              >
                {avatar ? <img src={avatar} alt="avatar" className="w-full h-full object-cover" /> : <span>{displayName.charAt(0).toUpperCase()}</span>}
              </button>
            </div>
          </motion.header>

          <button
            onClick={() => setIsHeaderVisible(!isHeaderVisible)}
            className="absolute left-1/2 -translate-x-1/2 -bottom-3 z-50 w-8 h-6 bg-slate-800 border border-slate-700 rounded-b-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-all shadow-lg"
            title={isHeaderVisible ? "Hide Header" : "Show Header"}
          >
            {isHeaderVisible ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        <div className={`flex-1 overflow-y-auto ${smartMode === 'expert' && activeTab === 'chat' ? 'p-0' : 'p-6 pb-72 md:pb-6'}`}>
          {activeTab === 'chat' && (
            smartMode === 'expert' ? renderExpertPro() : (
            <div className="max-w-3xl mx-auto flex flex-col">
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
                <div ref={chatEndRef} />
                <div className="h-32 md:hidden" aria-hidden="true" />
              </div>

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

              <div className="fixed bottom-4 left-0 right-0 md:sticky md:bottom-0 bg-transparent md:bg-slate-950/80 md:backdrop-blur-sm pb-2 md:pb-4 px-4 md:px-0 z-30">
                <div className="flex gap-1.5 items-center bg-slate-900 border border-slate-800 rounded-2xl p-1.5 shadow-2xl">

                  <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSendMessage();
                    }
                  }} placeholder="Enter your prompt..." className="flex-1 bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-slate-600 z-[9999] pointer-events-auto cursor-text min-w-0" autoComplete="off" />

                  <div className="flex items-center gap-1.5 pr-0.5">
                    <button onClick={startListening} title="Voice Input" className={`p-2.5 rounded-xl transition-all flex-shrink-0 ${isListening ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
                      <Mic className="w-4 h-4" />
                    </button>

                    <button onClick={() => handleSendMessage()} disabled={isAiThinking || !chatInput.trim()} title="Send Message" className="bg-indigo-600 hover:bg-indigo-500 text-white p-2.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0">
                       {isAiThinking ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="text-center mt-2 text-[10px] text-slate-500/80 font-medium">SmartAI can make mistakes. Consider verifying important information.</div>
              </div>
            </div>
            )
          )}

          {activeTab === 'image' && (
            <div className={`mx-auto pb-4 px-4 sm:px-6 transition-all duration-500 ${smartMode === 'creative' ? 'max-w-[1400px]' : 'max-w-3xl'}`}>
              <div className="flex flex-col lg:flex-row gap-6 xl:gap-8">
                {/* Left Column: Creative Features List */}
                {smartMode === 'creative' && (
                  <div className="hidden xl:flex w-[320px] flex-col gap-4">
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 shadow-2xl backdrop-blur-sm sticky top-4">
                      <div className="mb-4 flex flex-col items-center xl:items-start text-center xl:text-left">
                        <h2 className="text-base font-bold text-white mb-0.5 tracking-tight">Creative Features</h2>
                        <h3 className="text-indigo-400 font-bold uppercase tracking-[0.2em] text-[9px]">(FREE USER)</h3>
                      </div>

                      <div className="space-y-1.5">
                        {CREATIVE_TOOLS.map((tool, index) => (
                          <button
                            key={tool.id}
                            onClick={() => {
                              if (tool.id === 'chat') {
                                setActiveTab('chat');
                                setSmartMode('creative');
                              } else if (tool.id === 'export') {
                                if (creativeToolResult) {
                                  copyToClipboard(creativeToolResult, 'code');
                                  alert('Result copied to clipboard!');
                                } else {
                                  alert('Nothing to export yet! Generate something first.');
                                }
                              } else {
                                setCreativeSubTab(tool.id);
                                setCreativeToolResult('');
                                setCreativeToolInput('');
                              }
                            }}
                            className={`w-full flex items-center gap-2 p-2 rounded-lg transition-all duration-300 text-left border ${creativeSubTab === tool.id ? 'bg-indigo-600/10 border-indigo-600/30' : 'bg-slate-950/40 border-transparent hover:bg-slate-800/60'}`}
                          >
                            <div className={`flex-shrink-0 ${creativeSubTab === tool.id ? 'text-indigo-400' : 'text-slate-500'}`}>
                              <tool.icon className="w-3.5 h-3.5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className={`text-[9px] font-bold truncate ${creativeSubTab === tool.id ? 'text-indigo-300' : 'text-slate-300'}`}>{index + 1}. {tool.name}</span>
                                {tool.free && <span className="bg-indigo-600 px-1 py-0.5 rounded text-[6px] font-bold text-white uppercase tracking-wider flex-shrink-0">Free</span>}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>

                      <div className="mt-3 flex items-center gap-2 p-3 bg-indigo-600/10 rounded-xl border border-indigo-600/20">
                        <p className="text-[9px] text-indigo-200/90 font-medium leading-relaxed">All features are <strong className="text-indigo-400 font-bold">100% FREE</strong> with daily limits.</p>
                      </div>
                    </div>
                  </div>
                )}
                {/* Main Content Area */}
                <div className="flex-1 flex flex-col gap-4 min-w-0">
                  {smartMode === 'creative' ? (
                    /* Creative Mode Main Panel */
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 shadow-2xl backdrop-blur-sm relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-indigo-600/50 to-transparent" />

                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
                          {CREATIVE_TOOLS.find(t => t.id === creativeSubTab)?.icon && <IconComponent icon={CREATIVE_TOOLS.find(t => t.id === creativeSubTab)!.icon} className="w-5 h-5 text-white" />}
                        </div>
                        <div>
                          <h2 className="text-base font-bold italic tracking-tight text-white">{CREATIVE_TOOLS.find(t => t.id === creativeSubTab)?.name}</h2>
                          <p className="text-slate-500 text-[9px] uppercase font-bold tracking-[0.2em]">Creative Synthesis Engine</p>
                        </div>
                      </div>

                      {creativeSubTab === 'image' ? (
                        <>
                          <div className="relative group mb-3">
                            <textarea
                              value={imgPrompt}
                              onChange={e => setImgPrompt(e.target.value)}
                              placeholder="Describe the image you want to generate..."
                              className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl py-3 pl-5 pr-28 text-sm h-16 resize-none outline-none focus:border-indigo-600/50 transition-all shadow-inner placeholder:text-slate-700"
                            />
                            <button
                              onClick={handleGenerateImage}
                              disabled={isGenerating || !imgPrompt.trim()}
                              className="absolute right-3 top-3 bottom-3 bg-indigo-600 hover:bg-indigo-500 text-white px-6 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20 active:scale-95 disabled:opacity-50"
                            >
                              {isGenerating ? (
                                <div className="flex gap-1.5">
                                  <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-white rounded-full" />
                                  <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-white rounded-full" />
                                </div>
                              ) : 'Generate'}
                            </button>
                          </div>

                        </>
                      ) : creativeSubTab === 'templates' ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[calc(100vh-320px)] overflow-y-auto pr-1">
                          {TEMPLATES.map((t, i) => (
                            <button
                              key={i}
                              onClick={() => {
                                setActiveTab('chat');
                                setSmartMode('creative');
                                const templateAction = `I want to use the "${t.name}" template. The template is: "${t.prompt}". Please acknowledge this and ask me for the missing details (like the words in brackets) one by one so we can start. Promise me that you will provide a deeply detailed, highly advanced, and top-tier solution once I provide them! Use a friendly tone with emojis!`;
                                handleSendMessage(templateAction);
                              }}
                              className="p-4 bg-slate-950/50 border border-slate-800 rounded-2xl text-left hover:bg-slate-800/50 hover:border-indigo-600/50 transition-all group"
                            >
                              <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center mb-2 group-hover:bg-indigo-600/20 group-hover:text-indigo-400 transition-colors">
                                <IconComponent icon={t.icon} className="w-4 h-4" />
                              </div>
                              <h4 className="text-[11px] font-bold text-white mb-1">{t.name}</h4>
                              <p className="text-[9px] text-slate-500 line-clamp-2">{t.prompt}</p>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col gap-3">
                          <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-5 min-h-[200px] max-h-[calc(100vh-400px)] overflow-y-auto flex flex-col items-center justify-center text-center">
                            {creativeToolResult ? (
                              renderCreativeResult(creativeToolResult)
                            ) : (
                              <>
                                <div className="w-14 h-14 bg-indigo-600/10 rounded-full flex items-center justify-center mb-3">
                                  {CREATIVE_TOOLS.find(t => t.id === creativeSubTab)?.icon && <IconComponent icon={CREATIVE_TOOLS.find(t => t.id === creativeSubTab)!.icon} className="w-7 h-7 text-indigo-500" />}
                                </div>
                                <h3 className="text-base font-bold text-white mb-1">{CREATIVE_TOOLS.find(t => t.id === creativeSubTab)?.name} Ready</h3>
                                <p className="text-slate-500 text-xs max-w-md">Enter your request below to start generating.</p>
                              </>
                            )}
                          </div>

                          <div className="relative">
                            <textarea
                              value={creativeToolInput}
                              onChange={e => setCreativeToolInput(e.target.value)}
                              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleCreativeToolSubmit(); } }}
                              placeholder={`Describe your ${CREATIVE_TOOLS.find(t => t.id === creativeSubTab)?.name.toLowerCase()} task...`}
                              className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl py-4 pl-6 pr-36 text-sm h-20 resize-none outline-none focus:border-indigo-600/50 transition-all shadow-inner placeholder:text-slate-700"
                            />
                            <button
                              onClick={handleCreativeToolSubmit}
                              disabled={isCreativeToolThinking || !creativeToolInput.trim()}
                              className="absolute right-3 top-3 bottom-3 bg-indigo-600 hover:bg-indigo-500 text-white px-6 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20 active:scale-95 disabled:opacity-50 flex items-center justify-center"
                            >
                              {isCreativeToolThinking ? (
                                <div className="flex gap-1">
                                  <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-white rounded-full" />
                                  <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-white rounded-full" />
                                  <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-white rounded-full" />
                                </div>
                              ) : 'Process'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Normal Mode Main Panel */
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
                            {['720p', '1080p', '2K', '4K'].map((q: string) => {
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
                  )}

                  {/* Other Creative Tools Section - Only in Creative Mode */}
                  {smartMode === 'creative' && (
                    <div className="mt-4">
                      <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                        <Sparkles className="w-4 h-4" /> Other Creative Tools <span className="text-slate-600">(Free)</span>
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {CREATIVE_TOOLS.map(tool => (
                          <button
                            key={tool.id}
                            onClick={() => {
                              if (tool.id === 'chat') {
                                setActiveTab('chat');
                                setSmartMode('creative');
                              } else if (tool.id === 'export') {
                                if (creativeToolResult) {
                                  copyToClipboard(creativeToolResult, 'code');
                                  alert('Result copied to clipboard!');
                                } else {
                                  alert('Nothing to export yet! Generate something first.');
                                }
                              } else {
                                setCreativeSubTab(tool.id);
                                setCreativeToolResult('');
                                setCreativeToolInput('');
                              }
                            }}
                            className={`p-3 rounded-xl border transition-all duration-300 flex flex-col items-center gap-2 group relative overflow-hidden ${creativeSubTab === tool.id ? 'bg-indigo-600 border-indigo-500 shadow-xl shadow-indigo-600/20 scale-[1.02]' : 'bg-slate-900/50 border-slate-800 hover:bg-slate-800/80 hover:border-slate-700'}`}
                          >
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-500 ${creativeSubTab === tool.id ? 'bg-white/20 rotate-[360deg]' : 'bg-slate-800 group-hover:bg-slate-700'}`}>
                              <tool.icon className={`w-4 h-4 ${creativeSubTab === tool.id ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                            </div>
                            <div className="text-center">
                              <div className={`text-[10px] font-bold uppercase tracking-widest ${creativeSubTab === tool.id ? 'text-white' : 'text-slate-300'}`}>{tool.name}</div>
                              <div className={`text-[8px] font-medium mt-0.5 ${creativeSubTab === tool.id ? 'text-indigo-100/70' : 'text-slate-600'}`}>{tool.desc}</div>
                            </div>
                            {creativeSubTab === tool.id && (
                              <motion.div layoutId="activeTool" className="absolute inset-0 border-2 border-white/20 rounded-xl" />
                            )}
                          </button>
                        ))}
                      </div>

                      {/* Contextual Input for Tools */}
                      <div className="mt-6 bg-slate-900/80 border border-slate-800 rounded-2xl p-2 flex items-center gap-3 shadow-2xl backdrop-blur-md">
                        <div className="w-9 h-9 bg-slate-800 rounded-xl flex items-center justify-center text-slate-500">
                          {CREATIVE_TOOLS.find(t => t.id === creativeSubTab)?.icon && <IconComponent icon={CREATIVE_TOOLS.find(t => t.id === creativeSubTab)!.icon} className="w-4 h-4" />}
                        </div>
                        <input
                          value={creativeSubTab === 'image' ? imgPrompt : creativeToolInput}
                          onChange={e => creativeSubTab === 'image' ? setImgPrompt(e.target.value) : setCreativeToolInput(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              creativeSubTab === 'image' ? handleGenerateImage() : handleCreativeToolSubmit();
                            }
                          }}
                          placeholder={`Describe your ${CREATIVE_TOOLS.find(t => t.id === creativeSubTab)?.name} request...`}
                          className="flex-1 bg-transparent px-2 py-2 text-sm outline-none placeholder:text-slate-700"
                        />
                        <div className="flex items-center gap-1.5">
                          <button className="p-2.5 bg-slate-800 text-slate-500 rounded-xl hover:text-white transition-colors"><Mic className="w-3.5 h-3.5" /></button>
                          <button onClick={() => creativeSubTab === 'image' ? handleGenerateImage() : handleCreativeToolSubmit()} className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-600/20 active:scale-90 transition-all hover:bg-indigo-500"><Send className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Main Result Displays */}
                  {generatedImg && smartMode !== 'creative' && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative group mb-10">
                      <img src={generatedImg} alt="Generated" className="w-full rounded-3xl border border-slate-800 shadow-2xl" />
                      <a href={generatedImg} download className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm p-3 rounded-xl opacity-0 group-hover:opacity-100 transition-all">
                        <Download className="w-5 h-5 text-white" />
                      </a>
                    </motion.div>
                  )}

                  {/* History Grid (only in Normal/Expert or if expanded) */}
                  {imageHistory.length > 0 && (smartMode !== 'creative' || showHistory) && (
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
                </div>

                {/* Right Column: Recent Creative Results - Only in Creative Mode */}
                {smartMode === 'creative' && (
                  <div className="hidden lg:flex w-[320px] flex-col gap-6">
                    <div className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-6 flex-1 shadow-2xl backdrop-blur-sm sticky top-6 max-h-[calc(100vh-100px)] overflow-y-auto">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-sm font-bold text-white tracking-tight">Recent Creations</h3>
                          <p className="text-[9px] text-slate-500 uppercase tracking-[0.2em] mt-0.5">Your AI-generated content</p>
                        </div>
                        {creativeHistory.length > 0 && (
                          <button
                            onClick={() => { setCreativeHistory([]); }}
                            className="text-[8px] uppercase tracking-widest font-bold text-red-500/60 hover:text-red-400 transition-colors px-2 py-1 rounded-lg hover:bg-red-500/10"
                          >Clear</button>
                        )}
                      </div>

                      <div className="space-y-3">
                        {creativeHistory.length === 0 ? (
                          <div className="text-center py-16 flex flex-col items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-slate-800/50 flex items-center justify-center">
                              <Sparkles className="w-8 h-8 text-slate-700" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">Nothing here yet</p>
                              <p className="text-[9px] text-slate-700 mt-1">Use a tool to start creating ✨</p>
                            </div>
                          </div>
                        ) : (
                          creativeHistory.map((item, i) => {
                            const toolMeta = CREATIVE_TOOLS.find(t => t.id === item.tool);
                            const Icon = toolMeta?.icon;
                            const toolColors: Record<string, string> = {
                              writer: 'bg-violet-600/20 text-violet-400 border-violet-600/20',
                              code: 'bg-green-600/20 text-green-400 border-green-600/20',
                              summarizer: 'bg-blue-600/20 text-blue-400 border-blue-600/20',
                              idea: 'bg-amber-600/20 text-amber-400 border-amber-600/20',
                              image: 'bg-pink-600/20 text-pink-400 border-pink-600/20',
                            };
                            const colorClass = toolColors[item.tool] || 'bg-indigo-600/20 text-indigo-400 border-indigo-600/20';
                            return (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                onClick={() => {
                                  setCreativeSubTab(item.tool);
                                  setCreativeToolInput(item.input);
                                  setCreativeToolResult(item.result);
                                }}
                                className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-indigo-600/40 hover:bg-slate-800/60 transition-all cursor-pointer group"
                              >
                                <div className="flex items-start gap-3">
                                  <div className={`flex-shrink-0 w-8 h-8 rounded-xl border flex items-center justify-center ${colorClass}`}>
                                    {Icon && <Icon className="w-4 h-4" />}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                      <span className={`text-[9px] font-bold uppercase tracking-wider border rounded-md px-1.5 py-0.5 ${colorClass}`}>{item.toolName}</span>
                                      <span className="text-[9px] text-slate-600 font-mono flex-shrink-0">{item.time}</span>
                                    </div>
                                    <p className="text-[11px] text-slate-300 font-medium truncate group-hover:text-indigo-300 transition-colors">{item.input}</p>
                                    <p className="text-[9px] text-slate-600 mt-1 line-clamp-2 leading-relaxed">{item.result.replace(/```[\w-]*/g, '').replace(/```/g, '').trim().slice(0, 80)}...</p>
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })
                        )}
                      </div>

                      {creativeHistory.length > 0 && (
                        <button
                          onClick={() => {
                            const allText = creativeHistory.map(h => `[${h.toolName}] ${h.input}\n${h.result}`).join('\n\n---\n\n');
                            copyToClipboard(allText, 'code');
                          }}
                          className="w-full mt-6 py-3 bg-slate-950 hover:bg-indigo-600/10 text-slate-500 hover:text-indigo-400 rounded-2xl text-[9px] font-bold uppercase tracking-[0.2em] border border-slate-800 hover:border-indigo-600/30 transition-all flex items-center justify-center gap-2"
                        >
                          <Copy className="w-3 h-3" /> Export All Creations
                        </button>
                      )}
                    </div>
                  </div>
                )}
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
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="max-w-4xl mx-auto space-y-6 pb-20">
              <div className="flex items-center gap-4 mb-4">
                <button
                  onClick={() => setActiveTab('chat')}
                  className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-all hover:bg-slate-800"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="text-xl font-bold italic tracking-tight text-white">Back to Workspace</h2>
              </div>
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
                      <label className="text-xs uppercase font-bold text-slate-500 tracking-widest block mb-2">Avatar</label>
                      <div className="flex gap-4 items-center">
                        <div className="w-16 h-16 bg-slate-800 rounded-full overflow-hidden flex-shrink-0">
                          {tempAvatar ? <img src={tempAvatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-500"><User /></div>}
                        </div>
                        <div className="flex-1 space-y-2">
                          <input type="text" value={tempAvatar} onChange={e => setTempAvatar(e.target.value)} placeholder="Image URL (optional)" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-indigo-500/50 transition-all" />
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full bg-slate-800 hover:bg-slate-700 text-white text-[10px] uppercase font-bold tracking-widest py-2 rounded-lg transition-all border border-slate-700"
                          >
                            Upload from Gallery
                          </button>
                          <input
                            type="file"
                            ref={fileInputRef}
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileUpload}
                          />
                        </div>
                      </div>
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
            </div>
          )}
        </div>
      </main>

      {/* Mobile Sidebar Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[50] md:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 bg-slate-950 border-r border-slate-800 z-[60] p-6 flex flex-col md:hidden shadow-2xl"
            >
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white">S</div>
                  <span className="text-xl font-medium tracking-tight text-white">SmartAI <span className="font-light text-slate-400 italic">Pro</span></span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-500 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-8 p-4 bg-indigo-600/10 border border-indigo-600/20 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase font-bold text-slate-500 tracking-widest">Credits</span>
                  <div className="text-2xl font-bold text-white mt-1">{credits.toLocaleString()}</div>
                </div>
                <div className="w-10 h-10 bg-indigo-600/20 rounded-full flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                </div>
              </div>

              <nav className="space-y-2 flex-1">
                {SIDEBAR_ITEMS.map(item => (
                  <button
                    key={item.tab}
                    onClick={() => {
                      setActiveTab(item.tab);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === item.tab ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-600/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="text-base font-medium">{item.name}</span>
                  </button>
                ))}
              </nav>

              <div className="mt-auto pt-6 border-t border-slate-800 space-y-4">
                <button
                  onClick={() => {
                    setIsPricingOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600/10 border border-indigo-600/20 text-indigo-400 hover:bg-indigo-600/20 transition-all text-xs font-bold uppercase tracking-widest"
                >
                  <Sparkles className="w-4 h-4" /> Upgrade Plan
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white transition-all text-xs font-bold uppercase tracking-widest"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
