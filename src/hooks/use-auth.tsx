import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: string | null;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  userRole: null,
  loading: true,
  setLoading: () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  const getUserRole = async (userId: string): Promise<string | null> => {
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
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        variant: "destructive",
        title: "Error signing out",
        description: error.message,
      });
    } else {
      navigate('/');
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        setSession(session);
        setUser(session?.user || null);

        if (session?.user) {
          // Defer async operations to prevent deadlock
          setTimeout(async () => {
            try {
              const role = await getUserRole(session.user.id);
              setUserRole(role);
              
              // Create default classroom for new teachers
              if (role === 'teacher' && event === 'SIGNED_IN') {
                try {
                  const { data: teacherProfile, error: profileError } = await supabase
                    .from('teacher_profiles')
                    .select('id, school_id')
                    .eq('user_id', session.user.id)
                    .single();

                  if (!profileError && teacherProfile) {
                    const { data: existingClassrooms } = await supabase
                      .from('classrooms')
                      .select('id')
                      .eq('teacher_id', teacherProfile.id)
                      .limit(1);

                    if (!existingClassrooms || existingClassrooms.length === 0) {
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
            } catch (error) {
              console.error('Error in auth state change handler:', error);
            }
          }, 0);
        } else {
          setUserRole(null);
        }
        
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        getUserRole(session.user.id).then(setUserRole);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    user,
    session,
    userRole,
    loading,
    setLoading,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
