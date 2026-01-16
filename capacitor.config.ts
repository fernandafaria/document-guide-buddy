import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.produtize.yoappsocial',
  appName: 'YO',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    iosScheme: 'capacitor',
    allowNavigation: [
      'https://*.supabase.co',
      'https://miaifxqtqpuxogpgjwty.supabase.co'
    ]
  },
  ios: {
    contentInset: 'automatic',
    allowsLinkPreview: false
  }
};

export default config;
