'use strict';

const colors = {
  default: '#808080',
  success: '#FFFFFF',
  danger: '#000000',
  warning: '#B0B0B0',
  info: '#808080',
  neutral: '#404040',
};

const embeds = {
  successTitle: 'Done',
  errorTitle: 'Error',
  warningTitle: 'Warning',
  infoTitle: 'Info',
};

const common = {
  notConfigured: '*Not set*',
  noCategory: 'No category',
  unclaimed: 'Unclaimed',
  unassigned: 'Unassigned',
  noData: 'No data',
  unknown: 'Unknown',
};

const status = {
  open: 'Open',
  locked: 'Locked',
  closed: 'Closed',
};

const setup = {
  mainTitle: 'Ticket System Configuration',
  mainDescription: 'Press each button to configure that option. You can run `/ticket setup` again anytime to change it.',
  footerIncomplete: 'Configuration incomplete',
  footerComplete: 'Configuration complete',

  fields: {
    panelChannel: 'Panel channel',
    ticketCategory: 'Ticket category',
    closedCategory: 'Closed category',
    staffRole: 'Staff role',
    logsChannel: 'Logs channel',
    transcriptChannel: 'Transcript channel',
    ticketNameField: 'Ticket name',
    counterField: 'Starting number',
    colorField: 'Embed color',
    categoriesField: 'Ticket categories',
  },
  categoriesFieldValueTemplate: '`{count}` configured (use `/ticket config category`)',

  buttons: {
    panelChannel: { label: 'Panel Channel', emoji: null },
    ticketCategory: { label: 'Ticket Category', emoji: null },
    closedCategory: { label: 'Closed Category', emoji: null },
    staffRole: { label: 'Staff Role', emoji: null },
    logsChannel: { label: 'Logs Channel', emoji: null },
    transcriptChannel: { label: 'Transcript Channel', emoji: null },
    name: { label: 'Ticket Name', emoji: null },
    counter: { label: 'Starting Number', emoji: null },
    color: { label: 'Color', emoji: null },
    panelMessage: { label: 'Panel Message', emoji: null },
    finish: { label: 'Finish', emoji: null },
    back: { label: 'Back', emoji: null },
  },

  channelStepEmoji: null,
  channelStepDescription: 'Select a channel from the menu below. Press "Back" to cancel.',
  channelStepPlaceholder: 'Select a channel...',

  roleStepEmoji: null,
  roleStepDescription: 'Select a role from the menu below. Press "Back" to cancel.',
  roleStepPlaceholder: 'Select a role...',

  stepLabels: {
    panelChannel: 'Ticket panel channel',
    ticketCategory: 'Open tickets category',
    closedCategory: 'Closed tickets category',
    staffRole: 'Staff role',
    logsChannel: 'Logs channel',
    transcriptChannel: 'Transcript channel',
  },

  modals: {
    nameTitle: 'Ticket name',
    nameLabel: 'Base name (e.g. ticket)',
    counterTitle: 'Starting ticket number',
    counterLabel: 'Next ticket number to use',
    colorTitle: 'Embed color',
    colorLabel: 'Hex color (e.g. #808080)',
    panelMessageTitle: 'Panel message',
    panelMessageTitleLabel: 'Panel title',
    panelMessageDescriptionLabel: 'Panel description',
    panelMessageImageLabel: 'Image URL (optional)',
  },
};

const ticket = {
  defaultPanelTitle: 'Ticket System',
  defaultPanelDescription: 'Select an option below or press the button to open a ticket with our team.',
  panelFooter: 'Ticket System',
  categorySelectPlaceholder: 'Select the reason for your ticket',

  embedTitleTemplate: 'Ticket #{number}',
  embedDescriptionTemplate: 'Hello {user}\nThanks for contacting our team.\nA staff member will assist you shortly.',
  embedFooterTemplate: 'Ticket #{number}',

  fields: {
    user: 'User',
    category: 'Category',
    createdAt: 'Created',
    responsible: 'Assigned to',
    state: 'Status',
  },

  buttons: {
    close: { label: 'Close Ticket', emoji: null },
    unclaim: { label: 'Unclaim Ticket', emoji: null },
    claim: { label: 'Claim Ticket', emoji: null },
    unlock: { label: 'Unlock', emoji: null },
    lock: { label: 'Lock Ticket', emoji: null },
    transcript: { label: 'Transcript', emoji: null },
    addUser: { label: 'Add User', emoji: null },
    removeUser: { label: 'Remove User', emoji: null },
    createTicket: { label: 'Create Ticket', emoji: null },
    confirmClose: { label: 'Confirm', emoji: null },
    cancelClose: { label: 'Cancel', emoji: null },
    goToTicket: { label: 'Go to Ticket', emoji: null },
    deleteTicket: { label: 'Delete Ticket', emoji: null },
    reopenTicket: { label: 'Reopen Ticket', emoji: null },
  },
};

const userModals = {
  addTitle: 'Add user to ticket',
  removeTitle: 'Remove user from ticket',
  inputLabel: 'User ID or mention',
  inputPlaceholder: 'e.g. 123456789012345678',
};

const stats = {
  title: 'Ticket Statistics',
  fields: {
    total: 'Tickets created',
    open: 'Open tickets',
    closed: 'Closed tickets',
    attended: 'Tickets attended',
    avgPerDay: 'Average per day',
    topStaff: 'Top staff member',
  },
};

const userInfo = {
  title: 'Ticket Information',
  fields: {
    number: 'Number',
    user: 'User',
    category: 'Category',
    staff: 'Staff',
    state: 'Status',
    createdAt: 'Created',
    closedAt: 'Closed',
    closedBy: 'Closed by',
  },
};

const logs = {
  ticket_created: { title: 'Ticket created', color: colors.success },
  ticket_closed: { title: 'Ticket closed', color: colors.danger },
  ticket_deleted: { title: 'Ticket deleted', color: colors.danger },
  ticket_claimed: { title: 'Ticket claimed', color: colors.info },
  ticket_unclaimed: { title: 'Ticket unclaimed', color: colors.info },
  ticket_locked: { title: 'Ticket locked', color: colors.warning },
  ticket_unlocked: { title: 'Ticket unlocked', color: colors.success },
  user_added: { title: 'User added', color: colors.success },
  user_removed: { title: 'User removed', color: colors.danger },
  transcript_generated: { title: 'Transcript generated', color: colors.info },
  ticket_renamed: { title: 'Ticket renamed', color: colors.info },
  blacklist_added: { title: 'User blacklisted', color: colors.danger },
  blacklist_removed: { title: 'User removed from blacklist', color: colors.success },
};

function renderTemplate(str, vars) {
  return String(str).replace(/\{(\w+)\}/g, (match, key) => (vars[key] !== undefined ? vars[key] : match));
}

module.exports = { colors, embeds, common, status, setup, ticket, userModals, stats, userInfo, logs, renderTemplate };
