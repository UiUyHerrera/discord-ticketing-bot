'use strict';

const { SlashCommandSubcommandBuilder, EmbedBuilder } = require('discord.js');
const { resolveTicketContext } = require('../../utils/ticketGuard');
const { discordTimestamp } = require('../../utils/time');
const { pad } = require('../../services/ticketView');
const config = require('../../config');
const { getTicketTheme } = require('../../services/ticketTheme');

module.exports = {
  data: new SlashCommandSubcommandBuilder().setName('user').setDescription('Show information about the current ticket.'),
  async execute(interaction) {
    const ctx = await resolveTicketContext(interaction, { requireOpen: false });
    if (!ctx) return;
    const { ticket, guildConfig } = ctx;

    const theme = getTicketTheme(ticket.language);
    const t = theme.userInfo;
    const embed = new EmbedBuilder()
      .setColor(guildConfig.embed_color || config.defaultColor)
      .setTitle(t.title)
      .addFields(
        { name: t.fields.number, value: `#${pad(ticket.number)}`, inline: true },
        { name: t.fields.user, value: `<@${ticket.user_id}>`, inline: true },
        { name: t.fields.category, value: ticket.category_label || theme.common.noCategory, inline: true },
        { name: t.fields.staff, value: ticket.claimed_by ? `<@${ticket.claimed_by}>` : theme.common.unassigned, inline: true },
        { name: t.fields.state, value: ticket.status === 'open' ? (ticket.locked ? theme.status.locked : theme.status.open) : theme.status.closed, inline: true },
        { name: t.fields.createdAt, value: discordTimestamp(ticket.created_at, 'f'), inline: true }
      )
      .setTimestamp();

    if (ticket.status === 'closed') {
      embed.addFields(
        { name: t.fields.closedAt, value: ticket.closed_at ? discordTimestamp(ticket.closed_at, 'f') : theme.common.unknown, inline: true },
        { name: t.fields.closedBy, value: ticket.closed_by ? `<@${ticket.closed_by}>` : theme.common.unknown, inline: true }
      );
    }

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
