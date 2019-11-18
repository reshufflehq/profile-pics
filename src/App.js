import React from 'react';
import { AuthProvider } from '@reshuffle/react-auth';
import Main from './Main';

export default function App() {
  return (
    <AuthProvider>
      <Main />
    </AuthProvider>
  );
}
