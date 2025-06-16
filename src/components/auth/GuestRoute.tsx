
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface GuestRouteProps {
  children: React.ReactNode;
}

export const GuestRoute: React.FC<GuestRouteProps> = ({ children }) => {
  const navigate = useNavigate();
  const [isGuest, setIsGuest] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (session) {
          console.log('User is authenticated, redirecting to dashboard');
          navigate('/dashboard');
          setIsGuest(false);
        } else {
          console.log('No session found, user can access auth page');
          setIsGuest(true);
        }
      } catch (error) {
        if (!mounted) return;
        console.error('Guest route error:', error);
        setIsGuest(true);
      }
    };

    checkAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state changed in guest route:', event);
        if (event === 'SIGNED_IN' && session) {
          setIsGuest(false);
          navigate('/dashboard');
        } else if (event === 'SIGNED_OUT') {
          setIsGuest(true);
        }
      }
    );

    return () => {
      mounted = false;
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [navigate]);

  if (isGuest === null) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gradient-to-b from-[#1A1F2C] to-black">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-purple-500" />
          <p className="text-lg font-medium text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (isGuest === false) {
    return null;
  }

  return <>{children}</>;
};

export default GuestRoute;
