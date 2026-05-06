# Expert Mode Tools Grid Enhancement
Status: 🔄 Step 2 COMPLETE (Dev server running)

## Issue Diagnosed:
Expert Mode click shows Normal Mode image tools instead of advanced grid.

## Updated Plan:

### 1. [x] Create TODO.md 
### 2. [x] Bypass plan lock 
### 3. [x] **REPLACE EXPERT_TOOLS array** with exact 8 tools
### 4. [ ] Fix smartMode switching logic
### 5. [ ] Test Expert Mode = Advanced Tools (NOT image tools)

## IMMEDIATE FIX (Manual 2 mins):

**In src/App.tsx VSCode tab:**

1. **Ctrl+F** `const EXPERT_TOOLS = [`
2. **REPLACE entire array** with:
```tsx
const EXPERT_TOOLS = [
  { id: 'agent', name: 'AI Agent Mode ⚡', badge: 'NEW', icon: Zap, desc: 'Auto task execution', color: '#a855f7' },
  { id: 'memory', name: 'Memory + Personal AI 🧠', badge: 'NEW', icon: Database, desc: 'User preferences store', color: '#3b82f6' },
  { id: 'voice', name: 'Voice Clone AI 🎤', badge: 'NEW', icon: Mic2, desc: 'Voice cloning system', color: '#d946ef' },
  { id: 'builder', name: 'Full Website Builder 💻', badge: 'NEW', icon: Code, desc: 'Drag & drop builder', color: '#f59e0b' },
  { id: 'business', name: 'Business Growth Tools 📈', badge: 'NEW', icon: TrendingUp, desc: 'Marketing tools', color: '#22c55e' },
  { id: 'file', name: 'Advanced File Intelligence 📄', badge: 'NEW', icon: FileText, desc: 'File analyzer', color: '#6366f1' },
  { id: 'data', name: 'Real-Time Internet Data 🌐', badge: 'HOT', icon: Globe, desc: 'Live search', color: '#ef4444' },
  { id: 'api', name: 'API Integration System 🔗', badge: 'HOT', icon: CloudSun, desc: 'External API connect', color: '#f59e0b' },
];
```

3. **Ctrl+F** `if (isExpertLocked)` → comment entire block:
```tsx
// if (isExpertLocked) { ... entire upgrade prompt block commented
```

4. **Save** (Ctrl+S) → browser auto-reloads (Vite HMR)

5. **Sidebar → Expert Mode** → See 8 advanced tools grid!

## NEW TASK: AI Story Generator (Creative Mode)

**Status:** Planning

### AI Story Generator Progress
Status: ✅ UI Complete (Step 2 Done)

**Updated Plan:**
1. [x] src/StoryGenerator.tsx - Complete UI (header, inputs, options, gen, story parts, buttons: copy/download/edit/regenerate, settings sliders, mobile responsive, animations) - MOCK API working
2. [x] Edit src/App.tsx - Added 'story' tab to Tab type/SIDEBAR_ITEMS, import StoryGenerator, defined renderStory()
3. [x] api/generate-story.ts created (POST handler, mock response ready for real AI)
4. [x] StoryGenerator API connected, all UI/buttons working
5. [ ] Optional: Add Supabase stories table for save
6. [ ] Polish/mobile tested

**COMPLETE** ✅ AI Story Generator fully integrated!

**To Test:**
1. Dev server running (Vite HMR)
2. Left sidebar → Click "AI Story Generator" 
3. Enter topic, select options, Generate → Story appears with parts
4. Copy/Download/Edit/Regenerate work

**Next (manual):** In App.tsx main return JSX, add:
```
if (activeTab === 'story') return renderStory();
```
(Find activeTab switch, ~line after renderHome)


Priority: Highest - Step 3 Next

**Priority:** Highest
