
import { useState, useCallback } from 'react';
import { chatService } from '../services/ChatService';
import { Toast } from '@sdkwork/react-mobile-commons';

interface UseChatSelectionOptions {
    sessionId: string | undefined;
    t?: (key: string) => string;
    onForward?: (messageIds: string[]) => void;
    onDeleteComplete?: () => void;
}

export const useChatSelection = (options: UseChatSelectionOptions) => {
    const { sessionId, t, onForward, onDeleteComplete } = options;
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const tr = useCallback(
        (key: string, fallback: string) => {
            const value = t?.(key);
            if (value && value !== key) return value;
            return fallback;
        },
        [t]
    );
    const format = useCallback((template: string, params: Record<string, string>) => {
        return Object.entries(params).reduce((result, [param, value]) => result.replace(`{${param}}`, value), template);
    }, []);

    const toggleSelection = useCallback((id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    const enterSelectionMode = useCallback((initialId?: string) => {
        setSelectionMode(true);
        if (initialId) setSelectedIds(new Set([initialId]));
    }, []);

    const exitSelectionMode = useCallback(() => {
        setSelectionMode(false);
        setSelectedIds(new Set());
    }, []);

    const deleteSelected = async () => {
        if (!sessionId || selectedIds.size === 0) return;
        const confirmText = format(
            tr('chat.selection_confirm_delete', 'Delete {count} selected messages?'),
            { count: String(selectedIds.size) }
        );
        if (window.confirm(confirmText)) {
            await chatService.deleteMessages(sessionId, Array.from(selectedIds));
            exitSelectionMode();
            Toast.success(tr('chat.selection_deleted', 'Deleted'));
            onDeleteComplete?.();
        }
    };

    const forwardSelected = () => {
        if (selectedIds.size === 0) return;
        onForward?.(Array.from(selectedIds));
        exitSelectionMode();
    };

    return {
        selectionMode,
        selectedIds,
        toggleSelection,
        enterSelectionMode,
        exitSelectionMode,
        deleteSelected,
        forwardSelected
    };
};
