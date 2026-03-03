
import React, { useRef, useState, useEffect } from 'react';
import { navigate } from '../../router';
import { Platform } from '../../platform';
import { ActionSheet } from '../ActionSheet';
import { openOmniChat } from '../../navigation/openChatNavigation';

export const FloatingBall: React.FC = () => {
    const TABBAR_RESERVED_HEIGHT = 96;
    const BALL_SIZE = 50;

    const getBounds = () => {
        const maxY = window.innerHeight - TABBAR_RESERVED_HEIGHT - BALL_SIZE;
        return {
            minX: 0,
            maxX: window.innerWidth - BALL_SIZE,
            minY: 60,
            maxY: Math.max(60, maxY)
        };
    };

    const clampPosition = (x: number, y: number) => {
        const bounds = getBounds();
        return {
            x: Math.max(bounds.minX, Math.min(x, bounds.maxX)),
            y: Math.max(bounds.minY, Math.min(y, bounds.maxY))
        };
    };

    const ballRef = useRef<HTMLDivElement>(null);
    const [pos, setPos] = useState(() => clampPosition(window.innerWidth - 60, window.innerHeight - 220));
    const [isDragging, setIsDragging] = useState(false);
    const [opacity, setOpacity] = useState(0.8);
    const offset = useRef({ x: 0, y: 0 });
    const idleTimer = useRef<any>(null);
    const moveRafRef = useRef<number | null>(null);
    const nextPosRef = useRef(pos);
    const dragStartPoint = useRef({ x: 0, y: 0 });
    const didMove = useRef(false);
    const suppressClick = useRef(false);

    const schedulePosition = (next: { x: number; y: number }) => {
        nextPosRef.current = next;
        if (moveRafRef.current !== null) return;
        moveRafRef.current = requestAnimationFrame(() => {
            setPos(nextPosRef.current);
            moveRafRef.current = null;
        });
    };

    // Initial positioning safe area check
    useEffect(() => {
        setPos(clampPosition(window.innerWidth - 60, window.innerHeight - 220));
        resetIdleTimer();

        const handleResize = () => {
            setPos((prev) => clampPosition(prev.x, prev.y));
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            if (moveRafRef.current !== null) {
                cancelAnimationFrame(moveRafRef.current);
                moveRafRef.current = null;
            }
        };
    }, []);

    const resetIdleTimer = () => {
        setOpacity(1);
        if (idleTimer.current) clearTimeout(idleTimer.current);
        idleTimer.current = setTimeout(() => {
            setOpacity(0.5); // Fade out when idle
        }, 3000);
    };

    const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
        setIsDragging(true);
        resetIdleTimer();
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
        dragStartPoint.current = { x: clientX, y: clientY };
        didMove.current = false;
        offset.current = {
            x: clientX - pos.x,
            y: clientY - pos.y
        };
        // Disable transition during drag
        if (ballRef.current) ballRef.current.style.transition = 'none';
    };

    const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
        if (!isDragging) return;
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
        const deltaX = clientX - dragStartPoint.current.x;
        const deltaY = clientY - dragStartPoint.current.y;
        if (Math.abs(deltaX) > 6 || Math.abs(deltaY) > 6) {
            didMove.current = true;
        }
        
        let newX = clientX - offset.current.x;
        let newY = clientY - offset.current.y;
        
        schedulePosition(clampPosition(newX, newY));
    };

    const handleTouchEnd = () => {
        suppressClick.current = didMove.current;
        setIsDragging(false);
        if (ballRef.current) ballRef.current.style.transition = 'all 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28)';

        // Snap to edge
        const mid = window.innerWidth / 2;
        const snapX = pos.x < mid ? 8 : window.innerWidth - 58;
        setPos(p => ({ ...p, x: snapX }));
        
        resetIdleTimer();
    };

    const handleQuickAction = async (key: string) => {
        switch(key) {
            case 'chat':
                await openOmniChat();
                break;
            case 'agents':
                navigate('/agents');
                break;
            case 'creation':
                navigate('/creation');
                break;
            case 'scan':
                navigate('/scan');
                break;
            case 'search':
                navigate('/search');
                break;
        }
    };

    const handleClick = async () => {
        if (isDragging || suppressClick.current) {
            suppressClick.current = false;
            return;
        }
        try {
            Platform.device.vibrate(10);
        } catch (_error) {
            // Keep quick menu available even if haptics are unsupported.
        }
        
        // Show Quick Menu via Global ActionSheet
        ActionSheet.showActions({
            title: "OpenChat AI 助手",
            actions: [
                { text: 'Quick Chat', key: 'chat', color: '#2979FF' },
                { text: 'Agent Hub', key: 'agents', color: '#7a5bff' },
                { text: 'Create Studio', key: 'creation', color: '#FF9C6E' },
                { text: '📷 拍照识别', key: 'scan', color: '#07c160' },
                { text: '🔍 全局搜索', key: 'search' }
            ]
        }).then(item => {
            if (!item) return;
            handleQuickAction(item.key);
        });
    };

    return (
        <div 
            ref={ballRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleTouchStart}
            onMouseMove={handleTouchMove}
            onMouseUp={handleTouchEnd}
            onMouseLeave={handleTouchEnd}
            onClick={handleClick}
            style={{
                position: 'fixed',
                left: pos.x,
                top: pos.y,
                width: `${BALL_SIZE}px`,
                height: `${BALL_SIZE}px`,
                borderRadius: '50%',
                background: 'rgba(22, 27, 34, 0.84)',
                backdropFilter: 'blur(6px)',
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.16), inset 0 1px 1px rgba(255,255,255,0.14)',
                zIndex: 600, // Keep below tabbar to avoid blocking tab switching
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                opacity: opacity,
                transition: isDragging ? 'none' : 'opacity 0.3s',
                touchAction: 'none', // Important for drag
                willChange: 'transform, opacity',
            }}
        >
            <div style={{ fontSize: '24px' }}>🤖</div>
            {/* Status Dot */}
            <div style={{ position: 'absolute', top: 12, right: 10, width: '8px', height: '8px', background: '#07c160', borderRadius: '50%', border: '1px solid #333' }} />
        </div>
    );
};
