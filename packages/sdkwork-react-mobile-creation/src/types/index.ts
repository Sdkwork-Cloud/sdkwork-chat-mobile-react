// ============================================
// Creation Types
// ============================================

export type CreationType = 'image' | 'video' | 'music' | 'text';
export type CreationStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface Creation {
  id: string;
  type: CreationType;
  title: string;
  description?: string;
  prompt: string;
  negativePrompt?: string;
  status: CreationStatus;
  progress: number;
  result?: CreationResult;
  params: CreationParams;
  tags: string[];
  isPublic: boolean;
  isFavorite: boolean;
  viewCount: number;
  likeCount: number;
  userId: string;
  userName: string;
  userAvatar?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface CreationResult {
  url: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  duration?: number;
  fileSize?: number;
  format?: string;
  variations?: CreationVariation[];
}

export interface CreationVariation {
  id: string;
  url: string;
  thumbnailUrl?: string;
  seed?: number;
}

export interface CreationParams {
  // Image params
  width?: number;
  height?: number;
  aspectRatio?: string;
  style?: string;
  artist?: string;
  
  // Video params
  duration?: number;
  fps?: number;
  motionStrength?: number;
  
  // Music params
  genre?: string;
  mood?: string;
  tempo?: number;
  instruments?: string[];
  
  // Common params
  seed?: number;
  steps?: number;
  cfgScale?: number;
  sampler?: string;
  model?: string;
}

// ============================================
// Style Types
// ============================================

export interface CreationStyle {
  id: string;
  name: string;
  type: CreationType;
  thumbnail?: string;
  description?: string;
  previewImages?: string[];
  isPopular?: boolean;
  isNew?: boolean;
}

// ============================================
// Model Types
// ============================================

export interface CreationModel {
  id: string;
  name: string;
  type: CreationType;
  description?: string;
  provider: string;
  version: string;
  capabilities: string[];
  isDefault: boolean;
  isFavorite: boolean;
}

// ============================================
// History Types
// ============================================

export interface CreationHistory {
  id: string;
  creationId: string;
  action: 'create' | 'edit' | 'delete' | 'share' | 'download';
  details?: Record<string, unknown>;
  createdAt: string;
}

// ============================================
// Gallery Types
// ============================================

export interface CreationGallery {
  id: string;
  name: string;
  description?: string;
  coverImage?: string;
  creationIds: string[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Prompt Types
// ============================================

export interface CreationPrompt {
  id: string;
  title: string;
  content: string;
  type: CreationType;
  category: string;
  tags: string[];
  exampleImages?: string[];
  usageCount: number;
  isPublic: boolean;
  isFavorite: boolean;
  createdBy: string;
  createdAt: string;
}

// ============================================
// Task Types
// ============================================

export interface CreationTask {
  id: string;
  creationId: string;
  type: CreationType;
  status: CreationStatus;
  progress: number;
  queuePosition?: number;
  estimatedTime?: number;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Filter Types
// ============================================

export interface CreationFilter {
  type?: CreationType;
  status?: CreationStatus;
  dateRange?: { start: string; end: string };
  isPublic?: boolean;
  isFavorite?: boolean;
  tags?: string[];
  sortBy?: 'newest' | 'oldest' | 'popular' | 'most_liked';
}

export interface CreateCreationRequest {
  type: CreationType;
  title: string;
  prompt: string;
  description?: string;
  negativePrompt?: string;
  params?: CreationParams;
  tags?: string[];
  isPublic?: boolean;
}

export interface ICreationService {
  initialize(): Promise<void>;
  getCreations(filter?: CreationFilter): Promise<Creation[]>;
  getCreationById(id: string): Promise<Creation | null>;
  createCreation(params: CreateCreationRequest): Promise<Creation>;
  deleteCreation(id: string): Promise<void>;
  toggleFavorite(id: string): Promise<boolean>;
  getFavorites(): Promise<Creation[]>;
  getStyles(type?: CreationType): Promise<CreationStyle[]>;
  getPrompts(type?: CreationType): Promise<CreationPrompt[]>;
  usePrompt(promptId: string): Promise<void>;
  onCreationUpdated(handler: (creation: Creation) => void): () => void;
  onCreationDeleted(handler: (creationId: string) => void): () => void;
}
