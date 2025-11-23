# Database Migrations

This folder contains SQL migration files for the BibleBud database.

## How to Use

1. **Run migrations in Supabase Dashboard:**
   - Go to your Supabase project
   - Navigate to the SQL Editor
   - Copy and paste the migration SQL
   - Execute the query

2. **File Naming Convention:**
   - Format: `YYYY-MM-DD_description_of_change.sql`
   - Example: `2025-11-23_remove_daily_progress_table.sql`

3. **Migration Guidelines:**
   - Always include a comment block at the top explaining the migration
   - Use `DROP ... IF EXISTS` and `CREATE ... IF NOT EXISTS` for safety
   - Use `CASCADE` when dropping tables to remove dependent objects
   - Test migrations on a development database first

## Migrations

- **2025-11-23_remove_daily_progress_table.sql**: Removes unused `daily_progress` table
