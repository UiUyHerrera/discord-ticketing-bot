'use strict';

const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelSelectMenuBuilder,
  RoleSelectMenuBuilder,
  ChannelType,
} = require('discord.js');
const { build } = require('../utils/ids');
const config = require('../config');
const theme = require('./liveTheme');

function fmtChannel(id) {
  return id ? `<#${id}>` : theme.common.notConfigured;
}
function fmtRole(id) {
  return id ? `<@&${id}>` : theme.common.notConfigured;
}

function themedButton(customId, style, { label, emoji }) {
  const btn = new ButtonBuilder().setCustomId(customId).setLabel(label).setStyle(style);
  if (emoji) btn.setEmoji(emoji);
  return btn;
}

function stepTitle(emoji, label) {
  return emoji ? `${emoji} ${label}` : label;
}

function renderMainPanel(guildConfig, categoriesCount) {
  const t = theme.setup;
  const embed = new EmbedBuilder()
    .setColor(guildConfig.embed_color || config.defaultColor)
    .setTitle(t.mainTitle)
    .setDescription(t.mainDescription)
    .addFields(
      { name: t.fields.panelChannel, value: fmtChannel(guildConfig.panel_channel_id), inline: true },
      { name: t.fields.ticketCategory, value: fmtChannel(guildConfig.ticket_category_id), inline: true },
      { name: t.fields.closedCategory, value: fmtChannel(guildConfig.closed_category_id), inline: true },
      { name: t.fields.staffRole, value: fmtRole(guildConfig.staff_role_id), inline: true },
      { name: t.fields.logsChannel, value: fmtChannel(guildConfig.logs_channel_id), inline: true },
      { name: t.fields.transcriptChannel, value: fmtChannel(guildConfig.transcript_channel_id), inline: true },
      { name: t.fields.ticketNameField, value: `\`${guildConfig.ticket_name}\``, inline: true },
      { name: t.fields.counterField, value: `\`${guildConfig.ticket_counter}\``, inline: true },
      { name: t.fields.colorField, value: `\`${guildConfig.embed_color}\``, inline: true },
      { name: t.fields.categoriesField, value: theme.renderTemplate(t.categoriesFieldValueTemplate, { count: categoriesCount }), inline: true }
    )
    .setFooter({ text: guildConfig.setup_completed ? t.footerComplete : t.footerIncomplete })
    .setTimestamp();

  const row1 = new ActionRowBuilder().addComponents(
    themedButton(build('setup', 'field', 'panelChannel'), ButtonStyle.Secondary, t.buttons.panelChannel),
    themedButton(build('setup', 'field', 'ticketCategory'), ButtonStyle.Secondary, t.buttons.ticketCategory),
    themedButton(build('setup', 'field', 'closedCategory'), ButtonStyle.Secondary, t.buttons.closedCategory)
  );
  const row2 = new ActionRowBuilder().addComponents(
    themedButton(build('setup', 'field', 'staffRole'), ButtonStyle.Secondary, t.buttons.staffRole),
    themedButton(build('setup', 'field', 'logsChannel'), ButtonStyle.Secondary, t.buttons.logsChannel),
    themedButton(build('setup', 'field', 'transcriptChannel'), ButtonStyle.Secondary, t.buttons.transcriptChannel)
  );
  const row3 = new ActionRowBuilder().addComponents(
    themedButton(build('setup', 'field', 'name'), ButtonStyle.Secondary, t.buttons.name),
    themedButton(build('setup', 'field', 'counter'), ButtonStyle.Secondary, t.buttons.counter),
    themedButton(build('setup', 'field', 'color'), ButtonStyle.Secondary, t.buttons.color)
  );
  const row4 = new ActionRowBuilder().addComponents(
    themedButton(build('setup', 'field', 'panelImage'), ButtonStyle.Secondary, t.buttons.panelImage),
    themedButton(build('setup', 'finish'), ButtonStyle.Success, t.buttons.finish)
  );

  return { embeds: [embed], components: [row1, row2, row3, row4] };
}

function renderChannelSelectStep(fieldKey, label, channelTypes) {
  const t = theme.setup;
  const embed = new EmbedBuilder()
    .setColor(config.defaultColor)
    .setTitle(stepTitle(t.channelStepEmoji, label))
    .setDescription(t.channelStepDescription);

  const menu = new ChannelSelectMenuBuilder()
    .setCustomId(build('setup', 'set', fieldKey))
    .setPlaceholder(t.channelStepPlaceholder)
    .setChannelTypes(channelTypes);

  const backRow = new ActionRowBuilder().addComponents(themedButton(build('setup', 'back'), ButtonStyle.Secondary, t.buttons.back));

  return { embeds: [embed], components: [new ActionRowBuilder().addComponents(menu), backRow] };
}

function renderRoleSelectStep(fieldKey, label) {
  const t = theme.setup;
  const embed = new EmbedBuilder()
    .setColor(config.defaultColor)
    .setTitle(stepTitle(t.roleStepEmoji, label))
    .setDescription(t.roleStepDescription);

  const menu = new RoleSelectMenuBuilder().setCustomId(build('setup', 'set', fieldKey)).setPlaceholder(t.roleStepPlaceholder);

  const backRow = new ActionRowBuilder().addComponents(themedButton(build('setup', 'back'), ButtonStyle.Secondary, t.buttons.back));

  return { embeds: [embed], components: [new ActionRowBuilder().addComponents(menu), backRow] };
}

module.exports = {
  renderMainPanel,
  renderChannelSelectStep,
  renderRoleSelectStep,
  ChannelType,
};
