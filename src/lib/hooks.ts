import React, { useEffect, useState, useCallback } from 'react';
import { supabase, supabaseUrl, supabaseAnonKey } from './supabase';
import type { Profile, EstateScore } from './types';
import { calculateEstateScore, debounce } from './utils';
import { toast } from 'sonner';

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Helper function to validate UUID
const isValidUUID = (uuid: string | undefined | null): boolean => {
  if (!uuid) return false;
  return UUID_REGEX.test(uuid);
};

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  const checkNetworkConnectivity = React.useCallback(async () => {
    try {
      if (!navigator.onLine) {
        return false;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      try {
        const response = await fetch(`${supabaseUrl}/rest/v1/`, {
          method: 'HEAD',
          signal: controller.signal,
          headers: {
            'apikey': supabaseAnonKey,
            'Content-Type': 'application/json'
          },
          mode: 'cors'
        });
        return response.ok;
      } catch (error) {
        return false;
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (error) {
      console.warn('Network check failed:', error);
      return false;
    }
  }, []);

  useEffect(() => {
    let isSubscribed = true;

    async function fetchProfile() {
      try {
        const isOnline = await checkNetworkConnectivity();
        if (!isOnline) {
          throw new Error('No internet connection. Please check your network and try again.');
        }

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError?.message === 'Auth session missing!') {
          if (isSubscribed) {
            setProfile(null);
            setError(null);
            setLoading(false);
          }
          return;
        }
        
        if (authError) throw authError;

        if (!user) {
          if (isSubscribed) {
            setProfile(null);
            setLoading(false);
          }
          return;
        }

        if (!isValidUUID(user.id)) {
          throw new Error('Invalid user ID format. Please sign out and sign in again.');
        }

        // Wait briefly to allow the database trigger to complete
        await new Promise(resolve => setTimeout(resolve, 1000));

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) {
          if (profileError.code === 'PGRST116') {
            // Profile not found, wait and retry once
            await new Promise(resolve => setTimeout(resolve, 2000));
            const { data: retryData, error: retryError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', user.id)
              .single();

            if (retryError) throw retryError;
            if (!retryData) throw new Error('Profile not found after retry');

            if (isSubscribed) {
              setProfile(retryData as Profile);
              setError(null);
              setLoading(false);
            }
            return;
          }
          throw profileError;
        }

        if (isSubscribed) {
          setProfile(profileData as Profile);
          setError(null);
          setLoading(false);
        }
      } catch (e) {
        console.error('Error fetching profile:', e);
        let message = 'Failed to load profile. Please try again.';

        if (e instanceof Error) {
          if (e.message === 'Auth session missing!') {
            if (isSubscribed) {
              setProfile(null);
              setError(null);
              setLoading(false);
            }
            return;
          }

          if (!navigator.onLine) {
            message = 'No internet connection. Please check your network and try again.';
          } else if (e.message.includes('Failed to fetch')) {
            message = 'Unable to connect to Supabase. Please verify your project configuration and try again.';
          } else {
            message = e.message;
          }
        }

        if (isSubscribed) {
          setError(message);
          toast.error(message);
        }
      } finally {
        if (isSubscribed) {
          setLoading(false);
        }
      }
    }

    fetchProfile();

    const handleOnline = () => {
      if (isSubscribed) {
        setError(null);
        setRefetchTrigger(prev => prev + 1);
      }
    };
    const handleOffline = () => {
      if (isSubscribed) {
        setError('No internet connection. Please check your network and try again.');
        toast.error('No internet connection');
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      isSubscribed = false;
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [refetchTrigger, checkNetworkConnectivity]);

  const refetchProfile = useCallback(() => {
    setRefetchTrigger(prev => prev + 1);
  }, []);

  return { profile, loading, error, refetchProfile };
}

export function useEstateScore(profileId: string | undefined) {
  const [score, setScore] = useState<EstateScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchScore = useCallback(async () => {
    if (!profileId) {
      setLoading(false);
      return;
    }

    if (!isValidUUID(profileId)) {
      const message = 'Invalid profile ID format. Please try signing in again.';
      setError(message);
      toast.error(message);
      setLoading(false);
      setScore(null);
      return;
    }

    try {
      setLoading(true);

      const { data: existingScores, error: checkError } = await supabase
        .from('estate_score')
        .select('id')
        .eq('profile_id', profileId);

      if (checkError) throw checkError;

      if (existingScores && existingScores.length > 1) {
        const { data: scores, error: fetchError } = await supabase
          .from('estate_score')
          .select('*')
          .eq('profile_id', profileId)
          .order('last_updated', { ascending: false });

        if (fetchError) throw fetchError;
        if (scores && scores.length > 1) {
          const [latest, ...outdated] = scores;
          const outdatedIds = outdated.map(score => score.id);

          const { error: deleteError } = await supabase
            .from('estate_score')
            .delete()
            .in('id', outdatedIds);

          if (deleteError) throw deleteError;
        }
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileId)
        .maybeSingle();

      if (profileError) throw profileError;
      if (!profileData) throw new Error('Profile not found');

      const calculatedScore = calculateEstateScore(profileData);

      const { data: scoreData, error: scoreError } = await supabase
        .from('estate_score')
        .select('*')
        .eq('profile_id', profileId)
        .maybeSingle();

      if (scoreError) throw scoreError;

      if (!scoreData) {
        const { data: newScore, error: createError } = await supabase
          .from('estate_score')
          .insert([{
            profile_id: profileId,
            total_score: calculatedScore,
            last_updated: new Date().toISOString()
          }])
          .select()
          .single();

        if (createError) throw createError;
        if (!newScore) throw new Error('Failed to create estate score');

        setScore(newScore);
      } else {
        if (scoreData.total_score !== calculatedScore) {
          const { data: updatedScore, error: updateError } = await supabase
            .from('estate_score')
            .update({
              total_score: calculatedScore,
              last_updated: new Date().toISOString()
            })
            .eq('id', scoreData.id)
            .select()
            .single();

          if (updateError) throw updateError;
          if (!updatedScore) throw new Error('Failed to update estate score');

          setScore(updatedScore);
        } else {
          setScore(scoreData);
        }
      }

      setError(null);
    } catch (e) {
      console.error('Error fetching estate score:', e);
      let message = 'Failed to fetch estate score.';
      if (e instanceof Error) {
        if (!navigator.onLine) {
          message = 'No internet connection. Please check your network and try again.';
        } else if (e.message.includes('Failed to fetch')) {
          message = 'Unable to connect to Supabase. Please verify your project configuration and try again.';
        } else {
          message = e.message;
        }
      }
      setError(message);
      setScore(null);
    } finally {
      setLoading(false);
    }
  }, [profileId]);

  const debouncedFetchScore = React.useMemo(
    () => debounce(fetchScore, 500),
    [fetchScore]
  );

  useEffect(() => {
    debouncedFetchScore();
  }, [debouncedFetchScore]);

  return { score, loading, error, refetchScore: fetchScore };
}

export function useUpdateProfile() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateProfile = async (id: string, updates: Partial<Profile>) => {
    if (!isValidUUID(id)) {
      const message = 'Invalid profile ID format. Please try signing in again.';
      setError(message);
      toast.error(message);
      throw new Error(message);
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      if (updates.address) {
        localStorage.setItem('profile-address', updates.address);
      }
    } catch (e) {
      let message = 'Failed to update profile.';
      if (e instanceof Error) {
        if (!navigator.onLine) {
          message = 'No internet connection. Please check your network and try again.';
        } else if (e.message.includes('Failed to fetch')) {
          message = 'Unable to connect to Supabase. Please verify your project configuration and try again.';
        } else {
          message = e.message;
        }
      }
      setError(message);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { updateProfile, loading, error };
}