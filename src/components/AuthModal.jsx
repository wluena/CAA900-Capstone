import { X } from 'lucide-react'
import { useState } from 'react'

export default function AuthModal({ isOpen, onClose }) {
  const [isLogin, setIsLogin] = useState(true);
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-900/90 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white p-8 md:p-12 rounded-[2rem] w-full max-w-md relative shadow-2xl animate-in zoom-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 text-zinc-400 hover:text-[#e11d48] transition-colors"
        >
          <X size={24} />
        </button>

        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black uppercase italic tracking-tighter text-zinc-900">
            {isLogin ? 'Member Login' : 'Create Account'}
          </h2>
          <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest mt-2">
            Access your performance gear
          </p>
        </div>

        {/* Form */}
        <form 
          onSubmit={(e) => { e.preventDefault(); onClose(); }} 
          className="flex flex-col gap-4"
        >
          {!isLogin && (
            <input 
              type="text" 
              placeholder="FULL NAME" 
              className="input-field" 
              required 
            />
          )}
          
          <input 
            type="email" 
            placeholder="EMAIL ADDRESS" 
            className="input-field" 
            required 
          />
          
          <input 
            type="password" 
            placeholder="PASSWORD" 
            className="input-field" 
            required 
          />

          <button onClick={() => alert("Connecting to Amazon Cognito..")} type="submit" className="btn-primary w-full mt-2 h-14">
            {isLogin ? 'Authorize' : 'Join Now'}
          </button>
        </form>

        {/* Switcher */}
        <button 
          onClick={() => setIsLogin(!isLogin)} 
          className="w-full mt-8 text-[10px] font-black text-[#e11d48] uppercase tracking-widest text-center hover:underline transition-all"
        >
          {isLogin ? "New here? Create account" : "Already a member? Sign in"}
        </button>
      </div>
    </div>
  );
}