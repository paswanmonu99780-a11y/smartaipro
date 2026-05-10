import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, Settings as SettingsIcon, Shield, Palette, Bell, 
  Cpu, Lock, CreditCard, Link as LinkIcon, History, 
  Globe, LogOut, Upload, Check, X, Eye, EyeOff, Smartphone, Monitor
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
}

export default function Settings({ onClose, onLogout, userEmail, userName, userAvatar, plan, credits, imageHistory = [], chatHistory = [], messages = [], onDisplayNameChange, onAvatarChange, onClearHistory }: SettingsProps) {
  const [activeTab, setActiveTab] = useState('Profile Settings');
  const [isLoading, setIsLoading] = useState(true);
  const [loadingText, setLoadingText] = useState('Loading User Preferences...');

  // Forms State
  const [profileData, setProfileData] = useState({ name: userName, username: userName.toLowerCase().replace(/\s/g, ''), bio: 'AI Enthusiast & Creator', email: userEmail, phone: '', country: 'India' });
  
  // Password State
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [passwordMsg, setPasswordMsg] = useState('');

  // Preferences
  const [darkMode, setDarkMode] = useState(true);
  const [aiModel, setAiModel] = useState('Gemini 3.1 Pro (High)');

  // Logout Confirmation
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [notifState, setNotifState] = useState(() => { try { return JSON.parse(localStorage.getItem('smartai_notif') || 'null') || {email:true,ai:true,features:false,security:true,marketing:false}; } catch { return {email:true,ai:true,features:false,security:true,marketing:false}; }});
  const [privacyState, setPrivacyState] = useState(() => { try { return JSON.parse(localStorage.getItem('smartai_privacy') || 'null') || {privateHistory:true,publicProfile:false,dataSharing:true,aiTraining:false}; } catch { return {privateHistory:true,publicProfile:false,dataSharing:true,aiTraining:false}; }});
  const [language, setLanguage] = useState(() => localStorage.getItem('smartai_language') || 'English');
  const [aiPrefs, setAiPrefs] = useState(() => { try { return JSON.parse(localStorage.getItem('smartai_ai_prefs') || 'null') || {fastMode:false,autoSave:true,creativity:70}; } catch { return {fastMode:false,autoSave:true,creativity:70}; }});
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setLoadingText('Syncing SmartAI Settings...');
    }, 800);
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  }, []);

  const TABS = [
    { id: 'Profile Settings', icon: User },
    { id: 'Account Settings', icon: SettingsIcon },
    { id: 'Security', icon: Shield },
    { id: 'Appearance', icon: Palette },
    { id: 'Notifications', icon: Bell },
    { id: 'AI Preferences', icon: Cpu },
    { id: 'Privacy', icon: Lock },
    { id: 'Billing & Subscription', icon: CreditCard },
    { id: 'Connected Accounts', icon: LinkIcon },
    { id: 'History & Data', icon: History },
    { id: 'Language', icon: Globe },
    { id: 'Logout', icon: LogOut, color: 'text-red-500' }
  ];

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      setPasswordStatus('error');
      setPasswordMsg('Passwords do not match');
      return;
    }
    // basic validation
    const hasUpper = /[A-Z]/.test(newPassword);
    const hasNum = /[0-9]/.test(newPassword);
    const hasSym = /[^A-Za-z0-9]/.test(newPassword);
    if (newPassword.length < 8 || !hasUpper || !hasNum || !hasSym) {
      setPasswordStatus('error');
      setPasswordMsg('Weak Password. Follow the rules.');
      return;
    }
    
    // Attempt update
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      setPasswordStatus('error');
      setPasswordMsg(error.message);
    } else {
      setPasswordStatus('success');
      setPasswordMsg('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordStatus('idle'), 3000);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Profile Settings':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2"><User className="w-6 h-6 text-purple-400" /> Profile Settings</h2>
            
            <div className="flex items-center gap-6 p-6 bg-[#0B1023] rounded-2xl border border-purple-500/20 shadow-[0_0_15px_rgba(123,97,255,0.1)]">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-purple-500 shadow-[0_0_15px_rgba(123,97,255,0.4)]">
                  {userAvatar ? <img src={userAvatar} alt="Avatar" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-purple-900/50 flex items-center justify-center text-3xl font-bold text-purple-300">{userName.charAt(0)}</div>}
                </div>
                <div className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm">
                  <Upload className="w-6 h-6 text-white mb-1" />
                  <span className="text-[10px] text-white font-medium">Upload</span>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{profileData.name}</h3>
                <p className="text-slate-400 text-sm">@{profileData.username}</p>
                <div className="flex gap-3 mt-3">
                  <button className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-lg transition-all shadow-[0_0_10px_rgba(123,97,255,0.3)]">Upload Photo</button>
                  <button className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-medium rounded-lg transition-all">Remove</button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mt-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Full Name</label>
                <input type="text" value={profileData.name} onChange={e => setProfileData({...profileData, name: e.target.value})} className="w-full bg-[#0B1023] border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Username</label>
                <input type="text" value={profileData.username} onChange={e => setProfileData({...profileData, username: e.target.value})} className="w-full bg-[#0B1023] border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all" />
              </div>
              <div className="space-y-2 col-span-2">
                <label className="text-sm font-medium text-slate-400">Bio</label>
                <textarea rows={3} value={profileData.bio} onChange={e => setProfileData({...profileData, bio: e.target.value})} className="w-full bg-[#0B1023] border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"></textarea>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Email Address</label>
                <input type="email" value={profileData.email} disabled className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-slate-400 cursor-not-allowed" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Phone Number</label>
                <input type="text" placeholder="+1 234 567 890" value={profileData.phone} onChange={e => setProfileData({...profileData, phone: e.target.value})} className="w-full bg-[#0B1023] border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all" />
              </div>
              <div className="space-y-2 col-span-2">
                <label className="text-sm font-medium text-slate-400">Country</label>
                <select value={profileData.country} onChange={e => setProfileData({...profileData, country: e.target.value})} className="w-full bg-[#0B1023] border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all appearance-none">
                  <option>India</option>
                  <option>United States</option>
                  <option>United Kingdom</option>
                  <option>Canada</option>
                  <option>Australia</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(123,97,255,0.4)] flex items-center gap-2">
                <Check className="w-5 h-5" /> Save Changes
              </button>
            </div>
          </motion.div>
        );
      
      case 'Security':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
             <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2"><Shield className="w-6 h-6 text-purple-400" /> Security Settings</h2>
             
             {/* Change Password Card */}
             <div className="p-6 bg-[#0B1023] rounded-2xl border border-slate-800 hover:border-cyan-500/50 transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)]">
               <h3 className="text-lg font-bold text-white mb-4">Change Password</h3>
               
               <div className="space-y-4">
                 <div className="space-y-2">
                   <label className="text-sm font-medium text-slate-400">Current Password</label>
                   <div className="relative">
                     <input type={showCurrentPassword ? "text" : "password"} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full bg-[#050816] border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all" />
                     <button onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-4 top-3 text-slate-400 hover:text-white">
                       {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                     </button>
                   </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <label className="text-sm font-medium text-slate-400">New Password</label>
                     <div className="relative">
                       <input type={showNewPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full bg-[#050816] border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all" />
                       <button onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-4 top-3 text-slate-400 hover:text-white">
                         {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                       </button>
                     </div>
                     <div className="flex gap-2 text-xs mt-2">
                        <span className={`${newPassword.length >= 8 ? 'text-green-400' : 'text-slate-500'}`}>✔ Min 8 chars</span>
                        <span className={`${/[A-Z]/.test(newPassword) ? 'text-green-400' : 'text-slate-500'}`}>✔ 1 Uppercase</span>
                        <span className={`${/[0-9]/.test(newPassword) ? 'text-green-400' : 'text-slate-500'}`}>✔ 1 Number</span>
                        <span className={`${/[^A-Za-z0-9]/.test(newPassword) ? 'text-green-400' : 'text-slate-500'}`}>✔ 1 Symbol</span>
                     </div>
                   </div>
                   <div className="space-y-2">
                     <label className="text-sm font-medium text-slate-400">Confirm New Password</label>
                     <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full bg-[#050816] border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all" />
                   </div>
                 </div>

                 {passwordStatus !== 'idle' && (
                   <div className={`p-3 rounded-lg text-sm font-bold ${passwordStatus === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                     {passwordMsg}
                   </div>
                 )}

                 <div className="pt-2">
                   <button onClick={handlePasswordChange} className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                     Update Password
                   </button>
                 </div>
               </div>
             </div>

             {/* 2FA Card */}
             <div className="p-6 bg-[#0B1023] rounded-2xl border border-slate-800 flex justify-between items-center">
               <div>
                 <h3 className="text-lg font-bold text-white">Two-Factor Authentication</h3>
                 <p className="text-sm text-slate-400 mt-1">Add an extra layer of security to your account.</p>
               </div>
               <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition-all">Enable 2FA</button>
             </div>

             {/* Login Activity */}
             <div className="p-6 bg-[#0B1023] rounded-2xl border border-slate-800">
               <h3 className="text-lg font-bold text-white mb-4">Login Activity</h3>
               <div className="space-y-4">
                 <div className="flex items-center justify-between p-4 bg-[#050816] rounded-xl border border-slate-800/50">
                   <div className="flex items-center gap-4">
                     <div className="p-2 bg-purple-500/10 rounded-lg"><Monitor className="w-6 h-6 text-purple-400" /></div>
                     <div>
                       <div className="text-white font-bold text-sm">Windows • Chrome</div>
                       <div className="text-xs text-slate-400">Current Session • India</div>
                     </div>
                   </div>
                   <span className="text-xs font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded">Active</span>
                 </div>
                 <div className="flex items-center justify-between p-4 bg-[#050816] rounded-xl border border-slate-800/50">
                   <div className="flex items-center gap-4">
                     <div className="p-2 bg-slate-800 rounded-lg"><Smartphone className="w-6 h-6 text-slate-400" /></div>
                     <div>
                       <div className="text-white font-bold text-sm">iPhone 14 Pro • Safari</div>
                       <div className="text-xs text-slate-400">Yesterday • India</div>
                     </div>
                   </div>
                   <button className="text-xs font-bold text-red-400 hover:text-red-300">Logout</button>
                 </div>
               </div>
               <button className="w-full mt-4 py-3 bg-red-500/10 text-red-400 hover:bg-red-500/20 font-bold rounded-xl transition-all">Logout All Other Devices</button>
             </div>
          </motion.div>
        );
      
      case 'Billing & Subscription':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2"><CreditCard className="w-6 h-6 text-purple-400" /> Billing & Subscription</h2>
            
            <div className="p-6 bg-gradient-to-br from-[#0B1023] to-[#1a103c] rounded-2xl border border-purple-500/30 shadow-[0_0_30px_rgba(123,97,255,0.15)] relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-purple-500/20 blur-3xl rounded-full"></div>
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <div className="text-sm font-bold text-purple-400 uppercase tracking-widest mb-1">Current Plan</div>
                  <h3 className="text-3xl font-black text-white">{plan}</h3>
                  <p className="text-slate-400 text-sm mt-2">Your subscription renews on <span className="text-white">Next Month</span></p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-slate-400 mb-1">Remaining Credits</div>
                  <div className="text-2xl font-black text-cyan-400">{credits >= 9999999 ? 'Unlimited' : credits.toLocaleString()}</div>
                </div>
              </div>
              
              <div className="flex gap-4 mt-8 relative z-10">
                <button className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(123,97,255,0.4)]">Upgrade Plan</button>
                <button className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all">Download Invoice</button>
              </div>
            </div>

            <div className="p-6 bg-[#0B1023] rounded-2xl border border-slate-800 mt-6">
              <h3 className="text-lg font-bold text-white mb-4">Payment Method</h3>
              <div className="flex items-center justify-between p-4 bg-[#050816] rounded-xl border border-slate-800">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-8 bg-slate-800 rounded flex items-center justify-center text-xs font-bold text-white">VISA</div>
                  <div>
                    <div className="text-white font-bold">•••• •••• •••• 4242</div>
                    <div className="text-xs text-slate-400">Expires 12/28</div>
                  </div>
                </div>
                <button className="text-sm text-purple-400 font-bold hover:text-purple-300">Edit</button>
              </div>
            </div>
          </motion.div>
        );

      case 'Appearance':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2"><Palette className="w-6 h-6 text-purple-400" /> Appearance Settings</h2>
            
            <div className="p-6 bg-[#0B1023] rounded-2xl border border-slate-800">
              <h3 className="text-lg font-bold text-white mb-4">Theme Preferences</h3>
              <div className="grid grid-cols-3 gap-4">
                <button onClick={() => setDarkMode(true)} className={`p-4 rounded-xl border ${darkMode ? 'border-purple-500 bg-purple-500/10' : 'border-slate-800 bg-[#050816] hover:border-slate-700'} flex flex-col items-center gap-3 transition-all`}>
                  <div className="w-16 h-12 bg-slate-900 rounded-lg border border-slate-700 overflow-hidden flex">
                    <div className="w-1/3 bg-slate-950"></div><div className="w-2/3 bg-slate-900"></div>
                  </div>
                  <span className={`text-sm font-bold ${darkMode ? 'text-purple-400' : 'text-slate-400'}`}>Dark Mode</span>
                </button>
                <button onClick={() => setDarkMode(false)} className={`p-4 rounded-xl border ${!darkMode ? 'border-purple-500 bg-purple-500/10' : 'border-slate-800 bg-[#050816] hover:border-slate-700'} flex flex-col items-center gap-3 transition-all`}>
                  <div className="w-16 h-12 bg-white rounded-lg border border-slate-200 overflow-hidden flex">
                    <div className="w-1/3 bg-slate-100"></div><div className="w-2/3 bg-white"></div>
                  </div>
                  <span className={`text-sm font-bold ${!darkMode ? 'text-purple-400' : 'text-slate-400'}`}>Light Mode</span>
                </button>
                <button className="p-4 rounded-xl border border-slate-800 bg-[#050816] hover:border-slate-700 flex flex-col items-center gap-3 transition-all opacity-50 cursor-not-allowed">
                  <div className="w-16 h-12 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-lg"></div>
                  <span className="text-sm font-bold text-slate-400">Cyberpunk (Pro)</span>
                </button>
              </div>
            </div>
            
            <div className="p-6 bg-[#0B1023] rounded-2xl border border-slate-800">
              <h3 className="text-lg font-bold text-white mb-4">UI Controls</h3>
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-slate-400 flex justify-between"><span>Animation Speed</span> <span className="text-white">Normal</span></label>
                  <input type="range" className="w-full mt-2 accent-purple-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-400 flex justify-between"><span>Font Size</span> <span className="text-white">Medium</span></label>
                  <input type="range" className="w-full mt-2 accent-purple-500" />
                </div>
              </div>
            </div>
          </motion.div>
        );
        
      case 'AI Preferences':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2"><Cpu className="w-6 h-6 text-purple-400" /> AI Preferences</h2>
            
            <div className="p-6 bg-[#0B1023] rounded-2xl border border-slate-800">
              <h3 className="text-lg font-bold text-white mb-4">Model Selection</h3>
              <select value={aiModel} onChange={(e) => setAiModel(e.target.value)} className="w-full bg-[#050816] border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-all appearance-none">
                <option>Gemini 3.1 Pro (High)</option>
                <option>GPT-4o (Premium)</option>
                <option>Claude 3.5 Sonnet (Fast)</option>
              </select>
            </div>
            
            <div className="p-6 bg-[#0B1023] rounded-2xl border border-slate-800 space-y-6">
              <h3 className="text-lg font-bold text-white mb-2">Generation Settings</h3>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-bold">Fast Mode</div>
                  <div className="text-xs text-slate-400">Prioritize speed over complex reasoning</div>
                </div>
                <div className="w-12 h-6 bg-purple-600 rounded-full relative cursor-pointer">
                  <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-bold">Auto Save History</div>
                  <div className="text-xs text-slate-400">Automatically save all generations to History</div>
                </div>
                <div className="w-12 h-6 bg-purple-600 rounded-full relative cursor-pointer">
                  <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-slate-400 flex justify-between"><span>Creativity Level</span> <span className="text-white">High (80%)</span></label>
                <input type="range" defaultValue="80" className="w-full mt-2 accent-cyan-500" />
              </div>
            </div>
          </motion.div>
        );

      case 'Account Settings':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2"><SettingsIcon className="w-6 h-6 text-purple-400" /> Account Settings</h2>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="p-6 bg-[#0B1023] rounded-2xl border border-slate-800 space-y-4">
                <h3 className="text-lg font-bold text-white mb-2">Email Settings</h3>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400">Current Email</label>
                  <input type="email" value={userEmail} disabled className="w-full bg-[#050816] border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-all opacity-70" />
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold rounded-lg transition-all">Change Email</button>
                  <button className="flex-1 py-2 bg-green-500/10 text-green-400 border border-green-500/20 text-sm font-bold rounded-lg transition-all">Verify Email</button>
                </div>
              </div>
              
              <div className="p-6 bg-[#0B1023] rounded-2xl border border-slate-800 space-y-4">
                <h3 className="text-lg font-bold text-white mb-2">Account Status</h3>
                <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                  <span className="text-green-400 font-bold text-sm">Active & Verified</span>
                  <Check className="w-5 h-5 text-green-400" />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm"><span className="text-slate-400">Plan Type</span><span className="text-white font-bold">{plan}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-slate-400">Credits Remaining</span><span className="text-cyan-400 font-bold">{credits >= 9999999 ? 'Unlimited' : credits.toLocaleString()}</span></div>
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-[#0B1023] rounded-2xl border border-slate-800 mt-6">
              <h3 className="text-lg font-bold text-white mb-4">Usage Statistics</h3>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="p-4 bg-[#050816] rounded-xl border border-slate-800 text-center">
                  <div className="text-2xl font-black text-purple-400">1,240</div>
                  <div className="text-xs text-slate-500 font-bold uppercase mt-1">AI Generations</div>
                </div>
                <div className="p-4 bg-[#050816] rounded-xl border border-slate-800 text-center">
                  <div className="text-2xl font-black text-cyan-400">342</div>
                  <div className="text-xs text-slate-500 font-bold uppercase mt-1">Images Created</div>
                </div>
                <div className="p-4 bg-[#050816] rounded-xl border border-slate-800 text-center">
                  <div className="text-2xl font-black text-emerald-400">89</div>
                  <div className="text-xs text-slate-500 font-bold uppercase mt-1">Projects Saved</div>
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-red-500/5 rounded-2xl border border-red-500/20 mt-6">
              <h3 className="text-lg font-bold text-red-400 mb-2">Danger Zone</h3>
              <p className="text-sm text-slate-400 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
              <button className="px-6 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold rounded-xl transition-all">Delete Account</button>
            </div>
          </motion.div>
        );

      case 'Notifications':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2"><Bell className="w-6 h-6 text-purple-400" /> Notification Settings</h2>
            
            <div className="p-6 bg-[#0B1023] rounded-2xl border border-slate-800 space-y-6">
              {[
                { title: 'Email Notifications', desc: 'Receive daily and weekly activity summaries.', active: true },
                { title: 'AI Alerts', desc: 'Get notified when your long-running AI tasks complete.', active: true },
                { title: 'Feature Updates', desc: 'News about the latest SmartAI Pro features.', active: false },
                { title: 'Security Alerts', desc: 'Get alerts for new logins and security events.', active: true },
                { title: 'Marketing Emails', desc: 'Receive special offers and promotional content.', active: false },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between pb-4 border-b border-slate-800/50 last:border-0 last:pb-0">
                  <div>
                    <div className="text-white font-bold">{item.title}</div>
                    <div className="text-xs text-slate-400 mt-1">{item.desc}</div>
                  </div>
                  <div className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${item.active ? 'bg-purple-600' : 'bg-slate-700'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${item.active ? 'right-1' : 'left-1'}`}></div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        );

      case 'Privacy':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2"><Lock className="w-6 h-6 text-purple-400" /> Privacy Settings</h2>
            
            <div className="p-6 bg-[#0B1023] rounded-2xl border border-slate-800 space-y-6">
              {[
                { title: 'Private History', desc: 'Keep your generated content hidden from public galleries.', active: true },
                { title: 'Public Profile', desc: 'Allow others to view your profile and shared creations.', active: false },
                { title: 'Data Sharing', desc: 'Share anonymous usage data to help us improve.', active: true },
                { title: 'AI Training Permission', desc: 'Allow your generations to be used for model training.', active: false },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between pb-4 border-b border-slate-800/50 last:border-0 last:pb-0">
                  <div>
                    <div className="text-white font-bold">{item.title}</div>
                    <div className="text-xs text-slate-400 mt-1">{item.desc}</div>
                  </div>
                  <div className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${item.active ? 'bg-purple-600' : 'bg-slate-700'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${item.active ? 'right-1' : 'left-1'}`}></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-4 mt-6">
              <button className="flex-1 py-4 bg-[#0B1023] hover:bg-slate-800 border border-slate-700 text-white font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)]">Download My Data</button>
              <button className="flex-1 py-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(239,68,68,0.2)]">Delete History</button>
            </div>
          </motion.div>
        );

      case 'Connected Accounts':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2"><LinkIcon className="w-6 h-6 text-purple-400" /> Connected Accounts</h2>
            
            <div className="p-6 bg-[#0B1023] rounded-2xl border border-slate-800 space-y-4">
              {[
                { name: 'Google', connected: true, id: userEmail, color: 'text-red-400' },
                { name: 'GitHub', connected: false, id: '', color: 'text-white' },
                { name: 'Discord', connected: true, id: 'SmartAI#1234', color: 'text-indigo-400' },
                { name: 'Facebook', connected: false, id: '', color: 'text-blue-500' },
                { name: 'Twitter/X', connected: false, id: '', color: 'text-slate-200' },
              ].map((acc, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-[#050816] rounded-xl border border-slate-800/50">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-lg ${acc.color}`}>{acc.name.charAt(0)}</div>
                    <div>
                      <div className="text-white font-bold">{acc.name}</div>
                      {acc.connected ? <div className="text-xs text-slate-400">{acc.id}</div> : <div className="text-xs text-slate-500">Not connected</div>}
                    </div>
                  </div>
                  <button className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${acc.connected ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_10px_rgba(123,97,255,0.4)]'}`}>
                    {acc.connected ? 'Disconnect' : 'Connect'}
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        );

      case 'History & Data':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2"><History className="w-6 h-6 text-purple-400" /> History & Data</h2>
            
            <div className="grid grid-cols-2 gap-4">
              {[
                { title: 'AI Generations', count: '1,240', color: 'purple' },
                { title: 'Saved Projects', count: '89', color: 'cyan' },
                { title: 'Created Memes', count: '34', color: 'pink' },
                { title: 'Generated Code', count: '156 files', color: 'emerald' },
                { title: 'Character Creations', count: '12', color: 'orange' },
                { title: 'Voice Clones', count: '3', color: 'blue' },
              ].map((item, i) => (
                <div key={i} className="p-5 bg-[#0B1023] rounded-2xl border border-slate-800 flex items-center justify-between">
                  <div className="text-slate-300 font-bold">{item.title}</div>
                  <div className={`text-xl font-black text-${item.color}-400`}>{item.count}</div>
                </div>
              ))}
            </div>

            <div className="flex gap-4 mt-6">
              <button className="flex-1 py-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(123,97,255,0.4)]">Export History (CSV)</button>
              <button className="flex-1 py-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(239,68,68,0.2)]">Clear All Data</button>
            </div>
          </motion.div>
        );

      case 'Language':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2"><Globe className="w-6 h-6 text-purple-400" /> Language Settings</h2>
            
            <div className="p-6 bg-[#0B1023] rounded-2xl border border-slate-800">
              <h3 className="text-lg font-bold text-white mb-4">Interface Language</h3>
              <div className="space-y-3">
                {['English', 'Hindi', 'Urdu', 'Roman Urdu'].map((lang, i) => (
                  <div key={i} className={`p-4 rounded-xl border flex justify-between items-center cursor-pointer transition-all ${i === 0 ? 'bg-purple-600/10 border-purple-500/50' : 'bg-[#050816] border-slate-800 hover:border-slate-700'}`}>
                    <span className={`font-bold ${i === 0 ? 'text-purple-400' : 'text-slate-300'}`}>{lang}</span>
                    {i === 0 && <Check className="w-5 h-5 text-purple-400" />}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        );

      default:
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-full text-center">
            <SettingsIcon className="w-16 h-16 text-slate-700 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">{activeTab}</h3>
            <p className="text-slate-400">This section is being updated with futuristic new features.</p>
          </motion.div>
        );
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 md:p-8"
      >
        <motion.div 
          initial={{ scale: 0.95, y: 20 }} 
          animate={{ scale: 1, y: 0 }} 
          exit={{ scale: 0.95, y: 20 }}
          className="w-full max-w-6xl h-[90vh] bg-[#050816] rounded-3xl border border-purple-500/30 shadow-[0_0_50px_rgba(123,97,255,0.15)] flex overflow-hidden relative"
        >
          {/* Close Button */}
          <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/10 rounded-full text-white transition-all z-50">
            <X className="w-6 h-6" />
          </button>

          {isLoading ? (
            <div className="w-full h-full flex flex-col items-center justify-center relative">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-[#050816] to-[#050816]"></div>
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-20 h-20 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-6 shadow-[0_0_30px_rgba(123,97,255,0.5)]"></div>
                <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 animate-pulse">{loadingText}</h2>
              </div>
            </div>
          ) : (
            <>
              {/* Left Sidebar */}
              <div className="w-72 bg-[#0B1023] border-r border-slate-800/50 flex flex-col h-full overflow-y-auto no-scrollbar shrink-0">
                <div className="p-6 pb-2">
                  <h2 className="text-xl font-black text-white tracking-wide">Settings <span className="text-purple-400">Hub</span></h2>
                </div>
                
                <div className="p-4 space-y-1">
                  {TABS.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                      <button 
                        key={tab.id}
                        onClick={() => {
                          if (tab.id === 'Logout') {
                            setShowLogoutConfirm(true);
                          } else {
                            setActiveTab(tab.id);
                          }
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative overflow-hidden group ${isActive ? 'bg-purple-600/10 text-white border border-purple-500/30 shadow-[0_0_15px_rgba(123,97,255,0.2)]' : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'}`}
                      >
                        {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500 shadow-[0_0_10px_rgba(123,97,255,1)]"></div>}
                        <tab.icon className={`w-5 h-5 ${tab.color ? tab.color : (isActive ? 'text-purple-400 drop-shadow-[0_0_8px_rgba(123,97,255,0.8)]' : '')}`} />
                        <span className="font-medium text-sm z-10">{tab.id}</span>
                        {isActive && <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-purple-600/5 to-purple-600/0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 overflow-y-auto p-8 relative">
                {/* Background Glows */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-purple-900/10 blur-[100px] rounded-full pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-900/10 blur-[100px] rounded-full pointer-events-none"></div>
                
                <div className="max-w-4xl mx-auto relative z-10">
                  {renderContent()}
                </div>
              </div>
            </>
          )}

          {/* Clear History Confirm Modal */}
          {showClearConfirm && (
            <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#0B1023] border border-red-500/30 p-8 rounded-2xl max-w-md w-full shadow-[0_0_30px_rgba(239,68,68,0.2)] text-center">
                <h3 className="text-xl font-bold text-white mb-2">Clear All Data?</h3>
                <p className="text-slate-400 mb-6">This will delete all your chat and image history permanently.</p>
                <div className="flex gap-4">
                  <button onClick={() => setShowClearConfirm(false)} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all">Cancel</button>
                  <button onClick={() => { onClearHistory && onClearHistory(); setShowClearConfirm(false); }} className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-all">Clear All</button>
                </div>
              </motion.div>
            </div>
          )}
          {/* Logout Confirmation Modal */}
          {showLogoutConfirm && (
            <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#0B1023] border border-red-500/30 p-8 rounded-2xl max-w-md w-full shadow-[0_0_30px_rgba(239,68,68,0.2)] text-center">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <LogOut className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Are you sure you want to logout?</h3>
                <p className="text-slate-400 mb-8">You will need to login again to access your SmartAI workspace.</p>
                <div className="flex gap-4">
                  <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all">Cancel</button>
                  <button onClick={() => { setShowLogoutConfirm(false); onLogout(); }} className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(239,68,68,0.4)]">Logout</button>
                </div>
              </motion.div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
