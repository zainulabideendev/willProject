import React from 'react';
import { Loader2, UserCircle, BadgeCheck, User, FileText, Phone, Heart } from 'lucide-react';

interface ManualFormData {
  title: string;
  first_names: string;
  last_name: string;
  id_number: string;
  relationship: string;
  phone: string;
}

interface ManualBeneficiaryFormProps {
  formData: ManualFormData;
  onChange: (updates: Partial<ManualFormData>) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading?: boolean;
}

export function ManualBeneficiaryForm({
  formData,
  onChange,
  onSubmit,
  loading
}: ManualBeneficiaryFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="input-group">
        <label className="block text-sm font-medium text-[#2D2D2D] mb-1">
          Title
        </label>
        <div className="relative">
          <UserCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#2D2D2D]/60" />
          <select
            value={formData.title}
            onChange={(e) => onChange({ title: e.target.value })}
            className="input-field pl-10"
            required
          >
            <option value="">Select a title</option>
            <option value="Mr">Mr</option>
            <option value="Mrs">Mrs</option>
            <option value="Ms">Ms</option>
            <option value="Dr">Dr</option>
          </select>
        </div>
      </div>

      <div className="input-group">
        <label className="block text-sm font-medium text-[#2D2D2D] mb-1">
          First Names
        </label>
        <div className="relative">
          <BadgeCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#2D2D2D]/60" />
          <input
            type="text"
            value={formData.first_names}
            onChange={(e) => onChange({ first_names: e.target.value })}
            className="input-field pl-10"
            placeholder="Enter first names"
            required
          />
        </div>
      </div>

      <div className="input-group">
        <label className="block text-sm font-medium text-[#2D2D2D] mb-1">
          Last Name
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#2D2D2D]/60" />
          <input
            type="text"
            value={formData.last_name}
            onChange={(e) => onChange({ last_name: e.target.value })}
            className="input-field pl-10"
            placeholder="Enter last name"
            required
          />
        </div>
      </div>

      <div className="input-group">
        <label className="block text-sm font-medium text-[#2D2D2D] mb-1">
          ID Number
        </label>
        <div className="relative">
          <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#2D2D2D]/60" />
          <input
            type="text"
            value={formData.id_number}
            onChange={(e) => onChange({ id_number: e.target.value })}
            className="input-field pl-10"
            placeholder="Enter ID number"
            required
          />
        </div>
      </div>

      <div className="input-group">
        <label className="block text-sm font-medium text-[#2D2D2D] mb-1">
          Relationship
        </label>
        <div className="relative">
          <Heart className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#2D2D2D]/60" />
          <input
            type="text"
            value={formData.relationship}
            onChange={(e) => onChange({ relationship: e.target.value })}
            className="input-field pl-10"
            placeholder="Enter relationship"
            required
          />
        </div>
      </div>

      <div className="input-group">
        <label className="block text-sm font-medium text-[#2D2D2D] mb-1">
          Cell Number
        </label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#2D2D2D]/60" />
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => onChange({ phone: e.target.value })}
            className="input-field pl-10"
            placeholder="Enter cell number"
            required
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="add-beneficiary-button"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin mx-auto" />
        ) : (
          'Add Beneficiary'
        )}
      </button>
    </form>
  );
}