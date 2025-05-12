// instrumentation-node.ts
// Αυτό το αρχείο περιέχει κώδικα που θα εκτελεστεί μόνο στο Node.js περιβάλλον

/**
 * Αρχικοποίηση του instrumentation για το Node.js περιβάλλον
 */
export async function init() {
    // Εδώ μπορούμε να εκτελέσουμε κώδικα ειδικά για το Node.js
    // Π.χ. ρύθμιση logging, monitoring, κλπ.
    
    // Παράδειγμα: Εμφάνιση μηνύματος κατά την εκκίνηση του server
    if (process.env.NODE_ENV === 'development') {
      console.log('🚀 Node.js instrumentation initialized in development mode');
    }
    
    // Εδώ θα μπορούσαμε να προσθέσουμε κώδικα για:
    // - Σύνδεση με monitoring υπηρεσίες (π.χ. Datadog, New Relic)
    // - Ρύθμιση του Winston ή άλλου logger
    // - Αρχικοποίηση tracing (π.χ. OpenTelemetry)
    // - Συλλογή μετρικών απόδοσης
  }
  
  // Άμεση εκτέλεση κατά την εισαγωγή
  init().catch(error => {
    console.error('❌ Error initializing Node.js instrumentation:', error);
  });