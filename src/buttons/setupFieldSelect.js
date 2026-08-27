'use strict';

const { ChannelType } = require('discord.js');
const { build, parse } = require('../utils/ids');
const { isAdmin } = require('../utils/permissions');
const { errorEmbed } = require('../utils/embeds');
const { renderChannelSelectStep, renderRoleSelectStep } = require('../services/setupView');
const theme = require('../services/liveTheme');

const FIELD_META = {
  panelChannel: { type: 'channel', channelTypes: [ChannelType.GuildText, ChannelType.GuildAnnouncement] },
  ticketCategory: { type: 'channel', channelTypes: [ChannelType.GuildCategory] },
  closedCategory: { type: 'channel', channelTypes: [ChannelType.GuildCategory] },
  staffRole: { type: 'role' },
  logsChannel: { type: 'channel', channelTypes: [ChannelType.GuildText, ChannelType.GuildAnnouncement] },
  transcriptChannel: { type: 'channel', channelTypes: [ChannelType.GuildText, ChannelType.GuildAnnouncement] },
};

module.exports = {
  customIds: Object.keys(FIELD_META).map((key) => build('setup', 'field', key)),
  async execute(interaction) {
    if (!isAdmin(interaction.member)) {
      await interaction.reply({ embeds: [errorEmbed('You need the "Manage Server" permission to use this.')], ephemeral: true });
      return;
    }

    const { args } = parse(interaction.customId);
    const fieldKey = args[0];
    const meta = FIELD_META[fieldKey];
    if (!meta) return;

    const label = theme.setup.stepLabels[fieldKey];
    const view = meta.type === 'role' ? renderRoleSelectStep(fieldKey, label) : renderChannelSelectStep(fieldKey, label, meta.channelTypes);

    await interaction.update(view);
  },
};
