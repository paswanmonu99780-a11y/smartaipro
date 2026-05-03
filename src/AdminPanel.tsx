import { useState, useEffect } from 'react';
import { Shield, Users, CreditCard, BarChart3, Lock, LogOut, Search, Download, User, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const ADMIN_PASSWORD = 'SmartAI@Admin2024';

interface UserData {
  email: string;
  password: string;
  credits: number;
  plan: string;
  displayName: string;
  avatar: string;
  name: string;
  mobile: string;
  referCode: string;
  referralCode: string;
  referredBy: string;
  referralRewarded: boolean;
  deviceId: string;
  referralEarnings: number;
}

export default function AdminPanel() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('smartai_admin_session') === 'active';
  });
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [users, setUsers] = useState<UserData[]>([]);
  const [search, setSearch] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<'all' | 'Basic' | 'Pro' | 'Ultra'>('all');
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [newCredits, setNewCredits] = useState<number>(0);
  const [newPlan, setNewPlan] = useState<string>('');

  useEffect(() => {
    if (isLoggedIn) {
      refreshData();
    }
  }, [isLoggedIn]);

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsLoggedIn(true);
      localStorage.setItem('smartai_admin_session', 'active');
      setError('');
      refreshData();
    } else {
      setError('Invalid admin password');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('smartai_admin_session');
  };

  const refreshData = () => {
    const data = localStorage.getItem('smartai_users');
    if (data) setUsers(JSON.parse(data));
  };

  const saveAllUsers = (updatedUsers: UserData[]) => {
    localStorage.setItem('smartai_users', JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
    
    // Also update session if the logged in user is the admin (though admin is usually separate)
    // For this app, the current user might be in the users list
    const session = localStorage.getItem('smartai_session');
    if (session) {
      const current = JSON.parse(session);
      const updatedMatch = updatedUsers.find(u => (u.email && u.email === current.email) || (u.mobile && u.mobile === current.mobile));
      if (updatedMatch) {
        localStorage.setItem('smartai_session', JSON.stringify(updatedMatch));
      }
    }
  };

  const updateUser = () => {
    if (!editingUser) return;
    const updatedUsers = users.map(u => {
      const isMatch = (u.email && u.email === editingUser.email) || (u.mobile && u.mobile === editingUser.mobile);
      if (isMatch) {
        return { ...u, credits: newCredits, plan: newPlan };
      }
      return u;
    });
    saveAllUsers(updatedUsers);
    setEditingUser(null);
    alert('User updated successfully!');
  };

  const deleteUser = (user: UserData) => {
    if (window.confirm(`Are you sure you want to delete ${user.displayName || user.email}?`)) {
      const updatedUsers = users.filter(u => !((u.email && u.email === user.email) || (u.mobile && u.mobile === user.mobile)));
      saveAllUsers(updatedUsers);
      alert('User deleted.');
    }
  };

  const exportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(users, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "smartai_users_export.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = !search || 
      u.displayName?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.mobile?.includes(search) ||
      u.referralCode?.toLowerCase().includes(search.toLowerCase());
    const matchesPlan = selectedPlan === 'all' || u.plan === selectedPlan;
    return matchesSearch && matchesPlan;
  });

  const stats = {
    totalUsers: users.length,
    totalCredits: users.reduce((sum, u) => sum + (u.credits || 0), 0),
    basicUsers: users.filter(u => u.plan === 'Basic').length,
    proUsers: users.filter(u => u.plan === 'Pro').length,
    ultraUsers: users.filter(u => u.plan === 'Ultra').length,
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center p-4 font-sans">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md bg-slate-900/50 border border-slate-800 rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 bg-rose-600 rounded-xl flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(225,29,72,0.3)]">
              <Shield className="text-white w-7 h-7" />
            </div>
            <h1 className="text-3xl font-medium tracking-tight text-white italic">Admin <span className="font-light text-slate-400 not-italic">Panel</span></h1>
            <p className="text-slate-500 text-sm mt-2 font-serif italic text-center">Restricted Access Only</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Admin Password</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:border-rose-500/50 transition-all font-mono text-sm"
                  placeholder="••••••••"
                />
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 w-5 h-5" />
              </div>
            </div>
            {error && <div className="text-rose-400 text-xs text-center">{error}</div>}
            <button
              onClick={handleLogin}
              className="w-full bg-rose-600 text-white py-3 rounded-lg hover:bg-rose-500 transition-all active:scale-95 shadow-lg shadow-rose-600/20 flex items-center justify-center gap-2 text-xs uppercase tracking-widest font-bold"
            >
              <Shield className="w-4 h-4" /> Access Dashboard
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-rose-600 rounded-lg flex items-center justify-center shrink-0">
              <Shield className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-[10px] md:text-xs text-slate-500 uppercase tracking-widest">SmartAI Pro Analytics</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <button onClick={exportData} className="flex-1 md:flex-none px-3 md:px-4 py-2.5 bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 border border-indigo-600/30 rounded-lg text-[10px] md:text-xs uppercase tracking-widest font-bold transition-all flex items-center justify-center gap-2">
              <Download className="w-4 h-4" /> Export
            </button>
            <button onClick={refreshData} className="flex-1 md:flex-none px-3 md:px-4 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-[10px] md:text-xs uppercase tracking-widest font-bold transition-all flex items-center justify-center">
              Refresh
            </button>
            <button onClick={handleLogout} className="flex-1 md:flex-none px-3 md:px-4 py-2.5 bg-rose-600/20 text-rose-400 hover:bg-rose-600/30 border border-rose-600/30 rounded-lg text-[10px] md:text-xs uppercase tracking-widest font-bold transition-all flex items-center justify-center gap-2">
              <LogOut className="w-4 h-4" /> Exit
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-indigo-400" />
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Total Users</span>
            </div>
            <div className="text-3xl font-bold text-white">{stats.totalUsers}</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Total Credits</span>
            </div>
            <div className="text-3xl font-bold text-white">{stats.totalCredits.toLocaleString()}</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4 text-slate-400" />
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Basic</span>
            </div>
            <div className="text-3xl font-bold text-slate-400">{stats.basicUsers}</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4 text-indigo-400" />
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Pro</span>
            </div>
            <div className="text-3xl font-bold text-indigo-400">{stats.proUsers}</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Ultra</span>
            </div>
            <div className="text-3xl font-bold text-emerald-400">{stats.ultraUsers}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 w-4 h-4" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, email, mobile, or referral code..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-indigo-500/50 transition-all"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'Basic', 'Pro', 'Ultra'] as const).map(plan => (
              <button
                key={plan}
                onClick={() => setSelectedPlan(plan)}
                className={`px-4 py-2 rounded-xl text-xs uppercase tracking-widest font-bold transition-all ${
                  selectedPlan === plan
                    ? plan === 'Basic' ? 'bg-slate-700 text-white' :
                      plan === 'Pro' ? 'bg-indigo-600 text-white' :
                      plan === 'Ultra' ? 'bg-emerald-600 text-white' :
                      'bg-indigo-600 text-white'
                    : 'bg-slate-900 border border-slate-800 text-slate-500 hover:text-white'
                }`}
              >
                {plan}
              </button>
            ))}
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden mb-10">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left px-4 py-3 text-[10px] uppercase font-bold text-slate-500 tracking-widest">#</th>
                  <th className="text-left px-4 py-3 text-[10px] uppercase font-bold text-slate-500 tracking-widest">User</th>
                  <th className="text-left px-4 py-3 text-[10px] uppercase font-bold text-slate-500 tracking-widest">Contact Info</th>
                  <th className="text-left px-4 py-3 text-[10px] uppercase font-bold text-slate-500 tracking-widest">Plan</th>
                  <th className="text-left px-4 py-3 text-[10px] uppercase font-bold text-slate-500 tracking-widest">Credits</th>
                  <th className="text-left px-4 py-3 text-[10px] uppercase font-bold text-slate-500 tracking-widest">Referral Info</th>
                  <th className="text-left px-4 py-3 text-[10px] uppercase font-bold text-slate-500 tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-500 text-sm">No users found</td>
                  </tr>
                ) : (
                  filteredUsers.map((user, index) => (
                    <tr key={index} className="border-b border-slate-800/50 hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 text-xs text-slate-400">{index + 1}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
                            {user.avatar ? <img src={user.avatar} alt="" className="w-full h-full rounded-full object-cover" /> : user.displayName?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm text-white font-medium">{user.displayName || 'N/A'}</span>
                            <span className="text-[9px] text-slate-500 uppercase tracking-widest">{user.deviceId?.slice(0, 8)}...</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs text-slate-300 font-mono">{user.email || '-'}</span>
                          <span className="text-xs text-slate-500 font-mono">{user.mobile || '-'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] px-2 py-1 rounded-full uppercase tracking-wider font-bold ${
                          user.plan === 'Pro' ? 'bg-indigo-600/20 text-indigo-400' :
                          user.plan === 'Ultra' ? 'bg-emerald-600/20 text-emerald-400' :
                          'bg-slate-700/50 text-slate-400'
                        }`}>
                          {user.plan || 'Basic'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-white font-bold">{(user.credits || 0).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] text-indigo-400 font-bold tracking-widest">{user.referralCode || '-'}</span>
                          {user.referredBy && <span className="text-[9px] text-slate-500">Ref By: {user.referredBy}</span>}
                          {user.referralEarnings > 0 && <span className="text-[9px] text-emerald-500 font-bold">Earned: {user.referralEarnings}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => {
                              setEditingUser(user);
                              setNewCredits(user.credits || 0);
                              setNewPlan(user.plan || 'Basic');
                            }}
                            className="p-1.5 bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600 hover:text-white rounded-lg transition-all"
                            title="Edit User"
                          >
                            <User className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => deleteUser(user)}
                            className="p-1.5 bg-rose-600/10 text-rose-400 hover:bg-rose-600 hover:text-white rounded-lg transition-all"
                            title="Delete User"
                          >
                            <Plus className="w-3.5 h-3.5 rotate-45" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-slate-800 text-[10px] text-slate-600 uppercase tracking-widest">
            Showing {filteredUsers.length} of {users.length} users
          </div>
        </div>
      </div>

      {/* Edit User Modal */}
      <AnimatePresence>
        {editingUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-xl font-bold text-white overflow-hidden">
                  {editingUser.avatar ? <img src={editingUser.avatar} className="w-full h-full object-cover" /> : editingUser.displayName?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Edit User</h3>
                  <p className="text-sm text-slate-500">{editingUser.email || editingUser.mobile}</p>
                </div>
              </div>

              <div className="space-y-6 mb-8">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Adjust Credits</label>
                  <input
                    type="number"
                    value={newCredits}
                    onChange={e => setNewCredits(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 transition-all font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Change Plan</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Basic', 'Pro', 'Ultra'].map(p => (
                      <button
                        key={p}
                        onClick={() => setNewPlan(p)}
                        className={`py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${newPlan === p ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-slate-800 text-slate-500 hover:text-white'}`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={updateUser} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/20 uppercase tracking-widest text-[10px]">Save Changes</button>
                <button onClick={() => setEditingUser(null)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl font-bold transition-all uppercase tracking-widest text-[10px]">Cancel</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

