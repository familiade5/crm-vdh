export interface Property {
  id: string;
  user_id: string;
  title: string;
  description?: string | null;
  property_type: string;
  status: string;
  price: number;
  address?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;
  zip_code?: string | null;
  bedrooms: number;
  bathrooms: number;
  parking_spaces: number;
  area: number;
  features?: string[] | null;
  images?: string[] | null;
  broker_id?: string | null;
  sold_at?: string | null;
  created_at: string;
  updated_at: string;
  broker?: {
    id: string;
    name: string;
    phone?: string | null;
    email?: string | null;
  } | null;
}

export interface PropertyInterestedLead {
  id: string;
  property_id: string;
  lead_id: string;
  interest_level: string;
  notes?: string | null;
  created_at: string;
  lead?: {
    id: string;
    name: string;
    phone?: string | null;
    email?: string | null;
    temperature?: string | null;
  } | null;
}

export type PropertyStatus = 'disponivel' | 'reservado' | 'vendido' | 'alugado';
export type PropertyType = 'apartamento' | 'casa' | 'terreno' | 'comercial' | 'cobertura' | 'sitio';
export type InterestLevel = 'baixo' | 'medio' | 'alto';
