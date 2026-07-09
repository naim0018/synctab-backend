#!/bin/bash
# SyncTab DB Backup Script
# Usage: ./backup-db.sh [restore <filename>]

DB_PATH="/run/media/naim0018/Primary1TB/Projects/SyncTab/backend/prisma/dev.db"
BACKUP_DIR="/run/media/naim0018/Primary1TB/Projects/SyncTab/backend/prisma/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/dev_$TIMESTAMP.db"

if [ "$1" = "restore" ]; then
  if [ -z "$2" ]; then
    echo "Usage: ./backup-db.sh restore <backup_filename>"
    echo "Available backups:"
    ls -lh "$BACKUP_DIR" | grep ".db"
    exit 1
  fi
  RESTORE_SRC="$BACKUP_DIR/$2"
  if [ ! -f "$RESTORE_SRC" ]; then
    echo "Error: Backup file not found: $RESTORE_SRC"
    exit 1
  fi
  # Backup current DB before restoring
  cp "$DB_PATH" "$BACKUP_DIR/pre_restore_$TIMESTAMP.db"
  cp "$RESTORE_SRC" "$DB_PATH"
  echo "✅ Restored from $2 (current DB saved as pre_restore_$TIMESTAMP.db)"
  exit 0
fi

# Create backup
cp "$DB_PATH" "$BACKUP_FILE"
echo "✅ Backup created: $BACKUP_FILE"

# Keep only the last 20 backups
ls -t "$BACKUP_DIR"/*.db 2>/dev/null | tail -n +21 | xargs rm -f 2>/dev/null
echo "📦 Backup count: $(ls "$BACKUP_DIR"/*.db 2>/dev/null | wc -l)"
