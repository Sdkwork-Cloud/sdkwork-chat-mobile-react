import React from 'react';
import { navigate } from '../router';
import { NoticeBar } from '../components/NoticeBar/NoticeBar';
import { Swiper } from '../components/Swiper/Swiper';
import { Widget } from '../components/Widget/Widget';
import { ROUTE_PATHS, type RoutePath } from '../router/paths';

interface ServiceItem {
  label: string;
  badge: string;
  path: RoutePath;
  color: string;
}

const SERVICE_ITEMS: ServiceItem[] = [
  { label: 'Moments', badge: 'MO', path: ROUTE_PATHS.moments, color: '#4080ff' },
  { label: 'Video', badge: 'VI', path: ROUTE_PATHS.video, color: '#ff9c6e' },
  { label: 'Nearby', badge: 'NE', path: ROUTE_PATHS.nearby, color: '#4ecdc4' },
  { label: 'Shopping', badge: 'SH', path: ROUTE_PATHS.shopping, color: '#ff8c42' },
  { label: 'Scan', badge: 'SC', path: ROUTE_PATHS.scan, color: '#2979ff' },
  { label: 'Search', badge: 'SE', path: ROUTE_PATHS.search, color: '#ffc300' },
  { label: 'App Center', badge: 'AP', path: ROUTE_PATHS.app, color: '#00b894' },
  { label: 'Skills', badge: 'SK', path: ROUTE_PATHS.skills, color: '#6c5ce7' },
];

const BANNERS = [
  { id: 'discover', title: 'Discover New Content', color: '#667eea' },
  { id: 'explore', title: 'Explore More Experiences', color: '#764ba2' },
  { id: 'connect', title: 'Connect People and Ideas', color: '#f093fb' },
];

const ARTICLES = [
  {
    id: 'a1',
    title: 'Five Principles for AI-Collaboration Product Design',
    summary: 'A practical checklist from visual hierarchy to interaction feedback for mobile products.',
  },
  {
    id: 'a2',
    title: 'From Chat to Workflow: Agent-Driven Mobile Architecture',
    summary: 'How to split packages and define contracts for scalable feature iteration.',
  },
  {
    id: 'a3',
    title: 'Mobile Chat Performance Checklist',
    summary: 'Input latency, list rendering, media lifecycle, and state sync optimization points.',
  },
];

const ServiceGrid: React.FC = () => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 8,
        padding: 12,
      }}
    >
      {SERVICE_ITEMS.map((item) => (
        <button
          key={item.label}
          type="button"
          onClick={() => navigate(item.path)}
          style={{
            background: 'transparent',
            border: 'none',
            textAlign: 'center',
            padding: '12px 0',
            cursor: 'pointer',
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: item.color,
              width: 48,
              height: 48,
              borderRadius: 12,
              background: `${item.color}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 6px',
            }}
          >
            {item.badge}
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-primary)' }}>{item.label}</span>
        </button>
      ))}
    </div>
  );
};

const BannerSwiper: React.FC = () => {
  return (
    <div style={{ padding: '0 12px', marginBottom: 12 }}>
      <Swiper autoplay loop>
        {BANNERS.map((banner) => (
          <div
            key={banner.id}
            style={{
              height: 120,
              background: `linear-gradient(135deg, ${banner.color}, ${banner.color}88)`,
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: 18,
              fontWeight: 600,
            }}
          >
            {banner.title}
          </div>
        ))}
      </Swiper>
    </div>
  );
};

const ArticleList: React.FC = () => {
  return (
    <div style={{ padding: '0 12px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
          padding: '8px 0',
        }}
      >
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Featured Articles</h3>
        <button
          type="button"
          onClick={() => navigate(ROUTE_PATHS.content)}
          style={{
            fontSize: 13,
            color: 'var(--primary-color)',
            cursor: 'pointer',
            border: 'none',
            background: 'transparent',
            padding: 0,
          }}
        >
          View All
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {ARTICLES.map((article) => (
          <button
            key={article.id}
            type="button"
            onClick={() => navigate(ROUTE_PATHS.articleDetail, { id: article.id })}
            style={{
              textAlign: 'left',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-card)',
              borderRadius: 12,
              padding: '12px 14px',
              cursor: 'pointer',
            }}
          >
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
              {article.title}
            </div>
            <div style={{ fontSize: 12, lineHeight: 1.6, color: 'var(--text-secondary)' }}>
              {article.summary}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

const SearchHeader: React.FC = () => {
  return (
    <button
      type="button"
      onClick={() => navigate(ROUTE_PATHS.search)}
      style={{
        width: '100%',
        textAlign: 'left',
        padding: '12px 16px',
        background: 'var(--bg-card)',
        border: 'none',
        borderBottom: '0.5px solid var(--border-color)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        cursor: 'pointer',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '8px 12px',
          background: 'var(--bg-body)',
          borderRadius: 8,
          color: 'var(--text-secondary)',
          fontSize: 13,
          gap: 8,
        }}
      >
        <span>Search</span>
      </div>
    </button>
  );
};

const DiscoverPage: React.FC = () => {
  return (
    <div style={{ minHeight: '100%', background: 'var(--bg-body)' }}>
      <SearchHeader />
      <div style={{ padding: '8px 12px' }}>
        <NoticeBar text="Welcome to the Discover page. More high-quality content is on the way." scrollable />
      </div>
      <BannerSwiper />
      <Widget title="Services">
        <ServiceGrid />
      </Widget>
      <Widget title="Recommended">
        <ArticleList />
      </Widget>
    </div>
  );
};

export default DiscoverPage;
