import React from 'react';

export interface FamilyMember {
  id: string;
  profile_id?: string;
  type: 'spouse' | 'child';
  title: string;
  first_names: string;
  last_name: string;
  id_number: string;
  phone: string;
}

export interface Profile {
  id: string;
  full_name?: string;
  date_of_birth?: string;
  address?: string;
  marital_status?: string;
  marriage_property_regime?: string;
  email?: string;
  phone?: string;
  id_number?: string;
  title?: string;
  spouse_title?: string;
  spouse_first_name?: string;
  spouse_last_name?: string;
  spouse_email?: string;
  spouse_phone?: string;
  spouse_id_number?: string;
  spouse_address?: string;
  profile_setup_complete?: boolean;
  assets_added?: boolean;
  beneficiaries_chosen?: boolean;
  last_wishes_documented?: boolean;
  executor_chosen?: boolean;
  will_reviewed?: boolean;
  welcome_modal_shown?: boolean;
  has_children?: boolean;
  spouse_uuid?: string;
  partner_uuid?: string;
  beneficiary_count?: number;
  assets_fully_allocated?: boolean;
  residue_fully_allocated?: boolean;
  has_beneficiaries?: boolean;
  partner_firm_id?: string;
  role?: any;
  guardian_title?: string;
  guardian_first_names?: string;
  guardian_last_name?: string;
  guardian_id_number?: string;
  guardian_phone?: string;
  guardian_relationship?: string;
  guardian_address?: string;
  burial_type?: string;
  memorial_type?: string;
  memorial_message?: string;
  last_message?: string;
  will_downloaded?: boolean;
}

export interface EstateScore {
  id: string;
  profile_id: string;
  total_score: number;
  last_updated: string;
}

export interface Child {
  id: string;
  profile_id: string;
  title?: string;
  first_names: string;
  last_name: string;
  date_of_birth?: string;
  email?: string;
  phone?: string;
  id_number?: string;
  order?: number;
  address?: string;
}

export interface Asset {
  id: string;
  name: string;
  asset_type: string;
  estimated_value: number;
  details: Record<string, any>;
  is_fully_paid?: boolean;
  debt_handling_method?: string;
}