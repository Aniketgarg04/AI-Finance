'use client';
import { GoogleOAuthProvider } from '@react-oauth/google';

// Client component wrapper so GoogleOAuthProvider can be used in RSC layout
export default function GoogleProvider({ children }: { children: React.ReactNode }) {
  return (
    <GoogleOAuthProvider clientId="558024169904-tgs3f6qg1gjdclqn0m1ka35hii46sibn.apps.googleusercontent.com">
      {children}
    </GoogleOAuthProvider>
  );
}
