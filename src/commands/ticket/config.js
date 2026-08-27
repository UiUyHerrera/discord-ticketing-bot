'use strict';

const { SlashCommandSubcommandBuilder, ChannelType } = require('discord.js');
const configService = require('../../services/configService');
const { isAdmin } = require('../../utils/permissions');
const { errorEmbed, successEmbed, infoEmbed } = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandSubcommandBuilder()
    .setName('config')
    .setDescription('Manage the ticket categories available in the selection menu.')
    .addStringOption((opt) =>
      opt
        .setName('action')
        .setDescription('What you want to do')
        .setRequired(true)
        .addChoices(
          { name: 'View categories', value: 'view' },
          { name: 'Add / edit category', value: 'add' },
          { name: 'Remove category', value: 'remove' }
        )
    )
    .addStringOption((opt) => opt.setName('key').setDescription('Unique identifier, e.g. buy').setRequired(false).setMaxLength(32))
    .addStringOption((opt) => opt.setName('name').setDescription('Visible name, e.g. Buy').setRequired(false).setMaxLength(80))
    .addStringOption((opt) => opt.setName('emoji').setDescription('Emoji to display').setRequired(false).setMaxLength(10))
    .addStringOption((opt) => opt.setName('description').setDescription('Short description').setRequired(false).setMaxLength(100))
    .addChannelOption((opt) =>
      opt.setName('discord_category').setDescription('Discord category where these tickets will be created').addChannelTypes(ChannelType.GuildCategory).setRequired(false)
    )
    .addRoleOption((opt) => opt.setName('staff_role').setDescription('Staff role with access to these tickets (optional)').setRequired(false)),
  async execute(interaction) {
    if (!isAdmin(interaction.member)) {
      await interaction.reply({ embeds: [errorEmbed('You need the "Manage Server" permission to use this command.')], ephemeral: true });
      return;
    }

    const guildId = interaction.guild.id;
    const action = interaction.options.getString('action', true);

    if (action === 'view') {
      const categories = configService.listCategories(guildId);
      if (categories.length === 0) {
        await interaction.reply({ embeds: [infoEmbed('No categories are configured yet.')], ephemeral: true });
        return;
      }
      const lines = categories.map(
        (c) =>
          `${c.emoji ? `${c.emoji} ` : ''}**${c.label}** \`(${c.key})\` — ${c.description || 'no description'}` +
          (c.discord_category_id ? `\n   -> Category: <#${c.discord_category_id}>` : '') +
          (c.staff_role_id ? `\n   -> Staff: <@&${c.staff_role_id}>` : '')
      );
      await interaction.reply({ embeds: [infoEmbed(lines.join('\n\n'), 'Ticket categories')], ephemeral: true });
      return;
    }

    if (action === 'add') {
      const key = interaction.options.getString('key');
      const label = interaction.options.getString('name');
      if (!key || !label) {
        await interaction.reply({ embeds: [errorEmbed('You must provide at least `key` and `name` to add/edit a category.')], ephemeral: true });
        return;
      }
      const sanitizedKey = key.toLowerCase().replace(/[^a-z0-9_-]/g, '');
      if (!sanitizedKey) {
        await interaction.reply({ embeds: [errorEmbed('The key can only contain letters, numbers, hyphens, and underscores.')], ephemeral: true });
        return;
      }

      const emoji = interaction.options.getString('emoji');
      const description = interaction.options.getString('description');
      const discordCategory = interaction.options.getChannel('discord_category');
      const staffRole = interaction.options.getRole('staff_role');

      const category = configService.upsertCategory(guildId, {
        key: sanitizedKey,
        label,
        emoji,
        description,
        discord_category_id: discordCategory ? discordCategory.id : undefined,
        staff_role_id: staffRole ? staffRole.id : undefined,
      });

      await interaction.reply({
        embeds: [successEmbed(`Category **${category.label}** (\`${category.key}\`) saved successfully.`, 'Category saved')],
        ephemeral: true,
      });
      return;
    }

    if (action === 'remove') {
      const key = interaction.options.getString('key');
      if (!key) {
        await interaction.reply({ embeds: [errorEmbed('You must provide the `key` of the category to remove.')], ephemeral: true });
        return;
      }
      const removed = configService.removeCategory(guildId, key.toLowerCase());
      if (!removed) {
        await interaction.reply({ embeds: [errorEmbed(`No category exists with the key \`${key}\`.`)], ephemeral: true });
        return;
      }
      await interaction.reply({ embeds: [successEmbed(`Category \`${key}\` removed.`, 'Category removed')], ephemeral: true });
    }
  },
};
