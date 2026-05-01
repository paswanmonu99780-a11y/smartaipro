# Fix Plan for SmartAI Pro

## Issues to Fix
1. Image generation not working
2. Chat not working
3. Razorpay payment not working
4. Duplicate name allowed on signup (should be unique)
5. Login not working after signup
6. Vercel deployment config issues

## Steps
- [ ] Step 1: Fix `vercel.json` - Add SPA fallback rewrite
- [ ] Step 2: Fix `api/index.ts` - Improve error handling, CORS, image/chat proxy robustness
- [ ] Step 3: Fix `src/App.tsx` - Auth fixes (unique name, login/signup state reset, required fields)
- [ ] Step 4: Fix `src/App.tsx` - Razorpay use real user email instead of hardcoded
- [ ] Step 5: Fix `src/App.tsx` - Image generation frontend fallback
- [ ] Step 6: Fix `src/App.tsx` - Chat fallback improvements
- [ ] Step 7: Test and verify

