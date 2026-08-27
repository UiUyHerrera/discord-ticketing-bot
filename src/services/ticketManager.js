'use strict';

const { ChannelType, PermissionsBitField, OverwriteType } = require('discord.js');
const logger = require('../utils/logger');
const config = require('../config');
const ticketService = require('./ticketService');
const configService = require('./configService');
const transcriptService = require('./transcriptService');
const logService = require('./logService');
const { ticketChannelName, buildTicketEmbed, buildTicketActionRows } = require('./ticketView');

const { Flags } = PermissionsBitField;

function buildOverwrites(guild, { userId, staffRoleId, closed = false }) {
  const overwrites = [
    {
      id: guild.roles.everyone.id,
      deny: [Flags.ViewChannel],
    },
    {
      id: userId,
      type: OverwriteType.Member,
      allow: closed
        ? [Flags.ViewChannel, Flags.ReadMessageHistory]
        : [Flags.ViewChannel, Flags.SendMessages, Flags.ReadMessageHistory, Flags.AttachFiles, Flags.EmbedLinks],
      deny: closed ? [Flags.SendMessages, Flags.AttachFiles] : [],
    },
    {
      id: guild.members.me.id,
      type: OverwriteType.Member,
      allow: [
        Flags.ViewChannel,
        Flags.ManageChannels,
        Flags.ManageRoles,
        Flags.SendMessages,
        Flags.EmbedLinks,
        Flags.AttachFiles,
        Flags.ReadMessageHistory,
      ],
    },
  ];

  if (staffRoleId) {
    overwrites.push({
      id: staffRoleId,
      type: OverwriteType.Role,
      allow: [Flags.ViewChannel, Flags.SendMessages, Flags.ReadMessageHistory, Flags.ManageMessages, Flags.AttachFiles],
    });
  }

  return overwrites;
}

async function createTicketChannel({ guild, member, guildConfig, category, language = 'en' }) {
  const number = configService.getNextTicketNumber(guild.id);
  const staffRoleId = category.staff_role_id || guildConfig.staff_role_id;
  const parentId = category.discord_category_id || guildConfig.ticket_category_id || null;

  const channel = await guild.channels.create({
    name: ticketChannelName(guildConfig, number),
    type: ChannelType.GuildText,
    parent: parentId || undefined,
    topic: `Ticket #${number} - User: ${member.id} - Category: ${category.label}`,
    permissionOverwrites: buildOverwrites(guild, { userId: member.id, staffRoleId }),
    reason: `Ticket #${number} created by ${member.user.tag}`,
  });

  const ticket = ticketService.createTicket({
    guildId: guild.id,
    channelId: channel.id,
    number,
    userId: member.id,
    categoryKey: category.key,
    categoryLabel: category.label,
    language,
  });

  const embed = buildTicketEmbed({ ticket, guildConfig, member });
  const rows = buildTicketActionRows(ticket);
  await channel.send({ content: `<@${member.id}>`, embeds: [embed], components: rows });

  await logService.sendLog(guild.client, guildConfig, 'ticket_created', [
    { name: 'Ticket', value: `#${String(number).padStart(config.ticketNumberPadding, '0')}`, inline: true },
    { name: 'User', value: `<@${member.id}>`, inline: true },
    { name: 'Category', value: category.label, inline: true },
    { name: 'Channel', value: `<#${channel.id}>`, inline: true },
  ]);

  return { ticket, channel };
}

async function refreshTicketMessage(channel, ticket, guildConfig, member) {
  try {
    const messages = await channel.messages.fetch({ limit: 10 });
    const botMessage = messages.find((m) => m.author.id === channel.client.user.id && m.embeds.length > 0);
    if (!botMessage) return;
    const embed = buildTicketEmbed({ ticket, guildConfig, member });
    const rows = buildTicketActionRows(ticket);
    await botMessage.edit({ embeds: [embed], components: rows });
  } catch (err) {
    logger.warn('No se pudo refrescar el mensaje del ticket:', err.message);
  }
}

async function closeTicketFlow({ channel, ticket, guildConfig, closedByMember }) {
  const guild = channel.guild;

  let userLabel = `ID ${ticket.user_id}`;
  const ownerMember = await guild.members.fetch(ticket.user_id).catch(() => null);
  if (ownerMember) userLabel = ownerMember.user.tag;

  const { filePath, fileName } = await transcriptService.generateTranscript({ channel, ticket, userLabel });

  const closedTicket = ticketService.closeTicket(ticket.id, closedByMember.id);
  ticketService.saveTranscriptPath(closedTicket.id, filePath);

  await channel.permissionOverwrites
    .edit(ticket.user_id, { SendMessages: false, AttachFiles: false })
    .catch((err) => logger.warn('No se pudieron actualizar permisos al cerrar:', err.message));

  if (guildConfig.closed_category_id) {
    await channel
      .setParent(guildConfig.closed_category_id, { lockPermissions: false })
      .catch((err) => logger.warn('No se pudo mover el canal a la categoría de cerrados:', err.message));
  }

  await logService.sendLog(
    guild.client,
    guildConfig,
    'ticket_closed',
    [
      { name: 'Ticket', value: `#${String(ticket.number).padStart(config.ticketNumberPadding, '0')}`, inline: true },
      { name: 'User', value: `<@${ticket.user_id}>`, inline: true },
      { name: 'Closed by', value: `<@${closedByMember.id}>`, inline: true },
    ],
    filePath
  );

  await logService.sendLog(guild.client, guildConfig, 'transcript_generated', [
    { name: 'Ticket', value: `#${String(ticket.number).padStart(config.ticketNumberPadding, '0')}`, inline: true },
    { name: 'File', value: fileName, inline: true },
  ]);

  if (guildConfig.transcript_channel_id && guildConfig.transcript_channel_id !== guildConfig.logs_channel_id) {
    await logService.sendLog(
      guild.client,
      { logs_channel_id: guildConfig.transcript_channel_id },
      'transcript_generated',
      [
        { name: 'Ticket', value: `#${String(ticket.number).padStart(config.ticketNumberPadding, '0')}`, inline: true },
        { name: 'User', value: `<@${ticket.user_id}>`, inline: true },
      ],
      filePath
    );
  }

  configService.setCooldown(guild.id, ticket.user_id, guildConfig.cooldown_seconds);

  return { closedTicket, filePath, fileName };
}

async function deleteTicketChannel({ channel, ticket, guildConfig, deletedByMember }) {
  ticketService.markDeleted(ticket.id);
  await logService.sendLog(channel.client, guildConfig, 'ticket_deleted', [
    { name: 'Ticket', value: `#${String(ticket.number).padStart(config.ticketNumberPadding, '0')}`, inline: true },
    { name: 'Deleted by', value: `<@${deletedByMember.id}>`, inline: true },
  ]);
  await channel.delete(`Ticket #${ticket.number} deleted by ${deletedByMember.user.tag}`).catch((err) => {
    logger.error('No se pudo eliminar el canal del ticket:', err.message);
  });
}

module.exports = {
  buildOverwrites,
  createTicketChannel,
  refreshTicketMessage,
  closeTicketFlow,
  deleteTicketChannel,
};
