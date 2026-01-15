export type RegistrationStatus = 'pending' | 'in_progress' | 'completed';
export type PaymentStatus = 'pending' | 'due' | 'paid';

export interface Broker {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  cpf: string | null;
  creci: string | null;
  commission_rate: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PropertySale {
  id: string;
  user_id: string;
  broker_id: string;
  property_title: string;
  property_address: string | null;
  sale_price: number;
  sale_date: string;
  buyer_name: string | null;
  buyer_cpf: string | null;
  notes: string | null;
  registration_status: RegistrationStatus;
  registration_completed_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  broker?: Broker;
}

export interface BrokerCommission {
  id: string;
  user_id: string;
  broker_id: string;
  sale_id: string;
  commission_rate: number;
  commission_amount: number;
  payment_status: PaymentStatus;
  due_date: string | null;
  paid_at: string | null;
  payment_method: string | null;
  payment_reference: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  broker?: Broker;
  sale?: PropertySale;
}

export interface CommissionSummary {
  totalPending: number;
  totalDue: number;
  totalPaid: number;
  countPending: number;
  countDue: number;
  countPaid: number;
}

export interface BrokerSummary {
  broker: Broker;
  totalSales: number;
  totalCommissions: number;
  pendingCommissions: number;
  dueCommissions: number;
  paidCommissions: number;
}
