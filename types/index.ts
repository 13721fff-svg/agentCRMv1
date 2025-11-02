export type UserRole = 'citizen' | 'individual' | 'small' | 'medium' | 'admin';

export type OrgRole = 'owner' | 'admin' | 'manager' | 'staff' | 'viewer';

export type OrderStatus = 'draft' | 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

export type RequestStatus = 'open' | 'quoted' | 'accepted' | 'rejected' | 'expired';

export type CampaignStatus = 'draft' | 'scheduled' | 'active' | 'paused' | 'completed' | 'cancelled';

export interface User {
  id: string;
  email: string;
  phone?: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  rating?: number;
  org_id?: string;
  org_role?: OrgRole;
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
  business_type: UserRole;
  owner_id: string;
  rating?: number;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  org_id: string;
  full_name: string;
  email?: string;
  phone?: string;
  company?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
  tags?: string[];
  rating?: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  org_id: string;
  client_id?: string;
  title: string;
  description?: string;
  status: OrderStatus;
  amount?: number;
  currency?: string;
  assigned_to?: string;
  due_date?: string;
  completed_at?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Request {
  id: string;
  user_id: string;
  category_id: string;
  title: string;
  description: string;
  budget_min?: number;
  budget_max?: number;
  location?: string;
  status: RequestStatus;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Quote {
  id: string;
  request_id: string;
  provider_id: string;
  amount: number;
  currency: string;
  description: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface Campaign {
  id: string;
  org_id: string;
  title: string;
  description?: string;
  type: 'push' | 'email' | 'sms' | 'banner';
  status: CampaignStatus;
  target_audience?: Record<string, any>;
  start_date?: string;
  end_date?: string;
  metrics?: Record<string, any>;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  org_id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to?: string;
  due_date?: string;
  completed_at?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export type MeetingStatus = 'scheduled' | 'completed' | 'cancelled';
export type RecurrenceFrequency = 'none' | 'daily' | 'weekly' | 'monthly';

export interface Meeting {
  id: string;
  org_id: string;
  title: string;
  description?: string;
  client_id?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  start_time: string;
  end_time: string;
  participants: string[];
  status: MeetingStatus;
  recurrence_frequency?: RecurrenceFrequency;
  recurrence_end_date?: string;
  parent_meeting_id?: string;
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface KPI {
  id: string;
  org_id: string;
  name: string;
  description?: string;
  metric_type: 'count' | 'amount' | 'percentage';
  target_value: number;
  current_value: number;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  assigned_to?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  name_uk: string;
  icon?: string;
  parent_id?: string;
  created_at: string;
}

export interface Review {
  id: string;
  order_id?: string;
  from_user_id: string;
  to_user_id: string;
  rating: number;
  comment?: string;
  created_at: string;
}
