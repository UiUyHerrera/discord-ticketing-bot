'use strict';

const { build, parse } = require('../utils/ids');
const { isAdmin } = require('../utils/permissions');
const { errorEmbed } = require('../utils/embeds');
const mutate = require('../services/themeMutate');
const themeView = require('../services/themeView');
const fields = require('../services/themeFields');

module.exports = {
  customIds: fields.CATEGORIES.flatMap((cat) => cat.items.filter((i) => i.type === 'label_emoji').map((i) => build('theme', 'labelmodal', i.key))),
  async execute(interaction) {
    if (!isAdmin(interaction.member)) {
      await interaction.reply({ embeds: [errorEmbed('You need the "Manage Server" permission to use this.')], ephemeral: true });
      return;
    }

    const { args } = parse(interaction.customId);
    const itemKey = args[0];
    const found = fields.findItem(itemKey);
    if (!found) return;
    const { item } = found;

    const result = mutate.applyButtonLabel(item, interaction.fields.getTextInputValue('label'));
    if (!result.ok) {
      await interaction.reply({ embeds: [errorEmbed(result.error)], ephemeral: true });
      return;
    }

    await interaction.deferUpdate();
    const guildEmojis = await interaction.guild.emojis.fetch();
    await interaction.editReply(themeView.renderButtonDetail(itemKey, guildEmojis));
  },
};
