import React from 'react';
import { Loader2, MessageSquare, User, Star, Check } from 'lucide-react';

type Partner = {
  id: string;
  name: string;
};

type PartnerTestimonial = {
  id: string;
  partner_id: string;
  client_name: string;
  testimonial: string;
  rating: number;
  approved: boolean;
};

interface PartnerTestimonialFormProps {
  testimonial: PartnerTestimonial | null;
  partnerId: string | null;
  partners: Partner[];
  onSubmit: (testimonialData: Partial<PartnerTestimonial>) => void;
  onCancel: () => void;
}

export function PartnerTestimonialForm({ 
  testimonial, 
  partnerId, 
  partners, 
  onSubmit, 
  onCancel 
}: PartnerTestimonialFormProps) {
  const [formData, setFormData] = React.useState<Partial<PartnerTestimonial>>({
    partner_id: partnerId || '',
    client_name: '',
    testimonial: '',
    rating: 5,
    approved: false
  });
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (testimonial) {
      setFormData({
        partner_id: testimonial.partner_id || partnerId || '',
        client_name: testimonial.client_name || '',
        testimonial: testimonial.testimonial || '',
        rating: testimonial.rating || 5,
        approved: testimonial.approved || false
      });
    } else {
      setFormData({
        partner_id: partnerId || '',
        client_name: '',
        testimonial: '',
        rating: 5,
        approved: false
      });
    }
  }, [testimonial, partnerId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleRatingChange = (rating: number) => {
    setFormData(prev => ({ ...prev, rating }));
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
            Client Name*
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#2D2D2D]/60" />
            <input
              type="text"
              name="client_name"
              value={formData.client_name || ''}
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
            Testimonial*
          </label>
          <div className="relative">
            <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-[#2D2D2D]/60" />
            <textarea
              name="testimonial"
              value={formData.testimonial || ''}
              onChange={handleChange}
              className="w-full p-2 pl-10 rounded-lg min-h-[120px]"
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
            Rating*
          </label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleRatingChange(star)}
                className="p-1 focus:outline-none"
              >
                <Star 
                  className={`w-6 h-6 ${star <= (formData.rating || 0) ? 'text-amber-500' : 'text-gray-300'}`}
                  fill={star <= (formData.rating || 0) ? '#F59E0B' : '#D1D5DB'}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="approved"
            name="approved"
            checked={formData.approved || false}
            onChange={handleCheckboxChange}
            className="w-4 h-4 rounded"
          />
          <label htmlFor="approved" className="ml-2 text-sm text-[#2D2D2D]">
            Approved for public display
          </label>
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
          {testimonial ? 'Update Testimonial' : 'Add Testimonial'}
        </button>
      </div>
    </form>
  );
}