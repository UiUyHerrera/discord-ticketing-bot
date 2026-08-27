'use strict';

const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const { build } = require('../utils/ids');
const { resolveTicketContext, requireStaff } = require('../utils/ticketGuard');
const { getTicketTheme } = require('../services/ticketTheme');

module.exports = {
  customId: build('ticket', 'adduser'),
  async execute(interaction) {
    const ctx = await resolveTicketContext(interaction);
    if (!ctx) return;
    const { ticket, guildConfig } = ctx;

    if (!(await requireStaff(interaction, guildConfig))) return;

    const theme = getTicketTheme(ticket.language);
    const modal = new ModalBuilder().setCustomId(build('ticket', 'addusermodal')).setTitle(theme.userModals.addTitle);

    const input = new TextInputBuilder()
      .setCustomId('userId')
      .setLabel(theme.userModals.inputLabel)
      .setPlaceholder(theme.userModals.inputPlaceholder)
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    modal.addComponents(new ActionRowBuilder().addComponents(input));
    await interaction.showModal(modal);
  },
};
