'use strict';

const { build } = require('../utils/ids');
const { isAdmin } = require('../utils/permissions');
const { errorEmbed } = require('../utils/embeds');
const theme = require('../services/liveTheme');
const themeView = require('../services/themeView');

module.exports = {
  customId: build('theme', 'resetall'),
  async execute(interaction) {
    if (!isAdmin(interaction.member)) {
      await interaction.reply({ embeds: [errorEmbed('You need the "Manage Server" permission to use this.')], ephemeral: true });
      return;
    }

    theme.resetAll();
    await interaction.update(themeView.renderCategoryList());
  },
};
