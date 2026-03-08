export type FavoriteType = 'link' | 'file' | 'doc' | 'chat' | 'text' | 'image' | 'video';

export interface FavoriteItem {
  id: string;
  createTime: number;
  updateTime: number;
  title?: string;
  type: FavoriteType;
  content?: string;
  url?: string;
  source?: string;
  size?: string;
  tags?: string[];
}

export interface FavoritesState {
  favorites: FavoriteItem[];
  isLoading: boolean;
  error: string | null;
}

export type SocialEventType = 'social:favorite_added' | 'social:favorite_removed';

export interface SocialEventPayload {
  'social:favorite_added': { favorite: FavoriteItem };
  'social:favorite_removed': { favoriteId: string };
}

export interface IFavoritesService {
  getFavorites(category: string, keyword?: string): Promise<FavoriteItem[]>;
  addFavorite(item: Partial<FavoriteItem>): Promise<FavoriteItem>;
  removeFavorite(id: string): Promise<void>;
}
