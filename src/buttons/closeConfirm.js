'use strict';

const { build } = require('../utils/ids');
const { resolveTicketContext, requireStaff } = require('../utils/ticketGuard');
const { successEmbed, infoEmbed, errorEmbed } = require('../utils/embeds');
const { buildPostCloseRow } = require('../services/ticketView');
const { pick } = require('../services/ticketTheme');
const ticketManager = require('../services/ticketManager');
const logger = require('../utils/logger');

module.exports = {
  customId: build('ticket', 'closeconfirm'),
  async execute(interaction) {
    const ctx = await resolveTicketContext(interaction);
    if (!ctx) {
      await interaction.update({ embeds: [], components: [] }).catch(() => {});
      return;
    }
    const { ticket, guildConfig } = ctx;

    if (!(await requireStaff(interaction, guildConfig))) return;

    await interaction.update({
      embeds: [infoEmbed('Closing the ticket and generating the transcript, this may take a few seconds...')],
      components: [],
    });

    try {
      await interaction.channel.send({
        embeds: [
          infoEmbed(
            pick(ticket.language, `This ticket will be closed by <@${interaction.member.id}>. Generating transcript...`, `Este ticket será cerrado por <@${interaction.member.id}>. Generando transcript...`),
            pick(ticket.language, 'Closing ticket', 'Cerrando ticket')
          ),
        ],
      });

      const { fileName } = await ticketManager.closeTicketFlow({
        channel: interaction.channel,
        ticket,
        guildConfig,
        closedByMember: interaction.member,
      });

      await interaction.channel.send({
        embeds: [
          successEmbed(
            pick(
              ticket.language,
              `Ticket closed by <@${interaction.member.id}>.\nTranscript saved as \`${fileName}\`.`,
              `Ticket cerrado por <@${interaction.member.id}>.\nTranscript guardado como \`${fileName}\`.`
            ),
            pick(ticket.language, 'Ticket closed', 'Ticket cerrado')
          ),
        ],
        components: [buildPostCloseRow(ticket.language)],
      });

      await interaction.editReply({ embeds: [successEmbed('The ticket was closed successfully.')], components: [] });
    } catch (err) {
      logger.error('Error cerrando el ticket:', err);
      await interaction.editReply({
        embeds: [errorEmbed('An error occurred while closing the ticket. Check the bot permissions and try again.')],
      });
    }
  },
};
