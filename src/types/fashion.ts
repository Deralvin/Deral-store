export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  cover_image_url?: string;
  description?: string;
  website_url?: string;
  is_active: boolean;
  products_count?: number;
  created_at: string;
}

export interface Category {
  id: string;
  parent_id?: string | null;
  parent_name?: string | null;
  name: string;
  slug: string;
  description?: string;
  sort_order: number;
  is_active: boolean;
  products_count?: number;
  created_at?: string;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description?: string;
  banner_url?: string;
  start_date?: string;
  end_date?: string;
  is_featured: boolean;
  is_active: boolean;
  products_count?: number;
  created_at: string;
}

export interface Discount {
  id: string;
  code: string;
  description?: string;
  discount_type: 'percentage' | 'fixed_amount' | 'free_shipping';
  value: number;
  min_order_amount?: number;
  max_discount_amount?: number;
  usage_limit?: number;
  usage_count: number;
  valid_from: string;
  valid_until?: string;
  is_active: boolean;
  created_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  sku: string;
  barcode?: string;
  title: string;
  price: number;
  compare_at_price?: number | null;
  cost_price?: number | null;
  weight_grams?: number;
  is_active: boolean;
  total_stock?: number;
}

export interface Product {
  id: string;
  brand_id?: string;
  brand_name?: string;
  primary_category_id: string;
  category_name?: string;
  name: string;
  slug: string;
  short_description?: string;
  description?: string;
  gender: 'men' | 'women' | 'unisex' | 'kids';
  season?: string;
  material_composition?: string;
  care_instructions?: string;
  fit_type?: string;
  base_price: number;
  is_published: boolean;
  is_featured: boolean;
  tags?: string[];
  total_stock: number;
  variants_count: number;
  image_url?: string;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  variant_id?: string;
  product_name: string;
  variant_title: string;
  sku: string;
  unit_price: number;
  quantity: number;
  total_amount: number;
  thumbnail_url?: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id?: string;
  customer_name?: string;
  customer_email?: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  payment_status: 'unpaid' | 'pending' | 'paid' | 'failed' | 'refunded';
  fulfillment_status: 'unfulfilled' | 'partially_fulfilled' | 'fulfilled' | 'returned';
  currency: string;
  subtotal_amount: number;
  discount_amount: number;
  shipping_fee: number;
  tax_amount: number;
  total_amount: number;
  discount_code?: string;
  shipping_address?: any;
  items_summary?: string;
  items_count?: number;
  created_at: string;
}

export interface Customer {
  id: string;
  email: string;
  first_name: string;
  last_name?: string;
  phone?: string;
  loyalty_tier: string;
  total_spent: number;
  orders_count: number;
  created_at: string;
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  conversionRate: number;
  revenueTrendPct: number;
  ordersTrendPct: number;
  weeklyTrend: { day: string; revenue: number }[];
  topCategories: { name: string; percentage: number; amount: number; color: string }[];
  recentOrders: Order[];
}
