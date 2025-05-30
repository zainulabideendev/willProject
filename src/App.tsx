import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { supabase } from './lib/supabase'; 
import { AuthForm } from './components/AuthForm';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';
import { Dashboard } from './components/Dashboard';
import { ProfileScreen } from './components/ProfileScreen';
import { AnimatePresence, motion } from 'framer-motion';
import { MarriageStatus } from './components/MarriageStatus';
import { ChildrenScreen } from './components/ChildrenScreen';
import BeneficiaryScreen from './components/BeneficiaryScreen';
import { LastWishesScreen } from './components/LastWishesScreen';
import { ExecutorScreen } from './components/ExecutorScreen';
import { HubScreen } from './components/HubScreen';
import { AssetsScreen } from './components/AssetsScreen';
import { WillPreviewScreen } from './components/will/WillPreviewScreen';
import { Settings } from './components/Settings';
import { Toaster } from 'sonner';
import { WelcomeModal } from './components/WelcomeModal';
import { Session } from '@supabase/supabase-js';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { Profile } from './lib/types';
import { WillDataProvider } from './components/will/WillDataProvider';
import { useProfile } from './lib/hooks';

export default function App() {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [session, setSession] = React.useState<Session | null>(null);
  const [userProfile, setUserProfile] = React.useState<Profile | null>(null);
  const [currentScreen, setCurrentScreen] = useState<string>('dashboard');
   const { profile } = useProfile();
  
  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (event === 'SIGNED_IN' || event === 'SIGNED_UP') {
        // Fetch user profile to check role
        if (session) {
          supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
            .then(({ data: profile }) => {
              setUserProfile(profile as Profile);
              setCurrentScreen('dashboard');
            });
        }
      }
    });
    
    return () => subscription.unsubscribe();
  }, []);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center loading-container">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const content = (
    <div className="min-h-screen app-background">
      <Toaster position="top-right" expand={false} richColors />
      <header className="header">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <button 
              onClick={() => setCurrentScreen(userProfile?.role === 'super_admin' ? 'admin-dashboard' : 'dashboard')}
              className="flex-1 text-left transition-all duration-300 hover:transform hover:scale-105"
            >
              <h1 className="text-2xl font-bold mb-1 brand-title">Willup</h1>
              <p className="text-sm text-[#2D2D2D]/60 font-medium">Secure your legacy</p>
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 pb-24">
        <AnimatePresence mode="wait">
          {(() => {
            if (userProfile?.role === 'super_admin') {
              return (
                <motion.div
                  key="admin-dashboard"
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: "-100%", opacity: 0 }}
                  transition={{ type: "spring", stiffness: 100, damping: 20 }}
                >
                  <AdminDashboard />
                </motion.div>
              );
            }

            switch (currentScreen) {
              case 'dashboard':
                return (
                  <motion.div
                    key="dashboard"
                    initial={{ x: "-100%", opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: "100%", opacity: 0 }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                  >
                    <WillDataProvider profile={profile}>
                    <Dashboard onNavigate={(screen) => setCurrentScreen(screen)} />
                    </WillDataProvider>
                  </motion.div>
                );
              case 'profile':
                return (
                  <motion.div
                    key="profile"
                    initial={{ x: "100%", opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: "-100%", opacity: 0 }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                  >
                    <ProfileScreen onNavigate={setCurrentScreen} />
                  </motion.div>
                );
              case 'marriage-status':
                return (
                  <motion.div
                    key="marriage"
                    initial={{ x: "100%", opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: "-100%", opacity: 0 }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                  >
                    <MarriageStatus onNavigate={setCurrentScreen} />
                  </motion.div>
                );
              case 'children':
                return (
                  <motion.div
                    key="children"
                    initial={{ x: "100%", opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: "-100%", opacity: 0 }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                  >
                    <ChildrenScreen onNavigate={setCurrentScreen} />
                  </motion.div>
                );
              case 'last-wishes':
                return (
                  <motion.div
                    key="last-wishes"
                    initial={{ x: "100%", opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: "-100%", opacity: 0 }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                  >
                    <LastWishesScreen onNavigate={setCurrentScreen} />
                  </motion.div>
                );
              case 'assets':
                return (
                  <motion.div
                    key="assets"
                    initial={{ x: "100%", opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: "-100%", opacity: 0 }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                  >
                    <AssetsScreen onNavigate={setCurrentScreen} />
                  </motion.div>
                );
              case 'hub':
                return (
                  <motion.div
                    key="hub"
                    initial={{ x: "100%", opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: "-100%", opacity: 0 }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                  >
                    <HubScreen onNavigate={setCurrentScreen} />
                  </motion.div>
                );
              case 'beneficiaries':
                return (
                  <motion.div
                    key="beneficiaries"
                    initial={{ x: "100%", opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: "-100%", opacity: 0 }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                  >
                    <BeneficiaryScreen onNavigate={setCurrentScreen} />
                  </motion.div>
                );
              case 'executor':
                return (
                  <motion.div
                    key="executor"
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: "-100%", opacity: 0 }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                  >
                    <ExecutorScreen onNavigate={setCurrentScreen} />
                  </motion.div>
                );
              case 'will-preview':
                return (
                  <motion.div
                    key="will-preview"
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: "-100%", opacity: 0 }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                  >
                    <WillPreviewScreen onNavigate={setCurrentScreen} />
                  </motion.div>
                );
              case 'settings':
                return <Settings key="settings" />;
              default:
                return null;
            }
          })()}
        </AnimatePresence>
      </main>
    </div>
  );
  
  if (!session) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/admin/login" element={
            <div className="min-h-screen flex items-center justify-center loading-container">
              <AdminLogin onLoginSuccess={(profile) => {
                setUserProfile(profile);
                if (profile.role === 'super_admin') {
                  navigate('/admin/dashboard');
                } else {
                  navigate('/');
                }
              }} />
            </div>
          } />
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center loading-container">
              <AuthForm onNavigate={setCurrentScreen} />
            </div>
          } />
        </Routes>
      </BrowserRouter>
    );
  }
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin/dashboard" element={
          userProfile?.role === 'super_admin' ? content : <Navigate to="/admin/login" replace />
        } />
        <Route path="*" element={content} />
      </Routes>
    </BrowserRouter>
  );
}