export type PmeNetworkAction = 'saved' | 'interested' | 'skipped';

export interface PmeCompany {
  id: number;
  name: string;
  logo_url?: string | null;
  city?: string | null;
  sector?: string | null;
  category?: string | null;
  description?: string | null;
  ice?: string | null;
  verified: boolean;
  recently_active: boolean;
  types: {
    supplier: boolean;
    client: boolean;
  };
  contact: {
    allowed: boolean;
    whatsapp?: string | null;
    email?: string | null;
  };
  viewer_action?: PmeNetworkAction | null;
}

export interface PmeNetworkSettings {
  directory_visible: boolean;
  directory_contact_allowed: boolean;
  directory_whatsapp_allowed: boolean;
  directory_email_allowed: boolean;
  directory_sector?: string | null;
  directory_category?: string | null;
  directory_city?: string | null;
  directory_description?: string | null;
  directory_is_supplier: boolean;
  directory_is_client: boolean;
}

export interface PmeNetworkFilters {
  sectors: string[];
  cities: string[];
  categories: string[];
}

export interface PmeNetworkListData {
  companies: PmeCompany[];
  filters: PmeNetworkFilters;
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    has_more: boolean;
  };
}
