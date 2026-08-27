'use strict';

const { SlashCommandSubcommandBuilder } = require('discord.js');
const { resolveTicketContext, requireStaff, safeReply } = require('../../utils/ticketGuard');
const ticketService = require('../../services/ticketService');
const logService = require('../../services/logService');
const ticketManager = require('../../services/ticketManager');
const { successEmbed } = require('../../utils/embeds');
const { pick } = require('../../services/ticketTheme');

module.exports = {
  data: new SlashCommandSubcommandBuilder().setName('claim').setDescription('Claim the current ticket (staff).'),
  async execute(interaction) {
    const ctx = await resolveTicketContext(interaction);
    if (!ctx) return;
    const { ticket, guildConfig } = ctx;

    if (!(await requireStaff(interaction, guildConfig))) return;

    if (ticket.claimed_by) {
      await safeReply(interaction, `This ticket was already claimed by <@${ticket.claimed_by}>. They must unclaim it before someone else can claim it.`);
      return;
    }

    const updated = ticketService.claimTicket(ticket.id, interaction.member.id);
    await ticketManager.refreshTicketMessage(interaction.channel, updated, guildConfig, interaction.member);

    await interaction.reply({
      embeds: [
        successEmbed(
          pick(ticket.language, `<@${interaction.member.id}> claimed this ticket.`, `<@${interaction.member.id}> reclamó este ticket.`),
          pick(ticket.language, 'Ticket claimed', 'Ticket reclamado')
        ),
      ],
    });

    await logService.sendLog(interaction.client, guildConfig, 'ticket_claimed', [
      { name: 'Ticket', value: `#${String(ticket.number).padStart(4, '0')}`, inline: true },
      { name: 'Staff', value: `<@${interaction.member.id}>`, inline: true },
    ]);
  },
};
