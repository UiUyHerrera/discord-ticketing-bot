'use strict';

const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const { build, parse } = require('../utils/ids');
const { isAdmin } = require('../utils/permissions');
const { errorEmbed } = require('../utils/embeds');
const configService = require('../services/configService');
const theme = require('../services/liveTheme');

const FIELDS = ['name', 'counter', 'color', 'panelMessage'];

function buildModal(fieldKey, guildConfig) {
  const m = theme.setup.modals;

  if (fieldKey === 'name') {
    const modal = new ModalBuilder().setCustomId(build('setup', 'modal', 'name')).setTitle(m.nameTitle);
    modal.addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('value')
          .setLabel(m.nameLabel)
          .setStyle(TextInputStyle.Short)
          .setValue(guildConfig.ticket_name || 'ticket')
          .setRequired(true)
          .setMaxLength(50)
      )
    );
    return modal;
  }

  if (fieldKey === 'counter') {
    const modal = new ModalBuilder().setCustomId(build('setup', 'modal', 'counter')).setTitle(m.counterTitle);
    modal.addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('value')
          .setLabel(m.counterLabel)
          .setStyle(TextInputStyle.Short)
          .setValue(String(guildConfig.ticket_counter ?? 0))
          .setRequired(true)
          .setMaxLength(9)
      )
    );
    return modal;
  }

  if (fieldKey === 'color') {
    const modal = new ModalBuilder().setCustomId(build('setup', 'modal', 'color')).setTitle(m.colorTitle);
    modal.addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('value')
          .setLabel(m.colorLabel)
          .setStyle(TextInputStyle.Short)
          .setValue(guildConfig.embed_color || theme.colors.default)
          .setRequired(true)
          .setMaxLength(7)
      )
    );
    return modal;
  }

  if (fieldKey === 'panelMessage') {
    const modal = new ModalBuilder().setCustomId(build('setup', 'modal', 'panelMessage')).setTitle(m.panelMessageTitle);
    modal.addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('title')
          .setLabel(m.panelMessageTitleLabel)
          .setStyle(TextInputStyle.Short)
          .setValue(guildConfig.panel_title || theme.ticket.defaultPanelTitle)
          .setRequired(true)
          .setMaxLength(256)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('description')
          .setLabel(m.panelMessageDescriptionLabel)
          .setStyle(TextInputStyle.Paragraph)
          .setValue(guildConfig.panel_description || '')
          .setRequired(true)
          .setMaxLength(1000)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('image')
          .setLabel(m.panelMessageImageLabel)
          .setStyle(TextInputStyle.Short)
          .setValue(guildConfig.panel_image || '')
          .setRequired(false)
          .setMaxLength(300)
      )
    );
    return modal;
  }

  return null;
}

module.exports = {
  customIds: FIELDS.map((key) => build('setup', 'field', key)),
  async execute(interaction) {
    if (!isAdmin(interaction.member)) {
      await interaction.reply({ embeds: [errorEmbed('You need the "Manage Server" permission to use this.')], ephemeral: true });
      return;
    }
    const { args } = parse(interaction.customId);
    const fieldKey = args[0];
    const guildConfig = configService.getGuildConfig(interaction.guild.id);
    const modal = buildModal(fieldKey, guildConfig);
    if (!modal) return;
    await interaction.showModal(modal);
  },
};
