#!/bin/bash
# School ERP MySQL Backup Script
# Usage: ./db-backup.sh
# To run daily at 2 AM, add this to crontab (crontab -e):
# 0 2 * * * /path/to/school-erp/scripts/db-backup.sh

# Environment Variables (Modify as needed)
CONTAINER_NAME="school-erp-db-1" # Name of your mysql container
DB_USER="erp_user"
DB_PASSWORD="erppass"
DB_NAME="school_erp"
BACKUP_DIR="/path/to/backup/directory"
DATE=$(date +'%Y-%m-%d_%H-%M-%S')

# Ensure backup directory exists
mkdir -p "$BACKUP_DIR"

echo "Starting database backup for $DB_NAME..."

# Execute mysqldump inside the running container
docker exec $CONTAINER_NAME mysqldump -u$DB_USER -p$DB_PASSWORD $DB_NAME > "$BACKUP_DIR/backup_$DATE.sql"

if [ $? -eq 0 ]; then
    echo "Backup completed successfully: $BACKUP_DIR/backup_$DATE.sql"
    
    # Optional: gzip the SQL file to save space
    gzip "$BACKUP_DIR/backup_$DATE.sql"
    
    # Optional: Remove backups older than 30 days
    # find "$BACKUP_DIR" -type f -name "*.sql.gz" -mtime +30 -exec rm {} \;
else
    echo "Error: Database backup failed!"
    exit 1
fi
