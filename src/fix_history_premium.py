with open('App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add premium styles tracking and history states
old_states = "const [tempAvatar, setTempAvatar] = useState('');\n  const chatEndRef = useRef<HTMLDivElement>(null);"
new_states = """const [tempAvatar, setTempAvatar] = useState('');
  const [imageHistory, setImageHistory] = useState<Array<{url: string; prompt: string; style: string; quality: string; aspect: string; date: string}>>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [freePremiumUses, setFreePremiumUses] = useState(10);
  const chatEndRef = useRef<HTMLDivElement>(null);"""

content = content.replace(old_states, new_states)

# 2. Update useEffect to load history and free uses
old_effect = "const saved = localStorage.getItem('smartai_session');\n    if (saved) { const d = JSON.parse(saved); setCredits(d.credits || 100); setEmail(d.email || ''); setPlan(d.plan || 'Basic'); setDisplayName(d.displayName || d.email?.split('@')[0] || 'User'); setAvatar(d.avatar || ''); setIsLoggedIn(true); }"
new_effect = "const saved = localStorage.getItem('smartai_session');\n    if (saved) { const d = JSON.parse(saved); setCredits(d.credits || 100); setEmail(d.email || ''); setPlan(d.plan || 'Basic'); setDisplayName(d.displayName || d.email?.split('@')[0] || 'User'); setAvatar(d.avatar || ''); setFreePremiumUses(d.freePremiumUses !== undefined ? d.freePremiumUses : 10); setIsLoggedIn(true); }\n    const hist = localStorage.getItem('smartai_image_history');\n    if (hist) { setImageHistory(JSON.parse(hist)); }"

content = content.replace(old_effect, new_effect)

# 3. Add premium styles definition and helper function
old_avatar_colors = "const avatarColors = ['bg-indigo-600','bg-emerald-600','bg-rose-600','bg-amber-600','bg-cyan-600','bg-violet-600'];"
new_avatar_colors = """const avatarColors = ['bg-indigo-600','bg-emerald-600','bg-rose-600','bg-amber-600','bg-cyan-600','bg-violet-600'];
  const PREMIUM_STYLES = ['anime','cyberpunk','3d render','minecraft'];
  const isStyleLocked = (style: string) => {
    if (style === 'realistic') return false;
    if (plan !== 'Basic') return false;
    if (freePremiumUses > 0) return false;
    return PREMIUM_STYLES.includes(style);
  };"""

content = content.replace(old_avatar_colors, new_avatar_colors)

# 4. Update handleGenerateImage to save history and track free uses
old_generate = """  const handleGenerateImage = async () => {
    if (!imgPrompt.trim() || isGenerating) return;
    if (credits < 5) { alert('Insufficient credits (5 required).'); setIsPricingOpen(true); return; }
    setIsGenerating(true); setCredits(p => p - 5); setGeneratedImg(null);
    const url = generateFreeImage();
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => { setGeneratedImg(url); setIsGenerating(false); };
    img.onerror = () => { setCredits(p => p + 5); alert('Image generation failed. Try a different prompt or smaller size.'); setIsGenerating(false); };
    img.src = url;
  };"""

new_generate = """  const handleGenerateImage = async () => {
    if (!imgPrompt.trim() || isGenerating) return;
    if (isStyleLocked(imgStyle)) { alert('This style requires Pro plan or you have used all 10 free premium generations.'); setIsPricingOpen(true); return; }
    if (credits < 5) { alert('Insufficient credits (5 required).'); setIsPricingOpen(true); return; }
    setIsGenerating(true); setCredits(p => p - 5); setGeneratedImg(null);
    const url = generateFreeImage();
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setGeneratedImg(url);
      setIsGenerating(false);
      const newItem = { url, prompt: imgPrompt, style: imgStyle, quality: imgQuality, aspect: imgAspect, date: new Date().toLocaleString() };
      const newHistory = [newItem, ...imageHistory].slice(0, 50);
      setImageHistory(newHistory);
      localStorage.setItem('smartai_image_history', JSON.stringify(newHistory));
      if (plan === 'Basic' && PREMIUM_STYLES.includes(imgStyle) && freePremiumUses > 0) {
        const newUses = freePremiumUses - 1;
        setFreePremiumUses(newUses);
        const saved = localStorage.getItem('smartai_session');
        if (saved) { const d = JSON.parse(saved); d.freePremiumUses = newUses; localStorage.setItem('smartai_session', JSON.stringify(d)); }
      }
    };
    img.onerror = () => { setCredits(p => p + 5); alert('Image generation failed. Try a different prompt or smaller size.'); setIsGenerating(false); };
    img.src = url;
  };"""

content = content.replace(old_generate, new_generate)

# 5. Update Style dropdown to show lock icons
old_style_select = '''                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest block mb-2">Style</label>
                    <select value={imgStyle} onChange={e => setImgStyle(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500/50 transition-all appearance-none cursor-pointer">
                      {STYLES.map(s => (<option key={s} value={s}>{s}</option>))}
                    </select>
                  </div>'''

new_style_select = '''                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest block mb-2">Style {plan === 'Basic' && freePremiumUses > 0 && <span className="text-indigo-400 ml-1">({freePremiumUses} free left)</span>}</label>
                    <select value={imgStyle} onChange={e => {
                      const s = e.target.value;
                      if (isStyleLocked(s)) { setIsPricingOpen(true); } else { setImgStyle(s); }
                    }} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500/50 transition-all appearance-none cursor-pointer">
                      {STYLES.map(s => {
                        const locked = isStyleLocked(s);
                        return (<option key={s} value={s} className={locked ? 'text-slate-600' : 'text-white'}>{s}{locked ? ' 🔒 PRO' : PREMIUM_STYLES.includes(s) && plan === 'Basic' ? ' ⭐' : ''}</option>);
                      })}
                    </select>
                  </div>'''

content = content.replace(old_style_select, new_style_select)

# 6. Add History section below generated image
old_generated = '''              {generatedImg && (<motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative group"><img src={generatedImg} alt="Generated" className="w-full rounded-3xl border border-slate-800 shadow-2xl" /><a href={generatedImg} download className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm p-3 rounded-xl opacity-0 group-hover:opacity-100 transition-all"><Download className="w-5 h-5 text-white" /></a></motion.div>)}'''

new_generated = '''              {generatedImg && (<motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative group"><img src={generatedImg} alt="Generated" className="w-full rounded-3xl border border-slate-800 shadow-2xl" /><a href={generatedImg} download className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm p-3 rounded-xl opacity-0 group-hover:opacity-100 transition-all"><Download className="w-5 h-5 text-white" /></a></motion.div>)}
              {imageHistory.length > 0 && (
                <div className="mt-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold">Generation History</h3>
                    <button onClick={() => setShowHistory(!showHistory)} className="text-[10px] uppercase tracking-widest font-bold text-indigo-400 hover:text-indigo-300 transition-colors">{showHistory ? 'Hide' : 'Show All'}</button>
                  </div>
                  <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 ${showHistory ? '' : 'max-h-48 overflow-hidden'}`}>
                    {imageHistory.map((item, i) => (
                      <div key={i} className="relative group rounded-xl overflow-hidden border border-slate-800 bg-slate-900">
                        <img src={item.url} alt={item.prompt} className="w-full aspect-square object-cover" loading="lazy" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center p-2">
                          <span className="text-[9px] text-slate-300 text-center line-clamp-2 mb-2">{item.prompt}</span>
                          <span className="text-[8px] text-slate-500 mb-2">{item.style} | {item.quality}</span>
                          <a href={item.url} download className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-lg transition-colors"><Download className="w-4 h-4" /></a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}'''

content = content.replace(old_generated, new_generated)

with open('App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('History and Premium styles applied!')

