'use strict';

const { build } = require('../utils/ids');
const { infoEmbed } = require('../utils/embeds');

module.exports = {
  customId: build('ticket', 'closecancel'),
  async execute(interaction) {
    await interaction.update({ embeds: [infoEmbed('Close cancelled. The ticket is still open.', 'Cancelled')], components: [] });
  },
};
