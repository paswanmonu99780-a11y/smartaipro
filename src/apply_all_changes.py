import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Fix imports - add Copy, Check
content = content.replace(
    "import { MessageSquare, Image as ImageIcon, LogOut, Send, Plus, Zap, Sparkles, Github, Download, Video, User, CreditCard, Eye, EyeOff, Shield } from 'lucide-react';",
    "import { MessageSquare, Image as ImageIcon, LogOut, Send, Plus, Zap, Sparkles, Github, Download, Video, User, CreditCard, Eye, EyeOff, Shield, Copy, Check } from 'lucide-react';"
)

# 2. Update user type in getUsers and saveUsers
old_users_type = "Array<{email: string; password: string; credits: number; plan: string; displayName: string; avatar: string; name: string; mobile: string; referCode: string}>"
new_users_type = "Array<{email: string; password: string; credits: number; plan: string; displayName: string; avatar: string; name: string; mobile: string; referCode: string; referralCode: string; referredBy: string; referralRewarded: boolean; deviceId: string; referralEarnings: number}>"
content = content.replace(old_users_type, new_users_type)

# 3. Add state hooks after showHistory
content = content.replace(
    "  const [showHistory, setShowHistory] = useState(false);",
    "  const [showHistory, setShowHistory] = useState(false);\n  const [copiedCode, setCopiedCode] = useState(false);\n  const [copiedLink, setCopiedLink] = useState(false);"
)

# 4. Add URL ref detection in useEffect
old_effect = "  useEffect(() => {\n    const saved = localStorage.getItem('smartai_session');\n    if (saved) {"
new_effect = "  useEffect(() => {\n    const saved = localStorage.getItem('smartai_session');\n    if (!saved) {\n      const params = new URLSearchParams(window.location.search);\n      const refCode = params.get('ref');\n      if (refCode) {\n        setSignupReferCode(refCode);\n        setAuthMode('signup');\n      }\n    }\n    if (saved) {"
content = content.replace(old_effect, new_effect)

# 5. Add helper functions after syncUserData
helpers = '''

  const getDeviceId = () => {
    let deviceId = localStorage.getItem('smartai_device_id');
    if (!deviceId) {
      deviceId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('smartai_device_id', deviceId);
    }
    return deviceId;
  };

  const generateReferralCode = (email: string) => {
    const hash = email.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0);
    const suffix = Math.abs(hash).toString(36).substring(0, 4).toUpperCase();
    return `SMART${suffix}${Math.floor(Math.random() * 90 + 10)}`;
  };

  const processReferralReward = () => {
    const session = localStorage.getItem('smartai_session');
    if (!session) return;
    const d = JSON.parse(session);
    if (!d.referredBy || d.referralRewarded) return;

    const users = getUsers();
    const referrer = users.find((u: any) => u.referralCode === d.referredBy);
    if (!referrer) return;

    const newCredits = (d.credits || 0) + 50;
    const newReferralEarnings = (d.referralEarnings || 0) + 50;
    d.credits = newCredits;
    d.referralRewarded = true;
    d.referralEarnings = newReferralEarnings;
    localStorage.setItem('smartai_session', JSON.stringify(d));

    const referrerIdx = users.findIndex((u: any) => u.referralCode === d.referredBy);
    if (referrerIdx !== -1) {
      users[referrerIdx].credits = (users[referrerIdx].credits || 0) + 50;
      users[referrerIdx].referralEarnings = (users[referrerIdx].referralEarnings || 0) + 50;
      saveUsers(users);
    }

    alert('Referral reward credited! You and your friend got +50 credits.');
  };

  const getCurrentUserReferralData = () => {
    const session = localStorage.getItem('smartai_session');
    if (!session) return null;
    const d = JSON.parse(session);
    return {
      referralCode: d.referralCode || '',
      referralEarnings: d.referralEarnings || 0,
      referredBy: d.referredBy || ''
    };
  };

  const copyToClipboard = async (text: string, type: 'code' | 'link') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'code') { setCopiedCode(true); setTimeout(() => setCopiedCode(false), 2000); }
      else { setCopiedLink(true); setTimeout(() => setCopiedLink(false), 2000); }
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      if (type === 'code') { setCopiedCode(true); setTimeout(() => setCopiedCode(false), 2000); }
      else { setCopiedLink(true); setTimeout(() => setCopiedLink(false), 2000); }
    }
  };'''

# Insert after handleSaveProfile
content = content.replace(
    "  const handleSaveProfile = () => {\n    syncUserData({ displayName: tempName, avatar: tempAvatar });\n    setDisplayName(tempName);\n    setAvatar(tempAvatar);\n    setIsEditingProfile(false);\n  };",
    "  const handleSaveProfile = () => {\n    syncUserData({ displayName: tempName, avatar: tempAvatar });\n    setDisplayName(tempName);\n    setAvatar(tempAvatar);\n    setIsEditingProfile(false);\n  };" + helpers
)

# 6. Fix mobile chat input - change sticky to fixed
content = content.replace(
    '              <div className="sticky bottom-0 bg-slate-950/80 backdrop-blur-sm pb-24 md:pb-4">',
    '              <div className="fixed bottom-[4.5rem] left-0 right-0 md:sticky md:bottom-0 bg-transparent md:bg-slate-950/80 md:backdrop-blur-sm pb-2 md:pb-4 px-4 md:px-0 z-30">'
)

# 7. Remove credits remaining text
content = content.replace(
    '                <div className="text-center mt-2"><span className="text-[10px] text-slate-600 uppercase tracking-widest font-mono">{credits} credits remaining</span>\n                {smartMode === \'expert\' && plan !== \'Basic\' && <span className="ml-3 text-green-500">✓ File Upload Enabled (PRO)</span>}\n                </div>',
    '                {smartMode === \'expert\' && plan !== \'Basic\' && <div className="text-center mt-2"><span className="ml-3 text-green-500">✓ File Upload Enabled (PRO)</span></div>}'
)

# 8. Add processReferralReward call in handleSendMessage
content = content.replace(
    '      const userMsg: Message = { id: Date.now().toString(), role: \'user\' as const, content: prompt };',
    '      // Check and process referral reward on first message\n      processReferralReward();\n\n      const userMsg: Message = { id: Date.now().toString(), role: \'user\' as const, content: prompt };'
)

# 9. Add referral validation to handleSignup
old_signup_check = "      // Check for duplicate display name\n      if (users.find((u: any) => u.displayName?.toLowerCase() === signupName.toLowerCase())) {\n        alert('This display name is already taken. Please choose a different name.');\n        setIsAuthenticating(false);\n        return;\n      }\n      \n      const newUser = {"
new_signup_check = """      // Check for duplicate display name
      if (users.find((u: any) => u.displayName?.toLowerCase() === signupName.toLowerCase())) {
        alert('This display name is already taken. Please choose a different name.');
        setIsAuthenticating(false);
        return;
      }
      
      // Validate referral code if provided
      let referredBy = '';
      if (signupReferCode) {
        const referrer = users.find((u: any) => u.referralCode === signupReferCode);
        if (!referrer) {
          alert('Invalid referral code. Please check and try again, or leave it empty.');
          setIsAuthenticating(false);
          return;
        }
        // Prevent self-referral
        if (referrer.email === email || referrer.mobile === signupMobile) {
          alert('You cannot use your own referral code.');
          setIsAuthenticating(false);
          return;
        }
        referredBy = signupReferCode;
      }

      const userEmail = signupContactType === 'email' ? email : '';
      const userMobile = signupContactType === 'mobile' ? signupMobile : '';
      const newUser = {"""
content = content.replace(old_signup_check, new_signup_check)

# 10. Update newUser object in signup
old_newuser = """      const newUser = { 
        email: signupContactType === 'email' ? email : '', 
        password, 
        credits: 100, 
        plan: 'Basic', 
        displayName: signupName, 
        avatar: '', 
        name: signupName, 
        mobile: signupContactType === 'mobile' ? signupMobile : '', 
        referCode: signupReferCode 
      };"""
new_newuser = """      const newUser = { 
        email: userEmail, 
        password, 
        credits: 100, 
        plan: 'Basic', 
        displayName: signupName, 
        avatar: '', 
        name: signupName, 
        mobile: userMobile, 
        referCode: signupReferCode,
        referralCode: generateReferralCode(userEmail || userMobile || signupName),
        referredBy: referredBy,
        referralRewarded: false,
        deviceId: getDeviceId(),
        referralEarnings: 0
      };"""
content = content.replace(old_newuser, new_newuser)

# 11. Update signup success alert
old_alert = "      setIsLoggedIn(true);\n      alert('Account created successfully!');\n      setIsAuthenticating(false);"
new_alert = """      setIsLoggedIn(true);
      
      if (referredBy) {
        alert('Account created successfully! You've been referred by a friend. Send your first message to claim +50 bonus credits!');
      } else {
        alert('Account created successfully!');
      }
      setIsAuthenticating(false);"""
content = content.replace(old_alert, new_alert)

# 12. Update handleLogin to generate referral code for existing users
old_login_set = "      if (user) {\n        localStorage.setItem('smartai_session', JSON.stringify(user));"
new_login_set = """      if (user) {
        // Backward compatibility: ensure existing users have referral code
        if (!user.referralCode) {
          user.referralCode = generateReferralCode(user.email || user.mobile || user.displayName);
          user.referredBy = user.referredBy || '';
          user.referralRewarded = user.referralRewarded !== undefined ? user.referralRewarded : false;
          user.deviceId = user.deviceId || getDeviceId();
          user.referralEarnings = user.referralEarnings || 0;
          const userIdx = users.findIndex(u => u.email === user.email || u.mobile === user.mobile);
          if (userIdx !== -1) {
            users[userIdx] = user;
            saveUsers(users);
          }
        }
        localStorage.setItem('smartai_session', JSON.stringify(user));"""
content = content.replace(old_login_set, new_login_set)

# 13. Update syncUserData type
content = content.replace(
    "const syncUserData = (updates: Partial<{credits: number; plan: string; displayName: string; avatar: string}>) => {",
    "const syncUserData = (updates: Partial<{credits: number; plan: string; displayName: string; avatar: string; referralRewarded: boolean; referralEarnings: number}>) => {"
)

# 14. Add referral section to profile - replace the old profile bottom section
old_profile_bottom = '''                <button onClick={() => setIsPricingOpen(true)} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-xl font-bold text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2"><CreditCard className="w-5 h-5" /> Upgrade Plan</button>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">
                <h3 className="text-lg font-bold mb-4">Account</h3>
                <div className="space-y-3">
                  <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-slate-950 border border-slate-800 text-slate-400 hover:text-white py-3 rounded-xl transition-all text-xs uppercase tracking-widest font-bold"><LogOut className="w-4 h-4" /> Logout</button>
                </div>
              <div className="mt-6">
                <AdBanner />
              </div>
          )}'''

new_profile_bottom = '''                <button onClick={() => setIsPricingOpen(true)} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-xl font-bold text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2"><CreditCard className="w-5 h-5" /> Upgrade Plan</button>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 mb-6">
                <h3 className="text-lg font-bold mb-4">Refer &amp; Earn</h3>
                <div className="space-y-4">
                  {(() => {
                    const refData = getCurrentUserReferralData();
                    if (!refData) return null;
                    const referralLink = `${window.location.origin}${window.location.pathname}?ref=${refData.referralCode}`;
                    return (
                      <>
                        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
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
                        </p>
                      </>
                    );
                  })()}
                </div>
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">
                <h3 className="text-lg font-bold mb-4">Account</h3>
                <div className="space-y-3">
                  <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-slate-950 border border-slate-800 text-slate-400 hover:text-white py-3 rounded-xl transition-all text-xs uppercase tracking-widest font-bold"><LogOut className="w-4 h-4" /> Logout</button>
                </div>
              <div className="mt-6">
                <AdBanner />
              </div>
          )}'''

content = content.replace(old_profile_bottom, new_profile_bottom)

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('All changes applied successfully!')
