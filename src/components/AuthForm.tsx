import React from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, Mail, Lock } from 'lucide-react';
import './AuthForm.css';

interface AuthFormProps {
  onNavigate: (screen: string) => void;
}

type AuthMode = 'signin' | 'signup';

export function AuthForm({ onNavigate }: AuthFormProps) {
  const [mode, setMode] = React.useState<AuthMode>('signin');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) {
          if (error.message === 'User already registered') {
            setMode('signin');
            throw new Error('This email is already registered. Please sign in instead.');
          }
          throw error;
        }
        // After successful signup, the session will be automatically set
        // and App.tsx will handle the navigation
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          if (error.message === 'Invalid login credentials') {
            throw new Error('Invalid email or password. Please try again.');
          }
          throw error;
        }
        // After successful signin, the session will be automatically set
        // and App.tsx will handle the navigation
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 auth-container">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2 brand-title">Willup</h1>
        <p className="text-lg text-[#2D2D2D]/80">Secure your legacy</p>
      </div>
      
      {error && (
        <div className="mb-4 p-3 error-message">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[#2D2D2D] mb-1">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#2D2D2D]/60" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field pl-10"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-[#2D2D2D] mb-1">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#2D2D2D]/60" />
            <input
              id="password"
              type="password"
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field pl-10"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="submit-button"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin mx-auto" />
          ) : mode === 'signin' ? (
            'Sign In'
          ) : (
            'Sign Up'
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <button
          onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
          className="mode-switch-button"
        >
          {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </button>
      </div>
    </div>
  );
}