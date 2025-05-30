import React from 'react';
import { Loader2 } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation, A11y, type Swiper as SwiperType } from 'swiper/modules';
import { Asset, FamilyMember } from '../../lib/types';
import { AssetAllocationCard } from './AssetAllocationCard';

interface AssetAllocationListProps {
  assets: Asset[];
  selectedMembers: FamilyMember[];
  manualBeneficiaries: any[];
  assetAllocations: Record<string, Record<string, number>>;
  editMode: boolean;
  unsavedChanges: Set<string>;
  onSlideChange: (index: number) => void;
  onAllocationChange: (assetId: string, beneficiaryId: string, percentage: number) => void;
  onSaveAllocations: (assetId: string) => void;
  loading?: boolean;
}

interface SwiperInstance extends SwiperType {
  activeIndex: number;
}

export function AssetAllocationList({
  assets,
  selectedMembers,
  manualBeneficiaries,
  onSlideChange,
  editMode,
  assetAllocations,
  unsavedChanges,
  onAllocationChange,
  onSaveAllocations,
  loading
}: AssetAllocationListProps) {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const swiperRef = React.useRef<SwiperInstance | null>(null);
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    );
  }

  if (assets.length === 0) {
    return (
      <p className="text-center text-[#2D2D2D]/60 py-4">
        No assets found. Add assets first.
      </p>
    );
  }

  return (
    <div className="asset-carousel -mt-12">
      {isClient && (
        <Swiper
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
            swiper.slideTo(activeIndex, 0);
            onSlideChange(activeIndex);
          }}
          onActiveIndexChange={(swiper) => {
            setActiveIndex(swiper.activeIndex);
            onSlideChange(swiper.activeIndex);
          }}
          modules={[Pagination, Navigation, A11y]}
          spaceBetween={16}
          slidesPerView={1}
          centeredSlides={true}
          navigation={true}
          pagination={{ 
            clickable: true,
            bulletActiveClass: 'swiper-pagination-bullet-active'
          }}
          breakpoints={{
            640: {
              slidesPerView: 1.5,
            },
            768: {
              slidesPerView: 2,
            }
          }}
          className="pb-8"
        >
          {assets.map((asset) => {
            const allBeneficiaries = [...selectedMembers, ...manualBeneficiaries];
            return (
              <SwiperSlide key={asset.id}>
                <AssetAllocationCard
                  asset={asset}
                  beneficiaries={allBeneficiaries}
                  editMode={editMode}
                  allocations={assetAllocations[asset.id] || {}}
                  onAllocationChange={(beneficiaryId, percentage) => 
                    onAllocationChange(asset.id, beneficiaryId, percentage)
                  }
                  onSave={async () => {
                    await onSaveAllocations(asset.id);
                    if (swiperRef.current) {
                      swiperRef.current.slideTo(activeIndex, 0);
                    }
                  }}
                  loading={loading}
                  hasUnsavedChanges={unsavedChanges.has(asset.id)}
                />
              </SwiperSlide>
            );
          })}
        </Swiper>
      )}
    </div>
  );
}