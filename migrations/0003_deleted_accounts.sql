CREATE TABLE IF NOT EXISTS deleted_accounts (user_id TEXT PRIMARY KEY REFERENCES users(id), deleted_at TEXT NOT NULL);
