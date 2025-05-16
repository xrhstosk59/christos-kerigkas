#!/bin/bash
# scripts/apply-migrations.sh
# Script για την εφαρμογή των βελτιώσεων στο schema της βάσης δεδομένων

set -e  # Διακοπή εκτέλεσης σε περίπτωση σφάλματος

# Φόρτωση μεταβλητών περιβάλλοντος
if [ -f .env.local ]; then
  export $(grep -v '^#' .env.local | xargs)
fi

# Έλεγχος για το DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
  echo "Σφάλμα: Η μεταβλητή DATABASE_URL δεν έχει οριστεί. Παρακαλώ ελέγξτε το αρχείο .env.local"
  exit 1
fi

echo "=== Έναρξη διαδικασίας μετάβασης στη νέα αρχιτεκτονική βάσης δεδομένων ==="

# Βήμα 1: Δημιουργία αντιγράφου ασφαλείας της βάσης δεδομένων
echo "Δημιουργία αντιγράφου ασφαλείας της βάσης δεδομένων..."
current_date=$(date +"%Y%m%d%H%M%S")
backup_file="./backup_${current_date}.sql"

# Εξαγωγή της γραμμής host και εντοπισμός των παραμέτρων αν είναι URL supabase
if [[ $DATABASE_URL == *"supabase"* ]]; then
  # Εξαγωγή των παραμέτρων από το DATABASE_URL για το pg_dump
  db_host=$(echo $DATABASE_URL | sed -E 's/.*@([^:]+):.*/\1/g')
  db_user=$(echo $DATABASE_URL | sed -E 's/.*:\/\/([^:]+):.*/\1/g')
  
  # Εκτέλεση του pg_dump για Supabase
  echo "Δημιουργία αντιγράφου ασφαλείας με pg_dump (Supabase)..."
  pg_dump -h $db_host -U $db_user -d postgres > $backup_file
else
  # Χρήση του DATABASE_URL απευθείας για το pg_dump
  echo "Δημιουργία αντιγράφου ασφαλείας με pg_dump..."
  pg_dump $DATABASE_URL > $backup_file
fi

echo "Αντίγραφο ασφαλείας αποθηκεύτηκε στο $backup_file"

# Βήμα 2: Εφαρμογή νέου migration
echo "Εφαρμογή των βελτιώσεων στο schema..."
psql $DATABASE_URL -f ./drizzle/migration_002_schema_improvements.sql

# Βήμα 3: Επικύρωση του schema
echo "Επικύρωση του schema..."
npm run db:verify

echo "=== Η διαδικασία μετάβασης ολοκληρώθηκε επιτυχώς! ==="
echo "Παρακαλώ εκτελέστε τους κατάλληλους ελέγχους για να επιβεβαιώσετε την ορθή λειτουργία της εφαρμογής."
echo "Το αντίγραφο ασφαλείας είναι διαθέσιμο στο $backup_file σε περίπτωση που χρειαστεί να γίνει επαναφορά."