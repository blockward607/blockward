
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AuthService } from '@/services/AuthService';

export function useAuth() {
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
      
      // Get role from metadata
      let userRole = session.user.user_metadata?.role || 'student';
      let school = session.user.user_metadata?.school || '';
      let subject = session.user.user_metadata?.subject || '';
      let fullName = session.user.user_metadata?.full_name || 
                    session.user.user_metadata?.name || 
                    session.user.email.split('@')[0];
                    
      console.log('Determined role:', userRole);
      setUserRole(userRole);
      
      // Check if role exists
      const { data: existingRole, error: roleError } = await AuthService.checkUserRole(userId);
      
      if (roleError) {
        console.error('Error checking user role:', roleError);
      }
      
      if (!existingRole) {
        console.log('Creating new user role:', userRole);
        await AuthService.createUserRole(userId, userRole);
      } else {
        console.log('User role already exists:', existingRole);
        setUserRole(existingRole.role);
        userRole = existingRole.role; // Update local variable
      }
      
      // Check if wallet exists
      const { data: existingWallet, error: walletError } = await AuthService.checkUserWallet(userId);
      
      if (walletError) {
        console.error('Error checking user wallet:', walletError);
      }
      
      if (!existingWallet) {
        const walletType = userRole === 'teacher' ? 'admin' : 'user';
        const walletAddress = `${Math.random().toString(16).slice(2, 10)}_${Math.random().toString(16).slice(2, 10)}`;
        
        console.log('Creating new wallet:', { type: walletType, address: walletAddress });
        await AuthService.createUserWallet(userId, walletType, walletAddress);
      }
      
      // Create profile based on role
      if (userRole === 'teacher') {
        const { data: existingProfile, error: profileError } = await AuthService.checkTeacherProfile(userId);
        
        if (profileError) {
          console.error('Error checking teacher profile:', profileError);
        }
        
        if (!existingProfile) {
          console.log('Creating basic teacher profile');
          await AuthService.createTeacherProfile(userId, school, subject, fullName);
        }
      } else if (userRole === 'admin') {
        const { data: existingProfile, error: profileError } = await supabase
          .from('admin_profiles')
          .select('*')
          .eq('user_id', userId)
          .single();
        
        if (!existingProfile) {
          console.log('Creating admin profile');
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
        }
      } else {
        const { data: existingStudent, error: studentError } = await AuthService.checkStudentProfile(userId);
        
        if (studentError) {
          console.error('Error checking student profile:', studentError);
        }
        
        if (!existingStudent) {
          const email = session.user.email;
          const name = fullName || email.split('@')[0];
                      
          console.log('Creating student profile');
          await AuthService.createStudentProfile(userId, email, name, school);
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
      console.error("Unexpected error during account setup:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong during account setup. Please try again.",
      });
    }
  }, [navigate, toast]);

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        
        // Get the user role
        supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .single()
          .then(({ data }) => {
            if (data) {
              setUserRole(data.role);
              
              // Redirect admin users if they're on wrong page
              const currentPath = window.location.pathname;
              if (data.role === 'admin' && (currentPath === '/dashboard' || currentPath === '/auth')) {
                navigate('/admin-portal');
              } else if (data.role !== 'admin' && currentPath === '/admin-portal') {
                navigate('/dashboard');
              }
            }
          });
      } else {
        setUser(null);
        setUserRole(null);
      }
    });

    // Handle auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change event:', event);
      
      if (event === 'SIGNED_IN') {
        console.log('User signed in, setting up account');
        setUser(session?.user || null);
        await setupUserAccount(session);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setUserRole(null);
        navigate('/');
      } else if (event === 'USER_UPDATED') {
        console.log('User updated');
        setUser(session?.user || null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, setupUserAccount]);

  return { 
    loading, 
    setLoading, 
    user, 
    userRole, 
    isTeacher: userRole === 'teacher',
    isStudent: userRole === 'student',
    isAdmin: userRole === 'admin'
  };
}
