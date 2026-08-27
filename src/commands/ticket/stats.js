'use strict';

const { SlashCommandSubcommandBuilder, EmbedBuilder } = require('discord.js');
const configService = require('../../services/configService');
const ticketService = require('../../services/ticketService');
const { isStaff } = require('../../utils/permissions');
const { errorEmbed } = require('../../utils/embeds');
const config = require('../../config');
const theme = require('../../services/liveTheme');

module.exports = {
  data: new SlashCommandSubcommandBuilder().setName('stats').setDescription('Show ticket system statistics (staff).'),
  async execute(interaction) {
    const guildConfig = configService.getGuildConfig(interaction.guild.id);

    if (!isStaff(interaction.member, guildConfig)) {
      await interaction.reply({ embeds: [errorEmbed('You do not have staff permissions to view the statistics.')], ephemeral: true });
      return;
    }

    const stats = ticketService.getStats(interaction.guild.id);

    const t = theme.stats;
    const embed = new EmbedBuilder()
      .setColor(guildConfig.embed_color || config.defaultColor)
      .setTitle(t.title)
      .addFields(
        { name: t.fields.total, value: `${stats.total}`, inline: true },
        { name: t.fields.open, value: `${stats.open}`, inline: true },
        { name: t.fields.closed, value: `${stats.closed}`, inline: true },
        { name: t.fields.attended, value: `${stats.attended}`, inline: true },
        { name: t.fields.avgPerDay, value: `${stats.avgPerDay}`, inline: true },
        { name: t.fields.topStaff, value: stats.topStaff ? `<@${stats.topStaff.id}> (${stats.topStaff.count})` : theme.common.noData, inline: true }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
