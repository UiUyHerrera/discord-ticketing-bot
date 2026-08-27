'use strict';

const { SlashCommandSubcommandBuilder, AttachmentBuilder } = require('discord.js');
const { resolveTicketContext, requireStaff } = require('../../utils/ticketGuard');
const transcriptService = require('../../services/transcriptService');
const ticketService = require('../../services/ticketService');
const logService = require('../../services/logService');
const { successEmbed, errorEmbed } = require('../../utils/embeds');
const logger = require('../../utils/logger');

module.exports = {
  data: new SlashCommandSubcommandBuilder().setName('transcript').setDescription('Generate the transcript for the current ticket (staff).'),
  async execute(interaction) {
    const ctx = await resolveTicketContext(interaction, { requireOpen: false });
    if (!ctx) return;
    const { ticket, guildConfig } = ctx;

    if (!(await requireStaff(interaction, guildConfig))) return;

    await interaction.deferReply({ ephemeral: true });

    try {
      const guild = interaction.guild;
      let userLabel = `ID ${ticket.user_id}`;
      const ownerMember = await guild.members.fetch(ticket.user_id).catch(() => null);
      if (ownerMember) userLabel = ownerMember.user.tag;

      const { filePath, fileName } = await transcriptService.generateTranscript({ channel: interaction.channel, ticket, userLabel });

      ticketService.saveTranscriptPath(ticket.id, filePath);

      await interaction.editReply({
        embeds: [successEmbed(`Transcript generated: \`${fileName}\``, 'Transcript')],
        files: [new AttachmentBuilder(filePath)],
      });

      await logService.sendLog(
        interaction.client,
        guildConfig,
        'transcript_generated',
        [
          { name: 'Ticket', value: `#${String(ticket.number).padStart(4, '0')}`, inline: true },
          { name: 'Requested by', value: `<@${interaction.member.id}>`, inline: true },
        ],
        filePath
      );
    } catch (err) {
      logger.error('Error generando transcript manual:', err);
      await interaction.editReply({ embeds: [errorEmbed('The transcript could not be generated.')] });
    }
  },
};
