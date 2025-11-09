// Το αρχείο πρέπει να βρίσκεται στον root του project ή στο src/ φάκελο
// Αυτή η συνάρτηση θα καλείται όταν ξεκινά ένα νέο Next.js server instance

export async function register() {
  // Το Next.js φορτώνει αυτόματα τα sentry.*.config.ts files
  // Αυτό το hook μπορεί να χρησιμοποιηθεί για επιπλέον instrumentation
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    console.log('🚀 Initializing Node.js instrumentation');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    console.log('🌍 Initializing Edge Runtime instrumentation');
  }
}