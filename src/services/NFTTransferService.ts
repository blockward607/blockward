
import { supabase } from "@/integrations/supabase/client";
import { Student } from "@/hooks/useTransferData";

export const transferNFT = async (
  selectedNft: string, 
  selectedStudent: string,
  students: Student[],
  availableNfts: any[]
) => {
  // Find the student
  const student = students.find(s => s.id === selectedStudent);
  if (!student) {
    throw new Error("Student not found");
  }

  // Get student wallet
  const { data: studentWallet, error: walletError } = await supabase
    .from('wallets')
    .select('id')
    .eq('user_id', student.user_id)
    .single();

  if (walletError || !studentWallet) {
    throw new Error("Student wallet not found");
  }

  // Get teacher wallet
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("No session found");

  const { data: teacherWallet } = await supabase
    .from('wallets')
    .select('id')
    .eq('user_id', session.user.id)
    .single();

  if (!teacherWallet) throw new Error("Teacher wallet not found");

  // Update NFT owner
  const { error: nftError } = await supabase
    .from('nfts')
    .update({ owner_wallet_id: studentWallet.id })
    .eq('id', selectedNft);

  if (nftError) {
    throw nftError;
  }

  // Record transaction
  const { error: transactionError } = await supabase
    .from('transactions')
    .insert({
      nft_id: selectedNft,
      from_wallet_id: teacherWallet.id,
      to_wallet_id: studentWallet.id,
      transaction_hash: "tx_" + Math.random().toString(36).substring(2, 15),
      status: 'completed'
    });

  if (transactionError) {
    throw transactionError;
  }

  // Find the NFT metadata to get points value
  const nft = availableNfts.find(n => n.id === selectedNft);
  let pointsValue = 0;
  
  if (nft && nft.metadata) {
    const metadata = typeof nft.metadata === 'string' 
      ? JSON.parse(nft.metadata) 
      : nft.metadata;
      
    pointsValue = metadata.points || 0;
  }

  // Award points to student if the NFT has a points value
  if (pointsValue > 0) {
    await supabase.rpc('increment_student_points', {
      student_id: student.id,
      points_to_add: pointsValue
    });
  }

  return student.name;
};
