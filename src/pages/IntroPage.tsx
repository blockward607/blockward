
import React from 'react';
import { Navigate } from 'react-router-dom';

// Intro page is removed, redirects to home
const IntroPage = () => {
  return <Navigate to="/" replace />;
};

export default IntroPage;
