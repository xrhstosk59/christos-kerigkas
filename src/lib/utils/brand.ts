// src/lib/utils/brand.ts
// Hex ισοδύναμα των HSL brand tokens του globals.css.
// Χρειάζονται σε contexts που δεν έχουν CSS variables (next/og ImageResponse).
export const brand = {
  /** --background (dark) 219 45% 8% */
  navy: '#0B121E',
  /** --accent (dark) 219 32% 17% */
  navyLight: '#1D2739',
  /** --primary (dark) 39 45% 62% */
  gold: '#C9AB72',
  goldFaint: 'rgba(201, 171, 114, 0.28)',
  /** --foreground (dark) 40 30% 91% */
  cream: '#EFEAE1',
  /** --muted-foreground (dark) 219 14% 64% */
  muted: '#969FB0',
} as const
