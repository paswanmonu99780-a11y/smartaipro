import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Image as ImageIcon, LogOut, Send, Plus, Zap, Sparkles, Github, Download, Video, User, CreditCard, Eye, EyeOff, Shield, Copy, Check, Search, Mic, RefreshCcw, Menu, X, ArrowLeft, ChevronUp, ChevronDown, ChevronRight, Terminal, FileText, Code, Lightbulb, PenTool, Database, Layout, TrendingUp, Mic2, FileSearch, Layers, Cpu, FastForward, Monitor, Globe, Network, Crown, Clock, CloudSun, Radio, Instagram, Lock as LockIcon, Settings, Hash, Book, Rocket, Tag, Workflow, Plug, BarChart3, GitBranch, Clock3, Play, Key, Webhook, Link, Bug, Server, FileJson, FileSpreadsheet, BarChart, Wrench, Users, Bell, ChevronLeft, Quote, Save, Box, FolderJson } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import AdminPanel from './AdminPanel';
import { fetchUsersFromSupabase, syncUsersToSupabase, checkAdminSession } from './lib/db';
import { supabase } from './lib/supabase';
import AIVoiceAvatar from './AIVoiceAvatar';

type Tab = 'home' | 'chat' | 'image' | 'video' | 'profile' | 'admin';
type SmartMode = 'normal' | 'creative' | 'expert';
interface Message { id: string; role: 'user' | 'assistant'; content: string; isVoice?: boolean; }


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
  { 
    name: 'Normal Mode', 
    price: 'Free', 
    features: [
      '100 Daily Credits', 
      'Standard AI Response', 
      'Basic Image Generation', 
      'Community Support',
      'Normal Processing Speed'
    ], 
    color: 'slate-400' 
  },
  { 
    name: 'Creative Mode', 
    price: '₹99', 
    features: [
      '10,000 Monthly Credits', 
      'Advanced Creative Tools', 
      'HD Image Generation', 
      'Priority Support',
      'Creative AI Persona',
      '2K Resolution Assets'
    ], 
    color: 'indigo-500', 
    popular: true 
  },
  { 
    name: 'Expert Mode', 
    price: '₹199', 
    features: [
      'Unlimited AI Credits', 
      'Full Expert Workspace', 
      '4K/8K Video & Images', 
      'API Integration Access',
      'Custom AI Models',
      'Real-Time Web Intelligence',
      'Zero Latency Processing'
    ], 
    color: 'emerald-500' 
  },
];

const ASPECTS = ['1:1', '16:9', '9:16', '4:3'] as const;
const STYLES = ['realistic', 'anime', 'oil painting', 'cyberpunk', 'minimalist', '3d render', 'minecraft'];

const CREATIVE_TOOLS = [];

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
  { id: 'debugger', name: 'AI Debugger Pro', badge: 'NEW', icon: Bug, desc: 'Advanced semantic debugging, error fixing & security audit system.', color: '#ef4444' },
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
    if (isVipEmail(email)) return; // VIP: No usage tracking
    setUsage(prev => {
      const next = { ...prev, [type]: prev[type] + 1 };
      localStorage.setItem('smartai_usage', JSON.stringify(next));
      return next;
    });
  };
  const [userMetadata, setUserMetadata] = useState<any>(null);
  const [email, setEmail] = useState('');

  const isVipEmail = (e: string) => e?.toLowerCase().trim() === 'paswanmonu99780@gmail.com';
  const [password, setPassword] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [authError, setAuthError] = useState<string | null>(null);

  // Clear forms when switching modes
  useEffect(() => {
    setAuthError(null);
    if (authMode !== 'forgot') {
      // Keep email if it's a valid email, otherwise clear
      if (!email.includes('@')) setEmail('');
      setPassword('');
    }
  }, [authMode]);
  
  // Forgot Password State
  const [resetEmail, setResetEmail] = useState('');
  const [forgotPasswordStep, setForgotPasswordStep] = useState<'email' | 'otp' | 'reset'>('email');
  const [resetPassword, setResetPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [resetOtp, setResetOtp] = useState(['', '', '', '', '', '']);

  // OTP State
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpType, setOtpType] = useState<'login' | 'signup'>('login');
  const [resendSuccess, setResendSuccess] = useState(false);

  // Signup Specific State
  const [signupName, setSignupName] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupReferCode, setSignupReferCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneStep, setPhoneStep] = useState<'input' | 'otp'>('input');
  const [countdown, setCountdown] = useState(0);

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
  const [plan, setPlan] = useState<'Normal Mode' | 'Creative Mode' | 'Expert Mode'>('Normal Mode');
  const [imgQuality, setImgQuality] = useState('Standard');
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
  const [activeTool, setActiveTool] = useState<{ name: string, desc: string, icon: any } | null>(null);
  const [toolImage, setToolImage] = useState<string | null>(null);
  const [toolPrompt, setToolPrompt] = useState('');
  const [isToolProcessing, setIsToolProcessing] = useState(false);
  const [processedToolImage, setProcessedToolImage] = useState<string | null>(null); 
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [creativeHistory, setCreativeHistory] = useState<Array<{ tool: string; toolName: string; input: string; result: string; time: string }>>([]);
  const [activeExpertTool, setActiveExpertTool] = useState<string | null>(null);
  const [expertCategory, setExpertCategory] = useState<string>('All');
  const [expertToolInput, setExpertToolInput] = useState('');
  const [expertToolResult, setExpertToolResult] = useState('');
  const [isExpertToolThinking, setIsExpertToolThinking] = useState(false);
  const [tone, setTone] = useState<'Professional' | 'Funny' | 'Casual'>('Professional');
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem('smartai_admin_session') === 'active');
  const [isVoiceAvatarOpen, setIsVoiceAvatarOpen] = useState(false);
  const [lastAiMessage, setLastAiMessage] = useState('');
  const [expertSubTab, setExpertSubTab] = useState<string>('dashboard');
  const isExpertLocked = false;

  // Meme Generator Specific State
  const [memeTopic, setMemeTopic] = useState('');
  const [memeType, setMemeType] = useState('Meme Idea');
  const [memeHumorLevel, setMemeHumorLevel] = useState(50);
  const [memePlatform, setMemePlatform] = useState('Instagram');
  const [memeLanguage, setMemeLanguage] = useState('English');
  const [memeTemplate, setMemeTemplate] = useState('POV Meme');
  const [showAdvancedHumor, setShowAdvancedHumor] = useState(false);
  const [isViralMode, setIsViralMode] = useState(true);
  const [memeAudienceAge, setMemeAudienceAge] = useState('All');
  const [addEmojis, setAddEmojis] = useState(true);
  const [addHashtags, setAddHashtags] = useState(true);
  const [isMemeGenerating, setIsMemeGenerating] = useState(false);
  const [memeLoadingText, setMemeLoadingText] = useState('');
  const [memeResult, setMemeResult] = useState<any>(null);
  const [memeImagePreview, setMemeImagePreview] = useState<string | null>(null);

  // Idea Generator Specific State
  const [ideaTopic, setIdeaTopic] = useState('');
  const [ideaType, setIdeaType] = useState('Business Idea');
  const [ideaAudience, setIdeaAudience] = useState('General Public');
  const [ideaPlatform, setIdeaPlatform] = useState('YouTube');
  const [ideaCreativity, setIdeaCreativity] = useState(70);
  const [ideaLanguage, setIdeaLanguage] = useState('English');
  const [showAdvancedIdea, setShowAdvancedIdea] = useState(false);
  const [ideaTrendingOnly, setIdeaTrendingOnly] = useState(false);
  const [ideaViralOpt, setIdeaViralOpt] = useState(false);
  const [ideaLowBudget, setIdeaLowBudget] = useState(false);
  const [ideaBeginner, setIdeaBeginner] = useState(false);
  const [ideaAiPowered, setIdeaAiPowered] = useState(false);
  const [ideaPassiveIncome, setIdeaPassiveIncome] = useState(false);
  const [ideaMonetization, setIdeaMonetization] = useState(true);
  const [isIdeaGenerating, setIsIdeaGenerating] = useState(false);
  const [ideaLoadingText, setIdeaLoadingText] = useState('');
  const [ideaResult, setIdeaResult] = useState<any>(null);
  const [expandedIdeaContent, setExpandedIdeaContent] = useState<any>(null);

  // AI Character Creator Specific State
  const [charType, setCharType] = useState('Anime Character');
  const [charName, setCharName] = useState('');
  const [charGender, setCharGender] = useState('Random');
  const [charPersonality, setCharPersonality] = useState('Mysterious');
  const [charStyle, setCharStyle] = useState('Cyberpunk');
  const [charPowers, setCharPowers] = useState('');
  const [charBackstory, setCharBackstory] = useState('Hero Journey');
  const [charShowAdvanced, setCharShowAdvanced] = useState(false);
  const [charVoice, setCharVoice] = useState(false);
  const [charWeaknesses, setCharWeaknesses] = useState(true);
  const [charCatchphrase, setCharCatchphrase] = useState(true);
  const [charRelationships, setCharRelationships] = useState(false);
  const [charRival, setCharRival] = useState(false);
  const [charSecretAbility, setCharSecretAbility] = useState(false);
  const [charStats, setCharStats] = useState(true);
  const [charEmotionalDepth, setCharEmotionalDepth] = useState(false);
  const [isCharGenerating, setIsCharGenerating] = useState(false);
  const [charLoadingText, setCharLoadingText] = useState('');
  const [charResult, setCharResult] = useState<any>(null);
  const [charImagePreview, setCharImagePreview] = useState<string | null>(null);
  const [charDialogue, setCharDialogue] = useState<string[] | null>(null);
  const [charStoryExpansion, setCharStoryExpansion] = useState<any>(null);
  const [showHistorySidebar, setShowHistorySidebar] = useState(false);
  const [dynamicTrending, setDynamicTrending] = useState<string[]>([]);
  const [isTrendingLoading, setIsTrendingLoading] = useState(false);

  // Polyglot State
  const [polyLang, setPolyLang] = useState('JavaScript');
  const [polyTask, setPolyTask] = useState('');
  const [polyType, setPolyType] = useState('Web App');
  const [polyFramework, setPolyFramework] = useState('React');
  const [polyComplexity, setPolyComplexity] = useState(50);
  const [polyStyle, setPolyStyle] = useState('Clean Code');
  const [polyAdvanced, setPolyAdvanced] = useState({
    comments: true,
    docs: false,
    errorHandling: true,
    optimize: false,
    security: true,
    folderStructure: false,
    apiIntegration: false,
    responsive: true,
    darkUI: true,
    dbSchema: false
  });
  const [polyResult, setPolyResult] = useState<any>(null);
  const [polyIsGenerating, setPolyIsGenerating] = useState(false);
  const [polyPreviewCode, setPolyPreviewCode] = useState('');
  const [polyActiveFile, setPolyActiveFile] = useState('main.js');
  const [polyRefinement, setPolyRefinement] = useState('');
  const [polyShowPreview, setPolyShowPreview] = useState(false);

  // AI Debugger State
  const [debugCode, setDebugCode] = useState('');
  const [debugLogs, setDebugLogs] = useState('');
  const [debugLang, setDebugLang] = useState('JavaScript');
  const [debugType, setDebugType] = useState('Syntax Errors');
  const [debugComplexity, setDebugComplexity] = useState('Intermediate');
  const [debugResult, setDebugResult] = useState<any>(null);
  const [debugIsAnalyzing, setDebugIsAnalyzing] = useState(false);
  const [debugShowPreview, setDebugShowPreview] = useState(false);
  const [debugActiveTab, setDebugActiveTab] = useState<'code' | 'preview' | 'comparison'>('code');
  const [debugAdvanced, setDebugAdvanced] = useState({
    autoFix: true,
    optimize: false,
    bestPractices: true,
    security: false,
    explain: true,
    architecture: false,
    cleanCode: true,
    refactor: false,
    imports: true,
    infiniteLoops: true
  });
  const [debugShowAdvanced, setDebugShowAdvanced] = useState(false);

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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event);
      if (event === 'SIGNED_IN' && session?.user) {
        // Force immediate state updates
        setEmail(session.user.email || '');
        setIsLoggedIn(true);
        setIsAuthenticating(false);
        setIsVerifyingOtp(false);
        setAuthMode('login');
        
        // Always set the email from the session
        setEmail(session.user.email || '');

        try {
          // Fetch user metadata from public.users in background
          const { data: userData, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('email', session.user.email)
            .single();

          if (userData) {
            localStorage.setItem('smartai_session', JSON.stringify(userData));
            setDisplayName(userData.displayName || userData.email?.split('@')[0] || 'User');
            setAvatar(userData.avatar || '');
            
            // VIP Override
            if (isVipEmail(session.user.email || '')) {
              setCredits(999999999);
              setPlan('Expert Mode');
            } else {
              setCredits(typeof userData.credits === 'number' ? userData.credits : 100);
              if (userData.plan === 'Pro') setPlan('Creative Mode');
              else if (userData.plan === 'Ultra') setPlan('Expert Mode');
              else setPlan('Normal Mode');
            }
          } else {
            console.log('User profile not found, creating one...');
            const pendingName = sessionStorage.getItem('pendingSignupName');
            
            // If public profile doesn't exist, create it
            const newUser = {
              email: session.user.email,
              displayName: pendingName || session.user.user_metadata?.displayName || session.user.email?.split('@')[0] || 'User',
              avatar: '',
              credits: isVipEmail(session.user.email || '') ? 999999999 : 100,
              plan: isVipEmail(session.user.email || '') ? 'Ultra' : 'Basic',
              referralCode: generateReferralCode(session.user.email || 'user')
            };
            await supabase.from('users').insert([newUser]);
            localStorage.setItem('smartai_session', JSON.stringify(newUser));
            setDisplayName(newUser.displayName);
            setAvatar('');
            sessionStorage.removeItem('pendingSignupName');
            
            // VIP State
            if (isVipEmail(session.user.email || '')) {
              setCredits(999999999);
              setPlan('Expert Mode');
            }
          }
        } catch (err) {
          console.error('Error fetching user metadata:', err);
        }
      } else if (event === 'SIGNED_OUT') {
        setIsLoggedIn(false);
        setEmail('');
        setUserMetadata(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Force VIP check on mount in case session is already active
  useEffect(() => {
    const checkInitialVip = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email && isVipEmail(session.user.email)) {
        setEmail(session.user.email);
        setIsLoggedIn(true);
        setCredits(999999999);
        setPlan('Expert Mode');
        setSmartMode('expert');
      }
    };
    checkInitialVip();
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
      const interval = setInterval(checkGlobalAdmin, 3000); // More frequent check (3s)
      return () => clearInterval(interval);
    }
  }, [isAdmin]);

  // Failsafe: If we get logged in via onAuthStateChange, clear all auth loading states
  useEffect(() => {
    if (isLoggedIn) {
      setIsAuthenticating(false);
      setIsVerifyingOtp(false);
      console.log('Login detected - clearing auth states');
    }
  }, [isLoggedIn]);

  // Admin session should be independent of main app session for flexibility
  useEffect(() => {
    const isAdminActive = localStorage.getItem('smartai_admin_session') === 'active';
    if (isAdminActive !== isAdmin) {
      setIsAdmin(isAdminActive);
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

  useEffect(() => {
    if (activeTab === 'profile') {
      setTempDisplayName(displayName || email?.split('@')[0] || 'User');
      setTempAvatar(avatar);
    }
  }, [activeTab, displayName, avatar, email]);

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
          password: u.password || '',
          credits: typeof u.credits === 'number' ? u.credits : 100,
          plan: u.plan || 'Basic',
          displayName: u.displayName || u.name || 'User',
          avatar: u.avatar || '',
          name: u.name || u.displayName || 'User',
          referCode: u.referCode || '',
          referralCode: generateReferralCode(u.email || u.displayName || u.name || 'user'),
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
          d.referralCode = generateReferralCode(d.email || d.displayName || 'user');
          d.referredBy = d.referredBy || '';
          d.referralRewarded = d.referralRewarded || false;
          d.deviceId = d.deviceId || getDeviceId();
          d.referralEarnings = d.referralEarnings || 0;
          localStorage.setItem('smartai_session', JSON.stringify(d));
        }
        if (isVipEmail(d.email || '')) {
          setCredits(999999999);
          setPlan('Expert Mode');
        } else {
          setCredits(typeof d.credits === 'number' ? d.credits : 100);
          setPlan(d.plan || 'Basic');
        }
        setEmail(d.email || '');
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

    // Ensure auth fields are empty on fresh load if not logged in
    const session = localStorage.getItem('smartai_session');
    if (!session) {
      setEmail('');
      setPassword('');
      setSignupName('');
    }
  }, []);

  useEffect(() => {
    if (email) {
      const hist = localStorage.getItem(`smartai_image_history_${email}`);
      if (hist) { setImageHistory(JSON.parse(hist)); } else { setImageHistory([]); }

      const savedChats = localStorage.getItem(`smartai_chat_history_${email}`);
      if (savedChats) {
        const chats = JSON.parse(savedChats);
        setChatHistory(chats);
        if (chats.length > 0) {
          setCurrentChatId(chats[0].id);
          setMessages(chats[0].messages);
        } else {
          setMessages([{ id: '1', role: 'assistant', content: 'Neural link established. I am SmartAI Pro. How can I assist your creative process?' }]);
        }
      } else {
        setChatHistory([]);
        setMessages([{ id: '1', role: 'assistant', content: 'Neural link established. I am SmartAI Pro. How can I assist your creative process?' }]);
      }
    }
  }, [email]);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isAiThinking]);

  const getUsers = (): Array<{ email: string; password: string; credits: number; plan: string; displayName: string; avatar: string; name: string; referCode: string; referralCode: string; referredBy: string; referralRewarded: boolean; deviceId: string; referralEarnings: number }> => {
    const data = localStorage.getItem('smartai_users');
    return data ? JSON.parse(data) : [];
  };
  const saveUsers = (users: Array<{ email: string; password: string; credits: number; plan: string; displayName: string; avatar: string; name: string; referCode: string; referralCode: string; referredBy: string; referralRewarded: boolean; deviceId: string; referralEarnings: number }>) => {
    localStorage.setItem('smartai_users', JSON.stringify(users));
    syncUsersToSupabase(users).catch(e => console.error("Sync error:", e));
  };

  const sendOtp = async (type: 'login' | 'signup' | 'phone') => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      if (type === 'phone') {
        const { error } = await supabase.auth.signInWithOtp({
          phone: phoneNumber,
        });
        if (error) throw error;
        setPhoneStep('otp');
        setCountdown(30);
      } else {
        const { error } = await supabase.auth.signInWithOtp({
          email: email,
          options: {
            shouldCreateUser: type === 'signup',
            data: type === 'signup' ? { displayName: signupName } : undefined
          }
        });
        if (error) throw error;
        setIsVerifyingOtp(true);
        setOtpType(type);
      }
    } catch (err: any) {
      setAuthError(err.message);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'apple') => {
    setIsAuthenticating(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            prompt: 'select_account',
            access_type: 'offline'
          }
        }
      });
      if (error) throw error;
      // No need to set isAuthenticating false here as onAuthStateChange will handle it
    } catch (err: any) {
      setAuthError(`${provider.charAt(0).toUpperCase() + provider.slice(1)} login failed. Please ensure the provider is enabled in your dashboard.`);
      setIsAuthenticating(false);
    }
  };

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!email || !password) return setAuthError('Please fill all fields');
    setIsAuthenticating(true);

    try {
      const isMobile = /^\d{10}$/.test(email);
      
      if (isMobile) {
        // Handle mobile login via OTP
        await sendOtp('login');
        setIsAuthenticating(false);
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          // Check local users as fallback for "old accounts" migration
          const localUsers = getUsers();
          const localUser = localUsers.find(u => (u.email === email || u.name === email) && u.password === password);
          
          if (localUser) {
            setAuthError('Migrating your old account... Please try signing up with the same email and password to sync with our new secure system, or use "Forgot Password" to reset.');
          } else {
            setAuthError('User not found or incorrect password. If you just signed up, please check your email for a verification link.');
          }
        } else if (error.message.includes('Email not confirmed')) {
          setAuthError('Your email is not confirmed yet. Please check your inbox for the verification link or signup again.');
        } else {
          setAuthError(error.message);
        }
      } else if (data.user) {
        const meta = data.user.user_metadata;
        const userName = meta?.displayName || meta?.full_name || data.user.email?.split('@')[0] || 'User';

        // Always set email
        setEmail(data.user.email || '');

        const users = getUsers();
        const userIdx = users.findIndex(u => u.email === data.user?.email);

        if (isVipEmail(data.user.email || '')) {
          setCredits(999999999);
          setPlan('Expert Mode');
        } else if (userIdx !== -1) {
          if (!users[userIdx].displayName || users[userIdx].displayName === 'User') {
            users[userIdx].displayName = userName;
            users[userIdx].name = userName;
            saveUsers(users);
          }
          localStorage.setItem('smartai_session', JSON.stringify(users[userIdx]));
          setDisplayName(users[userIdx].displayName || userName);
          setAvatar(users[userIdx].avatar || '');
          setCredits(typeof users[userIdx].credits === 'number' ? users[userIdx].credits : 100);
          setPlan((users[userIdx].plan as 'Basic' | 'Pro' | 'Ultra') || 'Basic');
        } else {
          setDisplayName(userName);
          setAvatar('');
          setCredits(100);
          setPlan('Basic');
        }
        setIsLoggedIn(true);
        setIsAuthenticating(false);
      }
    } catch (err: any) {
      setAuthError(err.message);
      setIsAuthenticating(false);
    }
  };

  const syncUserData = (updates: Partial<{ credits: number; plan: string; displayName: string; avatar: string; referralRewarded: boolean; referralEarnings: number }>) => {
    const session = localStorage.getItem('smartai_session');
    if (session) {
      const d = JSON.parse(session);
      Object.assign(d, updates);
      localStorage.setItem('smartai_session', JSON.stringify(d));

      const users = getUsers();
      const idx = users.findIndex((u: any) =>
        (d.email && u.email === d.email)
      );
      if (idx !== -1) {
        Object.assign(users[idx], updates);
        saveUsers(users);
      }
    }
  };

  const handleSignup = async () => {
    setAuthError(null);
    if (!signupName || !email || !password || !signupConfirmPassword) {
      setAuthError('Please fill all required fields');
      return;
    }
    if (password !== signupConfirmPassword) {
      setAuthError('Passwords do not match');
      return;
    }

    setIsAuthenticating(true);
    try {
      console.log('Checking name uniqueness:', signupName);
      
      // 1. Check local users for immediate feedback
      const localUsers = getUsers();
      if (localUsers.some(u => u.email?.toLowerCase() === email.toLowerCase())) {
        setAuthError('Email is already registered. Please login instead.');
        setIsAuthenticating(false);
        return;
      }
      
      if (localUsers.some(u => u.displayName?.toLowerCase() === signupName.toLowerCase() || u.name?.toLowerCase() === signupName.toLowerCase())) {
        setAuthError('This name is already taken. Please choose another name.');
        setIsAuthenticating(false);
        return;
      }

      // 2. Check Supabase users table for global uniqueness
      const { data: existingEmailUser } = await supabase
        .from('users')
        .select('email')
        .ilike('email', email.trim())
        .maybeSingle();

      if (existingEmailUser) {
        setAuthError('Email is already registered. Please login instead.');
        setIsAuthenticating(false);
        return;
      }

      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('displayName')
        .ilike('displayName', signupName)
        .maybeSingle();

      if (existingUser) {
        setAuthError('This name is already taken. Please choose another name.');
        setIsAuthenticating(false);
        return;
      }

      console.log('Initiating signup for:', email);
      sessionStorage.setItem('pendingSignupName', signupName);

      const { data: signUpData, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            displayName: signupName,
            referralCode: generateReferralCode(email),
            signupReferCode: signupReferCode
          }
        }
      });
      
      // If user already exists, Supabase signUp might return an empty identity if email confirm is on
      // Or it might throw an error depending on Supabase settings.
      if (error) {
        console.error('Signup error:', error);
        setAuthError(error.message);
      } else {
        // Directly sign in the user after successful signup (bypass email verification for dev)
        try {
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (signInError) throw signInError;
          // User is now logged in
          const meta = signInData.user?.user_metadata;
          const userName = meta?.displayName || meta?.full_name || email.split('@')[0] || 'User';
          setEmail(email);
          setDisplayName(userName);
          setIsLoggedIn(true);
          setAuthError(null);
        } catch (loginErr: any) {
          console.error('Auto login after signup failed:', loginErr);
          if (loginErr.message?.includes('Email not confirmed')) {
            setAuthError('Signup successful! Please check your email inbox to verify your account before logging in.');
          } else {
            setAuthError('Signup succeeded but auto‑login failed. Please try logging in manually or check your email for a verification link.');
          }
        }
      }
    } catch (err: any) {
      console.error('Signup catch error:', err);
      setAuthError(err.message || 'Signup failed. Please check your internet connection.');
    } finally {
      setIsAuthenticating(false);
    }
  };

    const handleOtpVerify = async () => {
    const enteredOtp = otp.join('');
    if (enteredOtp.length !== 6) {
      setAuthError('Please enter the complete 6-digit code');
      return;
    }
    const target = authMode === 'forgot' ? resetEmail : email;
    setIsAuthenticating(true);
    setAuthError(null);
    console.log('Starting OTP verification for:', target);

    let completed = false;
    // Safety timeout to prevent infinite hang - increased to 30s for production
    const safetyTimeout = setTimeout(() => {
      if (!completed) {
        setIsAuthenticating(false);
        setAuthError('Verification is taking longer than expected. Please check your internet or try again.');
        console.warn('OTP verification timed out after 30s');
      }
    }, 30000);
    
    try {
      // Step 0: Handle Recovery OTP
      if (authMode === 'forgot') {
        console.log('Trying recovery type verification...');
        const recoveryRes = await supabase.auth.verifyOtp({
          email: target,
          token: enteredOtp,
          type: 'recovery'
        });
        if (recoveryRes.error) {
           // Fallback to email/magiclink if recovery fails (sometimes Supabase uses 'email' for everything)
           const emailRes = await supabase.auth.verifyOtp({
             email: target,
             token: enteredOtp,
             type: 'email'
           });
           data = emailRes.data;
           error = emailRes.error;
        } else {
           data = recoveryRes.data;
           error = recoveryRes.error;
        }
      } else {
        // Step 1: Try 'email' type (Primary for signInWithOtp flow)
        console.log('Trying email type verification...');
        const emailRes = await supabase.auth.verifyOtp({
          email: target,
          token: enteredOtp,
          type: 'email'
        });
        data = emailRes.data;
        error = emailRes.error;

        // Step 2: Fallback to 'signup' type if 'email' fails or returns error
        if (error || !data?.user) {
          console.log('Email type verification failed, trying signup type fallback...');
          const secondAttempt = await supabase.auth.verifyOtp({
            email: target,
            token: enteredOtp,
            type: 'signup'
          });
          
          if (secondAttempt.data?.user) {
            data = secondAttempt.data;
            error = secondAttempt.error;
          } else if (error && secondAttempt.error) {
             error = secondAttempt.error || error;
          }
        }
      }

      completed = true;
      clearTimeout(safetyTimeout);

      if (error) {
        console.error('Final OTP Verify Error:', error);
        setAuthError(error.message || 'Invalid or expired code. Please try again.');
        setIsAuthenticating(false);
      } else if (data?.user) {
        console.log('Verification successful!');
        const meta = data.user.user_metadata;
        const pendingName = sessionStorage.getItem('pendingSignupName');
        const userName = meta?.displayName || meta?.full_name || pendingName || data.user.email?.split('@')[0] || 'User';
        
        // IMMEDIATE UI UPDATE
        if (authMode === 'forgot') {
          setForgotPasswordStep('reset');
          setIsVerifyingOtp(false);
          setIsAuthenticating(false);
          return;
        }

        setDisplayName(userName);
        setEmail(data.user.email || '');
        setAvatar('');
        setIsVerifyingOtp(false);
        setIsLoggedIn(true);
        setIsAuthenticating(false);

        // Update local session
        try {
          const users = getUsers();
          let currentUser = users.find(u => u.email === data.user?.email);
          
          if (!currentUser) {
            currentUser = {
              email: data.user.email || '',
              password: '',
              credits: 100,
              plan: 'Basic',
              displayName: userName,
              avatar: '',
              name: userName,
              referCode: '',
              referralCode: generateReferralCode(data.user.email || userName),
              referredBy: '',
              referralRewarded: false,
              deviceId: getDeviceId(),
              referralEarnings: 0
            };
            users.push(currentUser);
            localStorage.setItem('smartai_users', JSON.stringify(users));
          }
          localStorage.setItem('smartai_session', JSON.stringify(currentUser));
        } catch (e) {
          console.error('Error updating session:', e);
        }
      } else {
        throw new Error('No user data returned from system');
      }
    } catch (err: any) {
      completed = true;
      clearTimeout(safetyTimeout);
      console.error('OTP Verify Catch:', err);
      setAuthError(err.message || 'Verification failed. Please try again.');
      setIsAuthenticating(false);
    }
  };

  const handleForgotPassword = async () => {
    setAuthError(null);
    if (!resetEmail) return setAuthError('Please enter your email');
    setIsAuthenticating(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: resetEmail,
      });
      if (error) setAuthError(error.message);
      else {
        setIsVerifyingOtp(true);
        setForgotPasswordStep('otp');
      }
    } catch (err: any) { setAuthError(err.message); }
    finally { setIsAuthenticating(false); }
  };

  const handleVerifyResetOtp = async () => {
    setAuthError(null);
    setIsAuthenticating(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: resetEmail,
        token: resetOtp.join(''),
        type: 'recovery'
      });

      if (error) {
        setAuthError(error.message);
        setIsAuthenticating(false);
      } else {
        setForgotPasswordStep('reset');
        setIsAuthenticating(false);
      }
    } catch (err: any) {
      setAuthError(err.message);
      setIsAuthenticating(false);
    }
  };

  const handleFinalPasswordReset = async () => {
    if (!newPassword || newPassword !== confirmNewPassword) {
      setAuthError('Passwords do not match or are empty');
      return;
    }
    if (newPassword.length < 6) {
      setAuthError('Password must be at least 6 characters');
      return;
    }

    setIsAuthenticating(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        setAuthError(error.message);
      } else {
        alert('Password reset successful! You can now login.');
        setAuthMode('login');
        setForgotPasswordStep('email');
        setNewPassword('');
        setConfirmNewPassword('');
      }
    } catch (err: any) {
      setAuthError(err.message);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmNewPassword) return setAuthError('Passwords do not match');
    if (newPassword.length < 6) return setAuthError('Password must be at least 6 characters');

    setAuthError(null);
    setIsAuthenticating(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) setAuthError(error.message);
      else {
        alert('Password updated successfully! Please login.');
        setAuthMode('login');
        setForgotPasswordStep('email');
      }
    } catch (err: any) { setAuthError(err.message); }
    finally { setIsAuthenticating(false); }
  };
  const handleLogout = async () => { 
    try {
      // Manually clear any Supabase related keys to prevent auto-login loops
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sb-') || key.includes('supabase.auth.token')) {
          localStorage.removeItem(key);
        }
      });
      
      // Attempt official sign out
      await supabase.auth.signOut();
    } catch (e) {
      console.error('Supabase signout error:', e);
    } finally {
      // Always clear our own session and reload
      localStorage.removeItem('smartai_session'); 
      localStorage.removeItem('smartai_admin_session');
      localStorage.removeItem('smartai_admin_session_id');
      localStorage.removeItem('supabase.auth.token');
      // Set states to force immediate re-render before reload
      setIsLoggedIn(false);
      setAuthMode('login');
      window.location.reload(); // Hard reload for clean state
    }
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

  const copyToClipboard = async (text: string, type: 'code' | 'link' | 'text') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'code') { setCopiedCode(true); setTimeout(() => setCopiedCode(false), 2000); }
      else if (type === 'link') { setCopiedLink(true); setTimeout(() => setCopiedLink(false), 2000); }
      else { setCopiedText(true); setTimeout(() => setCopiedText(false), 2000); }
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      if (type === 'code') { setCopiedCode(true); setTimeout(() => setCopiedCode(false), 2000); }
      else if (type === 'link') { setCopiedLink(true); setTimeout(() => setCopiedLink(false), 2000); }
      else { setCopiedText(true); setTimeout(() => setCopiedText(false), 2000); }
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
    localStorage.setItem(`smartai_chat_history_${email}`, JSON.stringify(updatedHistory));
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

  const handleUpdateProfile = async () => {
    if (!tempDisplayName.trim()) return alert('Name cannot be empty');
    
    if (tempDisplayName !== displayName) {
      // 1. Check local users
      const localUsers = getUsers();
      if (localUsers.some(u => (u.displayName?.toLowerCase() === tempDisplayName.toLowerCase() || u.name?.toLowerCase() === tempDisplayName.toLowerCase()) && u.email !== email)) {
        return alert('This name is already taken. Please choose another name.');
      }

      // 2. Check Supabase users table
      const { data: existingUser } = await supabase
        .from('users')
        .select('displayName')
        .ilike('displayName', tempDisplayName)
        .maybeSingle();

      if (existingUser) {
        return alert('This name is already taken. Please choose another name.');
      }
    }

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

      localStorage.setItem(`smartai_chat_history_${email}`, JSON.stringify(updated));
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

  const generatePolyglotCode = async (refineMsg?: string) => {
    const taskToGen = refineMsg || polyTask;
    if (!taskToGen.trim() || polyIsGenerating) {
      if (!taskToGen.trim() && !polyIsGenerating) alert("Please describe the task you want to generate.");
      return;
    }
    
    setPolyIsGenerating(true);
    setPolyShowPreview(false);
    if (!refineMsg) setPolyResult(null);

    const advancedStr = Object.entries(polyAdvanced)
      .filter(([_, v]) => v)
      .map(([k, _]) => k.replace(/([A-Z])/g, ' $1').toLowerCase())
      .join(', ');

    let prompt = "";
    if (refineMsg) {
      prompt = `The user wants to refine the previous project: "${polyResult?.title}".
      Modification requested: "${refineMsg}".
      Update the existing architecture and code. 
      Current project files: ${JSON.stringify(polyResult?.files?.map((f: any) => f.name))}.
      Return the ENTIRE updated project in the same JSON format.`;
    } else {
      prompt = `Generate a professional ${polyComplexity}% complex ${polyType} for the task: "${taskToGen}" using ${polyLang} and ${polyFramework} framework.
      Style: ${polyStyle}.
      Advanced Requirements: ${advancedStr}.
      Provide the response in JSON format:
      {
        "title": "Project Name",
        "overview": "Summary of architecture and logic",
        "folderStructure": "Visual tree of files",
        "files": [
          { "name": "filename", "code": "code content", "lang": "language" }
        ],
        "dependencies": ["list of npm/pip pkgs"],
        "installation": "Step by step guide",
        "endpoints": "List of API routes if applicable",
        "usage": "How to run and use"
      }`;
    }

    try {
      const res = await fetch(`/api/chat?prompt=${encodeURIComponent(prompt)}&system=You are a Senior Software Architect. Return ONLY pure JSON. No markdown tags like \`\`\`json.&json=true`);
      if (res.ok) {
        const text = await res.text();
        // More robust JSON cleaning
        const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("No valid JSON found in response");
        const data = JSON.parse(jsonMatch[0]);
        
        setPolyResult(data);
        if (data.files && data.files.length > 0) {
          const mainFile = data.files.find((f: any) => f.name.includes('index') || f.name.includes('main') || f.name.includes('App')) || data.files[0];
          setPolyActiveFile(mainFile.name);
          setPolyPreviewCode(mainFile.code);
        }
        
        if (refineMsg) setPolyRefinement('');

        setCreativeHistory(prev => [{
          id: Date.now().toString(),
          type: 'polyglot',
          toolName: 'Polyglot',
          input: taskToGen,
          result: data,
          date: new Date().toLocaleTimeString()
        } as any, ...prev]);
      }
    } catch (e) {
      console.error("Polyglot error:", e);
      alert("Failed to generate code. AI might have returned invalid JSON. Try refining the prompt.");
    } finally {
      setPolyIsGenerating(false);
    }
  };

  const getPolyPreviewDoc = () => {
    if (!polyResult || !polyResult.files) return "";
    
    const htmlFile = polyResult.files.find((f: any) => f.name.endsWith('.html'))?.code || "";
    const cssFiles = polyResult.files.filter((f: any) => f.name.endsWith('.css')).map((f: any) => `<style>${f.code}</style>`).join('\n');
    const jsFiles = polyResult.files.filter((f: any) => f.name.endsWith('.js') || f.name.endsWith('.ts')).map((f: any) => `<script>${f.code}</script>`).join('\n');

    if (htmlFile) {
      return htmlFile.replace('</head>', `${cssFiles}</head>`).replace('</body>', `${jsFiles}</body>`);
    }

    // Default template if no HTML file
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script src="https://cdn.tailwindcss.com"></script>
          ${cssFiles}
        </head>
        <body class="bg-[#050816] text-white">
          <div id="root"></div>
          ${jsFiles}
        </body>
      </html>
    `;
  };

  const renderPolyglot = () => {
    return (
      <div className="h-full bg-[#050816] text-white flex flex-col overflow-hidden relative">
        <AnimatePresence>
          {polyIsGenerating && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[100] bg-[#050816]/90 backdrop-blur-md flex flex-col items-center justify-center p-10">
              <div className="w-full max-w-md space-y-6">
                <div className="flex items-center gap-4 text-cyan-400">
                  <Terminal className="w-8 h-8 animate-pulse" />
                  <div className="h-px flex-1 bg-gradient-to-r from-cyan-500/50 to-transparent" />
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-500 animate-pulse">Initializing Polyglot Engine...</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-purple-500 delay-75 animate-pulse">Loading Multi-Language Compiler...</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white delay-150 animate-pulse">Connecting AI Development Core...</p>
                </div>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div initial={{ x: '-100%' }} animate={{ x: '100%' }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }} className="h-full w-1/3 bg-cyan-400 shadow-[0_0_20px_#22D3EE]" />
                </div>
                <p className="text-center text-xs font-mono text-slate-500">Compiling high-end architecture...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Top Header */}
        <div className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-[#0B1023]/40 backdrop-blur-xl shrink-0">
          <div className="flex items-center gap-6">
            <button onClick={() => setExpertSubTab('')} className="p-2.5 bg-slate-900 border border-white/5 rounded-xl text-slate-400 hover:text-cyan-400 transition-all group">
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tighter italic flex items-center gap-2">Polyglot <span className="text-[10px] not-italic text-cyan-500 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">V2.0 PRO</span></h2>
              <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest">AI Multi-Language Dev Core</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => generatePolyglotCode()}
              disabled={polyIsGenerating}
              className="px-6 py-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-lg shadow-cyan-500/20 flex items-center gap-2"
            >
              <Zap className="w-4 h-4" /> Generate Code
            </button>
            <button 
              onClick={() => setPolyShowPreview(!polyShowPreview)}
              className={`px-4 py-2 border rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${polyShowPreview ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' : 'bg-slate-900 border-white/5 text-slate-400 hover:text-white'}`}
            >
              <Eye className="w-4 h-4" /> {polyShowPreview ? 'View Code' : 'Run Preview'}
            </button>
            <div className="flex items-center gap-2 ml-4">
              <button className="p-2.5 bg-slate-900 border border-white/5 rounded-xl text-slate-400 hover:text-white transition-all"><Save className="w-4 h-4" /></button>
              <button className="p-2.5 bg-slate-900 border border-white/5 rounded-xl text-slate-400 hover:text-white transition-all"><Download className="w-4 h-4" /></button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel: Inputs */}
          <div className="w-80 border-r border-white/5 bg-[#0B1023]/20 flex flex-col shrink-0 overflow-y-auto no-scrollbar">
            <div className="p-6 space-y-8">
              {/* Language Selector */}
              <div className="space-y-3">
                <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 ml-1">Environment</label>
                <div className="grid grid-cols-2 gap-2">
                  <select value={polyLang} onChange={e => setPolyLang(e.target.value)} className="col-span-2 bg-slate-900 border border-white/5 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-cyan-500/50 appearance-none cursor-pointer">
                    {['JavaScript', 'Python', 'TypeScript', 'PHP', 'Java', 'C++', 'C#', 'Go', 'Rust', 'Swift', 'Kotlin', 'HTML/CSS', 'SQL', 'Bash', 'Node.js', 'React', 'Next.js'].map(l => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Task Input */}
              <div className="space-y-3">
                <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 ml-1">Task Description</label>
                <textarea 
                  value={polyTask}
                  onChange={e => setPolyTask(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      generatePolyglotCode();
                    }
                  }}
                  placeholder="e.g. Build a secure Auth system with JWT or Create a high-performance weather API... (Ctrl+Enter to generate)"
                  className="w-full h-32 bg-slate-900 border border-white/5 rounded-xl p-4 text-xs font-medium outline-none focus:border-cyan-500/50 resize-none placeholder:text-slate-700 transition-all"
                />
              </div>

              {/* Complexity Slider */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 ml-1">Architecture Complexity</label>
                  <span className="text-[9px] font-black text-cyan-400">{polyComplexity}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" 
                  value={polyComplexity}
                  onChange={e => setPolyComplexity(parseInt(e.target.value))}
                  className="w-full accent-cyan-500 h-1 bg-slate-800 rounded-full cursor-pointer"
                />
                <p className="text-[8px] text-slate-600 font-bold uppercase text-center">
                  {polyComplexity < 30 ? 'Beginner / Readable' : polyComplexity < 60 ? 'Intermediate / Optimized' : polyComplexity < 85 ? 'Advanced / Scalable' : 'Expert / Enterprise'}
                </p>
              </div>

              {/* Advanced Dev Controls */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                <button className="w-full flex items-center justify-between group" onClick={() => {}}>
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Advanced Dev Controls</span>
                  <Settings className="w-3.5 h-3.5 text-slate-600 group-hover:text-cyan-500 transition-colors" />
                </button>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { id: 'comments', label: 'Add Comments' },
                    { id: 'docs', label: 'Generate Documentation' },
                    { id: 'errorHandling', label: 'Error Handling' },
                    { id: 'security', label: 'Security Best Practices' },
                    { id: 'responsive', label: 'Responsive Design' },
                    { id: 'darkUI', label: 'Dark Mode UI' }
                  ].map(opt => (
                    <button 
                      key={opt.id}
                      onClick={() => setPolyAdvanced(prev => ({ ...prev, [opt.id]: !prev[opt.id as keyof typeof polyAdvanced] }))}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all ${polyAdvanced[opt.id as keyof typeof polyAdvanced] ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' : 'bg-slate-900/50 border-white/5 text-slate-600 hover:text-slate-400'}`}
                    >
                      <span className="text-[10px] font-bold">{opt.label}</span>
                      {polyAdvanced[opt.id as keyof typeof polyAdvanced] ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Center Panel: Code Editor */}
          <div className="flex-1 flex flex-col bg-[#050816] relative">
            <div className="h-10 border-b border-white/5 bg-[#0B1023]/60 flex items-center px-4 justify-between">
              <div className="flex items-center gap-1">
                {polyResult?.files?.map((f: any) => (
                  <button 
                    key={f.name}
                    onClick={() => { setPolyActiveFile(f.name); setPolyPreviewCode(f.code); }}
                    className={`px-4 h-10 text-[10px] font-bold uppercase tracking-widest transition-all border-b-2 flex items-center gap-2 ${polyActiveFile === f.name ? 'border-cyan-500 text-cyan-400 bg-cyan-500/5' : 'border-transparent text-slate-600 hover:text-slate-400 hover:bg-white/5'}`}
                  >
                    <FileJson className="w-3 h-3" /> {f.name}
                  </button>
                ))}
              </div>
              <button className="p-1.5 hover:bg-white/5 rounded-lg text-slate-600 hover:text-cyan-400 transition-colors">
                <Copy className="w-3.5 h-3.5" onClick={() => copyToClipboard(polyPreviewCode, 'code')} />
              </button>
            </div>

            <div className="flex-1 overflow-hidden relative">
              {!polyResult ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-800 p-20 text-center">
                  <div className="w-24 h-24 border-2 border-dashed border-slate-800 rounded-3xl flex items-center justify-center mb-6">
                    <Code className="w-10 h-10 opacity-20" />
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-[0.3em] mb-2">Dev Core Idle</h3>
                  <p className="text-[10px] font-medium max-w-xs leading-relaxed uppercase tracking-widest opacity-50">Select environment and describe task to initialize polyglot engine.</p>
                </div>
              ) : (
                <div className="flex-1 min-h-0 bg-black/20 relative w-full h-full">
                  {polyShowPreview ? (
                    <iframe 
                      srcDoc={getPolyPreviewDoc()}
                      className="w-full h-full border-none bg-white"
                      title="Polyglot Preview"
                      sandbox="allow-scripts"
                    />
                  ) : (
                    <textarea 
                      value={polyPreviewCode}
                      onChange={e => setPolyPreviewCode(e.target.value)}
                      className="w-full h-full bg-[#050816] p-8 font-mono text-[13px] text-cyan-50/80 outline-none resize-none no-scrollbar leading-relaxed"
                      spellCheck={false}
                    />
                  )}
                </div>
              )}
            </div>

            {/* Bottom: Logs & Refinement */}
            <div className="h-60 border-t border-white/5 bg-black/40 flex flex-col">
              <div className="flex-1 p-4 font-mono text-[10px] overflow-y-auto no-scrollbar">
                <div className="flex items-center gap-2 text-cyan-500 mb-2">
                  <Terminal className="w-3 h-3" />
                  <span className="font-black uppercase tracking-widest">Neural Console</span>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-500 opacity-50">[SYSTEM] Polyglot Runtime v2.8.0</p>
                  <p className="text-slate-500 opacity-50">[INFO] Context size: 128k tokens</p>
                  {polyIsGenerating ? (
                    <>
                      <p className="text-cyan-400 animate-pulse">&gt; ANALYZING REQUIREMENTS...</p>
                      <p className="text-cyan-400 animate-pulse">&gt; STRUCTURING MODULES...</p>
                      <p className="text-purple-400 animate-pulse">&gt; GENERATING OPTIMIZED {polyLang.toUpperCase()} CODE...</p>
                    </>
                  ) : polyResult ? (
                    <>
                      <p className="text-emerald-500">&gt; COMPILATION SUCCESSFUL.</p>
                      <p className="text-slate-400">&gt; {polyResult.title} ready for deployment.</p>
                      <p className="text-slate-400">&gt; Framework: {polyFramework} | Complexity: {polyComplexity}%</p>
                    </>
                  ) : (
                    <p className="text-slate-600">&gt; Ready for input.</p>
                  )}
                </div>
              </div>

              {/* Refinement Area */}
              <div className="h-16 border-t border-white/5 bg-[#050816] flex items-center px-4 gap-4">
                <div className="flex-1 relative">
                  <input 
                    type="text"
                    placeholder="Ask AI to add features, fix bugs, or change styles..."
                    value={polyRefinement}
                    onChange={e => setPolyRefinement(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && generatePolyglotCode(polyRefinement)}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-600 outline-none focus:border-indigo-500/50 transition-all pr-12"
                  />
                  <button 
                    onClick={() => generatePolyglotCode(polyRefinement)}
                    disabled={!polyRefinement.trim() || polyIsGenerating}
                    className="absolute right-1 top-1 bottom-1 px-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white transition-all disabled:opacity-30"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Project Intel */}
          <div className="w-80 border-l border-white/5 bg-[#0B1023]/20 flex flex-col shrink-0 overflow-y-auto no-scrollbar">
            {polyResult ? (
              <div className="p-6 space-y-8">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-500 flex items-center gap-2"><Layout className="w-3.5 h-3.5" /> Project Overview</h4>
                  <div className="p-4 bg-slate-900/50 border border-white/5 rounded-2xl">
                    <h5 className="text-xs font-black text-white mb-2 italic uppercase tracking-tight">{polyResult.title}</h5>
                    <p className="text-[10px] text-slate-400 leading-relaxed font-medium">{polyResult.overview}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-500 flex items-center gap-2"><FolderJson className="w-3.5 h-3.5" /> Folder Structure</h4>
                  <pre className="p-4 bg-black/40 border border-white/5 rounded-xl font-mono text-[9px] text-slate-400 leading-relaxed">
                    {polyResult.folderStructure}
                  </pre>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 flex items-center gap-2"><Zap className="w-3.5 h-3.5" /> Quick Actions</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <button className="p-3 bg-slate-900 border border-white/5 rounded-xl text-[9px] font-black uppercase tracking-widest hover:text-cyan-400 transition-all flex flex-col items-center gap-2" onClick={() => setExpertSubTab('debugger')}><Bug className="w-4 h-4"/> Debug</button>
                    <button className="p-3 bg-slate-900 border border-white/5 rounded-xl text-[9px] font-black uppercase tracking-widest hover:text-emerald-400 transition-all flex flex-col items-center gap-2"><Zap className="w-4 h-4"/> Optimize</button>
                    <button className="p-3 bg-slate-900 border border-white/5 rounded-xl text-[9px] font-black uppercase tracking-widest hover:text-purple-400 transition-all flex flex-col items-center gap-2"><FileSearch className="w-4 h-4"/> Explain</button>
                    <button className="p-3 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-cyan-500/20 transition-all flex flex-col items-center gap-2" onClick={() => setPolyShowPreview(true)}>
                      <Monitor className="w-4 h-4 text-cyan-400"/> 
                      {polyShowPreview ? 'Hide Preview' : 'Run Preview'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-10 text-center opacity-30 grayscale">
                <TrendingUp className="w-12 h-12 mb-4" />
                <h4 className="text-[9px] font-black uppercase tracking-[0.3em]">Trending Templates</h4>
                <div className="mt-6 w-full space-y-2">
                  {['SaaS Dashboard', 'AI Chatbot', 'Crypto App', 'Portfolio Website', 'Auth System'].map(t => (
                    <button key={t} onClick={() => setPolyTask(`Build a ${t}`)} className="w-full p-3 bg-slate-900/50 border border-white/5 rounded-xl text-[9px] font-bold text-slate-500 hover:text-cyan-400 transition-all">{t}</button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const generateDebuggerAnalysis = async (customPrompt?: string) => {
    if (!debugCode.trim() || debugIsAnalyzing) return;
    
    setDebugIsAnalyzing(true);
    setDebugResult(null);

    const advancedStr = Object.entries(debugAdvanced)
      .filter(([_, v]) => v)
      .map(([k, _]) => k.replace(/([A-Z])/g, ' $1').toLowerCase())
      .join(', ');

    const prompt = customPrompt || `Analyze the following ${debugLang} code for ${debugType}.
    Complexity Level: ${debugComplexity}.
    Advanced Controls: ${advancedStr}.
    Code to analyze:
    ${debugCode}
    
    Associated Error Logs:
    ${debugLogs}

    Provide a professional developer debugging report in JSON format:
    {
      "summary": "High level summary of the issues",
      "severity": "Low | Medium | High | Critical",
      "issues": [
        { "type": "Error Type", "desc": "Description", "line": 0, "severity": "Level", "cause": "Why it happened", "fix": "How to fix it" }
      ],
      "fixedCode": "Complete corrected and optimized code",
      "explanation": "Beginner-friendly explanation of the bugs",
      "securityAudit": "Analysis of vulnerabilities",
      "performanceTips": "Optimization suggestions",
      "architectureAdvice": "Better structure suggestions"
    }`;

    try {
      const res = await fetch(`/api/chat?prompt=${encodeURIComponent(prompt)}&system=You are an elite Senior Debugger and Security Researcher. Return ONLY pure JSON. No markdown tags like \`\`\`json.&json=true`);
      if (res.ok) {
        const text = await res.text();
        const cleanJson = text.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
        const data = JSON.parse(cleanJson);
        setDebugResult(data);
        
        setCreativeHistory(prev => [{
          id: Date.now().toString(),
          type: 'debugger',
          toolName: 'AI Debugger',
          input: debugCode.substring(0, 50) + '...',
          result: data,
          date: new Date().toLocaleTimeString()
        } as any, ...prev]);
      }
    } catch (e) {
      console.error("Debugger error:", e);
      alert("Failed to analyze code. AI might have returned invalid JSON. Try simplifying the code.");
    } finally {
      setDebugIsAnalyzing(false);
    }
  };

  const renderDebugger = () => {
    return (
      <div className="h-full bg-[#050816] text-white flex flex-col overflow-hidden relative">
        <AnimatePresence>
          {debugIsAnalyzing && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[100] bg-[#050816]/95 backdrop-blur-xl flex flex-col items-center justify-center p-10">
              <div className="w-full max-w-md space-y-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-red-500/20 blur-[50px] animate-pulse rounded-full" />
                  <Bug className="w-16 h-16 text-red-500 mx-auto relative animate-bounce" />
                </div>
                <div className="space-y-3 text-center">
                  <p className="text-[10px] font-black uppercase tracking-[0.5em] text-red-500 animate-pulse">Initializing Debug Engine...</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.5em] text-cyan-500 delay-75 animate-pulse">Scanning Code Structure...</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white delay-150 animate-pulse">Detecting Errors & Vulnerabilities...</p>
                </div>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden relative">
                   <motion.div 
                     initial={{ left: '-100%' }} 
                     animate={{ left: '100%' }} 
                     transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                     className="absolute h-full w-1/2 bg-gradient-to-r from-transparent via-red-500 to-transparent" 
                   />
                </div>
                <div className="flex justify-between font-mono text-[9px] text-slate-500 uppercase tracking-widest">
                  <span>Semantic Grid Active</span>
                  <span>Scanning Line 409...</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Top Header */}
        <div className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-[#0B1023]/40 backdrop-blur-xl shrink-0">
          <div className="flex items-center gap-6">
            <button onClick={() => setExpertSubTab('')} className="p-2.5 bg-slate-900 border border-white/5 rounded-xl text-slate-400 hover:text-red-400 transition-all group">
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tighter italic flex items-center gap-2">Debugger <span className="text-[10px] not-italic text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">SENTINEL V1</span></h2>
              <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest">AI Semantic Diagnosis & Fix Core</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => generateDebuggerAnalysis()}
              disabled={debugIsAnalyzing}
              className="px-6 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-lg shadow-red-500/20 flex items-center gap-2"
            >
              <Search className="w-4 h-4" /> Analyze Code
            </button>
            <div className="h-8 w-px bg-white/5 mx-2" />
            <button className="p-2.5 bg-slate-900 border border-white/5 rounded-xl text-slate-400 hover:text-white transition-all"><Save className="w-4 h-4" /></button>
            <button className="p-2.5 bg-slate-900 border border-white/5 rounded-xl text-slate-400 hover:text-white transition-all"><Download className="w-4 h-4" /></button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel: Inputs */}
          <div className="w-80 border-r border-white/5 bg-[#0B1023]/20 flex flex-col shrink-0 overflow-y-auto no-scrollbar">
            <div className="p-6 space-y-8">
              {/* Language & Complexity */}
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 ml-1">Environment</label>
                  <select value={debugLang} onChange={e => setDebugLang(e.target.value)} className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-red-500/50 appearance-none cursor-pointer">
                    {['JavaScript', 'Python', 'TypeScript', 'PHP', 'Java', 'C++', 'C#', 'Go', 'Rust', 'React', 'Next.js', 'Node.js', 'SQL', 'HTML/CSS'].map(l => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 ml-1">Debug Type</label>
                  <select value={debugType} onChange={e => setDebugType(e.target.value)} className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-red-500/50 appearance-none cursor-pointer">
                    {['Syntax Errors', 'Runtime Errors', 'Logic Errors', 'Performance Issues', 'Security Vulnerabilities', 'API Errors', 'Database Errors', 'UI Bugs', 'Full Code Audit'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Error Logs */}
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 ml-1">Error Logs (Optional)</label>
                <textarea 
                  value={debugLogs}
                  onChange={e => setDebugLogs(e.target.value)}
                  placeholder="Paste terminal errors or console logs..."
                  className="w-full h-32 bg-slate-950 border border-white/5 rounded-2xl p-4 text-[11px] font-mono text-red-400/80 outline-none focus:border-red-500/30 resize-none no-scrollbar placeholder:text-slate-800"
                />
              </div>

              {/* Advanced Controls */}
              <div className="space-y-4">
                <button 
                  onClick={() => setDebugShowAdvanced(!debugShowAdvanced)}
                  className="w-full py-3 bg-slate-900 border border-white/5 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  <Settings className="w-3.5 h-3.5" /> Advanced Debug Controls
                </button>
                <AnimatePresence>
                  {debugShowAdvanced && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden bg-black/20 rounded-2xl p-4 space-y-3">
                      {Object.entries(debugAdvanced).map(([key, val]) => (
                        <label key={key} className="flex items-center justify-between cursor-pointer group">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 group-hover:text-slate-300 transition-colors">{key.replace(/([A-Z])/g, ' $1')}</span>
                          <input 
                            type="checkbox" 
                            checked={val} 
                            onChange={() => setDebugAdvanced(prev => ({ ...prev, [key]: !val }))}
                            className="w-4 h-4 rounded border-white/10 bg-slate-900 text-red-500 focus:ring-red-500/20"
                          />
                        </label>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Quick Templates */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-600">Quick Templates</h4>
                <div className="grid grid-cols-1 gap-2">
                  {['Fix React Errors', 'Optimize API', 'Secure Backend', 'Database Crash'].map(t => (
                    <button key={t} className="w-full p-3 bg-slate-900/40 border border-white/5 rounded-xl text-[9px] font-bold text-slate-500 hover:text-red-400 text-left transition-all">{t}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Center Panel: Workspace */}
          <div className="flex-1 flex flex-col bg-[#050816] relative">
            <div className="h-10 border-b border-white/5 bg-[#0B1023]/60 flex items-center px-4 justify-between">
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setDebugActiveTab('code')}
                  className={`px-4 h-10 text-[10px] font-bold uppercase tracking-widest transition-all border-b-2 flex items-center gap-2 ${debugActiveTab === 'code' ? 'border-red-500 text-red-400 bg-red-500/5' : 'border-transparent text-slate-600 hover:text-slate-400 hover:bg-white/5'}`}
                >
                  <Code className="w-3.5 h-3.5" /> Source Code
                </button>
                {debugResult && (
                  <button 
                    onClick={() => setDebugActiveTab('comparison')}
                    className={`px-4 h-10 text-[10px] font-bold uppercase tracking-widest transition-all border-b-2 flex items-center gap-2 ${debugActiveTab === 'comparison' ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5' : 'border-transparent text-slate-600 hover:text-slate-400 hover:bg-white/5'}`}
                  >
                    <Layers className="w-3.5 h-3.5" /> Compare & Fix
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button className="p-1.5 hover:bg-white/5 rounded-lg text-slate-600 hover:text-red-400 transition-colors">
                  <RefreshCcw className="w-3.5 h-3.5" />
                </button>
                <button className="p-1.5 hover:bg-white/5 rounded-lg text-slate-600 hover:text-red-400 transition-colors">
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-hidden relative">
              {debugActiveTab === 'code' ? (
                <textarea 
                  value={debugCode}
                  onChange={e => setDebugCode(e.target.value)}
                  placeholder="Paste your code here for semantic AI analysis..."
                  className="w-full h-full bg-[#050816] p-8 font-mono text-[13px] text-slate-300 outline-none resize-none no-scrollbar leading-relaxed"
                  spellCheck={false}
                />
              ) : (
                <div className="h-full flex overflow-hidden">
                  <div className="flex-1 border-r border-white/5 flex flex-col">
                    <div className="p-2 bg-red-500/5 border-b border-white/5 text-[9px] font-black uppercase text-red-400 px-4">Original Code</div>
                    <textarea value={debugCode} readOnly className="flex-1 bg-black/20 p-6 font-mono text-xs text-slate-500 outline-none resize-none no-scrollbar opacity-50" />
                  </div>
                  <div className="flex-1 flex flex-col">
                    <div className="p-2 bg-emerald-500/5 border-b border-white/5 text-[9px] font-black uppercase text-emerald-400 px-4">Corrected & Optimized</div>
                    <textarea value={debugResult?.fixedCode} readOnly className="flex-1 bg-[#050816] p-6 font-mono text-xs text-emerald-50/80 outline-none resize-none no-scrollbar" />
                  </div>
                </div>
              )}

              {/* Glowing Analyze Button Overlay */}
              {!debugResult && !debugCode && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-800 p-20 text-center">
                  <div className="w-24 h-24 border-2 border-dashed border-slate-800 rounded-3xl flex items-center justify-center mb-6">
                    <Search className="w-10 h-10 opacity-20" />
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-[0.3em] mb-2">Diagnosis Core Idle</h3>
                  <p className="text-[10px] font-medium max-w-xs leading-relaxed uppercase tracking-widest opacity-50">Paste code to begin semantic error detection and architectural audit.</p>
                </div>
              )}
            </div>

            {/* Bottom: Diagnostics Log */}
            <div className="h-48 border-t border-white/5 bg-black/40 flex flex-col overflow-hidden">
              <div className="p-4 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-2 text-red-500">
                  <Terminal className="w-3 h-3" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Diagnostic Console</span>
                </div>
                {debugResult && (
                   <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${
                     debugResult.severity === 'Critical' ? 'bg-red-500 text-white' : 
                     debugResult.severity === 'High' ? 'bg-orange-500 text-white' : 
                     'bg-cyan-500 text-black'
                   }`}>
                     {debugResult.severity} Risk Detected
                   </span>
                )}
              </div>
              <div className="flex-1 p-4 font-mono text-[10px] overflow-y-auto no-scrollbar space-y-2">
                {debugIsAnalyzing ? (
                  <>
                    <p className="text-red-400 animate-pulse">&gt; ANALYZING AST TREE...</p>
                    <p className="text-cyan-400 animate-pulse">&gt; CHECKING FOR MEMORY LEAKS...</p>
                    <p className="text-purple-400 animate-pulse">&gt; SCANNING VULNERABILITIES...</p>
                  </>
                ) : debugResult ? (
                  <div className="space-y-3">
                    <p className="text-emerald-500 font-bold">&gt; ANALYSIS COMPLETE: {debugResult.issues?.length || 0} Issues Identified.</p>
                    <p className="text-slate-400 leading-relaxed">&gt; SUMMARY: {debugResult.summary}</p>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                       <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl">
                         <p className="text-[9px] font-black text-red-400 uppercase mb-1">Top Security Risk</p>
                         <p className="text-[10px] text-slate-400 italic">"{debugResult.securityAudit?.substring(0, 80)}..."</p>
                       </div>
                       <div className="p-3 bg-cyan-500/5 border border-cyan-500/10 rounded-xl">
                         <p className="text-[9px] font-black text-cyan-400 uppercase mb-1">Performance Insight</p>
                         <p className="text-[10px] text-slate-400 italic">"{debugResult.performanceTips?.substring(0, 80)}..."</p>
                       </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-700">&gt; Sentinel passive. Awaiting input stream.</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel: Report Cards */}
          <div className="w-96 border-l border-white/5 bg-[#0B1023]/20 flex flex-col shrink-0 overflow-hidden">
            <div className="p-6 border-b border-white/5">
               <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-500 flex items-center gap-2"><BarChart3 className="w-3.5 h-3.5" /> Error Reports</h4>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
              {debugResult?.issues?.map((issue: any, i: number) => (
                <div key={i} className="bg-slate-900/60 border border-white/5 rounded-2xl overflow-hidden hover:border-red-500/30 transition-all group">
                   <div className="p-4 border-b border-white/5 flex items-center justify-between bg-black/20">
                      <div className="flex items-center gap-2">
                         <Bug className={`w-3 h-3 ${issue.severity === 'Critical' ? 'text-red-500' : 'text-orange-500'}`} />
                         <span className="text-[10px] font-black uppercase tracking-tight text-white">{issue.type}</span>
                      </div>
                      <span className="text-[9px] font-bold text-slate-500">Line {issue.line}</span>
                   </div>
                   <div className="p-4 space-y-4">
                      <p className="text-[11px] text-slate-300 font-medium leading-relaxed">{issue.desc}</p>
                      <div className="space-y-2">
                         <div className="p-3 bg-red-500/5 rounded-xl border border-red-500/10">
                            <p className="text-[9px] font-black text-red-400 uppercase mb-1">Cause</p>
                            <p className="text-[10px] text-slate-400 italic">{issue.cause}</p>
                         </div>
                         <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                            <p className="text-[9px] font-black text-emerald-400 uppercase mb-1">Recommended Fix</p>
                            <p className="text-[10px] text-slate-300 font-bold">{issue.fix}</p>
                         </div>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button 
                          onClick={() => generateDebuggerAnalysis(`Explain this specific error in beginner-friendly terms: ${issue.type} - ${issue.desc}. Include why it happened and how to avoid it.`)}
                          className="flex-1 py-2 bg-slate-900 border border-white/5 rounded-lg text-[9px] font-black uppercase text-slate-400 hover:text-white transition-all"
                        >
                          Explain
                        </button>
                        <button 
                          onClick={() => setDebugActiveTab('comparison')}
                          className="flex-1 py-2 bg-indigo-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20"
                        >
                          Apply Fix
                        </button>
                      </div>
                   </div>
                </div>
              ))}

              {!debugResult && (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-20 grayscale py-20">
                   <FileSearch className="w-12 h-12 mb-4" />
                   <p className="text-[9px] font-black uppercase tracking-[0.2em]">No Active Reports</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderExpertPro = () => {
    if (expertSubTab === 'polyglot') return renderPolyglot();
    if (expertSubTab === 'debugger') return renderDebugger();

    const categories = [
      {
        id: 'ailab',
        title: 'Intelligence Lab',
        icon: Mic2,
        color: '#818cf8',
        gradient: 'from-indigo-500/20 to-purple-500/20',
        tools: [
          { name: 'Prompt Builder', desc: 'Neural prompt engineering.', icon: MessageSquare },
          { name: 'Cognitive Memory', desc: 'Long-term context.', icon: Database },
          { name: 'Model Forge', desc: 'Specialized AI models.', icon: Cpu },
          { name: 'Synthesis', desc: 'Knowledge integration.', icon: Book },
        ]
      },
      {
        id: 'workflows',
        title: 'Automation',
        icon: Workflow,
        color: '#a78bfa',
        gradient: 'from-purple-500/20 to-fuchsia-500/20',
        tools: [
          { name: 'Architect', desc: 'Workflow design.', icon: Network },
          { name: 'Logic Engine', desc: 'Branching & logic.', icon: GitBranch },
          { name: 'Triggers', desc: 'Event monitoring.', icon: Zap },
        ]
      },
      {
        id: 'integrations',
        title: 'Integrations',
        icon: Link,
        color: '#60a5fa',
        gradient: 'from-blue-500/20 to-cyan-500/20',
        tools: [
          { name: 'API Manager', desc: 'Key rotation.', icon: Key },
          { name: 'Webhooks', desc: 'Real-time sync.', icon: Webhook },
          { name: 'Connector', desc: '5000+ links.', icon: Layout },
          { name: 'Ecosystem', desc: 'Central control.', icon: Link },
        ]
      },
      {
        id: 'devtools',
        title: 'Dev Environment',
        icon: Code,
        color: '#34d399',
        gradient: 'from-emerald-500/20 to-teal-500/20',
        tools: [
          { name: 'Polyglot', desc: 'Multi-lang code.', icon: Code },
          { name: 'Debugger', desc: 'Semantic analysis.', icon: Bug },
          { name: 'Validator', desc: 'API suite.', icon: Server },
        ]
      },
      {
        id: 'datastudio',
        title: 'Data Studio',
        icon: BarChart3,
        color: '#fbbf24',
        gradient: 'from-amber-500/20 to-orange-500/20',
        tools: [
          { name: 'Ingestor', desc: 'Dataset processing.', icon: FileSpreadsheet },
          { name: 'Visual Intel', desc: 'Dynamic charts.', icon: BarChart },
          { name: 'Predictive', desc: 'Pattern recognition.', icon: Lightbulb },
        ]
      },
    ];

    return (
      <div className="h-full flex flex-col overflow-hidden bg-slate-950 relative">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.05)_0%,transparent_50%)]" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay" />
        </div>

        {/* Compact Header */}
        <div className="px-4 py-3 flex items-center justify-between bg-slate-900/60 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <Crown className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-tighter">Expert Console</h2>
              <div className="flex items-center gap-1.5">
                <span className="w-1 h-1 bg-emerald-500 rounded-full animate-ping" />
                <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest">Neural Link</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsPricingOpen(true)}
              className="px-4 py-1.5 bg-white text-black rounded-lg text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95"
            >
              Upgrade
            </button>
            <button onClick={() => setSmartMode('normal')} className="p-1.5 bg-slate-800/50 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-all border border-white/5">
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Compact Dashboard Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 md:p-6 relative z-10 no-scrollbar">
          <div className="max-w-full mx-auto space-y-8 px-2 md:px-4">
            {categories.map((cat, catIdx) => (
              <motion.div 
                key={cat.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: catIdx * 0.05 }}
                className="space-y-4"
              >
                {/* Compact Category Header */}
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-1.5 rounded-lg bg-gradient-to-br ${cat.gradient} border border-white/10`} style={{ color: cat.color }}>
                      <cat.icon className="w-3.5 h-3.5" />
                    </div>
                    <h3 className="text-xs font-black text-white uppercase tracking-wider">{cat.title}</h3>
                  </div>
                </div>

                {/* Expansive Tools Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4 sm:gap-5">
                  {cat.tools.map((tool, toolIdx) => (
                    <motion.div
                      key={tool.name}
                      whileHover={{ scale: 1.02, y: -4 }}
                      className="group relative bg-slate-900/40 border border-white/5 rounded-2xl p-6 flex flex-col gap-4 cursor-pointer transition-all hover:border-indigo-500/50 overflow-hidden h-full justify-between shadow-lg"
                      onClick={() => {
                        if (plan !== 'Expert Mode' && plan !== 'Ultra') {
                          alert('This tool requires Expert Mode or Ultra. Please upgrade to access.');
                          setIsPricingOpen(true);
                          return;
                        }
                        const tid = tool.name.toLowerCase();
                        if (tid === 'polyglot') {
                          setExpertSubTab('polyglot');
                        } else if (tid === 'debugger') {
                          setExpertSubTab('debugger');
                        } else {
                          handleSendMessage(`Initialize Expert Tool: ${tool.name}. Provide a brief overview of how this module functions in the Enterprise Ecosystem.`);
                        }
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="w-12 h-12 rounded-xl bg-slate-950 border border-white/5 group-hover:border-indigo-500/30 transition-all flex items-center justify-center shadow-inner">
                          <tool.icon className="w-6 h-6 text-slate-400 group-hover:text-indigo-400" />
                        </div>
                        <ChevronRight className="w-5 h-5 text-white/10 group-hover:text-white transition-colors" />
                      </div>

                      <div className="min-w-0">
                        <h4 className="text-sm font-black text-white group-hover:text-indigo-300 transition-colors">{tool.name}</h4>
                        <p className="text-[11px] text-slate-500 leading-relaxed font-medium group-hover:text-slate-400 transition-colors line-clamp-2">{tool.desc}</p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-slate-700 group-hover:text-indigo-500/50 transition-colors">
                          <span>Module Alpha v8.2</span>
                          <span>Active</span>
                        </div>
                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            whileInView={{ width: '100%' }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.5, delay: 0.2 }}
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}

            {/* Bottom Spacing */}
            <div className="h-12" />
          </div>
        </div>
      </div>
    );
  };

  // Streaming chat response (ChatGPT-style token-by-token UI)
  const handleSendMessage = async (overridePrompt?: string | any, isVoiceMode: boolean = false, voiceLang?: string) => {
    const promptText = typeof overridePrompt === 'string' ? overridePrompt : chatInput;
    const prompt = normalizePrompt(promptText);
    if (!prompt || isAiThinking) return;

    // Limits removed as requested

    // Check and process referral reward on first message
    processReferralReward();

    const userMsg: Message = { id: Date.now().toString(), role: 'user' as const, content: prompt, isVoice: isVoiceMode };
    const assistantId = (Date.now() + 1).toString();
    const assistantMsg: Message = { id: assistantId, role: 'assistant' as const, content: '', isVoice: isVoiceMode };
    const optimisticMessages = [...messages, userMsg, assistantMsg];
    const title = prompt.length > 25 ? `${prompt.substring(0, 25)}...` : prompt;

    setMessages(optimisticMessages);
    if (!isVoiceMode) setChatInput('');
    setIsAiThinking(true);
    updateCurrentChatHistory(currentChatId, title, optimisticMessages);
    if (smartMode === 'normal' || smartMode === 'creative') updateUsage('messages');

    let systemPrompt = `You are a helpful AI assistant. Provide accurate and useful answers. Maintain a ${tone} tone in your responses.`;
    
    // Plan-based intelligence
    if (plan === 'Expert Mode') {
      systemPrompt += " You are in EXPERT MODE. Provide extremely detailed, technical, and high-level professional responses. Use advanced terminology and provide step-by-step logic. You have access to the Neural Link and Enterprise Intelligence Lab.";
    } else if (plan === 'Creative Mode') {
      systemPrompt += " You are in CREATIVE MODE. Be highly imaginative, artistic, and expressive. Focus on storytelling, brainstorming, and creative problem solving.";
    }

    // Explicitly handle language for voice mode
    if (isVoiceMode && voiceLang) {
      if (voiceLang === 'hi-IN') {
        systemPrompt += " CRITICAL: The user is speaking HINDI. You MUST respond ONLY in HINDI using Devanagari script. Do not use English in your response.";
      } else {
        systemPrompt += " The user is speaking English. Respond in English.";
      }
    } else {
      systemPrompt += " Respond in the language used by the user.";
    }

    const contextualPrompt = buildContextualPrompt(messages, prompt);

    let renderedText = '';
    const appendWithTyping = async (text: string) => {
      const step = 6;
      for (let i = 0; i < text.length; i += step) {
        renderedText += text.slice(i, i + step);
        const partialText = renderedText;
        // Optimization: only update UI state if NOT in voice mode to save cycles
        // But we need to update it anyway if we want lastAiMessage to work correctly at the end
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
      setLastAiMessage(finalText);
      updateCurrentChatHistory(currentChatId, title, finalMessages);
    } catch (error: any) {
      console.error('Chat stream error:', error);
      const fallbackText = `Maaf kijiye, abhi response generate nahi ho paaya. Aapka prompt: "${prompt}". Kripya dubara try karein.`;
      const fallbackMessages = optimisticMessages.map(msg => msg.id === assistantId ? { ...msg, content: fallbackText } : msg);
      setMessages(fallbackMessages);
      setLastAiMessage(fallbackText);
      updateCurrentChatHistory(currentChatId, title, fallbackMessages);
    } finally {
      setIsAiThinking(false);
    }
  };

  const getDimensions = (quality: string, aspect: string): [number, number] => {
    // Feature enforcement based on plan
    let effectiveQuality = quality;
    if (plan === 'Normal Mode' && (quality === '4K' || quality === '8K' || quality === 'HD')) {
      effectiveQuality = 'Standard';
      console.log('Downscaling to Standard for Normal Plan');
    } else if (plan === 'Creative Mode' && (quality === '4K' || quality === '8K')) {
      effectiveQuality = 'HD';
      console.log('Downscaling to HD for Creative Plan');
    }

    const longEdge = { 'Standard': 512, 'HD': 1024, '4K': 1280, '8K': 2048 }[effectiveQuality] || 1024;
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
        if (ctx) {
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

    let tokenCost = isRegenerate ? 2 : 5;
    if (plan === 'Expert Mode') tokenCost = 0;
    else if (plan === 'Creative Mode') tokenCost = isRegenerate ? 1 : 3;

    if (credits < tokenCost && !isVipEmail(email)) { alert(`Insufficient credits (${tokenCost} tokens required).`); setIsPricingOpen(true); return; }

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
    localStorage.setItem(`smartai_image_history_${email}`, JSON.stringify([historyItem, ...imageHistory.slice(0, 99)]));

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
    if (credits < 50 && !isVipEmail(email)) { alert('Insufficient credits (50 required).'); setIsPricingOpen(true); return; }
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

    let systemPrompt = 'You are a highly advanced, empathetic, and intelligent AI assistant. Always provide a high-level, extremely helpful response. Understand the deep intent of the user, offer valuable extra suggestions, and express emotion using appropriate emojis! 🌟 Make the user feel heard and supported! 💕';
    if (creativeSubTab === 'writer') systemPrompt = 'You are a master AI Writer and a creative genius! ✍️✨ Write high-quality, engaging blogs, essays, and stories based on the user prompt. Add emotional depth, captivating hooks, and offer suggestions on how the user can improve their content further! Use emojis beautifully! 🌸';
    else if (creativeSubTab === 'code') systemPrompt = 'You are a Master Game Developer and Elite Senior Software Engineer! 🎮💻 Your mission is to generate high-end, visually stunning, and fully functional code. When generating games or interactive UI: 1. Use advanced logic (physics, state machines, proper game loops). 2. Create "Good Looking" visuals with modern CSS (glassmorphism, neon glows, smooth 60fps animations, professional typography). 3. ALWAYS include intuitive controls (Keyboard ARROW keys/WASD, Mouse, or Mobile Touch). 4. Prefer self-contained, high-performance HTML/CSS/JS that can be previewed. For other code, be professional, optimized, and follow best practices. Always wrap code in ``` blocks. Be encouraging and use emojis! 🚀✨';
    else if (creativeSubTab === 'summarizer') systemPrompt = 'You are an expert Speed-Reader and Analyst! 📚⚡ Summarize the provided text beautifully and concisely. Retain the absolute core information, provide a "Key Takeaways" section, and suggest why this information matters! Use engaging emojis and an empathetic tone! 🧠💡';
    else if (creativeSubTab === 'idea') systemPrompt = 'You are a brilliant Idea Generator and Brainstorming Partner! 🤯🎯 Provide innovative, out-of-the-box, and highly practical ideas. If you don\'t have the latest data, use your advanced logic to predict viral trends. Structure your response perfectly, give actionable next steps, and motivate the user with a highly emotional, enthusiastic tone and lots of inspiring emojis! 🚀🌟';
    else systemPrompt = 'You are a Master AI Assistant with advanced analytical capabilities. 🧠✨ Your goal is to provide perfect, unique, and highly accurate answers. If a user asks for latest info, use your internal knowledge to provide the most relevant data. Analyze the user\'s intent deeply and provide a response that feels human, intelligent, and world-class. If you are asked about the same topic repeatedly, provide deeper insights each time, acting as if you have an expanding memory of the conversation. 🚀';

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

  const handleSelectPlan = async (selectedPlan: (typeof PLANS)[number]) => {
    if (selectedPlan.name === 'Normal Mode' && plan === 'Normal Mode') { alert('You are already on the Normal plan.'); setIsPricingOpen(false); return; }
    if (selectedPlan.name === plan) { alert(`You are already on the ${plan} plan.`); setIsPricingOpen(false); return; }
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

  const renderOtpScreen = () => {
    const handlePaste = (e: React.ClipboardEvent) => {
      e.preventDefault();
      const pastedData = e.clipboardData.getData('text');
      // Strip everything except digits
      const digitsOnly = pastedData.replace(/\D/g, '').slice(0, 6);
      
      if (digitsOnly.length > 0) {
        const newOtp = [...otp];
        for (let i = 0; i < digitsOnly.length; i++) {
          newOtp[i] = digitsOnly[i];
        }
        setOtp(newOtp);
        
        // Focus the appropriate input
        const nextIndex = Math.min(digitsOnly.length, 5);
        document.getElementById(`otp-${nextIndex}`)?.focus();
      }
    };

    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(79,70,229,0.3)] rotate-3">
            <LockIcon className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white">Verify Identity</h2>
          <p className="text-slate-500 text-[11px] mt-2 leading-relaxed uppercase tracking-wider font-bold">Code sent to <span className="text-indigo-400">{email}</span></p>
        </div>

        <div className="flex justify-between gap-2">
          {otp.map((digit, i) => (
            <input
              key={i}
              id={`otp-${i}`}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={1}
              value={digit}
              onPaste={handlePaste}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                if (val) {
                  const newOtp = [...otp];
                  newOtp[i] = val.slice(-1);
                  setOtp(newOtp);
                  if (i < 5) document.getElementById(`otp-${i + 1}`)?.focus();
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Backspace' && !otp[i] && i > 0) {
                  const newOtp = [...otp];
                  newOtp[i - 1] = '';
                  setOtp(newOtp);
                  document.getElementById(`otp-${i - 1}`)?.focus();
                }
              }}
              className="w-12 h-14 bg-slate-950 border border-slate-800 rounded-xl text-center text-xl font-black text-white focus:border-indigo-500/50 outline-none transition-all shadow-inner"
            />
          ))}
        </div>

        <button onClick={handleOtpVerify} disabled={isAuthenticating} className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black uppercase tracking-[0.2em] text-xs shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition-all active:scale-95 disabled:opacity-50">
          {isAuthenticating ? 'Verifying Code...' : 'Verify Code'}
        </button>

        <div className="text-center space-y-3">
          <button
            onClick={async () => {
              await sendOtp(otpType);
              setResendSuccess(true);
              setTimeout(() => setResendSuccess(false), 3000);
            }}
            className={`text-[10px] font-black uppercase tracking-widest transition-all ${resendSuccess ? 'text-emerald-400' : 'text-slate-500 hover:text-white'}`}
          >
            {resendSuccess ? 'Code Sent Successfully!' : "Didn't receive code? Resend"}
          </button>
          <br />
          <button onClick={() => { setIsVerifyingOtp(false); if (authMode === 'forgot') setForgotPasswordStep('email'); }} className="text-[10px] font-bold text-slate-600 hover:text-slate-400 uppercase tracking-widest transition-colors">Back to {authMode === 'forgot' ? 'Reset' : otpType === 'login' ? 'Login' : 'Signup'}</button>
        </div>
      </div>
    );
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#050505] text-slate-200 flex items-center justify-center p-0 sm:p-4 font-sans relative overflow-hidden perspective-[1000px]">
        {/* Cinematic Background */}
        <div className="absolute top-[-20%] left-[-10%] w-[100%] sm:w-[60%] h-[100%] sm:h-[60%] bg-indigo-600/15 rounded-full blur-[100px] sm:blur-[150px] pointer-events-none animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[100%] sm:w-[60%] h-[100%] sm:h-[60%] bg-violet-600/15 rounded-full blur-[100px] sm:blur-[150px] pointer-events-none animate-pulse" style={{ animationDelay: '1s' }} />
        
        <motion.div 
          initial={{ opacity: 0, y: 40, rotateX: 10 }} 
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          className="w-full sm:max-w-[420px] min-h-screen sm:min-h-0 bg-slate-900/40 sm:border border-white/10 sm:rounded-[2rem] p-8 sm:p-10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] backdrop-blur-3xl relative z-10 flex flex-col justify-center"
        >
          <div className="flex flex-col items-center text-center mb-8">
            <motion.div 
              whileHover={{ rotateY: 180 }}
              className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-xl"
            >
               <Zap className="text-black w-7 h-7 fill-black" />
            </motion.div>
            <h1 className="text-2xl font-black text-white mb-1">Welcome Back</h1>
            <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest">Login securely to continue.</p>
          </div>

          {authError && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-[10px] font-bold text-center uppercase tracking-widest leading-relaxed">
              {authError}
            </motion.div>
          )}

          <div className="space-y-4">
            {isVerifyingOtp ? renderOtpScreen() : (
              <>
                {authMode === 'login' && (
                  <div className="space-y-4">
                    <button onClick={() => handleSocialLogin('google')} className="w-full h-12 bg-white text-black rounded-xl flex items-center justify-center gap-3 font-bold text-[11px] uppercase tracking-widest hover:bg-slate-100 transition-all active:scale-[0.98] shadow-lg border border-transparent">
                      <Globe className="w-4 h-4" /> Continue with Google
                    </button>

                    <div className="flex items-center gap-4 py-2">
                      <div className="h-[1px] flex-1 bg-white/10" />
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">OR</span>
                      <div className="h-[1px] flex-1 bg-white/10" />
                    </div>

                    <form onSubmit={handleLogin} className="space-y-3">
                      <input type="text" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email or Mobile Number" className="w-full h-12 bg-slate-950/50 border border-white/10 rounded-xl px-4 text-white outline-none focus:border-white/30 transition-all placeholder:text-slate-600 font-medium text-sm" />
                      <div className="relative">
                        <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="w-full h-12 bg-slate-950/50 border border-white/10 rounded-xl px-4 pr-12 text-white outline-none focus:border-white/30 transition-all placeholder:text-slate-600 text-sm" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"><IconComponent icon={showPassword ? EyeOff : Eye} className="w-4 h-4" /></button>
                      </div>
                      <button type="submit" disabled={isAuthenticating} className="w-full h-12 bg-indigo-600 text-white rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-indigo-500 transition-all active:scale-[0.98] shadow-xl shadow-indigo-600/20 disabled:opacity-50 mt-2">
                        {isAuthenticating ? 'Logging in...' : 'Login'}
                      </button>
                    </form>

                    <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">
                      <button onClick={() => setAuthMode('signup')} className="hover:text-white transition-colors">Create Account</button>
                      <button onClick={() => setAuthMode('forgot')} className="hover:text-white transition-colors">Forgot Password?</button>
                    </div>
                  </div>
                )}

                {authMode === 'signup' && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold text-white text-center">Join SmartAI Pro</h2>
                    <div className="space-y-3">
                      <input type="text" value={signupName} onChange={e => setSignupName(e.target.value)} placeholder="Full Name" className="w-full h-12 bg-slate-950/50 border border-white/10 rounded-xl px-4 text-white outline-none focus:border-white/30 transition-all placeholder:text-slate-600 text-sm" />
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" className="w-full h-12 bg-slate-950/50 border border-white/10 rounded-xl px-4 text-white outline-none focus:border-white/30 transition-all placeholder:text-slate-600 text-sm" />
                      <div className="grid grid-cols-2 gap-2">
                        <div className="relative">
                          <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="w-full h-12 bg-slate-950/50 border border-white/10 rounded-xl px-4 text-white outline-none focus:border-white/30 transition-all placeholder:text-slate-600 text-sm" />
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"><IconComponent icon={showPassword ? EyeOff : Eye} className="w-3.5 h-3.5" /></button>
                        </div>
                        <div className="relative">
                          <input type={showPassword ? "text" : "password"} value={signupConfirmPassword} onChange={e => setSignupConfirmPassword(e.target.value)} placeholder="Confirm" className="w-full h-12 bg-slate-950/50 border border-white/10 rounded-xl px-4 text-white outline-none focus:border-white/30 transition-all placeholder:text-slate-600 text-sm" />
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"><IconComponent icon={showPassword ? EyeOff : Eye} className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                      <input type="text" value={signupReferCode} onChange={e => setSignupReferCode(e.target.value)} placeholder="Referral Code (Optional)" className="w-full h-12 bg-slate-950/50 border border-white/10 rounded-xl px-4 text-white outline-none focus:border-white/30 transition-all placeholder:text-slate-600 text-sm uppercase" />
                    </div>
                    <button onClick={handleSignup} disabled={isAuthenticating} className="w-full h-12 bg-indigo-600 text-white rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-indigo-500 transition-all active:scale-[0.98] shadow-xl shadow-indigo-600/20 disabled:opacity-50">
                      {isAuthenticating ? 'Initializing...' : 'Continue'}
                    </button>
                    <div className="text-center">
                       <button onClick={() => setAuthMode('login')} className="text-[10px] text-slate-500 hover:text-white font-bold uppercase tracking-widest transition-colors">Back to Login</button>
                    </div>
                  </div>
                )}

                

                {authMode === 'forgot' && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold text-white text-center">Reset Access</h2>
                    <div className="space-y-3">
                       <input type="email" value={resetEmail} onChange={e => setResetEmail(e.target.value)} placeholder="Recovery email" className="w-full h-12 bg-slate-950/50 border border-white/10 rounded-xl px-4 text-white outline-none focus:border-white/30 transition-all placeholder:text-slate-600 text-sm" />
                       <button onClick={handleForgotPassword} disabled={isAuthenticating} className="w-full h-12 bg-indigo-600 text-white rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20">
                         {isAuthenticating ? 'Sending OTP...' : 'Send OTP Code'}
                       </button>
                    </div>
                    <div className="text-center">
                       <button onClick={() => setAuthMode('login')} className="text-[10px] text-slate-500 hover:text-white font-bold uppercase tracking-widest transition-colors">Back to Login</button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
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

    function renderMemeGenerator() {
      const generateMeme = async () => {
        if (!memeTopic.trim()) return;
        setIsMemeGenerating(true);
        setMemeLoadingText('Preparing Comedy Engine...');
        
        const loadingSteps = [
          'Finding Viral Meme Ideas...',
          'Cooking Funny Content...',
          'Optimizing for Trends...',
          'Injecting Humor...'
        ];

        let step = 0;
        const interval = setInterval(() => {
          if (step < loadingSteps.length) {
            setMemeLoadingText(loadingSteps[step]);
            step++;
          }
        }, 1200);

        const systemPrompt = `You are a World-Class AI Comedy Writer and Meme Expert. Generate high-end, viral humor content. 
        Topic: ${memeTopic}
        Type: ${memeType}
        Humor Level: ${memeHumorLevel}% (${memeHumorLevel > 75 ? 'Chaotic' : memeHumorLevel > 50 ? 'Crazy' : 'Funny'})
        Platform: ${memePlatform}
        Language: ${memeLanguage}
        Template Style: ${memeTemplate}
        Viral Mode: ${isViralMode ? 'ON (Maximum shareability, catchy hooks, trending structures)' : 'OFF'}
        Audience: ${memeAudienceAge}
        Add Emojis: ${addEmojis}
        Add Hashtags: ${addHashtags}

        RULES:
        - Naturally adapt the language (e.g., use Hinglish or Roman Urdu slang correctly).
        - Structure for the chosen template (Drake, POV, NPC, etc.).
        - Include a Viral Score (0-100) based on trendiness.
        - Output format: JSON { "joke": "...", "caption": "...", "hashtags": ["...", "..."], "viralScore": 89, "templateNote": "..." }`;

        try {
          const systemPrompt = `You are an elite AI Meme & Comedy expert. You MUST return ONLY a valid JSON object. DO NOT include markdown formatting or extra text.
          Format: {"joke": "...", "caption": "...", "hashtags": ["#..."], "viralScore": 95, "templateNote": "..."}`;
          
          const fullPrompt = `Create a ${memeType} about "${memeTopic}".
          CRITICAL RULES:
          1. LANGUAGE: Use ${memeLanguage}. If Hindi or Urdu is selected, YOU MUST USE ROMAN ALPHABETS (English letters like A-Z). DO NOT USE Devanagari or Arabic scripts. Write it exactly how Gen-Z types on WhatsApp (e.g., "Bhai kya kar raha hai").
          2. LENGTH: Keep it short, punchy, and highly readable (max 2-3 lines).
          3. HUMOR: Level is ${memeHumorLevel}%. Match the vibe of ${memeType}. If it's a Roast, be savage. If Dad Joke, be corny.
          4. PLATFORM: Optimize for ${memePlatform} audience.
          ${isViralMode ? 'Make it highly relatable and viral.' : ''} ${addEmojis ? 'Use 2-3 emojis.' : ''}
          Format the joke visually using HTML tags like <span class="text-pink-400">highlighted words</span> to make key punchlines or important words colorful!`;

          const url = `/api/chat?prompt=${encodeURIComponent(fullPrompt)}&system=${encodeURIComponent(systemPrompt)}&json=true&seed=${Math.floor(Math.random() * 99999)}`;
          const res = await fetch(url);

          if (!res.ok) throw new Error(`Server error: ${res.status}`);

          const rawText = await res.text();
          let parsed: any = null;
          
          // Clean up potential markdown formatting from the response
          const cleanText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

          const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            try { parsed = JSON.parse(jsonMatch[0]); } catch {}
          }

          if (!parsed || !parsed.joke) {
            parsed = {
              joke: cleanText.trim() || 'Bhai server hang ho gaya... 😂 <span class="text-red-400">Error 404: Humor Not Found</span>',
              caption: `${memeType} about ${memeTopic}`,
              hashtags: ['#funny', '#memes'],
              viralScore: 85,
              templateNote: memeTemplate
            };
          }

          if (!Array.isArray(parsed.hashtags)) {
            parsed.hashtags = String(parsed.hashtags || '').split(/[,\s#]+/).filter(Boolean).map(h => '#' + h);
          }

          setMemeResult(parsed);
          setCreativeHistory(prev => [{ type: 'meme', topic: memeTopic, result: parsed, date: new Date().toLocaleTimeString() }, ...prev]);
        } catch (e: any) {
          console.error('Meme generation error:', e);
          // Fallback so user always gets something
          const fallback = {
            joke: `POV: Tum "${memeTopic}" ke baare mein soch rahe ho aur AI ne server toh crash kar diya lekin joke nahi. 😂`,
            caption: `Best ${memeType} about ${memeTopic} — courtesy of SmartAI`,
            hashtags: ['memes', 'funny', 'viral', 'trending', memeTopic.replace(/\s/g, '')],
            viralScore: 82,
            templateNote: memeTemplate
          };
          setMemeResult(fallback);
        } finally {
          clearInterval(interval);
          setIsMemeGenerating(false);
        }
      };

      const handleTurnIntoImage = async () => {
        if (!memeResult) return;
        setIsMemeGenerating(true);
        setMemeLoadingText('Visualizing Humor...');
        try {
          const prompt = `A highly viral and funny meme image about "${memeTopic}". Visuals must clearly represent this comedy scenario. Style: ${memeTemplate}. CRITICAL: Do NOT write any text, letters, or words on the image. Zero text. Just the pure visual scene without any gibberish text.`;
          const res = await fetch(`/api/image?prompt=${encodeURIComponent(prompt)}&width=1024&height=1024`);
          if (res.ok) {
            const blob = await res.blob();
            setMemeImagePreview(URL.createObjectURL(blob));
          } else {
            console.error('Failed to generate meme image');
          }
        } catch (e) { console.error(e); }
        finally { setIsMemeGenerating(false); }
      };

      return (
        <div className="min-h-full bg-[#050816] text-white overflow-y-auto no-scrollbar pb-20 relative">
          <AnimatePresence>
            {isMemeGenerating && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-[#050816]/90 backdrop-blur-3xl flex flex-col items-center justify-center p-10">
                <div className="relative">
                   <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="w-32 h-32 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full" />
                   <div className="absolute inset-0 flex items-center justify-center text-4xl">😂</div>
                </div>
                <motion.p key={memeLoadingText} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 text-xl font-black italic uppercase tracking-widest text-indigo-400">{memeLoadingText}</motion.p>
                <div className="mt-4 flex gap-3">
                  <span className="animate-bounce">🤣</span>
                  <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>🔥</span>
                  <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>🙌</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Top Section */}
          <div className="p-6 md:p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5 bg-[#0B1023]/30 backdrop-blur-xl sticky top-0 z-40">
            <div className="flex items-center gap-3 mb-1">
                <button onClick={() => setCreativeSubTab('')} className="p-2.5 mr-2 bg-slate-900/50 hover:bg-indigo-500/20 border border-white/5 hover:border-indigo-500/50 rounded-xl text-slate-400 hover:text-indigo-400 transition-all group"><ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /></button>
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.3)]">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter">Joke / <span className="text-indigo-400">Meme Ideas</span></h1>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
               <button onClick={generateMeme} className="flex-1 md:flex-none bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all shadow-xl shadow-indigo-600/20">Generate</button>
               <button className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl hover:text-indigo-400 transition-colors"><Save className="w-4 h-4" /></button>
               <button className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl hover:text-indigo-400 transition-colors"><RefreshCcw className="w-4 h-4" /></button>
               <button className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl hover:text-indigo-400 transition-colors"><Download className="w-4 h-4" /></button>
            </div>
          </div>

          <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-10">
            {/* Input Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Topic */}
              <div className="md:col-span-2 lg:col-span-3 space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-1">Comedy Topic</label>
                <div className="relative group">
                  <input 
                    value={memeTopic} 
                    onChange={e => setMemeTopic(e.target.value)} 
                    placeholder="Try: School life, Exams, AI Memes, Desi Parents..." 
                    className="w-full bg-[#0B1023] border border-white/5 rounded-2xl px-6 py-5 text-lg font-bold outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-700 shadow-2xl"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2">
                    {['Exams', 'Office', 'Gaming'].map(t => (
                      <button key={t} onClick={() => setMemeTopic(t)} className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-[9px] font-bold text-slate-500 transition-colors border border-white/5">{t}</button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Selectors */}
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-1">Content Type</label>
                <select value={memeType} onChange={e => setMemeType(e.target.value)} className="w-full bg-[#0B1023] border border-white/5 rounded-2xl px-4 py-4 text-sm font-bold outline-none focus:border-indigo-500/50 appearance-none">
                  {['Meme Idea', 'Dark Joke', 'Dad Joke', 'Roast', 'One-Liner', 'Sarcastic Joke', 'Relatable Meme', 'Gen-Z Humor', 'Desi Humor', 'Gaming Meme', 'TikTok Comedy', 'Instagram Meme'].map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-1">Target Platform</label>
                <select value={memePlatform} onChange={e => setMemePlatform(e.target.value)} className="w-full bg-[#0B1023] border border-white/5 rounded-2xl px-4 py-4 text-sm font-bold outline-none focus:border-indigo-500/50 appearance-none">
                  {['Instagram', 'TikTok', 'Facebook', 'Twitter/X', 'Reddit', 'YouTube Shorts'].map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-1">Meme Template</label>
                <select value={memeTemplate} onChange={e => setMemeTemplate(e.target.value)} className="w-full bg-[#0B1023] border border-white/5 rounded-2xl px-4 py-4 text-sm font-bold outline-none focus:border-indigo-500/50 appearance-none">
                  {['POV Meme', 'Drake Meme', 'NPC Meme', 'Sigma Meme', 'Chat Meme', 'WhatsApp Meme', 'Twitter Post Style'].map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-1">Language</label>
                <select value={memeLanguage} onChange={e => setMemeLanguage(e.target.value)} className="w-full bg-[#0B1023] border border-white/5 rounded-2xl px-4 py-4 text-sm font-bold outline-none focus:border-indigo-500/50 appearance-none">
                  {['English', 'Hindi', 'Roman Urdu', 'Hinglish', 'Urdu'].map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-1">Humor Level</label>
                  <span className="text-[10px] font-black text-indigo-400">{memeHumorLevel}% - {memeHumorLevel > 75 ? 'Chaotic' : memeHumorLevel > 50 ? 'Crazy' : 'Funny'}</span>
                </div>
                <input type="range" min="0" max="100" value={memeHumorLevel} onChange={e => setMemeHumorLevel(parseInt(e.target.value))} className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
              </div>

              <div className="flex items-center justify-center">
                 <button onClick={() => setShowAdvancedHumor(!showAdvancedHumor)} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-white transition-colors border border-indigo-500/20 px-6 py-4 rounded-2xl w-full justify-center bg-indigo-500/5">
                   <Settings className="w-4 h-4" /> Advanced Humor Controls
                 </button>
              </div>
            </div>

            {/* Advanced Panel */}
            <AnimatePresence>
              {showAdvancedHumor && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-[#0B1023]/50 border border-white/5 rounded-3xl p-8 overflow-hidden">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                     <div className="space-y-2">
                       <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest block">Viral Optimization</label>
                       <button onClick={() => setIsViralMode(!isViralMode)} className={`w-full py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${isViralMode ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-500'}`}>
                         {isViralMode ? 'ON' : 'OFF'}
                       </button>
                     </div>
                     <div className="space-y-2">
                       <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest block">Add Emojis</label>
                       <button onClick={() => setAddEmojis(!addEmojis)} className={`w-full py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${addEmojis ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-500'}`}>
                         {addEmojis ? 'ON' : 'OFF'}
                       </button>
                     </div>
                     <div className="space-y-2">
                       <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest block">Auto Hashtags</label>
                       <button onClick={() => setAddHashtags(!addHashtags)} className={`w-full py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${addHashtags ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-500'}`}>
                         {addHashtags ? 'ON' : 'OFF'}
                       </button>
                     </div>
                     <div className="space-y-2">
                       <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest block">Audience Age</label>
                       <select value={memeAudienceAge} onChange={e => setMemeAudienceAge(e.target.value)} className="w-full bg-slate-900 border border-white/5 rounded-xl px-3 py-2.5 text-[10px] font-black uppercase outline-none">
                         {['All', 'Gen-Z', 'Millennial', 'Boomer'].map(o => <option key={o} value={o}>{o}</option>)}
                       </select>
                     </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Big Generate Button */}
            <div className="flex justify-center pt-6">
              <motion.button 
                whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(79,70,229,0.4)' }}
                whileTap={{ scale: 0.95 }}
                onClick={generateMeme}
                disabled={!memeTopic.trim()}
                className="group relative overflow-hidden bg-gradient-to-r from-indigo-600 to-violet-700 px-12 py-6 rounded-2xl font-black uppercase tracking-[0.3em] text-sm shadow-2xl disabled:opacity-50 transition-all"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.2)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10 flex items-center gap-3">
                   <Sparkles className="w-5 h-5 animate-pulse" /> GENERATE MEME IDEAS
                </div>
              </motion.button>
            </div>

            {/* Results Section */}
            {memeResult && (
              <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pt-10">
                <div className="flex items-center gap-3">
                   <div className="h-[1px] flex-1 bg-white/5" />
                   <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400">AI COMEDY OUTPUT</h3>
                   <div className="h-[1px] flex-1 bg-white/5" />
                </div>

                <div className="grid md:grid-cols-5 gap-8 items-start">
                  <div className="md:col-span-3 space-y-6">
                    <div className="bg-[#0B1023] border border-indigo-500/20 rounded-[2rem] p-10 shadow-2xl relative overflow-hidden group">
                       <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-100 transition-opacity">
                         <Quote className="w-12 h-12 text-indigo-500" />
                       </div>
                       <div className="relative z-10 space-y-6">
                          <div className="flex justify-between items-center">
                            <span className="px-4 py-1.5 bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 rounded-full text-[9px] font-black uppercase tracking-widest">{memeType}</span>
                            <div className="flex items-center gap-2 text-amber-400 font-black text-xs italic">
                               🔥 Viral Score: {memeResult.viralScore}/100
                            </div>
                          </div>
                          
                          <p className="text-2xl md:text-3xl font-bold leading-tight italic text-white/90" dangerouslySetInnerHTML={{ __html: `"${memeResult.joke}"` }} />
                          
                          {memeResult.caption && (
                            <div className="pt-6 border-t border-white/5 space-y-2">
                              <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Recommended Caption</span>
                              <p className="text-slate-400 text-sm leading-relaxed">{memeResult.caption}</p>
                            </div>
                          )}

                          <div className="flex flex-wrap gap-2 pt-4">
                            {memeResult.hashtags?.map((h: string) => (
                              <span key={h} className="text-xs font-bold text-indigo-400 hover:text-indigo-300 cursor-pointer">#{h.replace('#', '')}</span>
                            ))}
                          </div>
                       </div>
                    </div>

                    {/* Result Actions */}
                    <div className="flex flex-wrap gap-3">
                       <button onClick={() => copyToClipboard(memeResult.joke, 'text')} className="flex-1 min-w-[120px] bg-slate-900 hover:bg-slate-800 border border-slate-800 p-4 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all">
                         <Copy className="w-4 h-4" /> {copiedText ? 'Copied' : 'Copy Text'}
                       </button>
                       <button onClick={generateMeme} className="flex-1 min-w-[120px] bg-slate-900 hover:bg-slate-800 border border-slate-800 p-4 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all">
                         <RefreshCcw className="w-4 h-4" /> Regenerate
                       </button>
                       <button onClick={handleTurnIntoImage} className="flex-[2] min-w-[200px] bg-indigo-600 hover:bg-indigo-500 p-4 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20">
                         <ImageIcon className="w-4 h-4" /> Turn Into Meme Image
                       </button>
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-6">
                    {/* Meme Image Preview */}
                    <div className="aspect-square bg-[#0B1023] border border-white/5 rounded-[2rem] overflow-hidden relative shadow-2xl group">
                       {memeImagePreview ? (
                         <>
                           <img src={memeImagePreview} alt="Meme" className="w-full h-full object-cover" />
                           <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button onClick={() => window.open(memeImagePreview, '_blank')} className="bg-white text-black px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-2xl">Download HD</button>
                           </div>
                         </>
                       ) : (
                         <div className="w-full h-full flex flex-col items-center justify-center p-10 text-center space-y-4">
                            <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center border border-white/5">
                               <ImageIcon className="w-8 h-8 text-slate-700" />
                            </div>
                            <div>
                               <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">No Image Yet</p>
                               <p className="text-[9px] text-slate-700">Click 'Turn Into Meme Image' to visualize this joke.</p>
                            </div>
                         </div>
                       )}
                    </div>

                     {/* Trending Sidebar */}
                     <div className="bg-[#0B1023]/40 border border-white/5 rounded-[2rem] p-6 space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2">🔥 Trending Topics</h4>
                        <div className="space-y-2">
                          {['Cricket WC', 'AI Replacement', 'Monday Morning', 'GTA 6 Release', 'Crypto Life'].map(t => (
                            <button key={t} onClick={() => setMemeTopic(t)} className="w-full p-3 bg-slate-900/50 hover:bg-slate-900 border border-white/5 hover:border-indigo-500/30 rounded-xl text-left text-[11px] font-bold text-slate-400 hover:text-white transition-all flex items-center justify-between group">
                              {t} <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                            </button>
                          ))}
                        </div>
                     </div>

                     {/* Meme History */}
                     {creativeHistory.filter(h => h.type === 'meme').length > 0 && (
                       <div className="bg-[#0B1023]/40 border border-white/5 rounded-[2rem] p-6 space-y-4 max-h-[350px] overflow-y-auto no-scrollbar">
                          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2 flex items-center gap-2"><Clock className="w-3 h-3" /> History</h4>
                          <div className="space-y-3">
                            {creativeHistory.filter(h => h.type === 'meme').map((h, i) => (
                              <div key={i} className="p-4 bg-slate-900/50 border border-white/5 rounded-xl cursor-pointer hover:border-indigo-500/50 hover:bg-slate-900 transition-all group" onClick={() => { setMemeTopic(h.topic || ''); setMemeResult(h.result); }}>
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">{h.topic}</span>
                                  <span className="text-[8px] font-bold text-slate-500">{h.date}</span>
                                </div>
                                <p className="text-xs text-slate-300 italic line-clamp-2 group-hover:text-white transition-colors" dangerouslySetInnerHTML={{ __html: `"${h.result.joke}"` }} />
                              </div>
                            ))}
                          </div>
                       </div>
                     )}
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer Branding */}
          <div className="text-center py-10 opacity-20">
             <p className="text-[10px] font-black uppercase tracking-[0.6em]">SmartAI Comedy Engine v9.0</p>
          </div>
        </div>
      );
    }

    function renderIdeaGenerator() {
      const generateIdea = async () => {
        if (!ideaTopic.trim()) return;
        setIsIdeaGenerating(true);
        setIdeaLoadingText('Generating Smart Ideas...');
        
        const loadingSteps = [
          'Connecting Creativity Engine...',
          'Finding Unique Concepts...',
          'Analyzing Market Trends...',
          'Finalizing Blueprint...'
        ];

        let step = 0;
        const interval = setInterval(() => {
          if (step < loadingSteps.length) {
            setIdeaLoadingText(loadingSteps[step]);
            step++;
          }
        }, 1000);

        const isBusiness = ideaType.includes('Business') || ideaType.includes('Startup') || ideaType.includes('Product');
        
        const systemPrompt = `You are a World-Class AI Brainstorming Expert, Business Strategist, and Content Visionary. You MUST return ONLY a valid JSON object. DO NOT include markdown formatting or extra text.
        Format: {
          "title": "...",
          "description": "...",
          "whyViral": "...",
          "monetization": "...",
          "difficulty": "Easy/Medium/Hard",
          "audienceMatch": "...",
          "growthScore": 95,
          "details": ["...", "..."]
        }`;

        let fullPrompt = `Generate a highly unique ${ideaType} about "${ideaTopic}".
        Target Audience: ${ideaAudience}. Platform: ${ideaPlatform}.
        Creativity Level: ${ideaCreativity}% (${ideaCreativity > 80 ? 'Crazy Unique/Futuristic' : ideaCreativity > 50 ? 'Innovative' : 'Practical'}).
        Language: ${ideaLanguage}. (If Hindi/Urdu, MUST use Roman alphabets).
        Advanced Settings: 
        ${ideaTrendingOnly ? '- Focus ONLY on current internet trends.' : ''}
        ${ideaViralOpt ? '- Optimize for maximum virality/shareability.' : ''}
        ${ideaLowBudget ? '- Must be low or zero budget to start.' : ''}
        ${ideaBeginner ? '- Must be beginner friendly.' : ''}
        ${ideaAiPowered ? '- Must utilize AI technology.' : ''}
        ${ideaPassiveIncome ? '- Must focus on passive income potential.' : ''}`;

        if (isBusiness) {
          fullPrompt += `\nInclude in details: Problem, Solution, Revenue Model, Target Market, Marketing Strategy, AI Advantage.`;
        } else {
          fullPrompt += `\nInclude in details: Video Titles/Hooks, Thumbnail Ideas, Viral Captions, Hashtags, Posting Strategy.`;
        }

        try {
          const url = `/api/chat?prompt=${encodeURIComponent(fullPrompt)}&system=${encodeURIComponent(systemPrompt)}&json=true&seed=${Math.floor(Math.random() * 99999)}`;
          const res = await fetch(url);
          if (!res.ok) throw new Error(`Server error: ${res.status}`);
          
          const rawText = await res.text();
          let parsed: any = null;
          const cleanText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
          const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            try { parsed = JSON.parse(jsonMatch[0]); } catch {}
          }

          if (!parsed || !parsed.title) {
            parsed = {
              title: `${ideaType} for ${ideaTopic}`,
              description: cleanText || "Error generating detailed idea. Please try again.",
              whyViral: "Highly relevant to current trends.",
              monetization: "Ads, Sponsorships, Products",
              difficulty: "Medium",
              audienceMatch: ideaAudience,
              growthScore: 85,
              details: ["Focus on quality content", "Engage with community"]
            };
          }

          setIdeaResult(parsed);
          setCreativeHistory(prev => [{ type: 'idea', topic: ideaTopic, result: parsed, date: new Date().toLocaleTimeString() }, ...prev]);
        } catch (e) {
          console.error(e);
          setIdeaResult({
            title: "Network Error",
            description: "Failed to connect to the creativity engine. Please try again later.",
            whyViral: "N/A", monetization: "N/A", difficulty: "Hard", audienceMatch: "N/A", growthScore: 0, details: []
          });
        } finally {
          clearInterval(interval);
          setIsIdeaGenerating(false);
        }
      };

      const handleExpandIdea = async () => {
        if (!ideaResult) return;
        setIsIdeaGenerating(true);
        setIdeaLoadingText('Generating Full Blueprint...');
        try {
          const systemPrompt = "You are an elite business and content strategist. Return valid JSON only. Format: { \"roadmap\": [\"Phase 1: ...\", \"Phase 2: ...\"], \"marketing\": [\"...\"], \"monetization\": [\"...\"] }";
          const fullPrompt = `Create a detailed expansion roadmap for this idea: Title: ${ideaResult.title}. Description: ${ideaResult.description}.`;
          const url = `/api/chat?prompt=${encodeURIComponent(fullPrompt)}&system=${encodeURIComponent(systemPrompt)}&json=true`;
          const res = await fetch(url);
          if (res.ok) {
            const rawText = await res.text();
            let parsed = null;
            const cleanText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
            const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
            if (jsonMatch) { try { parsed = JSON.parse(jsonMatch[0]); } catch {} }
            if (parsed) setExpandedIdeaContent(parsed);
          }
        } catch (e) { console.error(e); }
        finally { setIsIdeaGenerating(false); }
      };

      return (
        <div className="min-h-full bg-[#050816] text-white overflow-y-auto no-scrollbar pb-20 relative">
          <AnimatePresence>
            {isIdeaGenerating && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-[#050816]/90 backdrop-blur-3xl flex flex-col items-center justify-center p-10">
                <div className="relative">
                   <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 3, ease: "linear" }} className="w-40 h-40 border-4 border-purple-500/20 border-t-purple-500 rounded-full" />
                   <motion.div animate={{ rotate: -360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="absolute inset-4 border-4 border-emerald-500/20 border-b-emerald-500 rounded-full" />
                   <div className="absolute inset-0 flex items-center justify-center">
                      <Lightbulb className="w-12 h-12 text-purple-400 animate-pulse" />
                   </div>
                </div>
                <motion.p key={ideaLoadingText} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 text-xl font-black italic uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-emerald-400">{ideaLoadingText}</motion.p>
                <div className="mt-6 flex gap-4">
                   {[...Array(5)].map((_, i) => (
                      <motion.div key={i} animate={{ y: [0, -15, 0], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }} className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_#00FFB2]" />
                   ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Top Section */}
          <div className="p-6 md:p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5 bg-[#0B1023]/30 backdrop-blur-xl sticky top-0 z-40">
            <div className="md:ml-8">
              <div className="flex items-center gap-3 mb-1">
                <button onClick={() => setCreativeSubTab('')} className="p-2.5 mr-2 bg-slate-900/50 hover:bg-purple-500/20 border border-white/5 hover:border-purple-500/50 rounded-xl text-slate-400 hover:text-purple-400 transition-all group"><ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /></button>
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(123,97,255,0.3)]">
                  <Lightbulb className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter">Idea <span className="text-purple-400">Generator</span></h1>
              </div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2">Generate powerful content, business, startup & creative ideas instantly.</p>
            </div>
            <div className="flex gap-2 w-full md:w-auto mt-4 md:mt-0">
               <button onClick={generateIdea} className="flex-1 md:flex-none bg-purple-600 hover:bg-purple-500 text-white px-6 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all shadow-xl shadow-purple-600/20">Generate</button>
               <button onClick={() => setShowHistorySidebar(true)} className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl hover:text-purple-400 transition-colors" title="History"><Clock className="w-4 h-4" /></button>
               <button className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl hover:text-purple-400 transition-colors"><Save className="w-4 h-4" /></button>
               <button className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl hover:text-purple-400 transition-colors"><Download className="w-4 h-4" /></button>
            </div>
          </div>

          <div className="max-w-[1600px] mx-auto p-6 md:p-10 grid xl:grid-cols-3 gap-10">
            {/* Left Column: Inputs */}
            <div className="xl:col-span-2 space-y-10">
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="md:col-span-2 space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-1">Main Topic / Niche</label>
                  <div className="relative group">
                    <input 
                      value={ideaTopic} 
                      onChange={e => setIdeaTopic(e.target.value)} 
                      placeholder="Try: Fitness, AI, Gaming, Finance, EdTech..." 
                      className="w-full bg-[#0B1023] border border-white/5 rounded-2xl px-5 py-4 sm:px-6 sm:py-5 text-sm sm:text-lg font-bold outline-none focus:border-purple-500/50 transition-all placeholder:text-slate-700 shadow-2xl"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:flex gap-2">
                      {['AI', 'Finance', 'Gaming'].map(t => (
                        <button key={t} onClick={() => setIdeaTopic(t)} className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-[9px] font-bold text-slate-500 transition-colors border border-white/5">{t}</button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-1">Idea Type</label>
                  <select value={ideaType} onChange={e => setIdeaType(e.target.value)} className="w-full bg-[#0B1023] border border-white/5 rounded-2xl px-4 py-4 text-sm font-bold outline-none focus:border-purple-500/50 appearance-none text-slate-200">
                    {['Business Idea', 'Startup Idea', 'YouTube Video Idea', 'Instagram Content Idea', 'TikTok Idea', 'App Idea', 'AI Tool Idea', 'Side Hustle', 'Blog Topic', 'Product Idea', 'Gaming Channel Idea', 'Course Idea', 'Brand Name Idea', 'Story Idea', 'Reel Idea'].map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-1">Target Audience</label>
                  <select value={ideaAudience} onChange={e => setIdeaAudience(e.target.value)} className="w-full bg-[#0B1023] border border-white/5 rounded-2xl px-4 py-4 text-sm font-bold outline-none focus:border-purple-500/50 appearance-none text-slate-200">
                    {['General Public', 'Kids', 'Teenagers', 'Students', 'Gamers', 'Professionals', 'Business Owners', 'Creators', 'Developers'].map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-1">Platform Focus</label>
                  <select value={ideaPlatform} onChange={e => setIdeaPlatform(e.target.value)} className="w-full bg-[#0B1023] border border-white/5 rounded-2xl px-4 py-4 text-sm font-bold outline-none focus:border-purple-500/50 appearance-none text-slate-200">
                    {['YouTube', 'Instagram', 'TikTok', 'Facebook', 'Blog', 'Mobile App', 'Website', 'Startup', 'Online Business'].map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-1">Language</label>
                  <select value={ideaLanguage} onChange={e => setIdeaLanguage(e.target.value)} className="w-full bg-[#0B1023] border border-white/5 rounded-2xl px-4 py-4 text-sm font-bold outline-none focus:border-purple-500/50 appearance-none text-slate-200">
                    {['English', 'Hindi', 'Roman Urdu', 'Hinglish', 'Urdu'].map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>

                <div className="md:col-span-2 space-y-3">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-1">Creativity Level</label>
                    <span className="text-[10px] font-black text-purple-400">{ideaCreativity}% - {ideaCreativity > 80 ? 'Crazy Unique' : ideaCreativity > 60 ? 'Innovative' : ideaCreativity > 40 ? 'Creative' : ideaCreativity > 20 ? 'Smart' : 'Simple'}</span>
                  </div>
                  <input type="range" min="0" max="100" value={ideaCreativity} onChange={e => setIdeaCreativity(parseInt(e.target.value))} className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-purple-500" />
                </div>
              </div>

              <div className="flex items-center justify-center">
                 <button onClick={() => setShowAdvancedIdea(!showAdvancedIdea)} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-purple-400 hover:text-white transition-colors border border-purple-500/20 px-6 py-4 rounded-2xl w-full justify-center bg-purple-500/5">
                   <Settings className="w-4 h-4" /> Advanced Idea Controls
                 </button>
              </div>

              <AnimatePresence>
                {showAdvancedIdea && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-[#0B1023]/50 border border-white/5 rounded-3xl p-8 overflow-hidden">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      {[
                        { state: ideaTrendingOnly, setter: setIdeaTrendingOnly, label: 'Trending Only' },
                        { state: ideaViralOpt, setter: setIdeaViralOpt, label: 'Viral Optimize' },
                        { state: ideaLowBudget, setter: setIdeaLowBudget, label: 'Low Budget' },
                        { state: ideaBeginner, setter: setIdeaBeginner, label: 'Beginner Friendly' },
                        { state: ideaAiPowered, setter: setIdeaAiPowered, label: 'AI Powered' },
                        { state: ideaPassiveIncome, setter: setIdeaPassiveIncome, label: 'Passive Income' },
                        { state: ideaMonetization, setter: setIdeaMonetization, label: 'Monetization' },
                      ].map((opt, i) => (
                         <div key={i} className="space-y-2">
                           <label className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block">{opt.label}</label>
                           <button onClick={() => opt.setter(!opt.state)} className={`w-full py-2.5 rounded-xl text-[9px] font-black uppercase transition-all ${opt.state ? 'bg-purple-600 text-white' : 'bg-slate-900 text-slate-500'}`}>
                             {opt.state ? 'ON' : 'OFF'}
                           </button>
                         </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex justify-center pt-6">
                <motion.button 
                  whileHover={{ scale: 1.02, boxShadow: '0 0 40px rgba(123,97,255,0.4)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={generateIdea}
                  disabled={!ideaTopic.trim()}
                  className="group relative overflow-hidden bg-gradient-to-r from-purple-600 to-emerald-600 px-12 py-6 rounded-2xl font-black uppercase tracking-[0.3em] text-sm shadow-2xl disabled:opacity-50 transition-all w-full md:w-auto"
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.2)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10 flex items-center justify-center gap-3">
                     <Lightbulb className="w-5 h-5 animate-pulse" /> GENERATE IDEAS
                  </div>
                </motion.button>
              </div>

              {ideaResult && (
                <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pt-10">
                  <div className="bg-[#0B1023] border border-purple-500/20 rounded-[2rem] p-8 md:p-10 shadow-[0_0_50px_rgba(123,97,255,0.1)] relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-[100px] rounded-full pointer-events-none" />
                     <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />
                     
                     <div className="relative z-10 space-y-8">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                          <div>
                            <span className="px-4 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[9px] font-black uppercase tracking-widest">{ideaResult.audienceMatch}</span>
                            <h2 className="text-3xl md:text-4xl font-black mt-6 mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 leading-tight">{ideaResult.title}</h2>
                          </div>
                          <div className="md:text-right flex items-center md:flex-col gap-3 md:gap-0">
                             <div className="flex items-center gap-2 text-purple-400 font-black text-2xl bg-purple-500/10 px-4 py-2 rounded-xl border border-purple-500/20">
                                🔥 {ideaResult.growthScore}<span className="text-sm opacity-50">/100</span>
                             </div>
                             <p className="text-[9px] uppercase tracking-widest text-slate-500 mt-2">Viral Potential</p>
                          </div>
                        </div>
                        
                        <p className="text-lg text-slate-300 leading-relaxed font-medium bg-slate-900/50 p-6 rounded-2xl border border-white/5">{ideaResult.description}</p>
                        
                        <div className="grid md:grid-cols-3 gap-4 pt-6 border-t border-white/5">
                          <div className="bg-slate-900/80 p-5 rounded-2xl border border-emerald-500/10 shadow-[inset_0_0_20px_rgba(16,185,129,0.02)]">
                             <p className="text-[9px] font-black uppercase tracking-widest text-emerald-400 mb-3 flex items-center gap-2"><Sparkles className="w-3 h-3"/> Why It Works</p>
                             <p className="text-xs text-slate-300 font-medium leading-relaxed">{ideaResult.whyViral}</p>
                          </div>
                          <div className="bg-slate-900/80 p-5 rounded-2xl border border-amber-500/10 shadow-[inset_0_0_20px_rgba(245,158,11,0.02)]">
                             <p className="text-[9px] font-black uppercase tracking-widest text-amber-400 mb-3 flex items-center gap-2"><CreditCard className="w-3 h-3"/> Monetization</p>
                             <p className="text-xs text-slate-300 font-medium leading-relaxed">{ideaResult.monetization}</p>
                          </div>
                          <div className="bg-slate-900/80 p-5 rounded-2xl border border-blue-500/10 shadow-[inset_0_0_20px_rgba(59,130,246,0.02)]">
                             <p className="text-[9px] font-black uppercase tracking-widest text-blue-400 mb-3 flex items-center gap-2"><Zap className="w-3 h-3"/> Difficulty</p>
                             <p className="text-xs text-slate-300 font-medium leading-relaxed">{ideaResult.difficulty}</p>
                          </div>
                        </div>

                        <div className="space-y-4 bg-white/[0.01] p-6 rounded-2xl border border-white/5">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Actionable Execution Details</p>
                          <div className="grid sm:grid-cols-2 gap-4">
                            {ideaResult.details?.map((d: string, i: number) => (
                              <div key={i} className="flex items-start gap-3">
                                <Check className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                                <p className="text-xs text-slate-300 leading-relaxed font-medium">{d}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {expandedIdeaContent && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-6 border-t border-white/5 space-y-6">
                            {expandedIdeaContent.roadmap && Array.isArray(expandedIdeaContent.roadmap) && (
                              <div className="bg-emerald-950/20 p-6 rounded-2xl border border-emerald-500/10">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 mb-4 flex items-center gap-2"><Layout className="w-4 h-4" /> Expansion Roadmap</p>
                                <ul className="space-y-3">
                                  {expandedIdeaContent.roadmap.map((item: string, i: number) => (
                                    <li key={i} className="text-xs text-slate-300 flex items-start gap-3 bg-emerald-900/10 p-3 rounded-lg"><span className="text-emerald-500 font-black">{i+1}.</span> {item}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {expandedIdeaContent.marketing && Array.isArray(expandedIdeaContent.marketing) && (
                              <div className="bg-purple-950/20 p-6 rounded-2xl border border-purple-500/10">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400 mb-4 flex items-center gap-2"><Share2 className="w-4 h-4" /> Marketing Strategy</p>
                                <ul className="space-y-3">
                                  {expandedIdeaContent.marketing.map((item: string, i: number) => (
                                    <li key={i} className="text-xs text-slate-300 flex items-start gap-3 bg-purple-900/10 p-3 rounded-lg"><span className="text-purple-500 font-black">•</span> {item}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </motion.div>
                        )}

                        <div className="flex flex-wrap gap-3 pt-6 border-t border-white/5">
                           <button onClick={() => copyToClipboard(JSON.stringify(ideaResult, null, 2), 'text')} className="flex-1 min-w-[120px] bg-slate-900 hover:bg-slate-800 border border-slate-800 py-4 px-4 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all">
                             <Copy className="w-4 h-4" /> Copy
                           </button>
                           {!expandedIdeaContent && (
                             <button onClick={handleExpandIdea} className="flex-[2] min-w-[200px] bg-purple-600 hover:bg-purple-500 py-4 px-4 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-purple-600/20">
                               <Layout className="w-4 h-4" /> Expand Full Blueprint
                             </button>
                           )}
                        </div>
                     </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Right Column: Trending */}
            <div className="space-y-6">
              <div className="bg-[#0B1023]/40 border border-white/5 rounded-[2rem] p-6 space-y-4 sticky top-32">
                 <div className="flex justify-between items-center mb-2">
                   <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">📈 Trending Ideas</h4>
                   {isTrendingLoading && <RefreshCcw className="w-3 h-3 text-purple-400 animate-spin" />}
                 </div>
                 <div className="space-y-2">
                   {(dynamicTrending.length > 0 ? dynamicTrending : ['AI SaaS Platform', 'Faceless YouTube', 'Crypto Trading Bot', 'Online Course', 'Personal Branding', 'Fitness App', 'Automation Agency']).map(t => (
                     <button key={t} onClick={() => setIdeaTopic(t)} className="w-full p-4 bg-slate-900/50 hover:bg-slate-900 border border-white/5 hover:border-purple-500/30 rounded-2xl text-left text-[11px] font-bold text-slate-300 hover:text-white transition-all flex items-center justify-between group">
                       {t} <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 text-purple-400" />
                     </button>
                   ))}
                 </div>
                 <p className="text-[8px] text-slate-600 font-bold uppercase tracking-widest text-center pt-2 italic">Updated Daily by AI</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    function renderCharacterCreator() {
      const generateCharacter = async () => {
        setIsCharGenerating(true);
        setCharLoadingText('Building AI Character...');
        
        const loadingSteps = [
          'Generating Personality Matrix...',
          'Creating Digital Identity...',
          'Writing Backstory...',
          'Finalizing Character Core...'
        ];

        let step = 0;
        const interval = setInterval(() => {
          if (step < loadingSteps.length) {
            setCharLoadingText(loadingSteps[step]);
            step++;
          }
        }, 1000);

        const systemPrompt = `You are an elite Character Designer and World Builder AI. You MUST return ONLY a valid JSON object. DO NOT include markdown formatting or extra text.
        Format: {
          "name": "...",
          "personality": "...",
          "appearance": "...",
          "abilities": ["...", "..."],
          "backstory": "...",
          "catchphrase": "...",
          "stats": {"power": 85, "intelligence": 90, "speed": 75, "charisma": 80, "dangerLevel": 88},
          "weaknesses": ["...", "..."]
        }`;

        const fullPrompt = `Create an epic, original ${charType}.
        Name: ${charName || 'Generate a cool, unique name'}.
        Gender: ${charGender}. Personality: ${charPersonality}.
        Visual Style: ${charStyle}. 
        Powers/Abilities: ${charPowers || 'Generate unique abilities matching the type'}.
        Backstory Theme: ${charBackstory}.
        Advanced: ${charWeaknesses ? 'Include specific weaknesses.' : ''} ${charCatchphrase ? 'Include a memorable catchphrase.' : ''}`;

        try {
          const url = `/api/chat?prompt=${encodeURIComponent(fullPrompt)}&system=${encodeURIComponent(systemPrompt)}&json=true&seed=${Math.floor(Math.random() * 99999)}`;
          const res = await fetch(url);
          if (!res.ok) throw new Error(`Server error: ${res.status}`);
          
          const rawText = await res.text();
          let parsed: any = null;
          const cleanText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
          const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            try { parsed = JSON.parse(jsonMatch[0]); } catch {}
          }

          if (!parsed || !parsed.name) {
            parsed = {
              name: charName || "ShadowX",
              personality: charPersonality,
              appearance: "Dark clothing with neon accents.",
              abilities: ["Stealth", "Agility"],
              backstory: "Generated from the void.",
              catchphrase: "I am the shadow.",
              stats: {power: 80, intelligence: 80, speed: 80, charisma: 80, dangerLevel: 80},
              weaknesses: ["Light"]
            };
          }

          setCharResult(parsed);
          setCharImagePreview(null);
          setCharDialogue(null);
          setCharStoryExpansion(null);
          setCreativeHistory(prev => [{ type: 'character', topic: parsed.name, result: parsed, date: new Date().toLocaleTimeString() }, ...prev]);
        } catch (e) {
          console.error(e);
        } finally {
          clearInterval(interval);
          setIsCharGenerating(false);
        }
      };

      const handleCharImage = async () => {
        if (!charResult) return;
        setIsCharGenerating(true);
        setCharLoadingText('Visualizing Character Appearance...');
        try {
          const prompt = `A breathtaking, cinematic masterpiece portrait of a ${charType} named ${charResult.name}. Style: ${charStyle}. Gender: ${charGender}. Appearance: ${charResult.appearance}. Extremely detailed, 8k resolution, dramatic lighting. CRITICAL: NO TEXT, NO WATERMARKS.`;
          const res = await fetch(`/api/image?prompt=${encodeURIComponent(prompt)}&width=1024&height=1024`);
          if (res.ok) {
            const blob = await res.blob();
            setCharImagePreview(URL.createObjectURL(blob));
          }
        } catch (e) { console.error(e); }
        finally { setIsCharGenerating(false); }
      };

      const handleGenerateDialogue = async () => {
        if (!charResult) return;
        setIsCharGenerating(true);
        setCharLoadingText('Simulating Dialogue...');
        try {
          const systemPrompt = "Return valid JSON only. Format: { \"dialogues\": [\"...\", \"...\"] }";
          const fullPrompt = `Generate 4 highly emotional, cinematic, and in-character quotes/dialogues for this character: ${charResult.name}, who is a ${charPersonality} ${charType} with this backstory: ${charResult.backstory}.`;
          const url = `/api/chat?prompt=${encodeURIComponent(fullPrompt)}&system=${encodeURIComponent(systemPrompt)}&json=true`;
          const res = await fetch(url);
          if (res.ok) {
            const rawText = await res.text();
            let parsed = null;
            const cleanText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
            const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
            if (jsonMatch) { try { parsed = JSON.parse(jsonMatch[0]); } catch {} }
            if (parsed) setCharDialogue(parsed.dialogues);
          }
        } catch (e) { console.error(e); }
        finally { setIsCharGenerating(false); }
      };

      const handleExpandStory = async () => {
        if (!charResult) return;
        setIsCharGenerating(true);
        setCharLoadingText('Building Universe & Lore...');
        try {
          const systemPrompt = "Return valid JSON only. Format: { \"world\": \"...\", \"enemies\": [\"...\"], \"allies\": [\"...\"], \"currentMission\": \"...\" }";
          const fullPrompt = `Expand the universe for ${charResult.name}, a ${charType} with backstory: ${charResult.backstory}.`;
          const url = `/api/chat?prompt=${encodeURIComponent(fullPrompt)}&system=${encodeURIComponent(systemPrompt)}&json=true`;
          const res = await fetch(url);
          if (res.ok) {
            const rawText = await res.text();
            let parsed = null;
            const cleanText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
            const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
            if (jsonMatch) { try { parsed = JSON.parse(jsonMatch[0]); } catch {} }
            if (parsed) setCharStoryExpansion(parsed);
          }
        } catch (e) { console.error(e); }
        finally { setIsCharGenerating(false); }
      };

      return (
        <div className="min-h-full bg-[#050816] text-white overflow-y-auto no-scrollbar pb-20 relative">
          <AnimatePresence>
            {isCharGenerating && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-[#050816]/95 backdrop-blur-3xl flex flex-col items-center justify-center p-10">
                <div className="relative">
                   <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 4, ease: "linear" }} className="w-48 h-48 border-[1px] border-cyan-500/30 border-t-cyan-400 rounded-full" />
                   <motion.div animate={{ rotate: -360 }} transition={{ repeat: Infinity, duration: 3, ease: "linear" }} className="absolute inset-4 border-2 border-purple-500/20 border-b-purple-500 rounded-full" />
                   <div className="absolute inset-0 flex items-center justify-center">
                      <User className="w-16 h-16 text-cyan-400 animate-pulse drop-shadow-[0_0_20px_rgba(34,211,238,0.8)]" />
                   </div>
                </div>
                <motion.p key={charLoadingText} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mt-10 text-xl font-black italic uppercase tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">{charLoadingText}</motion.p>
                <div className="mt-8 flex gap-3">
                   {[...Array(7)].map((_, i) => (
                      <motion.div key={i} animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.15 }} className="w-1.5 h-1.5 bg-cyan-400 shadow-[0_0_10px_#22d3ee] rotate-45" />
                   ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Top Section */}
          <div className="p-6 md:p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-cyan-500/10 bg-[#0B1023]/60 backdrop-blur-2xl sticky top-0 z-40">
            <div className="md:ml-8">
              <div className="flex items-center gap-4 mb-2">
                <button onClick={() => setCreativeSubTab('')} className="p-3 mr-2 bg-[#0B1023]/80 hover:bg-cyan-500/10 border border-cyan-500/20 hover:border-cyan-400/50 rounded-2xl text-cyan-500/60 hover:text-cyan-400 transition-all group"><ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" /></button>
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(34,211,238,0.2)] border border-cyan-500/20">
                  <User className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-cyan-100">AI Character <span className="text-cyan-400">Creator</span></h1>
              </div>
              <p className="text-cyan-500/60 text-xs font-black uppercase tracking-[0.2em] mt-1 ml-16">Create unique AI personalities & digital identities.</p>
            </div>
            <div className="flex gap-3 w-full md:w-auto mt-4 md:mt-0">
               <button onClick={generateCharacter} className="flex-1 md:flex-none bg-cyan-500 hover:bg-cyan-400 text-black px-8 py-3 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)]">Generate</button>
               <button onClick={() => setShowHistorySidebar(true)} className="p-3 bg-slate-900 border border-slate-800 rounded-xl hover:border-cyan-500/50 hover:text-cyan-400 transition-colors" title="History"><Clock className="w-4 h-4" /></button>
               <button className="p-3 bg-slate-900 border border-slate-800 rounded-xl hover:border-cyan-500/50 hover:text-cyan-400 transition-colors"><Save className="w-4 h-4" /></button>
               <button className="p-3 bg-slate-900 border border-slate-800 rounded-xl hover:border-cyan-500/50 hover:text-cyan-400 transition-colors"><Download className="w-4 h-4" /></button>
            </div>
          </div>

          <div className="max-w-[1600px] mx-auto p-6 md:p-10 grid xl:grid-cols-3 gap-10">
            {/* Left Column: Inputs */}
            <div className="xl:col-span-2 space-y-8">
              
              <div className="grid md:grid-cols-2 gap-6 bg-[#0B1023] p-8 rounded-[2rem] border border-cyan-500/10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none" />
                
                <div className="space-y-3">
                  <label className="text-[9px] font-black uppercase tracking-[0.3em] text-cyan-500/70 ml-1">Character Type</label>
                  <select value={charType} onChange={e => setCharType(e.target.value)} className="w-full bg-slate-950/50 border border-white/5 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:border-cyan-500/50 appearance-none text-slate-200">
                    {['Anime Character', 'Game Character', 'Superhero', 'Villain', 'Sci-Fi Character', 'Fantasy Character', 'AI Robot', 'Influencer Persona', 'YouTuber Character', 'Cartoon Character', 'Virtual Partner', 'Story Character', 'Cyberpunk Character', 'Horror Character', 'Warrior', 'Detective'].map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-[9px] font-black uppercase tracking-[0.3em] text-cyan-500/70 ml-1">Character Name (Optional)</label>
                  <input value={charName} onChange={e => setCharName(e.target.value)} placeholder="e.g. ShadowX, Zara, Nova..." className="w-full bg-slate-950/50 border border-white/5 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:border-cyan-500/50 transition-all placeholder:text-slate-700" />
                </div>

                <div className="space-y-3">
                  <label className="text-[9px] font-black uppercase tracking-[0.3em] text-cyan-500/70 ml-1">Gender</label>
                  <select value={charGender} onChange={e => setCharGender(e.target.value)} className="w-full bg-slate-950/50 border border-white/5 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:border-cyan-500/50 appearance-none text-slate-200">
                    {['Male', 'Female', 'Non-Binary', 'Random'].map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-[9px] font-black uppercase tracking-[0.3em] text-cyan-500/70 ml-1">Personality Matrix</label>
                  <select value={charPersonality} onChange={e => setCharPersonality(e.target.value)} className="w-full bg-slate-950/50 border border-white/5 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:border-cyan-500/50 appearance-none text-slate-200">
                    {['Funny', 'Cold', 'Smart', 'Evil', 'Friendly', 'Romantic', 'Mysterious', 'Aggressive', 'Loyal', 'Chaotic', 'Confident', 'Genius', 'Calm'].map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-[9px] font-black uppercase tracking-[0.3em] text-cyan-500/70 ml-1">Visual Style</label>
                  <select value={charStyle} onChange={e => setCharStyle(e.target.value)} className="w-full bg-slate-950/50 border border-white/5 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:border-cyan-500/50 appearance-none text-slate-200">
                    {['Realistic', 'Anime', 'Cartoon', 'Cyberpunk', 'Futuristic', 'Pixar Style', 'Dark Fantasy', 'Neon Style', 'Medieval', 'Sci-Fi'].map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-[9px] font-black uppercase tracking-[0.3em] text-cyan-500/70 ml-1">Backstory Theme</label>
                  <select value={charBackstory} onChange={e => setCharBackstory(e.target.value)} className="w-full bg-slate-950/50 border border-white/5 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:border-cyan-500/50 appearance-none text-slate-200">
                    {['Hero Journey', 'Tragic Past', 'Revenge Story', 'Lost Memory', 'AI Experiment', 'Alien Origin', 'Secret Agent', 'Kingdom Warrior', 'Hacker Legend'].map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>

                <div className="md:col-span-2 space-y-3">
                  <label className="text-[9px] font-black uppercase tracking-[0.3em] text-cyan-500/70 ml-1">Powers & Abilities (Optional)</label>
                  <input value={charPowers} onChange={e => setCharPowers(e.target.value)} placeholder="e.g. Time control, Hacking, Super speed..." className="w-full bg-slate-950/50 border border-white/5 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:border-cyan-500/50 transition-all placeholder:text-slate-700" />
                </div>
              </div>

              <div className="flex items-center justify-center">
                 <button onClick={() => setCharShowAdvanced(!charShowAdvanced)} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400 hover:text-white transition-colors border border-cyan-500/20 px-8 py-4 rounded-2xl w-full justify-center bg-cyan-500/5 shadow-[0_0_20px_rgba(34,211,238,0.05)]">
                   <Settings className="w-4 h-4" /> Advanced Character Controls
                 </button>
              </div>

              <AnimatePresence>
                {charShowAdvanced && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-[#0B1023] border border-cyan-500/10 rounded-[2rem] p-8 overflow-hidden">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      {[
                        { state: charVoice, setter: setCharVoice, label: 'Voice Style' },
                        { state: charWeaknesses, setter: setCharWeaknesses, label: 'Weaknesses' },
                        { state: charCatchphrase, setter: setCharCatchphrase, label: 'Catchphrase' },
                        { state: charRelationships, setter: setCharRelationships, label: 'Relationships' },
                        { state: charRival, setter: setCharRival, label: 'Rival Character' },
                        { state: charSecretAbility, setter: setCharSecretAbility, label: 'Secret Ability' },
                        { state: charStats, setter: setCharStats, label: 'Character Stats' },
                        { state: charEmotionalDepth, setter: setCharEmotionalDepth, label: 'Emotional Depth' },
                      ].map((opt, i) => (
                         <div key={i} className="space-y-2">
                           <label className="text-[8px] font-bold text-slate-500 uppercase tracking-[0.2em] block ml-1">{opt.label}</label>
                           <button onClick={() => opt.setter(!opt.state)} className={`w-full py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${opt.state ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(34,211,238,0.2)]' : 'bg-slate-900 text-slate-500 border border-white/5'}`}>
                             {opt.state ? 'ACTIVE' : 'OFF'}
                           </button>
                         </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex justify-center pt-4">
                <motion.button 
                  whileHover={{ scale: 1.02, boxShadow: '0 0 40px rgba(34,211,238,0.4)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={generateCharacter}
                  className="group relative overflow-hidden bg-gradient-to-r from-cyan-500 to-purple-600 px-16 py-6 rounded-2xl font-black uppercase tracking-[0.3em] text-sm shadow-[0_0_30px_rgba(34,211,238,0.2)] transition-all w-full md:w-auto"
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.3)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10 flex items-center justify-center gap-4 text-white">
                     <User className="w-5 h-5 animate-pulse" /> GENERATE CHARACTER
                  </div>
                </motion.button>
              </div>

              {charResult && (
                <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pt-8">
                  <div className="bg-[#0B1023] border border-cyan-500/20 rounded-[2rem] p-8 md:p-10 shadow-[0_0_50px_rgba(34,211,238,0.1)] relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 blur-[150px] rounded-full pointer-events-none" />
                     <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 blur-[150px] rounded-full pointer-events-none" />
                     
                     <div className="relative z-10 space-y-8">
                        <div className="flex flex-col md:flex-row gap-10">
                           {/* Left side: Preview/Image */}
                           <div className="w-full md:w-1/3 flex flex-col gap-4">
                              <div className="aspect-[3/4] bg-slate-950 rounded-3xl border border-cyan-500/20 shadow-[0_0_30px_rgba(34,211,238,0.1)] relative overflow-hidden group">
                                 {charImagePreview ? (
                                   <img src={charImagePreview} alt="Character" className="w-full h-full object-cover" />
                                 ) : (
                                   <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                                      <User className="w-16 h-16 text-cyan-500/20 mb-4" />
                                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-500/50">Awaiting Visual Rendering</p>
                                   </div>
                                 )}
                                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                                    {charImagePreview && <button onClick={() => window.open(charImagePreview, '_blank')} className="w-full py-3 bg-cyan-500 text-black text-[10px] font-black uppercase tracking-widest rounded-xl">Download Image</button>}
                                 </div>
                              </div>
                              <button onClick={handleCharImage} className="w-full py-4 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-[0_0_15px_rgba(34,211,238,0.1)] flex items-center justify-center gap-2">
                                <ImageIcon className="w-4 h-4" /> Generate Image
                              </button>
                           </div>

                           {/* Right side: Details */}
                           <div className="w-full md:w-2/3 space-y-6">
                              <div>
                                <div className="flex items-center gap-3 mb-2">
                                  <span className="px-3 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-full text-[9px] font-black uppercase tracking-[0.2em]">{charType}</span>
                                  <span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full text-[9px] font-black uppercase tracking-[0.2em]">{charPersonality}</span>
                                </div>
                                <h2 className="text-4xl md:text-5xl font-black mt-2 mb-1 text-transparent bg-clip-text bg-gradient-to-r from-white to-cyan-200 tracking-tight">{charResult.name}</h2>
                                {charResult.catchphrase && <p className="text-lg text-cyan-400 font-medium italic">"{charResult.catchphrase}"</p>}
                              </div>

                              <div className="bg-slate-900/60 p-5 rounded-2xl border border-white/5">
                                 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Backstory</p>
                                 <p className="text-sm text-slate-300 leading-relaxed font-medium">{charResult.backstory}</p>
                              </div>

                              <div className="grid sm:grid-cols-2 gap-4">
                                <div className="bg-slate-900/60 p-4 rounded-2xl border border-white/5">
                                   <p className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-400 mb-2">Powers & Abilities</p>
                                   <ul className="space-y-1">
                                     {charResult.abilities?.map((a: string, i: number) => (
                                       <li key={i} className="text-[11px] text-slate-300 flex items-center gap-2"><div className="w-1 h-1 bg-emerald-400 rounded-full"/> {a}</li>
                                     ))}
                                   </ul>
                                </div>
                                {charResult.weaknesses && (
                                  <div className="bg-slate-900/60 p-4 rounded-2xl border border-white/5">
                                     <p className="text-[9px] font-black uppercase tracking-[0.2em] text-red-400 mb-2">Weaknesses</p>
                                     <ul className="space-y-1">
                                       {charResult.weaknesses?.map((w: string, i: number) => (
                                         <li key={i} className="text-[11px] text-slate-300 flex items-center gap-2"><div className="w-1 h-1 bg-red-400 rounded-full"/> {w}</li>
                                       ))}
                                     </ul>
                                  </div>
                                )}
                              </div>

                              {charResult.stats && (
                                <div className="bg-slate-900/60 p-5 rounded-2xl border border-white/5 space-y-4">
                                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Combat & Trait Stats</p>
                                   <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                                     {Object.entries(charResult.stats).map(([stat, val]: any) => (
                                       <div key={stat}>
                                         <div className="flex justify-between text-[9px] font-black uppercase tracking-widest mb-1">
                                           <span className="text-slate-400">{stat}</span>
                                           <span className="text-cyan-400">{val}/100</span>
                                         </div>
                                         <div className="w-full h-1 bg-slate-950 rounded-full overflow-hidden">
                                           <div className="h-full bg-gradient-to-r from-cyan-500 to-purple-500" style={{ width: `${val}%` }} />
                                         </div>
                                       </div>
                                     ))}
                                   </div>
                                </div>
                              )}
                           </div>
                        </div>

                        {/* Extended Features */}
                        <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-white/5">
                           <div className="space-y-4">
                             <button onClick={handleGenerateDialogue} className="w-full py-4 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all flex items-center justify-center gap-2">
                               <MessageSquare className="w-4 h-4" /> Generate Dialogue
                             </button>
                             {charDialogue && (
                               <div className="bg-purple-950/20 p-5 rounded-2xl border border-purple-500/20 space-y-3">
                                 <p className="text-[9px] font-black uppercase tracking-[0.2em] text-purple-400 mb-2">Simulated Dialogue</p>
                                 {charDialogue.map((d, i) => (
                                   <div key={i} className="bg-purple-900/10 p-3 rounded-xl border border-purple-500/10 text-xs text-slate-300 font-medium italic">"{d}"</div>
                                 ))}
                               </div>
                             )}
                           </div>

                           <div className="space-y-4">
                             <button onClick={handleExpandStory} className="w-full py-4 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all flex items-center justify-center gap-2">
                               <Globe className="w-4 h-4" /> Expand Universe Lore
                             </button>
                             {charStoryExpansion && (
                               <div className="bg-emerald-950/20 p-5 rounded-2xl border border-emerald-500/20 space-y-4">
                                 <div>
                                   <p className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-400 mb-1">World</p>
                                   <p className="text-xs text-slate-300 font-medium">{charStoryExpansion.world}</p>
                                 </div>
                                 <div className="grid grid-cols-2 gap-4">
                                   <div>
                                     <p className="text-[9px] font-black uppercase tracking-[0.2em] text-red-400 mb-1">Enemies</p>
                                     <ul className="text-xs text-slate-400">{charStoryExpansion.enemies?.map((e:string,i:number)=><li key={i}>• {e}</li>)}</ul>
                                   </div>
                                   <div>
                                     <p className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-400 mb-1">Allies</p>
                                     <ul className="text-xs text-slate-400">{charStoryExpansion.allies?.map((a:string,i:number)=><li key={i}>• {a}</li>)}</ul>
                                   </div>
                                 </div>
                                 <div>
                                   <p className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-400 mb-1">Current Mission</p>
                                   <p className="text-xs text-slate-300 font-medium">{charStoryExpansion.currentMission}</p>
                                 </div>
                               </div>
                             )}
                           </div>
                        </div>
                     </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Right Column: Trending */}
            <div className="space-y-6">
              <div className="bg-[#0B1023]/60 border border-cyan-500/10 rounded-[2rem] p-8 space-y-5 sticky top-32">
                 <div className="flex justify-between items-center mb-2">
                   <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-500 flex items-center gap-2"><Zap className="w-3 h-3"/> Trending Tropes</h4>
                   {isTrendingLoading && <RefreshCcw className="w-3 h-3 text-cyan-400 animate-spin" />}
                 </div>
                 <div className="space-y-2">
                   {(dynamicTrending.length > 0 ? dynamicTrending : ['Cyberpunk Assassin', 'Anime Hero', 'AI Hacker', 'Dark Villain', 'Futuristic Soldier', 'Neon Samurai', 'Multiverse Traveler']).map(t => (
                     <button key={t} onClick={() => setCharType(t)} className="w-full p-4 bg-slate-900/50 hover:bg-slate-900 border border-white/5 hover:border-cyan-500/40 rounded-2xl text-left text-[11px] font-bold text-slate-300 hover:text-white transition-all flex items-center justify-between group">
                       {t} <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 text-cyan-400 transition-opacity" />
                     </button>
                   ))}
                 </div>
                 <div className="mt-8 pt-6 border-t border-white/5">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-500 mb-4 flex items-center gap-2"><Box className="w-3 h-3" /> 3D Export Core</h4>
                    <div className="grid grid-cols-1 gap-2">
                      <button onClick={() => alert('Exporting to GLB/GLTF... Model will be downloaded in a moment.')} className="w-full p-3 bg-slate-900/50 hover:bg-cyan-500/10 border border-white/5 hover:border-cyan-500/30 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-cyan-400 transition-all flex items-center justify-between group">
                        Download GLB Model <Download className="w-3 h-3" />
                      </button>
                      <button onClick={() => alert('Preparing FBX Export... High-fidelity rig included.')} className="w-full p-3 bg-slate-900/50 hover:bg-purple-500/10 border border-white/5 hover:border-purple-500/30 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-purple-400 transition-all flex items-center justify-between group">
                        Download FBX Model <Download className="w-3 h-3" />
                      </button>
                      <button onClick={() => alert('Packing .BLEND file... Native Blender format ready.')} className="w-full p-3 bg-slate-900/50 hover:bg-emerald-500/10 border border-white/5 hover:border-emerald-500/30 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-emerald-400 transition-all flex items-center justify-between group">
                        Download .BLEND <Download className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-[8px] text-slate-600 font-bold uppercase tracking-widest text-center pt-3 italic">Professional 3D Formats (V-Rig Ready)</p>
                  </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    function renderCreativeDashboard() {
    const categories = [
      {
        name: "Content Creation Tools",
        tools: [
          { name: "AI Story Generator", desc: "Generate engaging stories on any topic.", icon: PenTool, color: "text-purple-400", bg: "bg-purple-600/10" },
          { name: "Script Writer", desc: "Write scripts for YouTube, Reels, Shorts & more.", icon: Video, color: "text-red-400", bg: "bg-red-600/10" },
          { name: "Idea Generator", id: "idea", desc: "Get unique ideas for content, business or more.", icon: Lightbulb, color: "text-amber-400", bg: "bg-amber-600/10" },
          { name: "Song Lyrics Generator", desc: "Create original song lyrics in any style.", icon: Radio, color: "text-pink-400", bg: "bg-pink-600/10" },
          { name: "Joke / Meme Ideas", id: "joke", desc: "Generate funny jokes and meme ideas.", icon: MessageSquare, color: "text-emerald-400", bg: "bg-emerald-600/10" }
        ]
      },
      {
        name: "Character & World Building",
        tools: [
          { name: "AI Character Creator", id: "character", desc: "Create unique characters with backstory.", icon: User, color: "text-violet-400", bg: "bg-violet-600/10" },
          { name: "World / Universe Builder", desc: "Build your own world, settings & lore.", icon: Globe, color: "text-blue-400", bg: "bg-blue-600/10" },
          { name: "Fantasy Story Builder", desc: "Create fantasy stories with AI magic.", icon: Book, color: "text-emerald-400", bg: "bg-emerald-600/10" },
          { name: "Game Story Generator", desc: "Generate storylines for your game ideas.", icon: Layout, color: "text-rose-400", bg: "bg-rose-600/10" }
        ]
      },
      {
        name: "Social & Creator Tools",
        tools: [
          { name: "Viral Hook Generator", desc: "Create attention-grabbing hooks for your content.", icon: Zap, color: "text-orange-400", bg: "bg-orange-600/10" },
          { name: "Caption Generator", desc: "Generate captions for Instagram, Facebook etc.", icon: MessageSquare, color: "text-indigo-400", bg: "bg-indigo-600/10" },
          { name: "Hashtag Generator", desc: "Find trending & relevant hashtags instantly.", icon: Hash, color: "text-purple-400", bg: "bg-purple-600/10" },
          { name: "Video Script & Planner", desc: "Plan video content with script & scene ideas.", icon: Monitor, color: "text-emerald-400", bg: "bg-emerald-600/10" }
        ]
      },
      {
        name: "Experimental AI Tools",
        tools: [
          { name: "AI Personality Chat", desc: "Chat with custom AI characters.", icon: MessageSquare, color: "text-cyan-400", bg: "bg-cyan-600/10" },
          { name: "Brainstorm Mode", desc: "Deep thinking AI for creative brainstorming.", icon: Zap, color: "text-indigo-400", bg: "bg-indigo-600/10" },
          { name: "Future Predictor", desc: "Get fun & creative predictions.", icon: Eye, color: "text-amber-400", bg: "bg-amber-600/10" },
          { name: "Random Creative Generator", desc: "Get random creative ideas & surprises.", icon: RefreshCcw, color: "text-purple-400", bg: "bg-purple-600/10" }
        ]
      },
      {
        name: "Design Thinking Tools",
        tools: [
          { name: "Brand Name Generator", desc: "Generate unique & catchy brand names.", icon: Settings, color: "text-cyan-400", bg: "bg-cyan-600/10" },
          { name: "Tagline Generator", desc: "Create memorable taglines for brands.", icon: Tag, color: "text-orange-400", bg: "bg-orange-600/10" },
          { name: "Product Idea Generator", desc: "Discover innovative product ideas.", icon: CreditCard, color: "text-emerald-400", bg: "bg-emerald-600/10" },
          { name: "Startup Pitch Generator", desc: "Generate pitch ideas & content for startups.", icon: Rocket, color: "text-blue-400", bg: "bg-blue-600/10" }
        ]
      }
    ];

    const handleSelectTool = (toolId: string) => {
      setCreativeSubTab(toolId);
      setCreativeToolResult('');
      setMemeResult(null);
      setMemeImagePreview(null);
      setIdeaResult(null);
      setExpandedIdeaContent(null);
      setCharResult(null);
      setCharImagePreview(null);
      setCharDialogue(null);
      setCharStoryExpansion(null);
    };

    if (creativeSubTab === 'joke') return renderMemeGenerator();
    if (creativeSubTab === 'idea') return renderIdeaGenerator();
    if (creativeSubTab === 'character') return renderCharacterCreator();

    const renderHistorySidebar = () => (
      <AnimatePresence>
        {showHistorySidebar && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHistorySidebar(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed right-0 top-0 h-full w-full md:w-96 bg-[#0B1023] border-l border-white/10 z-[151] p-6 shadow-2xl flex flex-col"
            >
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-600/20 rounded-lg flex items-center justify-center border border-purple-500/30">
                    <Clock className="w-4 h-4 text-purple-400" />
                  </div>
                  <h3 className="text-lg font-black uppercase tracking-widest italic">Tool <span className="text-purple-400">History</span></h3>
                </div>
                <button onClick={() => setShowHistorySidebar(false)} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar space-y-4">
                {creativeHistory.filter(h => h.type === creativeSubTab).length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-4 opacity-50">
                    <Database className="w-12 h-12" />
                    <p className="text-[10px] font-black uppercase tracking-widest">No history found for this tool</p>
                  </div>
                ) : (
                  creativeHistory.filter(h => h.type === creativeSubTab).map((h, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => {
                        if (creativeSubTab === 'idea') {
                          setIdeaTopic(h.topic || '');
                          setIdeaResult(h.result);
                        } else if (creativeSubTab === 'character') {
                          setCharResult(h.result);
                        }
                        setShowHistorySidebar(false);
                      }}
                      className="p-4 bg-slate-900/50 border border-white/5 rounded-2xl cursor-pointer hover:border-purple-500/50 hover:bg-slate-900 transition-all group"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest line-clamp-1">{h.result?.title || h.result?.name || 'Saved Generation'}</span>
                        <span className="text-[8px] text-slate-500 font-bold">{h.date}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">{h.result?.description || h.result?.backstory}</p>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );

    return (
      <div className="min-h-full bg-slate-950 p-3 md:p-6 overflow-y-auto no-scrollbar relative">
        {renderHistorySidebar()}
        {/* Compact Header Section */}
        <div className="max-w-full mx-auto mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2 md:px-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center shadow-[0_0_30px_rgba(79,70,229,0.2)] border border-white/10">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-white italic tracking-tight uppercase">Creative <span className="font-light not-italic text-slate-500 tracking-normal">Mode</span></h1>
              <p className="text-slate-500 text-[9px] font-bold uppercase tracking-[0.1em]">Imagination Engine v2.0</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <div className="bg-slate-900/50 border border-slate-800 p-2 px-4 rounded-xl flex items-center gap-3 backdrop-blur-md">
              <div className="text-right">
                <span className="text-[7px] font-black text-slate-600 uppercase tracking-widest block">Credits</span>
                <span className="text-lg font-black text-white">{credits.toLocaleString()}</span>
              </div>
            </div>
            <button onClick={() => setIsPricingOpen(true)} className="bg-white text-black px-5 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-all">Upgrade</button>
          </div>
        </div>

        {/* Compact Categories and Tools Grid */}
        <div className="max-w-full mx-auto space-y-8 px-2 md:px-4">
          {categories.map((cat, idx) => (
            <div key={idx} className="space-y-4">
              <div className="flex items-center gap-3">
                <h2 className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.3em] whitespace-nowrap">{cat.name}</h2>
                <div className="h-[1px] w-full bg-slate-800/30" />
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-3 sm:gap-4">
                {cat.tools.map((tool, tIdx) => (
                  <motion.button
                    key={tIdx}
                    onClick={() => handleSelectTool(tool.id || tool.name.toLowerCase().replace(/ /g, ''))}
                    whileHover={{ scale: 1.02, y: -4 }}
                    className="group bg-slate-900/40 border border-slate-800/60 hover:border-indigo-500/50 p-6 rounded-2xl text-left transition-all relative overflow-hidden h-full flex flex-col justify-between"
                  >
                    <div>
                      <div className={`w-12 h-12 rounded-xl ${tool.bg} flex items-center justify-center mb-4 border border-white/5 shadow-lg`}>
                        <tool.icon className={`w-6 h-6 ${tool.color}`} />
                      </div>
                      <h3 className="text-sm font-black text-white mb-1.5 group-hover:text-indigo-300 transition-colors">{tool.name}</h3>
                      <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">{tool.desc}</p>
                    </div>
                    
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest">Creative Suite</span>
                      <ChevronRight className="w-4 h-4 text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Compact Lab Section */}
        <div className="max-w-7xl mx-auto mt-10 pt-10 border-t border-slate-900">
           <div className="bg-gradient-to-br from-indigo-900/10 to-slate-900/20 border border-indigo-500/10 rounded-3xl p-6 md:p-8 relative overflow-hidden">
             <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
               <div className="space-y-4">
                 <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-indigo-600 text-white rounded-full text-[8px] font-black uppercase tracking-widest">Experimental Lab</div>
                 <h2 className="text-2xl font-black text-white italic">AI Creative Studio</h2>
                 <p className="text-slate-500 text-xs leading-relaxed max-w-sm font-medium">Access advanced creative models for HD synthesis and procedural storytelling.</p>
                 <div className="flex gap-3">
                   <button className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-indigo-500 transition-all">Enter Studio</button>
                   <button className="bg-slate-800 text-white px-5 py-2.5 rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-slate-700 transition-all">Docs</button>
                 </div>
               </div>
               <div className="grid grid-cols-2 gap-3">
                 {[
                   { name: "Image Studio", icon: ImageIcon, desc: "Ultra-HD" },
                   { name: "Video Lab", icon: Video, desc: "Motion Gen" },
                   { name: "Voice Suite", icon: Mic2, desc: "Neural Clone" },
                   { name: "Dev Engine", icon: Code, desc: "AI Builder" }
                 ].map(item => (
                   <div key={item.name} className="bg-slate-950/60 border border-slate-800 p-3 rounded-2xl hover:border-indigo-500/30 transition-all group">
                     <item.icon className="w-4 h-4 text-indigo-500 mb-2 group-hover:scale-110 transition-transform" />
                     <h4 className="text-[10px] font-bold text-white mb-0.5">{item.name}</h4>
                     <p className="text-[8px] text-slate-600">{item.desc}</p>
                   </div>
                 ))}
               </div>
             </div>
           </div>
        </div>
        
        <div className="max-w-7xl mx-auto mt-10 text-center">
          <p className="text-[8px] font-bold text-slate-800 uppercase tracking-[0.4em]">SmartAI Neural Engine v4.8.2</p>
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
      <div className="w-full h-full flex flex-col max-w-full mx-auto px-3 md:px-6 gap-3 py-3 relative overflow-y-auto no-scrollbar">
        {/* Header Section */}
        <div className="flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-indigo-600/10 rounded-xl flex items-center justify-center border border-indigo-500/20 shadow-lg shadow-indigo-600/5">
                <Zap className="w-5 h-5 text-indigo-400" />
             </div>
             <div>
                <h1 className="text-lg md:text-xl font-black text-white tracking-tight uppercase italic">Normal <span className="text-slate-500 font-light not-italic tracking-normal">Mode</span></h1>
                <p className="text-[8px] text-slate-500 font-bold uppercase tracking-[0.2em]">Efficiency Suite v1.0</p>
             </div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-2 px-4 flex items-center gap-4">
            <div className="text-right">
              <p className="text-[7px] font-bold text-slate-500 uppercase tracking-widest">Credits</p>
              <p className="text-base font-black text-white">{credits}</p>
            </div>
          </div>
        </div>

        {/* Quick Tools */}
        <div className="shrink-0">
          <div className="flex items-center justify-between mb-2">
             <h2 className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.3em]">Quick Access</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3 sm:gap-4">
            {[
              { name: 'Text to Image', desc: 'Gen from text.', icon: ImageIcon, color: 'text-indigo-400' },
              { name: 'Image to Image', desc: 'Restyle images.', icon: Copy, color: 'text-blue-400' },
              { name: 'BG Remover', desc: 'One-click clear.', icon: Layers, color: 'text-slate-400' },
              { name: 'Enhance', desc: 'Upscale & fix.', icon: Sparkles, color: 'text-purple-400' },
              { name: 'Compress', desc: 'Optimize size.', icon: Download, color: 'text-emerald-400' }
            ].map((tool, i) => (
              <button key={i} onClick={() => handleToolClick(tool)} className="bg-slate-900/40 border border-slate-800/60 hover:bg-slate-800/60 transition-all rounded-2xl p-5 text-left group h-full flex flex-col justify-between shadow-lg">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-slate-950 flex items-center justify-center border border-slate-800 group-hover:border-indigo-500/30 transition-colors shadow-inner`}>
                      <tool.icon className={`w-6 h-6 ${tool.color}`} />
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/5 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-sm font-black text-white mb-1.5">{tool.name}</h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">{tool.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* More Tools */}
        <div className="pb-4 flex flex-col min-h-0">
          <h2 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">All Utilities</h2>
          <div className="grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-2 sm:gap-3 pb-20 md:pb-10 overflow-y-auto no-scrollbar">
            {[
              { name: 'Resize', desc: 'Dimensions.', icon: Monitor },
              { name: 'Crop', desc: 'Any size.', icon: Layout },
              { name: 'Rotate', desc: 'Flip/Rotate.', icon: RefreshCcw },
              { name: 'Convert', desc: 'Formats.', icon: FileText },
              { name: 'Text', desc: 'Add labels.', icon: PenTool },
              { name: 'Adjust', desc: 'Color/Light.', icon: Eye },
              { name: 'Filters', desc: 'FX effects.', icon: Sparkles },
              { name: 'Collage', desc: 'Multi-grid.', icon: Layout },
              { name: 'Memes', desc: 'Humor gen.', icon: User },
              { name: 'Stickers', desc: 'Add icons.', icon: Layers },
              { name: 'Watermark', desc: 'Ownership.', icon: CloudSun },
              { name: 'QR Gen', desc: 'Codes.', icon: Code }
            ].map((tool, i) => (
              <button key={i} onClick={() => handleToolClick(tool)} className="bg-slate-900/40 border border-slate-800/40 hover:bg-slate-800/60 transition-all rounded-2xl p-4 flex items-center gap-4 text-left group shadow-sm">
                <div className="w-10 h-10 shrink-0 rounded-xl bg-slate-950 flex items-center justify-center border border-slate-800 group-hover:border-indigo-500/30 transition-colors shadow-inner">
                  <tool.icon className="w-5 h-5 text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-black text-white mb-0.5 truncate">{tool.name}</h3>
                  <p className="text-[10px] text-slate-600 truncate">{tool.desc}</p>
                </div>
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
                                  if (p.includes('rotate')) { canvas.width = img.height; canvas.height = img.width; ctx.translate(canvas.width / 2, canvas.height / 2); ctx.rotate(90 * Math.PI / 180); ctx.drawImage(img, -img.width / 2, -img.height / 2); } else { ctx.drawImage(img, 0, 0); }
                                  ctx.filter = 'none';

                                  // Handle remove background
                                  if (p.includes('remove') && (p.includes('background') || p.includes('bg'))) {
                                    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                                    const d = imgData.data; const bgR = d[0], bgG = d[1], bgB = d[2];
                                    for (let i = 0; i < d.length; i += 4) { const dist = Math.sqrt((d[i] - bgR) ** 2 + (d[i + 1] - bgG) ** 2 + (d[i + 2] - bgB) ** 2); if (dist < 55) d[i + 3] = 0; }
                                    ctx.putImageData(imgData, 0, 0);
                                  }

                                  // Handle add text
                                  if (p.includes('add text') || p.includes('write') || p.includes('watermark')) {
                                    const textMatch = toolPrompt.match(/["'](.+?)["']/);
                                    const text = textMatch ? textMatch[1] : 'SMART AI';
                                    ctx.font = `bold ${canvas.width * 0.08}px Arial`; ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.strokeStyle = 'black'; ctx.lineWidth = canvas.width * 0.01; ctx.textAlign = 'center';
                                    ctx.strokeText(text, canvas.width / 2, canvas.height - 40); ctx.fillText(text, canvas.width / 2, canvas.height - 40);
                                  }

                                  // Handle border
                                  if (p.includes('border') || p.includes('frame')) {
                                    const bw = canvas.width * 0.03;
                                    ctx.strokeStyle = p.includes('white') ? 'white' : p.includes('gold') ? '#FFD700' : '#4f46e5';
                                    ctx.lineWidth = bw; ctx.strokeRect(bw / 2, bw / 2, canvas.width - bw, canvas.height - bw);
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
                                  canvas.width = 500; canvas.height = 500; ctx.fillStyle = 'white'; ctx.fillRect(0, 0, 500, 500); ctx.drawImage(qrImg, 0, 0);
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
                                    else { canvas.width = img.height; canvas.height = img.width; ctx.translate(canvas.width / 2, canvas.height / 2); ctx.rotate(90 * Math.PI / 180); ctx.drawImage(img, -img.width / 2, -img.height / 2); }
                                  } else if (activeTool.name === 'Background Remover' || activeTool.name === 'Sticker Maker') {
                                    ctx.drawImage(img, 0, 0);
                                    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                                    const d = imgData.data; const bgR = d[0], bgG = d[1], bgB = d[2];
                                    for (let i = 0; i < d.length; i += 4) { const dist = Math.sqrt((d[i] - bgR) ** 2 + (d[i + 1] - bgG) ** 2 + (d[i + 2] - bgB) ** 2); if (dist < 50) d[i + 3] = 0; }
                                    ctx.putImageData(imgData, 0, 0);
                                  } else {
                                    if (activeTool.name === 'Image Enhance') ctx.filter = 'contrast(1.2) saturate(1.3) brightness(1.1)';
                                    if (activeTool.name === 'Color Adjust') ctx.filter = 'hue-rotate(45deg) saturate(1.5)';
                                    if (activeTool.name === 'Filters & Effects') ctx.filter = 'sepia(0.8) contrast(1.1)';
                                    ctx.drawImage(img, 0, 0); ctx.filter = 'none';
                                    if (activeTool.name === 'Add Text' || activeTool.name === 'Watermark Add') {
                                      const text = prompt("Enter text:", "SMART AI PRO");
                                      if (text) { ctx.font = `bold ${canvas.width * 0.08}px Arial`; ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.strokeStyle = 'black'; ctx.lineWidth = canvas.width * 0.01; ctx.textAlign = 'center'; ctx.strokeText(text, canvas.width / 2, canvas.height - 50); ctx.fillText(text, canvas.width / 2, canvas.height - 50); }
                                    } else if (activeTool.name === 'Meme Generator') {
                                      const top = prompt("Enter Top Text:", "WHEN AI"); const bot = prompt("Enter Bottom Text:", "DOES IT PERFECTLY");
                                      ctx.font = `bold ${canvas.width * 0.1}px Impact`; ctx.fillStyle = 'white'; ctx.strokeStyle = 'black'; ctx.lineWidth = canvas.width * 0.015; ctx.textAlign = 'center';
                                      ctx.strokeText(top || '', canvas.width / 2, canvas.width * 0.15); ctx.fillText(top || '', canvas.width / 2, canvas.width * 0.15);
                                      ctx.strokeText(bot || '', canvas.width / 2, canvas.height - canvas.width * 0.05); ctx.fillText(bot || '', canvas.width / 2, canvas.height - canvas.width * 0.05);
                                    } else if (activeTool.name === 'Image Converter') {
                                      const f = prompt("Enter format (png, jpeg, webp):", "webp");
                                      if (f === 'jpeg' || f === 'jpg') outFormat = 'image/jpeg'; else if (f === 'webp') outFormat = 'image/webp';
                                    } else if (activeTool.name === 'Compress Image') { outFormat = 'image/jpeg'; outQuality = 0.4; }
                                    else if (activeTool.name === 'Collage Maker') { ctx.drawImage(img, 0, 0, canvas.width / 2, canvas.height / 2); ctx.drawImage(img, canvas.width / 2, 0, canvas.width / 2, canvas.height / 2); ctx.filter = 'hue-rotate(90deg)'; ctx.drawImage(img, 0, canvas.height / 2, canvas.width / 2, canvas.height / 2); ctx.filter = 'grayscale(1)'; ctx.drawImage(img, canvas.width / 2, canvas.height / 2, canvas.width / 2, canvas.height / 2); ctx.filter = 'none'; }
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
    if (smartMode === 'expert') return renderExpertPro();
    if (smartMode === 'creative') return renderCreativeDashboard();
    return renderNormalDashboard();
  }

  const renderContent = () => {
    if (activeTab === 'home') return renderHome();
    return (
      <div className={`w-full flex-1 flex flex-col min-h-0 ${activeTab === 'chat' ? 'overflow-hidden' : 'overflow-y-auto'} ${smartMode === 'expert' && activeTab === 'chat' ? 'p-0' : 'p-2 md:p-4'}`}>
        {activeTab === 'chat' && (
          smartMode === 'expert' ? renderExpertPro() : (
            <div className="max-w-4xl mx-auto w-full flex flex-col flex-1 min-h-0 bg-slate-900/30 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
              {/* Chat Header */}
              <div className="flex justify-between items-center p-3 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600/20 flex items-center justify-center border border-indigo-500/30">
                    <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
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
              <div className="flex-1 overflow-y-auto p-3 space-y-3 no-scrollbar scroll-smooth">
                {messages.map((msg, idx) => {
                  return (
                    <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                      <div className={`max-w-[90%] p-2.5 md:p-3 rounded-2xl relative group ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-slate-800/80 border border-slate-700/50 text-slate-200 shadow-lg rounded-tl-sm'} ${msg.isVoice ? 'border-dashed border-indigo-500/40' : ''}`}>
                        <p className="text-[12px] leading-relaxed whitespace-pre-wrap font-medium">{msg.content}</p>
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
                  );
                })}
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
              <div className="p-2 bg-slate-900/90 border-t border-slate-800 backdrop-blur-md shrink-0">
                <div className="flex gap-1.5 items-center bg-slate-950 border border-slate-800 rounded-lg p-1 shadow-inner focus-within:border-indigo-500/50 transition-colors">
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
                    <button 
                      onClick={() => setIsVoiceAvatarOpen(true)} 
                      title="AI Voice Assistant"
                      className="p-2 bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600 hover:text-white rounded-lg transition-all border border-indigo-500/20"
                    >
                      <Globe className="w-4 h-4" />
                    </button>
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
              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-black text-white flex items-center gap-2 tracking-tight">
                    <Clock className="w-5 h-5 text-indigo-400" />
                    History
                  </h3>
                  <button onClick={() => setShowHistory(!showHistory)} className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors">
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
          <div className="max-w-4xl mx-auto space-y-4 pb-20">
            {/* Profile Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-6 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none" />
              <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-2xl border-4 border-slate-800 group-hover:scale-105 transition-transform overflow-hidden">
                    {tempAvatar ? <img src={tempAvatar} alt="avatar" className="w-full h-full object-cover" /> : <span>{(tempDisplayName || email || 'U').charAt(0).toUpperCase()}</span>}
                  </div>
                  <input
                    type="file"
                    id="profile-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileUpload}
                  />
                  <button
                    onClick={() => document.getElementById('profile-upload')?.click()}
                    className="absolute bottom-0 right-0 p-2 bg-slate-800 border border-slate-700 rounded-full text-indigo-400 hover:text-white transition-colors shadow-lg"
                  >
                    <ImageIcon className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex-1 text-center md:text-left space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Display Name</label>
                    <div className="flex flex-col sm:flex-row gap-2 max-w-sm mx-auto md:mx-0 w-full">
                      <input
                        value={tempDisplayName}
                        onChange={e => setTempDisplayName(e.target.value)}
                        className="flex-1 w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 sm:py-2 text-white font-bold focus:outline-none focus:border-indigo-500/50"
                      />
                      <button onClick={handleUpdateProfile} className="bg-indigo-600 px-4 py-3 sm:py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-500 transition-all w-full sm:w-auto mt-2 sm:mt-0">Save Changes</button>
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
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl space-y-4">
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

              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl flex flex-col justify-between">
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
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white uppercase">{(displayName || email || 'U').charAt(0)}</div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-bold text-white truncate">{displayName || email?.split('@')[0] || 'User'}</div>
              <div className="text-[9px] text-slate-500 truncate">{email}</div>
            </div>
            <button onClick={() => setActiveTab('profile')} className="p-1.5 text-slate-500 hover:text-white transition-colors"><Settings className="w-4 h-4" /></button>
          </div>

          {!isAdmin && (
            <button onClick={() => setActiveTab('admin')} className="w-full mt-2 flex items-center justify-center gap-1 opacity-30 hover:opacity-100 transition-opacity text-[8px] text-slate-600 uppercase tracking-widest">
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
            <div onClick={() => !isAdmin && setActiveTab('admin')} className="hidden md:flex items-center gap-2 text-slate-500 text-[9px] font-black uppercase tracking-[0.3em] cursor-pointer hover:text-white transition-colors">
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
        <div className="flex-1 relative flex flex-col overflow-hidden min-h-0 pb-16 md:pb-0">
          {renderContent()}
        </div>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-950/80 backdrop-blur-xl border-t border-slate-800/50 flex items-center justify-around p-2 z-[45] safe-area-inset-bottom">
          {[
            { name: 'Chat', icon: MessageSquare, tab: 'chat' },
            { name: 'Image', icon: ImageIcon, tab: 'image' },
            { name: 'Creative', icon: Lightbulb, tab: 'home', mode: 'creative' },
            { name: 'Profile', icon: User, tab: 'profile' }
          ].map((item) => (
            <button
              key={item.name}
              onClick={() => {
                setActiveTab(item.tab as Tab);
                if (item.mode) setSmartMode(item.mode as any);
              }}
              className={`flex flex-col items-center gap-1 p-2 transition-all ${
                (activeTab === item.tab && (!item.mode || smartMode === item.mode)) 
                  ? 'text-indigo-400' 
                  : 'text-slate-500'
              }`}
            >
              <item.icon className={`w-5 h-5 ${activeTab === item.tab && (!item.mode || smartMode === item.mode) ? 'animate-pulse' : ''}`} />
              <span className="text-[10px] font-bold uppercase tracking-wider">{item.name}</span>
            </button>
          ))}
        </nav>
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

              <div className="mt-auto pt-6 border-t border-slate-800 space-y-4 shrink-0">
                <button
                  onClick={() => { setIsPricingOpen(true); setIsMobileMenuOpen(false); }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition-all text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-indigo-600/20"
                >
                  <Sparkles className="w-4 h-4" /> Upgrade Plan
                </button>
                <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white uppercase">{(displayName || email || 'U').charAt(0)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-bold text-white truncate">{displayName || email?.split('@')[0] || 'User'}</div>
                    <div className="text-[9px] text-slate-500 truncate">{email}</div>
                  </div>
                  <button onClick={() => { setActiveTab('profile'); setIsMobileMenuOpen(false); }} className="p-1.5 text-slate-500 hover:text-white transition-colors"><Settings className="w-4 h-4" /></button>
                </div>

                {!isAdmin && (
                  <button onClick={() => { setActiveTab('admin'); setIsMobileMenuOpen(false); }} className="w-full mt-2 flex items-center justify-center gap-1 opacity-30 hover:opacity-100 transition-opacity text-[8px] text-slate-600 uppercase tracking-widest">
                    <Shield className="w-2 h-2" /> Admin Access
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Overlays */}
      <AnimatePresence>
        {isPricingOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-slate-900 border border-slate-800 rounded-[2rem] p-4 md:p-8 max-w-4xl w-full shadow-2xl overflow-y-auto max-h-[95vh] no-scrollbar">
              <div className="flex justify-between items-center mb-6 md:mb-8">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold italic tracking-tight text-white">Neural Upgrade</h2>
                  <p className="text-slate-500 text-[10px] md:text-xs mt-1 font-bold uppercase tracking-widest">Select your processing tier</p>
                </div>
                <button onClick={() => setIsPricingOpen(false)} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-white transition-colors shadow-lg"><X className="w-4 h-4" /></button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {PLANS.map(p => (
                  <div key={p.name} className={`p-5 md:p-6 rounded-2xl border transition-all duration-500 flex flex-col relative group ${p.popular ? 'border-indigo-600 bg-indigo-600/5 shadow-xl shadow-indigo-600/10' : 'border-slate-800 bg-slate-950/50 hover:border-slate-700'}`}>
                    {p.popular && <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full shadow-lg">Best Value</span>}
                    <h3 className="text-lg font-bold text-white mb-1">{p.name}</h3>
                    <div className="flex items-baseline gap-1 mb-4">
                      <span className="text-2xl font-bold text-white">{p.price.split(' ')[0]}</span>
                      <span className="text-slate-500 text-[9px] font-bold uppercase tracking-widest">{p.price.split(' ').slice(1).join(' ')}</span>
                    </div>
                    <ul className="space-y-2 mb-6 flex-1">
                      {p.features.map(f => (
                        <li key={f} className="text-[10px] text-slate-400 flex items-start gap-2 leading-relaxed">
                          <Check className="w-3 h-3 text-indigo-400 mt-0.5 flex-shrink-0" /> {f}
                        </li>
                      ))}
                    </ul>
                    <button onClick={() => handleSelectPlan(p)} className={`w-full py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all shadow-lg ${p.popular ? 'bg-indigo-600 text-white hover:bg-indigo-500' : 'bg-white text-black hover:bg-slate-200'}`}>
                      Select Plan
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isVoiceAvatarOpen && (
          <AIVoiceAvatar 
            isActive={isVoiceAvatarOpen}
            onClose={() => setIsVoiceAvatarOpen(false)}
            onTranscript={(text) => handleSendMessage(text, true)}
            isThinking={isAiThinking}
            lastAiMessage={lastAiMessage}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
