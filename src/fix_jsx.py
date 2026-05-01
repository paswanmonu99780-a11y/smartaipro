with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the broken section and replace with correct JSX
marker_start = '                        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">'
marker_code = '                          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest block mb-2">Your Referral Code</span>'

idx = content.find(marker_code)
if idx != -1:
    # Find the end of the broken section
    end_marker = '                      </>'
    end_idx = content.find(end_marker, idx)
    
    if end_idx != -1:
        # Extract the broken part
        broken = content[idx:end_idx + len(end_marker)]
        
        # Build corrected version with all proper closing tags
        fixed = '''                        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
                          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest block mb-2">Your Referral Code</span>
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-xl font-bold text-indigo-400 font-mono tracking-wider">{refData.referralCode}</span>
                            <button
                              onClick={() => copyToClipboard(refData.referralCode, 'code')}
                              className="flex items-center gap-1.5 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-600/20 text-indigo-400 px-3 py-1.5 rounded-lg transition-all text-xs font-bold uppercase tracking-wider"
                            >
                              {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                              {copiedCode ? 'Copied!' : 'Copy'}
                            </button>
                          </div>
                        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
                          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest block mb-2">Your Referral Link</span>
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-xs text-slate-400 font-mono truncate flex-1">{referralLink}</span>
                            <button
                              onClick={() => copyToClipboard(referralLink, 'link')}
                              className="flex items-center gap-1.5 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-600/20 text-indigo-400 px-3 py-1.5 rounded-lg transition-all text-xs font-bold uppercase tracking-wider shrink-0"
                            >
                              {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                              {copiedLink ? 'Copied!' : 'Copy'}
                            </button>
                          </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-center">
                            <div className="text-2xl font-bold text-emerald-400">{refData.referralEarnings}</div>
                            <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Credits Earned</div>
                          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-center">
                            <div className="text-2xl font-bold text-amber-400">+50</div>
                            <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Per Referral</div>
                        </div>
                        <p className="text-[10px] text-slate-500 text-center leading-relaxed">
                          Share your code with friends. You both get <span className="text-indigo-400 font-bold">+50 credits</span> when they send their first message!
                        </p>'''
        
        content = content[:idx] + fixed + content[end_idx + len(end_marker):]
        
        # Now fix the missing closing div for space-y-4 and the outer mb-6 div
        # Find "                  })()}" and add closing divs before it
        marker_end = '                  })()}'
        idx_end = content.find(marker_end)
        if idx_end != -1:
            # Check if the closing divs are missing
            before = content[idx_end-30:idx_end]
            if '</div>' not in before:
                content = content[:idx_end] + '                </div>\n              </div>\n' + content[idx_end:]
        
        with open('src/App.tsx', 'w', encoding='utf-8') as f:
            f.write(content)
        print('SUCCESS: Fixed broken JSX')
    else:
        print('ERROR: Could not find end marker')
else:
    print('ERROR: Could not find start marker')
