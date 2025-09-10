import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { AppRouter } from './AppRouter';
import { RecordsProvider } from './context/RecordsContext';
export function App() {
  return <AuthProvider>
      <RecordsProvider>
        <div className="w-full min-h-screen bg-gray-50">
          <AppRouter />
        </div>
      </RecordsProvider>
    </AuthProvider>;
}