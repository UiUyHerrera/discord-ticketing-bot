'use strict';

const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
} = require('discord.js');
const { build } = require('../utils/ids');
const { discordTimestamp } = require('../utils/time');
const config = require('../config');
const { getTicketTheme } = require('./ticketTheme');

function pad(number) {
  return String(number).padStart(config.ticketNumberPadding, '0');
}

function themedButton(customId, style, { label, emoji }) {
  const btn = new ButtonBuilder().setCustomId(customId).setLabel(label).setStyle(style);
  if (emoji) btn.setEmoji(emoji);
  return btn;
}

function themedLinkButton(url, { label, emoji }) {
  const btn = new ButtonBuilder().setURL(url).setLabel(label).setStyle(ButtonStyle.Link);
  if (emoji) btn.setEmoji(emoji);
  return btn;
}

function ticketChannelName(guildConfig, number, suffix) {
  const base = (guildConfig.ticket_name || config.defaultTicketName).toLowerCase().replace(/\s+/g, '-');
  return suffix ? `${base}-${suffix}-${pad(number)}` : `${base}-${pad(number)}`;
}

function buildTicketEmbed({ ticket, guildConfig, member }) {
  const theme = getTicketTheme(ticket.language);
  const t = theme.ticket;
  const number = pad(ticket.number);
  const embed = new EmbedBuilder()
    .setColor(guildConfig.embed_color || config.defaultColor)
    .setTitle(theme.renderTemplate(t.embedTitleTemplate, { number }))
    .setDescription(theme.renderTemplate(t.embedDescriptionTemplate, { user: `<@${ticket.user_id}>` }))
    .addFields(
      { name: t.fields.user, value: `<@${ticket.user_id}>`, inline: true },
      { name: t.fields.category, value: ticket.category_label || theme.common.noCategory, inline: true },
      { name: t.fields.createdAt, value: discordTimestamp(ticket.created_at, 'f'), inline: true },
      { name: t.fields.responsible, value: ticket.claimed_by ? `<@${ticket.claimed_by}>` : theme.common.unclaimed, inline: true },
      { name: t.fields.state, value: ticket.locked ? theme.status.locked : theme.status.open, inline: true }
    )
    .setFooter({ text: theme.renderTemplate(t.embedFooterTemplate, { number }) })
    .setTimestamp(new Date(ticket.created_at.replace(' ', 'T') + 'Z'));

  return embed;
}

function buildTicketActionRows(ticket) {
  const b = getTicketTheme(ticket.language).ticket.buttons;
  const row1 = new ActionRowBuilder().addComponents(
    themedButton(build('ticket', 'close'), ButtonStyle.Danger, b.close),
    ticket.claimed_by
      ? themedButton(build('ticket', 'unclaim'), ButtonStyle.Secondary, b.unclaim)
      : themedButton(build('ticket', 'claim'), ButtonStyle.Primary, b.claim),
    ticket.locked
      ? themedButton(build('ticket', 'unlock'), ButtonStyle.Secondary, b.unlock)
      : themedButton(build('ticket', 'lock'), ButtonStyle.Secondary, b.lock),
    themedButton(build('ticket', 'transcript'), ButtonStyle.Secondary, b.transcript)
  );

  const row2 = new ActionRowBuilder().addComponents(
    themedButton(build('ticket', 'adduser'), ButtonStyle.Success, b.addUser),
    themedButton(build('ticket', 'removeuser'), ButtonStyle.Danger, b.removeUser)
  );

  return [row1, row2];
}

function buildPanelEmbed(guildConfig, language) {
  const t = getTicketTheme(language).ticket;
  const useCustomText = language === 'es';
  const embed = new EmbedBuilder()
    .setColor(guildConfig.embed_color || config.defaultColor)
    .setTitle((useCustomText && guildConfig.panel_title) || t.defaultPanelTitle)
    .setDescription((useCustomText && guildConfig.panel_description) || t.defaultPanelDescription)
    .setFooter({ text: t.panelFooter })
    .setTimestamp();

  if (guildConfig.panel_image) embed.setImage(guildConfig.panel_image);
  return embed;
}

function buildPanelButtonRow(language) {
  return new ActionRowBuilder().addComponents(
    themedButton(build('ticket', 'create', language), ButtonStyle.Primary, getTicketTheme(language).ticket.buttons.createTicket)
  );
}

function buildCategorySelectRow(categories, language) {
  const theme = getTicketTheme(language);
  const menu = new StringSelectMenuBuilder()
    .setCustomId(build('ticket', 'categoryselect', language))
    .setPlaceholder(theme.ticket.categorySelectPlaceholder)
    .addOptions(
      categories.map((cat) => ({
        label: cat.label,
        value: cat.key,
        description: cat.description ? cat.description.slice(0, 100) : undefined,
        emoji: cat.emoji || undefined,
      }))
    );
  return new ActionRowBuilder().addComponents(menu);
}

function buildConfirmCloseRow(language) {
  const b = getTicketTheme(language).ticket.buttons;
  return new ActionRowBuilder().addComponents(
    themedButton(build('ticket', 'closeconfirm'), ButtonStyle.Danger, b.confirmClose),
    themedButton(build('ticket', 'closecancel'), ButtonStyle.Secondary, b.cancelClose)
  );
}

function buildGoToTicketRow(guildId, channelId, language) {
  return new ActionRowBuilder().addComponents(
    themedLinkButton(`https://discord.com/channels/${guildId}/${channelId}`, getTicketTheme(language).ticket.buttons.goToTicket)
  );
}

function buildPostCloseRow(language) {
  const b = getTicketTheme(language).ticket.buttons;
  return new ActionRowBuilder().addComponents(
    themedButton(build('ticket', 'delete'), ButtonStyle.Danger, b.deleteTicket),
    themedButton(build('ticket', 'reopen'), ButtonStyle.Success, b.reopenTicket)
  );
}

module.exports = {
  pad,
  ticketChannelName,
  buildTicketEmbed,
  buildTicketActionRows,
  buildPanelEmbed,
  buildPanelButtonRow,
  buildCategorySelectRow,
  buildConfirmCloseRow,
  buildGoToTicketRow,
  buildPostCloseRow,
};
