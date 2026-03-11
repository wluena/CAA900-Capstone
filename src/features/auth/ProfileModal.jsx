import React from 'react';
import { X, User, Mail, Calendar, ShieldCheck, BadgeCheck } from 'lucide-react';

export default function ProfileModal({ isOpen, onClose, user }) {
  if (!isOpen || !user) return null;

  // Extracting data from the Amplify user object
  const email = user.signInDetails?.loginId || user.attributes?.email;
  const userId = user.userId || user.username;
  const groups = user.tokens?.accessToken?.payload['cognito:groups'] || [];
  const isAdmin = groups.includes('Admins');

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose} 
      />

      {/* Modal Card */}
      <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-zinc-100">
        
        {/* Header Header */}
        <div className="bg-zinc-900 p-8 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
          
          <div className="w-20 h-20 bg-rose-500 rounded-3xl flex items-center justify-center mb-4 shadow-lg rotate-3">
             <User size={40} className="text-white -rotate-3" />
          </div>
          
          <h2 className="text-3xl font-black uppercase italic tracking-tighter">Account Profile</h2>
          <div className="flex gap-2 mt-2">
            {isAdmin && (
              <span className="bg-rose-500 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1">
                <ShieldCheck size={10} /> System Admin
              </span>
            )}
            <span className="bg-zinc-700 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1">
              <BadgeCheck size={10} /> Verified User
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-8 space-y-6">
          
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
              <div className="p-2 bg-white rounded-xl shadow-sm">
                <Mail size={18} className="text-zinc-400" />
              </div>
              <div>
                <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Email Address</p>
                <p className="text-sm font-bold text-zinc-900">{email}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
              <div className="p-2 bg-white rounded-xl shadow-sm">
                <Calendar size={18} className="text-zinc-400" />
              </div>
              <div>
                <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Member Since</p>
                <p className="text-sm font-bold text-zinc-900">
                  {/* Note: Cognito date is often in metadata. This is a placeholder for standard formats */}
                  {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
              <div className="p-2 bg-white rounded-xl shadow-sm">
                <ShieldCheck size={18} className="text-zinc-400" />
              </div>
              <div className="overflow-hidden">
                <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">User ID (Sub)</p>
                <p className="text-[10px] font-mono font-bold text-zinc-500 truncate">{userId}</p>
              </div>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-rose-600 transition-all active:scale-95 shadow-xl"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
}