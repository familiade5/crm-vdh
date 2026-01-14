export type LeadStatus = 'novo' | 'contato' | 'qualificado' | 'visita' | 'proposta' | 'fechado' | 'perdido';

export type LeadTemperature = 'frio' | 'morno' | 'quente';

export type LeadSource = 'facebook' | 'instagram' | 'google' | 'olx' | 'site' | 'whatsapp' | 'indicacao' | 'outro';

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: LeadStatus;
  temperature: LeadTemperature;
  source: LeadSource;
  interest: string;
  budget: string;
  notes: string;
  createdAt: Date;
  lastContact: Date;
  assignedTo?: string;
  propertyInterest?: string[];
  score: number;
  aiQualified: boolean;
  aiActive: boolean;
  requestedHuman: boolean;
}

export interface Property {
  id: string;
  title: string;
  type: 'apartamento' | 'casa' | 'terreno' | 'comercial' | 'rural';
  status: 'disponivel' | 'reservado' | 'vendido' | 'alugado';
  price: number;
  area: number;
  bedrooms: number;
  bathrooms: number;
  parkingSpaces: number;
  address: string;
  neighborhood: string;
  city: string;
  description: string;
  images: string[];
  features: string[];
  createdAt: Date;
}

export interface ChatMessage {
  id: string;
  leadId: string;
  content: string;
  sender: 'lead' | 'ai' | 'agent';
  timestamp: Date;
  isAI: boolean;
  isTransferRequest?: boolean;
}

export interface Portal {
  id: string;
  name: string;
  slug: LeadSource | 'analytics';
  icon: string;
  description: string;
  apiKey?: string;
  webhookUrl?: string;
  isActive: boolean;
  leadsCount: number;
  lastSync?: Date;
  category: 'social' | 'portal' | 'analytics' | 'messaging';
}

export interface WhatsAppConnection {
  isConnected: boolean;
  phoneNumber?: string;
  qrCode?: string;
  status: 'disconnected' | 'scanning' | 'connected';
  lastActivity?: Date;
}

export interface DashboardStats {
  totalLeads: number;
  newLeadsToday: number;
  qualifiedLeads: number;
  conversionRate: number;
  activeChats: number;
  scheduledVisits: number;
  hotLeads: number;
  warmLeads: number;
  coldLeads: number;
  aiHandledChats: number;
  humanTransfers: number;
}

export interface SourceMetrics {
  source: LeadSource;
  leads: number;
  conversions: number;
  conversionRate: number;
  avgResponseTime: number;
}
