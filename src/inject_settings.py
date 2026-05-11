import os
import sys

file_path = "c:/Users/manis/OneDrive/Pictures/smartaipro-main/smartaipro-main/src/App.tsx"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add Import
content = content.replace(
    "import AIVoiceAvatar from './AIVoiceAvatar';",
    "import AIVoiceAvatar from './AIVoiceAvatar';\nimport SettingsComponent from './Settings';"
)

# 2. Add State
content = content.replace(
    "const [isPricingOpen, setIsPricingOpen] = useState(false);",
    "const [isPricingOpen, setIsPricingOpen] = useState(false);\n  const [isSettingsOpen, setIsSettingsOpen] = useState(false);"
)

# 3. Add Settings button in Desktop Sidebar
desktop_sidebar_search = """          {SIDEBAR_ITEMS.map(item => (
            <button
              key={item.tab}
              onClick={() => setActiveTab(item.tab)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === item.tab ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-600/20 shadow-sm' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.name}</span>
            </button>
          ))}

          <div className="my-4 px-2">"""

desktop_sidebar_replace = """          {SIDEBAR_ITEMS.map(item => (
            <button
              key={item.tab}
              onClick={() => setActiveTab(item.tab)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === item.tab ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-600/20 shadow-sm' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.name}</span>
            </button>
          ))}
          
          <button onClick={() => setIsSettingsOpen(true)} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-slate-400 hover:bg-white/5 hover:text-white">
            <Settings className="w-5 h-5" />
            <span className="text-sm font-medium">Settings</span>
          </button>

          <div className="my-4 px-2">"""

content = content.replace(desktop_sidebar_search, desktop_sidebar_replace)

# 4. Add Settings button in Mobile Sidebar
mobile_sidebar_search = """                {SIDEBAR_ITEMS.map(item => (
                  <button key={item.tab} onClick={() => { setActiveTab(item.tab); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === item.tab ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-600/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                    <item.icon className="w-5 h-5" />
                    <span className="text-base font-medium">{item.name}</span>
                  </button>
                ))}

                <div className="my-4 px-2">"""

mobile_sidebar_replace = """                {SIDEBAR_ITEMS.map(item => (
                  <button key={item.tab} onClick={() => { setActiveTab(item.tab); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === item.tab ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-600/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                    <item.icon className="w-5 h-5" />
                    <span className="text-base font-medium">{item.name}</span>
                  </button>
                ))}
                
                <button onClick={() => { setIsSettingsOpen(true); setIsMobileMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-slate-400 hover:bg-white/5 hover:text-white">
                  <Settings className="w-5 h-5" />
                  <span className="text-base font-medium">Settings</span>
                </button>

                <div className="my-4 px-2">"""

content = content.replace(mobile_sidebar_search, mobile_sidebar_replace)

# 5. Render SettingsComponent
render_search = """    </div>
  );
}"""

render_replace = """      {isSettingsOpen && (
        <SettingsComponent 
          onClose={() => setIsSettingsOpen(false)} 
          onLogout={handleLogout}
          userEmail={email}
          userName={displayName}
          userAvatar={avatar}
          plan={plan}
          credits={credits}
        />
      )}
    </div>
  );
}"""

content = content.replace(render_search, render_replace)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Settings successfully injected into App.tsx")
