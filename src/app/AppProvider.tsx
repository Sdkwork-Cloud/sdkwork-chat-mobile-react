
import React, { ReactNode } from 'react';
import { ChatStoreProvider } from '../stores/chatStore';
import { ThemeProvider } from '../theme/themeContext';
import { AuthProvider } from '../contexts/AuthContext';
import { I18nProvider } from '../core/i18n/I18nContext';

interface AppProviderProps {
  children: ReactNode;
}

const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  return (
    <I18nProvider>
      <ThemeProvider>
        <AuthProvider>
          <ChatStoreProvider>
            {children}
          </ChatStoreProvider>
        </AuthProvider>
      </ThemeProvider>
    </I18nProvider>
  );
};

export default AppProvider;
