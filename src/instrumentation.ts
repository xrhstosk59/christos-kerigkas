// Το αρχείο πρέπει να βρίσκεται στον root του project ή στο src/ φάκελο
// Αυτή η συνάρτηση θα καλείται όταν ξεκινά ένα νέο Next.js server instance

export async function register() {
    // Χρησιμοποιούμε try/catch για να αποφύγουμε σφάλματα κατά τη φόρτωση
    try {
      if (process.env.NEXT_RUNTIME === 'nodejs') {
        // Στο Node.js περιβάλλον, κάνουμε ένα dummy βασικό initialization
        console.log('🚀 Initializing Node.js instrumentation');
        
        // Στο πραγματικό περιβάλλον, θα φορτώναμε το module όταν είναι διαθέσιμο
        // await import('./instrumentation-node')
      }
      
      if (process.env.NEXT_RUNTIME === 'edge') {
        // Στο Edge περιβάλλον, κάνουμε ένα dummy βασικό initialization
        console.log('🌍 Initializing Edge Runtime instrumentation');
        
        // Στο πραγματικό περιβάλλον, θα φορτώναμε το module όταν είναι διαθέσιμο
        // await import('./instrumentation-edge')
      }
    } catch (error) {
      console.error('❌ Error initializing instrumentation:', error);
    }
  }