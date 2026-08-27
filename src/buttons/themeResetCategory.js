'use strict';

const { build, parse } = require('../utils/ids');
const { isAdmin } = require('../utils/permissions');
const { errorEmbed } = require('../utils/embeds');
const theme = require('../services/liveTheme');
const themeView = require('../services/themeView');
const fields = require('../services/themeFields');

module.exports = {
  customIds: fields.CATEGORIES.map((cat) => build('theme', 'resetcategory', cat.key)),
  async execute(interaction) {
    if (!isAdmin(interaction.member)) {
      await interaction.reply({ embeds: [errorEmbed('You need the "Manage Server" permission to use this.')], ephemeral: true });
      return;
    }

    const { args } = parse(interaction.customId);
    const categoryKey = args[0];
    const category = fields.findCategory(categoryKey);
    if (category) {
      theme.resetPaths(category.items.flatMap(fields.itemLeafPaths));
    }

    await interaction.update(themeView.renderItemList(categoryKey));
  },
};
