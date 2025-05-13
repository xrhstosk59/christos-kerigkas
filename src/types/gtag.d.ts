// src/types/gtag.d.ts

// Επέκταση του global Window interface
declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js' | 'set' | 'consent',
      targetId: string,
      config?: Record<string, unknown>
    ) => void;
    dataLayer: unknown[];
  }
}

// Δημόσιο API για τη χρήση του Google Analytics
declare namespace gtag {
  function event(
    action: string,
    eventParams: Record<string, unknown>
  ): void;
  
  function set(config: Record<string, unknown>): void;
}

export { gtag };