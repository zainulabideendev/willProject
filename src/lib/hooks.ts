import React, { useEffect, useState, useCallback } from 'react';
import { supabase, supabaseUrl, supabaseAnonKey } from './supabase';
import type { Profile, EstateScore } from './types';
import { calculateEstateScore, debounce } from './utils';
import { toast } from 'sonner';

// UUID validation regex - updated to be more strict
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Helper function to validate UUID with error handling
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

      // Try to fetch the Supabase health check endpoint with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      let response;

      try {
        response = await fetch(`${supabaseUrl}/rest/v1/`, {
          method: 'HEAD',
          signal: controller.signal,
          headers: {
            'apikey': supabaseAnonKey,
            'Content-Type': 'application/json'
          }
        });
      } catch (error) {
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            console.warn('Health check timeout');
            return false;
          }
          if (!navigator.onLine) {
            return false;
          }
        }
        return false;
      } finally {
        clearTimeout(timeoutId);
      }

      return response?.ok ?? false;
    } catch (error) {
      console.warn('Network check failed:', error);
      return false;
    }
  }, []);

  useEffect(() => {
    let isSubscribed = true;

    async function fetchProfile() {
      try {
        // Check network connectivity with retry
        const isOnline = await checkNetworkConnectivity();
        if (!isOnline) {
          throw new Error('No internet connection. Please check your network and try again.');
        }

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        // Handle auth session missing case silently
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

        // Validate user.id is a valid UUID before making the request
        if (!isValidUUID(user.id)) {
          const message = 'Invalid user ID format detected. Please sign out and sign in again.';
          console.error('Invalid UUID format:', user.id);
          toast.error(message);
          if (isSubscribed) {
            setProfile(null);
            setError(message);
            setLoading(false);
          }
          return;
        }

        // Check if profile exists
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select(`
            id,
            full_name,
            address,
            date_of_birth,
            marital_status,
            marriage_property_regime,
            email,
            phone,
            id_number,
            title,
            spouse_title,
            spouse_first_name,
            spouse_last_name,
            spouse_email,
            spouse_phone,
            spouse_id_number,
            profile_setup_complete,
            assets_added,
            beneficiaries_chosen,
            last_wishes_documented,
            executor_chosen,
            will_reviewed,
            welcome_modal_shown,
            has_children,
            has_beneficiaries,
            assets_fully_allocated,
            residue_fully_allocated,
            will_downloaded,
            guardian_first_names,
            guardian_last_name,
            guardian_id_number,
            guardian_address,
            burial_type,
            memorial_message,
            last_message
          `)
          .eq('id', user.id)
          .maybeSingle();

        if (profileError) {
          if (profileError.code === '42501') {
            // Permission error – try creating the profile
            const { data: newProfile, error: insertError } = await supabase
              .from('profiles')
              .insert([{ id: user.id }])
              .select();

            if (insertError) {
              if (insertError.code === '23505') {
                // Profile already exists (race condition) - retry fetch
                console.warn('Profile creation race condition detected, retrying fetch...');
                const { data: retryData, error: retryError } = await supabase
                  .from('profiles')
                  .select()
                  .eq('id', user.id)
                  .maybeSingle();

                if (retryError) throw retryError;
                if (!retryData) throw new Error('Profile not found after retry');

                if (isSubscribed) {
                  setProfile(retryData as Profile);
                  setError(null);
                  setLoading(false);
                }
                return;
              }
              throw insertError;
            }

            if (newProfile && newProfile.length > 0) {
              if (isSubscribed) {
                setProfile(newProfile[0] as Profile);
                setError(null);
                setLoading(false);
              }
              return;
            }
          } else {
            throw profileError;
          }
        }

        if (!profileData) {
          // No existing profile – try inserting
          const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert([{ id: user.id }])
            .select();

          if (insertError) {
            if (insertError.code === '23505') {
              // Profile already exists (race condition) - retry fetch
              console.warn('Profile creation race condition detected, retrying fetch...');
              const { data: retryData, error: retryError } = await supabase
                .from('profiles')
                .select()
                .eq('id', user.id)
                .maybeSingle();

              if (retryError) throw retryError;
              if (!retryData) throw new Error('Profile not found after retry');

              if (isSubscribed) {
                setProfile(retryData as Profile);
                setError(null);
                setLoading(false);
              }
              return;
            }
            throw insertError;
          }

          if (newProfile && newProfile.length > 0) {
            if (isSubscribed) {
              setProfile(newProfile[0] as Profile);
              setError(null);
              setLoading(false);
            }
            return;
          }
        }

        if (isSubscribed) {
          setProfile(profileData as Profile);
          setError(null);
        }
      } catch (e) {
        console.error('Error fetching profile:', e);
        let message = 'Failed to load profile. Please try again.';

        if (e instanceof Error) {
          // Handle auth session missing case silently
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
          } else if (e.message.includes('timeout') || e.message.includes('AbortError')) {
            message = 'Server is taking too long to respond. Please try again later.';
          } else if (e.message.includes('Failed to fetch') || e.message.includes('NetworkError')) {
            message = 'Unable to connect to the server. Please check your internet connection and try again.';
          } else if (e.message.includes('Profile not found')) {
            message = 'Profile not found. Please try signing in again.';
          } else if (
            e.message.includes('Invalid user ID format') ||
            e.message.includes('invalid input syntax for type uuid')
          ) {
            message = 'Invalid user ID format. Please sign out and sign in again.';
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

    // Add network status listeners
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
  }, [refetchTrigger]);

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

    // Validate profileId is a valid UUID before making any database calls
    if (!isValidUUID(profileId)) {
      const message = 'Invalid profile ID format detected. Please try signing in again.';
      setError(message);
      toast.error(message);
      setLoading(false);
      setScore(null);
      return;
    }

    try {
      setLoading(true);

      // First, check if there are multiple scores for this profile
      const { data: existingScores, error: checkError } = await supabase
        .from('estate_score')
        .select('id')
        .eq('profile_id', profileId);

      if (checkError) throw checkError;

      // If multiple scores exist, delete all but the most recent one
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

      // Get profile data to calculate score
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileId)
        .maybeSingle();

      if (profileError) throw profileError;
      if (!profileData) throw new Error('Profile not found');

      // Calculate the score based on profile completion
      const calculatedScore = calculateEstateScore(profileData);

      // Get the single score record (or create if it doesn't exist)
      const { data: scoreData, error: scoreError } = await supabase
        .from('estate_score')
        .select('*')
        .eq('profile_id', profileId)
        .maybeSingle();

      if (scoreError) throw scoreError;

      if (!scoreData) {
        // Create initial score
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
        // Update existing score if it differs from calculated score
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
        } else if (e.message.includes('timeout') || e.message.includes('AbortError')) {
          message = 'Server is taking too long to respond. Please try again later.';
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
    // Validate id is a valid UUID before making any database calls
    if (!isValidUUID(id)) {
      const message = 'Invalid profile ID format detected. Please try signing in again.';
      setError(message);
      toast.error(message);
      throw new Error(message);
    }

    setLoading(true);
    try {
      // Log the updates being sent to the server
      console.log('Updating profile with:', updates);

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', id);

      if (error) {
        console.error('Supabase update error:', error);
        throw error;
      }

      // If address was updated, also save to localStorage
      if (updates.address) {
        localStorage.setItem('profile-address', updates.address);
      }
    } catch (e) {
      let message = 'Failed to update profile.';
      if (e instanceof Error) {
        if (!navigator.onLine) {
          message = 'No internet connection. Please check your network and try again.';
        } else if (e.message.includes('timeout') || e.message.includes('AbortError')) {
          message = 'Server is taking too long to respond. Please try again later.';
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