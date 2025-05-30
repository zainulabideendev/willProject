import React from 'react';
import { supabase } from '../lib/supabase';
import { useProfile, useUpdateProfile } from '../lib/hooks';
import { Loader2, Mail, Lock, LogOut, Save, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export function Settings() {
  const { profile, loading, refetchProfile } = useProfile();
  const { updateProfile } = useUpdateProfile();
  const [isChangingPassword, setIsChangingPassword] = React.useState(false);
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [passwordError, setPasswordError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [userEmail, setUserEmail] = React.useState('');

  React.useEffect(() => {
    const fetchUserEmail = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email) {
          setUserEmail(user.email);
          
          // If profile exists but email is missing, update it
          if (profile && !profile.email && user.email) {
            await updateProfile(profile.id, { email: user.email });
            refetchProfile();
          }
        }
      } catch (error) {
        console.error('Error fetching user email:', error);
      }
    };
    
    fetchUserEmail();
  }, [profile]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    try {
      setSaving(true);
      
      // First verify current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: profile?.email || '',
        password: currentPassword
      });

      if (signInError) {
        setPasswordError('Current password is incorrect');
        return;
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) throw updateError;

      toast.success('Password updated successfully');
      setIsChangingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error updating password:', error);
      setPasswordError('Failed to update password. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-12rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-12rem)]">
      <div className="rounded-lg p-6" style={{
        background: 'linear-gradient(145deg, #ffffff, #f5f5f5)',
        boxShadow: '6px 6px 12px #d1d1d1, -6px -6px 12px #ffffff'
      }}>
        <h2 className="text-xl font-semibold text-[#2D2D2D] mb-6">Account Settings</h2>
        
        <div className="space-y-6">
          <div className="pb-6 border-b border-gray-100">
            <h3 className="text-lg font-medium text-[#2D2D2D] mb-2">Account Information</h3>
            
            <div className="flex items-center gap-3 mt-4">
              <div className="p-2 rounded-lg" style={{
                background: 'linear-gradient(145deg, #0047AB, #D4AF37)',
                color: 'white'
              }}>
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-[#2D2D2D]/60">Email Address</p>
                <p className="text-base font-medium">{profile?.email || userEmail || 'Loading...'}</p>
              </div>
            </div>
          </div>

          <div className="pb-6 border-b border-gray-100">
            <h3 className="text-lg font-medium text-[#2D2D2D] mb-2">Security</h3>
            
            {!isChangingPassword ? (
              <button
                onClick={() => setIsChangingPassword(true)}
                className="flex items-center gap-2 mt-4 px-4 py-2 rounded-lg transition-all"
                style={{
                  background: 'linear-gradient(145deg, #ffffff, #f5f5f5)',
                  boxShadow: '4px 4px 8px #d1d1d1, -4px -4px 8px #ffffff'
                }}
              >
                <Lock className="w-4 h-4 text-[#2D2D2D]/60" />
                <span>Change Password</span>
              </button>
            ) : (
              <form onSubmit={handlePasswordChange} className="mt-4 space-y-4">
                {passwordError && (
                  <div className="p-3 rounded-lg flex items-center gap-2 text-red-600 bg-red-50">
                    <AlertCircle className="w-4 h-4" />
                    <p className="text-sm">{passwordError}</p>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-[#2D2D2D] mb-1">
                    Current Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#2D2D2D]/60" />
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full p-2 pl-10 rounded-lg"
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
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#2D2D2D]/60" />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full p-2 pl-10 rounded-lg"
                      style={{
                        background: 'linear-gradient(145deg, #ffffff, #f5f5f5)',
                        boxShadow: 'inset 2px 2px 5px #d1d1d1, inset -2px -2px 5px #ffffff'
                      }}
                      required
                      minLength={6}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#2D2D2D] mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#2D2D2D]/60" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full p-2 pl-10 rounded-lg"
                      style={{
                        background: 'linear-gradient(145deg, #ffffff, #f5f5f5)',
                        boxShadow: 'inset 2px 2px 5px #d1d1d1, inset -2px -2px 5px #ffffff'
                      }}
                      required
                    />
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsChangingPassword(false);
                      setCurrentPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                      setPasswordError(null);
                    }}
                    className="flex-1 px-4 py-2 rounded-lg"
                    style={{
                      background: 'linear-gradient(145deg, #ffffff, #f5f5f5)',
                      boxShadow: '4px 4px 8px #d1d1d1, -4px -4px 8px #ffffff'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white"
                    style={{
                      background: 'linear-gradient(145deg, #0047AB, #D4AF37)',
                      boxShadow: '4px 4px 8px #d1d1d1, -4px -4px 8px #ffffff',
                      opacity: saving ? 0.7 : 1
                    }}
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Save Changes
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-auto p-6">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 text-sm text-white px-4 py-3 rounded-lg transition-all hover:transform hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: 'linear-gradient(145deg, #0047AB, #D4AF37)',
            boxShadow: '6px 6px 12px #d1d1d1, -6px -6px 12px #ffffff'
          }}
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}