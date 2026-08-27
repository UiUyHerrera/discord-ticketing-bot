'use strict';

const { SlashCommandSubcommandBuilder } = require('discord.js');
const { resolveTicketContext, requireStaff } = require('../../utils/ticketGuard');
const { infoEmbed } = require('../../utils/embeds');
const ticketManager = require('../../services/ticketManager');
const { pick } = require('../../services/ticketTheme');

module.exports = {
  data: new SlashCommandSubcommandBuilder().setName('delete').setDescription('Permanently delete the current ticket channel (staff).'),
  async execute(interaction) {
    const ctx = await resolveTicketContext(interaction, { requireOpen: false });
    if (!ctx) return;
    const { ticket, guildConfig } = ctx;

    if (!(await requireStaff(interaction, guildConfig))) return;

    await interaction.reply({
      embeds: [infoEmbed(pick(ticket.language, 'Deleting the channel in a few seconds...', 'Eliminando el canal en unos segundos...'), pick(ticket.language, 'Deleting ticket', 'Eliminando ticket'))],
    });
    setTimeout(() => {
      ticketManager
        .deleteTicketChannel({ channel: interaction.channel, ticket, guildConfig, deletedByMember: interaction.member })
        .catch(() => {});
    }, 3000);
  },
};
