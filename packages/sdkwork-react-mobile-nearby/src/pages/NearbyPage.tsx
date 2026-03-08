import React from 'react';
import { Icon, Navbar } from '@sdkwork/react-mobile-commons';

interface NearbyPageProps {
  t?: (key: string) => string;
  onBack?: () => void;
  onLocationSelect?: (id: string) => void;
}

interface NearbyCategory {
  key: string;
  titleKey: string;
  fallbackTitle: string;
  icon: string;
}

interface NearbyPlace {
  id: string;
  name: string;
  categoryKey: string;
  categoryFallback: string;
  distance: string;
  rating: number;
  address: string;
}

const CATEGORIES: NearbyCategory[] = [
  { key: 'all', titleKey: 'nearby.category.all', fallbackTitle: '\u5168\u90e8', icon: 'location' },
  { key: 'food', titleKey: 'nearby.category.food', fallbackTitle: '\u7f8e\u98df', icon: 'utensils' },
  { key: 'work', titleKey: 'nearby.category.work', fallbackTitle: '\u529e\u516c', icon: 'briefcase' },
  { key: 'life', titleKey: 'nearby.category.life', fallbackTitle: '\u751f\u6d3b', icon: 'coffee' },
];

const PLACES: NearbyPlace[] = [
  {
    id: 'nearby-1',
    name: 'OpenHub \u5171\u4eab\u5de5\u4f5c\u5ba4',
    categoryKey: 'nearby.category.work',
    categoryFallback: '\u529e\u516c',
    distance: '350m',
    rating: 4.8,
    address: '\u4e2d\u5173\u6751\u4e1c\u8def 12 \u53f7',
  },
  {
    id: 'nearby-2',
    name: '\u667a\u80fd\u5bb6\u5ead\u4f53\u9a8c\u5e97',
    categoryKey: 'nearby.category.life',
    categoryFallback: '\u751f\u6d3b',
    distance: '620m',
    rating: 4.7,
    address: '\u5efa\u56fd\u95e8\u5916\u5927\u8857 88 \u53f7',
  },
  {
    id: 'nearby-3',
    name: 'Cloud Cafe',
    categoryKey: 'nearby.category.food',
    categoryFallback: '\u7f8e\u98df',
    distance: '900m',
    rating: 4.9,
    address: '\u671d\u9633\u8def 101 \u53f7',
  },
];

export const NearbyPage: React.FC<NearbyPageProps> = ({ t, onBack, onLocationSelect }) => {
  const tr = React.useCallback(
    (key: string, fallback: string) => {
      const value = t?.(key) ?? key;
      return value === key ? fallback : value;
    },
    [t]
  );

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      <Navbar title={tr('nearby.title', '\u9644\u8fd1')} onBack={onBack} />

      <div className="p-3">
        <div className="rounded-2xl bg-white dark:bg-gray-800 p-4 mb-3">
          <div className="text-sm text-gray-500 dark:text-gray-400">{tr('nearby.location', '\u5f53\u524d\u4f4d\u7f6e')}</div>
          <div className="text-base font-semibold text-gray-900 dark:text-white mt-1">
            \u671d\u9633\u533a \u4e09\u91cc\u5c6f
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {tr('nearby.hint', '\u4e3a\u4f60\u63a8\u8350 2km \u5185\u7684\u70ed\u95e8\u573a\u6240')}
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-2">
          {CATEGORIES.map((category) => (
            <button
              key={category.key}
              type="button"
              className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 whitespace-nowrap border border-gray-100 dark:border-gray-700"
            >
              <Icon name={category.icon} size={14} />
              <span className="text-xs">{tr(category.titleKey, category.fallbackTitle)}</span>
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {PLACES.map((place) => (
            <button
              key={place.id}
              type="button"
              onClick={() => onLocationSelect?.(place.id)}
              className="w-full text-left rounded-2xl bg-white dark:bg-gray-800 p-4 border border-gray-100 dark:border-gray-700"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">{place.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {tr(place.categoryKey, place.categoryFallback)} | {place.distance}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">{place.address}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-semibold text-amber-500">{place.rating.toFixed(1)}</div>
                  <Icon name="arrow-right" size={14} className="mt-1 text-gray-400" />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NearbyPage;
