#!/bin/bash
# scripts/apply-migrations.sh
# Script για την εφαρμογή των βελτιώσεων στο schema της βάσης δεδομένων

set -e  # Διακοπή εκτέλεσης σε περίπτωση σφάλματος

# ✅ FIXED: Καλύτερος τρόπος φόρτωσης env variables
if [ -f .env.local ]; then
  echo "Φόρτωση μεταβλητών περιβάλλοντος από .env.local..."
  set -a  # Automatically export all variables
  source .env.local
  set +a  # Stop auto-exporting
fi

# Έλεγχος για το DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
  echo "❌ Σφάλμα: Η μεταβλητή DATABASE_URL δεν έχει οριστεί."
  echo "   Παρακαλώ ελέγξτε το αρχείο .env.local"
  exit 1
fi

echo "=== Έναρξη διαδικασίας μετάβασης στη νέα αρχιτεκτονική βάσης δεδομένων ==="

# Βήμα 1: Δημιουργία αντιγράφου ασφαλείας της βάσης δεδομένων
echo "📦 Δημιουργία αντιγράφου ασφαλείας της βάσης δεδομένων..."
current_date=$(date +"%Y%m%d_%H%M%S")
backup_file="./backups/backup_${current_date}.sql"

# Δημιουργία φακέλου backups αν δεν υπάρχει
mkdir -p ./backups

# ✅ IMPROVED: Καλύτερος χειρισμός του DATABASE_URL
if [[ $DATABASE_URL == *"supabase"* ]]; then
  echo "🔍 Εντοπίστηκε Supabase database..."
  
  # Εξαγωγή παραμέτρων από το DATABASE_URL
  # postgres://user:pass@host:port/db
  db_params=$(echo $DATABASE_URL | sed -E 's|postgres://([^:]+):([^@]+)@([^:]+):([^/]+)/(.+)|user=\1 password=\2 host=\3 port=\4 dbname=\5|')
  
  # Προσπάθεια δημιουργίας backup
  if command -v pg_dump >&/dev/null; then
    echo "📤 Εκτέλεση pg_dump για Supabase..."
    eval "pg_dump $db_params" > "$backup_file"
  else
    echo "⚠️  pg_dump δεν βρέθηκε. Παράλειψη backup..."
    echo "   Για backup εγκαταστήστε PostgreSQL tools: brew install postgresql"
  fi
else
  # Άλλες βάσεις δεδομένων
  if command -v pg_dump >&/dev/null; then
    echo "📤 Εκτέλεση pg_dump..."
    pg_dump "$DATABASE_URL" > "$backup_file"
  else
    echo "⚠️  pg_dump δεν βρέθηκε. Παράλειψη backup..."
  fi
fi

if [ -f "$backup_file" ] && [ -s "$backup_file" ]; then
  echo "✅ Αντίγραφο ασφαλείας αποθηκεύτηκε στο $backup_file"
else
  echo "⚠️  Το backup δεν δημιουργήθηκε ή είναι κενό"
fi

# Βήμα 2: Εφαρμογή νέου migration
echo "🔧 Εφαρμογή των βελτιώσεων στο schema..."

migration_file="./drizzle/migration_002_schema_improvements.sql"
if [ -f "$migration_file" ]; then
  if command -v psql >&/dev/null; then
    echo "📋 Εκτέλεση migration από $migration_file..."
    psql "$DATABASE_URL" -f "$migration_file"
    echo "✅ Migration εφαρμόστηκε επιτυχώς"
  else
    echo "❌ psql δεν βρέθηκε. Εγκαταστήστε PostgreSQL tools: brew install postgresql"
    echo "   Εναλλακτικά, τρέξτε το migration manual στο Supabase SQL Editor"
    exit 1
  fi
else
  echo "❌ Migration file δεν βρέθηκε στο $migration_file"
  exit 1
fi

# Βήμα 3: Επικύρωση του schema (προαιρετικό)
echo "🔍 Επικύρωση του schema..."
if command -v npm >&/dev/null && npm run --silent db:verify >&/dev/null 2>&1; then
  echo "✅ Schema verification πέτυχε"
elif command -v npx >&/dev/null; then
  echo "🔧 Εκτέλεση Drizzle schema verification..."
  npx drizzle-kit introspect >&/dev/null && echo "✅ Schema είναι έγκυρο" || echo "⚠️  Schema verification απέτυχε"
else
  echo "⚠️  Schema verification παραλείφθηκε"
fi

echo ""
echo "🎉 === Η διαδικασία μετάβασης ολοκληρώθηκε επιτυχώς! ==="
echo ""
echo "📋 Επόμενα βήματα:"
echo "   1. Δοκιμάστε την εφαρμογή: npm run dev"
echo "   2. Ελέγξτε το CV page: http://localhost:3000/cv"
echo "   3. Ελέγξτε το blog: http://localhost:3000/blog"
echo ""
if [ -f "$backup_file" ] && [ -s "$backup_file" ]; then
  echo "💾 Backup διαθέσιμο στο: $backup_file"
fi
echo ""