'use strict';

const { build } = require('../utils/ids');
const { isAdmin } = require('../utils/permissions');
const { errorEmbed } = require('../utils/embeds');
const configService = require('../services/configService');
const { renderMainPanel } = require('../services/setupView');

module.exports = {
  customId: build('setup', 'back'),
  async execute(interaction) {
    if (!isAdmin(interaction.member)) {
      await interaction.reply({ embeds: [errorEmbed('You need the "Manage Server" permission to use this.')], ephemeral: true });
      return;
    }
    const guildConfig = configService.getGuildConfig(interaction.guild.id);
    const categories = configService.listCategories(interaction.guild.id);
    await interaction.update(renderMainPanel(guildConfig, categories.length));
  },
};
