import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Image as ImageIcon, LogOut, Send, Plus, Zap, Sparkles, Github, Download, Video, User, CreditCard, Eye, EyeOff, Shield, Copy, Check, Search, Mic, RefreshCcw, Menu, X, ArrowLeft, ChevronUp, ChevronDown, ChevronRight, Terminal, FileText, Code, Lightbulb, PenTool, Database, Layout, TrendingUp, Mic2, FileSearch, Layers, Cpu, FastForward, Monitor, Globe, Network, Crown, Clock, CloudSun, Radio, Instagram, Lock as LockIcon, Settings, Hash, Book, Rocket, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import AdminPanel from './AdminPanel';
import { fetchUsersFromSupabase, syncUsersToSupabase, checkAdminSession } from './lib/db';
import { supabase } from './lib/supabase';
import AIVoiceAvatar from './AIVoiceAvatar';
import StoryGenerator from './StoryGenerator';

type Tab = 'home' | 'chat' | 'image' | 'video' | 'profile' | 'admin' | 'story';
type SmartMode = 'normal' | 'creative' | 'expert';
interface Message { id: string; role: 'user' | 'assistant'; content: string; isVoice?: boolean; }

const SIDEBAR_ITEMS = [
  { name: 'AI Chat', icon: MessageSquare, tab: 'chat' as Tab },
  { name: 'Image Generator', icon: ImageIcon, tab: 'image' as Tab },
  { name: 'AI Story Generator', icon: Book, tab: 'story' as Tab },
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
  { name: 'Pro', price: '₹99', features: ['10,000 Credits', 'Expert Mode Enabled', '2K Intelligence'], color: 'indigo-500', popular: true },
  { name: 'Ultra', price: '₹199', features: ['Unlimited Pixels', 'Zero Latency', '4K Imagination'], color: 'emerald-500' },
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

// ✅ EXACT 8 REQUESTED TOOLS - FREE FOR ALL USERS
const EXPERT_TOOLS = [
  { id: 'agent', name: 'AI Agent Mode ⚡', badge: 'NEW', icon: Zap, desc: 'Auto task execution', color: '#a855f7' },
  { id: 'memory', name: 'Memory + Personal AI 🧠', badge: 'NEW', icon: Database, desc: 'User preferences store', color: '#3b82f6' },
  { id: 'voice', name: 'Voice Clone AI 🎤', badge: 'NEW', icon: Mic2, desc: 'Voice cloning system', color: '#d946ef' },
  { id: 'builder', name: 'Full Website Builder 💻', badge: 'NEW', icon: Code, desc: 'Drag & drop builder', color: '#f59e0b' },
  { id: 'business', name: 'Business Growth Tools 📈', badge: 'NEW', icon: TrendingUp, desc: 'Marketing tools', color: '#22c55e' },
  { id: 'file', name: 'Advanced File Intelligence 📄', badge: 'NEW', icon: FileText, desc: 'File analyzer', color: '#6366f1' },
  { id: 'data', name: 'Real-Time Internet Data 🌐', badge: 'HOT', icon: Globe, desc: 'Live search', color: '#ef4444' },
  { id: 'api', name: 'API Integration System 🔗', badge: 'HOT', icon: CloudSun, desc: 'External API connect', color: '#f59e0b' },
];

const TEMPLATES = [
  // ... (unchanged)
];

const IconComponent = ({ icon: Icon, className }: { icon: any, className?: string }) => <Icon className={className || "w-full h-full"} />;

export default function App() {
  // ... all state variables unchanged ...

  const isExpertLocked = false; // ✅ UNLOCKED - FREE for ALL users!

  // ... all useEffect unchanged ...

  const renderExpertPro = () => {
    // ✅ LOCK BYPASSED - always show tools
    // if (isExpertLocked) { ... COMMENTED OUT }

    if (!activeExpertTool) {
      return (
        <div className="h-full flex flex-col overflow-hidden bg-gradient-to-br from-[#0a0a0c] to-[#111116]">
          <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-[1600px] mx-auto">
              {/* HEADER */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <Crown className="w-10 h-10 text-yellow-500 drop-shadow-lg" />
                  <div>
                    <h1 className="text-4xl font-black bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent tracking-tight">Expert Mode</h1>
                    <p className="text-slate-400 text-lg mt-1 font-medium">Advanced AI Tools - Click any card to activate</p>
                  </div>
                </div>
              </div>

              {/* TOOLS GRID - 3-4 per row desktop, 1 mobile */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
                {EXPERT_TOOLS.map((t, idx) => (
                  <motion.button 
                    key={t.id} 
                    initial={{ opacity: 0, y: 30 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => setActiveExpertTool(t.id)}
                    className="group relative bg-[#1a1a22]/80 backdrop-blur-xl border border-slate-700/50 hover:border-indigo-500/70 p-8 rounded-3xl text-left h-[280px] flex flex-col overflow-hidden shadow-2xl hover:shadow-[0_20px_40px_rgba(79,70,229,0.3)] hover:scale-[1.02] transition-all duration-300 hover:bg-indigo-500/5"
                  >
                    {/* Glow background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--color)]/10 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl" style={{ '--color': t.color } as React.CSSProperties} />
                    
                    {/* Icon */}
                    <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 border border-white/20 mb-6 group-hover:scale-110 transition-all shadow-lg mx-auto relative z-10">
                      <t.icon className="w-10 h-10 drop-shadow-lg" style={{ color: t.color }} />
                    </div>
                    
                    {/* Badge */}
                    {t.badge && (
                      <span className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${t.badge === 'HOT' ? 'bg-gradient-to-r from-red-500/90 to-orange-500/90 text-white shadow-red-500/25' : 'bg-gradient-to-r from-indigo-500/90 to-purple-500/90 text-white shadow-indigo-500/25'}`}>
                        {t.badge}
                      </span>
                    )}
                    
                    {/* Title & Desc */}
                    <div className="flex-1 relative z-10">
                      <h3 className="text-xl font-black text-white mb-3 group-hover:text-indigo-400 transition-colors line-clamp-1">{t.name}</h3>
                      <p className="text-slate-400 text-sm leading-relaxed line-clamp-3">{t.desc}</p>
                    </div>
                    
                    {/* Arrow */}
                    <div className="absolute bottom-6 right-6 w-8 h-8 bg-white/10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all rotate-45 group-hover:rotate-0 ml-auto">
                      <ChevronRight className="w-5 h-5 text-white drop-shadow-lg" />
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Instructions */}
              <div className="text-center py-12 bg-slate-900/50 border border-slate-800 rounded-3xl">
                <Zap className="w-16 h-16 text-indigo-500 mx-auto mb-6 opacity-50" />
                <h3 className="text-2xl font-black text-white mb-4">Ready to Activate?</h3>
                <p className="text-slate-400 text-lg max-w-2xl mx-auto">Click any tool card above to load its advanced interface. Each tool opens a dedicated neural workspace.</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Tool-specific UIs (Voice Clone example)
    if (activeExpertTool === 'voice') {
      return <AIVoiceAvatar isActive={true} onClose={() => setActiveExpertTool(null)} />;
    }

    // Agent terminal (existing)
    if (activeExpertTool === 'agent') {
      // existing agent UI...
      // (code unchanged)
    }

    // Placeholder for other tools
    const tool = EXPERT_TOOLS.find(t => t.id === activeExpertTool);
    return (
      <div className="flex flex-col h-full p-8">
        <div className="mb-8 flex items-center gap-4">
          <button onClick={() => setActiveExpertTool(null)} className="p-3 bg-slate-800 rounded-2xl hover:bg-slate-700"><ArrowLeft className="w-5 h-5" /></button>
          <h1 className="text-3xl font-black text-white">{tool?.name}</h1>
        </div>
        <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 text-center flex-1 flex items-center justify-center">
          <div>
            <tool.icon.icon className="w-24 h-24 mx-auto mb-8 opacity-50" style={{ color: tool?.color }} />
            <p className="text-slate-500 text-xl max-w-md mx-auto">Advanced {tool?.name} interface loading... <br/> <small className="text-slate-400">Coming soon in next update</small></p>
          </div>
        </div>
      </div>
    );

  };

  // ... rest of component unchanged ...

  const renderStory = () => <StoryGenerator />;

  function renderHome() {
    console.log('RENDER HOME - smartMode:', smartMode); // DEBUG
    if (smartMode === 'expert') {
      return renderExpertPro(); // FORCE Expert grid
    }
    if (smartMode === 'creative') return renderCreativeDashboard();
    return renderNormalDashboard();
  }

  if (activeTab === 'story') return renderStory();

  // ... all other functions unchanged ...
}

