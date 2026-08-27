'use strict';

const { build, parse } = require('../utils/ids');
const { isAdmin } = require('../utils/permissions');
const { errorEmbed } = require('../utils/embeds');
const themeView = require('../services/themeView');
const fields = require('../services/themeFields');

module.exports = {
  customIds: fields.CATEGORIES.flatMap((cat) => cat.items.filter((i) => i.type === 'label_emoji').map((i) => build('theme', 'changelabel', i.key))),
  async execute(interaction) {
    if (!isAdmin(interaction.member)) {
      await interaction.reply({ embeds: [errorEmbed('You need the "Manage Server" permission to use this.')], ephemeral: true });
      return;
    }

    const { args } = parse(interaction.customId);
    const itemKey = args[0];
    const modal = themeView.buildLabelModal(itemKey);
    if (!modal) return;
    await interaction.showModal(modal);
  },
};
