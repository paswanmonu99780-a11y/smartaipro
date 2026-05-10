import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, Settings as SettingsIcon, Palette, Bell, 
  Cpu, CreditCard, History, 
  Globe, LogOut, Upload, Check, X, Smartphone, Monitor, Database, ShieldCheck
} from 'lucide-react';
import { supabase } from './lib/supabase';

interface SettingsProps {
  onClose: () => void;
  onLogout: () => void;
  userEmail: string;
  userName: string;
  userAvatar: string;
  plan: string;
  credits: number;
  imageHistory?: any[];
  chatHistory?: any[];
  messages?: any[];
  onDisplayNameChange?: (n: string) => void;
  onAvatarChange?: (a: string) => void;
  onClearHistory?: () => void;
}

export default function Settings({ 
  onClose, onLogout, userEmail, userName, userAvatar, plan, credits, 
  imageHistory = [], chatHistory = [], messages = [], 
  onDisplayNameChange, onAvatarChange, onClearHistory 
}: SettingsProps) {
  const [activeTab, setActiveTab] = useState('Profile Settings');
  const [isLoading, setIsLoading] = useState(true);
  const [loadingText, setLoadingText] = useState('Loading User Preferences...');

  // Forms State
  const [profileData, setProfileData] = useState({ 
    name: userName, 
    username: userName.toLowerCase().replace(/\s/g, ''), 
    bio: 'AI Enthusiast & Creator', 
    email: userEmail, 
    phone: '', 
    country: 'India' 
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preferences (Real storage)
  const [notifState, setNotifState] = useState(() => { try { return JSON.parse(localStorage.getItem('smartai_notif') || 'null') || {email:true,ai:true,features:false,security:true,marketing:false}; } catch { return {email:true,ai:true,features:false,security:true,marketing:false}; }});
  const [aiPrefs, setAiPrefs] = useState(() => { try { return JSON.parse(localStorage.getItem('smartai_ai_prefs') || 'null') || {fastMode:false,autoSave:true,creativity:70}; } catch { return {fastMode:false,autoSave:true,creativity:70}; }});
  const [language, setLanguage] = useState(() => localStorage.getItem('smartai_language') || 'English');
  const [darkMode, setDarkMode] = useState(true);

  // Modals
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    setTimeout(() => { setLoadingText('Syncing SmartAI Settings...'); }, 800);
    setTimeout(() => { setIsLoading(false); }, 1500);
  }, []);

  const TABS = [
    { id: 'Profile Settings', icon: User },
    { id: 'Account & Usage', icon: SettingsIcon },
    { id: 'Appearance', icon: Palette },
    { id: 'AI Preferences', icon: Cpu },
    { id: 'Notifications', icon: Bell },
    { id: 'History & Data', icon: History },
    { id: 'Language', icon: Globe },
    { id: 'Logout', icon: LogOut, color: 'text-red-500' }
  ];

  const handleProfileSave = async () => {
    setIsSaving(true);
    setSaveMsg('');
    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          displayName: profileData.name, 
          bio: profileData.bio, 
          phone: profileData.phone, 
          country: profileData.country 
        })
        .eq('email', userEmail);

      if (!error) {
        onDisplayNameChange?.(profileData.name);
        setSaveMsg('Profile updated successfully!');
        setTimeout(() => setSaveMsg(''), 3000);
      } else {
        setSaveMsg('Error updating profile.');
      }
    } catch (e) {
      setSaveMsg('Server error. Please try again.');
    }
    setIsSaving(false);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const b64 = ev.target?.result as string;
      onAvatarChange?.(b64);
      await supabase.from('users').update({ avatar: b64 }).eq('email', userEmail);
    };
    reader.readAsDataURL(file);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Profile Settings':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2"><User className="w-6 h-6 text-purple-400" /> Profile Settings</h2>
            
            <div className="flex items-center gap-6 p-6 bg-[#0B1023] rounded-2xl border border-purple-500/20 shadow-lg">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-purple-500 shadow-[0_0_15px_rgba(123,97,255,0.4)]">
                  {userAvatar ? <img src={userAvatar} alt="Avatar" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-purple-900/50 flex items-center justify-center text-3xl font-bold text-purple-300">{userName.charAt(0)}</div>}
                </div>
                <div onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm">
                  <Upload className="w-6 h-6 text-white mb-1" />
                  <span className="text-[10px] text-white font-medium">Upload</span>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{userName}</h3>
                <p className="text-slate-400 text-sm">@{userEmail.split('@')[0]}</p>
                <div className="flex gap-3 mt-3">
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                  <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-lg transition-all shadow-md">Upload Photo</button>
                  <button onClick={() => { onAvatarChange?.(''); supabase.from('users').update({ avatar: '' }).eq('email', userEmail); }} className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-medium rounded-lg transition-all">Remove</button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mt-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Full Name</label>
                <input type="text" value={profileData.name} onChange={e => setProfileData({...profileData, name: e.target.value})} className="w-full bg-[#0B1023] border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Email Address</label>
                <input type="email" value={userEmail} disabled className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-slate-500 cursor-not-allowed" />
              </div>
              <div className="space-y-2 col-span-2">
                <label className="text-sm font-medium text-slate-400">Bio</label>
                <textarea rows={2} value={profileData.bio} onChange={e => setProfileData({...profileData, bio: e.target.value})} className="w-full bg-[#0B1023] border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-all"></textarea>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Phone</label>
                <input type="text" value={profileData.phone} onChange={e => setProfileData({...profileData, phone: e.target.value})} placeholder="+91 00000 00000" className="w-full bg-[#0B1023] border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Country</label>
                <select value={profileData.country} onChange={e => setProfileData({...profileData, country: e.target.value})} className="w-full bg-[#0B1023] border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-all appearance-none">
                  <option>India</option>
                  <option>United States</option>
                  <option>United Kingdom</option>
                  <option>Dubai</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-4 items-center gap-4">
              {saveMsg && <span className={`text-sm font-bold ${saveMsg.includes('Error') ? 'text-red-400' : 'text-green-400'}`}>{saveMsg}</span>}
              <button onClick={handleProfileSave} disabled={isSaving} className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(123,97,255,0.4)] disabled:opacity-50">
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </motion.div>
        );
      
      case 'Account & Usage':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2"><SettingsIcon className="w-6 h-6 text-purple-400" /> Account & Usage</h2>
            
            <div className="p-6 bg-gradient-to-br from-[#0B1023] to-[#1a103c] rounded-2xl border border-purple-500/30 shadow-xl relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-purple-500/10 blur-3xl rounded-full"></div>
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <div className="text-sm font-bold text-purple-400 uppercase tracking-widest mb-1">Current Plan</div>
                  <h3 className="text-3xl font-black text-white">{plan}</h3>
                  <div className="mt-3 flex items-center gap-2 text-xs font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded w-fit">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified Account
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-slate-400 mb-1">Available Credits</div>
                  <div className="text-2xl font-black text-cyan-400">{credits >= 9999999 ? 'Unlimited' : credits.toLocaleString()}</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="p-5 bg-[#0B1023] rounded-2xl border border-slate-800 text-center">
                <div className="text-2xl font-black text-purple-400">{messages.length}</div>
                <div className="text-[10px] text-slate-500 font-bold uppercase mt-1">AI Interactions</div>
              </div>
              <div className="p-5 bg-[#0B1023] rounded-2xl border border-slate-800 text-center">
                <div className="text-2xl font-black text-cyan-400">{imageHistory.length}</div>
                <div className="text-[10px] text-slate-500 font-bold uppercase mt-1">Images Generated</div>
              </div>
              <div className="p-5 bg-[#0B1023] rounded-2xl border border-slate-800 text-center">
                <div className="text-2xl font-black text-emerald-400">{chatHistory.length}</div>
                <div className="text-[10px] text-slate-500 font-bold uppercase mt-1">Active Chats</div>
              </div>
            </div>

            <div className="p-6 bg-[#0B1023] rounded-2xl border border-slate-800">
              <h3 className="text-lg font-bold text-white mb-4">Login Security</h3>
              <div className="flex items-center justify-between p-4 bg-[#050816] rounded-xl border border-slate-800/50">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-purple-500/10 rounded-lg"><Smartphone className="w-5 h-5 text-purple-400" /></div>
                  <div>
                    <div className="text-white font-bold text-sm">Active Session</div>
                    <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Browser • India</div>
                  </div>
                </div>
                <span className="text-[10px] font-black text-green-400 bg-green-400/10 px-2 py-1 rounded">CURRENT</span>
              </div>
            </div>
          </motion.div>
        );

      case 'AI Preferences':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2"><Cpu className="w-6 h-6 text-purple-400" /> AI Neural Settings</h2>
            
            <div className="p-6 bg-[#0B1023] rounded-2xl border border-slate-800 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-bold">Turbo Boost Mode</div>
                  <div className="text-xs text-slate-500">Prioritize faster response times for all chats</div>
                </div>
                <div onClick={() => { const p = {...aiPrefs,fastMode:!aiPrefs.fastMode}; setAiPrefs(p); localStorage.setItem('smartai_ai_prefs',JSON.stringify(p)); }} className={`w-12 h-6 rounded-full relative cursor-pointer transition-all ${aiPrefs.fastMode ? 'bg-purple-600' : 'bg-slate-800'}`}>
                  <motion.div animate={{ x: aiPrefs.fastMode ? 26 : 4 }} className="w-4 h-4 bg-white rounded-full absolute top-1" />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-bold">Neural Auto-Save</div>
                  <div className="text-xs text-slate-500">Sync conversation history to local storage automatically</div>
                </div>
                <div onClick={() => { const p = {...aiPrefs,autoSave:!aiPrefs.autoSave}; setAiPrefs(p); localStorage.setItem('smartai_ai_prefs',JSON.stringify(p)); }} className={`w-12 h-6 rounded-full relative cursor-pointer transition-all ${aiPrefs.autoSave ? 'bg-purple-600' : 'bg-slate-800'}`}>
                  <motion.div animate={{ x: aiPrefs.autoSave ? 26 : 4 }} className="w-4 h-4 bg-white rounded-full absolute top-1" />
                </div>
              </div>
              
              <div className="pt-2">
                <label className="text-sm font-medium text-slate-400 flex justify-between"><span>Creativity Level (Neural Variance)</span> <span className="text-indigo-400 font-bold">{aiPrefs.creativity}%</span></label>
                <input type="range" value={aiPrefs.creativity} onChange={e => { const p = {...aiPrefs,creativity:Number(e.target.value)}; setAiPrefs(p); localStorage.setItem('smartai_ai_prefs',JSON.stringify(p)); }} className="w-full mt-3 h-1.5 bg-slate-800 rounded-lg appearance-none accent-indigo-500 cursor-pointer" />
              </div>
            </div>
          </motion.div>
        );

      case 'History & Data':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2"><History className="w-6 h-6 text-purple-400" /> History & Exports</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 bg-[#0B1023] rounded-2xl border border-slate-800">
                <div className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-1">Chat Volume</div>
                <div className="text-2xl font-black text-white">{chatHistory.length} Sessions</div>
              </div>
              <div className="p-5 bg-[#0B1023] rounded-2xl border border-slate-800">
                <div className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-1">Media Synthesis</div>
                <div className="text-2xl font-black text-white">{imageHistory.length} Assets</div>
              </div>
            </div>

            <div className="p-6 bg-[#0B1023] rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-lg font-bold text-white">Data Control</h3>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => {
                  const data = JSON.stringify({user:userEmail,plan,credits,chats:chatHistory,images:imageHistory}, null, 2);
                  const blob = new Blob([data],{type:'application/json'});
                  const a = document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='smartai_export.json'; a.click();
                }} className="py-4 bg-[#050816] hover:bg-slate-800 border border-slate-800 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2">
                  <Database className="w-4 h-4" /> Export JSON
                </button>
                <button onClick={() => {
                  const rows = [['Type','Prompt','Date'],...imageHistory.map((h:any)=>['Image',h.prompt,h.date]),...chatHistory.map((h:any)=>['Chat',h.title,h.id])];
                  const csv = rows.map(r=>r.map(v=>'\"'+String(v).replace(/\"/g,'\"\"')+'\"').join(',')).join('\n');
                  const blob = new Blob([csv],{type:'text/csv'});
                  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download='smartai_history.csv'; a.click();
                }} className="py-4 bg-purple-600/10 hover:bg-purple-600/20 border border-purple-500/30 text-purple-400 font-bold rounded-xl transition-all">
                  Download CSV
                </button>
              </div>
              <button onClick={() => setShowClearConfirm(true)} className="w-full py-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold rounded-xl transition-all shadow-lg">Clear All Neural History</button>
            </div>
          </motion.div>
        );

      case 'Appearance':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2"><Palette className="w-6 h-6 text-purple-400" /> Interface Styling</h2>
            
            <div className="p-6 bg-[#0B1023] rounded-2xl border border-slate-800">
              <h3 className="text-lg font-bold text-white mb-4">Core Theme</h3>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setDarkMode(true)} className={`p-5 rounded-xl border flex flex-col items-center gap-3 transition-all ${darkMode ? 'border-purple-500 bg-purple-500/10' : 'border-slate-800 bg-black/40 hover:border-slate-700'}`}>
                  <Monitor className={`w-8 h-8 ${darkMode ? 'text-purple-400' : 'text-slate-600'}`} />
                  <span className={`text-sm font-bold ${darkMode ? 'text-purple-400' : 'text-slate-500'}`}>Deep Night</span>
                </button>
                <button onClick={() => setDarkMode(false)} className={`p-5 rounded-xl border flex flex-col items-center gap-3 transition-all ${!darkMode ? 'border-purple-500 bg-purple-500/10' : 'border-slate-800 bg-black/40 hover:border-slate-700'}`}>
                  <Globe className={`w-8 h-8 ${!darkMode ? 'text-purple-400' : 'text-slate-600'}`} />
                  <span className={`text-sm font-bold ${!darkMode ? 'text-purple-400' : 'text-slate-500'}`}>Atmosphere</span>
                </button>
              </div>
            </div>
          </motion.div>
        );

      case 'Language':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2"><Globe className="w-6 h-6 text-purple-400" /> Language Selection</h2>
            
            <div className="p-6 bg-[#0B1023] rounded-2xl border border-slate-800 space-y-3">
              {['English', 'Hindi', 'Urdu', 'Roman Urdu'].map((lang) => (
                <div key={lang} onClick={() => { setLanguage(lang); localStorage.setItem('smartai_language', lang); }} className={`p-4 rounded-xl border flex justify-between items-center cursor-pointer transition-all ${language === lang ? 'bg-purple-600/10 border-purple-500/40' : 'bg-[#050816] border-slate-800 hover:border-slate-700'}`}>
                  <span className={`font-bold ${language === lang ? 'text-purple-400' : 'text-slate-400'}`}>{lang}</span>
                  {language === lang && <Check className="w-5 h-5 text-purple-400" />}
                </div>
              ))}
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="w-full max-w-6xl h-[85vh] bg-[#050816] rounded-3xl border border-purple-500/30 shadow-2xl flex overflow-hidden relative">
          <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/10 rounded-full text-white transition-all z-50"><X className="w-6 h-6" /></button>

          {isLoading ? (
            <div className="w-full h-full flex flex-col items-center justify-center relative bg-[#050816]">
              <div className="w-20 h-20 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-6"></div>
              <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 animate-pulse">{loadingText}</h2>
            </div>
          ) : (
            <>
              {/* Sidebar */}
              <div className="w-72 bg-[#0B1023] border-r border-slate-800/50 flex flex-col h-full overflow-y-auto shrink-0">
                <div className="p-8 pb-4"><h2 className="text-xl font-black text-white">Settings <span className="text-purple-400">Hub</span></h2></div>
                <div className="p-4 space-y-1">
                  {TABS.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                      <button key={tab.id} onClick={() => { if (tab.id === 'Logout') setShowLogoutConfirm(true); else setActiveTab(tab.id); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all border ${isActive ? 'bg-purple-600/10 text-white border-purple-500/30 shadow-md' : 'text-slate-400 hover:bg-white/5 border-transparent'}`}>
                        <tab.icon className={`w-5 h-5 ${tab.color || (isActive ? 'text-purple-400' : '')}`} />
                        <span className="font-medium text-sm">{tab.id}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-10 bg-[#050816] relative no-scrollbar">
                <div className="absolute top-0 right-0 w-96 h-96 bg-purple-900/10 blur-[120px] rounded-full pointer-events-none" />
                <div className="max-w-4xl mx-auto relative z-10">{renderContent()}</div>
              </div>
            </>
          )}

          {/* Modals */}
          {showLogoutConfirm && (
            <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center">
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-[#0B1023] border border-red-500/30 p-8 rounded-2xl max-w-md w-full text-center">
                <LogOut className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Logout of SmartAI?</h3>
                <p className="text-slate-400 mb-8">Neural link will be disconnected. Sign-in required for return.</p>
                <div className="flex gap-4">
                  <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 py-3 bg-slate-800 text-white font-bold rounded-xl">Cancel</button>
                  <button onClick={onLogout} className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl shadow-lg">Logout</button>
                </div>
              </motion.div>
            </div>
          )}
          {showClearConfirm && (
            <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center">
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-[#0B1023] border border-red-500/30 p-8 rounded-2xl max-w-md w-full text-center">
                <h3 className="text-xl font-bold text-white mb-2">Clear Neural History?</h3>
                <p className="text-slate-400 mb-8">This action is irreversible. All chat and image records will be purged.</p>
                <div className="flex gap-4">
                  <button onClick={() => setShowClearConfirm(false)} className="flex-1 py-3 bg-slate-800 text-white font-bold rounded-xl">Cancel</button>
                  <button onClick={() => { onClearHistory?.(); setShowClearConfirm(false); }} className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl">Clear All</button>
                </div>
              </motion.div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
