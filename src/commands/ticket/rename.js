'use strict';

const { SlashCommandSubcommandBuilder } = require('discord.js');
const { resolveTicketContext, requireStaff } = require('../../utils/ticketGuard');
const { successEmbed, errorEmbed } = require('../../utils/embeds');
const { pad } = require('../../services/ticketView');
const { pick } = require('../../services/ticketTheme');
const logService = require('../../services/logService');

module.exports = {
  data: new SlashCommandSubcommandBuilder()
    .setName('rename')
    .setDescription('Rename the current ticket channel (staff).')
    .addStringOption((opt) => opt.setName('name').setDescription('Text to insert, e.g. buy').setRequired(true).setMaxLength(50)),
  async execute(interaction) {
    const ctx = await resolveTicketContext(interaction, { requireOpen: false });
    if (!ctx) return;
    const { ticket, guildConfig } = ctx;

    if (!(await requireStaff(interaction, guildConfig))) return;

    const raw = interaction.options.getString('name', true);
    const slug = raw
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    if (!slug) {
      await interaction.reply({ embeds: [errorEmbed('The name provided is not valid.')], ephemeral: true });
      return;
    }

    const base = (guildConfig.ticket_name || 'ticket').toLowerCase();
    const newName = `${base}-${slug}-${pad(ticket.number)}`;

    try {
      await interaction.channel.setName(newName);
    } catch (err) {
      await interaction.reply({ embeds: [errorEmbed('I could not rename the channel. Check my Manage Channels permission.')], ephemeral: true });
      return;
    }

    await interaction.reply({
      embeds: [
        successEmbed(
          pick(ticket.language, `Channel renamed to \`${newName}\`.`, `Canal renombrado a \`${newName}\`.`),
          pick(ticket.language, 'Ticket renamed', 'Ticket renombrado')
        ),
      ],
    });

    await logService.sendLog(interaction.client, guildConfig, 'ticket_renamed', [
      { name: 'Ticket', value: `#${pad(ticket.number)}`, inline: true },
      { name: 'New name', value: newName, inline: true },
      { name: 'Renamed by', value: `<@${interaction.member.id}>`, inline: true },
    ]);
  },
};
