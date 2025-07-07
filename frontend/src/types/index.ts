export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  stock_quantity: number;
  slug: string;
  images: ProductImage[];
  primary_image?: string;
  length: string;
  width: string;
  height: string;
  weight: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: number;
  image: string;
  alt_text: string;
  is_primary: boolean;
  order: number;
}

export interface CartItem {
  id: number;
  product: Product;
  quantity: number;
  total_price: string;
}

export interface Cart {
  id: number;
  items: CartItem[];
  total_items: number;
  total_price: string;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: number;
  user: User;
  phone: string;
  date_of_birth: string | null;
  website: string;
  preferred_currency: string;
  preferred_language: string;
  timezone: string;
  is_verified: boolean;
  avatar_url: string | null;
  total_orders: number;
  total_spent: number;
  member_since: string;
  created_at: string;
  updated_at: string;
}

export interface ShippingAddress {
  id: number;
  customer: number;
  full_name: string;
  address_line_1: string;
  address_line_2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: number;
  order_id: string;
  order_date: string;
  status: string;
  total_price: string;
  shipping_cost: string;
  shipping_method: string;
  tracking_number: string;
  items: OrderItem[];
  shipping_address: ShippingAddress;
  is_archived: boolean;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: number;
  product: Product;
  quantity: number;
  price: string;
  total_price: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface ShippingRate {
  id: string;
  carrier: string;
  service: string;
  amount: string;
  currency: string;
  estimated_days: number;
  duration_terms: string;
}

export interface UserActivity {
  id: number;
  user: number;
  activity_type: string;
  description: string;
  timestamp: string;
  ip_address: string;
  user_agent: string;
}

export interface DashboardStats {
  total_orders: number;
  total_revenue: string;
  recent_orders: Order[];
  orders_by_status: { [key: string]: number };
  monthly_revenue: Array<{
    month: string;
    revenue: string;
  }>;
}

export interface BulkOperationRequest {
  operation: 'archive' | 'unarchive';
  order_ids: number[];
}

export interface BulkOperationResponse {
  success: boolean;
  message: string;
  processed_count: number;
  failed_count: number;
  failed_orders: number[];
}

export interface USState {
  code: string;
  name: string;
}

export interface NotificationPreferences {
  email_notifications: boolean;
  order_updates: boolean;
  promotional_emails: boolean;
  shipping_updates: boolean;
}

export interface ProfileUpdateData {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
}