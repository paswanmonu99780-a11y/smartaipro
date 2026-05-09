const fs = require('fs');

const content = `import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Image as ImageIcon, LogOut, Send, Plus, Zap, Sparkles, Github, Download, Video } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Tab = 'chat' | 'image' | 'video';
type SmartMode = 'normal' | 'creative' | 'expert';
interface Message { id: string; role: 'user' | 'assistant'; content: string; }

const SIDEBAR_ITEMS = [
  { name: 'Conversation', icon: MessageSquare, tab: 'chat' as Tab },
  { name: 'Creation', icon: ImageIcon, tab: 'image' as Tab },
  { name: 'Neural Motion', icon: Video, tab: 'video' as Tab },
];

const MOBILE_TABS = [
  { name: 'Chat', icon: MessageSquare, tab: 'chat' as Tab },
  { name: 'Image', icon: ImageIcon, tab: 'image' as Tab },
  { name: 'Video', icon: Video, tab: 'video' as Tab },
];

const PLANS = [
  { name: 'Basic', price: 'Free', features: ['100 Credits','Standard Response','720p Energy'], color: 'slate-400' },
  { name: 'Pro', price: '₹99', features: ['10,000 Credits','Expert Mode Enabled','2K Intelligence'], color: 'indigo-500', popular: true },
  { name: 'Ultra', price: '₹199', features: ['Unlimited Pixels','Zero Latency','4K Imagination'], color: 'emerald-500' },
];

const ASPECTS = ['1:1','16:9','9:16','4:3'] as const;
const STYLES = ['realistic','anime','oil painting','cyberpunk','minimalist'];

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('chat');
  const [smartMode, setSmartMode] = useState<SmartMode>('normal');
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [credits, setCredits] = useState(100);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{ id: '1', role: 'assistant', content: 'Neural link established. I am SmartAI Pro. How can I assist your creative process?' }]);
  const [imgPrompt, setImgPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImg, setGeneratedImg] = useState<string | null>(null);
  const [imgAspect, setImgAspect] = useState<'1:1' | '16:9' | '9:16' | '4:3'>('1:1');
  const [imgStyle, setImgStyle] = useState('realistic');
  const [videoPrompt, setVideoPrompt] = useState('');
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [plan, setPlan] = useState<'Basic' | 'Pro' | 'Ultra'>('Basic');
  const [imgQuality, setImgQuality] = useState('720p');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('smartai_session');
    if (saved) { const d = JSON.parse(saved); setCredits(d.credits || 100); setEmail(d.email || ''); setPlan(d.plan || 'Basic'); setIsLoggedIn(true); }
  }, []);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isAiThinking]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setIsAuthenticating(true);
    try {
      const r = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
      const d = await r.json();
      if (r.ok) { localStorage.setItem('smartai_session', JSON.stringify(d.user)); setCredits(d.user.credits || 100); setEmail(d.user.email || ''); setPlan(d.user.plan || 'Basic'); setIsLoggedIn(true); }
      else alert(d.error || 'Login failed');
    } catch { alert('Connection lost.'); } finally { setIsAuthenticating(false); }
  };
  const handleSignup = async () => {
    if (!email || !password) return alert('Email/Key required');
    setIsAuthenticating(true);
    try {
      const r = await fetch('/api/auth/signup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
      const d = await r.json();
      if (r.ok) alert('Signup successful! Please Authorize.'); else alert(d.error || 'Signup failed');
    } catch { alert('Connection lost.'); } finally { setIsAuthenticating(false); }
  };
  const handleLogout = () => { localStorage.removeItem('smartai_session'); window.location.reload(); };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isAiThinking) return;
    if (credits < 1) { alert('Credits exhausted.'); setIsPricingOpen(true); return; }
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: chatInput };
    setMessages(p => [...p, userMsg]); setChatInput(''); setIsAiThinking(true); setCredits(p => p - 1);
    try {
      const systemPrompt = {
        normal: 'You are a helpful, friendly AI assistant.',
        creative: 'You are a wildly creative and visionary AI.',
        expert: 'You are an elite expert AI with deep technical knowledge.'
      }[smartMode];
      const prompt = encodeURIComponent(userMsg.content);
      const seed = Math.floor(Math.random() * 999999);
      const url = \`https://text.pollinations.ai/\${prompt}?seed=\${seed}&system=\${encodeURIComponent(systemPrompt)}&json=false\`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to get response from AI');
      const text = await response.text();
      setMessages(p => [...p, { id: (Date.now()+1).toString(), role: 'assistant', content: text || "Sorry, I couldn't process that." }]);
    } catch (error: any) {
      alert('Chat error: ' + (error?.message || 'Connection failed. Please try again.'));
    } finally { setIsAiThinking(false); }
  };

  const getDimensions = (quality: string, aspect: string): [number, number] => {
    const longEdge = { '720p': 512, '1080p': 768, '2K': 1024, '4K': 1024 }[quality] || 512;
    if (aspect === '1:1') return [longEdge, longEdge];
    if (aspect === '16:9') return [longEdge, Math.round(longEdge * 9 / 16)];
    if (aspect === '9:16') return [Math.round(longEdge * 9 / 16), longEdge];
    if (aspect === '4:3') return [longEdge, Math.round(longEdge * 3 / 4)];
    return [longEdge, longEdge];
  };

  const generateFreeImage = () => {
    const [w, h] = getDimensions(imgQuality, imgAspect);
    const fullPrompt = \`\${imgPrompt}\${imgStyle === 'realistic' ? '' : \`, \${imgStyle} style\`}\`;
    const seed = Math.floor(Math.random()*999999);
    return \`https://image.pollinations.ai/prompt/\${encodeURIComponent(fullPrompt)}?width=\${w}&height=\${h}&seed=\${seed}&nologo=true&enhance=true\`;
  };

  const handleGenerateImage = async () => {
    if (!imgPrompt.trim() || isGenerating) return;
    if (credits < 5) { alert('Insufficient credits (5 required).'); setIsPricingOpen(true); return; }
    setIsGenerating(true); setCredits(p => p - 5); setGeneratedImg(null);
    const url = generateFreeImage();
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => { setGeneratedImg(url); setIsGenerating(false); };
    img.onerror = () => { setCredits(p => p + 5); alert('Image generation failed. Try a different prompt or smaller size.'); setIsGenerating(false); };
    img.src = url;
  };

  const handleGenerateVideo = async () => {
    if (!videoPrompt.trim() || isGeneratingVideo) return;
    if (credits < 50) { alert('Insufficient credits (50 required).'); setIsPricingOpen(true); return; }
    setIsGeneratingVideo(true);
    setTimeout(() => { setIsGeneratingVideo(false); alert('Demo: Real video generation is coming soon.'); }, 1500);
  };

  const handleSelectPlan = async (plan: (typeof PLANS)[number]) => {
    if (plan.name === 'Basic') { alert('You are already on the Basic plan.'); setIsPricingOpen(false); return; }
    const saved = localStorage.getItem('smartai_session');
    const user = saved ? JSON.parse(saved) : null;
    if (!user || !user.email) { alert('Session expired. Please log in again.'); return; }
    try {
      const res = await fetch('/api/payment/create-order', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plan: plan.name, email: user.email }) });
      const data = await res.json();
      if (!res.ok) { alert(data.error || 'Failed to create order'); return; }
      const options = {
        key: data.key_id, amount: data.amount, currency: data.currency,
        name: 'SmartAI Pro', description: \`\${plan.name} Plan Subscription\`, order_id: data.order_id,
        handler: async (response: any) => {
          try {
            const verifyRes = await fetch('/api/payment/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ razorpay_order_id: response.razorpay_order_id, razorpay_payment_id: response.razorpay_payment_id, razorpay_signature: response.razorpay_signature, plan: plan.name, email: user.email }) });
            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.success) {
              const newCredits = verifyData.credits || (plan.name === 'Pro' ? 10000 : 999999);
              setCredits(newCredits); setPlan(plan.name as 'Pro' | 'Ultra');
              const session = JSON.parse(localStorage.getItem('smartai_session') || '{}');
              session.credits = newCredits; session.plan = plan.name;
              localStorage.setItem('smartai_session', JSON.stringify(session));
              alert(\`Payment successful! You now have \${newCredits.toLocaleString()} credits.\`);
              setIsPricingOpen(false);
            } else { alert(verifyData.error || 'Payment verification failed'); }
          } catch (e) { alert('Verification error'); }
        },
        prefill: { email: user.email }, theme: { color: '#4f46e5' }
      };
      const rzp = new (window as any).Razorpay(options); rzp.open();
    } catch (e) { alert('Payment initiation failed'); }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center p-4 font-sans">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md bg-slate-900/50 border border-slate-800 rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(79,70,229,0.3)]"><Zap className="text-white w-7 h-7 fill-white" /></div>
            <h1 className="text-3xl font-medium tracking-tight text-white italic">SmartAI <span className="font-light text-slate-400 not-italic">Pro</span></h1>
            <p className="text-slate-500 text-sm mt-2 font-serif italic text-center">Modern intelligence for the creative mind</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div><label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Email Access</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500/50 transition-all font-mono text-sm" placeholder="name@nexus.ai" /></div>
            <div><label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Security Key</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500/50 transition-all font-mono text-sm" placeholder="••••••••" /></div>
            <div className="pt-2 flex flex-col gap-3 text-xs uppercase tracking-widest font-bold">
              <button type="submit" disabled={isAuthenticating} className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-500 transition-all active:scale-95 shadow-lg shadow-indigo-600/20 disabled:opacity-50 flex items-center justify-center gap-2">{isAuthenticating ? 'Syncing...' : 'Authorize'}</button>
              <button type="button" onClick={handleSignup} disabled={isAuthenticating} className="w-full bg-transparent border border-slate-800 text-slate-400 py-3 rounded-lg hover:bg-slate-800/50 hover:text-white transition-all active:scale-95 disabled:opacity-50">Create Identity</button>
            </div>
          </form>
          <div className="mt-8 pt-6 border-t border-slate-800 flex justify-between items-center text-slate-600"><Github className="w-4 h-4 cursor-pointer hover:text-white transition-colors" /><span className="text-[9px] uppercase tracking-[0.3em] font-mono">Kernel v2.4.0_Stable</span></div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex font-sans overflow-hidden">
      <AnimatePresence>
        {isPricingOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-4xl w-full shadow-2xl">
              <div className="flex justify-between items-center mb-8"><h2 className="text-3xl font-bold italic tracking-tight">Upgrade Your Neural Link</h2><button onClick={() => setIsPricingOpen(false)} className="p-2 hover:bg-white/5 rounded-full"><Plus className="w-6 h-6 rotate-45" /></button></div>
              <div className="grid md:grid-cols-3 gap-6">
                {[{ name: "Basic", price: "Free", features: ["100 Credits","Standard Response","720p Energy"], color: "slate-400" },{ name: "Pro", price: "₹99", features: ["10,000 Credits","Expert Mode Enabled","2K Intelligence"], color: "indigo-500", popular: true },{ name: "Ultra", price: "₹199", features: ["Unlimited Pixels","Zero Latency","4K Imagination"], color: "emerald-500" }].map((plan) => (
                  <div key={plan.name} className={\`p-6 rounded-2xl border \${plan.popular ? "border-indigo-600 bg-indigo-600/5" : "border-slate-800 bg-slate-950/50"} relative flex flex-col\`}>
                    {plan.popular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[9px] px-3 py-1 rounded-full uppercase tracking-widest font-bold">Most Popular</span>}
                    <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                    <div className="mb-4"><span className="text-2xl font-bold">{plan.price}</span><span className="text-slate-500 text-xs"> /month</span></div>
                    <ul className="space-y-3 mb-8 flex-1">{plan.features.map(f => <li key={f} className="text-xs text-slate-400 flex items-center gap-2"><div className={\`w-1 h-1 rounded-full bg-\${plan.color}\`}></div> {f}</li>)}</ul>
                    <button onClick={() => handleSelectPlan(plan)} className={\`w-full py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all \${plan.popular ? "bg-indigo-600 text-white" : "bg-white text-black hover:bg-slate-200"}\`}>Select {plan.name}</button>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <aside className="hidden md:flex w-72 bg-slate-950 border-r border-slate-800 flex-col p-6 overflow-y-auto">
        <div className="flex items-center gap-3 mb-10"><div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white">S</div><span className="text-xl font-medium tracking-tight text-white">SmartAI <span className="font-light text-slate-400 italic">Pro</span></span></div>
        <div className="mb-8 p-4 bg-indigo-600/10 border border-indigo-600/20 rounded-2xl flex items-center justify-between">
          <div><span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Credits</span><div className="text-2xl font-bold text-white mt-1">{credits.toLocaleString()}</div></div>
          <div className="w-10 h-10 bg-indigo-600/20 rounded-full flex items-center justify-center"><Sparkles className="w-5 h-5 text-indigo-400" /></div>
        </div>
        <nav className="space-y-2 flex-1">{SIDEBAR_ITEMS.map(item => (<button key={item.tab} onClick={() => setActiveTab(item.tab)} className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all \${activeTab === item.tab ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-600/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}\`}><item.icon className="w-5 h-5" /><span className="text-sm font-medium">{item.name}</span></button>))}</nav>
        <div className="mt-auto pt-6 border-t border-slate-800">
          <button onClick={() => setIsPricingOpen(true)} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all mb-4">Upgrade Plan</button>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 text-slate-500 hover:text-white py-3 rounded-xl transition-all text-xs uppercase tracking-widest font-bold"><LogOut className="w-4 h-4" /> Disconnect</button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-950/50 backdrop-blur-sm">
          <div className="flex items-center gap-4 md:hidden"><div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white">S</div><span className="font-medium tracking-tight">SmartAI Pro</span></div>
          <div className="hidden md:flex items-center gap-2 bg-slate-900 rounded-lg p-1 border border-slate-800">{(['normal','creative','expert'] as SmartMode[]).map(mode => (<button key={mode} onClick={() => setSmartMode(mode)} className={\`px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-widest transition-all \${smartMode === mode ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-white'}\`}>{mode}</button>))}</div>
          <div className="flex items-center gap-4"><span className="text-xs text-slate-500 font-mono hidden sm:block">{email}</span><div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center text-xs font-bold text-slate-400">{email.charAt(0).toUpperCase()}</div></div>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'chat' && (
            <div className="max-w-3xl mx-auto h-full flex flex-col">
              <div className="flex-1 space-y-6 mb-6">{messages.map(msg => (<motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={\`flex \${msg.role === 'user' ? 'justify-end' : 'justify-start'}\`}><div className={\`max-w-[80%] p-4 rounded-2xl \${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-900 border border-slate-800 text-slate-300'}\`}><p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p></div></motion.div>))}
                {isAiThinking && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start"><div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl"><div className="flex gap-1"><motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-2 h-2 bg-indigo-500 rounded-full" /><motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-2 h-2 bg-indigo-500 rounded-full" /><motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-2 h-2 bg-indigo-500 rounded-full" /></div></div></motion.div>)}
                <div ref={chatEndRef} /></div>
              <div className="sticky bottom-0 bg-slate-950/80 backdrop-blur-sm pb-4"><div className="flex gap-2 items-end bg-slate-900 border border-slate-800 rounded-2xl p-2"><input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage()} placeholder="Enter your prompt..." className="flex-1 bg-transparent px-4 py-3 text-sm outline-none placeholder:text-slate-600" /><button onClick={handleSendMessage} disabled={isAiThinking || !chatInput.trim()} className="bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"><Send className="w-4 h-4" /></button></div><div className="text-center mt-2"><span className="text-[10px] text-slate-600 uppercase tracking-widest font-mono">{credits} credits remaining</span></div></div>
            </div>
          )}

          {activeTab === 'image' && (
            <div className="max-w-3xl mx-auto">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 mb-8">
                <h2 className="text-2xl font-bold mb-6 italic tracking-tight">Image Synthesis</h2>
                <textarea value={imgPrompt} onChange={e => setImgPrompt(e.target.value)} placeholder="Describe the image you want to generate..." className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm h-32 resize-none outline-none focus:border-indigo-500/50 transition-all mb-4 placeholder:text-slate-600" />
                <div className="flex flex-wrap gap-4 mb-6">
                  <div><span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest block mb-2">Aspect Ratio</span><div className="flex gap-2">{ASPECTS.map(a => (<button key={a} onClick={() => setImgAspect(a)} className={\`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all \${imgAspect === a ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-800 text-slate-400 hover:border-slate-600'}\`}>{a}</button>))}</div></div>
                  <div><span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest block mb-2">Style</span><div className="flex gap-2 flex-wrap">{STYLES.map(s => (<button key={s} onClick={() => setImgStyle(s)} className={\`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all \${imgStyle === s ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-800 text-slate-400 hover:border-slate-600'}\`}>{s}</button>))}</div></div>
                  <div><span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest block mb-2">Quality</span><div className="flex gap-2 flex-wrap">{(({ Basic: ['720p'], Pro: ['720p','1080p','2K'], Ultra: ['720p','1080p','2K','4K'] } as any)[plan] || ['720p']).map((q: string) => (<button key={q} onClick={() => setImgQuality(q)} className={\`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all \${imgQuality === q ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-800 text-slate-400 hover:border-slate-600'}\`}>{q}</button>))}</div></div>
                </div>
                <button onClick={handleGenerateImage} disabled={isGenerating || !imgPrompt.trim()} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-xl font-bold text-sm uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2">{isGenerating ? 'Synthesizing...' : 'Generate Image (5 credits)'}</button>
              </div>
              {generatedImg && (<motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative group"><img src={generatedImg} alt="Generated" className="w-full rounded-3xl border border-slate-800 shadow-2xl" /><a href={generatedImg} download className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm p-3 rounded-xl opacity-0 group-hover:opacity-100 transition-all"><Download className="w-5 h-5 text-white" /></a></motion.div>)}
            </div>
          )}

          {activeTab === 'video' && (
            <div className="max-w-3xl mx-auto">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">
                <h2 className="text-2xl font-bold mb-6 italic tracking-tight">Neural Motion</h2>
                <textarea value={videoPrompt} onChange={e => setVideoPrompt(e.target.value)} placeholder="Describe the video you want to generate..." className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm h-32 resize-none outline-none focus:border-indigo-500/50 transition-all mb-4 placeholder:text-slate-600" />
                <button onClick={handleGenerateVideo} disabled={isGeneratingVideo || !videoPrompt.trim()} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-xl font-bold text-sm uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2">{isGeneratingVideo ? 'Rendering...' : 'Generate Video (50 credits)'}</button>
              </div>
            </div>
          )}
        </div>
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-950 border-t border-slate-800 flex justify-around p-2 z-40">
        {MOBILE_TABS.map(tab => (
          <button key={tab.tab} onClick={() => setActiveTab(tab.tab)} className={\`flex flex-col items-center gap-1 p-2 rounded-xl transition-all \${activeTab === tab.tab ? 'text-indigo-400' : 'text-slate-500'}\`}>
            <tab.icon className="w-5 h-5" />
            <span className="text-[9px] font-bold uppercase tracking-widest">{tab.name}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
`;

fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log('App.tsx written successfully');
console.log('File size:', fs.statSync('src/App.tsx').size, 'bytes');

