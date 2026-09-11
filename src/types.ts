export interface VariantDimension {
  name: string; // e.g. "Dial Size", "Pressure Range", "Connection", "Color"
  options: string[]; // e.g. ["2.5 inch", "4 inch", "6 inch"]
}

export interface ProductVariant {
  id: string;
  attributes: Record<string, string>; // { "Dial Size": "4 inch", "Pressure Range": "0–10 bar", ... }
  sku: string;
  price: number;
  salePrice?: number;
  stock: number;
  image?: string;
  enabled: boolean;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  category: string;
  categoryId: string;
  brand: string;
  sku: string;
  description: string;
  images: string[];
  price: number;
  salePrice?: number;
  stock: number;
  unit?: string;
  specifications: Record<string, string>;
  tags: string[];
  featured: boolean;
  published: boolean;
  variantDimensions?: VariantDimension[];
  variants?: ProductVariant[];
  isSample?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  imageUrl?: string;
  displayOrder: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  buttonText?: string;
  destination?: string;
  image?: string;
  imageUrl?: string;
  ctaText?: string;
  targetUrl?: string;
  active: boolean;
  displayOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  id: string; // generated unique key for product + specific variant attributes
  productId: string;
  productTitle: string;
  productSlug: string;
  productImage: string;
  sku: string;
  selectedVariant?: {
    id?: string;
    attributes: Record<string, string>;
  };
  unitPrice: number; // Effective selling price (Discount Price when discount exists)
  regularPrice?: number; // Original/Regular price before discount
  discountPrice?: number; // Discount price if applicable
  hasDiscount?: boolean;
  quantity: number;
  subtotal: number;
  maxStock: number;
}

export interface CustomerUser {
  uid: string;
  name: string;
  email: string;
  role?: 'customer';
  phone: string;
  address: string;
  city: string;
  createdAt: string;
  lastLoginAt?: string;
  accountStatus: 'active' | 'suspended';
  purchaseStatus: 'no_purchase' | 'purchased';
  orderCount: number;
  totalSpend: number;
  firstOrderAt?: string | null;
  lastOrderAt?: string | null;
  notes?: string;
}

export interface CustomerInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  companyName?: string;
  notes?: string;
  userId?: string;
  customerUid?: string;
  customerType?: 'registered' | 'guest';
}

export type OrderStatus =
  | 'New'
  | 'Confirmed'
  | 'Processing'
  | 'Shipped'
  | 'Completed'
  | 'Cancelled'
  | 'payment_pending'
  | 'payment_issue'
  | 'processing';

export type PaymentMethod = 'cod' | 'bank_transfer';
export type PaymentStatus = 'unpaid' | 'payment_pending' | 'pending_verification' | 'verified' | 'rejected';

export interface PaymentAccount {
  id: string;
  bankName: string; // e.g. "Meezan Bank", "Bank Alfalah", "HBL"
  accountTitle: string; // e.g. "Gauge House"
  accountNumber: string; // e.g. "02010105829102"
  iban: string; // e.g. "PK12MEZN0002010105829102"
  branchName?: string; // e.g. "Main Boulevard Branch, Lahore"
  branchCode?: string; // e.g. "0201"
  instructions?: string; // Custom instructions for customer
  active: boolean; // Shown in checkout/confirmation if active
  isDefault: boolean; // Pre-selected default account
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. GH-2026-000123
  orderId?: string; // alias for id
  customer: CustomerInfo;
  customerUid?: string | null;
  customerEmail?: string;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  customerCity?: string;
  customerType?: 'registered' | 'guest';
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  totalAmount?: number; // alias for total
  status: OrderStatus | string;
  orderStatus?: OrderStatus;
  // Payment Details & TID Verification
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  transactionId?: string; // Customer submitted TID / Ref No
  paidAmount?: number;
  paymentProofUrl?: string; // Screenshot or receipt image URL
  paymentSubmittedAt?: string;
  paymentNotes?: string;
  selectedBankAccountId?: string;
  selectedBankName?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  rejectionReason?: string;
  rejectedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUser {
  uid: string;
  email: string;
  displayName?: string;
  role: 'admin' | 'superadmin';
  active: boolean;
  createdAt: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  businessType: string;
  address: string;
  phones: string[];
  emails: string[];
  currency: string;
  currencySymbol: string;
  shippingFlatRate: number;
  freeShippingThreshold: number;
  whatsappNumber: string;
  updatedAt?: string;
}
