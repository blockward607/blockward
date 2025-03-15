
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface NFT {
  id: string;
  image_url: string | null;
  metadata?: {
    name?: string;
    description?: string;
  };
}

export const useStudentData = () => {
  const [studentEmail, setStudentEmail] = useState<string | null>(null);
  const [studentPoints, setStudentPoints] = useState<number>(0);
  const [studentName, setStudentName] = useState<string | null>(null);
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  const { toast } = useToast();

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsAuthenticated(true);
        await fetchStudentInfo();
        await fetchStudentNFTs();
      } else {
        // Check if this is a demo view
        const path = window.location.pathname;
        if (path === '/view-student-dashboard') {
          setIsDemo(true);
          // Load some demo data
          setStudentName('Demo Student');
          setStudentEmail('demo@example.com');
          setStudentPoints(150);
          setNfts([
            {
              id: '1',
              image_url: '/placeholder.svg',
              metadata: {
                name: 'Perfect Attendance',
                description: 'Attended all classes for a month'
              }
            },
            {
              id: '2',
              image_url: '/placeholder.svg',
              metadata: {
                name: 'Math Wizard',
                description: 'Completed all advanced math assignments'
              }
            }
          ]);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const fetchStudentInfo = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Get student email
      setStudentEmail(session.user.email);

      // Get student points and name
      const { data: studentData, error } = await supabase
        .from('students')
        .select('points, name')
        .eq('user_id', session.user.id)
        .single();

      if (error) throw error;
      setStudentPoints(studentData?.points || 0);
      setStudentName(studentData?.name || 'Student');
    } catch (error) {
      console.error('Error fetching student info:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load student information"
      });
    }
  };

  const fetchStudentNFTs = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Get wallet id
      const { data: walletData } = await supabase
        .from('wallets')
        .select('id')
        .eq('user_id', session.user.id)
        .single();

      if (walletData) {
        // Get NFTs for this wallet
        const { data: nftData } = await supabase
          .from('nfts')
          .select('*')
          .eq('owner_wallet_id', walletData.id)
          .limit(3);

        setNfts(nftData || []);
      }
    } catch (error) {
      console.error('Error fetching NFTs:', error);
    }
  };

  return {
    studentEmail,
    studentPoints,
    studentName,
    nfts,
    loading,
    isAuthenticated,
    isDemo
  };
};
