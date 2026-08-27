'use strict';

const { build } = require('../utils/ids');
const { resolveTicketContext, requireStaff, safeReply } = require('../utils/ticketGuard');
const ticketService = require('../services/ticketService');
const logService = require('../services/logService');
const ticketManager = require('../services/ticketManager');
const { successEmbed } = require('../utils/embeds');
const { pick } = require('../services/ticketTheme');

module.exports = {
  customId: build('ticket', 'unclaim'),
  async execute(interaction) {
    const ctx = await resolveTicketContext(interaction);
    if (!ctx) return;
    const { ticket, guildConfig } = ctx;

    if (!(await requireStaff(interaction, guildConfig))) return;

    if (!ticket.claimed_by) {
      await safeReply(interaction, 'This ticket is not claimed by anyone.');
      return;
    }

    const updated = ticketService.unclaimTicket(ticket.id);
    await ticketManager.refreshTicketMessage(interaction.channel, updated, guildConfig, interaction.member);

    await interaction.reply({
      embeds: [
        successEmbed(
          pick(ticket.language, `<@${interaction.member.id}> unclaimed this ticket.`, `<@${interaction.member.id}> liberó este ticket.`),
          pick(ticket.language, 'Ticket unclaimed', 'Ticket liberado')
        ),
      ],
    });

    await logService.sendLog(interaction.client, guildConfig, 'ticket_unclaimed', [
      { name: 'Ticket', value: `#${String(ticket.number).padStart(4, '0')}`, inline: true },
      { name: 'Staff', value: `<@${interaction.member.id}>`, inline: true },
    ]);
  },
};
