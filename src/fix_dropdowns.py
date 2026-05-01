with open('App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace Aspect Ratio, Style, and Quality inline buttons with dropdown selects
old_controls = '''                <div className="flex flex-wrap gap-4 mb-6">
                  <div><span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest block mb-2">Aspect Ratio</span><div className="flex gap-2">{ASPECTS.map(a => (<button key={a} onClick={() => setImgAspect(a)} className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${imgAspect === a ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-800 text-slate-400 hover:border-slate-600'}`}>{a}</button>))}</div></div>
                  <div><span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest block mb-2">Style</span><div className="flex gap-2 flex-wrap">{STYLES.map(s => (<button key={s} onClick={() => setImgStyle(s)} className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${imgStyle === s ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-800 text-slate-400 hover:border-slate-600'}`}>{s}</button>))}</div></div>
                  <div><span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest block mb-2">Quality</span><div className="flex gap-2 flex-wrap">{['720p','1080p','2K','4K'].map((q: string) => {
                    const locked = (plan === 'Basic' && q !== '720p') || (plan === 'Pro' && q === '4K');
                    return (<button key={q} onClick={() => locked ? setIsPricingOpen(true) : setImgQuality(q)} className={`relative px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${imgQuality === q ? 'bg-indigo-600 border-indigo-600 text-white' : locked ? 'border-slate-800 text-slate-600 cursor-pointer opacity-60' : 'border-slate-800 text-slate-400 hover:border-slate-600'}`}>{q}{locked && <span className="absolute -top-1.5 -right-1.5 bg-indigo-600 text-white text-[6px] px-1 rounded-full uppercase tracking-wider">PRO</span>}</button>);
                  })}</div></div>
                </div>'''

new_controls = '''                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest block mb-2">Aspect Ratio</label>
                    <select value={imgAspect} onChange={e => setImgAspect(e.target.value as any)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500/50 transition-all appearance-none cursor-pointer">
                      {ASPECTS.map(a => (<option key={a} value={a}>{a}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest block mb-2">Style</label>
                    <select value={imgStyle} onChange={e => setImgStyle(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500/50 transition-all appearance-none cursor-pointer">
                      {STYLES.map(s => (<option key={s} value={s}>{s}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest block mb-2">Quality</label>
                    <select value={imgQuality} onChange={e => {
                      const q = e.target.value;
                      const locked = (plan === 'Basic' && q !== '720p') || (plan === 'Pro' && q === '4K');
                      if (locked) { setIsPricingOpen(true); } else { setImgQuality(q); }
                    }} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500/50 transition-all appearance-none cursor-pointer">
                      {['720p','1080p','2K','4K'].map((q: string) => {
                        const locked = (plan === 'Basic' && q !== '720p') || (plan === 'Pro' && q === '4K');
                        return (<option key={q} value={q} className={locked ? 'text-slate-600' : 'text-white'}>{q}{locked ? ' 🔒 PRO' : ''}</option>);
                      })}
                    </select>
                  </div>
                </div>'''

content = content.replace(old_controls, new_controls)

with open('App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Dropdown selects applied!')

