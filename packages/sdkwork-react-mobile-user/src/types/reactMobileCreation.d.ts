declare module '@sdkwork/react-mobile-creation' {
  export type CreationType = 'image' | 'video' | 'music' | 'text' | 'short_drama' | 'collection';

  export interface CreationResult {
    url: string;
    thumbnailUrl?: string;
  }

  export interface Creation {
    id: string;
    type: CreationType;
    title: string;
    description?: string;
    prompt: string;
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
    progress: number;
    result?: CreationResult;
    params: Record<string, unknown>;
    tags: string[];
    isPublic: boolean;
    isFavorite: boolean;
    viewCount: number;
    likeCount: number;
    userId: string;
    userName: string;
    createdAt: string;
    updatedAt: string;
  }

  export interface CreationFilter {
    type?: CreationType;
    sortBy?: 'newest' | 'oldest' | 'popular' | 'most_liked';
  }

  export interface CreationService {
    initialize(): Promise<void>;
    getCreations(filter?: CreationFilter): Promise<Creation[]>;
    deleteCreation(id: string): Promise<void>;
  }

  export const creationService: CreationService;
}
