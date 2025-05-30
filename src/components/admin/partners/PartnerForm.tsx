import React from 'react';
import { Loader2, Building2, Mail, Phone, MapPin, FileText, Clock, Link, Globe, Check, X, ChevronDown, Plus } from 'lucide-react';

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
  social_media: Record<string, string>;
};

interface PartnerFormProps {
  partner: Partner | null;
  partnerTypes: PartnerType[];
  onSubmit: (partnerData: Partial<Partner>) => void;
  onCancel: () => void;
}

export function PartnerForm({ partner, partnerTypes, onSubmit, onCancel }: PartnerFormProps) {
  const [formData, setFormData] = React.useState<Partial<Partner>>({
    name: '',
    description: '',
    logo_url: '',
    contact_email: '',
    contact_phone: '',
    address: '',
    registration_number: '',
    years_experience: 0,
    type_id: '',
    website_url: '',
    featured: false,
    active: true,
    service_areas: [],
    online_consultation: false,
    social_media: {}
  });
  const [serviceArea, setServiceArea] = React.useState('');
  const [socialPlatform, setSocialPlatform] = React.useState('');
  const [socialUrl, setSocialUrl] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (partner) {
      setFormData({
        name: partner.name || '',
        description: partner.description || '',
        logo_url: partner.logo_url || '',
        contact_email: partner.contact_email || '',
        contact_phone: partner.contact_phone || '',
        address: partner.address || '',
        registration_number: partner.registration_number || '',
        years_experience: partner.years_experience || 0,
        type_id: partner.type_id || '',
        website_url: partner.website_url || '',
        featured: partner.featured || false,
        active: partner.active !== undefined ? partner.active : true,
        service_areas: partner.service_areas || [],
        online_consultation: partner.online_consultation || false,
        social_media: partner.social_media || {}
      });
    }
  }, [partner]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleAddServiceArea = () => {
    if (serviceArea.trim()) {
      setFormData(prev => ({
        ...prev,
        service_areas: [...(prev.service_areas || []), serviceArea.trim()]
      }));
      setServiceArea('');
    }
  };

  const handleRemoveServiceArea = (area: string) => {
    setFormData(prev => ({
      ...prev,
      service_areas: (prev.service_areas || []).filter(a => a !== area)
    }));
  };

  const handleAddSocialMedia = () => {
    if (socialPlatform.trim() && socialUrl.trim()) {
      setFormData(prev => ({
        ...prev,
        social_media: {
          ...(prev.social_media || {}),
          [socialPlatform.trim()]: socialUrl.trim()
        }
      }));
      setSocialPlatform('');
      setSocialUrl('');
    }
  };

  const handleRemoveSocialMedia = (platform: string) => {
    const newSocialMedia = { ...(formData.social_media || {}) };
    delete newSocialMedia[platform];
    setFormData(prev => ({
      ...prev,
      social_media: newSocialMedia
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#2D2D2D] mb-1">
              Partner Name*
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#2D2D2D]/60" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
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
              Partner Type
            </label>
            <div className="relative">
              <select
                name="type_id"
                value={formData.type_id || ''}
                onChange={handleChange}
                className="w-full p-2 pl-4 rounded-lg appearance-none"
                style={{
                  background: 'linear-gradient(145deg, #ffffff, #f5f5f5)',
                  boxShadow: 'inset 2px 2px 5px #d1d1d1, inset -2px -2px 5px #ffffff'
                }}
              >
                <option value="">Select Type</option>
                {partnerTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <ChevronDown className="w-4 h-4 text-[#2D2D2D]/60" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2D2D2D] mb-1">
              Logo URL
            </label>
            <div className="relative">
              <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#2D2D2D]/60" />
              <input
                type="url"
                name="logo_url"
                value={formData.logo_url || ''}
                onChange={handleChange}
                className="w-full p-2 pl-10 rounded-lg"
                style={{
                  background: 'linear-gradient(145deg, #ffffff, #f5f5f5)',
                  boxShadow: 'inset 2px 2px 5px #d1d1d1, inset -2px -2px 5px #ffffff'
                }}
                placeholder="https://example.com/logo.png"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2D2D2D] mb-1">
              Website URL
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#2D2D2D]/60" />
              <input
                type="url"
                name="website_url"
                value={formData.website_url || ''}
                onChange={handleChange}
                className="w-full p-2 pl-10 rounded-lg"
                style={{
                  background: 'linear-gradient(145deg, #ffffff, #f5f5f5)',
                  boxShadow: 'inset 2px 2px 5px #d1d1d1, inset -2px -2px 5px #ffffff'
                }}
                placeholder="https://example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2D2D2D] mb-1">
              Contact Email*
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#2D2D2D]/60" />
              <input
                type="email"
                name="contact_email"
                value={formData.contact_email || ''}
                onChange={handleChange}
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
              Contact Phone*
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#2D2D2D]/60" />
              <input
                type="tel"
                name="contact_phone"
                value={formData.contact_phone || ''}
                onChange={handleChange}
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
              Address*
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-4 h-4 text-[#2D2D2D]/60" />
              <textarea
                name="address"
                value={formData.address || ''}
                onChange={handleChange}
                className="w-full p-2 pl-10 rounded-lg min-h-[80px]"
                style={{
                  background: 'linear-gradient(145deg, #ffffff, #f5f5f5)',
                  boxShadow: 'inset 2px 2px 5px #d1d1d1, inset -2px -2px 5px #ffffff'
                }}
                required
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#2D2D2D] mb-1">
              Description*
            </label>
            <textarea
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              className="w-full p-2 rounded-lg min-h-[120px]"
              style={{
                background: 'linear-gradient(145deg, #ffffff, #f5f5f5)',
                boxShadow: 'inset 2px 2px 5px #d1d1d1, inset -2px -2px 5px #ffffff'
              }}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2D2D2D] mb-1">
              Registration Number
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#2D2D2D]/60" />
              <input
                type="text"
                name="registration_number"
                value={formData.registration_number || ''}
                onChange={handleChange}
                className="w-full p-2 pl-10 rounded-lg"
                style={{
                  background: 'linear-gradient(145deg, #ffffff, #f5f5f5)',
                  boxShadow: 'inset 2px 2px 5px #d1d1d1, inset -2px -2px 5px #ffffff'
                }}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2D2D2D] mb-1">
              Years Experience
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#2D2D2D]/60" />
              <input
                type="number"
                name="years_experience"
                value={formData.years_experience || ''}
                onChange={handleChange}
                className="w-full p-2 pl-10 rounded-lg"
                style={{
                  background: 'linear-gradient(145deg, #ffffff, #f5f5f5)',
                  boxShadow: 'inset 2px 2px 5px #d1d1d1, inset -2px -2px 5px #ffffff'
                }}
                min="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2D2D2D] mb-1">
              Service Areas
            </label>
            <div className="flex gap-2 mb-2">
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#2D2D2D]/60" />
                <input
                  type="text"
                  value={serviceArea}
                  onChange={(e) => setServiceArea(e.target.value)}
                  className="w-full p-2 pl-10 rounded-lg"
                  style={{
                    background: 'linear-gradient(145deg, #ffffff, #f5f5f5)',
                    boxShadow: 'inset 2px 2px 5px #d1d1d1, inset -2px -2px 5px #ffffff'
                  }}
                  placeholder="Add service area"
                />
              </div>
              <button
                type="button"
                onClick={handleAddServiceArea}
                className="p-2 rounded-lg text-white"
                style={{
                  background: 'linear-gradient(145deg, #0047AB, #D4AF37)',
                  boxShadow: '4px 4px 8px #d1d1d1, -4px -4px 8px #ffffff'
                }}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {(formData.service_areas || []).map((area, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs"
                >
                  <span>{area}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveServiceArea(area)}
                    className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-blue-200"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2D2D2D] mb-1">
              Social Media
            </label>
            <div className="flex gap-2 mb-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={socialPlatform}
                  onChange={(e) => setSocialPlatform(e.target.value)}
                  className="w-full p-2 rounded-lg"
                  style={{
                    background: 'linear-gradient(145deg, #ffffff, #f5f5f5)',
                    boxShadow: 'inset 2px 2px 5px #d1d1d1, inset -2px -2px 5px #ffffff'
                  }}
                  placeholder="Platform (e.g., Facebook)"
                />
              </div>
              <div className="relative flex-1">
                <input
                  type="url"
                  value={socialUrl}
                  onChange={(e) => setSocialUrl(e.target.value)}
                  className="w-full p-2 rounded-lg"
                  style={{
                    background: 'linear-gradient(145deg, #ffffff, #f5f5f5)',
                    boxShadow: 'inset 2px 2px 5px #d1d1d1, inset -2px -2px 5px #ffffff'
                  }}
                  placeholder="URL"
                />
              </div>
              <button
                type="button"
                onClick={handleAddSocialMedia}
                className="p-2 rounded-lg text-white"
                style={{
                  background: 'linear-gradient(145deg, #0047AB, #D4AF37)',
                  boxShadow: '4px 4px 8px #d1d1d1, -4px -4px 8px #ffffff'
                }}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 mt-2">
              {Object.entries(formData.social_media || {}).map(([platform, url]) => (
                <div 
                  key={platform}
                  className="flex items-center justify-between p-2 rounded-lg bg-gray-50"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{platform}</span>
                    <a 
                      href={url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline truncate max-w-[150px]"
                    >
                      {url}
                    </a>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveSocialMedia(platform)}
                    className="p-1 rounded-full hover:bg-red-100"
                  >
                    <X className="w-3 h-3 text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="featured"
                name="featured"
                checked={formData.featured || false}
                onChange={handleCheckboxChange}
                className="w-4 h-4 rounded"
              />
              <label htmlFor="featured" className="ml-2 text-sm text-[#2D2D2D]">
                Featured Partner
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="active"
                name="active"
                checked={formData.active !== false}
                onChange={handleCheckboxChange}
                className="w-4 h-4 rounded"
              />
              <label htmlFor="active" className="ml-2 text-sm text-[#2D2D2D]">
                Active
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="online_consultation"
                name="online_consultation"
                checked={formData.online_consultation || false}
                onChange={handleCheckboxChange}
                className="w-4 h-4 rounded"
              />
              <label htmlFor="online_consultation" className="ml-2 text-sm text-[#2D2D2D]">
                Offers Online Consultation
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg"
          style={{
            background: 'linear-gradient(145deg, #ffffff, #f5f5f5)',
            boxShadow: '4px 4px 8px #d1d1d1, -4px -4px 8px #ffffff'
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded-lg text-white flex items-center gap-2"
          style={{
            background: 'linear-gradient(145deg, #0047AB, #D4AF37)',
            boxShadow: '4px 4px 8px #d1d1d1, -4px -4px 8px #ffffff',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Check className="w-4 h-4" />
          )}
          {partner ? 'Update Partner' : 'Add Partner'}
        </button>
      </div>
    </form>
  );
}