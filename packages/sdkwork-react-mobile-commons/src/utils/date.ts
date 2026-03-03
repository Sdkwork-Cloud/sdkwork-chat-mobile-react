export const DateUtils = {
    formatRelative: (timestamp: number): string => {
        if (!timestamp) return '';
        const now = new Date();
        const date = new Date(timestamp);
        
        if (isNaN(date.getTime())) return '';

        const diffMs = now.getTime() - date.getTime();
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHour = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHour / 24);

        if (date.toDateString() === now.toDateString()) {
            return date.getHours().toString().padStart(2, '0') + ':' + date.getMinutes().toString().padStart(2, '0');
        }

        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        if (date.toDateString() === yesterday.toDateString()) {
            return '昨天';
        }

        if (diffDay < 7) {
            const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
            return weekDays[date.getDay()];
        }

        if (date.getFullYear() === now.getFullYear()) {
            return (date.getMonth() + 1) + '/' + date.getDate();
        }

        return date.getFullYear().toString().slice(-2) + '/' + (date.getMonth() + 1) + '/' + date.getDate();
    },

    formatMessageTime: (timestamp: number): string => {
        const date = new Date(timestamp);
        const now = new Date();
        const timeStr = date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });
        
        if (date.toDateString() === now.toDateString()) {
            return timeStr;
        }
        
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        if (date.toDateString() === yesterday.toDateString()) {
            return `昨天 ${timeStr}`;
        }
        
        const yearStr = date.getFullYear() === now.getFullYear() ? '' : `${date.getFullYear()}年`;
        return `${yearStr}${date.getMonth() + 1}月${date.getDate()}日 ${timeStr}`;
    },

    formatTimeAgo: (timestamp: number): string => {
        const diff = Date.now() - timestamp;
        const min = 60 * 1000;
        const hour = 60 * min;
        const day = 24 * hour;

        if (diff < min) return '刚刚';
        if (diff < hour) return `${Math.floor(diff / min)}分钟前`;
        if (diff < day) return `${Math.floor(diff / hour)}小时前`;
        if (diff < day * 3) return `${Math.floor(diff / day)}天前`;
        
        return DateUtils.formatRelative(timestamp);
    }
};
