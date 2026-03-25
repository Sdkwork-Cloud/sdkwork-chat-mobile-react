import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
      include: ['src/**/*'],
      exclude: ['**/*.test.ts', '**/*.test.tsx'],
    }),
  ],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        components: resolve(__dirname, 'src/components/index.ts'),
        hooks: resolve(__dirname, 'src/hooks/index.ts'),
        services: resolve(__dirname, 'src/services/index.ts'),
        stores: resolve(__dirname, 'src/stores/index.ts'),
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        '@sdkwork/react-mobile-core',
        '@sdkwork/react-mobile-core/im',
        '@sdkwork/react-mobile-commons',
        'zustand',
      ],
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js',
      },
    },
    cssCodeSplit: false,
    sourcemap: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@openchat/sdkwork-im-sdk': resolve(__dirname, '../../../openchat/sdkwork-im-sdk/sdkwork-im-sdk-typescript/composed/src/index.ts'),
      '@openchat/sdkwork-im-wukongim-adapter': resolve(__dirname, '../../../openchat/sdkwork-im-sdk/sdkwork-im-sdk-typescript/adapter-wukongim/src/index.ts'),
      '@sdkwork/app-sdk': resolve(__dirname, '../../../../spring-ai-plus-app-api/sdkwork-sdk-app/sdkwork-app-sdk-typescript/src/index.ts'),
      '@sdkwork/sdk-common': resolve(__dirname, '../../../../sdk/sdkwork-sdk-commons/sdkwork-sdk-common-typescript/src/index.ts'),
      '@sdkwork/react-mobile-core/im': resolve(__dirname, '../sdkwork-react-mobile-core/src/im/index.ts'),
      '@sdkwork/react-mobile-core': resolve(__dirname, '../sdkwork-react-mobile-core/src/index.ts'),
      '@sdkwork/react-mobile-commons': resolve(__dirname, '../sdkwork-react-mobile-commons/src/index.ts'),
    },
  },
});
