import { motion } from "framer-motion";
import { Sparkles, Trophy, Star, Medal, Crown, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Student {
  id: string;
  name: string;
  points: number;
  user_id: string;
}

interface BlockWard {
  id: string;
  title: string;
  description: string;
  icon: any;
  gradient: string;
  points: number;
  image?: string;
}

const defaultBlockWards: BlockWard[] = [
  {
    id: "academic-1",
    title: "Academic Excellence Trophy",
    description: "Awarded for outstanding academic achievement",
    icon: Trophy,
    gradient: "from-yellow-400 to-orange-500",
    points: 1000,
    image: "https://images.unsplash.com/photo-1673548917471-3113dedda9a5?q=80&w=1000",
  },
  {
    id: "innovation-1",
    title: "Innovation Star",
    description: "Recognition for creative thinking and innovation",
    icon: Star,
    gradient: "from-purple-400 to-pink-500",
    points: 750,
    image: "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=2874",
  },
  {
    id: "leadership-1", 
    title: "Leadership Crown",
    description: "Awarded for exceptional leadership qualities",
    icon: Crown,
    gradient: "from-blue-400 to-cyan-500",
    points: 850,
    image: "https://images.unsplash.com/photo-1551818255-e6e10975bc17?q=80&w=3024",
  },
  {
    id: "stem-1",
    title: "STEM Excellence",
    description: "Outstanding achievement in Science and Technology",
    icon: Brain,
    gradient: "from-green-400 to-emerald-500",
    points: 900,
    image: "https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?q=80&w=2970",
  },
  {
    id: "sports-1",
    title: "Sports Champion",
    description: "Excellence in athletic performance",
    icon: Medal,
    gradient: "from-red-400 to-rose-500",
    points: 800,
    image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=3024",
  },
  {
    id: "special-1",
    title: "Special Achievement",
    description: "Recognition for exceptional accomplishment",
    icon: Sparkles,
    gradient: "from-indigo-400 to-violet-500",
    points: 700,
    image: "https://images.unsplash.com/photo-1581574919402-5b7d688a0583?q=80&w=2576",
  },
];

export const BlockWardShowcase = () => {
  const { toast } = useToast();
  const [transferring, setTransferring] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [students, setStudents] = useState<Student[]>([]);
  const [dbBlockWards, setDbBlockWards] = useState<BlockWard[]>([]);
  const [blockWards, setBlockWards] = useState<BlockWard[]>(defaultBlockWards);
  const [isTeacher, setIsTeacher] = useState(false);
  
  const fetchUserRole = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();
        
      setIsTeacher(userRole?.role === 'teacher');
    } catch (error) {
      console.error("Error fetching user role:", error);
    }
  };

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('name');

      if (error) throw error;
      
      const demoEmails = ["arya47332js@gmail.com", "youthinkofc@gmail.com"];
      
      for (const email of demoEmails) {
        const username = email.split('@')[0];
        const { data: existingStudent } = await supabase
          .from('students')
          .select('id')
          .eq('name', username)
          .maybeSingle();
          
        if (!existingStudent) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            console.log(`Creating demo student: ${username}`);
            
            const { data: newStudent, error: studentError } = await supabase
              .from('students')
              .insert({
                name: username,
                points: 0
              })
              .select()
              .single();
              
            if (studentError) {
              console.error(`Error creating demo student ${username}:`, studentError);
            } else {
              console.log(`Demo student created: ${username}`);
            }
          }
        }
      }
      
      const { data: updatedData, error: refetchError } = await supabase
        .from('students')
        .select('*')
        .order('name');
        
      if (refetchError) throw refetchError;
      
      setStudents(updatedData || []);
    } catch (error: any) {
      console.error('Error fetching students:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load students"
      });
    }
  };
  
  const fetchCustomBlockWards = async () => {
    try {
      const { data, error } = await supabase
        .from('nfts')
        .select('*')
        .is('owner_wallet_id', null);
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        const customBlockWards = data.map(nft => {
          const metadata = typeof nft.metadata === 'string' 
            ? JSON.parse(nft.metadata) 
            : nft.metadata;
            
          return {
            id: nft.id,
            title: metadata.name || `BlockWard #${nft.id.substring(0, 4)}`,
            description: metadata.description || "Educational achievement BlockWard",
            icon: getIconForType(metadata.type || 'academic'),
            gradient: getGradientForType(metadata.type || 'academic'),
            points: metadata.points || 100,
            image: nft.image_url
          };
        });
        
        setDbBlockWards(customBlockWards);
      }
    } catch (error) {
      console.error('Error fetching custom BlockWards:', error);
    }
  };

  useEffect(() => {
    fetchUserRole();
    fetchStudents();
    fetchCustomBlockWards();
  }, []); 
  
  useEffect(() => {
    setBlockWards([...defaultBlockWards, ...dbBlockWards]);
  }, [dbBlockWards]);

  const getIconForType = (type: string) => {
    switch (type) {
      case 'academic': return Trophy;
      case 'innovation': return Star;
      case 'leadership': return Crown;
      case 'stem': return Brain;
      case 'sports': return Medal;
      default: return Sparkles;
    }
  };
  
  const getGradientForType = (type: string) => {
    switch (type) {
      case 'academic': return "from-yellow-400 to-orange-500";
      case 'innovation': return "from-purple-400 to-pink-500";
      case 'leadership': return "from-blue-400 to-cyan-500";
      case 'stem': return "from-green-400 to-emerald-500";
      case 'sports': return "from-red-400 to-rose-500";
      default: return "from-indigo-400 to-violet-500";
    }
  };

  const transferBlockWard = async (blockWard: BlockWard, studentId: string) => {
    if (!studentId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a student first"
      });
      return;
    }

    try {
      setTransferring(blockWard.id);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        throw new Error('No authenticated user found');
      }

      const userId = session.user.id;

      let teacherWallet = await getOrCreateTeacherWallet(userId);
      if (!teacherWallet) {
        throw new Error('Failed to get or create teacher wallet');
      }

      const { data: studentData } = await supabase
        .from('students')
        .select('user_id, name')
        .eq('id', studentId)
        .single();
        
      if (!studentData) {
        throw new Error('Student not found');
      }
      
      const studentUserId = studentData.user_id || studentId;
      
      const { data: studentWallet, error: studentWalletError } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', studentUserId)
        .maybeSingle();

      if (studentWalletError && !studentWalletError.message.includes('No rows found')) {
        throw studentWalletError;
      }
      
      let finalStudentWallet = studentWallet;
      
      if (!studentWallet) {
        console.log(`Creating wallet for student ${studentData.name} with user_id ${studentUserId}`);
        
        const { data: newWallet, error: createError } = await supabase
          .from('wallets')
          .insert({
            user_id: studentUserId,
            address: "wallet_" + Math.random().toString(16).slice(2, 10),
            type: "user"
          })
          .select()
          .single();
          
        if (createError) {
          console.error('Error creating wallet:', createError);
          throw createError;
        }
        
        console.log('Created new wallet:', newWallet);
        finalStudentWallet = newWallet;
      }

      if (!finalStudentWallet) {
        throw new Error('Failed to get or create student wallet');
      }

      const { data: blockWardData, error: blockWardError } = await supabase
        .from('nfts')
        .insert({
          token_id: `award-${Date.now()}`,
          contract_address: "0x" + Math.random().toString(16).slice(2, 42),
          metadata: JSON.stringify({
            name: blockWard.title,
            description: blockWard.description,
            points: blockWard.points,
            created_at: new Date().toISOString(),
            image: blockWard.image,
            attributes: [
              {
                trait_type: "Type",
                value: blockWard.id.split('-')[0]
              },
              {
                trait_type: "Points",
                value: blockWard.points.toString()
              }
            ]
          }),
          image_url: blockWard.image,
          creator_wallet_id: teacherWallet.id,
          owner_wallet_id: finalStudentWallet.id,
          network: "testnet",
        })
        .select()
        .single();

      if (blockWardError) {
        console.error('Error creating NFT:', blockWardError);
        throw blockWardError;
      }

      console.log('Created NFT:', blockWardData);

      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          nft_id: blockWardData.id,
          from_wallet_id: teacherWallet.id,
          to_wallet_id: finalStudentWallet.id,
          transaction_hash: "0x" + Math.random().toString(16).slice(2, 62),
          status: 'completed',
        });

      if (transactionError) {
        console.error('Error creating transaction:', transactionError);
        throw transactionError;
      }

      const { error: updateError } = await supabase.rpc('increment_student_points', {
        student_id: studentId,
        points_to_add: blockWard.points
      });

      if (updateError) {
        console.error('Error updating student points:', updateError);
        throw updateError;
      }

      toast({
        title: "Success",
        description: `${blockWard.title} has been transferred to ${studentData.name}!`,
      });
      
      await fetchStudents();
    } catch (error: any) {
      console.error('Error transferring BlockWard:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to transfer BlockWard",
      });
    } finally {
      setTransferring(null);
    }
  };

  const getOrCreateTeacherWallet = async (userId: string) => {
    const { data: existingWallet, error: getError } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (getError) throw getError;
    if (existingWallet) return existingWallet;

    const { data: newWallet, error: createError } = await supabase
      .from('wallets')
      .insert({
        user_id: userId,
        address: "wallet_" + Math.random().toString(16).slice(2, 10),
        type: "admin"
      })
      .select()
      .single();

    if (createError) throw createError;
    return newWallet;
  };

  return (
    <section className="py-16 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(155,135,245,0.2),transparent_70%)]" />
      <motion.div 
        className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(236,72,153,0.1),transparent_50%)]"
        animate={{
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <div className="container mx-auto px-4 relative">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <motion.h2 
            className="text-4xl md:text-6xl font-bold mb-4 gradient-text"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            BlockWard Awards Collection
          </motion.h2>
          <motion.p
            className="text-xl text-gray-300 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Unique blockchain-backed rewards that recognize student achievements and build a lasting digital portfolio
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blockWards.map((blockWard, index) => (
            <motion.div
              key={blockWard.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10, scale: 1.03 }}
              className="glass-card p-8 text-center group relative overflow-hidden"
              style={{
                backgroundImage: `radial-gradient(circle at bottom right, rgba(${index * 40}, ${100 + index * 20}, ${200 - index * 10}, 0.2), transparent)`,
              }}
            >
              <motion.div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                animate={{
                  background: [
                    `radial-gradient(circle at center, rgba(${index * 40}, ${100 + index * 20}, ${200 - index * 10}, 0.3) 0%, transparent 70%)`,
                    `radial-gradient(circle at center, rgba(${index * 40}, ${100 + index * 20}, ${200 - index * 10}, 0.1) 0%, transparent 70%)`,
                    `radial-gradient(circle at center, rgba(${index * 40}, ${100 + index * 20}, ${200 - index * 10}, 0.3) 0%, transparent 70%)`,
                  ]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              
              {blockWard.image ? (
                <motion.div 
                  className="w-40 h-40 mx-auto mb-6 rounded-lg overflow-hidden ring-2 ring-purple-500/20"
                  whileHover={{ scale: 1.1, rotate: 3 }}
                  transition={{ duration: 0.3 }}
                >
                  <img 
                    src={blockWard.image} 
                    alt={blockWard.title} 
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              ) : (
                <motion.div 
                  className={`w-24 h-24 rounded-full bg-gradient-to-r ${blockWard.gradient} mx-auto mb-6 p-5 group-hover:scale-110 transition-transform duration-300`}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.8 }}
                >
                  <blockWard.icon className="w-full h-full text-white" />
                </motion.div>
              )}
              
              <h3 className="text-2xl font-semibold mb-2 group-hover:text-purple-400 transition-colors duration-300">
                {blockWard.title}
              </h3>
              <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                {blockWard.description}
              </p>
              <p className="text-lg text-purple-400 mt-4 font-bold">
                {blockWard.points} points
              </p>

              {isTeacher && (
                <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 scale-95 group-hover:scale-100">
                  <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                    <SelectTrigger className="w-full mb-4 bg-black/20 backdrop-blur-sm">
                      <SelectValue placeholder="Select student" />
                    </SelectTrigger>
                    <SelectContent className="bg-black/90 backdrop-blur-md border-purple-500/20">
                      {students.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.name} ({student.points} points)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                    disabled={transferring === blockWard.id || !selectedStudent}
                    onClick={() => transferBlockWard(blockWard, selectedStudent)}
                  >
                    {transferring === blockWard.id ? "Transferring..." : "Transfer BlockWard"}
                  </Button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const NFTShowcase = BlockWardShowcase;
