import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation, A11y } from 'swiper/modules';
import { Building2, Mail, Phone, MapPin, FileText, Clock, Check, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

interface PartnerFirm {
  id: string;
  name: string;
  description: string;
  logo_url: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  registration_number: string;
  years_experience: number;
}

interface PartnerFirmsCarouselProps {
  profileId: string;
  onSelect: (firmId: string | null, firm: any | null) => void;
  editMode?: boolean;
  selectedFirmId: string | null;
}

export function PartnerFirmsCarousel({ profileId, onSelect, editMode = true, selectedFirmId }: PartnerFirmsCarouselProps) {
  const [loading, setLoading] = React.useState(true);
  const [partnerFirms, setPartnerFirms] = React.useState<PartnerFirm[]>([]);
  const [saving, setSaving] = React.useState(false);
  const [hasManualExecutors, setHasManualExecutors] = React.useState(false);
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  React.useEffect(() => {
    const checkManualExecutors = async () => {
      try {
        const { data, error } = await supabase
          .from('executors')
          .select('id')
          .eq('profile_id', profileId);

        if (error) throw error;
        setHasManualExecutors(data && data.length > 0);
      } catch (error) {
        console.error('Error checking manual executors:', error);
      }
    };

    checkManualExecutors();
  }, [profileId]);

  React.useEffect(() => {
    const fetchPartnerFirms = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('partner_firms')
          .select('*');

        if (error) throw error;
        setPartnerFirms(data || []);
      } catch (error) {
        console.error('Error fetching partner firms:', error);
        toast.error('Failed to load partner firms');
      } finally {
        setLoading(false);
      }
    };

    fetchPartnerFirms();
  }, []);

  const handleSelect = async (firmId: string) => {
    try {
      setSaving(true);
      
      const firm = partnerFirms.find(f => f.id === firmId);
      
      if (!firm) {
        throw new Error('Partner firm not found');
      }

      if (selectedFirmId === firm.id) {
        // Unselect the firm
        await supabase
          .from('profiles')
          .update({
            executor_type: null,
            partner_firm_id: null,
            partner_firm_reference: null
          })
          .eq('id', profileId);

        onSelect(null, null);
        toast.success('Partner firm unselected');
        
        // Allow switching to manual entry
        if (hasManualExecutors) {
          // If there are manual executors, keep them
          await supabase
            .from('profiles')
            .update({
              executor_type: 'manual'
            })
            .eq('id', profileId);
        }
      } else {
        // Select the firm
        const reference = `PF${Date.now().toString(36).toUpperCase()}`;
        
        await supabase
          .from('profiles')
          .update({
            executor_type: 'partner',
            partner_firm_id: firmId,
            partner_firm_reference: reference
          })
          .eq('id', profileId);

        onSelect(firmId, firm);
        toast.success('Partner firm selected as executor');
      }
    } catch (error) {
      console.error('Error selecting partner firm:', error);
      toast.error('Failed to select partner firm');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (partnerFirms.length === 0) {
    return (
      <div className="text-center py-12 text-[#2D2D2D]/60">
        No partner firms available at this time.
      </div>
    );
  }

  return (
    <div className="mt-4">
      {isClient && (
        <Swiper
          modules={[Pagination, Navigation, A11y]}
          spaceBetween={24}
          slidesPerView={1}
          navigation={true}
          pagination={{ clickable: true }}
          breakpoints={{
            640: {
              slidesPerView: 2,
            },
            1024: {
              slidesPerView: 3,
            }
          }}
          className="pb-12"
        >
          {partnerFirms.map((firm) => (
            <SwiperSlide key={firm.id}>
              <div 
                className="p-6 rounded-xl h-full"
                style={{
                  background: 'linear-gradient(145deg, #ffffff, #f5f5f5)',
                  boxShadow: '6px 6px 12px #d1d1d1, -6px -6px 12px #ffffff'
                }}
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1">{firm.name}</h3>
                    <p className="text-sm text-[#2D2D2D]/60">{firm.description}</p>
                  </div>
                  {firm.logo_url ? (
                    <img 
                      src={firm.logo_url} 
                      alt={`${firm.name} logo`}
                      className="w-12 h-12 object-contain rounded"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded flex items-center justify-center" style={{
                      background: 'linear-gradient(145deg, #0047AB, #D4AF37)'
                    }}>
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                  )}
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-[#2D2D2D]/60" />
                    <span>{firm.contact_email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-[#2D2D2D]/60" />
                    <span>{firm.contact_phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-[#2D2D2D]/60" />
                    <span>{firm.address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="w-4 h-4 text-[#2D2D2D]/60" />
                    <span>Reg: {firm.registration_number}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-[#2D2D2D]/60" />
                    <span>{firm.years_experience} years experience</span>
                  </div>
                </div>

                <button
                  onClick={() => handleSelect(firm.id)}
                  disabled={saving || hasManualExecutors || !editMode}
                  className="w-full py-2 px-4 rounded-lg transition-all text-sm flex items-center justify-center gap-2"
                  style={{
                    background: selectedFirmId === firm.id
                      ? '#ef4444'
                      : 'linear-gradient(145deg, #0047AB, #D4AF37)',
                    color: 'white',
                    boxShadow: '6px 6px 12px #d1d1d1, -6px -6px 12px #ffffff',
                    opacity: (saving || hasManualExecutors || !editMode) ? 0.5 : 1,
                    cursor: (saving || hasManualExecutors || !editMode) ? 'not-allowed' : 'pointer'
                  }}
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : hasManualExecutors ? (
                    <>
                      <Building2 className="w-4 h-4" />
                      Manual Executors Added
                    </>
                  ) : selectedFirmId === firm.id ? (
                    <>
                      <Check className="w-4 h-4" />
                      Unselect
                    </>
                  ) : (
                    <>
                      <Building2 className="w-4 h-4" />
                      Select as Executor
                    </>
                  )}
                </button>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </div>
  );
}