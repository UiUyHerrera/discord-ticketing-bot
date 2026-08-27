'use strict';

const { build } = require('../utils/ids');
const { resolveTicketContext, requireStaff } = require('../utils/ticketGuard');
const ticketService = require('../services/ticketService');
const ticketManager = require('../services/ticketManager');
const { successEmbed, errorEmbed } = require('../utils/embeds');
const { buildTicketEmbed, buildTicketActionRows } = require('../services/ticketView');
const { pick } = require('../services/ticketTheme');
const logService = require('../services/logService');

module.exports = {
  customId: build('ticket', 'reopen'),
  async execute(interaction) {
    const ctx = await resolveTicketContext(interaction, { requireOpen: false });
    if (!ctx) return;
    const { ticket, guildConfig } = ctx;

    if (!(await requireStaff(interaction, guildConfig))) return;

    if (ticket.status === 'open') {
      await interaction.reply({ embeds: [errorEmbed('This ticket is already open.')], ephemeral: true });
      return;
    }

    const reopened = ticketService.reopenTicketRecord(ticket.id);

    try {
      await interaction.channel.permissionOverwrites.edit(ticket.user_id, {
        ViewChannel: true,
        SendMessages: true,
        AttachFiles: true,
        ReadMessageHistory: true,
      });
      if (guildConfig.ticket_category_id) {
        await interaction.channel.setParent(guildConfig.ticket_category_id, { lockPermissions: false }).catch(() => {});
      }
    } catch (err) {
    }

    const member = await interaction.guild.members.fetch(ticket.user_id).catch(() => null);
    await interaction.channel.send({
      embeds: [buildTicketEmbed({ ticket: reopened, guildConfig, member })],
      components: buildTicketActionRows(reopened),
    });

    await interaction.reply({
      embeds: [
        successEmbed(
          pick(ticket.language, `Ticket reopened by <@${interaction.member.id}>.`, `Ticket reabierto por <@${interaction.member.id}>.`),
          pick(ticket.language, 'Ticket reopened', 'Ticket reabierto')
        ),
      ],
    });

    await logService.sendLog(interaction.client, guildConfig, 'ticket_created', [
      { name: 'Ticket', value: `#${String(ticket.number).padStart(4, '0')}`, inline: true },
      { name: 'Reopened by', value: `<@${interaction.member.id}>`, inline: true },
    ]);
  },
};
