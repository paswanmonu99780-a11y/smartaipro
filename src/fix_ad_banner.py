# Fix AdBanner placement: Remove from chat tab, Add to video tab

path = r'c:\Users\manis\Downloads\smartaipro-main\src\App.tsx'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix 1: Remove AdBanner from chat tab
old_chat = '''              <div className="mt-4"><AdBanner /></div>
              {smartMode === 'expert' && plan !== 'Basic' && ('''

new_chat = '''              {smartMode === 'expert' && plan !== 'Basic' && ('''

content = content.replace(old_chat, new_chat)

# Fix 2: Add AdBanner to video tab
old_video = '''                <p className="text-center mt-3 text-xs text-indigo-400 font-bold uppercase tracking-widest">Coming Soon</p>
              </div>
            </div>
          )}'''

new_video = '''                <p className="text-center mt-3 text-xs text-indigo-400 font-bold uppercase tracking-widest">Coming Soon</p>
              </div>
              <div className="mt-6"><AdBanner /></div>
            </div>
          )}'''

content = content.replace(old_video, new_video)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Done! AdBanner removed from chat tab, added to video tab.")
