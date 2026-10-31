import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.dailylearning.games',
  appName: '每日打卡',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;