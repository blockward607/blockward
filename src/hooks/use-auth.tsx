
import { useState, useEffect, createContext, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type UserRole = 'student' | 'teacher' | 'admin';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  userRole: UserRole | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const getUserRole = async (userId: string): Promise<UserRole | null> => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching user role:', error);
        return null;
      }

      return data?.role || null;
    } catch (error) {
      console.error('Error in getUserRole:', error);
      return null;
    }
  };

  const refreshAuth = async () => {
    try {
      const { data: { session: currentSession }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
        return;
      }

      setSession(currentSession);
      setUser(currentSession?.user || null);

      if (currentSession?.user) {
        const role = await getUserRole(currentSession.user.id);
        setUserRole(role);
      } else {
        setUserRole(null);
      }
    } catch (error) {
      console.error('Error refreshing auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
        toast({
          variant: "destructive",
          title: "Error signing out",
          description: error.message
        });
      } else {
        setSession(null);
        setUser(null);
        setUserRole(null);
      }
    } catch (error) {
      console.error('Error in signOut:', error);
    }
  };

  useEffect(() => {
    refreshAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        setSession(session);
        setUser(session?.user || null);

        if (session?.user) {
          const role = await getUserRole(session.user.id);
          setUserRole(role);
          
          // Create default classroom for new teachers
          if (role === 'teacher' && event === 'SIGNED_IN') {
            try {
              // Get teacher profile
              const { data: teacherProfile, error: profileError } = await supabase
                .from('teacher_profiles')
                .select('id, school_id')
                .eq('user_id', session.user.id)
                .single();

              if (!profileError && teacherProfile) {
                // Check if teacher already has classrooms
                const { data: existingClassrooms } = await supabase
                  .from('classrooms')
                  .select('id')
                  .eq('teacher_id', teacherProfile.id)
                  .limit(1);

                if (!existingClassrooms || existingClassrooms.length === 0) {
                  // Create default classroom
                  await supabase
                    .from('classrooms')
                    .insert([{
                      teacher_id: teacherProfile.id,
                      name: 'My First Classroom',
                      description: 'Welcome to your first classroom!',
                      school_id: teacherProfile.school_id
                    }]);
                  
                  console.log('Created default classroom for new teacher');
                }
              }
            } catch (error) {
              console.error('Error creating default classroom:', error);
            }
          }
        } else {
          setUserRole(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const value: AuthContextType = {
    session,
    user,
    userRole,
    loading,
    signOut,
    refreshAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
