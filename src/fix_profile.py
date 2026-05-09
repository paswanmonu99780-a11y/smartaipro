with open('App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the profile section - replace the broken one with correct one
old_profile = '''          {activeTab === 'profile' && (
            <div className="max-w-3xl mx-auto">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 mb-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-2xl font-bold text-white">{email.charAt(0).toUpperCase()}</div>
                  <div>
                    <h2 className="text-xl font-bold">{email}</h2>
                    <span className="text-xs text-slate-500 uppercase tracking-widest font-mono">{plan} Plan</span>
                  </div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-center">
                    <div className="text-3xl font-bold text-white">{credits.toLocaleString()}</div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Credits</div>
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-center">
                    <div className="text-3xl font-bold text-indigo-400">{plan}</div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Current Plan</div>
                <button onClick={() => setIsPricingOpen(true)} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-xl font-bold text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2"><CreditCard className="w-5 h-5" /> Upgrade Plan</button>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">
                <h3 className="text-lg font-bold mb-4">Account</h3>
                <div className="space-y-3">
                  <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-slate-950 border border-slate-800 text-slate-400 hover:text-white py-3 rounded-xl transition-all text-xs uppercase tracking-widest font-bold"><LogOut className="w-4 h-4" /> Disconnect</button>
                </div>
              <div className="mt-6">
                <AdBanner />
              </div>
          )}'''

new_profile = '''          {activeTab === 'profile' && (
            <div className="max-w-3xl mx-auto">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 mb-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-2xl font-bold text-white">{email.charAt(0).toUpperCase()}</div>
                  <div>
                    <h2 className="text-xl font-bold">{email}</h2>
                    <span className="text-xs text-slate-500 uppercase tracking-widest font-mono">{plan} Plan</span>
                  </div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-center">
                    <div className="text-3xl font-bold text-white">{credits.toLocaleString()}</div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Credits</div>
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-center">
                    <div className="text-3xl font-bold text-indigo-400">{plan}</div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Current Plan</div>
                </div>
                <button onClick={() => setIsPricingOpen(true)} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-xl font-bold text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2"><CreditCard className="w-5 h-5" /> Upgrade Plan</button>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">
                <h3 className="text-lg font-bold mb-4">Account</h3>
                <div className="space-y-3">
                  <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-slate-950 border border-slate-800 text-slate-400 hover:text-white py-3 rounded-xl transition-all text-xs uppercase tracking-widest font-bold"><LogOut className="w-4 h-4" /> Disconnect</button>
                </div>
              <div className="mt-6">
                <AdBanner />
              </div>
          )}'''

if old_profile in content:
    content = content.replace(old_profile, new_profile)
    print('Profile section fixed!')
else:
    print('ERROR: Could not find profile section to fix')
    # Let's find where it starts
    idx = content.find("activeTab === 'profile'")
    if idx >= 0:
        print(f'Found profile section at index {idx}')
        print('Context:', content[idx:idx+200])

with open('App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Done!')
