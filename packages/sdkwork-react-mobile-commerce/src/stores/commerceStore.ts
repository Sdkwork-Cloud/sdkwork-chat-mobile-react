import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { getPersistStorage } from '@sdkwork/react-mobile-core';
import type { 
  Product, ProductCategory, Cart, Order, OrderStatus,
  Distributor, CommissionRecord, Gig, Shop, Coupon 
} from '../types';

interface CommerceState {
  // Products
  products: Product[];
  categories: ProductCategory[];
  currentProduct: Product | null;
  favorites: Product[];
  isLoadingProducts: boolean;
  
  // Cart
  cart: Cart | null;
  isLoadingCart: boolean;
  
  // Orders
  orders: Order[];
  currentOrder: Order | null;
  orderCounts: Record<OrderStatus, number>;
  isLoadingOrders: boolean;
  
  // Distribution
  distributor: Distributor | null;
  commissionRecords: CommissionRecord[];
  isLoadingDistributor: boolean;
  
  // Gigs
  gigs: Gig[];
  currentGig: Gig | null;
  isLoadingGigs: boolean;
  
  // Shops
  shops: Shop[];
  currentShop: Shop | null;
  isLoadingShops: boolean;
  
  // Coupons
  coupons: Coupon[];
  myCoupons: Coupon[];
  isLoadingCoupons: boolean;
  
  // Actions
  setProducts: (products: Product[]) => void;
  setCategories: (categories: ProductCategory[]) => void;
  setCurrentProduct: (product: Product | null) => void;
  setFavorites: (favorites: Product[]) => void;
  setIsLoadingProducts: (loading: boolean) => void;
  
  setCart: (cart: Cart) => void;
  setIsLoadingCart: (loading: boolean) => void;
  
  setOrders: (orders: Order[]) => void;
  setCurrentOrder: (order: Order | null) => void;
  setOrderCounts: (counts: Record<OrderStatus, number>) => void;
  setIsLoadingOrders: (loading: boolean) => void;
  
  setDistributor: (distributor: Distributor | null) => void;
  setCommissionRecords: (records: CommissionRecord[]) => void;
  setIsLoadingDistributor: (loading: boolean) => void;
  
  setGigs: (gigs: Gig[]) => void;
  setCurrentGig: (gig: Gig | null) => void;
  setIsLoadingGigs: (loading: boolean) => void;
  
  setShops: (shops: Shop[]) => void;
  setCurrentShop: (shop: Shop | null) => void;
  setIsLoadingShops: (loading: boolean) => void;
  
  setCoupons: (coupons: Coupon[]) => void;
  setMyCoupons: (coupons: Coupon[]) => void;
  setIsLoadingCoupons: (loading: boolean) => void;
  
  // Reset
  reset: () => void;
}

const initialState = {
  products: [],
  categories: [],
  currentProduct: null,
  favorites: [],
  isLoadingProducts: false,
  
  cart: null,
  isLoadingCart: false,
  
  orders: [],
  currentOrder: null,
  orderCounts: {
    pending_payment: 0,
    paid: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    completed: 0,
    cancelled: 0,
    refunding: 0,
    refunded: 0,
  },
  isLoadingOrders: false,
  
  distributor: null,
  commissionRecords: [],
  isLoadingDistributor: false,
  
  gigs: [],
  currentGig: null,
  isLoadingGigs: false,
  
  shops: [],
  currentShop: null,
  isLoadingShops: false,
  
  coupons: [],
  myCoupons: [],
  isLoadingCoupons: false,
};

export const useCommerceStore = create<CommerceState>()(
  persist(
    (set) => ({
      ...initialState,
      
      setProducts: (products) => set({ products }),
      setCategories: (categories) => set({ categories }),
      setCurrentProduct: (currentProduct) => set({ currentProduct }),
      setFavorites: (favorites) => set({ favorites }),
      setIsLoadingProducts: (isLoadingProducts) => set({ isLoadingProducts }),
      
      setCart: (cart) => set({ cart }),
      setIsLoadingCart: (isLoadingCart) => set({ isLoadingCart }),
      
      setOrders: (orders) => set({ orders }),
      setCurrentOrder: (currentOrder) => set({ currentOrder }),
      setOrderCounts: (orderCounts) => set({ orderCounts }),
      setIsLoadingOrders: (isLoadingOrders) => set({ isLoadingOrders }),
      
      setDistributor: (distributor) => set({ distributor }),
      setCommissionRecords: (commissionRecords) => set({ commissionRecords }),
      setIsLoadingDistributor: (isLoadingDistributor) => set({ isLoadingDistributor }),
      
      setGigs: (gigs) => set({ gigs }),
      setCurrentGig: (currentGig) => set({ currentGig }),
      setIsLoadingGigs: (isLoadingGigs) => set({ isLoadingGigs }),
      
      setShops: (shops) => set({ shops }),
      setCurrentShop: (currentShop) => set({ currentShop }),
      setIsLoadingShops: (isLoadingShops) => set({ isLoadingShops }),
      
      setCoupons: (coupons) => set({ coupons }),
      setMyCoupons: (myCoupons) => set({ myCoupons }),
      setIsLoadingCoupons: (isLoadingCoupons) => set({ isLoadingCoupons }),
      
      reset: () => set(initialState),
    }),
    {
      name: 'commerce-storage',
      storage: createJSONStorage(getPersistStorage),
      partialize: (state) => ({
        // Only persist certain state
        favorites: state.favorites.map(f => f.id),
        myCoupons: state.myCoupons.map(c => c.id),
      }),
    }
  )
);
