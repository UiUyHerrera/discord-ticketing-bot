'use strict';

const { build, parse } = require('../utils/ids');
const { isAdmin } = require('../utils/permissions');
const { errorEmbed } = require('../utils/embeds');
const configService = require('../services/configService');
const { renderMainPanel } = require('../services/setupView');

const FIELD_TO_COLUMN = {
  panelChannel: 'panel_channel_id',
  ticketCategory: 'ticket_category_id',
  closedCategory: 'closed_category_id',
  staffRole: 'staff_role_id',
  logsChannel: 'logs_channel_id',
  transcriptChannel: 'transcript_channel_id',
};

module.exports = {
  customIds: Object.keys(FIELD_TO_COLUMN).map((key) => build('setup', 'set', key)),
  async execute(interaction) {
    if (!isAdmin(interaction.member)) {
      await interaction.reply({ embeds: [errorEmbed('You need the "Manage Server" permission to use this.')], ephemeral: true });
      return;
    }

    const { args } = parse(interaction.customId);
    const fieldKey = args[0];
    const column = FIELD_TO_COLUMN[fieldKey];
    if (!column) return;

    const selectedId = interaction.values[0];
    configService.updateGuildConfig(interaction.guild.id, { [column]: selectedId });

    const guildConfig = configService.getGuildConfig(interaction.guild.id);
    const categories = configService.listCategories(interaction.guild.id);
    await interaction.update(renderMainPanel(guildConfig, categories.length));
  },
};
