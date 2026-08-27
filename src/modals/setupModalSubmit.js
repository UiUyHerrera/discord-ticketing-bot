'use strict';

const { build, parse } = require('../utils/ids');
const { isAdmin } = require('../utils/permissions');
const { errorEmbed } = require('../utils/embeds');
const configService = require('../services/configService');
const { renderMainPanel } = require('../services/setupView');

const HEX_COLOR_RE = /^#?[0-9A-Fa-f]{6}$/;

async function reRender(interaction) {
  const guildConfig = configService.getGuildConfig(interaction.guild.id);
  const categories = configService.listCategories(interaction.guild.id);
  await interaction.update(renderMainPanel(guildConfig, categories.length));
}

module.exports = {
  customIds: ['name', 'counter', 'color', 'panelMessage'].map((key) => build('setup', 'modal', key)),
  async execute(interaction) {
    if (!isAdmin(interaction.member)) {
      await interaction.reply({ embeds: [errorEmbed('You need the "Manage Server" permission to use this.')], ephemeral: true });
      return;
    }

    const { args } = parse(interaction.customId);
    const fieldKey = args[0];
    const guildId = interaction.guild.id;

    if (fieldKey === 'name') {
      const raw = interaction.fields.getTextInputValue('value').trim();
      const sanitized = raw.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
      if (!sanitized) {
        await interaction.reply({ embeds: [errorEmbed('The name cannot be empty or contain only invalid characters.')], ephemeral: true });
        return;
      }
      configService.updateGuildConfig(guildId, { ticket_name: sanitized });
      await reRender(interaction);
      return;
    }

    if (fieldKey === 'counter') {
      const raw = interaction.fields.getTextInputValue('value').trim();
      const value = Number.parseInt(raw, 10);
      if (Number.isNaN(value) || value < 0) {
        await interaction.reply({ embeds: [errorEmbed('The starting number must be a positive integer.')], ephemeral: true });
        return;
      }
      configService.updateGuildConfig(guildId, { ticket_counter: value });
      await reRender(interaction);
      return;
    }

    if (fieldKey === 'color') {
      const raw = interaction.fields.getTextInputValue('value').trim();
      if (!HEX_COLOR_RE.test(raw)) {
        await interaction.reply({ embeds: [errorEmbed('The color must be a valid hex code, e.g. #808080.')], ephemeral: true });
        return;
      }
      const normalized = raw.startsWith('#') ? raw : `#${raw}`;
      configService.updateGuildConfig(guildId, { embed_color: normalized.toUpperCase() });
      await reRender(interaction);
      return;
    }

    if (fieldKey === 'panelMessage') {
      const title = interaction.fields.getTextInputValue('title').trim();
      const description = interaction.fields.getTextInputValue('description').trim();
      const image = interaction.fields.getTextInputValue('image').trim();

      if (image && !/^https?:\/\//i.test(image)) {
        await interaction.reply({ embeds: [errorEmbed('The image URL must start with http:// or https://')], ephemeral: true });
        return;
      }

      configService.updateGuildConfig(guildId, {
        panel_title: title,
        panel_description: description,
        panel_image: image || null,
      });
      await reRender(interaction);
    }
  },
};
