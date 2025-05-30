import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, Car, Home, Laptop, Briefcase, Building2, Package, Plus, Trash2, CarFront, Factory, CalendarClock, HandPlatter as LicensePlate, Banknote, MapPin, Building, Key, Landmark, Smartphone, Cpu, Barcode, Wallet, Receipt, Percent, FileSpreadsheet, BookOpen, Tag, ScrollText, X, Edit, Save } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Asset } from '../lib/types';
import { Pagination, Navigation, A11y } from 'swiper/modules';
import * as Tooltip from '@radix-ui/react-tooltip';
import { OtherAssetsModal } from './modals/OtherAssetsModal';
import { toast, Toaster } from 'sonner';
import { useProfile, useUpdateProfile, useEstateScore } from '../lib/hooks';
import { supabase } from '../lib/supabase';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import './AssetsScreen.css';

interface AssetsScreenProps {
  onNavigate: (screen: string) => void;
}

const assetTypes = [
  {
    type: 'vehicle',
    title: 'Vehicle',
    icon: Car,
    description: 'Add cars, motorcycles, boats, or any other vehicles you own.',
    fields: [
      { name: 'make', icon: Factory, placeholder: 'Enter manufacturer' },
      { name: 'model', icon: CarFront, placeholder: 'Enter model' },
      { name: 'year', icon: CalendarClock, placeholder: 'Enter year' },
      { name: 'registration', icon: LicensePlate, placeholder: 'Enter registration number' },
      { name: 'estimated_value', icon: Banknote, placeholder: 'Enter estimated value' }
    ]
  },
  {
    type: 'property',
    title: 'Property',
    icon: Home,
    description: 'Add houses, apartments, land, or other real estate properties.',
    fields: [
      { name: 'address', icon: MapPin, placeholder: 'Enter property address' },
      { 
        name: 'type',
        icon: Building,
        placeholder: 'Select property type',
        type: 'select',
        options: [
          'House',
          'Apartment',
          'Townhouse',
          'Vacant Land',
          'Commercial Property',
          'Industrial Property',
          'Farm',
          'Holiday Home'
        ]
      },
      { 
        name: 'ownership_type',
        icon: Key,
        placeholder: 'Select ownership type',
        type: 'select',
        options: [
          'Full Ownership',
          'Joint Ownership',
          'Trust Ownership',
          'Company Ownership',
          'Leasehold'
        ]
      },
      { name: 'title_deed_number', icon: ScrollText, placeholder: 'Enter title deed number' },
      { name: 'estimated_value', icon: Banknote, placeholder: 'Enter estimated value' }
    ]
  },
  {
    type: 'electronics',
    title: 'Electronics',
    icon: Laptop,
    description: 'Add computers, phones, appliances, or other valuable electronics.',
    fields: [
      { name: 'item_name', icon: Smartphone, placeholder: 'Enter device name' },
      { name: 'brand', icon: Tag, placeholder: 'Enter brand name' },
      { name: 'model', icon: Cpu, placeholder: 'Enter model number' },
      { name: 'serial_number', icon: Barcode, placeholder: 'Enter serial number' },
      { name: 'estimated_value', icon: Banknote, placeholder: 'Enter estimated value' }
    ]
  },
  {
    type: 'bank',
    title: 'Bank',
    icon: Briefcase,
    description: 'Add bank accounts, investments, or other financial assets.',
    fields: [
      { 
        name: 'account_type',
        icon: Wallet,
        placeholder: 'Select account type',
        type: 'select',
        options: [
          'Savings Account',
          'Current Account',
          'Fixed Deposit',
          'Money Market Account',
          'Investment Account',
          'Tax-Free Savings Account',
          'Foreign Currency Account',
          'Cryptocurrency Account'
        ]
      },
      { name: 'bank_name', icon: Landmark, placeholder: 'Enter bank name' },
      { name: 'account_number', icon: Receipt, placeholder: 'Enter account number' },
      { name: 'estimated_value', icon: Banknote, placeholder: 'Enter balance' }
    ]
  },
  {
    type: 'business',
    title: 'Business',
    icon: Building2,
    description: 'Add businesses you own or have shares in.',
    fields: [
      { name: 'business_name', icon: Building2, placeholder: 'Enter business name' },
      { name: 'registration_number', icon: BookOpen, placeholder: 'Enter registration number' },
      { name: 'ownership_percentage', icon: Percent, placeholder: 'Enter ownership percentage' },
      { name: 'estimated_value', icon: Banknote, placeholder: 'Enter estimated value' }
    ]
  },
  {
    type: 'other',
    title: 'Other',
    icon: Package,
    description: 'Add any other valuable assets not covered by other categories.',
    fields: [
      { name: 'item_name', icon: Tag, placeholder: 'Enter item name' },
      { name: 'description', icon: ScrollText, placeholder: 'Enter description' },
      { name: 'estimated_value', icon: Banknote, placeholder: 'Enter estimated value' }
    ]
  }
];

export function AssetsScreen({ onNavigate }: AssetsScreenProps) {
  const { profile, loading: profileLoading } = useProfile();
  const { updateProfile, loading: updateLoading } = useUpdateProfile();
  const { score, refetchScore } = useEstateScore(profile?.id);
  const [selectedType, setSelectedType] = React.useState(assetTypes[0]);
  const [assetsData, setAssetsData] = React.useState<Record<string, string>[]>(() => {
    const emptyAsset = selectedType.fields.reduce((acc, field) => ({
      ...acc,
      [field.name]: ''
    }), {});
    return [emptyAsset];
  });
  const [activeAssetIndex, setActiveAssetIndex] = React.useState(0);
  const [showDeleteButtons, setShowDeleteButtons] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [savedAssets, setSavedAssets] = React.useState<Record<number, string>>({});
  const [hasAnyAssets, setHasAnyAssets] = React.useState(false);
  const [showOtherAssetsModal, setShowOtherAssetsModal] = React.useState(false);
  const modalTimerRef = React.useRef<NodeJS.Timeout>();
  const [loading, setLoading] = React.useState(false);
  const [editMode, setEditMode] = React.useState(false);
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  React.useEffect(() => {
    return () => {
      if (modalTimerRef.current) {
        clearTimeout(modalTimerRef.current);
      }
    };
  }, []);

  const handleInputChange = React.useCallback((field: string, value: string) => {
    setAssetsData(prev => {
      const newData = [...prev];
      if (!newData[activeAssetIndex]) {
        newData[activeAssetIndex] = selectedType.fields.reduce((acc, f) => ({
          ...acc,
          [f.name]: ''
        }), {});
      }
      newData[activeAssetIndex] = {
        ...newData[activeAssetIndex],
        [field]: value
      };
      return newData;
    });
  }, [activeAssetIndex, selectedType.fields]);

  const handleAssetTypeChange = React.useCallback((type: typeof assetTypes[0]) => {
    setSelectedType(type);
  }, []);

  const handleRemoveAsset = React.useCallback(async (index: number) => {
    if (!profile) return;

    try {
      setSaving(true);

      const assetId = savedAssets[index];
      if (assetId) {
        const { error } = await supabase
          .from('assets')
          .delete()
          .eq('id', assetId);

        if (error) throw error;
      }

      setAssetsData(prev => prev.filter((_, i) => i !== index));

      const newSavedAssets: Record<number, string> = {};
      Object.entries(savedAssets).forEach(([key, value]) => {
        const keyNum = parseInt(key);
        if (keyNum < index) {
          newSavedAssets[keyNum] = value;
        } else if (keyNum > index) {
          newSavedAssets[keyNum - 1] = value;
        }
      });
      setSavedAssets(newSavedAssets);

      if (activeAssetIndex >= index) {
        setActiveAssetIndex(Math.max(0, activeAssetIndex - 1));
      }

      setShowDeleteButtons(Object.keys(newSavedAssets).length > 1);

      const remainingAssets = await supabase
        .from('assets')
        .select('id')
        .eq('profile_id', profile.id);

      setHasAnyAssets(remainingAssets.data && remainingAssets.data.length > 0);

      toast.success('Asset removed successfully');
    } catch (error) {
      console.error('Error removing asset:', error);
      toast.error('Failed to remove asset. Please try again.');
    } finally {
      setSaving(false);
    }
  }, [profile, savedAssets, activeAssetIndex]);

  const handleSaveAsset = async () => {
    if (!profile) return;
    
    const currentAssetData = assetsData[activeAssetIndex];
    if (!currentAssetData?.estimated_value) {
      toast.error('Please enter an estimated value');
      return;
    }

    setSaving(true);
    try {
      if (savedAssets[activeAssetIndex]) {
        const assetName = selectedType.fields.find(field => 
          ['make', 'business_name', 'item_name', 'account_type', 'address'].includes(field.name)
        );
        const name = assetName && currentAssetData[assetName.name] 
          ? currentAssetData[assetName.name] 
          : 'Untitled Asset';
        
        const { error: updateError } = await supabase
          .from('assets')
          .update({
            name,
            details: currentAssetData,
            estimated_value: parseFloat(currentAssetData.estimated_value) || 0
          })
          .eq('id', savedAssets[activeAssetIndex]);

        if (updateError) throw updateError;
        
        toast.success('Asset updated successfully!');
      } else {
        const assetName = selectedType.fields.find(field => 
          ['make', 'business_name', 'item_name', 'account_type', 'address'].includes(field.name)
        );
        const name = assetName && currentAssetData[assetName.name] 
          ? currentAssetData[assetName.name] 
          : 'Untitled Asset';
        
        const asset = {
          profile_id: profile.id,
          asset_type: selectedType.type,
          name,
          details: currentAssetData,
          estimated_value: parseFloat(currentAssetData.estimated_value) || 0,
          is_fully_paid: false,
          debt_handling_method: null
        };

        const { data, error: assetError } = await supabase
          .from('assets')
          .insert(asset)
          .select()
          .single();

        if (assetError) throw assetError;

        setSavedAssets(prev => ({
          ...prev,
          [activeAssetIndex]: data.id
        }));

        setHasAnyAssets(true);

        toast.success('Asset added successfully!');
      }
    } catch (error) {
      toast.error(savedAssets[activeAssetIndex] 
        ? 'Failed to update asset. Please try again.' 
        : 'Failed to add asset. Please try again.');
      console.error(savedAssets[activeAssetIndex] ? 'Failed to update asset:' : 'Failed to add asset:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddAsset = async () => {
    if (!profile) return;
    
    const currentAssetData = assetsData[activeAssetIndex];
    if (!currentAssetData?.estimated_value) {
      toast.error('Please enter an estimated value');
      return;
    }

    setSaving(true);
    try {
      if (savedAssets[activeAssetIndex]) {
        const assetName = selectedType.fields.find(field => 
          ['make', 'business_name', 'item_name', 'account_type', 'address'].includes(field.name)
        );
        const name = assetName && currentAssetData[assetName.name] 
          ? currentAssetData[assetName.name] 
          : 'Untitled Asset';
        
        const { error: updateError } = await supabase
          .from('assets')
          .update({
            name,
            details: currentAssetData,
            estimated_value: parseFloat(currentAssetData.estimated_value) || 0
          })
          .eq('id', savedAssets[activeAssetIndex]);

        if (updateError) throw updateError;
        
        toast.success('Asset updated successfully!');
      } else {
        const assetName = selectedType.fields.find(field => 
          ['make', 'business_name', 'item_name', 'account_type', 'address'].includes(field.name)
        );
        const name = assetName && currentAssetData[assetName.name] 
          ? currentAssetData[assetName.name] 
          : 'Untitled Asset';
        
        const asset = {
          profile_id: profile.id,
          asset_type: selectedType.type,
          name,
          details: currentAssetData,
          estimated_value: parseFloat(currentAssetData.estimated_value) || 0,
          is_fully_paid: false,
          debt_handling_method: null
        };

        const { data, error: assetError } = await supabase
          .from('assets')
          .insert(asset)
          .select()
          .single();

        if (assetError) throw assetError;

        setSavedAssets(prev => ({
          ...prev,
          [activeAssetIndex]: data.id
        }));

        setHasAnyAssets(true);

        toast.success('Asset added successfully!');
      }
    } catch (error) {
      toast.error(savedAssets[activeAssetIndex] 
        ? 'Failed to update asset. Please try again.' 
        : 'Failed to add asset. Please try again.');
      console.error(savedAssets[activeAssetIndex] ? 'Failed to update asset:' : 'Failed to add asset:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddAssetPill = React.useCallback(() => {
    const emptyAsset = selectedType.fields.reduce((acc, field) => ({
      ...acc,
      [field.name]: ''
    }), {});
    setAssetsData(prev => [...prev, emptyAsset]);
    setActiveAssetIndex(assetsData.length);
    setSavedAssets(prev => ({ ...prev }));
    setShowDeleteButtons(true);
  }, [assetsData.length, selectedType.fields]);

  const fetchAssets = React.useCallback(async () => {
    if (!profile) return;
    try {
      const { data: allAssets, error } = await supabase
        .from('assets')
        .select(`
          id,
          name,
          asset_type,
          details,
          estimated_value,
          is_fully_paid,
          debt_handling_method
        `)
        .eq('profile_id', profile.id);
      
      if (error) throw error;

      setHasAnyAssets(allAssets && allAssets.length > 0);

      const assets = allAssets.filter(asset => asset.asset_type === selectedType.type);
      
      if (assets && assets.length > 0) {
        const formattedAssets = assets.map((asset: Asset) => ({
          ...asset.details
        }));
        
        setAssetsData(formattedAssets);
        
        const assetIds = assets.reduce((acc, asset, index) => ({
          ...acc,
          [index]: asset.id
        }), {});
        
        setSavedAssets(assetIds);
        setShowDeleteButtons(assets.length > 1);
      } else {
        const emptyAsset = selectedType.fields.reduce((acc, field) => ({
          ...acc,
          [field.name]: ''
        }), {});
        setAssetsData([emptyAsset]);
        setSavedAssets({});
        setShowDeleteButtons(false);
      }
      setActiveAssetIndex(0);
    } catch (error) {
      console.error('Error fetching assets:', error);
      toast.error('Failed to load assets');
    } finally {
      setLoading(false);
    }
  }, [profile, selectedType]);
  
  React.useEffect(() => {
    fetchAssets();
  }, [profile]);

  React.useEffect(() => {
    if (!profile) return;
    
    setEditMode(!profile.assets_added);
    
    setLoading(true);
    fetchAssets();
  }, [profile, selectedType]);

  const handleCompleteStep = async () => {
    if (!profile) return;
    
    if (editMode && !profile.assets_added) {
      await handleSaveAsset();
    }
    
    setSaving(true);
    try {
      if (!profile.assets_added && !hasAnyAssets) {
        toast.error('Please add at least one asset before completing this step');
        return;
      }

      if (!profile.assets_added) {
        await updateProfile(profile.id, {
          assets_added: true
        });

        await refetchScore();

        toast.success('Step 2 completed! Assets have been added successfully.');
      }

      onNavigate('dashboard');
      
      if (!profile.assets_added) {
        setEditMode(false);
      }
    } catch (error) {
      console.error('Failed to complete step:', error);
      toast.error('Failed to complete step. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleEditSaveToggle = async () => {
    if (editMode) {
      await handleSaveAsset();
      setEditMode(false);
    } else {
      setEditMode(true);
    }
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" expand={false} richColors />
      <div className="flex items-center mb-6">
        <button
          onClick={() => onNavigate('dashboard')}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-[#2D2D2D]" />
        </button>
        <div className="flex items-center justify-between flex-1">
          <h1 className="text-lg font-semibold text-[#2D2D2D] ml-2">Add Assets</h1>
          {profile?.assets_added && (
            <button
              onClick={handleEditSaveToggle}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              {editMode ? (
                <Save className="w-5 h-5 text-[#0047AB]" />
              ) : (
                <Edit className="w-5 h-5 text-[#0047AB]" />
              )}
            </button>
          )}
        </div>
      </div>

      <div className="asset-types-carousel">
        {isClient && (
          <Swiper
            modules={[Pagination, Navigation, A11y]}
            spaceBetween={16}
            slidesPerView={1.2}
            centeredSlides={true}
            navigation={true}
            onSlideChange={(swiper) => {
              handleAssetTypeChange(assetTypes[swiper.activeIndex]);
              if (modalTimerRef.current) {
                clearTimeout(modalTimerRef.current);
              }
              setShowOtherAssetsModal(false);
              
              if (assetTypes[swiper.activeIndex].type === 'other') {
                modalTimerRef.current = setTimeout(() => {
                  if (assetTypes[swiper.activeIndex].type === 'other') {
                    setShowOtherAssetsModal(true);
                  }
                }, 3000);
              }
            }}
            pagination={{ 
              clickable: true,
              bulletActiveClass: 'swiper-pagination-bullet-active'
            }}
            breakpoints={{
              640: {
                slidesPerView: 2,
              },
              768: {
                slidesPerView: 3,
              }
            }}
            className="pb-8"
          >
            {assetTypes.map((type) => (
              <SwiperSlide key={type.type}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleAssetTypeChange(type)}
                  className={`asset-type-card ${selectedType.type === type.type ? 'selected' : ''}`}
                >
                  <div className="asset-type-icon">
                    <type.icon className="w-6 h-6" />
                  </div>
                  <h3 className="asset-type-title">{type.title}</h3>
                  <p className="asset-type-description text-[#2D2D2D]/60">{type.description}</p>
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>

      <div className="asset-details-form">
        <div className="asset-details-header">
          <h2 className="text-lg font-semibold">{selectedType.title} Details</h2>
          <Tooltip.Provider>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <button
                  disabled={!editMode}
                  onClick={handleAddAssetPill}
                  className="add-asset-pill-button" 
                  style={{
                    opacity: !editMode ? 0.7 : 1,
                    cursor: !editMode ? 'not-allowed' : 'pointer'
                  }}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  className="bg-[#2D2D2D] text-white text-sm px-2 py-1 rounded"
                  sideOffset={5}
                >
                  Add another asset
                  <Tooltip.Arrow className="fill-[#2D2D2D]" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          </Tooltip.Provider>
        </div>

        <div className="asset-pills-container">
          {assetsData.map((_, index) => (
            <div key={index} className="flex items-center gap-2">
              <button
                onClick={() => setActiveAssetIndex(index)}
                className={`asset-pill ${activeAssetIndex === index ? 'active' : ''}`} 
                disabled={!editMode}
                style={{
                  opacity: !editMode ? 0.7 : 1,
                  cursor: !editMode ? 'not-allowed' : 'pointer'
                }}
              >
                {selectedType.title} {index + 1}
              </button>
            </div>
          ))}
        </div>

        <div className="asset-form-container">
          <div className="space-y-4">
            {selectedType.fields.map((field) => (
              <div key={field.name} className="input-group">
                <label className="block text-sm font-medium text-[#2D2D2D] mb-1">
                  {field.name.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </label>
                <div className="relative">
                  <field.icon className="input-icon w-4 h-4" />
                  {field.type === 'select' ? (
                    <select
                      value={assetsData[activeAssetIndex]?.[field.name] || ''}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      className="input-field"
                      disabled={!editMode}
                      style={{
                        opacity: !editMode ? 0.7 : 1,
                        cursor: !editMode ? 'not-allowed' : 'pointer'
                      }}
                    >
                      <option value="">{field.placeholder}</option>
                      {field.options?.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.name.includes('value') ? 'number' : 'text'}
                      value={assetsData[activeAssetIndex]?.[field.name] || ''}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      className="input-field"
                      placeholder={field.placeholder}
                      disabled={!editMode}
                      style={{
                        opacity: !editMode ? 0.7 : 1,
                        cursor: !editMode ? 'not-allowed' : 'auto'
                      }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={savedAssets[activeAssetIndex] ? handleRemoveAsset.bind(null, activeAssetIndex) : handleAddAsset}
            disabled={updateLoading || saving || !editMode}
            className={`add-asset-button ${savedAssets[activeAssetIndex] ? 'bg-red-500 hover:bg-red-600' : ''}`}
            style={{
              opacity: (!editMode || updateLoading || saving) ? 0.7 : 1,
              cursor: (!editMode || updateLoading || saving) ? 'not-allowed' : 'pointer'
            }}
          >
            {(updateLoading || saving) ? (
              <Loader2 className="w-5 h-5 animate-spin mx-auto" />
            ) : savedAssets[activeAssetIndex] ? (
              'Remove Asset'
            ) : (
              'Add Asset'
            )}
          </button>
        </div>
      </div>
      
      <button
        onClick={handleCompleteStep}
        disabled={!hasAnyAssets || updateLoading || saving}
        className="complete-step-button"
      >
        {updateLoading || saving ? (
          <Loader2 className="w-5 h-5 animate-spin mx-auto" />
        ) : profile?.assets_added ? (
          'Back to Dashboard'
        ) : (
          'Complete Step 2'  
        )}
      </button>
      
      <OtherAssetsModal
        isOpen={showOtherAssetsModal}
        onClose={() => setShowOtherAssetsModal(false)}
      />
    </div>
  );
}