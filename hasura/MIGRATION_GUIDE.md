# Hasura Migration Guide

Complete guide for migrating Hasura schema and metadata changes from Preview to Production environment.

## Prerequisites

- Hasura CLI installed
- Neon CLI installed (for PostgreSQL operations)
- PostgreSQL client tools v17 installed:
  ```bash
  brew install postgresql@17
  ```
- Access to both Preview and Production `.env` files
- Current working directory: `hasura/preview` or `hasura/production`

---

## Part 1: Hasura Schema & Metadata Migration

### 1. Export from Preview Environment

**Working directory:** `hasura/preview/`

#### Step 1.1: Export Current Metadata

Export the current Hasura server state (permissions, relationships, actions, etc.):

```bash
hasura metadata export --envfile .env
```

This updates the `hasura/preview/metadata/` folder with current server state.

#### Step 1.2: Create Migration from Database

Generate a migration file that captures all database schema changes:

```bash
hasura migrate create "release-$(date +%Y-%m-%d)" --from-server --envfile .env
```

**Note:** Use descriptive migration names with dates for better tracking.

This creates a new migration folder in `hasura/preview/migrations/default/` with:

- `<timestamp>_release-<date>/up.sql` - Changes to apply
- `<timestamp>_release-<date>/down.sql` - Rollback script

#### Step 1.3: Clean Up Migration Files (macOS/Linux)

Remove Hasura-specific restrict/unrestrict comments that may cause issues:

```bash
# From project root
find hasura/preview/migrations -name "*.sql" -exec sed -i.bak '/\\restrict hasura/d;/\\unrestrict hasura/d' {} \;
```

**What this does:** Removes `\restrict hasura` and `\unrestrict hasura` directives that can interfere with migration application.

#### Step 1.4: (Optional) Export Seed Data

If you need to copy reference data to production:

```bash
# Export specific table data
hasura seeds create seed_venues --from-table venues --envfile .env

# Export multiple tables
hasura seeds create seed_initial --from-table venues --from-table categories --envfile .env
```

**Warning:** Be careful not to export sensitive production data or large datasets.

---

### 2. Copy to Production

**Working directory:** `/` (Project root)

Copy the exported migrations and metadata to production folder:

```bash
# Copy migrations (only new ones if needed)
cp -r hasura/preview/migrations/default/* hasura/production/migrations/default/

# Copy metadata
cp -r hasura/preview/metadata/* hasura/production/metadata/
```

**Alternative (safer):** Manually copy only the specific migration folder you just created to avoid overwriting everything.

---

### 3. Apply to Production Environment

**Working directory:** `hasura/production/`

#### Step 3.1: Check Migration Status

See which migrations are already applied:

```bash
hasura migrate status --envfile .env
```

#### Step 3.2: Apply Database Migrations

Apply pending database schema changes:

```bash
hasura migrate apply --envfile .env
```

**If migration fails:**

```bash
# Roll back the last migration
hasura migrate apply --down 1 --envfile .env

# Check status and fix issues
hasura migrate status --envfile .env
```

#### Step 3.3: Apply Metadata

Apply Hasura metadata (permissions, relationships, etc.):

```bash
hasura metadata apply --envfile .env
```

#### Step 3.4: (Optional) Apply Seeds

Only if you exported seeds and want to populate reference data:

```bash
hasura seeds apply --envfile .env
```

**Warning:** Seeds will insert data. Ensure you're not creating duplicates!

---

### 4. Verify Migration Success

#### Step 4.1: Check for Metadata Inconsistencies

Ensure metadata is consistent with database schema:

```bash
hasura metadata inconsistency status --envfile .env
```

If inconsistencies exist:

```bash
# View details
hasura metadata inconsistency list --envfile .env

# Reload to fix
hasura metadata reload --envfile .env
```

#### Step 4.2: Compare Metadata

Check if there are any differences between server state and local files:

```bash
hasura metadata diff --envfile .env
```

Should output: "metadata is consistent" or show no differences.

#### Step 4.3: Manual Verification

- Open Hasura Console: `hasura console --envfile .env`
- Check tables, relationships, and permissions
- Test GraphQL queries

---

## Part 2: PostgreSQL Database Operations (Neon)

Use these commands for backing up/restoring entire databases or copying data between branches.

### Prerequisites

Ensure you have the Neon CLI and PostgreSQL client tools installed:

```bash
# Install PostgreSQL 17 client tools (required)
brew install postgresql@17

# Install Neon CLI (if not installed)
brew install neonctl  # macOS
# or
npm install -g neonctl

# Verify pg_dump/pg_restore are available
which pg_dump pg_restore
```

---

### 1. Get Connection Strings

#### List Available Branches

```bash
neon branches list
```

#### Get Connection String

```bash
# For Preview branch
neon connection-string preview

# For Production branch
neon connection-string production
```

**Copy the connection string** - you'll need it for dump/restore operations.

**Format:** `postgresql://user:password@host/database?sslmode=require`

---

### 2. Dump Database

Create a backup of the entire database to a local file:

```bash
# Dump from Preview (custom format - compressed)
pg_dump -Fc -v -d "<PREVIEW_CONNECTION_STRING>" -f preview_backup_$(date +%Y%m%d).bak

# Dump in SQL format (human-readable)
pg_dump -v -d "<PREVIEW_CONNECTION_STRING>" -f preview_backup_$(date +%Y%m%d).sql
```

**Flags:**

- `-Fc`: Custom compressed format (recommended, smaller, faster)
- `-v`: Verbose output
- `-d`: Database connection string
- `-f`: Output file name

**Tip:** Use dated filenames for backups (e.g., `preview_backup_20251018.bak`)

---

### 3. Restore Database

Restore a backup to a target database:

```bash
# Restore to Production (from custom format)
pg_restore -v -d "<PRODUCTION_CONNECTION_STRING>" --clean --if-exists preview_backup_20251018.bak

# Restore from SQL format
psql "<PRODUCTION_CONNECTION_STRING>" < preview_backup_20251018.sql
```

**Flags:**

- `-v`: Verbose output
- `-d`: Target database connection string
- `--clean`: Drop database objects before recreating
- `--if-exists`: Don't error if objects don't exist

⚠️ **WARNING:**

- `--clean` will DROP existing tables/data!
- Always backup production before restoring
- Test on staging first

---

### 4. Copy Specific Data (Safer Alternative)

If you only need to copy specific tables, use `pg_dump` with table selection:

```bash
# Dump only specific tables
pg_dump -Fc -v -d "<PREVIEW_CONNECTION_STRING>" -t venues -t categories -f partial_backup.bak

# Restore without --clean (append data)
pg_restore -v -d "<PRODUCTION_CONNECTION_STRING>" --data-only partial_backup.bak
```

**Flags:**

- `-t`: Specify table name (use multiple times for multiple tables)
- `--data-only`: Only restore data, not schema
- `--schema-only`: Only restore schema, not data

---

## Best Practices & Tips

### General

1. **Always backup production before migrations**

   ```bash
   pg_dump -Fc -d "<PROD_CONNECTION_STRING>" -f prod_backup_before_migration.bak
   ```

2. **Use descriptive migration names** with dates

   - Good: `release-2025-10-18-add-events-table`
   - Bad: `migration`, `changes`, `update`

3. **Keep migrations atomic** - one logical change per migration

4. **Version control everything** - commit migrations and metadata to git

### Hasura-Specific

1. **Never manually edit generated migration files** unless absolutely necessary

2. **Use `hasura migrate squash`** periodically to consolidate migrations:

   ```bash
   hasura migrate squash --from <version> --name "consolidated" --envfile .env
   ```

3. **Keep metadata and migrations in sync** - always export both when making changes

4. **Use feature flags** for gradual rollouts of breaking changes

### PostgreSQL-Specific

1. **Use `-Fc` format** for dumps - smaller, faster, more flexible

2. **Store backups securely** and regularly test restore procedures

3. **Be careful with `--clean` flag** - always have a backup first

4. **Monitor disk space** before large dump/restore operations

---

## Troubleshooting

### Migration Fails

```bash
# Check migration status
hasura migrate status --envfile .env

# View migration history
ls -la hasura/production/migrations/default/

# Roll back last migration
hasura migrate apply --down 1 --envfile .env

# Mark migration as applied without running (use with caution!)
hasura migrate apply --version <version> --skip-execution --envfile .env
```

### Metadata Inconsistencies

```bash
# Check for issues
hasura metadata inconsistency status --envfile .env

# List all inconsistencies
hasura metadata inconsistency list --envfile .env

# Drop inconsistent objects
hasura metadata inconsistency drop --envfile .env

# Reload metadata
hasura metadata reload --envfile .env
```

### Connection Issues

- Verify `.env` file has correct connection strings
- Check Neon dashboard for database status
- Test connection directly: `psql "<CONNECTION_STRING>"`

---

## Quick Reference Commands

```bash
# === HASURA ===
# Export metadata
cd hasura/preview && hasura metadata export --envfile .env

# Create migration from server
cd hasura/preview && hasura migrate create "release-$(date +%Y-%m-%d)" --from-server --envfile .env

# Apply migrations
cd hasura/production && hasura migrate apply --envfile .env

# Apply metadata
cd hasura/production && hasura metadata apply --envfile .env

# Check status
hasura migrate status --envfile .env
hasura metadata inconsistency status --envfile .env

# === POSTGRESQL ===
# Dump database
pg_dump -Fc -v -d "<CONNECTION_STRING>" -f backup_$(date +%Y%m%d).bak

# Restore database
pg_restore -v -d "<CONNECTION_STRING>" --clean --if-exists backup.bak

# Get Neon connection strings
neon branches list
neon connection-string <branch-name>
```
