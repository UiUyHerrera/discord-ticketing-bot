'use strict';

const db = require('../database/db');

const insertTicket = db.prepare(`
  INSERT INTO tickets (guild_id, channel_id, number, user_id, category_key, category_label, language, status, created_at)
  VALUES (@guild_id, @channel_id, @number, @user_id, @category_key, @category_label, @language, 'open', datetime('now'))
`);

const selectByChannel = db.prepare('SELECT * FROM tickets WHERE channel_id = ?');
const selectById = db.prepare('SELECT * FROM tickets WHERE id = ?');
const selectOpenByUser = db.prepare("SELECT * FROM tickets WHERE guild_id = ? AND user_id = ? AND status = 'open'");
const selectAllByGuild = db.prepare('SELECT * FROM tickets WHERE guild_id = ? ORDER BY number DESC');
const selectOpenByGuild = db.prepare("SELECT * FROM tickets WHERE guild_id = ? AND status = 'open' ORDER BY number DESC");

const setClaimed = db.prepare('UPDATE tickets SET claimed_by = ? WHERE id = ?');
const setLocked = db.prepare('UPDATE tickets SET locked = ? WHERE id = ?');
const setClosed = db.prepare(`
  UPDATE tickets SET status = 'closed', closed_at = datetime('now'), closed_by = ? WHERE id = ?
`);
const setDeleted = db.prepare("UPDATE tickets SET deleted_at = datetime('now') WHERE id = ?");
const setTranscriptPath = db.prepare('UPDATE tickets SET transcript_path = ? WHERE id = ?');
const setCategory = db.prepare('UPDATE tickets SET category_key = ?, category_label = ? WHERE id = ?');
const reopenTicket = db.prepare("UPDATE tickets SET status = 'open', closed_at = NULL, closed_by = NULL WHERE id = ?");

function createTicket({ guildId, channelId, number, userId, categoryKey, categoryLabel, language }) {
  insertTicket.run({
    guild_id: guildId,
    channel_id: channelId,
    number,
    user_id: userId,
    category_key: categoryKey,
    category_label: categoryLabel,
    language: language || 'en',
  });
  return selectByChannel.get(channelId);
}

function getTicketByChannel(channelId) {
  return selectByChannel.get(channelId);
}

function getTicketById(id) {
  return selectById.get(id);
}

function getOpenTicketForUser(guildId, userId) {
  return selectOpenByUser.get(guildId, userId);
}

function listTicketsForGuild(guildId) {
  return selectAllByGuild.all(guildId);
}

function listOpenTicketsForGuild(guildId) {
  return selectOpenByGuild.all(guildId);
}

function claimTicket(ticketId, staffId) {
  setClaimed.run(staffId, ticketId);
  return selectById.get(ticketId);
}

function unclaimTicket(ticketId) {
  setClaimed.run(null, ticketId);
  return selectById.get(ticketId);
}

function lockTicket(ticketId) {
  setLocked.run(1, ticketId);
  return selectById.get(ticketId);
}

function unlockTicket(ticketId) {
  setLocked.run(0, ticketId);
  return selectById.get(ticketId);
}

function closeTicket(ticketId, closedBy) {
  setClosed.run(closedBy, ticketId);
  return selectById.get(ticketId);
}

function reopenTicketRecord(ticketId) {
  reopenTicket.run(ticketId);
  return selectById.get(ticketId);
}

function markDeleted(ticketId) {
  setDeleted.run(ticketId);
}

function saveTranscriptPath(ticketId, filePath) {
  setTranscriptPath.run(filePath, ticketId);
}

function updateTicketCategory(ticketId, categoryKey, categoryLabel) {
  setCategory.run(categoryKey, categoryLabel, ticketId);
  return selectById.get(ticketId);
}

const insertMember = db.prepare(`
  INSERT OR IGNORE INTO ticket_members (ticket_id, user_id, added_by, added_at)
  VALUES (?, ?, ?, datetime('now'))
`);
const deleteMember = db.prepare('DELETE FROM ticket_members WHERE ticket_id = ? AND user_id = ?');
const selectMembers = db.prepare('SELECT * FROM ticket_members WHERE ticket_id = ?');

function addTicketMember(ticketId, userId, addedBy) {
  insertMember.run(ticketId, userId, addedBy);
}

function removeTicketMember(ticketId, userId) {
  deleteMember.run(ticketId, userId);
}

function listTicketMembers(ticketId) {
  return selectMembers.all(ticketId);
}

function getStats(guildId) {
  const total = db.prepare('SELECT COUNT(*) AS c FROM tickets WHERE guild_id = ?').get(guildId).c;
  const open = db.prepare("SELECT COUNT(*) AS c FROM tickets WHERE guild_id = ? AND status = 'open'").get(guildId).c;
  const closed = db.prepare("SELECT COUNT(*) AS c FROM tickets WHERE guild_id = ? AND status = 'closed'").get(guildId).c;
  const attended = db
    .prepare("SELECT COUNT(*) AS c FROM tickets WHERE guild_id = ? AND claimed_by IS NOT NULL")
    .get(guildId).c;

  const firstTicket = db
    .prepare('SELECT MIN(created_at) AS first FROM tickets WHERE guild_id = ?')
    .get(guildId).first;

  let avgPerDay = 0;
  if (firstTicket && total > 0) {
    const days = Math.max(1, Math.ceil((Date.now() - new Date(firstTicket.replace(' ', 'T') + 'Z').getTime()) / 86400000));
    avgPerDay = Math.round((total / days) * 10) / 10;
  }

  const topStaffRow = db
    .prepare(
      `SELECT claimed_by AS staff, COUNT(*) AS c FROM tickets
       WHERE guild_id = ? AND claimed_by IS NOT NULL
       GROUP BY claimed_by ORDER BY c DESC LIMIT 1`
    )
    .get(guildId);

  return {
    total,
    open,
    closed,
    attended,
    avgPerDay,
    topStaff: topStaffRow ? { id: topStaffRow.staff, count: topStaffRow.c } : null,
  };
}

module.exports = {
  createTicket,
  getTicketByChannel,
  getTicketById,
  getOpenTicketForUser,
  listTicketsForGuild,
  listOpenTicketsForGuild,
  claimTicket,
  unclaimTicket,
  lockTicket,
  unlockTicket,
  closeTicket,
  reopenTicketRecord,
  markDeleted,
  saveTranscriptPath,
  updateTicketCategory,
  addTicketMember,
  removeTicketMember,
  listTicketMembers,
  getStats,
};
