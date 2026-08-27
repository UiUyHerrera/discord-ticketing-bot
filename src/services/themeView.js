'use strict';

const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require('discord.js');
const { build } = require('../utils/ids');
const config = require('../config');
const theme = require('./liveTheme');
const fields = require('./themeFields');

const BUTTON_STYLE_MAP = {
  Primary: ButtonStyle.Primary,
  Secondary: ButtonStyle.Secondary,
  Success: ButtonStyle.Success,
  Danger: ButtonStyle.Danger,
};

function truncate(str, max) {
  const s = String(str ?? '');
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
}

function previewForItem(item) {
  if (item.type === 'text') {
    return String(fields.getPath(theme, item.path) ?? '');
  }
  if (item.type === 'label_emoji') {
    const label = fields.getPath(theme, item.labelPath) ?? '';
    const emoji = fields.getPath(theme, item.emojiPath) ?? '';
    return `${emoji ? `${emoji} ` : ''}${label}`;
  }
  if (item.type === 'title_color') {
    const title = fields.getPath(theme, item.titlePath) ?? '';
    const color = fields.getPath(theme, item.colorPath) ?? '';
    return `${title} · ${color}`;
  }
  return '';
}

function renderCategoryList() {
  const embed = new EmbedBuilder()
    .setColor(config.defaultColor)
    .setTitle('Text & Emoji Editor')
    .setDescription(
      'Pick a section to view and edit its text, emojis, and colors.\n' +
        'Changes apply instantly, no restart needed, and affect every server the bot is in.\n' +
        'To use a custom emoji: type `\\:emoji_name:` (with `\\` in front) in any channel and send the message — Discord shows you the raw code (e.g. `<:name:123...>`). Copy it and paste it into the "Emoji" field.'
    )
    .setFooter({ text: `${fields.CATEGORIES.length} sections` });

  const menu = new StringSelectMenuBuilder()
    .setCustomId(build('theme', 'categorymenu'))
    .setPlaceholder('Select a section...')
    .addOptions(
      fields.CATEGORIES.map((cat) => ({
        label: truncate(cat.label, 100),
        value: cat.key,
        description: `${cat.items.length} field${cat.items.length === 1 ? '' : 's'}`,
      }))
    );

  const resetRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(build('theme', 'resetall')).setLabel('Reset everything to defaults').setStyle(ButtonStyle.Danger)
  );

  return { embeds: [embed], components: [new ActionRowBuilder().addComponents(menu), resetRow] };
}

function renderItemList(categoryKey) {
  const category = fields.findCategory(categoryKey);
  if (!category) return renderCategoryList();

  const lines = category.items.map((item) => `**${item.label}**: ${truncate(previewForItem(item), 150)}`);

  const embed = new EmbedBuilder()
    .setColor(config.defaultColor)
    .setTitle(category.label)
    .setDescription(lines.join('\n') || 'No fields.');

  const menu = new StringSelectMenuBuilder()
    .setCustomId(build('theme', 'itemmenu', category.key))
    .setPlaceholder('Select a field to edit...')
    .addOptions(
      category.items.map((item) => {
        const option = { label: truncate(item.label, 100), value: item.key };
        const preview = truncate(previewForItem(item), 100);
        if (preview) option.description = preview;
        return option;
      })
    );

  const hasEmojiFields = category.items.some((item) => item.type === 'label_emoji');
  const navButtons = [
    new ButtonBuilder().setCustomId(build('theme', 'backmain')).setLabel('Back').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId(build('theme', 'resetcategory', category.key)).setLabel('Reset this section').setStyle(ButtonStyle.Danger),
  ];
  if (hasEmojiFields) {
    navButtons.push(new ButtonBuilder().setCustomId(build('theme', 'emojihelp')).setLabel('Emoji help').setStyle(ButtonStyle.Secondary));
  }
  const navRow = new ActionRowBuilder().addComponents(navButtons);

  return { embeds: [embed], components: [new ActionRowBuilder().addComponents(menu), navRow] };
}

function buildEditModal(itemKey) {
  const found = fields.findItem(itemKey);
  if (!found) return null;
  const { category, item } = found;
  const modalId = build('theme', 'editmodal', item.key);
  const title = truncate(item.label, 45);
  const isColor = category.key === 'colors';

  if (item.type === 'text') {
    const modal = new ModalBuilder().setCustomId(modalId).setTitle(title);
    const current = String(fields.getPath(theme, item.path) ?? '');
    const input = new TextInputBuilder()
      .setCustomId('value')
      .setLabel(isColor ? 'Hex color (e.g. #808080)' : item.long ? 'Text (can be long)' : 'Text')
      .setStyle(item.long ? TextInputStyle.Paragraph : TextInputStyle.Short)
      .setValue(current)
      .setRequired(true)
      .setMaxLength(isColor ? 7 : item.long ? 1000 : 200);
    modal.addComponents(new ActionRowBuilder().addComponents(input));
    return modal;
  }

  if (item.type === 'title_color') {
    const modal = new ModalBuilder().setCustomId(modalId).setTitle(title);
    const currentTitle = String(fields.getPath(theme, item.titlePath) ?? '');
    const currentColor = String(fields.getPath(theme, item.colorPath) ?? '');
    const titleInput = new TextInputBuilder()
      .setCustomId('title')
      .setLabel('Text')
      .setStyle(TextInputStyle.Short)
      .setValue(currentTitle)
      .setRequired(true)
      .setMaxLength(100);
    const colorInput = new TextInputBuilder()
      .setCustomId('color')
      .setLabel('Hex color (e.g. #808080)')
      .setStyle(TextInputStyle.Short)
      .setValue(currentColor)
      .setRequired(true)
      .setMaxLength(7);
    modal.addComponents(new ActionRowBuilder().addComponents(titleInput), new ActionRowBuilder().addComponents(colorInput));
    return modal;
  }

  return null;
}

function renderButtonDetail(itemKey, guildEmojis) {
  const found = fields.findItem(itemKey);
  if (!found) return renderCategoryList();
  const { item } = found;

  const currentLabel = String(fields.getPath(theme, item.labelPath) ?? '');
  const currentEmoji = String(fields.getPath(theme, item.emojiPath) ?? '');

  const embed = new EmbedBuilder()
    .setColor(config.defaultColor)
    .setTitle(item.label)
    .setDescription(
      'This is how it looks right now (button below, not clickable) — this is the one you are about to change:\n\n' +
        'Pick an emoji from the list to apply it instantly, or use the buttons below to change the text or set a unicode/other-server emoji.'
    );

  const rows = [];

  const previewButton = new ButtonBuilder()
    .setCustomId(build('theme', 'previewnoop'))
    .setLabel(currentLabel || 'No text')
    .setStyle(BUTTON_STYLE_MAP[item.style] || ButtonStyle.Secondary)
    .setDisabled(true);
  if (currentEmoji) {
    try {
      previewButton.setEmoji(currentEmoji);
    } catch {
    }
  }
  rows.push(new ActionRowBuilder().addComponents(previewButton));

  const sorted = [...guildEmojis.values()].sort((a, b) => a.name.localeCompare(b.name)).slice(0, 24);
  if (sorted.length > 0) {
    const emojiMenu = new StringSelectMenuBuilder()
      .setCustomId(build('theme', 'emojipick', item.key))
      .setPlaceholder('Choose a server emoji...')
      .addOptions([
        { label: 'No emoji', value: '__none__', description: 'Remove this button\'s emoji' },
        ...sorted.map((e) => ({
          label: truncate(e.name, 100),
          value: e.id,
          emoji: { id: e.id, name: e.name, animated: e.animated },
        })),
      ]);
    rows.push(new ActionRowBuilder().addComponents(emojiMenu));
    if (guildEmojis.size > 24) {
      embed.setFooter({ text: `Showing 24 of ${guildEmojis.size} server emojis. If you don't see yours, use "Other emoji".` });
    }
  } else {
    embed.addFields({ name: 'No emojis on this server', value: 'Upload one in Server Settings -> Emoji, or use "Other emoji" to paste a code/unicode.' });
  }

  rows.push(
    new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(build('theme', 'changelabel', item.key)).setLabel('Change text').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId(build('theme', 'otheremoji', item.key)).setLabel('Other emoji (unicode/code)').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId(build('theme', 'detailback', item.key)).setLabel('Back').setStyle(ButtonStyle.Secondary)
    )
  );

  return { embeds: [embed], components: rows };
}

function buildLabelModal(itemKey) {
  const found = fields.findItem(itemKey);
  if (!found) return null;
  const { item } = found;
  const modal = new ModalBuilder().setCustomId(build('theme', 'labelmodal', item.key)).setTitle(truncate(`Text: ${item.label}`, 45));
  const current = String(fields.getPath(theme, item.labelPath) ?? '');
  const input = new TextInputBuilder()
    .setCustomId('label')
    .setLabel('Button text')
    .setStyle(TextInputStyle.Short)
    .setValue(current)
    .setRequired(true)
    .setMaxLength(80);
  modal.addComponents(new ActionRowBuilder().addComponents(input));
  return modal;
}

function buildEmojiTextModal(itemKey) {
  const found = fields.findItem(itemKey);
  if (!found) return null;
  const { item } = found;
  const modal = new ModalBuilder().setCustomId(build('theme', 'emojitextmodal', item.key)).setTitle(truncate(`Emoji: ${item.label}`, 45));
  const current = String(fields.getPath(theme, item.emojiPath) ?? '');
  const input = new TextInputBuilder()
    .setCustomId('emoji')
    .setLabel('Emoji (empty = no emoji)')
    .setStyle(TextInputStyle.Short)
    .setValue(current)
    .setPlaceholder('Unicode emoji or <:name:123...>')
    .setRequired(false)
    .setMaxLength(100);
  modal.addComponents(new ActionRowBuilder().addComponents(input));
  return modal;
}

module.exports = {
  renderCategoryList,
  renderItemList,
  buildEditModal,
  renderButtonDetail,
  buildLabelModal,
  buildEmojiTextModal,
};
