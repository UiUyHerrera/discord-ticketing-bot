'use strict';

const { build } = require('../utils/ids');
const { resolveTicketContext, requireStaff, safeReply } = require('../utils/ticketGuard');
const ticketService = require('../services/ticketService');
const logService = require('../services/logService');
const ticketManager = require('../services/ticketManager');
const { successEmbed } = require('../utils/embeds');
const { pick } = require('../services/ticketTheme');

module.exports = {
  customId: build('ticket', 'unlock'),
  async execute(interaction) {
    const ctx = await resolveTicketContext(interaction);
    if (!ctx) return;
    const { ticket, guildConfig } = ctx;

    if (!(await requireStaff(interaction, guildConfig))) return;

    if (!ticket.locked) {
      await safeReply(interaction, 'This ticket is not locked.');
      return;
    }

    try {
      await interaction.channel.permissionOverwrites.edit(ticket.user_id, { SendMessages: true, AttachFiles: true });
    } catch (err) {
      await safeReply(interaction, 'I could not update the channel permissions. Check my Manage Roles permission.');
      return;
    }

    const updated = ticketService.unlockTicket(ticket.id);
    await ticketManager.refreshTicketMessage(interaction.channel, updated, guildConfig, interaction.member);

    await interaction.reply({
      embeds: [
        successEmbed(
          pick(ticket.language, `<@${interaction.member.id}> unlocked this ticket.`, `<@${interaction.member.id}> desbloqueó este ticket.`),
          pick(ticket.language, 'Ticket unlocked', 'Ticket desbloqueado')
        ),
      ],
    });

    await logService.sendLog(interaction.client, guildConfig, 'ticket_unlocked', [
      { name: 'Ticket', value: `#${String(ticket.number).padStart(4, '0')}`, inline: true },
      { name: 'Staff', value: `<@${interaction.member.id}>`, inline: true },
    ]);
  },
};
