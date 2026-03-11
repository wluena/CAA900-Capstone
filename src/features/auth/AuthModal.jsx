import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react';
import { X } from 'lucide-react';
import { useEffect } from 'react';
import { fetchAuthSession } from 'aws-amplify/auth';

export default function AuthModal({ isOpen, onClose }) {
  const { authStatus } = useAuthenticator((context) => [context.authStatus]);

  // Automatically close modal when user successfully signs in
  useEffect(() => {
    const verifyToken = async () => {
      if (authStatus === 'authenticated' && isOpen) {
        try {
          // direct way to check if the JWT setup worked
          const session = await fetchAuthSession();
          const idToken = session.tokens?.idToken?.toString();
          
          //console.log("✅ JWT Successfully Setup!");
          //console.log("Token Payload:", session.tokens?.idToken?.payload);
          
          onClose();
        } catch (err) {
          console.error("Auth session failed:", err);
        }
      }
    };

    verifyToken();
  }, [authStatus, isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-zinc-900/90 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal Card */}
      <div className="relative bg-white rounded-[2rem] p-8 shadow-2xl animate-in zoom-in duration-300 min-width: max-content;">
        <button onClick={onClose} className="absolute top-6 right-6 text-zinc-400 hover:text-black">
          <X size={20} />
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-black uppercase italic tracking-tighter">ElectroTech Access Portal</h2>
          <p className="text-[10px] text-rose-500 font-bold uppercase tracking-[0.2em]">Secure Gateway</p>
        </div>

        {/* The Actual AWS Logic */}
        <Authenticator /> 
      </div>
    </div>
  );
}