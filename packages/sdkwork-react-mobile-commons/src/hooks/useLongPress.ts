import { useRef, useCallback } from 'react';

interface LongPressOptions {
    onLongPress: (e: React.TouchEvent | React.MouseEvent) => void;
    onClick?: (e: React.TouchEvent | React.MouseEvent) => void;
    delay?: number;
    vibrate?: boolean;
}

export const useLongPress = ({ 
    onLongPress, 
    onClick, 
    delay = 600, 
    vibrate = true 
}: LongPressOptions) => {
    const timerRef = useRef<any>(null);
    const isLongPress = useRef(false);
    const startPos = useRef({ x: 0, y: 0 });

    const start = useCallback((e: React.TouchEvent | React.MouseEvent) => {
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
        startPos.current = { x: clientX, y: clientY };

        isLongPress.current = false;
        timerRef.current = setTimeout(() => {
            isLongPress.current = true;
            if (vibrate && navigator.vibrate) navigator.vibrate(20);
            onLongPress(e);
        }, delay);
    }, [onLongPress, delay, vibrate]);

    const move = useCallback((e: React.TouchEvent | React.MouseEvent) => {
        if (!timerRef.current) return;

        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
        
        const moveThreshold = 10;
        if (
            Math.abs(clientX - startPos.current.x) > moveThreshold || 
            Math.abs(clientY - startPos.current.y) > moveThreshold
        ) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    const clear = useCallback((e: React.TouchEvent | React.MouseEvent) => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
        
        if (!isLongPress.current && onClick) {
            onClick(e);
        }
    }, [onClick]);

    return {
        onTouchStart: start,
        onTouchEnd: clear,
        onTouchMove: move,
        onMouseDown: start,
        onMouseUp: clear,
        onMouseLeave: clear
    };
};
