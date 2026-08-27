'use strict';

const { build, parse } = require('../utils/ids');
const { isAdmin } = require('../utils/permissions');
const { errorEmbed } = require('../utils/embeds');
const theme = require('../services/liveTheme');
const { formatCustomEmojiTag } = require('../services/themeMutate');
const themeView = require('../services/themeView');
const fields = require('../services/themeFields');

module.exports = {
  customIds: fields.CATEGORIES.flatMap((cat) => cat.items.filter((i) => i.type === 'label_emoji').map((i) => build('theme', 'emojipick', i.key))),
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

    await interaction.deferUpdate();

    const choice = interaction.values[0];
    if (choice === '__none__') {
      theme.setOverride(item.emojiPath, '');
    } else {
      const emoji = interaction.guild.emojis.cache.get(choice) || (await interaction.guild.emojis.fetch(choice).catch(() => null));
      if (!emoji) {
        await interaction.followUp({ embeds: [errorEmbed('That emoji was not found, it may have been deleted. Try again.')], ephemeral: true });
        return;
      }
      theme.setOverride(item.emojiPath, formatCustomEmojiTag(emoji));
    }

    const guildEmojis = await interaction.guild.emojis.fetch();
    await interaction.editReply(themeView.renderButtonDetail(itemKey, guildEmojis));
  },
};
