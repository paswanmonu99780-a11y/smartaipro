with open('App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove Upgrade Plan and Disconnect buttons from sidebar
old_sidebar_footer = '''        <div className="mt-auto pt-6 border-t border-slate-800">
          <button onClick={() => setIsPricingOpen(true)} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all mb-4">Upgrade Plan</button>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 text-slate-500 hover:text-white py-3 rounded-xl transition-all text-xs uppercase tracking-widest font-bold"><LogOut className="w-4 h-4" /> Disconnect</button>
        </div>'''

new_sidebar_footer = '''        <div className="mt-auto pt-6 border-t border-slate-800">
          <div className="text-[9px] text-slate-600 uppercase tracking-widest font-mono text-center">SmartAI Pro v2.4</div>
        </div>'''

content = content.replace(old_sidebar_footer, new_sidebar_footer)

# 2. Change "Disconnect" to "Logout" in profile
content = content.replace('> Disconnect</button>', '> Logout</button>')

# 3. For image quality - show all qualities with Pro badge on locked ones
old_quality = '''                  <div><span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest block mb-2">Quality</span><div className="flex gap-2 flex-wrap">{(({ Basic: ['720p'], Pro: ['720p','1080p','2K'], Ultra: ['720p','1080p','2K','4K'] } as any)[plan] || ['720p']).map((q: string) => (<button key={q} onClick={() => setImgQuality(q)} className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${imgQuality === q ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-800 text-slate-400 hover:border-slate-600'}`}>{q}</button>))}</div></div>'''

new_quality = '''                  <div><span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest block mb-2">Quality</span><div className="flex gap-2 flex-wrap">{['720p','1080p','2K','4K'].map((q: string) => {
                    const locked = (plan === 'Basic' && q !== '720p') || (plan === 'Pro' && q === '4K');
                    return (<button key={q} onClick={() => locked ? setIsPricingOpen(true) : setImgQuality(q)} className={`relative px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${imgQuality === q ? 'bg-indigo-600 border-indigo-600 text-white' : locked ? 'border-slate-800 text-slate-600 cursor-pointer opacity-60' : 'border-slate-800 text-slate-400 hover:border-slate-600'}`}>{q}{locked && <span className="absolute -top-1.5 -right-1.5 bg-indigo-600 text-white text-[6px] px-1 rounded-full uppercase tracking-wider">PRO</span>}</button>);
                  })}</div></div>'''

content = content.replace(old_quality, new_quality)

# 4. For smart mode - show all modes but lock expert with Pro badge
old_smart_mode = '''          <div className="hidden md:flex items-center gap-2 bg-slate-900 rounded-lg p-1 border border-slate-800">{(['normal','creative','expert'] as SmartMode[]).map(mode => (<button key={mode} onClick={() => setSmartMode(mode)} className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-widest transition-all ${smartMode === mode ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-white'}`}>{mode}</button>))}</div>'''

new_smart_mode = '''          <div className="hidden md:flex items-center gap-2 bg-slate-900 rounded-lg p-1 border border-slate-800">{(['normal','creative','expert'] as SmartMode[]).map(mode => {
            const locked = mode === 'expert' && plan === 'Basic';
            return (<button key={mode} onClick={() => locked ? setIsPricingOpen(true) : setSmartMode(mode)} className={`relative px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-widest transition-all ${smartMode === mode ? 'bg-indigo-600 text-white' : locked ? 'text-slate-600 cursor-pointer opacity-60' : 'text-slate-500 hover:text-white'}`}>{mode}{locked && <span className="absolute -top-1.5 -right-1 bg-indigo-600 text-white text-[5px] px-1 rounded-full uppercase tracking-wider">PRO</span>}</button>);
          })}</div>'''

content = content.replace(old_smart_mode, new_smart_mode)

with open('App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('UI fixes applied!')

