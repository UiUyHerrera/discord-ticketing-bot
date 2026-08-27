'use strict';

const { SlashCommandSubcommandBuilder } = require('discord.js');
const { resolveTicketContext, requireStaff } = require('../../utils/ticketGuard');
const { warningEmbed } = require('../../utils/embeds');
const { buildConfirmCloseRow } = require('../../services/ticketView');

module.exports = {
  data: new SlashCommandSubcommandBuilder().setName('close').setDescription('Request to close the current ticket (staff).'),
  async execute(interaction) {
    const ctx = await resolveTicketContext(interaction);
    if (!ctx) return;
    const { ticket, guildConfig } = ctx;

    if (!(await requireStaff(interaction, guildConfig))) return;

    await interaction.reply({
      embeds: [warningEmbed('Are you sure you want to close this ticket? A transcript will be generated before closing it.')],
      components: [buildConfirmCloseRow(ticket.language)],
      ephemeral: true,
    });
  },
};
