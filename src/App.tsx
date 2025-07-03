import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './hooks/useAuth';
import Header from './components/Layout/Header';
import Navigation from './components/Layout/Navigation';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Upload from './pages/Upload';
import Skills from './pages/Skills';
import Courses from './pages/Courses';

const queryClient = new QueryClient();

function AppContent() {
  const { user, loading } = useAuth();

  // Show loading spinner with timeout fallback
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3CA7E0] mx-auto mb-4"></div>
          <p className="text-[#BFC9D9] text-sm">Loading your Jedi training...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-[#F5F7FA]">
        <Header />
        {user && <Navigation />}
        
        <main className={user ? 'ml-64' : ''}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={
              user ? <Navigate to="/" replace /> : <Auth />
            } />
            <Route path="/upload" element={
              user ? <Upload /> : <Navigate to="/auth" replace />
            } />
            <Route path="/courses" element={
              user ? <Courses /> : <Navigate to="/auth" replace />
            } />
            <Route path="/skills" element={
              user ? <Skills /> : <Navigate to="/auth" replace />
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'white',
              color: '#2E3A59',
              border: '1px solid #CBD5E1',
            },
          }}
        />
      </div>
    </Router>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;