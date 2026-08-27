'use strict';

const { build, parse } = require('../utils/ids');
const { isAdmin } = require('../utils/permissions');
const { errorEmbed } = require('../utils/embeds');
const mutate = require('../services/themeMutate');
const themeView = require('../services/themeView');
const fields = require('../services/themeFields');

module.exports = {
  customIds: fields.allItemKeys().filter((key) => fields.findItem(key).item.type !== 'label_emoji').map((key) => build('theme', 'editmodal', key)),
  async execute(interaction) {
    if (!isAdmin(interaction.member)) {
      await interaction.reply({ embeds: [errorEmbed('You need the "Manage Server" permission to use this.')], ephemeral: true });
      return;
    }

    const { args } = parse(interaction.customId);
    const itemKey = args[0];
    const found = fields.findItem(itemKey);
    if (!found) return;
    const { category, item } = found;

    let result;
    if (item.type === 'text') {
      result = mutate.applyText(item, category, interaction.fields.getTextInputValue('value'));
    } else if (item.type === 'title_color') {
      result = mutate.applyTitleColor(item, interaction.fields.getTextInputValue('title'), interaction.fields.getTextInputValue('color'));
    }

    if (result && !result.ok) {
      await interaction.reply({ embeds: [errorEmbed(result.error)], ephemeral: true });
      return;
    }

    await interaction.update(themeView.renderItemList(category.key));
  },
};
