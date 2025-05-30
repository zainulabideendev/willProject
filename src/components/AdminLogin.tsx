import React from 'react';
import { Loader2, Mail, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface AdminLoginProps {
  onLoginSuccess: (profile: any) => void;
}

export function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [loading, setLoading] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) throw signInError;

      // Check if user has super_admin role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user?.id)
        .single();

      if (profileError) throw profileError;

      if (profile?.role !== 'super_admin') {
        throw new Error('Unauthorized: Admin access required');
      }

      toast.success('Welcome back, Admin!');
      onLoginSuccess(profile);
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0047AB] to-[#D4AF37] p-4">
      <div className="w-full max-w-md p-8 rounded-2xl" style={{
        background: 'linear-gradient(145deg, #ffffff, #f5f5f5)',
        boxShadow: '20px 20px 60px rgba(0, 0, 0, 0.2), -20px -20px 60px rgba(255, 255, 255, 0.1)'
      }}>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{
            background: 'linear-gradient(145deg, #0047AB, #D4AF37)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>Willup Admin</h1>
          <p className="text-[#2D2D2D]/60">Super Admin Access</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[#2D2D2D] mb-1">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#2D2D2D]/60" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 pl-10 rounded-lg"
                style={{
                  background: 'linear-gradient(145deg, #ffffff, #f5f5f5)',
                  boxShadow: 'inset 2px 2px 5px #d1d1d1, inset -2px -2px 5px #ffffff'
                }}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2D2D2D] mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#2D2D2D]/60" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 pl-10 rounded-lg"
                style={{
                  background: 'linear-gradient(145deg, #ffffff, #f5f5f5)',
                  boxShadow: 'inset 2px 2px 5px #d1d1d1, inset -2px -2px 5px #ffffff'
                }}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full p-3 rounded-lg text-white font-medium transition-all"
            style={{
              background: 'linear-gradient(145deg, #0047AB, #D4AF37)',
              boxShadow: '6px 6px 12px #d1d1d1, -6px -6px 12px #ffffff',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin mx-auto" />
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}