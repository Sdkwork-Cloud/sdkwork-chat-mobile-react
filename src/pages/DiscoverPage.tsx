
import React from 'react';
import { navigate } from '../router';
import { Swiper } from '../components/Swiper/Swiper';
import { Widget } from '../components/Widget/Widget';
import { NoticeBar } from '../components/NoticeBar/NoticeBar';

// --- Components ---

const ServiceGrid = () => {
    const services = [
        { label: '朋友圈', icon: '🌈', path: '/moments', color: '#4080ff' },
        { label: '视频号', icon: '🎬', path: '/video-channel', color: '#FF9C6E' },
        { label: '直播', icon: '📺', path: '/live', color: '#FF6B6B' },
        { label: '附近', icon: '📍', path: '/nearby', color: '#4ECDC4' },
        { label: '购物', icon: '🛍️', path: '/mall', color: '#FF8C42' },
        { label: '游戏', icon: '🎮', path: '/games', color: '#6C5CE7' },
        { label: '小程序', icon: '📱', path: '/mini-apps', color: '#00B894' },
        { label: '更多', icon: '➕', path: '/more', color: '#74B9FF' },
    ];

    return (
        <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 8,
            padding: 12 
        }}>
            {services.map((s) => (
                <div 
                    key={s.label}
                    onClick={() => navigate(s.path)}
                    style={{ textAlign: 'center', padding: '12px 0', cursor: 'pointer' }}
                >
                    <div style={{ 
                        fontSize: 28, 
                        marginBottom: 6,
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        background: s.color + '20',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 6px'
                    }}>
                        {s.icon}
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--text-primary)' }}>{s.label}</span>
                </div>
            ))}
        </div>
    );
};

const BannerSwiper = () => {
    const banners = [
        { id: 1, title: '发现精彩内容', color: '#667eea' },
        { id: 2, title: '探索新世界', color: '#764ba2' },
        { id: 3, title: '连接每个人', color: '#f093fb' },
    ];

    return (
        <div style={{ padding: '0 12px', marginBottom: 12 }}>
            <Swiper autoplay loop>
                {banners.map(banner => (
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
                            fontWeight: 600
                        }}
                    >
                        {banner.title}
                    </div>
                ))}
            </Swiper>
        </div>
    );
};

const ArticleList = () => {
    const articles = [
        { id: 'a1', title: 'AI 协作设计系统的 5 个落地原则', summary: '从视觉、交互到性能，构建可持续迭代的移动端产品体验。' },
        { id: 'a2', title: '从会话到工作流：智能体产品架构实践', summary: '如何在高内聚低耦合的分包架构下，搭建可复用对话能力。' },
        { id: 'a3', title: '移动端聊天页性能优化清单', summary: '输入、列表、媒体预览与状态同步的关键优化策略。' },
    ];

    return (
        <div style={{ padding: '0 12px' }}>
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: 12,
                padding: '8px 0'
            }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>热门文章</h3>
                <span 
                    onClick={() => navigate('/content')}
                    style={{ fontSize: 13, color: 'var(--primary-color)', cursor: 'pointer' }}
                >
                    查看更多
                </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {articles.map((article) => (
                    <button
                        key={article.id}
                        type="button"
                        onClick={() => navigate('/article/detail', { id: article.id })}
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

const SearchHeader = () => {
    return (
        <div 
            onClick={() => navigate('/search')}
            style={{ 
                padding: '12px 16px', 
                background: 'var(--bg-card)',
                borderBottom: '0.5px solid var(--border-color)',
                position: 'sticky',
                top: 0,
                zIndex: 100,
                cursor: 'pointer'
            }}
        >
            <div style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 12px',
                background: 'var(--bg-body)',
                borderRadius: 8,
                color: 'var(--text-secondary)'
            }}>
                <span style={{ marginRight: 8 }}>🔍</span>
                <span>搜索发现</span>
            </div>
        </div>
    );
};

// --- Main Page ---

const DiscoverPage: React.FC = () => {
    return (
        <div style={{ minHeight: '100%', background: 'var(--bg-body)' }}>
            {/* Header */}
            <SearchHeader />

            {/* Notice */}
            <div style={{ padding: '8px 12px' }}>
                <NoticeBar 
                    text="🎉 欢迎体验新版发现页，更多精彩内容等你探索！"
                    scrollable
                />
            </div>

            {/* Banner */}
            <BannerSwiper />

            {/* Services */}
            <Widget title="服务">
                <ServiceGrid />
            </Widget>

            {/* Articles */}
            <Widget title="推荐内容">
                <ArticleList />
            </Widget>
        </div>
    );
};

export default DiscoverPage;
