'use strict';

const { SlashCommandSubcommandBuilder } = require('discord.js');
const { isAdmin } = require('../../utils/permissions');
const { errorEmbed } = require('../../utils/embeds');
const themeView = require('../../services/themeView');

module.exports = {
  data: new SlashCommandSubcommandBuilder()
    .setName('theme')
    .setDescription('Edit the bot\'s text, emojis, and colors (admins only).'),
  async execute(interaction) {
    if (!isAdmin(interaction.member)) {
      await interaction.reply({ embeds: [errorEmbed('You need the "Manage Server" permission to use this command.')], ephemeral: true });
      return;
    }

    await interaction.reply({ ...themeView.renderCategoryList(), ephemeral: true });
  },
};
