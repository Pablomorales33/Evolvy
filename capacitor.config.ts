import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.evolvy.app',
  appName: 'Evolvy',
  webDir: 'dist',
  backgroundColor: '#0a0a0a',
  server: {
    androidScheme: 'https'
  },
  ios: {
    contentInset: 'never',
    backgroundColor: '#0a0a0a',
    scrollEnabled: true
  },
  android: {
    backgroundColor: '#0a0a0a'
  },
  plugins: {
    StatusBar: {
      style: 'DARK',
      overlaysWebView: true,
      backgroundColor: '#00000000'
    }
  }
};

export default config;
