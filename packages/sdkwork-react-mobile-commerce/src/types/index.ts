import type { Result } from '@sdkwork/react-mobile-core';

// ============================================
// Product Types
// ============================================

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  thumbnail: string;
  category: ProductCategory;
  tags: string[];
  rating: number;
  reviewCount: number;
  salesCount: number;
  stock: number;
  sku: string;
  specifications: Record<string, string>;
  variants?: ProductVariant[];
  shopId: string;
  shopName: string;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  icon?: string;
  parentId?: string;
  children?: ProductCategory[];
}

export interface ProductVariant {
  id: string;
  name: string;
  options: VariantOption[];
}

export interface VariantOption {
  id: string;
  value: string;
  priceAdjustment?: number;
  stock: number;
}

export interface ProductReview {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  content: string;
  images?: string[];
  helpfulCount: number;
  isVerifiedPurchase: boolean;
  createdAt: string;
}

// ============================================
// Cart Types
// ============================================

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  selectedVariants?: Record<string, string>;
  shopId: string;
  shopName: string;
  isSelected: boolean;
  addedAt: string;
}

export interface Cart {
  items: CartItem[];
  totalCount: number;
  selectedCount: number;
  totalAmount: number;
  selectedAmount: number;
  shopGroups: CartShopGroup[];
}

export interface CartShopGroup {
  shopId: string;
  shopName: string;
  items: CartItem[];
  isSelected: boolean;
  subtotal: number;
}

// ============================================
// Order Types
// ============================================

export type OrderStatus = 
  | 'pending_payment'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'completed'
  | 'cancelled'
  | 'refunding'
  | 'refunded';

export type PaymentMethod = 
  | 'wechat_pay'
  | 'alipay'
  | 'credit_card'
  | 'balance'
  | 'cod';

export interface Order {
  id: string;
  orderNo: string;
  userId: string;
  status: OrderStatus;
  items: OrderItem[];
  totalAmount: number;
  discountAmount: number;
  shippingAmount: number;
  finalAmount: number;
  paymentMethod: PaymentMethod;
  paymentTime?: string;
  shippingAddress: ShippingAddress;
  trackingNo?: string;
  logisticsCompany?: string;
  remark?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  selectedVariants?: Record<string, string>;
  subtotal: number;
}

export interface ShippingAddress {
  id: string;
  name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  detail: string;
  isDefault: boolean;
}

export interface OrderQueryParams {
  status?: OrderStatus;
  startDate?: string;
  endDate?: string;
  keyword?: string;
  page?: number;
  pageSize?: number;
}

// ============================================
// Distribution Types
// ============================================

export interface Distributor {
  id: string;
  userId: string;
  level: DistributorLevel;
  parentId?: string;
  commissionRate: number;
  totalCommission: number;
  availableCommission: number;
  withdrawnCommission: number;
  referralCode: string;
  referralCount: number;
  teamSize: number;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
}

export type DistributorLevel = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

export interface CommissionRecord {
  id: string;
  distributorId: string;
  orderId: string;
  orderNo: string;
  productName: string;
  amount: number;
  commissionRate: number;
  commissionAmount: number;
  level: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  fromUserId: string;
  fromUserName: string;
  createdAt: string;
  confirmedAt?: string;
}

export interface WithdrawalRecord {
  id: string;
  distributorId: string;
  amount: number;
  fee: number;
  actualAmount: number;
  method: 'wechat' | 'alipay' | 'bank';
  accountInfo: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  remark?: string;
  createdAt: string;
  processedAt?: string;
}

// ============================================
// Gig/Service Types
// ============================================

export interface Gig {
  id: string;
  title: string;
  description: string;
  category: GigCategory;
  subCategory: string;
  images: string[];
  price: number;
  priceUnit: 'fixed' | 'hour' | 'day' | 'project';
  deliveryDays: number;
  revisions: number;
  packages?: GigPackage[];
  tags: string[];
  requirements?: string[];
  faqs?: GigFAQ[];
  providerId: string;
  providerName: string;
  providerAvatar?: string;
  providerRating: number;
  providerCompletedOrders: number;
  rating: number;
  reviewCount: number;
  salesCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GigCategory {
  id: string;
  name: string;
  icon?: string;
  description?: string;
}

export interface GigPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  deliveryDays: number;
  revisions: number;
  features: string[];
  isPopular?: boolean;
}

export interface GigFAQ {
  question: string;
  answer: string;
}

export interface GigOrder {
  id: string;
  orderNo: string;
  gigId: string;
  gigTitle: string;
  packageId?: string;
  packageName?: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  price: number;
  quantity: number;
  totalAmount: number;
  requirements?: string;
  attachments?: string[];
  status: GigOrderStatus;
  deliveryDueDate?: string;
  deliveredAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancelReason?: string;
  revisionCount: number;
  maxRevisions: number;
  createdAt: string;
  updatedAt: string;
}

export type GigOrderStatus = 
  | 'pending'
  | 'in_progress'
  | 'delivered'
  | 'revision_requested'
  | 'completed'
  | 'cancelled'
  | 'disputed';

// ============================================
// Shop Types
// ============================================

export interface Shop {
  id: string;
  name: string;
  logo?: string;
  banner?: string;
  description?: string;
  ownerId: string;
  rating: number;
  followerCount: number;
  productCount: number;
  salesCount: number;
  isFollowed: boolean;
  createdAt: string;
}

// ============================================
// Coupon Types
// ============================================

export interface Coupon {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: 'percentage' | 'fixed_amount';
  value: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  applicableCategories?: string[];
  applicableProducts?: string[];
  startDate: string;
  endDate: string;
  totalQuantity: number;
  usedQuantity: number;
  userLimit: number;
  isCollected: boolean;
  collectedAt?: string;
}

// ============================================
// Service Contracts
// ============================================

export type ServiceResult<T> = Result<T>;

export interface ProductQueryParams {
  categoryId?: string;
  keyword?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price' | 'sales' | 'rating' | 'newest';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface IProductService {
  initialize(): Promise<void>;
  getProducts(params?: ProductQueryParams): Promise<{ products: Product[]; total: number }>;
  getProductById(id: string): Promise<Product | null>;
  getCategories(): Promise<ProductCategory[]>;
  toggleFavorite(productId: string): Promise<boolean>;
  getFavorites(): Promise<Product[]>;
  getReviews(productId: string): Promise<ProductReview[]>;
  addReview(review: Omit<ProductReview, 'id' | 'createdAt'>): Promise<ProductReview>;
}

export interface ICartService {
  getCart(): Promise<Cart>;
  addToCart(item: Omit<CartItem, 'id' | 'addedAt'>): Promise<Cart>;
  updateQuantity(itemId: string, quantity: number): Promise<Cart>;
  removeItem(itemId: string): Promise<Cart>;
  selectItem(itemId: string, isSelected: boolean): Promise<Cart>;
  selectShop(shopId: string, isSelected: boolean): Promise<Cart>;
  selectAll(isSelected: boolean): Promise<Cart>;
  clearCart(): Promise<void>;
  clearSelected(): Promise<Cart>;
  getSelectedItems(): Promise<CartItem[]>;
  onCartUpdated(handler: (cart: Cart) => void): () => void;
}

export interface CreateOrderParams {
  items: Omit<OrderItem, 'id' | 'subtotal'>[];
  shippingAddress: Order['shippingAddress'];
  paymentMethod: PaymentMethod;
  remark?: string;
  discountAmount?: number;
  shippingAmount?: number;
}

export interface IOrderService {
  createOrder(params: CreateOrderParams): Promise<Order>;
  getOrders(params?: OrderQueryParams): Promise<{ orders: Order[]; total: number }>;
  getOrderById(orderId: string): Promise<Order | null>;
  getOrderByNo(orderNo: string): Promise<Order | null>;
  payOrder(orderId: string): Promise<Order>;
  cancelOrder(orderId: string, reason?: string): Promise<Order>;
  confirmDelivery(orderId: string): Promise<Order>;
  requestRefund(orderId: string, reason: string): Promise<Order>;
  getOrderCountByStatus(): Promise<Record<OrderStatus, number>>;
  onOrderCreated(handler: (order: Order) => void): () => void;
  onOrderPaid(handler: (order: Order) => void): () => void;
  onOrderCancelled(handler: (payload: { order: Order; reason?: string }) => void): () => void;
}

export type GigFilter = 'all' | 'creative' | 'delivery' | 'ride' | 'clean';
export type GigTaskType = 'delivery' | 'ride' | 'clean' | 'design' | 'video_edit';
export type GigTaskStatus = 'available' | 'taken' | 'submitted' | 'completed';

export interface GigTaskOrder {
  id: string;
  type: GigTaskType;
  title: string;
  subTitle: string;
  price: number;
  distance: number;
  location: string;
  destination?: string;
  status: GigTaskStatus;
  urgency: 'normal' | 'high';
  tags: string[];
  requirements?: string;
  deliverableUrl?: string;
  deliverableType?: 'image' | 'video';
  createdAt: string;
  updatedAt: string;
}

export interface IGigService {
  getAvailableOrders(filter?: GigFilter): Promise<ServiceResult<GigTaskOrder[]>>;
  takeOrder(id: string): Promise<ServiceResult<GigTaskOrder>>;
  getMyOrders(view: 'active' | 'history'): Promise<ServiceResult<GigTaskOrder[]>>;
  submitWork(id: string, deliverableUrl: string, deliverableType: 'image' | 'video'): Promise<ServiceResult<GigTaskOrder>>;
  completeOrder(id: string): Promise<ServiceResult<GigTaskOrder>>;
  getEarnings(): Promise<{ today: number; total: number }>;
  getGigCenterScrollOffset(): Promise<number>;
  setGigCenterScrollOffset(offset: number): Promise<void>;
  clearGigCenterScrollOffset(): Promise<void>;
}

export interface DistributionOverviewSnapshot {
  levelName: string;
  referralCode: string;
  totalCommission: number;
  pendingCommission: number;
  withdrawableCommission: number;
  totalSales: number;
  teamSize: number;
  currentMonthCommission: number;
}

export interface DistributionTeamMember {
  id: string;
  name: string;
  avatar: string;
  role: string;
  level: 1 | 2;
  joinAt: string;
  contribution: number;
}

export interface DistributionCommissionEntry {
  id: string;
  type: 'income' | 'withdraw';
  productName: string;
  sourceUser: string;
  level: 0 | 1 | 2;
  amount: number;
  status: 'pending' | 'processing' | 'success' | 'settled';
  createdAt: string;
}

export interface DistributionTaskItem {
  id: string;
  title: string;
  desc: string;
  target: number;
  current: number;
  reward: string;
  status: 'todo' | 'claim' | 'done';
}

export interface DistributionRankEntry {
  rank: number;
  id: string;
  name: string;
  avatar: string;
  amount: number;
  trend: 'up' | 'down' | 'flat';
}

export type WithdrawMethod = 'wechat' | 'alipay' | 'bank';

export interface IDistributionService {
  getOverview(): Promise<ServiceResult<DistributionOverviewSnapshot>>;
  getTeamMembers(level?: 'all' | 1 | 2): Promise<ServiceResult<DistributionTeamMember[]>>;
  getCommissionRecords(type?: 'all' | 'income' | 'withdraw'): Promise<ServiceResult<DistributionCommissionEntry[]>>;
  getWeeklyEarnings(): Promise<ServiceResult<{ labels: string[]; data: number[] }>>;
  getTasks(): Promise<ServiceResult<DistributionTaskItem[]>>;
  claimTask(taskId: string): Promise<ServiceResult<void>>;
  getRankings(): Promise<ServiceResult<DistributionRankEntry[]>>;
  withdraw(amount: number, method: WithdrawMethod): Promise<ServiceResult<void>>;
  calculateCommission(price: number, rate?: number): number;
}
