'use strict';

const db = require('../database/db');
const config = require('../config');

const insertDefaultConfig = db.prepare(`
  INSERT OR IGNORE INTO guild_config (guild_id, cooldown_seconds, embed_color, ticket_name)
  VALUES (@guild_id, @cooldown_seconds, @embed_color, @ticket_name)
`);

const selectConfig = db.prepare('SELECT * FROM guild_config WHERE guild_id = ?');

const updateConfigStmt = db.prepare(`
  UPDATE guild_config SET
    panel_channel_id = @panel_channel_id,
    panel_message_id = @panel_message_id,
    ticket_category_id = @ticket_category_id,
    closed_category_id = @closed_category_id,
    staff_role_id = @staff_role_id,
    logs_channel_id = @logs_channel_id,
    transcript_channel_id = @transcript_channel_id,
    ticket_name = @ticket_name,
    ticket_counter = @ticket_counter,
    cooldown_seconds = @cooldown_seconds,
    embed_color = @embed_color,
    panel_title = @panel_title,
    panel_description = @panel_description,
    panel_image = @panel_image,
    setup_completed = @setup_completed,
    updated_at = datetime('now')
  WHERE guild_id = @guild_id
`);

const insertCategory = db.prepare(`
  INSERT INTO ticket_categories (guild_id, key, label, emoji, description, discord_category_id, staff_role_id, position)
  VALUES (@guild_id, @key, @label, @emoji, @description, @discord_category_id, @staff_role_id, @position)
`);

const selectCategories = db.prepare('SELECT * FROM ticket_categories WHERE guild_id = ? ORDER BY position ASC, id ASC');
const selectCategoryByKey = db.prepare('SELECT * FROM ticket_categories WHERE guild_id = ? AND key = ?');
const deleteCategoryByKey = db.prepare('DELETE FROM ticket_categories WHERE guild_id = ? AND key = ?');
const updateCategoryStmt = db.prepare(`
  UPDATE ticket_categories SET label = @label, emoji = @emoji, description = @description,
    discord_category_id = @discord_category_id, staff_role_id = @staff_role_id
  WHERE guild_id = @guild_id AND key = @key
`);

function getOrCreateGuildConfig(guildId) {
  insertDefaultConfig.run({
    guild_id: guildId,
    cooldown_seconds: config.defaultCooldownSeconds,
    embed_color: config.defaultColor,
    ticket_name: config.defaultTicketName,
  });

  const existingCategories = selectCategories.all(guildId);
  if (existingCategories.length === 0) {
    const insertMany = db.transaction((categories) => {
      categories.forEach((cat, index) => {
        insertCategory.run({
          guild_id: guildId,
          key: cat.key,
          label: cat.label,
          emoji: cat.emoji,
          description: cat.description,
          discord_category_id: null,
          staff_role_id: null,
          position: index,
        });
      });
    });
    insertMany(config.defaultCategories);
  }

  return selectConfig.get(guildId);
}

function getGuildConfig(guildId) {
  return selectConfig.get(guildId) || getOrCreateGuildConfig(guildId);
}

const UPDATABLE_FIELDS = [
  'guild_id',
  'panel_channel_id',
  'panel_message_id',
  'ticket_category_id',
  'closed_category_id',
  'staff_role_id',
  'logs_channel_id',
  'transcript_channel_id',
  'ticket_name',
  'ticket_counter',
  'cooldown_seconds',
  'embed_color',
  'panel_title',
  'panel_description',
  'panel_image',
  'setup_completed',
];

function toUpdateParams(guildId, source) {
  const params = {};
  for (const field of UPDATABLE_FIELDS) {
    params[field] = field === 'guild_id' ? guildId : source[field] ?? null;
  }
  return params;
}

function updateGuildConfig(guildId, partial) {
  const current = getGuildConfig(guildId);
  const merged = { ...current, ...partial };
  updateConfigStmt.run(toUpdateParams(guildId, merged));
  return selectConfig.get(guildId);
}

function getNextTicketNumber(guildId) {
  const current = getGuildConfig(guildId);
  const next = current.ticket_counter + 1;
  updateConfigStmt.run(toUpdateParams(guildId, { ...current, ticket_counter: next }));
  return next;
}

function listCategories(guildId) {
  return selectCategories.all(guildId);
}

function getCategory(guildId, key) {
  return selectCategoryByKey.get(guildId, key);
}

function upsertCategory(guildId, data) {
  const existing = selectCategoryByKey.get(guildId, data.key);
  if (existing) {
    updateCategoryStmt.run({
      guild_id: guildId,
      key: data.key,
      label: data.label ?? existing.label,
      emoji: data.emoji ?? existing.emoji,
      description: data.description ?? existing.description,
      discord_category_id: data.discord_category_id ?? existing.discord_category_id,
      staff_role_id: data.staff_role_id ?? existing.staff_role_id,
    });
  } else {
    const position = selectCategories.all(guildId).length;
    insertCategory.run({
      guild_id: guildId,
      key: data.key,
      label: data.label,
      emoji: data.emoji || null,
      description: data.description || '',
      discord_category_id: data.discord_category_id || null,
      staff_role_id: data.staff_role_id || null,
      position,
    });
  }
  return selectCategoryByKey.get(guildId, data.key);
}

function removeCategory(guildId, key) {
  const result = deleteCategoryByKey.run(guildId, key);
  return result.changes > 0;
}

const insertBlacklist = db.prepare(`
  INSERT OR REPLACE INTO blacklist (guild_id, user_id, reason, added_by, created_at)
  VALUES (?, ?, ?, ?, datetime('now'))
`);
const deleteBlacklist = db.prepare('DELETE FROM blacklist WHERE guild_id = ? AND user_id = ?');
const selectBlacklistEntry = db.prepare('SELECT * FROM blacklist WHERE guild_id = ? AND user_id = ?');

function addToBlacklist(guildId, userId, reason, addedBy) {
  insertBlacklist.run(guildId, userId, reason || 'Not specified', addedBy);
}

function removeFromBlacklist(guildId, userId) {
  const result = deleteBlacklist.run(guildId, userId);
  return result.changes > 0;
}

function isBlacklisted(guildId, userId) {
  return !!selectBlacklistEntry.get(guildId, userId);
}

const upsertCooldown = db.prepare(`
  INSERT INTO cooldowns (guild_id, user_id, expires_at) VALUES (?, ?, ?)
  ON CONFLICT(guild_id, user_id) DO UPDATE SET expires_at = excluded.expires_at
`);
const selectCooldown = db.prepare('SELECT * FROM cooldowns WHERE guild_id = ? AND user_id = ?');

function setCooldown(guildId, userId, seconds) {
  if (!seconds || seconds <= 0) return;
  const expiresAt = new Date(Date.now() + seconds * 1000).toISOString();
  upsertCooldown.run(guildId, userId, expiresAt);
}

function getRemainingCooldown(guildId, userId) {
  const row = selectCooldown.get(guildId, userId);
  if (!row) return 0;
  const remainingMs = new Date(row.expires_at).getTime() - Date.now();
  return remainingMs > 0 ? Math.ceil(remainingMs / 1000) : 0;
}

module.exports = {
  getOrCreateGuildConfig,
  getGuildConfig,
  updateGuildConfig,
  getNextTicketNumber,
  listCategories,
  getCategory,
  upsertCategory,
  removeCategory,
  addToBlacklist,
  removeFromBlacklist,
  isBlacklisted,
  setCooldown,
  getRemainingCooldown,
};
