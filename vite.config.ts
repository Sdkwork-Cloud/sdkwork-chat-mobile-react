
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react(), tailwindcss()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: [
          { find: '@', replacement: path.resolve(__dirname, '.') },
          { find: /^@sdkwork\/react-mobile-core\/im$/, replacement: path.resolve(__dirname, './packages/sdkwork-react-mobile-core/src/im/index.ts') },
          { find: '@openchat/sdkwork-im-sdk', replacement: path.resolve(__dirname, '../openchat/sdkwork-im-sdk/sdkwork-im-sdk-typescript/composed/src/index.ts') },
          { find: '@openchat/sdkwork-im-wukongim-adapter', replacement: path.resolve(__dirname, '../openchat/sdkwork-im-sdk/sdkwork-im-sdk-typescript/adapter-wukongim/src/index.ts') },
          { find: '@sdkwork/im-backend-sdk', replacement: path.resolve(__dirname, '../openchat/sdkwork-im-sdk/sdkwork-im-sdk-typescript/generated/server-openapi/src/index.ts') },
          { find: '@sdkwork/app-sdk', replacement: path.resolve(__dirname, '../../spring-ai-plus-app-api/sdkwork-sdk-app/sdkwork-app-sdk-typescript/src/index.ts') },
          { find: '@sdkwork/sdk-common', replacement: path.resolve(__dirname, '../../sdk/sdkwork-sdk-commons/sdkwork-sdk-common-typescript/src/index.ts') },
          // Sub-path exports for core package (must come before main package entry)
          { find: /^@sdkwork\/react-mobile-core\/events$/, replacement: path.resolve(__dirname, './packages/sdkwork-react-mobile-core/src/events/index.ts') },
          { find: /^@sdkwork\/react-mobile-core\/platform$/, replacement: path.resolve(__dirname, './packages/sdkwork-react-mobile-core/src/platform/index.ts') },
          { find: /^@sdkwork\/react-mobile-core\/storage$/, replacement: path.resolve(__dirname, './packages/sdkwork-react-mobile-core/src/storage/AbstractStorageService.ts') },
          { find: /^@sdkwork\/react-mobile-core\/types$/, replacement: path.resolve(__dirname, './packages/sdkwork-react-mobile-core/src/types/index.ts') },
          { find: /^@sdkwork\/react-mobile-core\/hooks$/, replacement: path.resolve(__dirname, './packages/sdkwork-react-mobile-core/src/hooks/index.ts') },
          { find: /^@sdkwork\/react-mobile-core\/utils$/, replacement: path.resolve(__dirname, './packages/sdkwork-react-mobile-core/src/utils/index.ts') },
          { find: /^@sdkwork\/react-mobile-core\/constants$/, replacement: path.resolve(__dirname, './packages/sdkwork-react-mobile-core/src/constants/index.ts') },
          // Main package entries
          { find: '@sdkwork/react-mobile-core', replacement: path.resolve(__dirname, './packages/sdkwork-react-mobile-core/src/index.ts') },
          { find: '@sdkwork/react-mobile-commons', replacement: path.resolve(__dirname, './packages/sdkwork-react-mobile-commons/src/index.ts') },
          { find: '@sdkwork/react-mobile-auth', replacement: path.resolve(__dirname, './packages/sdkwork-react-mobile-auth/src/index.ts') },
          { find: '@sdkwork/react-mobile-chat', replacement: path.resolve(__dirname, './packages/sdkwork-react-mobile-chat/src/index.ts') },
          { find: '@sdkwork/react-mobile-user', replacement: path.resolve(__dirname, './packages/sdkwork-react-mobile-user/src/index.ts') },
          { find: '@sdkwork/react-mobile-settings', replacement: path.resolve(__dirname, './packages/sdkwork-react-mobile-settings/src/index.ts') },
          { find: '@sdkwork/react-mobile-contacts', replacement: path.resolve(__dirname, './packages/sdkwork-react-mobile-contacts/src/index.ts') },
          { find: '@sdkwork/react-mobile-agents', replacement: path.resolve(__dirname, './packages/sdkwork-react-mobile-agents/src/index.ts') },
          { find: '@sdkwork/react-mobile-discover', replacement: path.resolve(__dirname, './packages/sdkwork-react-mobile-discover/src/index.ts') },
          { find: '@sdkwork/react-mobile-notification', replacement: path.resolve(__dirname, './packages/sdkwork-react-mobile-notification/src/index.ts') },
          { find: '@sdkwork/react-mobile-wallet', replacement: path.resolve(__dirname, './packages/sdkwork-react-mobile-wallet/src/index.ts') },
          { find: '@sdkwork/react-mobile-vip', replacement: path.resolve(__dirname, './packages/sdkwork-react-mobile-vip/src/index.ts') },
          { find: '@sdkwork/react-mobile-drive', replacement: path.resolve(__dirname, './packages/sdkwork-react-mobile-drive/src/index.ts') },
          { find: '@sdkwork/react-mobile-email', replacement: path.resolve(__dirname, './packages/sdkwork-react-mobile-email/src/index.ts') },
          { find: '@sdkwork/react-mobile-notes', replacement: path.resolve(__dirname, './packages/sdkwork-react-mobile-notes/src/index.ts') },
          { find: '@sdkwork/react-mobile-nearby', replacement: path.resolve(__dirname, './packages/sdkwork-react-mobile-nearby/src/index.ts') },
          { find: '@sdkwork/react-mobile-skills', replacement: path.resolve(__dirname, './packages/sdkwork-react-mobile-skills/src/index.ts') },
          { find: '@sdkwork/react-mobile-moments', replacement: path.resolve(__dirname, './packages/sdkwork-react-mobile-moments/src/index.ts') },
          { find: '@sdkwork/react-mobile-video', replacement: path.resolve(__dirname, './packages/sdkwork-react-mobile-video/src/index.ts') },
          { find: '@sdkwork/react-mobile-search', replacement: path.resolve(__dirname, './packages/sdkwork-react-mobile-search/src/index.ts') },
          { find: '@sdkwork/react-mobile-shopping', replacement: path.resolve(__dirname, './packages/sdkwork-react-mobile-shopping/src/index.ts') },
          { find: '@sdkwork/react-mobile-order-center', replacement: path.resolve(__dirname, './packages/sdkwork-react-mobile-order-center/src/index.ts') },
          { find: '@sdkwork/react-mobile-look', replacement: path.resolve(__dirname, './packages/sdkwork-react-mobile-look/src/index.ts') },
          { find: '@sdkwork/react-mobile-media', replacement: path.resolve(__dirname, './packages/sdkwork-react-mobile-media/src/index.ts') },
          { find: '@sdkwork/react-mobile-app', replacement: path.resolve(__dirname, './packages/sdkwork-react-mobile-app/src/index.ts') },
          { find: '@sdkwork/react-mobile-tools', replacement: path.resolve(__dirname, './packages/sdkwork-react-mobile-tools/src/index.ts') },
          { find: '@sdkwork/react-mobile-social', replacement: path.resolve(__dirname, './packages/sdkwork-react-mobile-social/src/index.ts') },
          { find: '@sdkwork/react-mobile-content', replacement: path.resolve(__dirname, './packages/sdkwork-react-mobile-content/src/index.ts') },
          { find: '@sdkwork/react-mobile-communication', replacement: path.resolve(__dirname, './packages/sdkwork-react-mobile-communication/src/index.ts') },
          { find: '@sdkwork/react-mobile-appointments', replacement: path.resolve(__dirname, './packages/sdkwork-react-mobile-appointments/src/index.ts') },
          { find: '@sdkwork/react-mobile-creation', replacement: path.resolve(__dirname, './packages/sdkwork-react-mobile-creation/src/index.ts') },
          { find: '@sdkwork/react-mobile-commerce', replacement: path.resolve(__dirname, './packages/sdkwork-react-mobile-commerce/src/index.ts') },
        ]
      },
      optimizeDeps: {
        include: [
          '@tiptap/react',
          '@tiptap/starter-kit',
          '@tiptap/extension-placeholder',
        ],
        exclude: [
          'backup',
        ]
      },
      build: {
        cssCodeSplit: true,
        chunkSizeWarningLimit: 700,
        rollupOptions: {
          output: {
            manualChunks(id) {
              const normalized = id.replace(/\\/g, '/');

              if (
                normalized.includes('vite/preload-helper')
                || normalized.includes('vite/modulepreload-polyfill')
              ) {
                return 'app-runtime';
              }

              if (normalized.includes('/node_modules/')) {
                return 'vendor';
              }

              if (normalized.includes('/packages/sdkwork-react-mobile-chat/')) return 'feature-chat';
              if (normalized.includes('/packages/sdkwork-react-mobile-agents/')) return 'feature-agents';
              if (normalized.includes('/packages/sdkwork-react-mobile-creation/')) return 'feature-creation';
              if (normalized.includes('/packages/sdkwork-react-mobile-discover/')) return 'feature-discover';
              if (normalized.includes('/packages/sdkwork-react-mobile-user/')) return 'feature-user';
              if (normalized.includes('/packages/sdkwork-react-mobile-settings/')) return 'feature-settings';
              if (normalized.includes('/packages/sdkwork-react-mobile-social/')) return 'feature-social';
              if (normalized.includes('/packages/sdkwork-react-mobile-wallet/')) return 'feature-wallet';
              if (normalized.includes('/packages/sdkwork-react-mobile-drive/')) return 'feature-drive';
              if (normalized.includes('/packages/sdkwork-react-mobile-email/')) return 'feature-email';
              if (normalized.includes('/packages/sdkwork-react-mobile-notes/')) return 'feature-notes';
              if (normalized.includes('/packages/sdkwork-react-mobile-nearby/')) return 'feature-nearby';
              if (normalized.includes('/packages/sdkwork-react-mobile-skills/')) return 'feature-skills';
              if (normalized.includes('/packages/sdkwork-react-mobile-moments/')) return 'feature-moments';
              if (normalized.includes('/packages/sdkwork-react-mobile-video/')) return 'feature-video';
              if (normalized.includes('/packages/sdkwork-react-mobile-contacts/')) return 'feature-contacts';
              if (normalized.includes('/packages/sdkwork-react-mobile-search/')) return 'feature-search';
              if (normalized.includes('/packages/sdkwork-react-mobile-shopping/')) return 'feature-shopping';
              if (normalized.includes('/packages/sdkwork-react-mobile-order-center/')) return 'feature-order-center';
              if (normalized.includes('/packages/sdkwork-react-mobile-look/')) return 'feature-look';
              if (normalized.includes('/packages/sdkwork-react-mobile-media/')) return 'feature-media';
              if (normalized.includes('/packages/sdkwork-react-mobile-app/')) return 'feature-app';
              if (normalized.includes('/packages/sdkwork-react-mobile-auth/')) return 'feature-auth';
              if (normalized.includes('/packages/sdkwork-react-mobile-tools/')) return 'feature-tools';
              if (normalized.includes('/packages/sdkwork-react-mobile-content/')) return 'feature-content';
              if (normalized.includes('/packages/sdkwork-react-mobile-notification/')) return 'feature-notification';
              if (normalized.includes('/packages/sdkwork-react-mobile-vip/')) return 'feature-vip';
              if (normalized.includes('/packages/sdkwork-react-mobile-communication/')) return 'feature-communication';
              if (normalized.includes('/packages/sdkwork-react-mobile-appointments/')) return 'feature-appointments';
              if (normalized.includes('/packages/sdkwork-react-mobile-commerce/')) return 'feature-commerce';

              return undefined;
            },
          },
        },
      }
    };
});
