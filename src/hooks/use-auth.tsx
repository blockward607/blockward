
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
      console.log('Auth provider:', session.user.app_metadata?.provider);
      console.log('User metadata:', session.user.user_metadata);
      
      const userId = session.user.id;
      
      // For auth providers, determine the role differently
      // Check if we have role in user metadata, otherwise assume 'student'
      let userRole;
      let school = '';
      let subject = '';
      let fullName = '';
      
      if (session.user.app_metadata?.provider === 'google' || 
          session.user.app_metadata?.provider === 'github' || 
          session.user.app_metadata?.provider === 'facebook') {
        // If coming from social login, check if a role was passed in the queryParams
        // or metadata, otherwise use 'student' as default
        userRole = session.user.user_metadata?.role || 
                  session.user.app_metadata?.role || 
                  'student';
        
        // Try to get additional profile data
        school = session.user.user_metadata?.school || '';
        subject = session.user.user_metadata?.subject || '';
        fullName = session.user.user_metadata?.full_name || 
                  session.user.user_metadata?.name || 
                  session.user.email.split('@')[0];
                  
        console.log('Determined role for social auth user:', userRole);
      } else {
        // Regular email login
        userRole = session.user.user_metadata?.role || 'student';
        school = session.user.user_metadata?.school || '';
        subject = session.user.user_metadata?.subject || '';
        fullName = session.user.user_metadata?.full_name || 
                  session.user.user_metadata?.name || 
                  session.user.email.split('@')[0];
        
        console.log('Determined role for email auth user:', userRole);
      }
      
      setUserRole(userRole);
      
      // Check if role exists
      const { data: existingRole, error: roleError } = await AuthService.checkUserRole(userId);
      
      if (roleError) {
        console.error('Error checking user role:', roleError);
      }
      
      if (!existingRole) {
        console.log('Creating new user role:', userRole);
        // Create role
        await AuthService.createUserRole(userId, userRole);
      } else {
        console.log('User role already exists:', existingRole);
      }
      
      // Check if wallet exists
      const { data: existingWallet, error: walletError } = await AuthService.checkUserWallet(userId);
      
      if (walletError) {
        console.error('Error checking user wallet:', walletError);
      }
      
      if (!existingWallet) {
        // Create wallet based on role - teacher wallets are 'admin' type, student wallets are 'user' type
        const walletType = userRole === 'teacher' ? 'admin' : 'user';
        const walletAddress = `${Math.random().toString(16).slice(2, 10)}_${Math.random().toString(16).slice(2, 10)}`;
        
        console.log('Creating new wallet:', { type: walletType, address: walletAddress });
        
        // Create wallet
        await AuthService.createUserWallet(userId, walletType, walletAddress);
      } else {
        console.log('User wallet already exists:', existingWallet);
      }
      
      // Create profile based on role
      if (userRole === 'teacher') {
        const { data: existingProfile, error: profileError } = await AuthService.checkTeacherProfile(userId);
        
        if (profileError) {
          console.error('Error checking teacher profile:', profileError);
        }
        
        if (!existingProfile) {
          console.log('Creating teacher profile with school and subject');
          await AuthService.createTeacherProfile(userId, school, subject, fullName);
          
          // Generate a unique class code for teacher
          const classCode = await AuthService.generateClassCode();
          
          // Create a default classroom for the teacher
          const { data: teacherProfile } = await supabase
            .from('teacher_profiles')
            .select('id')
            .eq('user_id', userId)
            .single();
            
          if (teacherProfile) {
            const className = subject ? `${subject} Class` : 'My First Class';
            
            await supabase
              .from('classrooms')
              .insert({
                teacher_id: teacherProfile.id,
                name: className,
                description: 'Welcome to your first classroom!'
              });
          }
        } else {
          console.log('Teacher profile already exists');
        }
      } else {
        // For students
        const { data: existingStudent, error: studentError } = await AuthService.checkStudentProfile(userId);
        
        if (studentError) {
          console.error('Error checking student profile:', studentError);
        }
        
        if (!existingStudent) {
          const email = session.user.email;
          const name = fullName || email.split('@')[0];
                      
          console.log('Creating student profile with name and school:', name, school);
          await AuthService.createStudentProfile(userId, email, name, school);
        } else {
          console.log('Student profile already exists');
        }
      }
      
      toast({
        title: "Welcome!",
        description: "You have successfully signed in.",
      });
      
      // Instead of forcing redirect, allow the navigation to happen naturally
      // We'll still redirect on first login
      const currentPath = window.location.pathname;
      if (currentPath === '/auth') {
        navigate('/dashboard');
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
            }
          });
          
        console.log('Found existing session, navigating to dashboard');
        
        // Don't automatically navigate to dashboard if we're already on another page
        const currentPath = window.location.pathname;
        if (currentPath === '/' || currentPath === '/auth') {
          navigate('/dashboard');
        }
      } else {
        console.log('No existing session found');
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
    isStudent: userRole === 'student'
  };
}
