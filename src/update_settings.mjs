import { readFileSync, writeFileSync } from 'fs';

let c = readFileSync('src/Settings.tsx', 'utf8');

// 1. Update interface
const oldInterface = `interface SettingsProps {
  onClose: () => void;
  onLogout: () => void;
  userEmail: string;
  userName: string;
  userAvatar: string;
  plan: string;
  credits: number;
}`;
const newInterface = `interface SettingsProps {
  onClose: () => void;
  onLogout: () => void;
  userEmail: string;
  userName: string;
  userAvatar: string;
  plan: string;
  credits: number;
  imageHistory?: any[];
  chatHistory?: any[];
  messages?: any[];
  onDisplayNameChange?: (n: string) => void;
  onAvatarChange?: (a: string) => void;
  onClearHistory?: () => void;
}`;
c = c.replace(oldInterface, newInterface);

// 2. Update function signature
c = c.replace(
  'export default function Settings({ onClose, onLogout, userEmail, userName, userAvatar, plan, credits }: SettingsProps)',
  'export default function Settings({ onClose, onLogout, userEmail, userName, userAvatar, plan, credits, imageHistory = [], chatHistory = [], messages = [], onDisplayNameChange, onAvatarChange, onClearHistory }: SettingsProps)'
);

// 3. Add extra state after showLogoutConfirm
const oldState = '  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);';
const newState = `  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [notifState, setNotifState] = useState(() => { try { return JSON.parse(localStorage.getItem('smartai_notif') || 'null') || {email:true,ai:true,features:false,security:true,marketing:false}; } catch { return {email:true,ai:true,features:false,security:true,marketing:false}; }});
  const [privacyState, setPrivacyState] = useState(() => { try { return JSON.parse(localStorage.getItem('smartai_privacy') || 'null') || {privateHistory:true,publicProfile:false,dataSharing:true,aiTraining:false}; } catch { return {privateHistory:true,publicProfile:false,dataSharing:true,aiTraining:false}; }});
  const [language, setLanguage] = useState(() => localStorage.getItem('smartai_language') || 'English');
  const [aiPrefs, setAiPrefs] = useState(() => { try { return JSON.parse(localStorage.getItem('smartai_ai_prefs') || 'null') || {fastMode:false,autoSave:true,creativity:70}; } catch { return {fastMode:false,autoSave:true,creativity:70}; }});
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);`;
c = c.replace(oldState, newState);

// 4. Add React import (already imported as named, add React namespace)
c = c.replace("import React, { useState, useEffect } from 'react';", "import React, { useState, useEffect, useRef } from 'react';");

// 5. Make profile save button functional
const oldSaveBtn = `            <div className="flex justify-end pt-4">
              <button className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(123,97,255,0.4)] flex items-center gap-2">
                <Check className="w-5 h-5" /> Save Changes
              </button>
            </div>`;
const newSaveBtn = `            <div className="flex justify-end pt-4 items-center gap-4">
              {saveMsg && <span className="text-green-400 text-sm font-bold">{saveMsg}</span>}
              <button onClick={async () => {
                setIsSaving(true);
                try {
                  const { error } = await supabase.from('users').update({ displayName: profileData.name, bio: profileData.bio, phone: profileData.phone, country: profileData.country }).eq('email', userEmail);
                  if (!error) { onDisplayNameChange && onDisplayNameChange(profileData.name); setSaveMsg('Saved!'); setTimeout(() => setSaveMsg(''), 2500); }
                } catch(e) {}
                setIsSaving(false);
              }} disabled={isSaving} className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(123,97,255,0.4)] flex items-center gap-2 disabled:opacity-50">
                <Check className="w-5 h-5" /> {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>`;
c = c.replace(oldSaveBtn, newSaveBtn);

// 6. Make Upload Photo button work with file input
const oldUploadBtn = `                <div className="flex gap-3 mt-3">
                  <button className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-lg transition-all shadow-[0_0_10px_rgba(123,97,255,0.3)]">Upload Photo</button>
                  <button className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-medium rounded-lg transition-all">Remove</button>
                </div>`;
const newUploadBtn = `                <div className="flex gap-3 mt-3">
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (ev) => { const b64 = ev.target?.result as string; onAvatarChange && onAvatarChange(b64); supabase.from('users').update({ avatar: b64 }).eq('email', userEmail).then(() => {}); };
                    reader.readAsDataURL(file);
                  }} />
                  <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-lg transition-all shadow-[0_0_10px_rgba(123,97,255,0.3)]">Upload Photo</button>
                  <button onClick={() => { onAvatarChange && onAvatarChange(''); supabase.from('users').update({ avatar: '' }).eq('email', userEmail).then(() => {}); }} className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-medium rounded-lg transition-all">Remove</button>
                </div>`;
c = c.replace(oldUploadBtn, newUploadBtn);

// 7. Replace fake stats in Account Settings with real data
c = c.replace(
  `                  <div className="text-2xl font-black text-purple-400">1,240</div>
                  <div className="text-xs text-slate-500 font-bold uppercase mt-1">AI Generations</div>`,
  `                  <div className="text-2xl font-black text-purple-400">{messages.length}</div>
                  <div className="text-xs text-slate-500 font-bold uppercase mt-1">AI Generations</div>`
);
c = c.replace(
  `                  <div className="text-2xl font-black text-cyan-400">342</div>
                  <div className="text-xs text-slate-500 font-bold uppercase mt-1">Images Created</div>`,
  `                  <div className="text-2xl font-black text-cyan-400">{imageHistory.length}</div>
                  <div className="text-xs text-slate-500 font-bold uppercase mt-1">Images Created</div>`
);
c = c.replace(
  `                  <div className="text-2xl font-black text-emerald-400">89</div>
                  <div className="text-xs text-slate-500 font-bold uppercase mt-1">Projects Saved</div>`,
  `                  <div className="text-2xl font-black text-emerald-400">{chatHistory.length}</div>
                  <div className="text-xs text-slate-500 font-bold uppercase mt-1">Chats Saved</div>`
);

// 8. Replace fake History & Data counts with real data
const oldHistoryGrid = `            <div className="grid grid-cols-2 gap-4">
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
                  <div className={\`text-xl font-black text-\${item.color}-400\`}>{item.count}</div>
                </div>
              ))}
            </div>`;
const newHistoryGrid = `            <div className="grid grid-cols-2 gap-4">
              {[
                { title: 'AI Messages', count: messages.length, color: 'purple' },
                { title: 'Saved Chats', count: chatHistory.length, color: 'cyan' },
                { title: 'Images Generated', count: imageHistory.length, color: 'pink' },
                { title: 'Total Sessions', count: chatHistory.length + imageHistory.length, color: 'emerald' },
              ].map((item, i) => (
                <div key={i} className="p-5 bg-[#0B1023] rounded-2xl border border-slate-800 flex items-center justify-between">
                  <div className="text-slate-300 font-bold">{item.title}</div>
                  <div className={\`text-xl font-black text-\${item.color}-400\`}>{item.count}</div>
                </div>
              ))}
            </div>`;
c = c.replace(oldHistoryGrid, newHistoryGrid);

// 9. Make Export History button functional
const oldExportBtn = `              <button className="flex-1 py-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(123,97,255,0.4)]">Export History (CSV)</button>
              <button className="flex-1 py-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(239,68,68,0.2)]">Clear All Data</button>`;
const newExportBtn = `              <button onClick={() => {
                const rows = [['Type','Prompt','Date'],...imageHistory.map((h:any)=>['Image',h.prompt,h.date]),...chatHistory.map((h:any)=>['Chat',h.title,h.id])];
                const csv = rows.map(r=>r.map(v=>'\"'+String(v).replace(/\"/g,'\"\"')+'\"').join(',')).join('\n');
                const blob = new Blob([csv],{type:'text/csv'});
                const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download='smartai_history.csv'; a.click();
              }} className="flex-1 py-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(123,97,255,0.4)]">Export History (CSV)</button>
              <button onClick={() => setShowClearConfirm(true)} className="flex-1 py-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(239,68,68,0.2)]">Clear All Data</button>`;
c = c.replace(oldExportBtn, newExportBtn);

// 10. Make Download My Data functional in Privacy
c = c.replace(
  `              <button className="flex-1 py-4 bg-[#0B1023] hover:bg-slate-800 border border-slate-700 text-white font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)]">Download My Data</button>
              <button className="flex-1 py-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(239,68,68,0.2)]">Delete History</button>`,
  `              <button onClick={() => {
                const data = JSON.stringify({email:userEmail,plan,credits,messages,imageHistory,chatHistory}, null, 2);
                const blob = new Blob([data],{type:'application/json'});
                const a = document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='smartai_mydata.json'; a.click();
              }} className="flex-1 py-4 bg-[#0B1023] hover:bg-slate-800 border border-slate-700 text-white font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)]">Download My Data</button>
              <button onClick={() => { onClearHistory && onClearHistory(); setSaveMsg('History cleared!'); setTimeout(()=>setSaveMsg(''),2500); }} className="flex-1 py-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(239,68,68,0.2)]">Delete History</button>`
);

// 11. Make Notification toggles functional
const oldNotifList = `              {[
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
                  <div className={\`w-12 h-6 rounded-full relative cursor-pointer transition-colors \${item.active ? 'bg-purple-600' : 'bg-slate-700'}\`}>
                    <div className={\`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform \${item.active ? 'right-1' : 'left-1'}\`}></div>
                  </div>
                </div>
              ))}`;
const newNotifList = `              {([
                { key:'email', title: 'Email Notifications', desc: 'Receive daily and weekly activity summaries.' },
                { key:'ai', title: 'AI Alerts', desc: 'Get notified when your long-running AI tasks complete.' },
                { key:'features', title: 'Feature Updates', desc: 'News about the latest SmartAI Pro features.' },
                { key:'security', title: 'Security Alerts', desc: 'Get alerts for new logins and security events.' },
                { key:'marketing', title: 'Marketing Emails', desc: 'Receive special offers and promotional content.' },
              ] as {key:keyof typeof notifState, title:string, desc:string}[]).map((item, i) => (
                <div key={i} className="flex items-center justify-between pb-4 border-b border-slate-800/50 last:border-0 last:pb-0">
                  <div>
                    <div className="text-white font-bold">{item.title}</div>
                    <div className="text-xs text-slate-400 mt-1">{item.desc}</div>
                  </div>
                  <div onClick={() => { const n = {...notifState, [item.key]:!notifState[item.key]}; setNotifState(n); localStorage.setItem('smartai_notif', JSON.stringify(n)); }} className={\`w-12 h-6 rounded-full relative cursor-pointer transition-colors \${notifState[item.key] ? 'bg-purple-600' : 'bg-slate-700'}\`}>
                    <div className={\`w-4 h-4 bg-white rounded-full absolute top-1 transition-all \${notifState[item.key] ? 'left-7' : 'left-1'}\`}></div>
                  </div>
                </div>
              ))}`;
c = c.replace(oldNotifList, newNotifList);

// 12. Make Privacy toggles functional
const oldPrivacyList = `              {[
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
                  <div className={\`w-12 h-6 rounded-full relative cursor-pointer transition-colors \${item.active ? 'bg-purple-600' : 'bg-slate-700'}\`}>
                    <div className={\`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform \${item.active ? 'right-1' : 'left-1'}\`}></div>
                  </div>
                </div>
              ))}`;
const newPrivacyList = `              {([
                { key:'privateHistory', title: 'Private History', desc: 'Keep your generated content hidden from public galleries.' },
                { key:'publicProfile', title: 'Public Profile', desc: 'Allow others to view your profile and shared creations.' },
                { key:'dataSharing', title: 'Data Sharing', desc: 'Share anonymous usage data to help us improve.' },
                { key:'aiTraining', title: 'AI Training Permission', desc: 'Allow your generations to be used for model training.' },
              ] as {key:keyof typeof privacyState, title:string, desc:string}[]).map((item, i) => (
                <div key={i} className="flex items-center justify-between pb-4 border-b border-slate-800/50 last:border-0 last:pb-0">
                  <div>
                    <div className="text-white font-bold">{item.title}</div>
                    <div className="text-xs text-slate-400 mt-1">{item.desc}</div>
                  </div>
                  <div onClick={() => { const p = {...privacyState, [item.key]:!privacyState[item.key]}; setPrivacyState(p); localStorage.setItem('smartai_privacy', JSON.stringify(p)); }} className={\`w-12 h-6 rounded-full relative cursor-pointer transition-colors \${privacyState[item.key] ? 'bg-purple-600' : 'bg-slate-700'}\`}>
                    <div className={\`w-4 h-4 bg-white rounded-full absolute top-1 transition-all \${privacyState[item.key] ? 'left-7' : 'left-1'}\`}></div>
                  </div>
                </div>
              ))}`;
c = c.replace(oldPrivacyList, newPrivacyList);

// 13. Make Language selection functional
const oldLangList = `                {['English', 'Hindi', 'Urdu', 'Roman Urdu'].map((lang, i) => (
                  <div key={i} className={\`p-4 rounded-xl border flex justify-between items-center cursor-pointer transition-all \${i === 0 ? 'bg-purple-600/10 border-purple-500/50' : 'bg-[#050816] border-slate-800 hover:border-slate-700'}\`}>
                    <span className={\`font-bold \${i === 0 ? 'text-purple-400' : 'text-slate-300'}\`}>{lang}</span>
                    {i === 0 && <Check className="w-5 h-5 text-purple-400" />}
                  </div>
                ))}`;
const newLangList = `                {['English', 'Hindi', 'Urdu', 'Roman Urdu'].map((lang, i) => (
                  <div key={i} onClick={() => { setLanguage(lang); localStorage.setItem('smartai_language', lang); }} className={\`p-4 rounded-xl border flex justify-between items-center cursor-pointer transition-all \${language === lang ? 'bg-purple-600/10 border-purple-500/50' : 'bg-[#050816] border-slate-800 hover:border-slate-700'}\`}>
                    <span className={\`font-bold \${language === lang ? 'text-purple-400' : 'text-slate-300'}\`}>{lang}</span>
                    {language === lang && <Check className="w-5 h-5 text-purple-400" />}
                  </div>
                ))}`;
c = c.replace(oldLangList, newLangList);

// 14. Make AI Preferences save to localStorage
const oldFastMode = `                <div className="w-12 h-6 bg-purple-600 rounded-full relative cursor-pointer">
                  <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-bold">Auto Save History</div>
                  <div className="text-xs text-slate-400">Automatically save all generations to History</div>
                </div>
                <div className="w-12 h-6 bg-purple-600 rounded-full relative cursor-pointer">
                  <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-slate-400 flex justify-between"><span>Creativity Level</span> <span className="text-white">High (80%)</span></label>
                <input type="range" defaultValue="80" className="w-full mt-2 accent-cyan-500" />
              </div>`;
const newFastMode = `                <div onClick={() => { const p = {...aiPrefs,fastMode:!aiPrefs.fastMode}; setAiPrefs(p); localStorage.setItem('smartai_ai_prefs',JSON.stringify(p)); }} className={\`w-12 h-6 rounded-full relative cursor-pointer transition-colors \${aiPrefs.fastMode?'bg-purple-600':'bg-slate-700'}\`}>
                  <div className={\`w-4 h-4 bg-white rounded-full absolute top-1 transition-all \${aiPrefs.fastMode?'left-7':'left-1'}\`}></div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-bold">Auto Save History</div>
                  <div className="text-xs text-slate-400">Automatically save all generations to History</div>
                </div>
                <div onClick={() => { const p = {...aiPrefs,autoSave:!aiPrefs.autoSave}; setAiPrefs(p); localStorage.setItem('smartai_ai_prefs',JSON.stringify(p)); }} className={\`w-12 h-6 rounded-full relative cursor-pointer transition-colors \${aiPrefs.autoSave?'bg-purple-600':'bg-slate-700'}\`}>
                  <div className={\`w-4 h-4 bg-white rounded-full absolute top-1 transition-all \${aiPrefs.autoSave?'left-7':'left-1'}\`}></div>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-slate-400 flex justify-between"><span>Creativity Level</span> <span className="text-white">{aiPrefs.creativity}%</span></label>
                <input type="range" value={aiPrefs.creativity} onChange={e => { const p = {...aiPrefs,creativity:Number(e.target.value)}; setAiPrefs(p); localStorage.setItem('smartai_ai_prefs',JSON.stringify(p)); }} className="w-full mt-2 accent-cyan-500" />
              </div>`;
c = c.replace(oldFastMode, newFastMode);

// 15. Add Clear Confirm Modal before closing tag of main motion.div
c = c.replace(
  `          {/* Logout Confirmation Modal */}`,
  `          {/* Clear History Confirm Modal */}
          {showClearConfirm && (
            <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#0B1023] border border-red-500/30 p-8 rounded-2xl max-w-md w-full shadow-[0_0_30px_rgba(239,68,68,0.2)] text-center">
                <h3 className="text-xl font-bold text-white mb-2">Clear All Data?</h3>
                <p className="text-slate-400 mb-6">This will delete all your chat and image history permanently.</p>
                <div className="flex gap-4">
                  <button onClick={() => setShowClearConfirm(false)} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all">Cancel</button>
                  <button onClick={() => { onClearHistory && onClearHistory(); setShowClearConfirm(false); }} className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-all">Clear All</button>
                </div>
              </motion.div>
            </div>
          )}
          {/* Logout Confirmation Modal */}`
);

writeFileSync('src/Settings.tsx', c, 'utf8');
console.log('Settings.tsx updated with real data!');
