import { resolveServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';
import type { ServiceFactoryDeps, ServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';
import type { IProductService, Product, ProductCategory, ProductQueryParams, ProductReview } from '../types';
import { createCommerceSdkService } from './CommerceSdkService';
import type { ICommerceSdkService } from './CommerceSdkService';

const TAG = 'ProductService';

const STORAGE_KEYS = {
  PRODUCTS: 'sys_commerce_products_v1',
  CATEGORIES: 'sys_commerce_categories_v1',
  REVIEWS: 'sys_commerce_reviews_v1',
  FAVORITES: 'sys_commerce_favorites_v1',
};

// Seed products data
const SEED_PRODUCTS: Partial<Product>[] = [
  {
    id: 'prod_1',
    name: 'iPhone 15 Pro Max',
    description: 'The most advanced iPhone ever with A17 Pro chip, titanium design, and 48MP camera system.',
    price: 9999,
    originalPrice: 10999,
    images: ['https://images.unsplash.com/photo-1696446701796-da61225697cc?w=800'],
    thumbnail: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?w=400',
    category: { id: 'cat_electronics', name: 'Electronics' },
    tags: ['Apple', 'iPhone', 'Smartphone', '5G'],
    rating: 4.9,
    reviewCount: 2847,
    salesCount: 15234,
    stock: 500,
    sku: 'IPHONE15PM-256',
    specifications: {
      'Screen Size': '6.7 inches',
      'Storage': '256GB',
      'Color': 'Natural Titanium',
      'Battery': '4422 mAh',
    },
    shopId: 'shop_1',
    shopName: 'Apple Official Store',
  },
  {
    id: 'prod_2',
    name: 'MacBook Pro 14" M3',
    description: 'Supercharged by M3 chip, MacBook Pro delivers incredible performance for demanding workflows.',
    price: 14999,
    originalPrice: 15999,
    images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800'],
    thumbnail: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
    category: { id: 'cat_electronics', name: 'Electronics' },
    tags: ['Apple', 'MacBook', 'Laptop', 'M3'],
    rating: 4.8,
    reviewCount: 1523,
    salesCount: 8234,
    stock: 200,
    sku: 'MBP14-M3-512',
    specifications: {
      'Processor': 'Apple M3',
      'Memory': '16GB',
      'Storage': '512GB SSD',
      'Display': '14.2-inch Liquid Retina XDR',
    },
    shopId: 'shop_1',
    shopName: 'Apple Official Store',
  },
  {
    id: 'prod_3',
    name: 'Sony WH-1000XM5',
    description: 'Industry-leading noise canceling headphones with exceptional sound quality.',
    price: 2499,
    originalPrice: 2999,
    images: ['https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800'],
    thumbnail: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400',
    category: { id: 'cat_electronics', name: 'Electronics' },
    tags: ['Sony', 'Headphones', 'Noise Canceling', 'Wireless'],
    rating: 4.7,
    reviewCount: 3421,
    salesCount: 21567,
    stock: 800,
    sku: 'SONY-XM5-BLK',
    specifications: {
      'Type': 'Over-ear',
      'Connectivity': 'Bluetooth 5.2',
      'Battery Life': '30 hours',
      'Weight': '250g',
    },
    shopId: 'shop_2',
    shopName: 'Sony Flagship Store',
  },
  {
    id: 'prod_4',
    name: 'Nike Air Max 270',
    description: 'The Nike Air Max 270 delivers visible cushioning under every step.',
    price: 1299,
    originalPrice: 1499,
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800'],
    thumbnail: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
    category: { id: 'cat_fashion', name: 'Fashion' },
    tags: ['Nike', 'Shoes', 'Sneakers', 'Air Max'],
    rating: 4.6,
    reviewCount: 5621,
    salesCount: 45234,
    stock: 1200,
    sku: 'NIKE-AM270-RED',
    specifications: {
      'Brand': 'Nike',
      'Model': 'Air Max 270',
      'Color': 'Red/White',
      'Sizes': 'US 7-13',
    },
    shopId: 'shop_3',
    shopName: 'Nike Official',
  },
  {
    id: 'prod_5',
    name: 'Dyson V15 Detect',
    description: 'Laser reveals microscopic dust. The most powerful, intelligent Dyson cordless vacuum.',
    price: 5499,
    originalPrice: 5999,
    images: ['https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800'],
    thumbnail: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=400',
    category: { id: 'cat_home', name: 'Home & Living' },
    tags: ['Dyson', 'Vacuum', 'Cordless', 'Smart'],
    rating: 4.8,
    reviewCount: 2134,
    salesCount: 8934,
    stock: 300,
    sku: 'DYSON-V15-DET',
    specifications: {
      'Suction Power': '230 AW',
      'Run Time': '60 minutes',
      'Weight': '3.1 kg',
      'Bin Volume': '0.77L',
    },
    shopId: 'shop_4',
    shopName: 'Dyson Official Store',
  },
];

const SEED_CATEGORIES: ProductCategory[] = [
  { id: 'cat_electronics', name: 'Electronics', icon: 'smartphone' },
  { id: 'cat_fashion', name: 'Fashion', icon: 'shirt' },
  { id: 'cat_home', name: 'Home & Living', icon: 'home' },
  { id: 'cat_beauty', name: 'Beauty', icon: 'sparkles' },
  { id: 'cat_sports', name: 'Sports', icon: 'dumbbell' },
  { id: 'cat_books', name: 'Books', icon: 'book' },
  { id: 'cat_toys', name: 'Toys', icon: 'gamepad' },
  { id: 'cat_food', name: 'Food & Beverages', icon: 'utensils' },
];

class ProductServiceImpl implements IProductService {
  private initialized = false;
  private initializePromise: Promise<void> | null = null;
  private productsCache: Product[] | null = null;
  private categoriesCache: ProductCategory[] | null = null;
  private favoritesCache: string[] | null = null;
  private readonly deps: ServiceFactoryRuntimeDeps;
  private readonly sdkService: ICommerceSdkService;

  constructor(deps?: ServiceFactoryDeps, sdkService?: ICommerceSdkService) {
    this.deps = resolveServiceFactoryRuntimeDeps(deps);
    this.sdkService = sdkService || createCommerceSdkService(deps);
  }

  private nowIso(): string {
    return new Date(this.deps.clock.now()).toISOString();
  }

  private sdkErrorMessage(defaultMessage: string): string {
    const sdkError = this.sdkService.getLastError();
    return sdkError?.message || defaultMessage;
  }

  private async readProducts(force = false): Promise<Product[]> {
    if (!force && this.productsCache) {
      return this.productsCache;
    }
    const products = (await Promise.resolve(this.deps.storage.get<Product[]>(STORAGE_KEYS.PRODUCTS))) || [];
    this.productsCache = products;
    return products;
  }

  private async readCategories(force = false): Promise<ProductCategory[]> {
    if (!force && this.categoriesCache) {
      return this.categoriesCache;
    }
    const categories = (await Promise.resolve(this.deps.storage.get<ProductCategory[]>(STORAGE_KEYS.CATEGORIES))) || [];
    this.categoriesCache = categories;
    return categories;
  }

  private async readFavoriteIds(force = false): Promise<string[]> {
    if (!force && this.favoritesCache) {
      return this.favoritesCache;
    }
    const favoriteIds = (await Promise.resolve(this.deps.storage.get<string[]>(STORAGE_KEYS.FAVORITES))) || [];
    this.favoritesCache = favoriteIds;
    return favoriteIds;
  }

  private async initializeInternal(): Promise<void> {
    const existingProducts = await Promise.resolve(this.deps.storage.get<Product[]>(STORAGE_KEYS.PRODUCTS));
    if (!existingProducts) {
      const seededProducts: Product[] = SEED_PRODUCTS.map((p) => ({
        ...p,
        isFavorite: false,
        createdAt: this.nowIso(),
        updatedAt: this.nowIso(),
      })) as Product[];
      await Promise.resolve(this.deps.storage.set(STORAGE_KEYS.PRODUCTS, seededProducts));
      this.productsCache = seededProducts;
    } else {
      this.productsCache = existingProducts;
    }

    const existingCategories = await Promise.resolve(this.deps.storage.get<ProductCategory[]>(STORAGE_KEYS.CATEGORIES));
    if (!existingCategories) {
      await Promise.resolve(this.deps.storage.set(STORAGE_KEYS.CATEGORIES, SEED_CATEGORIES));
      this.categoriesCache = SEED_CATEGORIES;
    } else {
      this.categoriesCache = existingCategories;
    }

    this.favoritesCache = await this.readFavoriteIds(true);
    this.initialized = true;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;
    if (!this.initializePromise) {
      this.initializePromise = (async () => {
        if (this.sdkService.hasSdkBaseUrl()) {
          this.favoritesCache = await this.readFavoriteIds(true);
          this.initialized = true;
          return;
        }
        await this.initializeInternal();
      })().finally(() => {
        this.initializePromise = null;
      });
    }
    await this.initializePromise;
  }

  async getProducts(params?: ProductQueryParams): Promise<{ products: Product[]; total: number }> {
    await this.initialize();

    if (this.sdkService.hasSdkBaseUrl()) {
      const remote = await this.sdkService.listProducts(params);
      if (!remote) {
        const message = this.sdkErrorMessage('Failed to load products');
        this.deps.logger.warn(TAG, 'SDK getProducts failed', { message });
        throw new Error(message);
      }

      const favoriteIds = new Set(await this.readFavoriteIds());
      const products = remote.products.map((product) => ({
        ...product,
        isFavorite: favoriteIds.has(product.id),
      }));
      this.productsCache = products;
      return {
        products,
        total: remote.total,
      };
    }

    let products = [...(await this.readProducts())];

    if (params?.categoryId) {
      products = products.filter(p => p.category.id === params.categoryId);
    }

    if (params?.keyword) {
      const keyword = params.keyword.toLowerCase();
      products = products.filter(p => 
        p.name.toLowerCase().includes(keyword) ||
        p.description.toLowerCase().includes(keyword) ||
        p.tags.some(t => t.toLowerCase().includes(keyword))
      );
    }

    if (params?.minPrice !== undefined) {
      products = products.filter(p => p.price >= params.minPrice!);
    }

    if (params?.maxPrice !== undefined) {
      products = products.filter(p => p.price <= params.maxPrice!);
    }

    if (params?.sortBy) {
      products.sort((a, b) => {
        let comparison = 0;
        switch (params.sortBy) {
          case 'price':
            comparison = a.price - b.price;
            break;
          case 'sales':
            comparison = a.salesCount - b.salesCount;
            break;
          case 'rating':
            comparison = a.rating - b.rating;
            break;
          case 'newest':
            comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            break;
        }
        return params.sortOrder === 'desc' ? -comparison : comparison;
      });
    }

    const total = products.length;
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 20;
    const start = (page - 1) * pageSize;
    const paginatedProducts = products.slice(start, start + pageSize);

    return { products: paginatedProducts, total };
  }

  async getProductById(id: string): Promise<Product | null> {
    await this.initialize();

    if (this.sdkService.hasSdkBaseUrl()) {
      const remote = await this.sdkService.getProductById(id);
      if (!remote) {
        const message = this.sdkErrorMessage('Failed to load product detail');
        this.deps.logger.warn(TAG, 'SDK getProductById failed', { productId: id, message });
        throw new Error(message);
      }

      const favoriteIds = new Set(await this.readFavoriteIds());
      const mapped = {
        ...remote,
        isFavorite: favoriteIds.has(remote.id),
      };

      if (this.productsCache) {
        const index = this.productsCache.findIndex((item) => item.id === mapped.id);
        if (index >= 0) {
          const next = [...this.productsCache];
          next[index] = mapped;
          this.productsCache = next;
        } else {
          this.productsCache = [...this.productsCache, mapped];
        }
      }
      return mapped;
    }

    const products = await this.readProducts();
    return products.find(p => p.id === id) || null;
  }

  async getCategories(): Promise<ProductCategory[]> {
    await this.initialize();

    if (this.sdkService.hasSdkBaseUrl()) {
      const categories = await this.sdkService.listCategories();
      if (!categories) {
        const message = this.sdkErrorMessage('Failed to load categories');
        this.deps.logger.warn(TAG, 'SDK getCategories failed', { message });
        throw new Error(message);
      }
      this.categoriesCache = categories;
      return [...categories];
    }

    return [...(await this.readCategories())];
  }

  async toggleFavorite(productId: string): Promise<boolean> {
    await this.initialize();

    if (this.sdkService.hasSdkBaseUrl()) {
      const favorites = [...(await this.readFavoriteIds())];
      const existed = favorites.includes(productId);
      const nextFavorites = existed
        ? favorites.filter((id) => id !== productId)
        : [...new Set([...favorites, productId])];

      await Promise.resolve(this.deps.storage.set(STORAGE_KEYS.FAVORITES, nextFavorites));
      this.favoritesCache = nextFavorites;

      if (this.productsCache) {
        this.productsCache = this.productsCache.map((item) => (
          item.id === productId
            ? { ...item, isFavorite: !existed, updatedAt: this.nowIso() }
            : item
        ));
      }

      return !existed;
    }

    const products = [...(await this.readProducts())];
    const productIndex = products.findIndex((p) => p.id === productId);
    if (productIndex < 0) return false;

    const product = {
      ...products[productIndex],
      isFavorite: !products[productIndex].isFavorite,
      updatedAt: this.nowIso(),
    };
    products[productIndex] = product;
    await Promise.resolve(this.deps.storage.set(STORAGE_KEYS.PRODUCTS, products));
    this.productsCache = products;

    // Update favorites list
    let favorites = [...(await this.readFavoriteIds())];
    if (product.isFavorite) {
      favorites = [...new Set([...favorites, productId])];
    } else {
      favorites = favorites.filter(id => id !== productId);
    }
    await Promise.resolve(this.deps.storage.set(STORAGE_KEYS.FAVORITES, favorites));
    this.favoritesCache = favorites;

    return product.isFavorite;
  }

  async getFavorites(): Promise<Product[]> {
    await this.initialize();

    if (this.sdkService.hasSdkBaseUrl()) {
      const favoriteIds = await this.readFavoriteIds();
      if (favoriteIds.length === 0) return [];

      const favoriteProducts = await Promise.all(
        favoriteIds.map(async (favoriteId) => {
          const remote = await this.sdkService.getProductById(favoriteId);
          if (!remote) return null;
          return {
            ...remote,
            isFavorite: true,
          };
        })
      );
      return favoriteProducts.filter((item): item is Product => item !== null);
    }

    const favoriteIds = await this.readFavoriteIds();
    const products = await this.readProducts();
    return products.filter(p => favoriteIds.includes(p.id));
  }

  async getReviews(productId: string): Promise<ProductReview[]> {
    const reviews = (await Promise.resolve(this.deps.storage.get<ProductReview[]>(STORAGE_KEYS.REVIEWS))) || [];
    return reviews.filter(r => r.productId === productId);
  }

  async addReview(review: Omit<ProductReview, 'id' | 'createdAt'>): Promise<ProductReview> {
    const reviews = (await Promise.resolve(this.deps.storage.get<ProductReview[]>(STORAGE_KEYS.REVIEWS))) || [];
    const newReview: ProductReview = {
      ...review,
      id: this.deps.idGenerator.next('rev'),
      createdAt: this.nowIso(),
    };
    reviews.push(newReview);
    await Promise.resolve(this.deps.storage.set(STORAGE_KEYS.REVIEWS, reviews));
    return newReview;
  }
}

export function createProductService(_deps?: ServiceFactoryDeps): IProductService {
  return new ProductServiceImpl(_deps);
}

export function createProductServiceWithSdk(_deps?: ServiceFactoryDeps, sdkService?: ICommerceSdkService): IProductService {
  return new ProductServiceImpl(_deps, sdkService);
}

export const productService: IProductService = createProductService();


