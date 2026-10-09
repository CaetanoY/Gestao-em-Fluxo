CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS user_sessions (hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), expires_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS notifications (id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), request_id TEXT NOT NULL, status TEXT NOT NULL, vehicle TEXT NOT NULL, date TEXT NOT NULL, created_at TEXT NOT NULL, seen_at TEXT);
CREATE INDEX IF NOT EXISTS notifications_user ON notifications(user_id,seen_at,created_at);
