import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        platform: resolve(__dirname, 'src/platform/index.ts'),
        types: resolve(__dirname, 'src/types/index.ts'),
        utils: resolve(__dirname, 'src/utils/index.ts'),
        events: resolve(__dirname, 'src/events/index.ts'),
        hooks: resolve(__dirname, 'src/hooks/index.ts'),
        i18n: resolve(__dirname, 'src/i18n/index.ts'),
      },
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => `${entryName}.${format === 'es' ? 'js' : 'cjs'}`,
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        '@capacitor/core',
        '@capacitor/app',
        '@capacitor/app-launcher',
        '@capacitor/browser',
        '@capacitor/haptics',
        '@capacitor/keyboard',
        '@capacitor/status-bar',
        '@capacitor/splash-screen',
        '@capacitor/device',
        '@capacitor/clipboard',
        '@capacitor/camera',
        '@capawesome/capacitor-file-picker',
        '@capawesome/capacitor-app-update',
        '@aparajita/capacitor-biometric-auth',
        '@aparajita/capacitor-secure-storage',
        '@capacitor-mlkit/barcode-scanning',
        '@capacitor/filesystem',
        '@capacitor/share',
        '@capacitor/network',
        '@capacitor/preferences',
        '@capacitor/local-notifications',
        '@capacitor/push-notifications',
        'zustand',
        'immer',
        'date-fns',
        'uuid',
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          '@capacitor/core': 'Capacitor',
          zustand: 'zustand',
          immer: 'immer',
          'date-fns': 'dateFns',
          uuid: 'uuid',
        },
      },
    },
    sourcemap: true,
    minify: 'esbuild',
    outDir: 'dist',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@sdkwork/app-sdk': resolve(__dirname, '../../../../spring-ai-plus-app-api/sdkwork-sdk-app/sdkwork-app-sdk-typescript/src/index.ts'),
      '@sdkwork/sdk-common': resolve(__dirname, '../../../../sdk/sdkwork-sdk-commons/sdkwork-sdk-common-typescript/src/index.ts'),
    },
  },
});
