'use strict';

const { SlashCommandSubcommandBuilder } = require('discord.js');
const configService = require('../../services/configService');
const { isAdmin } = require('../../utils/permissions');
const { errorEmbed } = require('../../utils/embeds');
const { renderMainPanel } = require('../../services/setupView');

module.exports = {
  data: new SlashCommandSubcommandBuilder()
    .setName('setup')
    .setDescription('Configure the ticket system step by step (admins only).'),
  async execute(interaction) {
    if (!isAdmin(interaction.member)) {
      await interaction.reply({ embeds: [errorEmbed('You need the "Manage Server" permission to use this command.')], ephemeral: true });
      return;
    }

    const guildConfig = configService.getOrCreateGuildConfig(interaction.guild.id);
    const categories = configService.listCategories(interaction.guild.id);
    const view = renderMainPanel(guildConfig, categories.length);

    await interaction.reply({ ...view, ephemeral: true });
  },
};
