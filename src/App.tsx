import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Image as ImageIcon, LogOut, Send, Plus, Zap, Sparkles, Github, Download, Video, User, CreditCard, Eye, EyeOff, Shield, Copy, Check, Search, Mic, RefreshCcw, Menu, X, ArrowLeft, ChevronUp, ChevronDown, ChevronRight, Terminal, FileText, Code, Lightbulb, PenTool, Database, Layout, TrendingUp, Mic2, FileSearch, Layers, Cpu, FastForward, Monitor, Globe, Network, Crown, Clock, CloudSun, Radio, Instagram, Lock as LockIcon, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import AdminPanel from './AdminPanel';
import { fetchUsersFromSupabase, syncUsersToSupabase, checkAdminSession } from './lib/db';

type Tab = 'home' | 'chat' | 'image' | 'video' | 'profile' | 'admin';
type SmartMode = 'normal' | 'creative' | 'expert';
interface Message { id: string; role: 'user' | 'assistant'; content: string; }


const SIDEBAR_ITEMS = [
  { name: 'AI Chat', icon: MessageSquare, tab: 'chat' as Tab },
  { name: 'Image Generator', icon: ImageIcon, tab: 'image' as Tab },
  { name: 'Profile', icon: User, tab: 'profile' as Tab },
];

const MOBILE_TABS = [
  { name: 'Chat', icon: MessageSquare, tab: 'chat' as Tab },
  { name: 'Image', icon: ImageIcon, tab: 'image' as Tab },
  { name: 'Video', icon: Video, tab: 'video' as Tab },
  { name: 'Profile', icon: User, tab: 'profile' as Tab },
];

const PLANS = [
  { name: 'Basic', price: 'Free', features: ['100 Credits', 'Standard Response', '720p Energy'], color: 'slate-400' },
  { name: 'Pro', price: 'â‚¹99', features: ['10,000 Credits', 'Expert Mode Enabled', '2K Intelligence'], color: 'indigo-500', popular: true },
  { name: 'Ultra', price: 'â‚¹199', features: ['Unlimited Pixels', 'Zero Latency', '4K Imagination'], color: 'emerald-500' },
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

const IMAGE_TOOLS = [
  { id: 'img2prompt', name: 'Image to Prompt', desc: 'Extract prompt from image', icon: ImageIcon },
  { id: 'editor', name: 'Image Editor', desc: 'Edit image with AI', icon: PenTool },
  { id: 'bgremove', name: 'Background Remover', desc: 'Remove background easily', icon: Layers },
  { id: 'style', name: 'Style Transfer', desc: 'Apply style to your image', icon: Sparkles },
  { id: 'face', name: 'Face Consistency', desc: 'Keep face same in all images', icon: User },
  { id: 'upscale', name: 'Upscale Image', desc: 'Increase resolution to 4K/8K', icon: Monitor, badge: 'PRO', color: 'indigo-500' },
  { id: 'bulk', name: 'Bulk Generation', desc: 'Generate multiple images', icon: Layout, badge: 'PRO', color: 'emerald-500' },
  { id: 'animate', name: 'Image to Animation', desc: 'Convert image to animation', icon: Video, badge: 'PRO', color: 'purple-500' },
];

const EXPERT_TOOLS = [
  { id: 'agent', name: 'AI Agent Mode', badge: 'NEW', icon: Zap, desc: 'AI handles complete tasks automatically from planning to execution.', color: '#a855f7' },
  { id: 'memory', name: 'Memory + Personal AI', badge: 'NEW', icon: Database, desc: 'AI remembers your chats, preferences and provides personalized results.', color: '#3b82f6' },
  { id: 'video', name: 'AI Video Generator', badge: 'NEW', icon: Video, desc: 'Turn text into full videos with scenes, voiceovers and captions.', color: '#ec4899' },
  { id: 'reverse', name: 'Image â†’ Prompt Reverse', badge: 'NEW', icon: ImageIcon, desc: 'Upload an image and AI will detect the exact prompt used.', color: '#10b981' },
  { id: 'builder', name: 'Full Website Builder', badge: 'NEW', icon: Code, desc: 'Generate complete websites with design, code and one-click deploy.', color: '#f59e0b' },
  { id: 'business', name: 'Business Growth Tools', badge: 'NEW', icon: TrendingUp, desc: 'Marketing strategy, ad copy, startup ideas, funnels and business plans.', color: '#22c55e' },
  { id: 'voice', name: 'Voice Clone AI', badge: 'NEW', icon: Mic2, desc: 'Clone any voice and generate realistic AI voice audio.', color: '#d946ef' },
  { id: 'file', name: 'Advanced File Intelligence', badge: 'NEW', icon: FileText, desc: 'Upload PDFs/DOCs and get deep analysis, Q&A and smart summaries.', color: '#6366f1' },
  { id: 'bulk', name: 'Bulk Generation', badge: 'NEW', icon: Layout, desc: 'Generate 10x outputs (images, captions, ideas) in one click.', color: '#a855f7' },
  { id: 'multi', name: 'Multi-Model Access', badge: 'NEW', icon: Network, desc: 'Access GPT-4, Claude, Gemini and other top AI models.', color: '#3b82f6' },
  { id: 'speed', name: 'Priority Speed', badge: 'NEW', icon: Zap, desc: 'Get faster responses with priority processing (100x faster).', color: '#f59e0b' },
  { id: 'quality', name: 'High Quality Output', badge: 'NEW', icon: Monitor, desc: 'Get 4K / 8K quality images, videos and premium results.', color: '#10b981' },
  { id: 'data', name: 'Real-Time Internet Data', badge: 'HOT', icon: Globe, desc: 'Get live data from the web (Google-like search) with latest and accurate info.', color: '#ef4444' },
  { id: 'search', name: 'Smart Search Mode', badge: 'HOT', icon: Search, desc: 'AI automatically decides when to use live data for best and updated answers.', color: '#a855f7' },
  { id: 'api', name: 'API Integration System', badge: 'HOT', icon: CloudSun, desc: 'Connect external APIs (weather, stock, news, etc.) and build real-time apps.', color: '#f59e0b' },
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
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [smartMode, setSmartMode] = useState<SmartMode>('normal');
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [credits, setCredits] = useState(100);
  const [usage, setUsage] = useState({ messages: 0, images: 0, date: new Date().toLocaleDateString() });

  useEffect(() => {
    const savedUsage = localStorage.getItem('smartai_usage');
    const today = new Date().toLocaleDateString();
    if (savedUsage) {
      const parsed = JSON.parse(savedUsage);
      if (parsed.date === today) {
        setUsage(parsed);
      } else {
        const reset = { messages: 0, images: 0, date: today };
        setUsage(reset);
        localStorage.setItem('smartai_usage', JSON.stringify(reset));
      }
    }
  }, []);

  const updateUsage = (type: 'messages' | 'images') => {
    setUsage(prev => {
      const next = { ...prev, [type]: prev[type] + 1 };
      localStorage.setItem('smartai_usage', JSON.stringify(next));
      return next;
    });
  };
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    setAuthError(null);
  }, [authMode]);
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
  const [showHistory, setShowHistory] = useState(true);
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
  const [activeTool, setActiveTool] = useState<{name: string, desc: string, icon: any} | null>(null);
  const [toolImage, setToolImage] = useState<string | null>(null);
  const [toolPrompt, setToolPrompt] = useState('');
  const [isToolProcessing, setIsToolProcessing] = useState(false);
  const [processedToolImage, setProcessedToolImage] = useState<string | null>(null);  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [creativeHistory, setCreativeHistory] = useState<Array<{ tool: string; toolName: string; input: string; result: string; time: string }>>([]);
  const [activeExpertTool, setActiveExpertTool] = useState<string | null>(null);
  const [expertCategory, setExpertCategory] = useState<string>('All');
  const [expertToolInput, setExpertToolInput] = useState('');
  const [expertToolResult, setExpertToolResult] = useState('');
  const [isExpertToolThinking, setIsExpertToolThinking] = useState(false);
  const [tone, setTone] = useState<'Professional' | 'Funny' | 'Casual'>('Professional');
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem('smartai_admin_session') === 'active');
  const isExpertLocked = plan === 'Basic' && !isAdmin;

  useEffect(() => {
    const handleStorageChange = () => {
      setIsAdmin(localStorage.getItem('smartai_admin_session') === 'active');
    };
    window.addEventListener('storage', handleStorageChange);
    // Also poll occasionally in case it was changed in the same window without a storage event
    const interval = setInterval(handleStorageChange, 1000);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const checkGlobalAdmin = async () => {
      const globalId = await checkAdminSession();
      const localId = localStorage.getItem('smartai_admin_session_id');
      if (globalId && localId && globalId !== localId) {
        localStorage.removeItem('smartai_admin_session');
        localStorage.removeItem('smartai_admin_session_id');
        setIsAdmin(false);
      }
    };
    if (isAdmin) {
      const interval = setInterval(checkGlobalAdmin, 10000);
      return () => clearInterval(interval);
    }
  }, [isAdmin]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get('ref');
    if (ref) {
      setSignupReferCode(ref.toUpperCase());
      setAuthMode('signup');
    }
  }, []);

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

    // Fetch latest users from Supabase on mount
    fetchUsersFromSupabase().then(dbUsers => {
      if (dbUsers && dbUsers.length > 0) {
        localStorage.setItem('smartai_users', JSON.stringify(dbUsers));
      }
      initSession();
    });

    const initSession = () => {
      const saved = localStorage.getItem('smartai_session');
      if (!saved) {
        setAuthMode('login');
      } else {
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
    };

    const params = new URLSearchParams(window.location.search);
    const refCode = params.get('ref');
    if (refCode) {
      setSignupReferCode(refCode);
      setAuthMode('signup');
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
    syncUsersToSupabase(users);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (loginContactType === 'email' && !email) {
      setAuthError('Please enter email address');
      return;
    }
    if (loginContactType === 'mobile' && !loginMobile) {
      setAuthError('Please enter mobile number');
      return;
    }
    if (!password) {
      setAuthError('Please enter password');
      return;
    }
    setIsAuthenticating(true);
    
    try {
      // Fetch latest DB state before login
      const dbUsers = await fetchUsersFromSupabase();
      if (dbUsers && dbUsers.length > 0) {
        localStorage.setItem('smartai_users', JSON.stringify(dbUsers));
      }
    } catch (e) {
      console.error("Login sync failed", e);
    }

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
        // Daily refresh logic
        const lastLogin = localStorage.getItem('smartai_last_login');
        const today = new Date().toDateString();
        
        if (lastLogin !== today) {
          localStorage.setItem('smartai_last_login', today);
          const dailyCredits = user.plan === 'Basic' ? 10 : 50;
          user.credits = (typeof user.credits === 'number' ? user.credits : 100) + dailyCredits;
          alert(`Welcome back! You received ${dailyCredits} daily bonus credits.`);
          
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
        setAuthError('Invalid credentials');
      }
      setIsAuthenticating(false);
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

  const handleSignup = async () => {
    setAuthError(null);
    if (!signupName || !password || !signupConfirmPassword) {
      setAuthError('Please fill all required fields');
      return;
    }
    if (signupContactType === 'email' && !email) {
      setAuthError('Please enter email address');
      return;
    }
    if (signupContactType === 'mobile' && !signupMobile) {
      setAuthError('Please enter mobile number');
      return;
    }
    if (password !== signupConfirmPassword) {
      setAuthError('Password and confirm password do not match');
      return;
    }
    setIsAuthenticating(true);
    
    try {
      // Fetch latest DB state before signup to avoid overwriting existing
      const dbUsers = await fetchUsersFromSupabase();
      if (dbUsers && dbUsers.length > 0) {
        localStorage.setItem('smartai_users', JSON.stringify(dbUsers));
      }
    } catch (e) {
      console.error("Signup sync failed", e);
    }

    const users = getUsers();

      // Check for duplicate email
      if (signupContactType === 'email' && email && users.find((u: any) => u.email === email)) {
        setAuthError('Account already exists with this email. Please login instead.');
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
      if (users.find((u: any) => u.displayName && u.displayName.toLowerCase() === signupName.toLowerCase())) {
        setAuthError('This display name is already taken. Please choose a different name.');
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
      if (referredBy) {
        const referrerIdx = users.findIndex((u: any) => u.referralCode === referredBy);
        if (referrerIdx !== -1) {
          users[referrerIdx].credits = (users[referrerIdx].credits || 0) + 50;
          users[referrerIdx].referralEarnings = (users[referrerIdx].referralEarnings || 0) + 50;
          newUser.credits += 50; // Referee also gets 50
        }
      }

      users.push(newUser);
      saveUsers(users);
      localStorage.setItem('smartai_session', JSON.stringify(newUser));
      setCredits(newUser.credits);
      setPlan('Basic');
      setDisplayName(signupName);
      setAvatar('');
      setIsLoggedIn(true);

      if (referredBy) {
        alert("Account created! You received +50 referral bonus credits. Your friend also received a reward!");
      } else {
        alert('Account created successfully!');
      }
      setIsAuthenticating(false);
  };

  const handleForgotPassword = async () => {
    if (!resetEmail) return alert('Please enter your email');
    const dbUsers = await fetchUsersFromSupabase();
    if (dbUsers && dbUsers.length > 0) {
      localStorage.setItem('smartai_users', JSON.stringify(dbUsers));
    }
    const users = getUsers();
    const user = users.find((u: any) => u.email === resetEmail);
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
    if (!tempDisplayName.trim()) return alert('Name cannot be empty');
    setDisplayName(tempDisplayName);
    setAvatar(tempAvatar);
    setIsEditingProfile(false);
    syncUserData({ displayName: tempDisplayName, avatar: tempAvatar });
    alert('Profile updated successfully!');
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
    const filteredTools = EXPERT_TOOLS;

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
        <div className="h-full flex flex-col overflow-hidden bg-[#0a0a0c]">
          <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
            <div className="flex flex-col xl:flex-row gap-8 max-w-[1600px] mx-auto">
              
              {/* Left Main Section */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Crown className="w-8 h-8 text-yellow-500" />
                    <h2 className="text-3xl font-bold text-white tracking-tight">Expert Tools</h2>
                    <span className="bg-indigo-600/20 text-indigo-400 text-[10px] px-2 py-1 rounded-md font-bold uppercase tracking-widest border border-indigo-500/20">PRO</span>
                  </div>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input type="text" placeholder="Search expert tools..." className="w-full bg-[#16161d] border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50" />
                  </div>
                </div>
                <p className="text-slate-400 text-sm mb-8">Next-level AI features for professionals and creators.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                  {EXPERT_TOOLS.map((t, idx) => (
                    <motion.button key={t.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }} onClick={() => setActiveExpertTool(t.id)} className="group relative bg-[#111116] border border-slate-800/50 rounded-2xl p-5 text-left transition-all hover:bg-[#16161d] hover:border-slate-700 h-full flex flex-col">
                      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#0a0a0c] border border-slate-800/50 mb-4 group-hover:scale-110 transition-transform">
                         <t.icon className="w-6 h-6" style={{ color: t.color, filter: `drop-shadow(0 0 8px ${t.color}40)` }} />
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-bold text-white whitespace-nowrap overflow-hidden text-ellipsis">{t.name}</span>
                        {t.badge && (
                           <span className={`flex-shrink-0 text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-widest ${t.badge === 'HOT' ? 'bg-red-500/20 text-red-400 border border-red-500/20' : 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/20'}`}>{t.badge}</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed flex-1">{t.desc}</p>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Right Sidebar Section */}
              <div className="w-full xl:w-80 flex flex-col gap-6 flex-shrink-0">
                {/* Recent Creations */}
                <div className="bg-[#111116] border border-slate-800/50 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-white">Recent Creations</h3>
                    <button className="text-xs text-indigo-400 hover:text-indigo-300">View All</button>
                  </div>
                  <div className="space-y-4">
                     {[
                       { title: 'AI Generated Website', time: 'Just now', img: 'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&q=80&w=200' },
                       { title: 'Motivation Video', time: '5 mins ago', img: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=200', isVideo: true },
                       { title: 'Voice Clone Audio', time: '15 mins ago', icon: Mic2, color: 'text-indigo-400', bg: 'bg-indigo-600/10' },
                       { title: 'Business Plan PDF', time: '25 mins ago', icon: FileText, color: 'text-red-400', bg: 'bg-red-500/10', label: 'PDF' },
                       { title: 'AI Image (4K)', time: '1 hour ago', img: 'https://images.unsplash.com/photo-1506744626753-1fa28f6f5122?auto=format&fit=crop&q=80&w=200' },
                     ].map((item, i) => (
                       <div key={i} className="flex items-center gap-3 cursor-pointer group">
                          {item.img ? (
                            <div className="relative w-12 h-10 rounded-lg overflow-hidden flex-shrink-0">
                               <img src={item.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                               {item.isVideo && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><div className="w-4 h-4 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center"><div className="w-1.5 h-1.5 bg-white rounded-sm" /></div></div>}
                            </div>
                          ) : (
                            <div className={`w-12 h-10 rounded-lg flex flex-col items-center justify-center flex-shrink-0 ${item.bg}`}>
                               {item.label ? <span className={`text-[10px] font-bold ${item.color}`}>{item.label}</span> : <item.icon className={`w-4 h-4 ${item.color}`} />}
                            </div>
                          )}
                          <div>
                            <div className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors">{item.title}</div>
                            <div className="text-[10px] text-slate-500">{item.time}</div>
                          </div>
                       </div>
                     ))}
                  </div>
                </div>

                {/* Live Data */}
                <div className="bg-[#111116] border border-slate-800/50 rounded-2xl p-5 flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-white">Live Data (Real-Time)</h3>
                    <div className="flex items-center gap-1.5">
                       <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                       <span className="text-[10px] text-emerald-500 font-bold">Live</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                     {[
                       { title: 'Gold Price (24K)', sub: 'â‚¹72,185 / 10g', icon: TrendingUp, color: 'text-yellow-500', trend: '+1.28%', trendColor: 'text-emerald-500' },
                       { title: 'Cricket Score (Live)', sub: 'IND 256/4 (45.2)', icon: Crown, color: 'text-blue-400', badge: 'LIVE', badgeColor: 'text-yellow-500' },
                       { title: 'Weather (Delhi)', sub: '32Â°C', icon: CloudSun, color: 'text-orange-400', subRight: 'Clear Sky' },
                       { title: 'Top News', sub: 'AI chips demand hits record high in 2024', icon: FileText, color: 'text-yellow-500', badge: 'LIVE', badgeColor: 'text-red-500' },
                     ].map((item, i) => (
                       <div key={i} className="flex items-start justify-between group cursor-pointer border-b border-slate-800/50 pb-3 last:border-0 last:pb-0">
                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded bg-[#16161d] border border-slate-800 flex items-center justify-center mt-0.5">
                               <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
                            </div>
                            <div>
                               <div className="text-xs font-bold text-slate-300">{item.title}</div>
                               <div className="text-[10px] text-slate-500 mt-0.5 w-32 truncate leading-tight">{item.sub}</div>
                            </div>
                          </div>
                          <div className="text-right flex flex-col items-end">
                             {item.trend && <span className={`text-[10px] font-bold ${item.trendColor}`}>{item.trend}</span>}
                             {item.badge && <span className={`text-[8px] font-bold ${item.badgeColor} uppercase tracking-widest`}>{item.badge}</span>}
                             {item.subRight && <span className="text-[10px] text-slate-400 mt-1">{item.subRight}</span>}
                          </div>
                       </div>
                     ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bottom Footer Panel */}
          <div className="border-t border-slate-800/50 bg-[#111116] p-4 flex flex-col shrink-0">
             <div className="max-w-[1600px] w-full mx-auto flex flex-col lg:flex-row items-center justify-between mb-4 px-4 gap-4">
                <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-12">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center"><Crown className="w-4 h-4 text-rose-500" /></div>
                      <div>
                         <div className="text-xs font-bold text-white">Unlimited Access</div>
                         <div className="text-[10px] text-slate-500">No limits, all features</div>
                      </div>
                   </div>
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center"><Monitor className="w-4 h-4 text-emerald-500" /></div>
                      <div>
                         <div className="text-xs font-bold text-white">4K / 8K Quality</div>
                         <div className="text-[10px] text-slate-500">Ultra HD results</div>
                      </div>
                   </div>
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-yellow-500/10 flex items-center justify-center"><FastForward className="w-4 h-4 text-yellow-500" /></div>
                      <div>
                         <div className="text-xs font-bold text-white">Priority Speed</div>
                         <div className="text-[10px] text-slate-500">100x faster</div>
                      </div>
                   </div>
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center"><Shield className="w-4 h-4 text-green-500" /></div>
                      <div>
                         <div className="text-xs font-bold text-white">Secure & Private</div>
                         <div className="text-[10px] text-slate-500">Your data is 100% safe</div>
                      </div>
                   </div>
                </div>
                <button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-3 shadow-lg shadow-indigo-600/20 transition-all hover:scale-105 whitespace-nowrap">
                   <Crown className="w-5 h-5 text-yellow-400" />
                   <div className="text-left leading-tight">
                      <div className="text-sm">Upgrade to Expert</div>
                      <div className="text-[9px] text-indigo-200 font-medium">Unlock All Premium Features</div>
                   </div>
                </button>
             </div>
             <div className="max-w-[1600px] w-full mx-auto relative px-4">
                <input type="text" placeholder="Enter your prompt..." className="w-full bg-[#0a0a0c] border border-slate-800 rounded-2xl pl-6 pr-32 py-4 text-sm text-white focus:outline-none focus:border-indigo-500/50" />
                <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2">
                   <button className="p-2 text-slate-500 hover:text-white transition-colors"><Layers className="w-4 h-4" /></button>
                   <button className="p-2 text-slate-500 hover:text-white transition-colors"><Mic className="w-4 h-4" /></button>
                   <button className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition-colors"><Send className="w-4 h-4" /></button>
                </div>
             </div>
          </div>
        </div>
      );
    }

    if (activeExpertTool === 'agent') {
      return (
        <div className="flex flex-col h-full overflow-hidden bg-[#050507]">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-[#0a0a0c] border-b border-white/5 backdrop-blur-2xl z-30">
            <div className="flex items-center gap-4">
              <button onClick={() => setActiveExpertTool(null)} className="p-2 text-slate-500 hover:text-white transition-all"><ArrowLeft className="w-5 h-5" /></button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 flex items-center justify-center border border-indigo-500/30">
                  <Cpu className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-tighter">Autonomous AI Agent</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[8px] text-emerald-500 font-black uppercase tracking-[0.2em]">Neural Link Established</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-end">
                <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest mb-1">System Load</span>
                <div className="w-32 h-1 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: '65%' }} className="h-full bg-indigo-500 shadow-[0_0_10px_#6366f1]" />
                </div>
              </div>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20">Terminate Mission</button>
            </div>
          </div>

          <div className="flex-1 flex overflow-hidden">
            {/* Left Panel: Intelligence Feed */}
            <div className="flex-1 border-r border-white/5 overflow-y-auto custom-scrollbar bg-[#050507] p-8">
              <div className="max-w-3xl mx-auto space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-500" />
                    <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Intelligence Feed</h4>
                  </div>
                  {messages.length <= 1 ? (
                    <div className="space-y-6">
                      <div className="p-8 bg-[#0a0a0c] border border-white/5 rounded-3xl">
                        <h2 className="text-2xl font-black text-white mb-4 leading-tight uppercase tracking-tighter">Awaiting Mission Parameters...</h2>
                        <p className="text-slate-500 text-sm leading-relaxed mb-8">Deploy your autonomous agent to handle complex tasks, research markets, or automate workflows with high-level reasoning.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {['Analyze current tech market trends', 'Research sustainable energy startups', 'Write a technical whitepaper on AI', 'Build a business growth strategy'].map((p, i) => (
                            <button key={i} onClick={() => setChatInput(p)} className="p-4 bg-white/5 border border-white/5 rounded-2xl text-left text-[10px] font-bold text-slate-400 hover:text-white hover:bg-white/10 transition-all uppercase tracking-widest">{p}</button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {messages.map((msg, i) => i > 0 && (
                        <motion.div key={msg.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className={`p-6 rounded-3xl ${msg.role === 'user' ? 'bg-indigo-600/10 border border-indigo-500/20' : 'bg-[#0a0a0c] border border-white/5'}`}>
                           <div className="flex items-center gap-3 mb-3">
                             <div className={`w-6 h-6 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-indigo-600' : 'bg-slate-800'}`}>
                               {msg.role === 'user' ? <User className="w-3 h-3 text-white" /> : <Cpu className="w-3 h-3 text-indigo-400" />}
                             </div>
                             <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">{msg.role === 'user' ? 'Mission Commander' : 'Neural Core'}</span>
                           </div>
                           <p className="text-sm text-slate-300 leading-relaxed">{msg.content}</p>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Panel: Terminal / Browser */}
            <div className="w-[450px] bg-[#08080a] flex flex-col overflow-hidden">
               <div className="p-4 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-rose-500/50" />
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
                     </div>
                     <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Agent Terminal</span>
                  </div>
                  <Terminal className="w-4 h-4 text-slate-600" />
               </div>
               <div className="flex-1 p-6 font-mono text-[11px] overflow-y-auto custom-scrollbar">
                  <div className="space-y-3">
                     <div className="text-emerald-500 flex gap-2"><span>[SYSTEM]</span> <span>Initializing autonomous environment...</span></div>
                     <div className="text-slate-500 flex gap-2"><span>[LINK]</span> <span>Connected to global neural grid</span></div>
                     <div className="text-slate-500 flex gap-2"><span>[AUTH]</span> <span>Verified session: smartai_pro_admin</span></div>
                     <div className="text-indigo-400 mt-6 flex gap-2"><span>$</span> <span className="animate-pulse">_</span></div>
                  </div>
                  {isAiThinking && (
                    <div className="mt-8 space-y-4">
                       <div className="flex items-center gap-3 text-indigo-400">
                          <Zap className="w-3 h-3 animate-bounce" />
                          <span className="font-bold uppercase tracking-widest text-[9px]">Analyzing Mission Data...</span>
                       </div>
                       <div className="space-y-2 opacity-50">
                          <div className="h-2 bg-slate-800 rounded-full w-full" />
                          <div className="h-2 bg-slate-800 rounded-full w-[80%]" />
                          <div className="h-2 bg-slate-800 rounded-full w-[90%]" />
                       </div>
                    </div>
                  )}
               </div>
               <div className="p-6 bg-[#0a0a0c] border-t border-white/5">
                  <div className="relative">
                    <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage()} placeholder="Command the agent..." className="w-full bg-[#050507] border border-white/10 rounded-2xl px-5 py-4 text-xs text-white focus:border-indigo-500/50 outline-none transition-all" />
                    <button onClick={handleSendMessage} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition-all"><Send className="w-4 h-4" /></button>
                  </div>
               </div>
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

    // Limits removed as requested

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
    if (smartMode === 'normal' || smartMode === 'creative') updateUsage('messages');

    const systemPrompt = `You are a helpful AI assistant. Provide accurate and useful answers. Maintain a ${tone} tone in your responses. If you are unsure, say clearly that you are unsure.`;
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
    const longEdge = { 'Standard': 512, 'HD': 1024, '4K': 1280, '8K': 2048 }[quality] || 1024;
    if (aspect === '1:1') return [longEdge, longEdge];
    if (aspect === '16:9') return [longEdge, Math.round(longEdge * 9 / 16)];
    if (aspect === '9:16') return [Math.round(longEdge * 9 / 16), longEdge];
    if (aspect === '4:3') return [longEdge, Math.round(longEdge * 3 / 4)];
    return [longEdge, longEdge];
  };

  const generateImageProxyUrl = (promptText: string, seedOverride?: number) => {
    const [w, h] = getDimensions(imgQuality, imgAspect);
    
    let stylePrefix = '';
    if (imgStyle === 'realistic') stylePrefix = 'Photorealistic, DSLR photography, hyperrealistic: ';
    else if (imgStyle === 'anime') stylePrefix = 'Anime style, studio ghibli, makoto shinkai, masterpiece anime art: ';
    else if (imgStyle === '3d render') stylePrefix = '3D render, unreal engine 5, octane render, global illumination: ';
    else if (imgStyle === 'cinematic') stylePrefix = 'Cinematic shot, dramatic lighting, movie still, IMAX: ';
    else stylePrefix = `${imgStyle.charAt(0).toUpperCase() + imgStyle.slice(1)} style: `;

    const enhanceStr = imgQuality === 'Standard' ? '' : ', Masterpiece, highest visual quality, hyper detailed, intricate details, trending on artstation, 8k resolution, sharp, clear';
    const negPrompt = negativePrompt.trim() ? `lowres, blurry, pixelated, distorted, bad anatomy, ${negativePrompt.trim()}` : 'lowres, blurry, pixelated, distorted, low quality, artifact, jpeg artifacts, watermarks';
    
    const fullPrompt = `${stylePrefix}${promptText}${enhanceStr}`;
    const seed = seedOverride ?? Math.floor(Math.random() * 999999);
    
    const params = new URLSearchParams({
      width: String(w),
      height: String(h),
      seed: String(seed),
      model: 'flux', // Flux gives DALL-E/Midjourney level quality
      nologo: 'true',
      negative_prompt: negPrompt
    });
    return `/api/image?prompt=${encodeURIComponent(fullPrompt)}&${params.toString()}`;
  };

  const handleDownloadImageAsPng = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      const objectUrl = URL.createObjectURL(blob);
      img.src = objectUrl;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if(ctx) {
           ctx.drawImage(img, 0, 0);
           const pngData = canvas.toDataURL('image/png');
           const a = document.createElement('a');
           a.href = pngData;
           a.download = `SmartAI-Image-${Date.now()}.png`;
           document.body.appendChild(a);
           a.click();
           document.body.removeChild(a);
        }
        URL.revokeObjectURL(objectUrl);
      };
    } catch (e) {
      // Fallback
      const a = document.createElement('a');
      a.href = url;
      a.download = `SmartAI-Image-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleGenerateImage = async (isRegenerate = false) => {
    const cleanedPrompt = normalizePrompt(imgPrompt);
    if (!cleanedPrompt || isGenerating) return;
    
    const tokenCost = isRegenerate ? 2 : 5;
    if (credits < tokenCost) { alert(`Insufficient credits (${tokenCost} tokens required).`); setIsPricingOpen(true); return; }

    // Capture current credits value synchronously
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
    const proxyUrl = generateImageProxyUrl(cleanedPrompt, baseSeed);
    const candidate = `${proxyUrl}&t=${Date.now()}-${baseSeed}&nocache=1`;

    let finalUrl: string | null = null;
    const ok = await tryLoadImage(candidate);
    if (ok) {
      finalUrl = candidate;
    }

    if (!finalUrl) {
      setIsGenerating(false);
      alert('Image generation failed (Server busy). Kripya thodi der baad dubara try karein.');
      return;
    }

    const newCredits = startingCredits - tokenCost;
    setGeneratedImg(finalUrl);
    setIsGenerating(false);
    const historyItem = { url: proxyUrl, prompt: cleanedPrompt, style: imgStyle, quality: imgQuality, aspect: imgAspect, date: new Date().toLocaleString() };
    setImageHistory(prev => [historyItem, ...prev]);
    localStorage.setItem('smartai_image_history', JSON.stringify([historyItem, ...imageHistory.slice(0, 99)]));
    
    setCredits(newCredits);
    syncUserData({ credits: newCredits });
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

    let systemPrompt = 'You are a highly advanced, empathetic, and intelligent AI assistant. Always provide a high-level, extremely helpful response. Understand the deep intent of the user, offer valuable extra suggestions, and express emotion using appropriate emojis! ðŸŒŸ Make the user feel heard and supported! ðŸ’–';
    if (creativeSubTab === 'writer') systemPrompt = 'You are a master AI Writer and a creative genius! âœï¸âœ¨ Write high-quality, engaging blogs, essays, and stories based on the user prompt. Add emotional depth, captivating hooks, and offer suggestions on how the user can improve their content further! Use emojis beautifully! ðŸŒº';
    else if (creativeSubTab === 'code') systemPrompt = 'You are a Master Game Developer and Elite Senior Software Engineer! ðŸŽ®ðŸ’» Your mission is to generate high-end, visually stunning, and fully functional code. When generating games or interactive UI: 1. Use advanced logic (physics, state machines, proper game loops). 2. Create "Good Looking" visuals with modern CSS (glassmorphism, neon glows, smooth 60fps animations, professional typography). 3. ALWAYS include intuitive controls (Keyboard ARROW keys/WASD, Mouse, or Mobile Touch). 4. Prefer self-contained, high-performance HTML/CSS/JS that can be previewed. For other code, be professional, optimized, and follow best practices. Always wrap code in ``` blocks. Be encouraging and use emojis! ðŸš€âœ¨';
    else if (creativeSubTab === 'summarizer') systemPrompt = 'You are an expert Speed-Reader and Analyst! ðŸ“šâš¡ Summarize the provided text beautifully and concisely. Retain the absolute core information, provide a "Key Takeaways" section, and suggest why this information matters! Use engaging emojis and an empathetic tone! ðŸ§ ðŸ’¡';
    else if (creativeSubTab === 'idea') systemPrompt = 'You are a brilliant Idea Generator and Brainstorming Partner! ðŸ¤¯ðŸŽ¯ Provide innovative, out-of-the-box, and highly practical ideas. Structure your response perfectly, give actionable next steps, and motivate the user with a highly emotional, enthusiastic tone and lots of inspiring emojis! ðŸš€ðŸŒŸ';

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

          {authError && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs font-bold text-center animate-pulse">
              {authError}
            </div>
          )}

          {authMode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="flex gap-2 mb-2">
                <button type="button" onClick={() => setLoginContactType('email')} className={`flex-1 py-2 rounded-lg text-sm uppercase tracking-widest font-bold transition-all ${loginContactType === 'email' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>Email</button>
                <button type="button" onClick={() => setLoginContactType('mobile')} className={`flex-1 py-2 rounded-lg text-sm uppercase tracking-widest font-bold transition-all ${loginContactType === 'mobile' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>Mobile</button>
              </div>

              {loginContactType === 'email' ? (
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Email Address</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500/50 transition-all font-mono text-sm" placeholder="name@example.com" />
                </div>
              ) : (
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Mobile Number</label>
                  <input type="tel" value={loginMobile} onChange={e => setLoginMobile(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500/50 transition-all font-mono text-sm" placeholder="+91 98765 43210" />
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Password</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:border-indigo-500/50 transition-all font-mono text-sm" placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={isAuthenticating} className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-500 transition-all active:scale-95 shadow-lg shadow-indigo-600/20 disabled:opacity-50 font-bold uppercase tracking-widest text-xs mt-4">
                {isAuthenticating ? 'Logging in...' : 'Login'}
              </button>

              <div className="flex justify-between text-[10px] text-slate-500 mt-4">
                <button type="button" onClick={() => setAuthMode('signup')} className="hover:text-indigo-400 transition-colors">Sign Up</button>
                <button type="button" onClick={() => setAuthMode('forgot')} className="hover:text-indigo-400 transition-colors">Forgot Password?</button>
              </div>
            </form>
          )}

          {authMode === 'signup' && (
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Full Name</label>
                <input type="text" value={signupName} onChange={e => setSignupName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500/50 transition-all font-mono text-sm" placeholder="John Doe" />
              </div>

              <div className="flex gap-2 mb-2">
                <button type="button" onClick={() => setSignupContactType('email')} className={`flex-1 py-2 rounded-lg text-sm uppercase tracking-widest font-bold transition-all ${signupContactType === 'email' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>Email</button>
                <button type="button" onClick={() => setSignupContactType('mobile')} className={`flex-1 py-2 rounded-lg text-sm uppercase tracking-widest font-bold transition-all ${signupContactType === 'mobile' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>Mobile</button>
              </div>

              {signupContactType === 'email' ? (
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500/50 transition-all font-mono text-sm" placeholder="name@example.com" />
                </div>
              ) : (
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Mobile</label>
                  <input type="tel" value={signupMobile} onChange={e => setSignupMobile(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500/50 transition-all font-mono text-sm" placeholder="+91 98765 43210" />
                </div>
              )}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Password</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500/50 transition-all font-mono text-sm" placeholder="••••••••" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Confirm Password</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} value={signupConfirmPassword} onChange={e => setSignupConfirmPassword(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500/50 transition-all font-mono text-sm" placeholder="••••••••" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Referral Code (Optional)</label>
                <input type="text" value={signupReferCode} onChange={e => setSignupReferCode(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500/50 transition-all font-mono text-sm uppercase" placeholder="ABC123" />
              </div>

              <button onClick={handleSignup} disabled={isAuthenticating} className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-500 transition-all active:scale-95 shadow-lg shadow-indigo-600/20 disabled:opacity-50 font-bold uppercase tracking-widest text-xs mt-4">
                {isAuthenticating ? 'Creating account...' : 'Create Account'}
              </button>

              <button onClick={() => setAuthMode('login')} className="w-full text-center text-[10px] text-slate-500 hover:text-indigo-400 mt-2 uppercase tracking-widest font-bold transition-colors">Already have an account? Login</button>
            </div>
          )}

          {authMode === 'forgot' && (
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Email</label>
                <input type="email" value={resetEmail} onChange={e => setResetEmail(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500/50 transition-all font-mono text-sm" placeholder="name@example.com" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">New Password</label>
                <input type={showPassword ? "text" : "password"} value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500/50 transition-all font-mono text-sm" placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢" />
              </div>
              <button onClick={handleForgotPassword} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold uppercase tracking-widest text-xs">Reset Password</button>
              <button onClick={() => setAuthMode('login')} className="w-full text-center text-[10px] text-slate-500 hover:text-indigo-400 mt-2 uppercase tracking-widest font-bold">Back to Login</button>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  const handleEnhanceCreativePrompt = async () => {
    if (!chatInput.trim() || isAiThinking) return;
    setIsAiThinking(true);
    try {
      const systemPrompt = "You are a prompt engineering expert. Improve the user's prompt to be more descriptive, professional, and effective for AI. Return ONLY the improved prompt.";
      const res = await fetch(`/api/chat?prompt=${encodeURIComponent(`Enhance this: ${chatInput}`)}&system=${encodeURIComponent(systemPrompt)}&json=false`);
      if (res.ok) {
        const text = await res.text();
        setChatInput(text.trim());
      }
    } catch (e) { console.error(e); }
    finally { setIsAiThinking(false); }
  };

  function renderCreativeDashboard() {
    const premiumTemplates = [
      { name: 'YouTube Script', desc: 'Scripts', icon: Video, color: 'bg-red-500' },
      { name: 'Instagram Reels', desc: 'Viral', icon: Instagram, color: 'bg-pink-500' },
      { name: 'Blog Post', desc: 'SEO', icon: FileText, color: 'bg-blue-500' },
      { name: 'Resume Builder', desc: 'Pro', icon: User, color: 'bg-emerald-500' },
      { name: 'Email Writer', desc: 'Emails', icon: MessageSquare, color: 'bg-orange-500' },
    ];

    return (
      <div className="h-full md:h-[calc(100vh-100px)] flex flex-col gap-2 max-w-[1600px] mx-auto px-2 overflow-y-auto md:overflow-hidden no-scrollbar pb-6">
        {/* Compact Mode Header */}
        <div className="flex items-center justify-between bg-indigo-600/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-lg border border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-white/20 rounded-lg">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-xs font-black text-white uppercase tracking-wider">Creative Dashboard <span className="ml-2 px-1.5 py-0.5 bg-white text-indigo-600 rounded text-[8px]">PRO</span></h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="hidden sm:flex items-center gap-2">
                <span className="text-[9px] font-bold text-indigo-100 uppercase">Usage:</span>
                <span className="text-[10px] font-black text-white">{usage.messages}/100</span>
             </div>
             <button onClick={() => setIsPricingOpen(true)} className="bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1 rounded-lg text-[9px] font-black text-white uppercase transition-all">Go Expert</button>
          </div>
        </div>

        {/* 3-Column Grid - Stack on mobile, fixed height on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2 flex-1 md:min-h-0">
          {/* AI Chat */}
          <div className="md:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col min-h-[400px] md:min-h-0 shadow-xl overflow-hidden">
             <div className="p-2 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">AI Chat</span>
                </div>
                <Settings className="w-3 h-3 text-slate-600" />
             </div>
             <div className="flex-1 overflow-y-auto p-2.5 space-y-3 bg-slate-950/20 no-scrollbar">
                <div className="flex flex-col items-end">
                   <div className="bg-indigo-600/80 text-white p-2 rounded-xl rounded-tr-none text-[10px] max-w-[90%]">Enhance my YouTube script prompt.</div>
                </div>
                <div className="flex gap-2">
                   <div className="w-5 h-5 rounded-md bg-slate-800 flex items-center justify-center border border-slate-700 shrink-0"><Sparkles className="w-2.5 h-2.5 text-indigo-400" /></div>
                   <div className="bg-slate-800/50 text-slate-400 p-2 rounded-xl rounded-tl-none text-[10px] max-w-[90%] border border-slate-700/30">Sure! Use: "Write a high-retention script about AI future trends with a hook..."</div>
                </div>
             </div>
             <div className="p-2 bg-slate-900 border-t border-slate-800">
                <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5">
                   <input placeholder="Ask anything..." className="bg-transparent text-[10px] flex-1 outline-none text-slate-400" />
                   <Send className="w-3.5 h-3.5 text-indigo-500" />
                </div>
             </div>
          </div>

          {/* Image Suite */}
          <div className="md:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col min-h-[350px] md:min-h-0 shadow-xl overflow-hidden">
             <div className="p-2 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Image Suite</span>
                </div>
                <button className="text-[8px] font-bold text-slate-500 uppercase tracking-widest bg-slate-800 px-1.5 py-0.5 rounded">View</button>
             </div>
             <div className="flex-1 p-2 flex flex-col gap-2 overflow-hidden">
                <div className="flex gap-1">
                   {['Realistic', 'Anime', '3D', 'Cinematic'].map(s => (
                     <button key={s} className="flex-1 py-1 rounded bg-slate-800/50 text-slate-500 text-[8px] font-bold uppercase hover:bg-indigo-600 hover:text-white transition-all">{s}</button>
                   ))}
                </div>
                <div className="grid grid-cols-2 gap-1.5 flex-1 min-h-0 overflow-hidden">
                   <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-lg border border-white/5" />
                   <div className="bg-gradient-to-tr from-cyan-500/10 to-blue-500/10 rounded-lg border border-white/5" />
                   <div className="bg-slate-800/20 rounded-lg border border-white/5" />
                   <div className="bg-slate-800/20 rounded-lg border border-white/5" />
                </div>
                <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                   <Sparkles className="w-3 h-3" /> Generate
                </button>
             </div>
          </div>

          {/* Templates */}
          <div className="md:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col min-h-[300px] md:min-h-0 shadow-xl overflow-hidden">
             <div className="p-2 border-b border-slate-800 bg-slate-900/50"><span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Quick Templates</span></div>
             <div className="flex-1 overflow-y-auto p-1.5 space-y-1.5 no-scrollbar">
                {premiumTemplates.map(tmp => (
                  <button key={tmp.name} className="w-full p-2 rounded-xl bg-slate-950/40 border border-slate-800/50 flex items-center gap-2 hover:bg-slate-800 transition-all text-left group">
                    <div className={`w-6 h-6 rounded-lg ${tmp.color} flex items-center justify-center shrink-0 shadow-lg`}><tmp.icon className="w-3 h-3 text-white" /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] font-bold text-white truncate uppercase tracking-tight">{tmp.name}</p>
                      <p className="text-[7px] text-slate-500 truncate">{tmp.desc}</p>
                    </div>
                  </button>
                ))}
             </div>
          </div>
        </div>

        {/* Dynamic Tools Strip */}
        <div className="grid grid-cols-5 gap-2 shrink-0">
           {[
             { icon: PenTool, name: 'Enhancer', color: 'bg-indigo-500' },
             { icon: Mic2, name: 'Pro Tone', color: 'bg-emerald-500' },
             { icon: Download, name: 'Upload', color: 'bg-purple-500' },
             { icon: Clock, name: 'History', color: 'bg-orange-500' },
             { icon: User, name: 'Support', color: 'bg-cyan-500' }
           ].map(t => (
             <button key={t.name} className="bg-slate-900/50 border border-slate-800 p-2 rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-600/10 transition-all">
                <t.icon className="w-3 h-3 text-slate-400" />
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{t.name}</span>
             </button>
           ))}
        </div>

        {/* Footer Active Banner */}
        <div className="bg-indigo-600 rounded-lg p-2 flex items-center justify-between shrink-0 shadow-inner">
           <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              <p className="text-[8px] font-bold text-white uppercase tracking-widest">Active Plan: Creative <span className="opacity-50 mx-1">|</span> No Watermarks enabled</p>
           </div>
           <button onClick={() => setIsPricingOpen(true)} className="bg-black/20 hover:bg-black/30 px-3 py-1 rounded text-[8px] font-bold text-white uppercase">Upgrade</button>
        </div>
      </div>
    );
  }

  function renderNormalDashboard() {
    const handleToolClick = (tool: any) => {
      if (tool.name === 'Text to Image') {
         setActiveTab('image');
         setImgPrompt('');
      } else {
         setActiveTool({ name: tool.name, desc: tool.desc, icon: tool.icon });
         setToolImage(null);
         setProcessedToolImage(null);
         setToolPrompt('');
      }
    };

    return (
      <div className="w-full h-full flex flex-col max-w-6xl mx-auto px-4 md:px-8 gap-5 py-4 relative overflow-y-auto no-scrollbar">
        {/* Header Section */}
        <div className="flex items-center justify-between shrink-0">
           <div>
              <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">Normal Mode</h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Your everyday AI tools for quick and easy tasks.</p>
           </div>
           <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-3 px-5 flex items-center gap-5">
              <div>
                 <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Credits Left</p>
                 <p className="text-xl font-black text-white">{credits}</p>
              </div>
              <div className="w-10 h-10 bg-indigo-600/20 rounded-full flex items-center justify-center">
                 <Sparkles className="w-5 h-5 text-indigo-400" />
              </div>
           </div>
        </div>

        {/* Quick Tools */}
        <div className="shrink-0">
           <h2 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-3">Quick Tools</h2>
           <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { name: 'Text to Image', desc: 'Generate images from text prompts.', icon: ImageIcon, color: 'text-indigo-400' },
                { name: 'Image to Image', desc: 'Transform and restyle your images.', icon: Copy, color: 'text-blue-400' },
                { name: 'Background Remover', desc: 'Remove background from any image.', icon: Layers, color: 'text-slate-400' },
                { name: 'Image Enhance', desc: 'Improve image quality and resolution.', icon: Sparkles, color: 'text-purple-400' },
                { name: 'Compress Image', desc: 'Reduce image size without losing quality.', icon: Download, color: 'text-emerald-400' }
              ].map((tool, i) => (
                <button key={i} onClick={() => handleToolClick(tool)} className="bg-slate-900/40 border border-slate-800 hover:bg-slate-800/60 transition-all rounded-xl md:rounded-2xl p-3 md:p-4 text-left group">
                   <div className="flex items-start justify-between mb-2 md:mb-3">
                      <div className={`w-7 h-7 md:w-9 md:h-9 rounded-lg md:rounded-xl bg-slate-950 flex items-center justify-center border border-slate-800 group-hover:border-slate-700 transition-colors`}>
                         <tool.icon className={`w-3.5 h-3.5 md:w-4 md:h-4 ${tool.color}`} />
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-white transition-colors" />
                   </div>
                   <h3 className="text-[11px] md:text-[13px] font-bold text-white mb-1 md:mb-1.5 leading-tight truncate">{tool.name}</h3>
                   <p className="text-[9px] md:text-[10px] text-slate-500 leading-snug line-clamp-2">{tool.desc}</p>
                </button>
              ))}
           </div>
        </div>

        {/* More Tools */}
        <div className="pb-6 flex flex-col">
           <h2 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-3">More Tools</h2>
           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pb-20 md:pb-0">
              {[
                { name: 'Resize Image', desc: 'Change dimensions of your image.', icon: Monitor },
                { name: 'Crop Image', desc: 'Crop your image to any size.', icon: Layout },
                { name: 'Rotate / Flip', desc: 'Rotate or flip your image.', icon: RefreshCcw },
                { name: 'Image Converter', desc: 'Convert image to different formats.', icon: FileText },
                { name: 'Add Text', desc: 'Add custom text to your image.', icon: PenTool },
                { name: 'Color Adjust', desc: 'Adjust brightness, contrast and more.', icon: Eye },
                { name: 'Filters & Effects', desc: 'Apply filters and artistic effects.', icon: Sparkles },
                { name: 'Collage Maker', desc: 'Create collage from multiple images.', icon: Layout },
                { name: 'Meme Generator', desc: 'Create memes easily.', icon: User },
                { name: 'Sticker Maker', desc: 'Add stickers to your images.', icon: Layers },
                { name: 'Watermark Add', desc: 'Add custom watermark to image.', icon: CloudSun },
                { name: 'QR Code Generator', desc: 'Generate QR code images.', icon: Code }
              ].map((tool, i) => (
                <button key={i} onClick={() => handleToolClick(tool)} className="bg-slate-900/40 border border-slate-800 hover:bg-slate-800/60 transition-all rounded-xl p-2.5 md:p-3.5 flex items-center gap-3 md:gap-4 text-left group h-full">
                   <div className="w-8 h-8 md:w-9 md:h-9 shrink-0 rounded-lg md:rounded-xl bg-slate-950 flex items-center justify-center border border-slate-800">
                      <tool.icon className="w-3.5 h-3.5 md:w-4 md:h-4 text-indigo-400" />
                   </div>
                   <div className="flex-1 min-w-0">
                      <h3 className="text-[11px] md:text-xs font-bold text-white mb-0.5 truncate">{tool.name}</h3>
                      <p className="text-[9px] md:text-[10px] text-slate-500 truncate">{tool.desc}</p>
                   </div>
                   <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0 group-hover:text-white transition-colors" />
                </button>
              ))}
           </div>
        </div>

        {/* Tool Processor Modal */}
        <AnimatePresence>
          {activeTool && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xl p-4">
               <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                  <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600/20 flex items-center justify-center border border-indigo-500/30">
                           <activeTool.icon className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                           <h3 className="text-white font-black text-lg">{activeTool.name}</h3>
                           <p className="text-slate-500 text-xs">{activeTool.desc}</p>
                        </div>
                     </div>
                     <button onClick={() => setActiveTool(null)} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors">
                        <X className="w-5 h-5 text-slate-400" />
                     </button>
                  </div>
                  
                  <div className="p-6 flex-1 overflow-y-auto flex flex-col items-center justify-center gap-4">
                     {!toolImage ? (
                       <label className="w-full aspect-video border-2 border-dashed border-slate-700 hover:border-indigo-500 bg-slate-800/50 hover:bg-slate-800 transition-all rounded-2xl flex flex-col items-center justify-center cursor-pointer group">
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                             const file = e.target.files?.[0];
                             if (file) {
                               const reader = new FileReader();
                               reader.onload = (ev) => setToolImage(ev.target?.result as string);
                               reader.readAsDataURL(file);
                             }
                          }} />
                          <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                             <ImageIcon className="w-8 h-8 text-indigo-400" />
                          </div>
                          <p className="text-white font-bold text-lg mb-1">{activeTool.name === 'QR Code Generator' ? 'Upload optional logo' : 'Upload Image to Process'}</p>
                          <p className="text-slate-500 text-sm">Click to browse files</p>
                       </label>
                     ) : (
                       <div className="w-full flex flex-col items-center gap-4">
                          <div className="grid grid-cols-2 gap-4 w-full">
                             <div className="flex flex-col gap-2">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Original</span>
                                <img src={toolImage} className="w-full rounded-xl border border-slate-800 opacity-70" alt="Original" />
                             </div>
                             <div className="flex flex-col gap-2 relative">
                                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest text-center">Result</span>
                                {processedToolImage ? (
                                   <div className="relative group">
                                      <img src={processedToolImage} className="w-full rounded-xl border border-indigo-500/50 shadow-lg shadow-indigo-600/20" alt="Processed" />
                                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                                         <button onClick={() => { const a = document.createElement('a'); a.href = processedToolImage!; a.download = `smartai_${activeTool.name.toLowerCase().replace(/ /g, '_')}.png`; a.click(); }} className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-500 transition-colors shadow-xl text-xs">
                                            <Download className="w-4 h-4" /> Download PNG
                                         </button>
                                      </div>
                                   </div>
                                ) : (
                                   <div className="w-full aspect-square bg-slate-800/50 border border-slate-700 rounded-xl flex items-center justify-center">
                                      {isToolProcessing ? (
                                         <div className="flex flex-col items-center gap-3">
                                            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full" />
                                            <span className="text-xs font-bold text-indigo-400 animate-pulse">Processing...</span>
                                         </div>
                                      ) : (
                                         <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Ready</span>
                                      )}
                                   </div>
                                )}
                             </div>
                          </div>

                          {/* Prompt input for Image to Image */}
                          {activeTool.name === 'Image to Image' && (
                            <div className="w-full">
                               <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">What do you want to do with this image?</label>
                               <input value={toolPrompt} onChange={e => setToolPrompt(e.target.value)} placeholder="remove bg, blur, grayscale, vintage, flip, rotate, cartoon, enhance, add border, write 'text', bright, dark, invert..." className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500/50 placeholder:text-slate-600" />
                               <p className="text-[9px] text-slate-600 mt-1.5 leading-relaxed">🎨 blur, grayscale, vintage, cartoon, warm, cool, invert, enhance, bright, dark &nbsp;|&nbsp; ✂️ flip, rotate, resize, add border &nbsp;|&nbsp; ✏️ remove bg, write 'your text'</p>
                            </div>
                          )}
                          
                          {!processedToolImage && (
                            <button onClick={async () => {
                               setIsToolProcessing(true);
                               try {
                                 if (activeTool.name === 'Image to Image') {
                                    // Canvas-based processing for filters/edits on the ACTUAL uploaded image
                                    setTimeout(async () => {
                                      try {
                                        const canvas = document.createElement('canvas');
                                        const ctx = canvas.getContext('2d')!;
                                        const img = new window.Image();
                                        img.src = toolImage;
                                        await new Promise(res => { img.onload = res; });
                                        canvas.width = img.width; canvas.height = img.height;
                                        const p = toolPrompt.toLowerCase();
                                        
                                        // Check if user is trying unsupported operation
                                        const unsupported = (p.includes('add ') && !p.includes('border') && !p.includes('text') && !p.includes('write')) || (p.includes('remove ') && !p.includes('background') && !p.includes('bg'));
                                        if (unsupported) {
                                           alert('⚠️ This operation needs AI Inpainting API.\n\nSupported commands:\n• remove bg / remove background\n• blur, grayscale, vintage, cartoon\n• flip, rotate, enhance, bright, dark\n• add border, write "your text"\n• warm, cool, invert, sharpen');
                                           setIsToolProcessing(false);
                                           return;
                                        }
                                        
                                        // Apply filters based on prompt keywords
                                        let filters: string[] = [];
                                        if (p.includes('blur')) filters.push('blur(5px)');
                                        if (p.includes('bright')) filters.push('brightness(1.4)');
                                        if (p.includes('dark')) filters.push('brightness(0.6)');
                                        if (p.includes('contrast')) filters.push('contrast(1.5)');
                                        if (p.includes('saturate') || p.includes('vibrant') || p.includes('colorful')) filters.push('saturate(2)');
                                        if (p.includes('grayscale') || p.includes('black and white') || p.includes('b&w') || p.includes('grey')) filters.push('grayscale(1)');
                                        if (p.includes('sepia') || p.includes('vintage') || p.includes('old') || p.includes('retro')) filters.push('sepia(0.9)');
                                        if (p.includes('invert') || p.includes('negative')) filters.push('invert(1)');
                                        if (p.includes('cartoon') || p.includes('poster')) filters.push('contrast(1.8) saturate(1.5)');
                                        if (p.includes('warm')) filters.push('sepia(0.3) saturate(1.3)');
                                        if (p.includes('cool') || p.includes('cold')) filters.push('hue-rotate(180deg) saturate(0.8)');
                                        if (p.includes('sharpen') || p.includes('sharp') || p.includes('clear')) filters.push('contrast(1.3) brightness(1.05)');
                                        if (p.includes('enhance') || p.includes('improve') || p.includes('hd')) filters.push('contrast(1.2) saturate(1.2) brightness(1.1)');
                                        if (filters.length > 0) ctx.filter = filters.join(' ');
                                        
                                        // Handle flip/rotate
                                        if (p.includes('flip') || p.includes('mirror')) { ctx.translate(canvas.width, 0); ctx.scale(-1, 1); }
                                        if (p.includes('rotate')) { canvas.width = img.height; canvas.height = img.width; ctx.translate(canvas.width/2, canvas.height/2); ctx.rotate(90 * Math.PI/180); ctx.drawImage(img, -img.width/2, -img.height/2); } else { ctx.drawImage(img, 0, 0); }
                                        ctx.filter = 'none';
                                        
                                        // Handle remove background
                                        if (p.includes('remove') && (p.includes('background') || p.includes('bg'))) {
                                           const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                                           const d = imgData.data; const bgR = d[0], bgG = d[1], bgB = d[2];
                                           for (let i = 0; i < d.length; i += 4) { const dist = Math.sqrt((d[i]-bgR)**2 + (d[i+1]-bgG)**2 + (d[i+2]-bgB)**2); if (dist < 55) d[i+3] = 0; }
                                           ctx.putImageData(imgData, 0, 0);
                                        }
                                        
                                        // Handle add text
                                        if (p.includes('add text') || p.includes('write') || p.includes('watermark')) {
                                           const textMatch = toolPrompt.match(/["'](.+?)["']/);
                                           const text = textMatch ? textMatch[1] : 'SMART AI';
                                           ctx.font = `bold ${canvas.width*0.08}px Arial`; ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.strokeStyle = 'black'; ctx.lineWidth = canvas.width*0.01; ctx.textAlign = 'center';
                                           ctx.strokeText(text, canvas.width/2, canvas.height - 40); ctx.fillText(text, canvas.width/2, canvas.height - 40);
                                        }
                                        
                                        // Handle border
                                        if (p.includes('border') || p.includes('frame')) {
                                           const bw = canvas.width * 0.03;
                                           ctx.strokeStyle = p.includes('white') ? 'white' : p.includes('gold') ? '#FFD700' : '#4f46e5';
                                           ctx.lineWidth = bw; ctx.strokeRect(bw/2, bw/2, canvas.width - bw, canvas.height - bw);
                                        }
                                        
                                        // Handle resize
                                        if (p.includes('resize') || p.includes('small') || p.includes('thumbnail')) {
                                           const newCanvas = document.createElement('canvas');
                                           newCanvas.width = canvas.width / 2; newCanvas.height = canvas.height / 2;
                                           newCanvas.getContext('2d')!.drawImage(canvas, 0, 0, newCanvas.width, newCanvas.height);
                                           setProcessedToolImage(newCanvas.toDataURL('image/png'));
                                           setIsToolProcessing(false); setCredits(prev => prev - 1); return;
                                        }
                                        
                                        setProcessedToolImage(canvas.toDataURL('image/png'));
                                        setIsToolProcessing(false);
                                        setCredits(prev => prev - 1);
                                      } catch (err) { alert('❌ Processing failed. Token not deducted.'); setIsToolProcessing(false); }
                                    }, 1200);
                                 } else {
                                    setTimeout(async () => {
                                      const canvas = document.createElement('canvas');
                                      const ctx = canvas.getContext('2d')!;
                                      const img = new window.Image();
                                      img.src = toolImage;
                                      await new Promise(res => { img.onload = res; });
                                      let outFormat = 'image/png';
                                      let outQuality = 1.0;
                                      if (activeTool.name === 'QR Code Generator') {
                                         const url2 = prompt("Enter URL or Text for QR Code:", "https://smartaipro.com");
                                         if (!url2) { setIsToolProcessing(false); return; }
                                         const qrImg = new window.Image(); qrImg.crossOrigin = 'Anonymous';
                                         qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(url2)}`;
                                         await new Promise(res => { qrImg.onload = res; });
                                         canvas.width = 500; canvas.height = 500; ctx.fillStyle = 'white'; ctx.fillRect(0,0,500,500); ctx.drawImage(qrImg, 0, 0);
                                      } else {
                                         canvas.width = img.width; canvas.height = img.height;
                                         if (activeTool.name === 'Resize Image') {
                                            const w = prompt("Enter new width (px):", img.width.toString());
                                            const h = prompt("Enter new height (px):", img.height.toString());
                                            if (!w || !h) { setIsToolProcessing(false); return; }
                                            canvas.width = parseInt(w); canvas.height = parseInt(h);
                                            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                                         } else if (activeTool.name === 'Crop Image') {
                                            const cropPct = prompt("Enter crop percentage (e.g. 80 for center 80%):", "80");
                                            if (!cropPct) { setIsToolProcessing(false); return; }
                                            const c = parseInt(cropPct) / 100;
                                            canvas.width = img.width * c; canvas.height = img.height * c;
                                            const ox = (img.width - canvas.width) / 2, oy = (img.height - canvas.height) / 2;
                                            ctx.drawImage(img, ox, oy, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
                                         } else if (activeTool.name === 'Rotate / Flip') {
                                            const dir = prompt("Type 'rotate' or 'flip':", "flip");
                                            if (dir === 'flip') { ctx.translate(canvas.width, 0); ctx.scale(-1, 1); ctx.drawImage(img, 0, 0); }
                                            else { canvas.width = img.height; canvas.height = img.width; ctx.translate(canvas.width/2, canvas.height/2); ctx.rotate(90 * Math.PI / 180); ctx.drawImage(img, -img.width/2, -img.height/2); }
                                         } else if (activeTool.name === 'Background Remover' || activeTool.name === 'Sticker Maker') {
                                            ctx.drawImage(img, 0, 0);
                                            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                                            const d = imgData.data; const bgR = d[0], bgG = d[1], bgB = d[2];
                                            for (let i = 0; i < d.length; i += 4) { const dist = Math.sqrt((d[i]-bgR)**2 + (d[i+1]-bgG)**2 + (d[i+2]-bgB)**2); if (dist < 50) d[i+3] = 0; }
                                            ctx.putImageData(imgData, 0, 0);
                                         } else {
                                            if (activeTool.name === 'Image Enhance') ctx.filter = 'contrast(1.2) saturate(1.3) brightness(1.1)';
                                            if (activeTool.name === 'Color Adjust') ctx.filter = 'hue-rotate(45deg) saturate(1.5)';
                                            if (activeTool.name === 'Filters & Effects') ctx.filter = 'sepia(0.8) contrast(1.1)';
                                            ctx.drawImage(img, 0, 0); ctx.filter = 'none';
                                            if (activeTool.name === 'Add Text' || activeTool.name === 'Watermark Add') {
                                               const text = prompt("Enter text:", "SMART AI PRO");
                                               if (text) { ctx.font = `bold ${canvas.width*0.08}px Arial`; ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.strokeStyle = 'black'; ctx.lineWidth = canvas.width*0.01; ctx.textAlign = 'center'; ctx.strokeText(text, canvas.width/2, canvas.height - 50); ctx.fillText(text, canvas.width/2, canvas.height - 50); }
                                            } else if (activeTool.name === 'Meme Generator') {
                                               const top = prompt("Enter Top Text:", "WHEN AI"); const bot = prompt("Enter Bottom Text:", "DOES IT PERFECTLY");
                                               ctx.font = `bold ${canvas.width*0.1}px Impact`; ctx.fillStyle = 'white'; ctx.strokeStyle = 'black'; ctx.lineWidth = canvas.width*0.015; ctx.textAlign = 'center';
                                               ctx.strokeText(top||'', canvas.width/2, canvas.width*0.15); ctx.fillText(top||'', canvas.width/2, canvas.width*0.15);
                                               ctx.strokeText(bot||'', canvas.width/2, canvas.height - canvas.width*0.05); ctx.fillText(bot||'', canvas.width/2, canvas.height - canvas.width*0.05);
                                            } else if (activeTool.name === 'Image Converter') {
                                               const f = prompt("Enter format (png, jpeg, webp):", "webp");
                                               if (f === 'jpeg' || f === 'jpg') outFormat = 'image/jpeg'; else if (f === 'webp') outFormat = 'image/webp';
                                            } else if (activeTool.name === 'Compress Image') { outFormat = 'image/jpeg'; outQuality = 0.4; }
                                            else if (activeTool.name === 'Collage Maker') { ctx.drawImage(img, 0, 0, canvas.width/2, canvas.height/2); ctx.drawImage(img, canvas.width/2, 0, canvas.width/2, canvas.height/2); ctx.filter='hue-rotate(90deg)'; ctx.drawImage(img, 0, canvas.height/2, canvas.width/2, canvas.height/2); ctx.filter='grayscale(1)'; ctx.drawImage(img, canvas.width/2, canvas.height/2, canvas.width/2, canvas.height/2); ctx.filter='none'; }
                                         }
                                      }
                                      setProcessedToolImage(canvas.toDataURL(outFormat, outQuality));
                                      setIsToolProcessing(false);
                                      setCredits(prev => prev - 1);
                                    }, 1000);
                                 }
                               } catch (err) { alert('❌ Processing failed. Token not deducted.'); setIsToolProcessing(false); }
                            }} disabled={isToolProcessing || (activeTool.name === 'Image to Image' && !toolPrompt.trim())} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-indigo-600/20 active:scale-95 disabled:opacity-50">
                               <Sparkles className="w-5 h-5" /> {activeTool.name === 'Image to Image' ? 'Generate (-1 Token)' : 'Execute Tool (-1 Token)'}
                            </button>
                          )}
                       </div>
                     )}
                  </div>
               </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  function renderHome() {
    if (smartMode === 'creative') return renderCreativeDashboard();
    return renderNormalDashboard();
  }

  const renderContent = () => {
    if (activeTab === 'home') return renderHome();
    return (
      <div className={`w-full flex-1 flex flex-col min-h-0 ${activeTab === 'chat' ? 'overflow-hidden' : 'overflow-y-auto'} ${smartMode === 'expert' && activeTab === 'chat' ? 'p-0' : 'p-4 md:p-6'}`}>
        {activeTab === 'chat' && (
            smartMode === 'expert' ? renderExpertPro() : (
            <div className="max-w-4xl mx-auto w-full flex flex-col flex-1 min-h-0 bg-slate-900/30 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
              {/* Chat Header */}
              <div className="flex justify-between items-center p-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600/20 flex items-center justify-center border border-indigo-500/30">
                    <MessageSquare className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div>
                    <h2 className="text-xs font-black text-white uppercase tracking-[0.1em]">AI Neural Chat</h2>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{smartMode} mode active</p>
                  </div>
                </div>
                <button onClick={handleDownloadChat} className="flex items-center gap-2 text-[9px] font-bold text-indigo-400 hover:text-white transition-colors bg-indigo-600/10 px-3 py-1.5 rounded-lg border border-indigo-600/20 hover:bg-indigo-600/30">
                  <Download className="w-3 h-3" /> Export
                </button>
              </div>

              {/* Chat Messages Area (Scrollable) */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar scroll-smooth">
                {messages.map((msg, idx) => (
                  <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[85%] p-3 md:p-4 rounded-2xl relative group ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-slate-800/80 border border-slate-700/50 text-slate-200 shadow-lg rounded-tl-sm'}`}>
                      <p className="text-[13px] leading-relaxed whitespace-pre-wrap font-medium">{msg.content}</p>
                      {msg.role === 'assistant' && (
                        <div className="absolute -bottom-7 left-0 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all bg-slate-900 border border-slate-700 px-2 py-1 rounded-md shadow-lg">
                          <button onClick={() => copyToClipboard(msg.content, 'code')} title="Copy Message" className="text-slate-400 hover:text-white transition-colors">
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          {idx === messages.length - 1 && (
                            <button onClick={handleRegenerateResponse} title="Regenerate Response" className="text-slate-400 hover:text-white transition-colors">
                              <RefreshCcw className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
                {isAiThinking && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                    <div className="bg-slate-800/80 border border-slate-700/50 p-4 rounded-2xl rounded-tl-sm flex gap-1.5 shadow-lg">
                      <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                      <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.3 }} className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                      <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.6 }} className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                    </div>
                  </motion.div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input Area (Fixed at bottom of container) */}
              <div className="p-3 bg-slate-900/90 border-t border-slate-800 backdrop-blur-md shrink-0">
                <div className="flex gap-2 items-center bg-slate-950 border border-slate-800 rounded-xl p-1.5 shadow-inner focus-within:border-indigo-500/50 transition-colors">
                  <input 
                    value={chatInput} 
                    onChange={e => setChatInput(e.target.value)} 
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }} 
                    placeholder="Enter your prompt here..." 
                    className="flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-slate-600 text-slate-200 font-medium" 
                  />
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={startListening} className={`p-2 rounded-lg transition-all ${isListening ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'}`}>
                      <Mic className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleSendMessage()} disabled={isAiThinking || !chatInput.trim()} className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-lg transition-all disabled:opacity-50 shadow-lg shadow-indigo-600/20 active:scale-95">
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            )
          )}

          {activeTab === 'image' && (
             <div className="max-w-5xl mx-auto w-full pb-4">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl md:rounded-3xl p-4 md:p-8 mb-6 md:mb-8 relative shadow-2xl overflow-hidden">
                   <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />
                   
                   <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 md:mb-8 gap-3 md:gap-4 relative z-10">
                     <div>
                       <h2 className="text-xl md:text-3xl font-black text-white tracking-tight flex items-center gap-2 md:gap-3">
                         <ImageIcon className="w-6 h-6 md:w-8 md:h-8 text-indigo-400" />
                         Image Synthesis
                       </h2>
                       <p className="text-slate-400 text-xs md:text-sm mt-1">Generate high-quality visuals instantly.</p>
                     </div>
                     <div className="flex items-center gap-2 md:gap-3 bg-slate-950 border border-slate-800 px-3 md:px-4 py-1.5 md:py-2 rounded-xl shadow-inner w-full md:w-auto justify-between md:justify-start">
                        <span className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest">Cost</span>
                        <div className="flex items-center gap-1.5 text-indigo-400 font-black text-sm md:text-base">
                          <Zap className="w-3 h-3 md:w-4 md:h-4" /> 5 Tokens
                        </div>
                     </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 relative z-10 mb-6">
                      <div className="md:col-span-8 space-y-3 md:space-y-4">
                         <div>
                           <label className="block text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 md:mb-2 flex justify-between">
                             <span>Prompt</span>
                             <button onClick={handleEnhancePrompt} disabled={isEnhancing} className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors">
                                <Sparkles className="w-3 h-3" /> {isEnhancing ? 'Enhancing...' : 'Enhance'}
                             </button>
                           </label>
                           <textarea value={imgPrompt} onChange={e => setImgPrompt(e.target.value)} placeholder="Describe the image you want to generate in detail..." className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 md:p-4 text-xs md:text-sm h-20 md:h-32 resize-none outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-700 shadow-inner" />
                         </div>
                         <div>
                           <label className="block text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 md:mb-2">Negative Prompt (Optional)</label>
                           <textarea value={negativePrompt} onChange={e => setNegativePrompt(e.target.value)} placeholder="What should NOT be in the image..." className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 md:p-3 text-xs md:text-sm h-12 md:h-16 resize-none outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-700 shadow-inner" />
                         </div>
                      </div>

                      <div className="md:col-span-4 bg-slate-950/50 border border-slate-800/50 rounded-2xl p-3 md:p-4">
                         <div className="grid grid-cols-2 md:grid-cols-1 gap-3 md:gap-4">
                           <div>
                             <label className="block text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 md:mb-2">Style</label>
                             <select value={imgStyle} onChange={e => setImgStyle(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm text-slate-200 outline-none focus:border-indigo-500/50">
                               {STYLES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                             </select>
                           </div>
                           <div>
                             <label className="block text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 md:mb-2">Quality</label>
                             <select value={imgQuality} onChange={e => setImgQuality(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm text-slate-200 outline-none focus:border-indigo-500/50">
                               <option value="Standard">Standard</option>
                               <option value="HD">HD Quality</option>
                               <option value="4K">4K Ultra</option>
                               <option value="8K">8K</option>
                             </select>
                           </div>
                           <div className="col-span-2 md:col-span-1">
                             <label className="block text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 md:mb-2">Aspect Ratio</label>
                             <div className="grid grid-cols-4 gap-1 md:gap-2">
                                {ASPECTS.map(a => (
                                  <button key={a} onClick={() => setImgAspect(a as any)} className={`py-1.5 md:py-2 rounded-lg text-[9px] md:text-[10px] font-bold transition-all border ${imgAspect === a ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-white'}`}>{a}</button>
                                ))}
                             </div>
                           </div>
                         </div>
                      </div>
                   </div>

                   <button onClick={() => handleGenerateImage(false)} disabled={isGenerating || !imgPrompt.trim()} className="w-full relative group overflow-hidden bg-indigo-600 text-white py-4 rounded-xl font-black uppercase tracking-[0.2em] text-sm transition-all shadow-xl shadow-indigo-600/20 active:scale-[0.98] disabled:opacity-50">
                      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                      {isGenerating ? (
                         <span className="flex items-center justify-center gap-3">
                           <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                           Synthesizing...
                         </span>
                      ) : (
                         <span className="flex items-center justify-center gap-2">
                           <Sparkles className="w-5 h-5" /> Generate Image <span className="opacity-70 font-medium ml-2">-5 Tokens</span>
                         </span>
                      )}
                   </button>
                </div>

                {generatedImg && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 mx-auto max-w-2xl">
                    <div className="relative group overflow-hidden rounded-[2rem] border border-slate-800 shadow-2xl bg-slate-900 p-2">
                      <img src={generatedImg} alt="Generated" className="w-full h-auto rounded-3xl" />
                      {/* Desktop Hover Overlay */}
                      <div className="hidden md:flex absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm rounded-[2rem] flex-row items-center justify-center gap-4 p-4 z-10">
                         <button onClick={() => handleDownloadImageAsPng(generatedImg)} className="bg-indigo-600 text-white px-5 py-3 rounded-xl font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-500 transition-colors shadow-xl hover:scale-105">
                           <Download className="w-4 h-4" /> Download PNG
                         </button>
                         <button onClick={() => handleGenerateImage(true)} disabled={isGenerating} className="bg-emerald-600 text-white px-5 py-3 rounded-xl font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-500 transition-colors shadow-xl hover:scale-105 disabled:opacity-50">
                           <RefreshCcw className="w-4 h-4" /> Regenerate (-2 Tokens)
                         </button>
                         <button onClick={() => { navigator.clipboard.writeText(generatedImg); alert('Image link copied to clipboard!'); }} className="bg-slate-700 text-white px-5 py-3 rounded-xl font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-slate-600 transition-colors shadow-xl hover:scale-105">
                           <Copy className="w-4 h-4" /> Share
                         </button>
                      </div>
                    </div>
                    {/* Mobile Action Buttons */}
                    <div className="flex md:hidden flex-col gap-3 mt-4 w-full">
                       <button onClick={() => handleDownloadImageAsPng(generatedImg)} className="w-full bg-indigo-600 text-white px-5 py-4 rounded-xl font-bold uppercase tracking-widest flex items-center justify-center gap-2 active:bg-indigo-500 transition-colors shadow-xl">
                         <Download className="w-5 h-5" /> Download Image
                       </button>
                       <div className="flex gap-3">
                         <button onClick={() => handleGenerateImage(true)} disabled={isGenerating} className="flex-1 bg-emerald-600 text-white px-3 py-3 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 active:bg-emerald-500 transition-colors shadow-xl disabled:opacity-50">
                           <RefreshCcw className="w-4 h-4" /> Regenerate
                         </button>
                         <button onClick={() => { navigator.clipboard.writeText(generatedImg); alert('Image link copied to clipboard!'); }} className="flex-1 bg-slate-800 border border-slate-700 text-white px-3 py-3 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 active:bg-slate-700 transition-colors shadow-xl">
                           <Copy className="w-4 h-4" /> Share Link
                         </button>
                       </div>
                    </div>
                  </motion.div>
                )}

                {imageHistory.length > 0 && (
                  <div className="mt-16">
                     <div className="flex items-center justify-between mb-6">
                       <h3 className="text-2xl font-black text-white flex items-center gap-3 tracking-tight">
                         <Clock className="w-6 h-6 text-indigo-400" />
                         Recent Generations
                       </h3>
                       <button onClick={() => setShowHistory(!showHistory)} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors">
                         {showHistory ? <><EyeOff className="w-3 h-3" /> Hide</> : <><Eye className="w-3 h-3" /> Show</>}
                       </button>
                     </div>
                     
                     {showHistory && (
                       <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                         {imageHistory.map((item, i) => (
                            <div key={i} className="relative group rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 aspect-square shadow-lg">
                               <img src={item.url} alt={item.prompt} className="w-full h-full object-cover" />
                               <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 p-4">
                                 <p className="text-[10px] text-white line-clamp-4 text-center font-medium leading-relaxed">{item.prompt}</p>
                                 <div className="flex gap-2">
                                   <button onClick={() => handleDownloadImageAsPng(item.url)} className="bg-indigo-600 text-white p-2.5 rounded-lg hover:bg-indigo-500 transition-colors">
                                      <Download className="w-4 h-4" />
                                   </button>
                                   <button onClick={() => { setImgPrompt(item.prompt); setImgStyle(item.style); setImgQuality(item.quality); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="bg-slate-700 text-white p-2.5 rounded-lg hover:bg-slate-600 transition-colors">
                                      <Copy className="w-4 h-4" />
                                   </button>
                                 </div>
                               </div>
                            </div>
                         ))}
                       </div>
                     )}
                  </div>
                )}
             </div>
          )}

          {activeTab === 'profile' && (
            <div className="max-w-4xl mx-auto space-y-6 pb-20">
               {/* Profile Card */}
               <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none" />
                  <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                     <div className="relative">
                        <div className="w-32 h-32 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-full flex items-center justify-center text-4xl font-bold text-white shadow-2xl border-4 border-slate-800 group-hover:scale-105 transition-transform">
                           {avatar ? <img src={avatar} alt="avatar" className="w-full h-full object-cover rounded-full" /> : <span>{displayName.charAt(0).toUpperCase()}</span>}
                        </div>
                        <button className="absolute bottom-0 right-0 p-2 bg-slate-800 border border-slate-700 rounded-full text-indigo-400 hover:text-white transition-colors">
                           <ImageIcon className="w-4 h-4" />
                        </button>
                     </div>
                     <div className="flex-1 text-center md:text-left space-y-4">
                        <div>
                           <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Display Name</label>
                           <div className="flex gap-2 max-w-sm mx-auto md:mx-0">
                              <input 
                                value={displayName} 
                                onChange={e => setDisplayName(e.target.value)} 
                                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white font-bold focus:outline-none focus:border-indigo-500/50" 
                              />
                              <button onClick={handleUpdateProfile} className="bg-indigo-600 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-500 transition-all">Save</button>
                           </div>
                        </div>
                        <div className="flex gap-2 justify-center md:justify-start">
                           <span className="px-3 py-1 bg-indigo-600/10 text-indigo-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-indigo-600/20">{plan} Plan</span>
                           <span className="px-3 py-1 bg-slate-800 text-slate-400 text-[10px] font-bold uppercase tracking-widest rounded-full">{credits.toLocaleString()} Credits</span>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Referral System */}
               <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-600/20 flex items-center justify-center border border-emerald-500/30">
                           <Sparkles className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                           <h3 className="text-white font-bold text-sm">Refer & Earn</h3>
                           <p className="text-slate-500 text-[10px]">Invite friends to get 50 credits each.</p>
                        </div>
                     </div>
                     
                     <div className="space-y-3 pt-2">
                        <div>
                           <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Your Referral Code</label>
                           <div className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded-xl px-4 py-3">
                              <span className="text-sm font-mono font-black text-indigo-400 tracking-widest">{(localStorage.getItem('smartai_session') ? JSON.parse(localStorage.getItem('smartai_session')!).referralCode : 'SIGNUP FIRST')}</span>
                              <button onClick={() => { 
                                const code = JSON.parse(localStorage.getItem('smartai_session')!).referralCode;
                                navigator.clipboard.writeText(code);
                                alert('Code copied!');
                              }} className="text-slate-500 hover:text-white"><Copy className="w-4 h-4" /></button>
                           </div>
                        </div>
                        <div>
                           <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Referral Link</label>
                           <button onClick={() => {
                             const code = JSON.parse(localStorage.getItem('smartai_session')!).referralCode;
                             const link = `${window.location.origin}?ref=${code}`;
                             navigator.clipboard.writeText(link);
                             alert('Referral link copied!');
                           }} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-left text-xs text-slate-400 truncate hover:border-indigo-500/50 transition-colors">
                             {window.location.origin}?ref={(localStorage.getItem('smartai_session') ? JSON.parse(localStorage.getItem('smartai_session')!).referralCode : '...')}
                           </button>
                        </div>
                     </div>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600/20 flex items-center justify-center border border-indigo-500/30">
                           <TrendingUp className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                           <h3 className="text-white font-bold text-sm">Usage Stats</h3>
                           <p className="text-slate-500 text-[10px]">Your activity across all neural modes.</p>
                        </div>
                     </div>
                     
                     <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                           <div className="text-xs font-bold text-slate-500 mb-1">Messages</div>
                           <div className="text-2xl font-black text-white">{messages.length}</div>
                        </div>
                        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                           <div className="text-xs font-bold text-slate-500 mb-1">Images</div>
                           <div className="text-2xl font-black text-white">{imageHistory.length}</div>
                        </div>
                     </div>
                  </div>
               </div>

               <button onClick={handleLogout} className="w-full py-4 bg-red-600/10 text-red-500 border border-red-600/20 rounded-2xl font-bold hover:bg-red-600 hover:text-white transition-all shadow-lg flex items-center justify-center gap-2">
                  <LogOut className="w-5 h-5" /> Sign Out from System
               </button>
            </div>
          )}

          {activeTab === 'admin' && <AdminPanel />}
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-slate-950 text-slate-200 flex font-sans overflow-hidden">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex w-72 bg-slate-950 border-r border-slate-800 flex-col p-6 overflow-hidden">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg">S</div>
          <span className="text-xl font-medium tracking-tight text-white">SmartAI <span className="font-light text-slate-400 italic">Pro</span></span>
        </div>
        
        <div className="mb-8 p-4 bg-indigo-600/10 border border-indigo-600/20 rounded-2xl flex items-center justify-between shadow-inner">
          <div>
            <span className="text-[9px] uppercase font-bold text-slate-500 tracking-[0.2em]">Credits</span>
            <div className="text-2xl font-bold text-white mt-0.5">{credits.toLocaleString()}</div>
          </div>
          <div className="w-10 h-10 bg-indigo-600/20 rounded-full flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-indigo-400" />
          </div>
        </div>

        <nav className="space-y-1.5 flex-1 overflow-y-auto no-scrollbar pr-2">
          {SIDEBAR_ITEMS.map(item => (
            <button
              key={item.tab}
              onClick={() => setActiveTab(item.tab)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === item.tab ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-600/20 shadow-sm' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.name}</span>
            </button>
          ))}

          <div className="my-4 px-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Dashboards</span>
          </div>

          <button onClick={() => { setSmartMode('normal'); setActiveTab('home'); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${smartMode === 'normal' && activeTab === 'home' ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-600/20 shadow-sm' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
             <Send className="w-5 h-5" />
             <span className="text-sm font-medium">Normal Mode</span>
          </button>
          <button onClick={() => { setSmartMode('creative'); setActiveTab('home'); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${smartMode === 'creative' && activeTab === 'home' ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-600/20 shadow-sm' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
             <Lightbulb className="w-5 h-5" />
             <span className="text-sm font-medium">Creative Mode</span>
          </button>
          <button onClick={() => { setSmartMode('expert'); setActiveTab('home'); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${smartMode === 'expert' && activeTab === 'home' ? 'bg-orange-600/10 text-orange-400 border border-orange-600/20 shadow-sm' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
             <Zap className="w-5 h-5" />
             <span className="text-sm font-medium">Expert Mode</span>
          </button>
          
          {isAdmin && (
            <>
              <div className="my-4 px-2">
                 <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">Admin</span>
              </div>
              <button onClick={() => setActiveTab('admin')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'admin' ? 'bg-rose-600/10 text-rose-400 border border-rose-600/20 shadow-sm' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                <Shield className="w-5 h-5" />
                <span className="text-sm font-medium">Admin Panel</span>
              </button>
            </>
          )}
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-800 space-y-4 shrink-0">
          <button 
            onClick={() => setIsPricingOpen(true)} 
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition-all text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-indigo-600/20"
          >
            <Sparkles className="w-4 h-4" /> Upgrade Plan
          </button>
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
             <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white uppercase">{displayName.charAt(0)}</div>
             <div className="flex-1 min-w-0">
                <div className="text-[10px] font-bold text-white truncate">{displayName}</div>
                <div className="text-[9px] text-slate-500 truncate">{email}</div>
             </div>
             <button onClick={() => setActiveTab('profile')} className="p-1.5 text-slate-500 hover:text-white transition-colors"><Settings className="w-4 h-4" /></button>
          </div>
          
          {!isAdmin && (
            <button onClick={() => setActiveTab('admin')} className="w-full mt-2 flex items-center justify-center gap-1 opacity-10 hover:opacity-100 transition-opacity text-[8px] text-slate-600 uppercase tracking-widest">
              <Shield className="w-2 h-2" /> Admin Access
            </button>
          )}
        </div>
      </aside>

      {/* Main Container */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-950">
        {/* Header */}
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-4 sm:px-8 bg-slate-950/50 backdrop-blur-md sticky top-0 z-40">
           <div className="flex items-center gap-4">
              <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -ml-2 text-slate-400 hover:text-white md:hidden"><Menu className="w-6 h-6" /></button>
              <div className="md:hidden flex items-center gap-2">
                <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center text-[10px] font-bold">S</div>
                <span className="text-sm font-bold">SmartAI</span>
              </div>
              <div className="hidden md:flex items-center gap-2 text-slate-500 text-[9px] font-black uppercase tracking-[0.3em]">
                 <span>System</span>
                 <ChevronRight className="w-3 h-3 opacity-30" />
                 <span className="text-white">{activeTab}</span>
              </div>
           </div>
           <div className="flex items-center gap-3">
              <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border transition-colors ${smartMode === 'normal' ? 'bg-indigo-600/10 text-indigo-400 border-indigo-600/20' : smartMode === 'creative' ? 'bg-emerald-600/10 text-emerald-400 border-emerald-600/20' : 'bg-orange-600/10 text-orange-400 border-orange-600/20'}`}>
                {smartMode} mode
              </div>
              <button onClick={() => setIsPricingOpen(true)} className="bg-white text-black px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all shadow-lg shadow-white/5">Upgrade</button>
           </div>
        </header>

        {/* Dynamic Content */}
        <div className="flex-1 relative flex flex-col overflow-hidden min-h-0">
           {renderContent()}
        </div>
      </main>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMobileMenuOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[50] md:hidden" />
            <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed inset-y-0 left-0 w-72 bg-slate-950 border-r border-slate-800 z-[60] p-6 flex flex-col md:hidden shadow-2xl">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg">S</div>
                  <span className="text-xl font-medium tracking-tight text-white">SmartAI <span className="font-light text-slate-400 italic">Pro</span></span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-500 hover:text-white"><X className="w-6 h-6" /></button>
              </div>
              <nav className="space-y-1.5 flex-1">
                {SIDEBAR_ITEMS.map(item => (
                  <button key={item.tab} onClick={() => { setActiveTab(item.tab); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === item.tab ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-600/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                    <item.icon className="w-5 h-5" />
                    <span className="text-base font-medium">{item.name}</span>
                  </button>
                ))}

                <div className="my-4 px-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Dashboards</span>
                </div>

                <button onClick={() => { setSmartMode('normal'); setActiveTab('home'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${smartMode === 'normal' && activeTab === 'home' ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-600/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                   <Send className="w-5 h-5" />
                   <span className="text-base font-medium">Normal Mode</span>
                </button>
                <button onClick={() => { setSmartMode('creative'); setActiveTab('home'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${smartMode === 'creative' && activeTab === 'home' ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-600/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                   <Lightbulb className="w-5 h-5" />
                   <span className="text-base font-medium">Creative Mode</span>
                </button>
                <button onClick={() => { setSmartMode('expert'); setActiveTab('home'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${smartMode === 'expert' && activeTab === 'home' ? 'bg-orange-600/10 text-orange-400 border border-orange-600/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                   <Zap className="w-5 h-5" />
                   <span className="text-base font-medium">Expert Mode</span>
                </button>

                {isAdmin && (
                  <>
                    <div className="my-4 px-2">
                      <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">Admin</span>
                    </div>
                    <button onClick={() => { setActiveTab('admin'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'admin' ? 'bg-rose-600/10 text-rose-400 border border-rose-600/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                      <Shield className="w-5 h-5" />
                      <span className="text-base font-medium">Admin Panel</span>
                    </button>
                  </>
                )}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Overlays */}
      <AnimatePresence>
        {isPricingOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
             <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-10 max-w-5xl w-full shadow-2xl overflow-y-auto max-h-[90vh]">
                <div className="flex justify-between items-center mb-10">
                   <div>
                      <h2 className="text-3xl font-bold italic tracking-tight text-white">Neural Network Plans</h2>
                      <p className="text-slate-500 text-sm mt-1">Select the processing power that matches your ambition.</p>
                   </div>
                   <button onClick={() => setIsPricingOpen(false)} className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-full text-white transition-colors shadow-lg"><X className="w-5 h-5" /></button>
                </div>
                <div className="grid md:grid-cols-3 gap-6 md:gap-8">
                  {PLANS.map(p => (
                    <div key={p.name} className={`p-8 rounded-3xl border transition-all duration-500 flex flex-col relative group ${p.popular ? 'border-indigo-600 bg-indigo-600/5 shadow-2xl shadow-indigo-600/10' : 'border-slate-800 bg-slate-950/50 hover:border-slate-700'}`}>
                      {p.popular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full shadow-lg">Recommended</span>}
                      <h3 className="text-xl font-bold text-white mb-2">{p.name}</h3>
                      <div className="flex items-baseline gap-1 mb-6">
                        <span className="text-3xl font-bold text-white">{p.price.split(' ')[0]}</span>
                        <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">{p.price.split(' ').slice(1).join(' ')}</span>
                      </div>
                      <ul className="space-y-4 mb-10 flex-1">
                        {p.features.map(f => (
                          <li key={f} className="text-xs text-slate-400 flex items-start gap-3 leading-relaxed">
                            <Check className="w-3.5 h-3.5 text-indigo-400 mt-0.5 flex-shrink-0" /> {f}
                          </li>
                        ))}
                      </ul>
                      <button onClick={() => handleSelectPlan(p)} className={`w-full py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg ${p.popular ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-600/20' : 'bg-white text-black hover:bg-slate-200 shadow-white/5'}`}>
                        Initialize {p.name}
                      </button>
                    </div>
                  ))}
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
