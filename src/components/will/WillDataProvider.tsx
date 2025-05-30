import React from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { Profile } from '../../lib/types';

interface WillDataContextType {
  loading: boolean;
  assets: any[];
  beneficiaries: Record<string, any>;
  executors: any[];
  children: any[];
  assetAllocations: any[];
  residueAllocations: any[];
  partnerFirm: any;
  fetchData: () => Promise<void>;
}

const WillDataContext = React.createContext<WillDataContextType | undefined>(undefined);

export function useWillData() {
  const context = React.useContext(WillDataContext);
  if (context === undefined) {
    throw new Error('useWillData must be used within a WillDataProvider');
  }
  return context;
}

interface WillDataProviderProps {
  profile: Profile | null;
  children: React.ReactNode;
}

export function WillDataProvider({ profile, children }: WillDataProviderProps) {
  const [loading, setLoading] = React.useState(true);
  const [assets, setAssets] = React.useState<any[]>([]);
  const [beneficiaries, setBeneficiaries] = React.useState<Record<string, any>>({});
  const [executors, setExecutors] = React.useState<any[]>([]);
  const [childrenData, setChildrenData] = React.useState<any[]>([]);
  const [assetAllocations, setAssetAllocations] = React.useState<any[]>([]);
  const [residueAllocations, setResidueAllocations] = React.useState<any[]>([]);
  const [partnerFirm, setPartnerFirm] = React.useState<any>(null);

  const fetchData = React.useCallback(async () => {
    if (!profile) return;
    
    try {
      setLoading(true);
      
      // Fetch all necessary data in parallel
      const [
        assetsResponse,
        beneficiariesResponse,
        executorsResponse,
        childrenResponse,
        assetAllocationsResponse,
        residueAllocationsResponse
      ] = await Promise.all([
        supabase.from('assets').select('*').eq('profile_id', profile.id),
        supabase.from('beneficiaries').select('*').eq('profile_id', profile.id),
        supabase.from('executors').select('*').eq('profile_id', profile.id),
        supabase.from('children').select('*').eq('profile_id', profile.id),
        supabase.from('asset_allocations').select('*').eq('profile_id', profile.id),
        supabase.from('residue_allocations').select('*').eq('profile_id', profile.id)
      ]);
      
      // Check for errors
      if (assetsResponse.error) throw assetsResponse.error;
      if (beneficiariesResponse.error) throw beneficiariesResponse.error;
      if (executorsResponse.error) throw executorsResponse.error;
      if (childrenResponse.error) throw childrenResponse.error;
      if (assetAllocationsResponse.error) throw assetAllocationsResponse.error;
      if (residueAllocationsResponse.error) throw residueAllocationsResponse.error;

      // Process beneficiaries into a lookup map for easier access
      const beneficiariesMap = (beneficiariesResponse.data || []).reduce((acc, beneficiary) => {
        acc[beneficiary.id] = beneficiary;
        return acc;
      }, {} as Record<string, any>);
      
      // Set state with fetched data
      setAssets(assetsResponse.data || []);
      setBeneficiaries(beneficiariesMap);
      setExecutors(executorsResponse.data || []);
      setChildrenData(childrenResponse.data || []);
      setAssetAllocations(assetAllocationsResponse.data || []);
      setResidueAllocations(residueAllocationsResponse.data || []);
      
      // If profile has a partner firm, fetch it
      if (profile.partner_firm_id) {
        const { data: firmData, error: firmError } = await supabase
          .from('partner_firms')
          .select('*')
          .eq('id', profile.partner_firm_id)
          .single();
          
        if (firmError) throw firmError;
        setPartnerFirm(firmData);
      }
    } catch (error) {
      console.error('Error fetching will data:', error);
      toast.error('Failed to load will data');
    } finally {
      setLoading(false);
    }
  }, [profile]);

  React.useEffect(() => {
    if (profile) {
      fetchData();
    }
  }, [profile, fetchData]);

  const value = {
    loading,
    assets,
    beneficiaries,
    executors,
    children: childrenData,
    assetAllocations,
    residueAllocations,
    partnerFirm,
    fetchData
  };

  return (
    <WillDataContext.Provider value={value}>
      {children}
    </WillDataContext.Provider>
  );
}