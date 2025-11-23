-- Migration: Remove unused daily_progress table
-- Date: 2025-11-23
-- Description: The daily_progress table is no longer used as we now track
--              specific stats (quiz results, reading plans, achievements) instead
--              of general daily progress.

-- Drop the table (this will also drop associated policies and constraints)
DROP TABLE IF EXISTS daily_progress CASCADE;
