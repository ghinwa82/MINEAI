import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'network.mineai.depin',
  appName: 'MineAI Node',
  webDir: 'out',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#030712',
      showSpinner: false
    }
  }
};

export default config;