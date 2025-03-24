
/**
 * Core BlockWard knowledge database
 * This file contains comprehensive information about BlockWard platform features
 * Can be used by the assistant bot or other help/onboarding components
 */

export interface BlockWardKnowledgeItem {
  topic: string;
  subtopic?: string;
  question: string;
  answer: string;
  keywords: string[];
}

export const BLOCKWARD_KNOWLEDGE: BlockWardKnowledgeItem[] = [
  // General Platform Information
  {
    topic: 'general',
    question: 'What is BlockWard?',
    answer: 'BlockWard is an educational platform that combines blockchain technology with classroom management. Teachers can create classes, track attendance, issue NFT achievements, and manage students. Students can earn and collect blockchain-verified achievements that they own forever!',
    keywords: ['blockward', 'about', 'platform', 'what is']
  },
  {
    topic: 'general',
    question: 'How does BlockWard work?',
    answer: 'BlockWard works by connecting traditional classroom management with blockchain technology. Teachers create classes and invite students. They can track attendance, create seating charts, and award special NFT achievements to students. All data is securely stored, and achievements are tokenized on the blockchain.',
    keywords: ['how', 'works', 'platform', 'system']
  },
  
  // Joining Classes
  {
    topic: 'classes',
    subtopic: 'joining',
    question: 'How do I join a class?',
    answer: 'To join a class, you\'ll need an invitation code from your teacher. Once logged in, click the "Join Class" button on your dashboard and enter the code. You can also join by scanning a QR code if your teacher provides one, or by clicking a direct invitation link.',
    keywords: ['join', 'class', 'invitation', 'how to join']
  },
  {
    topic: 'classes',
    subtopic: 'invitations',
    question: 'What are invitation codes?',
    answer: 'Invitation codes are special alphanumeric codes (like XJ4K29F) that teachers generate. These codes let students join specific classrooms. Teachers can share these codes directly, through QR codes, or via email invitations.',
    keywords: ['code', 'invitation', 'join code', 'invite']
  },
  
  // BlockWard Rewards & NFTs
  {
    topic: 'rewards',
    question: 'What are BlockWard NFTs?',
    answer: 'BlockWard uses special digital tokens (NFTs) called "BlockWards" to recognize student achievements. These are stored securely on the blockchain and belong to students forever! Teachers can create custom awards or use templates for math excellence, creative arts, and more.',
    keywords: ['nft', 'token', 'reward', 'achievement', 'blockward']
  },
  {
    topic: 'rewards',
    subtopic: 'creating',
    question: 'How do teachers create BlockWard awards?',
    answer: 'Teachers can mint (create) BlockWard awards by going to the Wallet section and selecting "Create BlockWard Award." They can choose from templates or create custom awards with personalized images and descriptions. These can then be transferred to deserving students.',
    keywords: ['mint', 'create', 'award', 'nft', 'token']
  },
  {
    topic: 'rewards',
    subtopic: 'transfer',
    question: 'How do teachers give awards to students?',
    answer: 'Teachers can transfer BlockWard awards to students through the Wallet interface. Select the award you want to transfer, choose the recipient student, and confirm the transfer. The award will then appear in the student\'s blockchain wallet!',
    keywords: ['transfer', 'send', 'award', 'give', 'student']
  },
  
  // Teacher Features
  {
    topic: 'teachers',
    question: 'What can teachers do on BlockWard?',
    answer: 'Teachers on BlockWard can create classes, invite students, track attendance, create seating charts, issue rewards, and manage assignments. Sign up as a teacher to access these features from your dashboard!',
    keywords: ['teacher', 'features', 'what can teachers do', 'create class']
  },
  {
    topic: 'teachers',
    subtopic: 'attendance',
    question: 'How does attendance tracking work?',
    answer: 'BlockWard\'s attendance tracking feature lets teachers quickly mark students present, absent, or tardy. The system maintains a complete history of attendance records and can generate reports. This data can also be used to automatically award achievements for perfect attendance!',
    keywords: ['attendance', 'track', 'present', 'absent', 'tardy']
  },
  {
    topic: 'teachers',
    subtopic: 'seating',
    question: 'What is the seating chart feature?',
    answer: 'The seating chart feature allows teachers to create visual representations of their classroom layout. You can assign students to specific seats, rearrange the layout, and save multiple configurations for different class activities.',
    keywords: ['seating', 'chart', 'seat', 'classroom', 'layout']
  },
  
  // Student Features
  {
    topic: 'students',
    question: 'What can students see on BlockWard?',
    answer: 'Students have access to their own dashboard showing classes they\'ve joined, achievements they\'ve earned, assignments, and their current points. The wallet section displays all their earned BlockWard NFTs, which they truly own on the blockchain!',
    keywords: ['student', 'dashboard', 'see', 'view', 'access']
  },
  {
    topic: 'students',
    subtopic: 'points',
    question: 'How do students earn points?',
    answer: 'Students earn points through various activities: completing assignments, good behavior, perfect attendance, and special achievements. Teachers can award custom point values, and these points are tracked on the student\'s profile.',
    keywords: ['points', 'score', 'earn', 'rewards', 'how to get']
  },
  
  // Blockchain Aspects
  {
    topic: 'blockchain',
    question: 'How does BlockWard use blockchain?',
    answer: 'BlockWard uses blockchain technology to create permanent, verifiable records of student achievements. Each BlockWard NFT is minted on the Polygon blockchain network (testnet for now), making them energy-efficient and low-cost while still providing true ownership.',
    keywords: ['blockchain', 'technology', 'how', 'works', 'wallet']
  },
  {
    topic: 'blockchain',
    subtopic: 'wallet',
    question: 'Can I use MetaMask with BlockWard?',
    answer: 'BlockWard can integrate with MetaMask wallet for real blockchain transactions. Teachers can connect their MetaMask wallet when creating BlockWard NFTs to mint them directly on the blockchain. This is optional - you can also use a simulated blockchain experience without MetaMask.',
    keywords: ['metamask', 'wallet', 'connect', 'blockchain', 'integration']
  },
  
  // Help and Support
  {
    topic: 'support',
    question: 'How can I get help with BlockWard?',
    answer: 'Need help with BlockWard? Check out our support resources accessible via the Help button in the navigation menu. For specific questions, you can always chat with me, your BlockWard assistant!',
    keywords: ['help', 'support', 'assistance', 'contact', 'guide']
  },
  {
    topic: 'support',
    subtopic: 'tutorial',
    question: 'Are there tutorials for BlockWard?',
    answer: 'BlockWard offers interactive tutorials for both teachers and students. Access them by clicking the "Tutorial" option in your dashboard or the profile menu. They'll guide you through all the key features step by step.',
    keywords: ['tutorial', 'guide', 'how to', 'learn', 'walkthrough']
  }
];

/**
 * Search the knowledge base for relevant items
 * @param query User's search query
 * @returns Array of matching knowledge items
 */
export const searchKnowledge = (query: string): BlockWardKnowledgeItem[] => {
  const normalizedQuery = query.toLowerCase().trim();
  
  return BLOCKWARD_KNOWLEDGE.filter(item => {
    // Check if query matches any keywords
    const matchesKeyword = item.keywords.some(keyword => 
      normalizedQuery.includes(keyword) || keyword.includes(normalizedQuery)
    );
    
    // Check if query matches question or parts of answer
    const matchesQuestion = item.question.toLowerCase().includes(normalizedQuery);
    const matchesAnswer = item.answer.toLowerCase().includes(normalizedQuery);
    
    return matchesKeyword || matchesQuestion || matchesAnswer;
  });
};

/**
 * Get knowledge items by topic
 * @param topic The topic to filter by
 * @returns Array of knowledge items for that topic
 */
export const getKnowledgeByTopic = (topic: string): BlockWardKnowledgeItem[] => {
  return BLOCKWARD_KNOWLEDGE.filter(item => item.topic === topic);
};
