CREATE TABLE IF NOT EXISTS guild_config (
  guild_id             TEXT PRIMARY KEY,
  panel_channel_id     TEXT,
  panel_message_id     TEXT,
  ticket_category_id   TEXT,
  closed_category_id   TEXT,
  staff_role_id        TEXT,
  logs_channel_id      TEXT,
  transcript_channel_id TEXT,
  ticket_name          TEXT NOT NULL DEFAULT 'ticket',
  ticket_counter       INTEGER NOT NULL DEFAULT 0,
  cooldown_seconds     INTEGER NOT NULL DEFAULT 30,
  embed_color          TEXT NOT NULL DEFAULT '#808080',
  panel_title          TEXT NOT NULL DEFAULT 'Ticket System',
  panel_description    TEXT NOT NULL DEFAULT 'Select an option below or press the button to open a ticket with our team.',
  panel_image          TEXT,
  setup_completed      INTEGER NOT NULL DEFAULT 0,
  created_at           TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at           TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS ticket_categories (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  guild_id            TEXT NOT NULL,
  key                 TEXT NOT NULL,
  label               TEXT NOT NULL,
  emoji               TEXT,
  description         TEXT,
  discord_category_id TEXT,
  staff_role_id       TEXT,
  position             INTEGER NOT NULL DEFAULT 0,
  UNIQUE(guild_id, key)
);

CREATE TABLE IF NOT EXISTS tickets (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  guild_id        TEXT NOT NULL,
  channel_id      TEXT UNIQUE,
  number          INTEGER NOT NULL,
  user_id         TEXT NOT NULL,
  category_key    TEXT,
  category_label  TEXT,
  language        TEXT NOT NULL DEFAULT 'en',
  status          TEXT NOT NULL DEFAULT 'open',
  locked          INTEGER NOT NULL DEFAULT 0,
  claimed_by      TEXT,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  closed_at       TEXT,
  closed_by       TEXT,
  deleted_at      TEXT,
  transcript_path TEXT
);

CREATE INDEX IF NOT EXISTS idx_tickets_guild ON tickets(guild_id);
CREATE INDEX IF NOT EXISTS idx_tickets_user ON tickets(guild_id, user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(guild_id, status);

CREATE TABLE IF NOT EXISTS ticket_members (
  ticket_id INTEGER NOT NULL,
  user_id   TEXT NOT NULL,
  added_by  TEXT,
  added_at  TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (ticket_id, user_id)
);

CREATE TABLE IF NOT EXISTS blacklist (
  guild_id   TEXT NOT NULL,
  user_id    TEXT NOT NULL,
  reason     TEXT,
  added_by   TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (guild_id, user_id)
);

CREATE TABLE IF NOT EXISTS cooldowns (
  guild_id   TEXT NOT NULL,
  user_id    TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  PRIMARY KEY (guild_id, user_id)
);

CREATE TABLE IF NOT EXISTS theme_overrides (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
