'use strict';

const { build } = require('../utils/ids');
const { isAdmin } = require('../utils/permissions');
const { errorEmbed } = require('../utils/embeds');
const themeView = require('../services/themeView');
const fields = require('../services/themeFields');

module.exports = {
  customIds: fields.CATEGORIES.map((cat) => build('theme', 'itemmenu', cat.key)),
  async execute(interaction) {
    if (!isAdmin(interaction.member)) {
      await interaction.reply({ embeds: [errorEmbed('You need the "Manage Server" permission to use this.')], ephemeral: true });
      return;
    }

    const itemKey = interaction.values[0];
    const found = fields.findItem(itemKey);
    if (!found) return;

    if (found.item.type === 'label_emoji') {
      await interaction.deferUpdate();
      const guildEmojis = await interaction.guild.emojis.fetch();
      await interaction.editReply(themeView.renderButtonDetail(itemKey, guildEmojis));
      return;
    }

    const modal = themeView.buildEditModal(itemKey);
    if (!modal) return;
    await interaction.showModal(modal);
  },
};
