import {
  resolveServiceFactoryRuntimeDeps,
} from '@sdkwork/react-mobile-core';
import type { ServiceFactoryDeps, ServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';
import type {
  Creation,
  CreationType,
  CreationStyle,
  CreationPrompt,
  CreationFilter,
  CreateCreationRequest,
  ICreationService,
} from '../types';

const STORAGE_KEYS = {
  CREATIONS: 'sys_creations_list_v1',
  STYLES: 'sys_creations_styles_v1',
  PROMPTS: 'sys_creations_prompts_v1',
  FAVORITES: 'sys_creations_favorites_v1',
};

const CREATION_EVENTS = {
  CREATED: 'creation:created',
  UPDATED: 'creation:updated',
  DELETED: 'creation:deleted',
  FAVORITE_TOGGLED: 'creation:favorite_toggled',
} as const;

// Seed creations data
const SEED_CREATIONS: Partial<Creation>[] = [
  {
    id: 'creation_1',
    type: 'image',
    title: 'Futuristic Cityscape',
    description: 'A stunning view of a futuristic city at sunset',
    prompt: 'futuristic cityscape, neon lights, flying cars, sunset, cyberpunk style, highly detailed, 8k resolution',
    status: 'completed',
    progress: 100,
    result: {
      url: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800',
      thumbnailUrl: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=400',
      width: 1024,
      height: 1024,
      format: 'png',
    },
    params: {
      width: 1024,
      height: 1024,
      style: 'cyberpunk',
      steps: 30,
      cfgScale: 7.5,
    },
    tags: ['city', 'futuristic', 'cyberpunk'],
    isPublic: true,
    isFavorite: false,
    viewCount: 1234,
    likeCount: 89,
    userId: 'user_1',
    userName: 'Creator One',
  },
  {
    id: 'creation_2',
    type: 'image',
    title: 'Abstract Art',
    description: 'Beautiful abstract art with vibrant colors',
    prompt: 'abstract art, vibrant colors, flowing shapes, modern art style, masterpiece',
    status: 'completed',
    progress: 100,
    result: {
      url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800',
      thumbnailUrl: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400',
      width: 1024,
      height: 1024,
      format: 'png',
    },
    params: {
      width: 1024,
      height: 1024,
      style: 'abstract',
      steps: 25,
    },
    tags: ['abstract', 'art', 'colorful'],
    isPublic: true,
    isFavorite: true,
    viewCount: 567,
    likeCount: 45,
    userId: 'user_2',
    userName: 'Artist Two',
  },
  {
    id: 'creation_3',
    type: 'music',
    title: 'Ambient Dreams',
    description: 'Relaxing ambient music for meditation',
    prompt: 'ambient, relaxing, meditation, peaceful, ethereal, dreamy atmosphere',
    status: 'completed',
    progress: 100,
    result: {
      url: 'https://example.com/music/ambient.mp3',
      duration: 180,
      fileSize: 4500000,
      format: 'mp3',
    },
    params: {
      genre: 'ambient',
      mood: 'peaceful',
      tempo: 80,
      duration: 180,
    },
    tags: ['ambient', 'meditation', 'relaxing'],
    isPublic: true,
    isFavorite: false,
    viewCount: 234,
    likeCount: 23,
    userId: 'user_1',
    userName: 'Creator One',
  },
];

const SEED_STYLES: CreationStyle[] = [
  { id: 'style_realistic', name: 'Realistic', type: 'image', description: 'Photorealistic style', isPopular: true },
  { id: 'style_anime', name: 'Anime', type: 'image', description: 'Japanese anime style', isPopular: true },
  { id: 'style_abstract', name: 'Abstract', type: 'image', description: 'Abstract art style' },
  { id: 'style_cyberpunk', name: 'Cyberpunk', type: 'image', description: 'Cyberpunk aesthetic', isNew: true },
  { id: 'style_oil', name: 'Oil Painting', type: 'image', description: 'Classical oil painting' },
  { id: 'style_watercolor', name: 'Watercolor', type: 'image', description: 'Watercolor painting style' },
  { id: 'style_pixel', name: 'Pixel Art', type: 'image', description: 'Retro pixel art style', isNew: true },
  { id: 'style_3d', name: '3D Render', type: 'image', description: '3D rendered style' },
];

const SEED_PROMPTS: Partial<CreationPrompt>[] = [
  {
    id: 'prompt_1',
    title: 'Portrait Masterpiece',
    content: 'professional portrait, {{subject}}, studio lighting, high quality, detailed face, {{style}} style',
    type: 'image',
    category: 'Portrait',
    tags: ['portrait', 'professional', 'studio'],
    usageCount: 1234,
    isPublic: true,
    isFavorite: false,
  },
  {
    id: 'prompt_2',
    title: 'Landscape Wonder',
    content: 'breathtaking landscape, {{location}}, {{time_of_day}}, cinematic composition, 8k resolution',
    type: 'image',
    category: 'Landscape',
    tags: ['landscape', 'nature', 'cinematic'],
    usageCount: 892,
    isPublic: true,
    isFavorite: true,
  },
  {
    id: 'prompt_3',
    title: 'Product Showcase',
    content: 'professional product photo, {{product}}, clean background, studio lighting, commercial photography',
    type: 'image',
    category: 'Product',
    tags: ['product', 'commercial', 'studio'],
    usageCount: 567,
    isPublic: true,
    isFavorite: false,
  },
];

class CreationServiceImpl implements ICreationService {
  private readonly deps: ServiceFactoryRuntimeDeps;

  constructor(deps?: ServiceFactoryDeps) {
    this.deps = resolveServiceFactoryRuntimeDeps(deps);
  }

  private nowIso(): string {
    return new Date(this.deps.clock.now()).toISOString();
  }

  private async getFromStorage<T>(key: string): Promise<T | null> {
    const value = await Promise.resolve(this.deps.storage.get<T>(key));
    return value ?? null;
  }

  private async setToStorage<T>(key: string, value: T): Promise<void> {
    await Promise.resolve(this.deps.storage.set<T>(key, value));
  }

  async initialize(): Promise<void> {
    const existing = await this.getFromStorage(STORAGE_KEYS.CREATIONS);
    if (!existing) {
      const creations: Creation[] = SEED_CREATIONS.map(c => ({
        ...c,
        createdAt: this.nowIso(),
        updatedAt: this.nowIso(),
        completedAt: this.nowIso(),
      })) as Creation[];
      await this.setToStorage(STORAGE_KEYS.CREATIONS, creations);
    }

    const existingStyles = await this.getFromStorage(STORAGE_KEYS.STYLES);
    if (!existingStyles) {
      await this.setToStorage(STORAGE_KEYS.STYLES, SEED_STYLES);
    }

    const existingPrompts = await this.getFromStorage(STORAGE_KEYS.PROMPTS);
    if (!existingPrompts) {
      const prompts: CreationPrompt[] = SEED_PROMPTS.map(p => ({
        ...p,
        createdBy: 'system',
        createdAt: this.nowIso(),
      })) as CreationPrompt[];
      await this.setToStorage(STORAGE_KEYS.PROMPTS, prompts);
    }
  }

  async getCreations(filter?: CreationFilter): Promise<Creation[]> {
    let creations = await this.getFromStorage<Creation[]>(STORAGE_KEYS.CREATIONS) || [];

    if (filter?.type) {
      creations = creations.filter(c => c.type === filter.type);
    }

    if (filter?.status) {
      creations = creations.filter(c => c.status === filter.status);
    }

    if (filter?.isPublic !== undefined) {
      creations = creations.filter(c => c.isPublic === filter.isPublic);
    }

    if (filter?.isFavorite !== undefined) {
      creations = creations.filter(c => c.isFavorite === filter.isFavorite);
    }

    if (filter?.tags?.length) {
      creations = creations.filter(c => 
        filter.tags!.some(tag => c.tags.includes(tag))
      );
    }

    // Sort
    if (filter?.sortBy) {
      creations.sort((a, b) => {
        switch (filter.sortBy) {
          case 'newest':
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          case 'oldest':
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          case 'popular':
            return b.viewCount - a.viewCount;
          case 'most_liked':
            return b.likeCount - a.likeCount;
          default:
            return 0;
        }
      });
    }

    return creations;
  }

  async getCreationById(id: string): Promise<Creation | null> {
    const creations = await this.getFromStorage<Creation[]>(STORAGE_KEYS.CREATIONS) || [];
    return creations.find(c => c.id === id) || null;
  }

  async createCreation(params: CreateCreationRequest): Promise<Creation> {
    const creations = await this.getFromStorage<Creation[]>(STORAGE_KEYS.CREATIONS) || [];

    const creation: Creation = {
      id: this.deps.idGenerator.next('creation'),
      type: params.type,
      title: params.title,
      description: params.description,
      prompt: params.prompt,
      negativePrompt: params.negativePrompt,
      status: 'pending',
      progress: 0,
      params: params.params || {},
      tags: params.tags || [],
      isPublic: params.isPublic ?? true,
      isFavorite: false,
      viewCount: 0,
      likeCount: 0,
      userId: '', // Will be set from auth context
      userName: '',
      createdAt: this.nowIso(),
      updatedAt: this.nowIso(),
    };

    creations.unshift(creation);
    await this.setToStorage(STORAGE_KEYS.CREATIONS, creations);

    this.deps.eventBus.emit(CREATION_EVENTS.CREATED, creation);
    
    // Simulate processing
    this.simulateProcessing(creation.id);

    return creation;
  }

  private async simulateProcessing(creationId: string): Promise<void> {
    const creations = await this.getFromStorage<Creation[]>(STORAGE_KEYS.CREATIONS) || [];
    const creation = creations.find(c => c.id === creationId);
    if (!creation) return;

    // Update to processing
    creation.status = 'processing';
    creation.updatedAt = this.nowIso();
    await this.setToStorage(STORAGE_KEYS.CREATIONS, creations);
    this.deps.eventBus.emit(CREATION_EVENTS.UPDATED, creation);

    // Simulate progress
    const interval = setInterval(async () => {
      const currentCreations = await this.getFromStorage<Creation[]>(STORAGE_KEYS.CREATIONS) || [];
      const current = currentCreations.find(c => c.id === creationId);
      if (!current || current.status !== 'processing') {
        clearInterval(interval);
        return;
      }

      current.progress += Math.random() * 20;
      if (current.progress >= 100) {
        current.progress = 100;
        current.status = 'completed';
        current.completedAt = this.nowIso();
        
        // Set mock result
        current.result = {
          url: `https://picsum.photos/seed/${creationId}/800/800`,
          thumbnailUrl: `https://picsum.photos/seed/${creationId}/400/400`,
          width: 1024,
          height: 1024,
          format: 'png',
        };
        
        clearInterval(interval);
      }
      
      current.updatedAt = this.nowIso();
      await this.setToStorage(STORAGE_KEYS.CREATIONS, currentCreations);
      this.deps.eventBus.emit(CREATION_EVENTS.UPDATED, current);
    }, 1000);
  }

  async deleteCreation(id: string): Promise<void> {
    const creations = await this.getFromStorage<Creation[]>(STORAGE_KEYS.CREATIONS) || [];
    const filtered = creations.filter(c => c.id !== id);
    await this.setToStorage(STORAGE_KEYS.CREATIONS, filtered);
    
    this.deps.eventBus.emit(CREATION_EVENTS.DELETED, id);
  }

  async toggleFavorite(id: string): Promise<boolean> {
    const creations = await this.getFromStorage<Creation[]>(STORAGE_KEYS.CREATIONS) || [];
    const creation = creations.find(c => c.id === id);
    if (!creation) return false;

    creation.isFavorite = !creation.isFavorite;
    creation.updatedAt = this.nowIso();
    await this.setToStorage(STORAGE_KEYS.CREATIONS, creations);

    // Update favorites list
    let favorites = await this.getFromStorage<string[]>(STORAGE_KEYS.FAVORITES) || [];
    if (creation.isFavorite) {
      favorites = [...new Set([...favorites, id])];
    } else {
      favorites = favorites.filter(fid => fid !== id);
    }
    await this.setToStorage(STORAGE_KEYS.FAVORITES, favorites);

    this.deps.eventBus.emit(CREATION_EVENTS.FAVORITE_TOGGLED, { id, isFavorite: creation.isFavorite });
    return creation.isFavorite;
  }

  async getFavorites(): Promise<Creation[]> {
    const favoriteIds = await this.getFromStorage<string[]>(STORAGE_KEYS.FAVORITES) || [];
    const creations = await this.getFromStorage<Creation[]>(STORAGE_KEYS.CREATIONS) || [];
    return creations.filter(c => favoriteIds.includes(c.id));
  }

  async getStyles(type?: CreationType): Promise<CreationStyle[]> {
    const styles = await this.getFromStorage<CreationStyle[]>(STORAGE_KEYS.STYLES) || [];
    if (type) {
      return styles.filter(s => s.type === type);
    }
    return styles;
  }

  async getPrompts(type?: CreationType): Promise<CreationPrompt[]> {
    const prompts = await this.getFromStorage<CreationPrompt[]>(STORAGE_KEYS.PROMPTS) || [];
    if (type) {
      return prompts.filter(p => p.type === type);
    }
    return prompts.sort((a, b) => b.usageCount - a.usageCount);
  }

  async usePrompt(promptId: string): Promise<void> {
    const prompts = await this.getFromStorage<CreationPrompt[]>(STORAGE_KEYS.PROMPTS) || [];
    const prompt = prompts.find(p => p.id === promptId);
    if (prompt) {
      prompt.usageCount++;
      await this.setToStorage(STORAGE_KEYS.PROMPTS, prompts);
    }
  }

  onCreationUpdated(handler: (creation: Creation) => void): () => void {
    return this.deps.eventBus.on(CREATION_EVENTS.UPDATED, handler);
  }

  onCreationDeleted(handler: (creationId: string) => void): () => void {
    return this.deps.eventBus.on(CREATION_EVENTS.DELETED, handler);
  }
}

export function createCreationService(_deps?: ServiceFactoryDeps): ICreationService {
  return new CreationServiceImpl(_deps);
}

export const creationService: ICreationService = createCreationService();

