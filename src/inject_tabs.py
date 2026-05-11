import os

file_path = "c:/Users/manis/OneDrive/Pictures/smartaipro-main/smartaipro-main/src/Settings.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

account_settings_content = """      case 'Account Settings':
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
"""

notifications_content = """      case 'Notifications':
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
"""

privacy_content = """      case 'Privacy':
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
"""

connected_content = """      case 'Connected Accounts':
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
"""

history_content = """      case 'History & Data':
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
"""

language_content = """      case 'Language':
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
"""

# Replace the default switch case with all the required cases
new_cases = f"{account_settings_content}\n{notifications_content}\n{privacy_content}\n{connected_content}\n{history_content}\n{language_content}\n      default:"

content = content.replace("      default:", new_cases)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
