'use strict';

const { build } = require('../utils/ids');
const { isAdmin } = require('../utils/permissions');
const { errorEmbed } = require('../utils/embeds');
const themeView = require('../services/themeView');

module.exports = {
  customId: build('theme', 'categorymenu'),
  async execute(interaction) {
    if (!isAdmin(interaction.member)) {
      await interaction.reply({ embeds: [errorEmbed('You need the "Manage Server" permission to use this.')], ephemeral: true });
      return;
    }

    const categoryKey = interaction.values[0];
    await interaction.update(themeView.renderItemList(categoryKey));
  },
};
