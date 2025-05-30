import React from 'react';
import { Loader2, Package, DollarSign, Check, Star, ToggleLeft, ToggleRight } from 'lucide-react';

type Partner = {
  id: string;
  name: string;
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
};

interface PartnerOfferingFormProps {
  offering: PartnerOffering | null;
  partnerId: string | null;
  partners: Partner[];
  onSubmit: (offeringData: Partial<PartnerOffering>) => void;
  onCancel: () => void;
}

export function PartnerOfferingForm({ 
  offering, 
  partnerId, 
  partners, 
  onSubmit, 
  onCancel 
}: PartnerOfferingFormProps) {
  const [formData, setFormData] = React.useState<Partial<PartnerOffering>>({
    partner_id: partnerId || '',
    name: '',
    description: '',
    price_range: '',
    is_featured: false,
    active: true,
    details: {}
  });
  const [loading, setLoading] = React.useState(false);
  const [detailKey, setDetailKey] = React.useState('');
  const [detailValue, setDetailValue] = React.useState('');

  React.useEffect(() => {
    if (offering) {
      setFormData({
        partner_id: offering.partner_id || partnerId || '',
        name: offering.name || '',
        description: offering.description || '',
        price_range: offering.price_range || '',
        is_featured: offering.is_featured || false,
        active: offering.active !== undefined ? offering.active : true,
        details: offering.details || {}
      });
    } else {
      setFormData({
        partner_id: partnerId || '',
        name: '',
        description: '',
        price_range: '',
        is_featured: false,
        active: true,
        details: {}
      });
    }
  }, [offering, partnerId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleAddDetail = () => {
    if (detailKey.trim() && detailValue.trim()) {
      setFormData(prev => ({
        ...prev,
        details: {
          ...(prev.details || {}),
          [detailKey.trim()]: detailValue.trim()
        }
      }));
      setDetailKey('');
      setDetailValue('');
    }
  };

  const handleRemoveDetail = (key: string) => {
    const newDetails = { ...(formData.details || {}) };
    delete newDetails[key];
    setFormData(prev => ({
      ...prev,
      details: newDetails
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
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#2D2D2D] mb-1">
            Partner*
          </label>
          <select
            name="partner_id"
            value={formData.partner_id || ''}
            onChange={handleChange}
            className="w-full p-2 rounded-lg appearance-none"
            style={{
              background: 'linear-gradient(145deg, #ffffff, #f5f5f5)',
              boxShadow: 'inset 2px 2px 5px #d1d1d1, inset -2px -2px 5px #ffffff'
            }}
            required
            disabled={!!partnerId}
          >
            <option value="">Select Partner</option>
            {partners.map(partner => (
              <option key={partner.id} value={partner.id}>{partner.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#2D2D2D] mb-1">
            Offering Name*
          </label>
          <div className="relative">
            <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#2D2D2D]/60" />
            <input
              type="text"
              name="name"
              value={formData.name || ''}
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
            Description*
          </label>
          <textarea
            name="description"
            value={formData.description || ''}
            onChange={handleChange}
            className="w-full p-2 rounded-lg min-h-[100px]"
            style={{
              background: 'linear-gradient(145deg, #ffffff, #f5f5f5)',
              boxShadow: 'inset 2px 2px 5px #d1d1d1, inset -2px -2px 5px #ffffff'
            }}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#2D2D2D] mb-1">
            Price Range
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#2D2D2D]/60" />
            <input
              type="text"
              name="price_range"
              value={formData.price_range || ''}
              onChange={handleChange}
              className="w-full p-2 pl-10 rounded-lg"
              style={{
                background: 'linear-gradient(145deg, #ffffff, #f5f5f5)',
                boxShadow: 'inset 2px 2px 5px #d1d1d1, inset -2px -2px 5px #ffffff'
              }}
              placeholder="e.g., R1,000 - R5,000"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#2D2D2D] mb-1">
            Additional Details
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={detailKey}
              onChange={(e) => setDetailKey(e.target.value)}
              className="flex-1 p-2 rounded-lg"
              style={{
                background: 'linear-gradient(145deg, #ffffff, #f5f5f5)',
                boxShadow: 'inset 2px 2px 5px #d1d1d1, inset -2px -2px 5px #ffffff'
              }}
              placeholder="Key (e.g., Duration)"
            />
            <input
              type="text"
              value={detailValue}
              onChange={(e) => setDetailValue(e.target.value)}
              className="flex-1 p-2 rounded-lg"
              style={{
                background: 'linear-gradient(145deg, #ffffff, #f5f5f5)',
                boxShadow: 'inset 2px 2px 5px #d1d1d1, inset -2px -2px 5px #ffffff'
              }}
              placeholder="Value (e.g., 2 hours)"
            />
            <button
              type="button"
              onClick={handleAddDetail}
              className="p-2 rounded-lg text-white"
              style={{
                background: 'linear-gradient(145deg, #0047AB, #D4AF37)',
                boxShadow: '4px 4px 8px #d1d1d1, -4px -4px 8px #ffffff'
              }}
            >
              <Check className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-2 mt-2">
            {Object.entries(formData.details || {}).map(([key, value]) => (
              <div 
                key={key}
                className="flex items-center justify-between p-2 rounded-lg bg-gray-50"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{key}:</span>
                  <span className="text-sm">{value}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveDetail(key)}
                  className="p-1 rounded-full hover:bg-red-100"
                >
                  <ToggleRight className="w-4 h-4 text-red-500" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_featured"
              name="is_featured"
              checked={formData.is_featured || false}
              onChange={handleCheckboxChange}
              className="w-4 h-4 rounded"
            />
            <label htmlFor="is_featured" className="ml-2 text-sm text-[#2D2D2D] flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-500" />
              Featured Offering
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
            <label htmlFor="active" className="ml-2 text-sm text-[#2D2D2D] flex items-center gap-1">
              {formData.active !== false ? (
                <ToggleRight className="w-3.5 h-3.5 text-green-500" />
              ) : (
                <ToggleLeft className="w-3.5 h-3.5 text-[#2D2D2D]/60" />
              )}
              Active
            </label>
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
          disabled={loading || !formData.partner_id}
          className="px-4 py-2 rounded-lg text-white flex items-center gap-2"
          style={{
            background: 'linear-gradient(145deg, #0047AB, #D4AF37)',
            boxShadow: '4px 4px 8px #d1d1d1, -4px -4px 8px #ffffff',
            opacity: (loading || !formData.partner_id) ? 0.7 : 1
          }}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Check className="w-4 h-4" />
          )}
          {offering ? 'Update Offering' : 'Add Offering'}
        </button>
      </div>
    </form>
  );
}