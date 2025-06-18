
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AuthService } from '@/services/AuthService';

interface AuthContextType {
  loading: boolean;
  setLoading: (loading: boolean) => void;
  user: any;
  userRole: string | null;
  isTeacher: boolean;
  isStudent: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  const setupUserAccount = useCallback(async (session) => {
    if (!session) return;
    
    try {
      console.log('Setting up user account for:', session.user.id);
      
      const userId = session.user.id;
      
      // Get role from metadata with fallback
      let userRole = session.user.user_metadata?.role || 'student';
      let school = session.user.user_metadata?.school || '';
      let subject = session.user.user_metadata?.subject || '';
      let fullName = session.user.user_metadata?.full_name || 
                    session.user.user_metadata?.name || 
                    session.user.email.split('@')[0];
                    
      console.log('Determined role:', userRole);
      
      // Check if role exists in database with timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Role check timeout')), 5000)
      );
      
      const rolePromise = AuthService.checkUserRole(userId);
      
      let existingRole = null;
      let roleError = null;
      
      try {
        const result = await Promise.race([rolePromise, timeoutPromise]);
        if (result && typeof result === 'object' && 'data' in result) {
          existingRole = (result as any).data;
          roleError = (result as any).error;
        }
      } catch (error) {
        console.error('Role check failed or timed out:', error);
        roleError = error;
      }
      
      if (roleError && !roleError.message?.includes('No rows found')) {
        console.error('Error checking user role:', roleError);
        // Don't throw - continue with fallback
      }
      
      if (!existingRole) {
        console.log('Creating new user role:', userRole);
        try {
          await AuthService.createUserRole(userId, userRole);
          setUserRole(userRole);
        } catch (error) {
          console.error('Failed to create user role, using fallback:', error);
          setUserRole('student'); // Always set a role
        }
      } else {
        console.log('User role already exists:', existingRole);
        setUserRole(existingRole.role);
        userRole = existingRole.role;
      }
      
      // Check if wallet exists
      const { data: existingWallet } = await AuthService.checkUserWallet(userId);
      
      if (!existingWallet) {
        const walletType = userRole === 'teacher' ? 'admin' : 'user';
        const walletAddress = `${Math.random().toString(16).slice(2, 10)}_${Math.random().toString(16).slice(2, 10)}`;
        
        console.log('Creating new wallet:', { type: walletType, address: walletAddress });
        try {
          await AuthService.createUserWallet(userId, walletType, walletAddress);
        } catch (error) {
          console.error('Failed to create wallet:', error);
          // Don't block on wallet creation
        }
      }
      
      // Create profile based on role
      if (userRole === 'teacher') {
        const { data: existingProfile } = await AuthService.checkTeacherProfile(userId);
        
        if (!existingProfile) {
          console.log('Creating basic teacher profile');
          try {
            await AuthService.createTeacherProfile(userId, school, subject, fullName);
          } catch (error) {
            console.error('Failed to create teacher profile:', error);
          }
        }
      } else if (userRole === 'admin') {
        const { data: existingProfile } = await supabase
          .from('admin_profiles')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();
        
        if (!existingProfile) {
          console.log('Creating admin profile');
          try {
            await supabase
              .from('admin_profiles')
              .insert({
                user_id: userId,
                school_id: '00000000-0000-0000-0000-000000000001',
                full_name: fullName,
                position: 'Administrator',
                permissions: {
                  manage_teachers: true,
                  manage_students: true,
                  manage_classes: true,
                  manage_settings: true,
                  system_admin: true
                }
              });
          } catch (error) {
            console.error('Failed to create admin profile:', error);
          }
        }
      } else {
        const { data: existingStudent } = await AuthService.checkStudentProfile(userId);
        
        if (!existingStudent) {
          const email = session.user.email;
          const name = fullName || email.split('@')[0];
                      
          console.log('Creating student profile');
          try {
            await AuthService.createStudentProfile(userId, email, name, school);
          } catch (error) {
            console.error('Failed to create student profile:', error);
          }
        }
      }
      
      toast({
        title: "Welcome!",
        description: "You have successfully signed in.",
      });
      
      // Navigate based on role
      const currentPath = window.location.pathname;
      if (currentPath === '/auth' || currentPath === '/admin-auth' || currentPath === '/') {
        if (userRole === 'admin') {
          navigate('/admin-portal');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (error) {
      console.error("Error during account setup:", error);
      // Always set a fallback role to prevent infinite loading
      setUserRole('student');
      toast({
        variant: "destructive",
        title: "Setup Error",
        description: "Account setup had issues but you can continue as a student.",
      });
    }
  }, [navigate, toast]);

  useEffect(() => {
    let mounted = true;
    
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      
      if (session) {
        console.log('Found existing session for user:', session.user.id);
        setUser(session.user);
        
        // Get the user role from database with timeout
        const fetchRoleWithTimeout = async () => {
          try {
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Role fetch timeout')), 5000)
            );
            
            const rolePromise = supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', session.user.id)
              .maybeSingle();
            
            let data = null;
            let error = null;
            
            try {
              const result = await Promise.race([rolePromise, timeoutPromise]);
              if (result && typeof result === 'object' && 'data' in result) {
                data = (result as any).data;
                error = (result as any).error;
              }
            } catch (timeoutError) {
              console.error('Role fetch timed out:', timeoutError);
              error = timeoutError;
            }
            
            if (error) {
              console.error('Error fetching user role:', error);
              setUserRole('student'); // Fallback role
              return;
            }
            
            if (data) {
              console.log('Setting user role from database:', data.role);
              setUserRole(data.role);
              
              // Redirect admin users if they're on wrong page
              const currentPath = window.location.pathname;
              if (data.role === 'admin' && (currentPath === '/dashboard' || currentPath === '/auth')) {
                navigate('/admin-portal');
              } else if (data.role !== 'admin' && currentPath === '/admin-portal') {
                navigate('/dashboard');
              }
            } else {
              console.log('No role found for user, setting up account');
              await setupUserAccount(session);
            }
          } catch (error) {
            console.error('Failed to fetch role:', error);
            setUserRole('student'); // Always set fallback
          }
        };
        
        fetchRoleWithTimeout();
      } else {
        console.log('No active session found');
        setUser(null);
        setUserRole(null);
      }
    });

    // Handle auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      console.log('Auth state change event:', event);
      
      if (event === 'SIGNED_IN') {
        console.log('User signed in, setting up account');
        setUser(session?.user || null);
        await setupUserAccount(session);
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
        setUser(null);
        setUserRole(null);
        navigate('/');
      } else if (event === 'USER_UPDATED') {
        console.log('User updated');
        setUser(session?.user || null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, setupUserAccount]);

  const value = {
    loading,
    setLoading,
    user,
    userRole,
    isTeacher: userRole === 'teacher',
    isStudent: userRole === 'student',
    isAdmin: userRole === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
