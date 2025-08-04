# Database Migration Scripts

This directory contains various database migration and maintenance scripts for the Brazucas application.

## remove_archived_status.js

This script removes the "archived" status from the system, converting any content with "archived" status to "rejected" status.

### Usage

1. Make sure you have Node.js installed
2. Run from the scripts directory:

```bash
node remove_archived_status.js
```

The script will:

1. Connect to the MongoDB database specified in your .env file
2. Update all news items with archived=true to rejected=true
3. Update all advertisements with archived=true to rejected=true
4. Update any status system entries that reference the archived status
5. Add status history entries to affected items

### Environment Variables

The script uses the following environment variables:

- `MONGODB_URI`: MongoDB connection string (default: mongodb://localhost:27017)
- `MONGODB_DATABASE`: Database name (default: brazucas)

These can be defined in the .env file in the root directory.
