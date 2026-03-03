import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    dts({ include: ['src/**/*'], insertTypesEntry: true })
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'SdkworkReactMobileCommerce',
      formats: ['es', 'umd'],
      fileName: (format) => `index.${format}.js`
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'zustand',
        '@sdkwork/react-mobile-core',
        '@sdkwork/react-mobile-commons',
        '@sdkwork/react-mobile-auth',
        '@sdkwork/react-mobile-user'
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          zustand: 'zustand',
          '@sdkwork/react-mobile-core': 'SdkworkReactMobileCore',
          '@sdkwork/react-mobile-commons': 'SdkworkReactMobileCommons',
          '@sdkwork/react-mobile-auth': 'SdkworkReactMobileAuth',
          '@sdkwork/react-mobile-user': 'SdkworkReactMobileUser'
        }
      }
    }
  },
  resolve: {
    alias: {
      '@sdkwork/react-mobile-core': resolve(__dirname, '../sdkwork-react-mobile-core/src'),
      '@sdkwork/react-mobile-commons': resolve(__dirname, '../sdkwork-react-mobile-commons/src'),
      '@sdkwork/react-mobile-auth': resolve(__dirname, '../sdkwork-react-mobile-auth/src'),
      '@sdkwork/react-mobile-user': resolve(__dirname, '../sdkwork-react-mobile-user/src')
    }
  }
});
