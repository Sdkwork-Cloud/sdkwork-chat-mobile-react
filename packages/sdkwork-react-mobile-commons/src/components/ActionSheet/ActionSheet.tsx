import React from 'react';
import { Popup } from '../Popup';

interface ActionSheetProps {
    visible: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title?: React.ReactNode;
    height?: string | number; 
    zIndex?: number;
}

export const ActionSheet: React.FC<ActionSheetProps> & {
    showActions: (options: { 
        title?: string; 
        actions: Array<{ text: string; key?: string; color?: string; disabled?: boolean }>;
        cancelText?: string;
    }) => Promise<{ text: string; key?: string; color?: string; disabled?: boolean } | null>;
} = ({ 
    visible, 
    onClose, 
    children, 
    title,
    height,
    zIndex
}) => {
    return (
        <Popup 
            visible={visible} 
            onClose={onClose} 
            position="bottom" 
            round 
            zIndex={zIndex}
            style={{ height: height }}
        >
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', maxHeight: 'inherit' }}>
                <div style={{ width: '100%', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <div style={{ width: '36px', height: '4px', borderRadius: '2px', background: 'var(--border-color)', opacity: 0.6 }} />
                </div>

                {title && (
                    <div style={{ 
                        padding: '0 20px 16px 20px', 
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        borderBottom: '0.5px solid var(--border-color)',
                        fontSize: '17px', fontWeight: 600,
                        color: 'var(--text-primary)',
                        flexShrink: 0
                    }}>
                        <div style={{flex: 1}}>{title}</div>
                        <div 
                            onClick={onClose} 
                            style={{ 
                                padding: '4px', cursor: 'pointer', 
                                background: 'var(--bg-body)', borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                width: '28px', height: '28px', marginLeft: '12px'
                            }}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </div>
                    </div>
                )}
                
                <div style={{ flex: 1, overflowY: 'auto', overscrollBehavior: 'contain' }}>
                    {children}
                </div>
            </div>
        </Popup>
    );
};

interface ActionSheetAction {
    text: string;
    key?: string;
    color?: string;
    disabled?: boolean;
}

const resolveDefaultCancelText = (): string => {
    const htmlLang = (document.documentElement.lang || '').toLowerCase();
    const navLang = (navigator.language || '').toLowerCase();
    const lang = htmlLang || navLang;
    return lang.startsWith('en') ? 'Cancel' : '取消';
};

let actionSheetResolver: ((value: ActionSheetAction | null) => void) | null = null;
let currentActions: ActionSheetAction[] = [];
let currentTitle: string = '';
let currentCancelText: string = resolveDefaultCancelText();
let actionSheetVisible = false;
let actionSheetListeners: Array<() => void> = [];

const notifyListeners = () => {
    actionSheetListeners.forEach(l => l());
};

export const ActionSheetContainer: React.FC = () => {
    const [, forceUpdate] = React.useReducer(x => x + 1, 0);
    
    React.useEffect(() => {
        actionSheetListeners.push(forceUpdate);
        return () => {
            actionSheetListeners = actionSheetListeners.filter(l => l !== forceUpdate);
        };
    }, []);

    const handleActionClick = (action: ActionSheetAction) => {
        actionSheetVisible = false;
        actionSheetResolver?.(action);
        notifyListeners();
    };

    const handleClose = () => {
        actionSheetVisible = false;
        actionSheetResolver?.(null);
        notifyListeners();
    };

    if (!actionSheetVisible) return null;

    return (
        <ActionSheet visible={actionSheetVisible} onClose={handleClose} title={currentTitle}>
            <div style={{ padding: '8px 0' }}>
                {currentActions.map((action, idx) => (
                    <div
                        key={action.key || idx}
                        onClick={() => !action.disabled && handleActionClick(action)}
                        style={{
                            padding: '16px 20px',
                            textAlign: 'center',
                            fontSize: '17px',
                            color: action.color || 'var(--text-primary)',
                            cursor: action.disabled ? 'not-allowed' : 'pointer',
                            opacity: action.disabled ? 0.5 : 1,
                            borderBottom: idx < currentActions.length - 1 ? '0.5px solid var(--border-color)' : 'none'
                        }}
                    >
                        {action.text}
                    </div>
                ))}
                <div style={{ height: '8px', background: 'var(--bg-body)' }} />
                <div
                    onClick={handleClose}
                    style={{
                        padding: '16px 20px',
                        textAlign: 'center',
                        fontSize: '17px',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        fontWeight: 600
                    }}
                >
                    {currentCancelText}
                </div>
            </div>
        </ActionSheet>
    );
};

ActionSheet.showActions = async (options: { 
    title?: string; 
    actions: ActionSheetAction[];
    cancelText?: string;
}): Promise<ActionSheetAction | null> => {
    currentTitle = options.title || '';
    currentActions = options.actions;
    currentCancelText = options.cancelText || resolveDefaultCancelText();
    actionSheetVisible = true;
    notifyListeners();
    
    return new Promise((resolve) => {
        actionSheetResolver = resolve;
    });
};
