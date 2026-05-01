import re

with open('../fix-app.js', 'r', encoding='utf-8') as f:
    js_content = f.read()

# Extract content between backticks
start = js_content.find('const content = `') + len('const content = `')
end = js_content.rfind('`;')
code = js_content[start:end]

# 1. Add profile to Tab type
code = code.replace(
    "type Tab = 'chat' | 'image' | 'video';",
    "type Tab = 'chat' | 'image' | 'video' | 'profile';"
)

# 2. Add User, CreditCard imports
code = code.replace(
    "import { MessageSquare, Image as ImageIcon, LogOut, Send, Plus, Zap, Sparkles, Github, Download, Video } from 'lucide-react';",
    "import { MessageSquare, Image as ImageIcon, LogOut, Send, Plus, Zap, Sparkles, Github, Download, Video, User, CreditCard } from 'lucide-react';"
)

# 3. Add AdBanner function after Message interface
adbanner = '''function AdBanner() {
  const adRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!adRef.current) return;
    const container = adRef.current;
    container.innerHTML = '';
    const configScript = document.createElement('script');
    configScript.text = `
      atOptions = {
        'key' : 'cb07926d8c0a4b4aa3010551e8596427',
        'format' : 'iframe',
        'height' : 50,
        'width' : 320,
        'params' : {}
      };
    `;
    container.appendChild(configScript);
    const invokeScript = document.createElement('script');
    invokeScript.src = 'https://www.highperformanceformat.com/cb07926d8c0a4b4aa3010551e8596427/invoke.js';
    invokeScript.async = true;
    container.appendChild(invokeScript);
  }, []);
  return <div ref={adRef} className="w-full flex justify-center py-2" style={{ minHeight: 50 }} />;
}

'''
code = code.replace('const SIDEBAR_ITEMS', adbanner + 'const SIDEBAR_ITEMS')

# 4. Add Profile to MOBILE_TABS
code = code.replace(
    """const MOBILE_TABS = [
  { name: 'Chat', icon: MessageSquare, tab: 'chat' as Tab },
  { name: 'Image', icon: ImageIcon, tab: 'image' as Tab },
  { name: 'Video', icon: Video, tab: 'video' as Tab },
];""",
    """const MOBILE_TABS = [
  { name: 'Chat', icon: MessageSquare, tab: 'chat' as Tab },
  { name: 'Image', icon: ImageIcon, tab: 'image' as Tab },
  { name: 'Video', icon: Video, tab: 'video' as Tab },
  { name: 'Profile', icon: User, tab: 'profile' as Tab },
];"""
)

# 5. Fix Chat API URL
code = code.replace(
    "const url = `https://text.pollinations.ai/${prompt}?seed=${seed}&system=${encodeURIComponent(systemPrompt)}&json=false`;",
    "const url = `/api/chat?prompt=${encodeURIComponent(userMsg.content)}&seed=${seed}&system=${encodeURIComponent(systemPrompt)}&json=false`;"
)

# 6. Fix Image API URL
code = code.replace(
    "return `https://image.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}?width=${w}&height=${h}&seed=${seed}&nologo=true&enhance=true`;",
    "return `/api/image?prompt=${encodeURIComponent(fullPrompt)}&width=${w}&height=${h}&seed=${seed}&nologo=true&enhance=true`;"
)

# 7. Add pb-32 md:pb-6 to main content div
code = code.replace(
    '<div className="flex-1 overflow-y-auto p-6">',
    '<div className="flex-1 overflow-y-auto p-6 pb-32 md:pb-6">'
)

# 8. Add Profile tab content and mobile ad banner before closing </div> of main content
profile_section = '''          {activeTab === 'profile' && (
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
          )}
        </div>
      </main>

      {/* Mobile Ad Banner */}
      <div className="md:hidden fixed bottom-16 left-0 right-0 z-30 bg-slate-950 border-t border-slate-800">
        <AdBanner />
      </div>

      {/* Mobile Bottom Nav */}
      <nav'''

code = code.replace(
    '''        </div>
      </main>

      <nav''',
    profile_section
)

# Write the fixed file
with open('App.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print('SUCCESS! Wrote', len(code), 'bytes to App.tsx')
