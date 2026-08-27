'use strict';

const { build } = require('../utils/ids');
const { infoEmbed } = require('../utils/embeds');

module.exports = {
  customId: build('theme', 'emojihelp'),
  async execute(interaction) {
    const embed = infoEmbed(
      '**Regular emoji:** paste it directly into the field.\n\n' +
        '**Custom emoji from your server:**\n' +
        '1. In any channel, type `\\:emoji_name:` (with `\\` in front) and **send** the message.\n' +
        '2. Discord shows the raw code in the sent message, e.g. `<:name:123456789012345678>`.\n' +
        '3. Copy that full code and paste it into the "Emoji" field.\n\n' +
        '**Have a .png/.jpg image?** First upload it as a server emoji (Server Settings -> Emoji -> Upload Emoji, max 256 KB), then follow the 3 steps above with the name you gave it.\n\n' +
        'Leave the field empty if you do not want an emoji on that button.',
      'How to set an emoji'
    );
    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
