import React from 'react';
import { AssetAllocationList } from './AssetAllocationList';
import { DebtStatus } from '../asset/DebtStatus';
import { Asset, FamilyMember } from '../../lib/types';
import { useSwiper } from 'swiper/react';

interface AllocationSectionProps {
  assets: Asset[];
  selectedMembers: FamilyMember[];
  manualBeneficiaries: any[];
  assetAllocations: Record<string, Record<string, number>>;
  unsavedChanges: Set<string>;
  onAllocationChange: (assetId: string, beneficiaryId: string, percentage: number) => void;
  onSaveAllocations: (assetId: string) => void;
  loading: boolean;
}

export function AllocationSection({
  assets,
  selectedMembers,
  manualBeneficiaries,
  assetAllocations,
  unsavedChanges,
  onAllocationChange,
  onSaveAllocations,
  loading
}: AllocationSectionProps) {
  const [currentAssetIndex, setCurrentAssetIndex] = React.useState(0);
  const vehicleOrPropertyAssets = assets.filter(
    asset => asset.asset_type === 'vehicle' || asset.asset_type === 'property'
  );

  const handleSlideChange = (index: number) => {
    setCurrentAssetIndex(index);
  };

  return (
    <div>
      <AssetAllocationList
        assets={assets}
        onSlideChange={handleSlideChange}
        selectedMembers={selectedMembers}
        manualBeneficiaries={manualBeneficiaries}
        assetAllocations={assetAllocations}
        unsavedChanges={unsavedChanges}
        onAllocationChange={onAllocationChange}
        onSaveAllocations={onSaveAllocations}
        loading={loading}
      />
      
      {vehicleOrPropertyAssets.length > 0 && assets[currentAssetIndex] && (
        assets[currentAssetIndex].asset_type === 'vehicle' || 
        assets[currentAssetIndex].asset_type === 'property'
      ) && (
        <div className="space-y-6 mt-4">
          <DebtStatus
            key={assets[currentAssetIndex].id}
            assetId={assets[currentAssetIndex].id}
            assetType={assets[currentAssetIndex].asset_type as 'vehicle' | 'property'}
            isFullyPaid={assets[currentAssetIndex].is_fully_paid}
            debtHandlingMethod={assets[currentAssetIndex].debt_handling_method}
          />
        </div>
      )}
    </div>
  );
}