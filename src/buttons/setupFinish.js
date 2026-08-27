'use strict';

const { build } = require('../utils/ids');
const { isAdmin } = require('../utils/permissions');
const { errorEmbed, successEmbed } = require('../utils/embeds');
const configService = require('../services/configService');

module.exports = {
  customId: build('setup', 'finish'),
  async execute(interaction) {
    if (!isAdmin(interaction.member)) {
      await interaction.reply({ embeds: [errorEmbed('You need the "Manage Server" permission to use this.')], ephemeral: true });
      return;
    }

    const guildConfig = configService.updateGuildConfig(interaction.guild.id, { setup_completed: 1 });

    const missing = [];
    if (!guildConfig.panel_channel_id) missing.push('Panel channel');
    if (!guildConfig.staff_role_id) missing.push('Staff role');
    if (!guildConfig.ticket_category_id) missing.push('Ticket category');

    const note = missing.length
      ? `\n\nStill missing: ${missing.join(', ')}.`
      : '\n\nUse `/ticket panel` to publish the panel in the configured channel.';

    await interaction.update({
      embeds: [successEmbed(`Configuration saved successfully.${note}`, 'Configuration finished')],
      components: [],
    });
  },
};
