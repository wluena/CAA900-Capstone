import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react';
import { X } from 'lucide-react';
import { useEffect } from 'react';
import { fetchAuthSession } from 'aws-amplify/auth';

export default function AuthModal({ isOpen, onClose }) {
  /* --- 1. AUTH STATE TRACKING --- */
  // use Authenticator hook listens to the Amplify Auth state globally.
  // This allows the modal to know exactly when the user transitions from 'unauthenticated' to 'authenticated'.
  const { authStatus } = useAuthenticator((context) => [context.authStatus]);

  // Automatically close modal when user successfully signs in
  useEffect(() => {
    const verifyToken = async () => {
      if (authStatus === 'authenticated' && isOpen) {
        try {
          /* VERIFICATION 
             Manually fetch the session here to ensure the Cognito ID Token
             is valid and accessible. This token is what will be sent in the 
             'Authorization' header to Admin and Order Lambdas.
          */
          const session = await fetchAuthSession();
          const idToken = session.tokens?.idToken?.toString();
          
          console.log("Token Successfully Setup!");
          console.log("Token Payload:", session.tokens?.idToken?.payload);
          // If successful, automatically close the modal to return the user to the store.
          onClose();
        } catch (err) {
          console.error("Auth session failed:", err);
        }
      }
    };

    verifyToken();
  }, [authStatus, isOpen, onClose]); // Re-run effect if status changes or modal opens

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-zinc-900/90 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal Card */}
      <div className="relative bg-white rounded-[2rem] p-8 shadow-2xl animate-in zoom-in duration-300 min-width: max-content;">
        {/* Close Button: Allows user to exit the login flow without signing in */}
        <button onClick={onClose} className="absolute top-6 right-6 text-zinc-400 hover:text-black">
          <X size={20} />
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-black uppercase italic tracking-tighter">ElectroTech Access Portal</h2>
          <p className="text-[10px] text-rose-500 font-bold uppercase tracking-[0.2em]">Secure Gateway</p>
        </div>

        {/* --- 5. AWS AMPLIFY AUTHENTICATOR --- */
            /* This single component renders the entire Login, Sign Up, and Forgot Password 
               flows, automatically wired to Cognito User Pool. */}
        <Authenticator /> 
      </div>
    </div>
  );
}