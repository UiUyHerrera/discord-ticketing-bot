'use strict';

const ticketService = require('../services/ticketService');
const configService = require('../services/configService');
const { isStaff } = require('./permissions');
const { errorEmbed } = require('./embeds');

async function resolveTicketContext(interaction, { requireOpen = true } = {}) {
  const ticket = ticketService.getTicketByChannel(interaction.channel.id);
  if (!ticket) {
    await safeReply(interaction, 'This channel is not a registered ticket.');
    return null;
  }

  if (requireOpen && ticket.status !== 'open') {
    await safeReply(interaction, 'This ticket is already closed.');
    return null;
  }

  const guildConfig = configService.getGuildConfig(interaction.guild.id);
  return { ticket, guildConfig };
}

async function requireStaff(interaction, guildConfig, extraRoleIds = []) {
  if (!isStaff(interaction.member, guildConfig, extraRoleIds)) {
    await safeReply(interaction, 'You do not have staff permissions to perform this action.');
    return false;
  }
  return true;
}

async function safeReply(interaction, message) {
  const payload = { embeds: [errorEmbed(message)], ephemeral: true };
  try {
    if (interaction.deferred || interaction.replied) {
      await interaction.followUp(payload);
    } else {
      await interaction.reply(payload);
    }
  } catch {
  }
}

module.exports = { resolveTicketContext, requireStaff, safeReply };
