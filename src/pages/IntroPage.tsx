
import React from 'react';
import { BlockwardIntro } from '@/components/intro/BlockwardIntro';

interface IntroPageProps {
  onEnter: () => void;
}

const IntroPage = ({ onEnter }: IntroPageProps) => {
  return <BlockwardIntro onEnter={onEnter} />;
};

export default IntroPage;
