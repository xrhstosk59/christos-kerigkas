// src/types/gtag.d.ts
interface Window {
    gtag: (
      command: 'config' | 'event' | 'js' | 'set' | 'consent',
      targetId: string,
      config?: { [key: string]: any }
    ) => void;
    dataLayer: any[];
  }