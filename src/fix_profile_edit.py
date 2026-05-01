with open('App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add displayName and avatar states after imgQuality state
old_states = "const [imgQuality, setImgQuality] = useState('720p');\n  const chatEndRef = useRef<HTMLDivElement>(null);"
new_states = """const [imgQuality, setImgQuality] = useState('720p');
  const [displayName, setDisplayName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [tempName, setTempName] = useState('');
  const [tempAvatar, setTempAvatar] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);"""

content = content.replace(old_states, new_states)

# Update useEffect to load displayName and avatar
old_effect = "const saved = localStorage.getItem('smartai_session');\n    if (saved) { const d = JSON.parse(saved); setCredits(d.credits || 100); setEmail(d.email || ''); setPlan(d.plan || 'Basic'); setIsLoggedIn(true); }"
new_effect = "const saved = localStorage.getItem('smartai_session');\n    if (saved) { const d = JSON.parse(saved); setCredits(d.credits || 100); setEmail(d.email || ''); setPlan(d.plan || 'Basic'); setDisplayName(d.displayName || d.email?.split('@')[0] || 'User'); setAvatar(d.avatar || ''); setIsLoggedIn(true); }"

content = content.replace(old_effect, new_effect)

# Add save profile function before handleLogout
old_logout = "const handleLogout = () => { localStorage.removeItem('smartai_session'); window.location.reload(); };"
new_logout = """const handleLogout = () => { localStorage.removeItem('smartai_session'); window.location.reload(); };
  const handleSaveProfile = () => {
    const saved = localStorage.getItem('smartai_session');
    if (saved) {
      const d = JSON.parse(saved);
      d.displayName = tempName;
      d.avatar = tempAvatar;
      localStorage.setItem('smartai_session', JSON.stringify(d));
      setDisplayName(tempName);
      setAvatar(tempAvatar);
      setIsEditingProfile(false);
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
  const avatarColors = ['bg-indigo-600','bg-emerald-600','bg-rose-600','bg-amber-600','bg-cyan-600','bg-violet-600'];"""

content = content.replace(old_logout, new_logout)

# Update header avatar to use displayName and avatar
old_header_avatar = "<div className=\"w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center text-xs font-bold text-slate-400\">{email.charAt(0).toUpperCase()}</div>"
new_header_avatar = """<div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center text-xs font-bold text-slate-400 overflow-hidden">
                    {avatar ? <img src={avatar} alt="avatar" className="w-full h-full object-cover" /> : <span>{displayName.charAt(0).toUpperCase()}</span>}
                  </div>"""

content = content.replace(old_header_avatar, new_header_avatar)

# Replace entire profile section
old_profile = """          {activeTab === 'profile' && (
            <div className="max-w-3xl mx-auto">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 mb-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-2xl font-bold text-white">{email.charAt(0).toUpperCase()}</div>
                  <div>
                    <h2 className="text-xl font-bold">{email}</h2>
                    <span className="text-xs text-slate-500 uppercase tracking-widest font-mono">{plan} Plan</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-center">
                    <div className="text-3xl font-bold text-white">{credits.toLocaleString()}</div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Credits</div>
                  </div>
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-center">
                    <div className="text-3xl font-bold text-indigo-400">{plan}</div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Current Plan</div>
                  </div>
                </div>
                <button onClick={() => setIsPricingOpen(true)} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-xl font-bold text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2"><CreditCard className="w-5 h-5" /> Upgrade Plan</button>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">
                <h3 className="text-lg font-bold mb-4">Account</h3>
                <div className="space-y-3">
                  <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-slate-950 border border-slate-800 text-slate-400 hover:text-white py-3 rounded-xl transition-all text-xs uppercase tracking-widest font-bold"><LogOut className="w-4 h-4" /> Logout</button>
                </div>
              </div>
              <div className="mt-6">
                <AdBanner />
              </div>
            </div>
          )}"""

new_profile = """          {activeTab === 'profile' && (
            <div className="max-w-3xl mx-auto">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 mb-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center text-3xl font-bold text-white overflow-hidden border-2 border-indigo-500/30">
                        {avatar ? <img src={avatar} alt="avatar" className="w-full h-full object-cover" /> : <span>{displayName.charAt(0).toUpperCase()}</span>}
                      </div>
                      {isEditingProfile && (
                        <button onClick={() => fileInputRef.current?.click()} className="absolute -bottom-1 -right-1 w-7 h-7 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center hover:bg-indigo-600 transition-colors">
                          <Plus className="w-3 h-3 text-white" />
                        </button>
                      )}
                      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                    </div>
                    <div>
                      {isEditingProfile ? (
                        <input type="text" value={tempName} onChange={e => setTempName(e.target.value)} className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold text-lg outline-none focus:border-indigo-500" placeholder="Your name" />
                      ) : (
                        <h2 className="text-xl font-bold">{displayName}</h2>
                      )}
                      <span className="text-xs text-slate-500 uppercase tracking-widest font-mono">{email}</span>
                      <div className="mt-1"><span className="text-[10px] bg-indigo-600/20 text-indigo-400 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">{plan}</span></div>
                    </div>
                  </div>
                  {!isEditingProfile ? (
                    <button onClick={() => { setTempName(displayName); setTempAvatar(avatar); setIsEditingProfile(true); }} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"><span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Edit</span></button>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={() => setIsEditingProfile(false)} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"><span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Cancel</span></button>
                      <button onClick={handleSaveProfile} className="p-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"><span className="text-[10px] uppercase tracking-widest font-bold text-white">Save</span></button>
                    </div>
                  )}
                </div>
                {isEditingProfile && (
                  <div className="mb-6 p-4 bg-slate-950/50 border border-slate-800 rounded-2xl">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest block mb-3">Choose Avatar Color</span>
                    <div className="flex gap-3 flex-wrap">
                      {avatarColors.map((c, i) => (
                        <button key={i} onClick={() => setTempAvatar('')} className={`w-10 h-10 ${c} rounded-full flex items-center justify-center text-sm font-bold text-white border-2 transition-all ${!tempAvatar ? 'border-white scale-110' : 'border-transparent'}`}>
                          {tempName.charAt(0).toUpperCase() || 'U'}
                        </button>
                      ))}
                      <button onClick={() => fileInputRef.current?.click()} className="w-10 h-10 bg-slate-800 border-2 border-dashed border-slate-600 rounded-full flex items-center justify-center hover:border-indigo-500 transition-all">
                        <Plus className="w-4 h-4 text-slate-400" />
                      </button>
                    </div>
                    {tempAvatar && (
                      <div className="mt-3 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-700"><img src={tempAvatar} alt="preview" className="w-full h-full object-cover" /></div>
                        <span className="text-xs text-slate-400">Custom avatar selected</span>
                      </div>
                    )}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-center">
                    <div className="text-3xl font-bold text-white">{credits.toLocaleString()}</div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Credits</div>
                  </div>
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-center">
                    <div className="text-3xl font-bold text-indigo-400">{plan}</div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Current Plan</div>
                  </div>
                </div>
                <button onClick={() => setIsPricingOpen(true)} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-xl font-bold text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2"><CreditCard className="w-5 h-5" /> Upgrade Plan</button>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">
                <h3 className="text-lg font-bold mb-4">Account</h3>
                <div className="space-y-3">
                  <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-slate-950 border border-slate-800 text-slate-400 hover:text-white py-3 rounded-xl transition-all text-xs uppercase tracking-widest font-bold"><LogOut className="w-4 h-4" /> Logout</button>
                </div>
              </div>
              <div className="mt-6">
                <AdBanner />
              </div>
            </div>
          )}"""

content = content.replace(old_profile, new_profile)

with open('App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Profile editing feature added!')

