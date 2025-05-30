import React from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { 
  Building2, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Star, 
  BarChart, 
  Package, 
  MessageSquare, 
  ChevronDown, 
  ChevronUp,
  Loader2,
  X,
  Check,
  Upload,
  Link,
  Globe,
  MapPin,
  Phone,
  Mail,
  FileText,
  Clock,
  DollarSign,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { PartnerForm } from './partners/PartnerForm';
import { PartnerOfferingForm } from './partners/PartnerOfferingForm';
import { PartnerTestimonialForm } from './partners/PartnerTestimonialForm';
import { PartnerMetrics } from './partners/PartnerMetrics';

type PartnerType = {
  id: string;
  name: string;
  description: string;
};

type Partner = {
  id: string;
  name: string;
  description: string;
  logo_url: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  registration_number: string;
  years_experience: number;
  type_id: string;
  website_url: string;
  featured: boolean;
  active: boolean;
  service_areas: string[];
  online_consultation: boolean;
  average_rating: number;
  rating_count: number;
  social_media: Record<string, string>;
  created_at: string;
  updated_at: string;
};

type PartnerOffering = {
  id: string;
  partner_id: string;
  name: string;
  description: string;
  price_range: string;
  is_featured: boolean;
  active: boolean;
  details: Record<string, any>;
  created_at: string;
  updated_at: string;
};

type PartnerTestimonial = {
  id: string;
  partner_id: string;
  client_name: string;
  testimonial: string;
  rating: number;
  approved: boolean;
  created_at: string;
  updated_at: string;
};

type PartnerMetricsData = {
  total_views: number;
  total_clicks: number;
  total_conversions: number;
  click_through_rate: number;
  conversion_rate: number;
  daily_metrics: Array<{
    date: string;
    views: number;
    clicks: number;
    conversions: number;
  }>;
};

type ActiveTab = 'partners' | 'offerings' | 'testimonials' | 'metrics';

export function PartnerManagement() {
  const [loading, setLoading] = React.useState(true);
  const [partnerTypes, setPartnerTypes] = React.useState<PartnerType[]>([]);
  const [partners, setPartners] = React.useState<Partner[]>([]);
  const [offerings, setOfferings] = React.useState<PartnerOffering[]>([]);
  const [testimonials, setTestimonials] = React.useState<PartnerTestimonial[]>([]);
  const [metricsData, setMetricsData] = React.useState<Record<string, PartnerMetricsData>>({});
  
  const [activeTab, setActiveTab] = React.useState<ActiveTab>('partners');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedPartnerId, setSelectedPartnerId] = React.useState<string | null>(null);
  const [expandedPartnerId, setExpandedPartnerId] = React.useState<string | null>(null);
  
  const [showPartnerForm, setShowPartnerForm] = React.useState(false);
  const [editingPartner, setEditingPartner] = React.useState<Partner | null>(null);
  
  const [showOfferingForm, setShowOfferingForm] = React.useState(false);
  const [editingOffering, setEditingOffering] = React.useState<PartnerOffering | null>(null);
  
  const [showTestimonialForm, setShowTestimonialForm] = React.useState(false);
  const [editingTestimonial, setEditingTestimonial] = React.useState<PartnerTestimonial | null>(null);

  // Fetch partner types
  const fetchPartnerTypes = React.useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('partner_types')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setPartnerTypes(data || []);
    } catch (error) {
      console.error('Error fetching partner types:', error);
      toast.error('Failed to load partner types');
    }
  }, []);

  // Fetch partners
  const fetchPartners = React.useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('partner_firms')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setPartners(data || []);
    } catch (error) {
      console.error('Error fetching partners:', error);
      toast.error('Failed to load partners');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch offerings for a specific partner
  const fetchOfferings = React.useCallback(async (partnerId?: string) => {
    try {
      setLoading(true);
      let query = supabase
        .from('partner_offerings')
        .select('*')
        .order('name');
      
      if (partnerId) {
        query = query.eq('partner_id', partnerId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      setOfferings(data || []);
    } catch (error) {
      console.error('Error fetching offerings:', error);
      toast.error('Failed to load offerings');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch testimonials for a specific partner
  const fetchTestimonials = React.useCallback(async (partnerId?: string) => {
    try {
      setLoading(true);
      let query = supabase
        .from('partner_testimonials')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (partnerId) {
        query = query.eq('partner_id', partnerId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      setTestimonials(data || []);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      toast.error('Failed to load testimonials');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch metrics for a specific partner
  const fetchMetrics = React.useCallback(async (partnerId: string) => {
    try {
      const { data, error } = await supabase
        .rpc('get_partner_metrics_summary', { partner_uuid: partnerId });
      
      if (error) throw error;
      
      setMetricsData(prev => ({
        ...prev,
        [partnerId]: data
      }));
    } catch (error) {
      console.error('Error fetching metrics:', error);
      toast.error('Failed to load metrics');
    }
  }, []);

  // Initial data loading
  React.useEffect(() => {
    fetchPartnerTypes();
    fetchPartners();
    
    if (activeTab === 'offerings') {
      fetchOfferings(selectedPartnerId || undefined);
    } else if (activeTab === 'testimonials') {
      fetchTestimonials(selectedPartnerId || undefined);
    }
  }, [fetchPartnerTypes, fetchPartners, fetchOfferings, fetchTestimonials, activeTab, selectedPartnerId]);

  // Load metrics when a partner is expanded
  React.useEffect(() => {
    if (expandedPartnerId && activeTab === 'metrics') {
      fetchMetrics(expandedPartnerId);
    }
  }, [expandedPartnerId, fetchMetrics, activeTab]);

  // Filter partners based on search term
  const filteredPartners = React.useMemo(() => {
    if (!searchTerm) return partners;
    
    return partners.filter(partner => 
      partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [partners, searchTerm]);

  // Handle partner form submission
  const handlePartnerSubmit = async (partnerData: Partial<Partner>) => {
    try {
      if (editingPartner) {
        // Update existing partner
        const { error } = await supabase
          .from('partner_firms')
          .update(partnerData)
          .eq('id', editingPartner.id);
        
        if (error) throw error;
        
        toast.success('Partner updated successfully');
        setEditingPartner(null);
      } else {
        // Create new partner
        const { error } = await supabase
          .from('partner_firms')
          .insert(partnerData);
        
        if (error) throw error;
        
        toast.success('Partner added successfully');
      }
      
      setShowPartnerForm(false);
      fetchPartners();
    } catch (error) {
      console.error('Error saving partner:', error);
      toast.error('Failed to save partner');
    }
  };

  // Handle offering form submission
  const handleOfferingSubmit = async (offeringData: Partial<PartnerOffering>) => {
    try {
      if (editingOffering) {
        // Update existing offering
        const { error } = await supabase
          .from('partner_offerings')
          .update(offeringData)
          .eq('id', editingOffering.id);
        
        if (error) throw error;
        
        toast.success('Offering updated successfully');
        setEditingOffering(null);
      } else {
        // Create new offering
        const { error } = await supabase
          .from('partner_offerings')
          .insert(offeringData);
        
        if (error) throw error;
        
        toast.success('Offering added successfully');
      }
      
      setShowOfferingForm(false);
      fetchOfferings(selectedPartnerId || undefined);
    } catch (error) {
      console.error('Error saving offering:', error);
      toast.error('Failed to save offering');
    }
  };

  // Handle testimonial form submission
  const handleTestimonialSubmit = async (testimonialData: Partial<PartnerTestimonial>) => {
    try {
      if (editingTestimonial) {
        // Update existing testimonial
        const { error } = await supabase
          .from('partner_testimonials')
          .update(testimonialData)
          .eq('id', editingTestimonial.id);
        
        if (error) throw error;
        
        toast.success('Testimonial updated successfully');
        setEditingTestimonial(null);
      } else {
        // Create new testimonial
        const { error } = await supabase
          .from('partner_testimonials')
          .insert(testimonialData);
        
        if (error) throw error;
        
        toast.success('Testimonial added successfully');
      }
      
      setShowTestimonialForm(false);
      fetchTestimonials(selectedPartnerId || undefined);
    } catch (error) {
      console.error('Error saving testimonial:', error);
      toast.error('Failed to save testimonial');
    }
  };

  // Handle partner deletion
  const handleDeletePartner = async (partnerId: string) => {
    if (!confirm('Are you sure you want to delete this partner? This action cannot be undone.')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('partner_firms')
        .delete()
        .eq('id', partnerId);
      
      if (error) throw error;
      
      toast.success('Partner deleted successfully');
      fetchPartners();
      
      if (selectedPartnerId === partnerId) {
        setSelectedPartnerId(null);
      }
      
      if (expandedPartnerId === partnerId) {
        setExpandedPartnerId(null);
      }
    } catch (error) {
      console.error('Error deleting partner:', error);
      toast.error('Failed to delete partner');
    }
  };

  // Handle offering deletion
  const handleDeleteOffering = async (offeringId: string) => {
    if (!confirm('Are you sure you want to delete this offering? This action cannot be undone.')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('partner_offerings')
        .delete()
        .eq('id', offeringId);
      
      if (error) throw error;
      
      toast.success('Offering deleted successfully');
      fetchOfferings(selectedPartnerId || undefined);
    } catch (error) {
      console.error('Error deleting offering:', error);
      toast.error('Failed to delete offering');
    }
  };

  // Handle testimonial deletion
  const handleDeleteTestimonial = async (testimonialId: string) => {
    if (!confirm('Are you sure you want to delete this testimonial? This action cannot be undone.')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('partner_testimonials')
        .delete()
        .eq('id', testimonialId);
      
      if (error) throw error;
      
      toast.success('Testimonial deleted successfully');
      fetchTestimonials(selectedPartnerId || undefined);
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      toast.error('Failed to delete testimonial');
    }
  };

  // Toggle partner featured status
  const togglePartnerFeatured = async (partnerId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('partner_firms')
        .update({ featured: !currentStatus })
        .eq('id', partnerId);
      
      if (error) throw error;
      
      toast.success(`Partner ${!currentStatus ? 'featured' : 'unfeatured'} successfully`);
      fetchPartners();
    } catch (error) {
      console.error('Error updating partner featured status:', error);
      toast.error('Failed to update partner featured status');
    }
  };

  // Toggle partner active status
  const togglePartnerActive = async (partnerId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('partner_firms')
        .update({ active: !currentStatus })
        .eq('id', partnerId);
      
      if (error) throw error;
      
      toast.success(`Partner ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      fetchPartners();
    } catch (error) {
      console.error('Error updating partner active status:', error);
      toast.error('Failed to update partner active status');
    }
  };

  // Toggle testimonial approval
  const toggleTestimonialApproval = async (testimonialId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('partner_testimonials')
        .update({ approved: !currentStatus })
        .eq('id', testimonialId);
      
      if (error) throw error;
      
      toast.success(`Testimonial ${!currentStatus ? 'approved' : 'unapproved'} successfully`);
      fetchTestimonials(selectedPartnerId || undefined);
    } catch (error) {
      console.error('Error updating testimonial approval status:', error);
      toast.error('Failed to update testimonial approval status');
    }
  };

  // Get partner type name by ID
  const getPartnerTypeName = (typeId: string) => {
    const type = partnerTypes.find(t => t.id === typeId);
    return type ? type.name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Unknown';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-[#2D2D2D]">Partner Management</h2>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#2D2D2D]/60" />
            <input
              type="text"
              placeholder="Search partners..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-lg"
              style={{
                background: 'linear-gradient(145deg, #ffffff, #f5f5f5)',
                boxShadow: 'inset 2px 2px 5px #d1d1d1, inset -2px -2px 5px #ffffff'
              }}
            />
          </div>
          <button
            onClick={() => {
              setEditingPartner(null);
              setShowPartnerForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-all"
            style={{
              background: 'linear-gradient(145deg, #0047AB, #D4AF37)',
              boxShadow: '4px 4px 8px #d1d1d1, -4px -4px 8px #ffffff'
            }}
          >
            <Plus className="w-4 h-4" />
            Add Partner
          </button>
        </div>
      </div>

      <div className="flex mb-6">
        <div className="flex rounded-lg overflow-hidden" style={{
          background: 'linear-gradient(145deg, #0047AB, #D4AF37)',
          boxShadow: '4px 4px 8px #d1d1d1, -4px -4px 8px #ffffff'
        }}>
          <button
            onClick={() => setActiveTab('partners')}
            className={`px-4 py-2 flex items-center gap-2 ${activeTab === 'partners' 
              ? 'bg-white text-[#2D2D2D]' 
              : 'text-white'}`}
          >
            <Building2 className="w-4 h-4" />
            <span>Partners</span>
          </button>
          <button
            onClick={() => setActiveTab('offerings')}
            className={`px-4 py-2 flex items-center gap-2 ${activeTab === 'offerings' 
              ? 'bg-white text-[#2D2D2D]' 
              : 'text-white'}`}
          >
            <Package className="w-4 h-4" />
            <span>Offerings</span>
          </button>
          <button
            onClick={() => setActiveTab('testimonials')}
            className={`px-4 py-2 flex items-center gap-2 ${activeTab === 'testimonials' 
              ? 'bg-white text-[#2D2D2D]' 
              : 'text-white'}`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Testimonials</span>
          </button>
          <button
            onClick={() => setActiveTab('metrics')}
            className={`px-4 py-2 flex items-center gap-2 ${activeTab === 'metrics' 
              ? 'bg-white text-[#2D2D2D]' 
              : 'text-white'}`}
          >
            <BarChart className="w-4 h-4" />
            <span>Metrics</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : (
        <>
          {activeTab === 'partners' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPartners.map(partner => (
                <div
                  key={partner.id}
                  className="p-6 rounded-xl"
                  style={{
                    background: 'linear-gradient(145deg, #ffffff, #f5f5f5)',
                    boxShadow: '6px 6px 12px #d1d1d1, -6px -6px 12px #ffffff'
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {partner.logo_url ? (
                        <img 
                          src={partner.logo_url} 
                          alt={`${partner.name} logo`}
                          className="w-12 h-12 object-contain rounded"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded flex items-center justify-center" style={{
                          background: 'linear-gradient(145deg, #0047AB, #D4AF37)'
                        }}>
                          <Building2 className="w-6 h-6 text-white" />
                        </div>
                      )}
                      <div>
                        <h3 className="text-lg font-semibold">{partner.name}</h3>
                        <p className="text-xs text-[#2D2D2D]/60">
                          {partner.type_id ? getPartnerTypeName(partner.type_id) : 'Executor Service'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          setEditingPartner(partner);
                          setShowPartnerForm(true);
                        }}
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                      >
                        <Edit className="w-4 h-4 text-[#2D2D2D]/60" />
                      </button>
                      <button
                        onClick={() => handleDeletePartner(partner.id)}
                        className="p-2 rounded-full hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-sm text-[#2D2D2D]/80 mb-4 line-clamp-2">
                    {partner.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {partner.featured && (
                      <span className="px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-800 flex items-center gap-1">
                        <Star className="w-3 h-3" /> Featured
                      </span>
                    )}
                    {partner.active ? (
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Active
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 flex items-center gap-1">
                        <X className="w-3 h-3" /> Inactive
                      </span>
                    )}
                    {partner.online_consultation && (
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 flex items-center gap-1">
                        <Globe className="w-3 h-3" /> Online
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-[#2D2D2D]/60" />
                      <span className="text-[#2D2D2D]/80">{partner.contact_email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-[#2D2D2D]/60" />
                      <span className="text-[#2D2D2D]/80">{partner.contact_phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#2D2D2D]/60" />
                      <span className="text-[#2D2D2D]/80 truncate">{partner.address}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between mt-4 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => togglePartnerFeatured(partner.id, partner.featured)}
                      className="text-xs flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100"
                    >
                      {partner.featured ? (
                        <>
                          <Star className="w-3.5 h-3.5 text-amber-500" />
                          <span>Unfeature</span>
                        </>
                      ) : (
                        <>
                          <Star className="w-3.5 h-3.5 text-[#2D2D2D]/60" />
                          <span>Feature</span>
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={() => togglePartnerActive(partner.id, partner.active)}
                      className="text-xs flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100"
                    >
                      {partner.active ? (
                        <>
                          <ToggleRight className="w-3.5 h-3.5 text-green-500" />
                          <span>Deactivate</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="w-3.5 h-3.5 text-[#2D2D2D]/60" />
                          <span>Activate</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'offerings' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <select
                    value={selectedPartnerId || ''}
                    onChange={(e) => setSelectedPartnerId(e.target.value || null)}
                    className="px-4 py-2 rounded-lg"
                    style={{
                      background: 'linear-gradient(145deg, #ffffff, #f5f5f5)',
                      boxShadow: 'inset 2px 2px 5px #d1d1d1, inset -2px -2px 5px #ffffff'
                    }}
                  >
                    <option value="">All Partners</option>
                    {partners.map(partner => (
                      <option key={partner.id} value={partner.id}>{partner.name}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() => {
                    setEditingOffering(null);
                    setShowOfferingForm(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-all"
                  style={{
                    background: 'linear-gradient(145deg, #0047AB, #D4AF37)',
                    boxShadow: '4px 4px 8px #d1d1d1, -4px -4px 8px #ffffff'
                  }}
                  disabled={!selectedPartnerId}
                >
                  <Plus className="w-4 h-4" />
                  Add Offering
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {offerings.length === 0 ? (
                  <div className="col-span-full text-center py-12 text-[#2D2D2D]/60">
                    {selectedPartnerId 
                      ? "No offerings found for this partner. Add one to get started."
                      : "Please select a partner to manage offerings."}
                  </div>
                ) : (
                  offerings.map(offering => {
                    const partner = partners.find(p => p.id === offering.partner_id);
                    return (
                      <div
                        key={offering.id}
                        className="p-6 rounded-xl"
                        style={{
                          background: 'linear-gradient(145deg, #ffffff, #f5f5f5)',
                          boxShadow: '6px 6px 12px #d1d1d1, -6px -6px 12px #ffffff'
                        }}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold">{offering.name}</h3>
                            <p className="text-xs text-[#2D2D2D]/60">
                              {partner?.name || 'Unknown Partner'}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => {
                                setEditingOffering(offering);
                                setShowOfferingForm(true);
                              }}
                              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                            >
                              <Edit className="w-4 h-4 text-[#2D2D2D]/60" />
                            </button>
                            <button
                              onClick={() => handleDeleteOffering(offering.id)}
                              className="p-2 rounded-full hover:bg-red-100 transition-colors"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                        </div>
                        
                        <p className="text-sm text-[#2D2D2D]/80 mb-4">
                          {offering.description}
                        </p>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          {offering.is_featured && (
                            <span className="px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-800 flex items-center gap-1">
                              <Star className="w-3 h-3" /> Featured
                            </span>
                          )}
                          {offering.active ? (
                            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 flex items-center gap-1">
                              <Check className="w-3 h-3" /> Active
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 flex items-center gap-1">
                              <X className="w-3 h-3" /> Inactive
                            </span>
                          )}
                          {offering.price_range && (
                            <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 flex items-center gap-1">
                              <DollarSign className="w-3 h-3" /> {offering.price_range}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {activeTab === 'testimonials' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <select
                    value={selectedPartnerId || ''}
                    onChange={(e) => setSelectedPartnerId(e.target.value || null)}
                    className="px-4 py-2 rounded-lg"
                    style={{
                      background: 'linear-gradient(145deg, #ffffff, #f5f5f5)',
                      boxShadow: 'inset 2px 2px 5px #d1d1d1, inset -2px -2px 5px #ffffff'
                    }}
                  >
                    <option value="">All Partners</option>
                    {partners.map(partner => (
                      <option key={partner.id} value={partner.id}>{partner.name}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() => {
                    setEditingTestimonial(null);
                    setShowTestimonialForm(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-all"
                  style={{
                    background: 'linear-gradient(145deg, #0047AB, #D4AF37)',
                    boxShadow: '4px 4px 8px #d1d1d1, -4px -4px 8px #ffffff'
                  }}
                  disabled={!selectedPartnerId}
                >
                  <Plus className="w-4 h-4" />
                  Add Testimonial
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {testimonials.length === 0 ? (
                  <div className="col-span-full text-center py-12 text-[#2D2D2D]/60">
                    {selectedPartnerId 
                      ? "No testimonials found for this partner. Add one to get started."
                      : "Please select a partner to manage testimonials."}
                  </div>
                ) : (
                  testimonials.map(testimonial => {
                    const partner = partners.find(p => p.id === testimonial.partner_id);
                    return (
                      <div
                        key={testimonial.id}
                        className="p-6 rounded-xl"
                        style={{
                          background: 'linear-gradient(145deg, #ffffff, #f5f5f5)',
                          boxShadow: '6px 6px 12px #d1d1d1, -6px -6px 12px #ffffff'
                        }}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold">{testimonial.client_name}</h3>
                            <p className="text-xs text-[#2D2D2D]/60">
                              {partner?.name || 'Unknown Partner'}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => toggleTestimonialApproval(testimonial.id, testimonial.approved)}
                              className={`p-2 rounded-full transition-colors ${
                                testimonial.approved 
                                  ? 'hover:bg-red-100 text-green-500' 
                                  : 'hover:bg-green-100 text-[#2D2D2D]/60'
                              }`}
                            >
                              {testimonial.approved ? (
                                <Check className="w-4 h-4" />
                              ) : (
                                <X className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => {
                                setEditingTestimonial(testimonial);
                                setShowTestimonialForm(true);
                              }}
                              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                            >
                              <Edit className="w-4 h-4 text-[#2D2D2D]/60" />
                            </button>
                            <button
                              onClick={() => handleDeleteTestimonial(testimonial.id)}
                              className="p-2 rounded-full hover:bg-red-100 transition-colors"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex mb-2">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star 
                              key={i}
                              className={`w-4 h-4 ${i < testimonial.rating ? 'text-amber-500' : 'text-gray-300'}`}
                              fill={i < testimonial.rating ? '#F59E0B' : '#D1D5DB'}
                            />
                          ))}
                        </div>
                        
                        <p className="text-sm text-[#2D2D2D]/80 mb-4 italic">
                          "{testimonial.testimonial}"
                        </p>
                        
                        <div className="flex justify-between text-xs text-[#2D2D2D]/60">
                          <span>{new Date(testimonial.created_at).toLocaleDateString()}</span>
                          <span className={`px-2 py-0.5 rounded-full ${
                            testimonial.approved 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {testimonial.approved ? 'Approved' : 'Pending'}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {activeTab === 'metrics' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <select
                  value={expandedPartnerId || ''}
                  onChange={(e) => setExpandedPartnerId(e.target.value || null)}
                  className="px-4 py-2 rounded-lg"
                  style={{
                    background: 'linear-gradient(145deg, #ffffff, #f5f5f5)',
                    boxShadow: 'inset 2px 2px 5px #d1d1d1, inset -2px -2px 5px #ffffff'
                  }}
                >
                  <option value="">Select Partner</option>
                  {partners.map(partner => (
                    <option key={partner.id} value={partner.id}>{partner.name}</option>
                  ))}
                </select>
              </div>

              {expandedPartnerId ? (
                metricsData[expandedPartnerId] ? (
                  <PartnerMetrics 
                    data={metricsData[expandedPartnerId]} 
                    partner={partners.find(p => p.id === expandedPartnerId)}
                  />
                ) : (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                  </div>
                )
              ) : (
                <div className="text-center py-12 text-[#2D2D2D]/60">
                  Please select a partner to view metrics.
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Partner Form Modal */}
      {showPartnerForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div 
            className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            style={{
              background: 'linear-gradient(145deg, #ffffff, #f5f5f5)',
              boxShadow: '20px 20px 60px #d9d9d9, -20px -20px 60px #ffffff'
            }}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">
                {editingPartner ? 'Edit Partner' : 'Add New Partner'}
              </h3>
              <button
                onClick={() => setShowPartnerForm(false)}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <PartnerForm 
              partner={editingPartner}
              partnerTypes={partnerTypes}
              onSubmit={handlePartnerSubmit}
              onCancel={() => setShowPartnerForm(false)}
            />
          </div>
        </div>
      )}

      {/* Offering Form Modal */}
      {showOfferingForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div 
            className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            style={{
              background: 'linear-gradient(145deg, #ffffff, #f5f5f5)',
              boxShadow: '20px 20px 60px #d9d9d9, -20px -20px 60px #ffffff'
            }}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">
                {editingOffering ? 'Edit Offering' : 'Add New Offering'}
              </h3>
              <button
                onClick={() => setShowOfferingForm(false)}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <PartnerOfferingForm 
              offering={editingOffering}
              partnerId={selectedPartnerId}
              partners={partners}
              onSubmit={handleOfferingSubmit}
              onCancel={() => setShowOfferingForm(false)}
            />
          </div>
        </div>
      )}

      {/* Testimonial Form Modal */}
      {showTestimonialForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div 
            className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            style={{
              background: 'linear-gradient(145deg, #ffffff, #f5f5f5)',
              boxShadow: '20px 20px 60px #d9d9d9, -20px -20px 60px #ffffff'
            }}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">
                {editingTestimonial ? 'Edit Testimonial' : 'Add New Testimonial'}
              </h3>
              <button
                onClick={() => setShowTestimonialForm(false)}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <PartnerTestimonialForm 
              testimonial={editingTestimonial}
              partnerId={selectedPartnerId}
              partners={partners}
              onSubmit={handleTestimonialSubmit}
              onCancel={() => setShowTestimonialForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}