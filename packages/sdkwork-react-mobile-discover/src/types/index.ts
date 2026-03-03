import type { BaseEntity } from '@sdkwork/react-mobile-core';

export interface DiscoverItem extends BaseEntity {
  title: string;
  icon: string;
  path: string;
  color: string;
  bgColor: string;
}

export interface DiscoverState {
  items: DiscoverItem[];
  isLoading: boolean;
  error: string | null;
}

export interface IDiscoverService {
  getDiscoverItems(): Promise<DiscoverItem[]>;
}
