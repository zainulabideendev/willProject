import React from 'react';
import { Asset, Profile } from '../../lib/types';

interface CompletionValidatorProps {
  profile: Profile | null;
  children: (isValid: boolean) => React.ReactNode;
}

export function CompletionValidator({
  profile,
  children
}: CompletionValidatorProps) {
  const [updateTrigger, setUpdateTrigger] = React.useState(0);

  React.useEffect(() => {
    const handleProfileUpdate = () => {
      setUpdateTrigger(prev => prev + 1);
    };

    window.addEventListener('profile-updated', handleProfileUpdate);
    return () => window.removeEventListener('profile-updated', handleProfileUpdate);
  }, []);

  // Check if all conditions are met
  const isValid = React.useMemo(() => {
    if (!profile) {
      console.log('Validation failed: No profile');
      return false;
    }

    // Force re-evaluation by adding a timestamp
    const now = Date.now();

    // Condition 1: At least one beneficiary selected
    const hasBeneficiaries = profile.has_beneficiaries ?? false;
    if (!hasBeneficiaries) {
      console.log('Validation failed: No beneficiaries selected');
      return false;
    }

    // Condition 2: All assets are 100% allocated
    const assetsAllocated = profile.assets_fully_allocated ?? false;
    if (!assetsAllocated) {
      console.log('Validation failed: Not all assets are fully allocated');
      return false;
    }

    // Condition 3: Residue is 100% allocated
    const residueAllocated = profile.residue_fully_allocated ?? false;
    if (!residueAllocated) {
      console.log('Validation failed: Residue is not fully allocated');
      return false;
    }

    console.log('Validation Check:', {
      hasBeneficiaries,
      assetsAllocated,
      residueAllocated
    });

    console.log('All validation conditions met');
    return true;
  }, [
    profile?.has_beneficiaries,
    profile?.assets_fully_allocated,
    profile?.residue_fully_allocated,
    updateTrigger,
    profile?.id // Add profile.id to dependencies
  ]);

  return <>{children(isValid)}</>;
}