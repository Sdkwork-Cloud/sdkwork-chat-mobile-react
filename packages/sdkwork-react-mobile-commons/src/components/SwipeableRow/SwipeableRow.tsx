import React, { useState, useRef, useEffect, ReactNode, useCallback } from 'react';

export interface Action {
    text: string;
    color: string;
    onClick: () => void;
    width?: number;
}

interface SwipeableRowProps {
    children: ReactNode;
    rightActions: Action[];
    onOpen?: () => void;
    onClose?: () => void;
    disabled?: boolean;
    className?: string;
    style?: React.CSSProperties;
    onBodyClick?: () => void;
    contentBackground?: string;
}

const SWIPE_OPEN_EVENT = 'swipe-row-open';
const swipeBus = new EventTarget();

export const SwipeableRow: React.FC<SwipeableRowProps> = ({ 
    children, 
    rightActions, 
    onOpen, 
    onClose, 
    disabled = false,
    className = '',
    style,
    onBodyClick,
    contentBackground = 'var(--bg-card)'
}) => {
    const [offset, setOffset] = useState(0);
    const startX = useRef(0);
    const startY = useRef(0);
    const isDragging = useRef(false);
    const isScrolling = useRef(false);
    const isPointerDown = useRef(false);
    const currentOffset = useRef(0);
    const liveOffsetRef = useRef(0);
    const pendingOffsetRef = useRef<number | null>(null);
    const rafRef = useRef<number | null>(null);
    const dragStartOffset = useRef(0);
    const rowId = useRef(Math.random().toString(36).slice(2));
    const rootRef = useRef<HTMLDivElement>(null);

    const totalActionWidth = rightActions.reduce((acc, action) => acc + (action.width || 70), 0);
    const maxSwipe = -totalActionWidth;
    const actionsVisible = offset < -0.5;

    const commitOffset = useCallback((nextOffset: number) => {
        liveOffsetRef.current = nextOffset;
        setOffset(nextOffset);
    }, []);

    const flushPendingOffset = useCallback(() => {
        if (pendingOffsetRef.current === null) return;
        const nextOffset = pendingOffsetRef.current;
        pendingOffsetRef.current = null;
        commitOffset(nextOffset);
    }, [commitOffset]);

    const scheduleOffset = useCallback((nextOffset: number) => {
        pendingOffsetRef.current = nextOffset;
        liveOffsetRef.current = nextOffset;
        if (rafRef.current !== null) return;
        rafRef.current = requestAnimationFrame(() => {
            rafRef.current = null;
            flushPendingOffset();
        });
    }, [flushPendingOffset]);

    const closeRow = useCallback(() => {
        commitOffset(0);
        currentOffset.current = 0;
        onClose?.();
    }, [commitOffset, onClose]);

    const openRow = useCallback(() => {
        commitOffset(maxSwipe);
        currentOffset.current = maxSwipe;
        onOpen?.();
        
        if (navigator.vibrate) navigator.vibrate(10);
        
        swipeBus.dispatchEvent(new CustomEvent(SWIPE_OPEN_EVENT, { detail: rowId.current }));
    }, [commitOffset, maxSwipe, onOpen]);

    useEffect(() => {
        const handleOtherOpen = (e: Event) => {
            const detail = (e as CustomEvent).detail;
            if (detail !== rowId.current && currentOffset.current !== 0) {
                closeRow();
            }
        };

        swipeBus.addEventListener(SWIPE_OPEN_EVENT, handleOtherOpen);
        return () => {
            swipeBus.removeEventListener(SWIPE_OPEN_EVENT, handleOtherOpen);
        };
    }, [closeRow]);

    useEffect(() => {
        // Ensure row always starts and stays closed after route/lifecycle changes.
        closeRow();

        const handleForceClose = () => closeRow();
        window.addEventListener('routechange', handleForceClose as EventListener);
        window.addEventListener('tabreselect', handleForceClose as EventListener);
        document.addEventListener('visibilitychange', handleForceClose);

        return () => {
            window.removeEventListener('routechange', handleForceClose as EventListener);
            window.removeEventListener('tabreselect', handleForceClose as EventListener);
            document.removeEventListener('visibilitychange', handleForceClose);
        };
    }, [closeRow, rightActions.length]);

    useEffect(() => {
        if (offset === 0) return;

        const handleOutsidePointer = (event: MouseEvent | TouchEvent) => {
            const target = event.target as Node | null;
            if (!target) return;
            if (rootRef.current?.contains(target)) return;
            closeRow();
        };

        document.addEventListener('mousedown', handleOutsidePointer);
        document.addEventListener('touchstart', handleOutsidePointer);

        return () => {
            document.removeEventListener('mousedown', handleOutsidePointer);
            document.removeEventListener('touchstart', handleOutsidePointer);
        };
    }, [closeRow, offset]);

    useEffect(() => () => {
        if (rafRef.current !== null) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        }
        pendingOffsetRef.current = null;
    }, []);

    const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
        if (disabled) return;
        
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
        
        startX.current = clientX;
        startY.current = clientY;
        dragStartOffset.current = currentOffset.current;
        pendingOffsetRef.current = null;
        isPointerDown.current = true;
        isDragging.current = false;
        isScrolling.current = false;
    };

    const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
        if (disabled) return;
        if (!isPointerDown.current) return;

        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
        const deltaX = clientX - startX.current;
        const deltaY = clientY - startY.current;

        if (!isDragging.current && !isScrolling.current) {
            if (Math.abs(deltaY) > Math.abs(deltaX)) {
                isScrolling.current = true;
                return;
            }
            if (Math.abs(deltaX) > 5) {
                isDragging.current = true;
            }
        }

        if (isDragging.current) {
            if (e.cancelable && 'preventDefault' in e) e.preventDefault();

            let newOffset = dragStartOffset.current + deltaX;

            if (newOffset > 0) {
                newOffset = newOffset * 0.3;
            } else if (newOffset < maxSwipe) {
                const extra = newOffset - maxSwipe;
                newOffset = maxSwipe + extra * 0.4;
            }

            scheduleOffset(newOffset);
        }
    };

    const handleTouchEnd = () => {
        if (disabled) return;
        if (!isPointerDown.current) return;
        isPointerDown.current = false;

        if (isScrolling.current) {
            isDragging.current = false;
            isScrolling.current = false;
            return;
        }

        if (isDragging.current) {
            flushPendingOffset();
            const snapThreshold = maxSwipe / 2;
            const settledOffset = liveOffsetRef.current;
            
            if (settledOffset < snapThreshold) {
                openRow();
            } else {
                closeRow();
            }
            isDragging.current = false;
        }

        isScrolling.current = false;
    };

    const handleActionClick = (e: React.MouseEvent, action: Action) => {
        e.stopPropagation();
        closeRow();
        action.onClick();
    };

    const handleContentClick = () => {
        if (liveOffsetRef.current !== 0) {
            closeRow();
        } else {
            onBodyClick?.();
        }
    };

    return (
        <div
            ref={rootRef}
            className={className} 
            style={{ position: 'relative', overflow: 'hidden', width: '100%', ...style }}
        >
            <div style={{ 
                position: 'absolute', top: 0, bottom: 0, right: 0, 
                display: 'flex',
                zIndex: 0,
                visibility: actionsVisible ? 'visible' : 'hidden',
                pointerEvents: actionsVisible ? 'auto' : 'none',
            }}>
                {rightActions.map((action, idx) => (
                    <div 
                        key={idx}
                        onClick={(e) => handleActionClick(e, action)}
                        style={{
                            width: action.width || 70,
                            background: action.color,
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 600,
                            fontSize: '15px',
                            cursor: 'pointer'
                        }}
                    >
                        {action.text}
                    </div>
                ))}
            </div>

            <div
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onMouseDown={handleTouchStart}
                onMouseMove={handleTouchMove}
                onMouseUp={handleTouchEnd}
                onMouseLeave={handleTouchEnd}
                onClick={handleContentClick}
                style={{
                    position: 'relative',
                    zIndex: 1,
                    width: '100%',
                    background: contentBackground,
                    transform: `translateX(${offset}px)`,
                    transition: isDragging.current ? 'none' : 'transform 0.4s cubic-bezier(0.19, 1, 0.22, 1)',
                    willChange: 'transform'
                }}
            >
                {children}
            </div>
        </div>
    );
};
