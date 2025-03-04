// src/types/gtag.d.ts
interface Window {
  gtag: (
    command: 'config' | 'event' | 'js' | 'set' | 'consent',
    targetId: string,
    config?: Record<string, unknown>
  ) => void;
  dataLayer: unknown[];
}