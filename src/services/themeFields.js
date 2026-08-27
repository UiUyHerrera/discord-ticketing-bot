'use strict';

const CATEGORIES = [
  {
    key: 'embeds',
    label: 'Result messages',
    items: [
      { key: 'embeds.successTitle', label: 'Title: success', type: 'text', path: 'embeds.successTitle' },
      { key: 'embeds.errorTitle', label: 'Title: error', type: 'text', path: 'embeds.errorTitle' },
      { key: 'embeds.warningTitle', label: 'Title: warning', type: 'text', path: 'embeds.warningTitle' },
      { key: 'embeds.infoTitle', label: 'Title: info', type: 'text', path: 'embeds.infoTitle' },
    ],
  },
  {
    key: 'common',
    label: 'Common text',
    items: [
      { key: 'common.notConfigured', label: 'Value: not set', type: 'text', path: 'common.notConfigured' },
      { key: 'common.noCategory', label: 'Value: no category', type: 'text', path: 'common.noCategory' },
      { key: 'common.unclaimed', label: 'Value: unclaimed', type: 'text', path: 'common.unclaimed' },
      { key: 'common.unassigned', label: 'Value: unassigned', type: 'text', path: 'common.unassigned' },
      { key: 'common.noData', label: 'Value: no data', type: 'text', path: 'common.noData' },
      { key: 'common.unknown', label: 'Value: unknown', type: 'text', path: 'common.unknown' },
    ],
  },
  {
    key: 'setup_general',
    label: 'Setup panel — general',
    items: [
      { key: 'setup.mainTitle', label: 'Main title', type: 'text', path: 'setup.mainTitle' },
      { key: 'setup.mainDescription', label: 'Main description', type: 'text', long: true, path: 'setup.mainDescription' },
      { key: 'setup.footerIncomplete', label: 'Footer: setup incomplete', type: 'text', path: 'setup.footerIncomplete' },
      { key: 'setup.footerComplete', label: 'Footer: setup complete', type: 'text', path: 'setup.footerComplete' },
      { key: 'setup.channelStepDescription', label: 'Channel step: description', type: 'text', path: 'setup.channelStepDescription' },
      { key: 'setup.channelStepPlaceholder', label: 'Channel step: placeholder', type: 'text', path: 'setup.channelStepPlaceholder' },
      { key: 'setup.roleStepDescription', label: 'Role step: description', type: 'text', path: 'setup.roleStepDescription' },
      { key: 'setup.roleStepPlaceholder', label: 'Role step: placeholder', type: 'text', path: 'setup.roleStepPlaceholder' },
      { key: 'setup.categoriesFieldValueTemplate', label: 'Value: category count (uses {count})', type: 'text', path: 'setup.categoriesFieldValueTemplate' },
    ],
  },
  {
    key: 'setup_fields',
    label: 'Setup panel — field names',
    items: [
      { key: 'setup.fields.panelChannel', label: 'Field: panel channel', type: 'text', path: 'setup.fields.panelChannel' },
      { key: 'setup.fields.ticketCategory', label: 'Field: ticket category', type: 'text', path: 'setup.fields.ticketCategory' },
      { key: 'setup.fields.closedCategory', label: 'Field: closed category', type: 'text', path: 'setup.fields.closedCategory' },
      { key: 'setup.fields.staffRole', label: 'Field: staff role', type: 'text', path: 'setup.fields.staffRole' },
      { key: 'setup.fields.logsChannel', label: 'Field: logs channel', type: 'text', path: 'setup.fields.logsChannel' },
      { key: 'setup.fields.transcriptChannel', label: 'Field: transcript channel', type: 'text', path: 'setup.fields.transcriptChannel' },
      { key: 'setup.fields.ticketNameField', label: 'Field: ticket name', type: 'text', path: 'setup.fields.ticketNameField' },
      { key: 'setup.fields.counterField', label: 'Field: starting number', type: 'text', path: 'setup.fields.counterField' },
      { key: 'setup.fields.colorField', label: 'Field: embed color', type: 'text', path: 'setup.fields.colorField' },
      { key: 'setup.fields.categoriesField', label: 'Field: ticket categories', type: 'text', path: 'setup.fields.categoriesField' },
    ],
  },
  {
    key: 'setup_buttons',
    label: 'Setup panel — buttons',
    items: [
      { key: 'setup.buttons.panelChannel', label: 'Button: Panel Channel', type: 'label_emoji', labelPath: 'setup.buttons.panelChannel.label', emojiPath: 'setup.buttons.panelChannel.emoji', style: 'Secondary' },
      { key: 'setup.buttons.ticketCategory', label: 'Button: Ticket Category', type: 'label_emoji', labelPath: 'setup.buttons.ticketCategory.label', emojiPath: 'setup.buttons.ticketCategory.emoji', style: 'Secondary' },
      { key: 'setup.buttons.closedCategory', label: 'Button: Closed Category', type: 'label_emoji', labelPath: 'setup.buttons.closedCategory.label', emojiPath: 'setup.buttons.closedCategory.emoji', style: 'Secondary' },
      { key: 'setup.buttons.staffRole', label: 'Button: Staff Role', type: 'label_emoji', labelPath: 'setup.buttons.staffRole.label', emojiPath: 'setup.buttons.staffRole.emoji', style: 'Secondary' },
      { key: 'setup.buttons.logsChannel', label: 'Button: Logs Channel', type: 'label_emoji', labelPath: 'setup.buttons.logsChannel.label', emojiPath: 'setup.buttons.logsChannel.emoji', style: 'Secondary' },
      { key: 'setup.buttons.transcriptChannel', label: 'Button: Transcript Channel', type: 'label_emoji', labelPath: 'setup.buttons.transcriptChannel.label', emojiPath: 'setup.buttons.transcriptChannel.emoji', style: 'Secondary' },
      { key: 'setup.buttons.name', label: 'Button: Ticket Name', type: 'label_emoji', labelPath: 'setup.buttons.name.label', emojiPath: 'setup.buttons.name.emoji', style: 'Secondary' },
      { key: 'setup.buttons.counter', label: 'Button: Starting Number', type: 'label_emoji', labelPath: 'setup.buttons.counter.label', emojiPath: 'setup.buttons.counter.emoji', style: 'Secondary' },
      { key: 'setup.buttons.color', label: 'Button: Color', type: 'label_emoji', labelPath: 'setup.buttons.color.label', emojiPath: 'setup.buttons.color.emoji', style: 'Secondary' },
      { key: 'setup.buttons.panelMessage', label: 'Button: Panel Message', type: 'label_emoji', labelPath: 'setup.buttons.panelMessage.label', emojiPath: 'setup.buttons.panelMessage.emoji', style: 'Secondary' },
      { key: 'setup.buttons.finish', label: 'Button: Finish', type: 'label_emoji', labelPath: 'setup.buttons.finish.label', emojiPath: 'setup.buttons.finish.emoji', style: 'Success' },
      { key: 'setup.buttons.back', label: 'Button: Back', type: 'label_emoji', labelPath: 'setup.buttons.back.label', emojiPath: 'setup.buttons.back.emoji', style: 'Secondary' },
    ],
  },
  {
    key: 'setup_steptitles',
    label: 'Setup panel — step titles',
    items: [
      { key: 'setup.stepLabels.panelChannel', label: 'Step: panel channel', type: 'text', path: 'setup.stepLabels.panelChannel' },
      { key: 'setup.stepLabels.ticketCategory', label: 'Step: ticket category', type: 'text', path: 'setup.stepLabels.ticketCategory' },
      { key: 'setup.stepLabels.closedCategory', label: 'Step: closed category', type: 'text', path: 'setup.stepLabels.closedCategory' },
      { key: 'setup.stepLabels.staffRole', label: 'Step: staff role', type: 'text', path: 'setup.stepLabels.staffRole' },
      { key: 'setup.stepLabels.logsChannel', label: 'Step: logs channel', type: 'text', path: 'setup.stepLabels.logsChannel' },
      { key: 'setup.stepLabels.transcriptChannel', label: 'Step: transcript channel', type: 'text', path: 'setup.stepLabels.transcriptChannel' },
    ],
  },
  {
    key: 'setup_modals',
    label: 'Setup panel — forms',
    items: [
      { key: 'setup.modals.nameTitle', label: 'Form: title (ticket name)', type: 'text', path: 'setup.modals.nameTitle' },
      { key: 'setup.modals.nameLabel', label: 'Form: field (base name)', type: 'text', path: 'setup.modals.nameLabel' },
      { key: 'setup.modals.counterTitle', label: 'Form: title (starting number)', type: 'text', path: 'setup.modals.counterTitle' },
      { key: 'setup.modals.counterLabel', label: 'Form: field (next number)', type: 'text', path: 'setup.modals.counterLabel' },
      { key: 'setup.modals.colorTitle', label: 'Form: title (color)', type: 'text', path: 'setup.modals.colorTitle' },
      { key: 'setup.modals.colorLabel', label: 'Form: field (hex color)', type: 'text', path: 'setup.modals.colorLabel' },
      { key: 'setup.modals.panelMessageTitle', label: 'Form: title (panel message)', type: 'text', path: 'setup.modals.panelMessageTitle' },
      { key: 'setup.modals.panelMessageTitleLabel', label: 'Form: field (panel title)', type: 'text', path: 'setup.modals.panelMessageTitleLabel' },
      { key: 'setup.modals.panelMessageDescriptionLabel', label: 'Form: field (panel description)', type: 'text', path: 'setup.modals.panelMessageDescriptionLabel' },
      { key: 'setup.modals.panelMessageImageLabel', label: 'Form: field (image URL)', type: 'text', path: 'setup.modals.panelMessageImageLabel' },
    ],
  },
  {
    key: 'panel_publico',
    label: 'Public ticket panel (where the user creates a ticket)',
    items: [
      { key: 'ticket.defaultPanelTitle', label: 'Panel title', type: 'text', path: 'ticket.defaultPanelTitle' },
      { key: 'ticket.defaultPanelDescription', label: 'Panel description', type: 'text', long: true, path: 'ticket.defaultPanelDescription' },
      { key: 'ticket.panelFooter', label: 'Panel footer', type: 'text', path: 'ticket.panelFooter' },
      { key: 'ticket.categorySelectPlaceholder', label: 'Category menu placeholder', type: 'text', path: 'ticket.categorySelectPlaceholder' },
      { key: 'ticket.buttons.createTicket', label: 'Button: Create Ticket', type: 'label_emoji', labelPath: 'ticket.buttons.createTicket.label', emojiPath: 'ticket.buttons.createTicket.emoji', style: 'Primary' },
    ],
  },
  {
    key: 'mensaje_ticket',
    label: 'Message inside a ticket',
    items: [
      { key: 'ticket.embedTitleTemplate', label: 'Embed title (uses {number})', type: 'text', path: 'ticket.embedTitleTemplate' },
      { key: 'ticket.embedDescriptionTemplate', label: 'Embed description (uses {user})', type: 'text', long: true, path: 'ticket.embedDescriptionTemplate' },
      { key: 'ticket.embedFooterTemplate', label: 'Embed footer (uses {number})', type: 'text', path: 'ticket.embedFooterTemplate' },
      { key: 'ticket.fields.user', label: 'Field: user', type: 'text', path: 'ticket.fields.user' },
      { key: 'ticket.fields.category', label: 'Field: category', type: 'text', path: 'ticket.fields.category' },
      { key: 'ticket.fields.createdAt', label: 'Field: created', type: 'text', path: 'ticket.fields.createdAt' },
      { key: 'ticket.fields.responsible', label: 'Field: assigned to', type: 'text', path: 'ticket.fields.responsible' },
      { key: 'ticket.fields.state', label: 'Field: status', type: 'text', path: 'ticket.fields.state' },
      { key: 'status.open', label: 'Status: open', type: 'text', path: 'status.open' },
      { key: 'status.locked', label: 'Status: locked', type: 'text', path: 'status.locked' },
      { key: 'status.closed', label: 'Status: closed', type: 'text', path: 'status.closed' },
    ],
  },
  {
    key: 'ticket_buttons',
    label: 'Buttons inside a ticket',
    items: [
      { key: 'ticket.buttons.close', label: 'Button: Close Ticket', type: 'label_emoji', labelPath: 'ticket.buttons.close.label', emojiPath: 'ticket.buttons.close.emoji', style: 'Danger' },
      { key: 'ticket.buttons.unclaim', label: 'Button: Unclaim Ticket', type: 'label_emoji', labelPath: 'ticket.buttons.unclaim.label', emojiPath: 'ticket.buttons.unclaim.emoji', style: 'Secondary' },
      { key: 'ticket.buttons.claim', label: 'Button: Claim Ticket', type: 'label_emoji', labelPath: 'ticket.buttons.claim.label', emojiPath: 'ticket.buttons.claim.emoji', style: 'Primary' },
      { key: 'ticket.buttons.unlock', label: 'Button: Unlock', type: 'label_emoji', labelPath: 'ticket.buttons.unlock.label', emojiPath: 'ticket.buttons.unlock.emoji', style: 'Secondary' },
      { key: 'ticket.buttons.lock', label: 'Button: Lock Ticket', type: 'label_emoji', labelPath: 'ticket.buttons.lock.label', emojiPath: 'ticket.buttons.lock.emoji', style: 'Secondary' },
      { key: 'ticket.buttons.transcript', label: 'Button: Transcript', type: 'label_emoji', labelPath: 'ticket.buttons.transcript.label', emojiPath: 'ticket.buttons.transcript.emoji', style: 'Secondary' },
      { key: 'ticket.buttons.addUser', label: 'Button: Add User', type: 'label_emoji', labelPath: 'ticket.buttons.addUser.label', emojiPath: 'ticket.buttons.addUser.emoji', style: 'Success' },
      { key: 'ticket.buttons.removeUser', label: 'Button: Remove User', type: 'label_emoji', labelPath: 'ticket.buttons.removeUser.label', emojiPath: 'ticket.buttons.removeUser.emoji', style: 'Danger' },
      { key: 'ticket.buttons.confirmClose', label: 'Button: Confirm (close)', type: 'label_emoji', labelPath: 'ticket.buttons.confirmClose.label', emojiPath: 'ticket.buttons.confirmClose.emoji', style: 'Danger' },
      { key: 'ticket.buttons.cancelClose', label: 'Button: Cancel (close)', type: 'label_emoji', labelPath: 'ticket.buttons.cancelClose.label', emojiPath: 'ticket.buttons.cancelClose.emoji', style: 'Secondary' },
      { key: 'ticket.buttons.goToTicket', label: 'Button: Go to Ticket', type: 'label_emoji', labelPath: 'ticket.buttons.goToTicket.label', emojiPath: 'ticket.buttons.goToTicket.emoji', style: 'Secondary' },
      { key: 'ticket.buttons.deleteTicket', label: 'Button: Delete Ticket', type: 'label_emoji', labelPath: 'ticket.buttons.deleteTicket.label', emojiPath: 'ticket.buttons.deleteTicket.emoji', style: 'Danger' },
      { key: 'ticket.buttons.reopenTicket', label: 'Button: Reopen Ticket', type: 'label_emoji', labelPath: 'ticket.buttons.reopenTicket.label', emojiPath: 'ticket.buttons.reopenTicket.emoji', style: 'Success' },
    ],
  },
  {
    key: 'user_modals',
    label: 'Add/remove user forms',
    items: [
      { key: 'userModals.addTitle', label: 'Title: add user', type: 'text', path: 'userModals.addTitle' },
      { key: 'userModals.removeTitle', label: 'Title: remove user', type: 'text', path: 'userModals.removeTitle' },
      { key: 'userModals.inputLabel', label: 'Field: input label', type: 'text', path: 'userModals.inputLabel' },
      { key: 'userModals.inputPlaceholder', label: 'Field: input placeholder', type: 'text', path: 'userModals.inputPlaceholder' },
    ],
  },
  {
    key: 'stats',
    label: '/ticket stats command',
    items: [
      { key: 'stats.title', label: 'Title', type: 'text', path: 'stats.title' },
      { key: 'stats.fields.total', label: 'Field: tickets created', type: 'text', path: 'stats.fields.total' },
      { key: 'stats.fields.open', label: 'Field: open tickets', type: 'text', path: 'stats.fields.open' },
      { key: 'stats.fields.closed', label: 'Field: closed tickets', type: 'text', path: 'stats.fields.closed' },
      { key: 'stats.fields.attended', label: 'Field: tickets attended', type: 'text', path: 'stats.fields.attended' },
      { key: 'stats.fields.avgPerDay', label: 'Field: average per day', type: 'text', path: 'stats.fields.avgPerDay' },
      { key: 'stats.fields.topStaff', label: 'Field: top staff member', type: 'text', path: 'stats.fields.topStaff' },
    ],
  },
  {
    key: 'user_info',
    label: '/ticket user command',
    items: [
      { key: 'userInfo.title', label: 'Title', type: 'text', path: 'userInfo.title' },
      { key: 'userInfo.fields.number', label: 'Field: number', type: 'text', path: 'userInfo.fields.number' },
      { key: 'userInfo.fields.user', label: 'Field: user', type: 'text', path: 'userInfo.fields.user' },
      { key: 'userInfo.fields.category', label: 'Field: category', type: 'text', path: 'userInfo.fields.category' },
      { key: 'userInfo.fields.staff', label: 'Field: staff', type: 'text', path: 'userInfo.fields.staff' },
      { key: 'userInfo.fields.state', label: 'Field: status', type: 'text', path: 'userInfo.fields.state' },
      { key: 'userInfo.fields.createdAt', label: 'Field: created', type: 'text', path: 'userInfo.fields.createdAt' },
      { key: 'userInfo.fields.closedAt', label: 'Field: closed', type: 'text', path: 'userInfo.fields.closedAt' },
      { key: 'userInfo.fields.closedBy', label: 'Field: closed by', type: 'text', path: 'userInfo.fields.closedBy' },
    ],
  },
  {
    key: 'logs',
    label: 'Logs channel',
    items: [
      { key: 'logs.ticket_created', label: 'Log: ticket created', type: 'title_color', titlePath: 'logs.ticket_created.title', colorPath: 'logs.ticket_created.color' },
      { key: 'logs.ticket_closed', label: 'Log: ticket closed', type: 'title_color', titlePath: 'logs.ticket_closed.title', colorPath: 'logs.ticket_closed.color' },
      { key: 'logs.ticket_deleted', label: 'Log: ticket deleted', type: 'title_color', titlePath: 'logs.ticket_deleted.title', colorPath: 'logs.ticket_deleted.color' },
      { key: 'logs.ticket_claimed', label: 'Log: ticket claimed', type: 'title_color', titlePath: 'logs.ticket_claimed.title', colorPath: 'logs.ticket_claimed.color' },
      { key: 'logs.ticket_unclaimed', label: 'Log: ticket unclaimed', type: 'title_color', titlePath: 'logs.ticket_unclaimed.title', colorPath: 'logs.ticket_unclaimed.color' },
      { key: 'logs.ticket_locked', label: 'Log: ticket locked', type: 'title_color', titlePath: 'logs.ticket_locked.title', colorPath: 'logs.ticket_locked.color' },
      { key: 'logs.ticket_unlocked', label: 'Log: ticket unlocked', type: 'title_color', titlePath: 'logs.ticket_unlocked.title', colorPath: 'logs.ticket_unlocked.color' },
      { key: 'logs.user_added', label: 'Log: user added', type: 'title_color', titlePath: 'logs.user_added.title', colorPath: 'logs.user_added.color' },
      { key: 'logs.user_removed', label: 'Log: user removed', type: 'title_color', titlePath: 'logs.user_removed.title', colorPath: 'logs.user_removed.color' },
      { key: 'logs.transcript_generated', label: 'Log: transcript generated', type: 'title_color', titlePath: 'logs.transcript_generated.title', colorPath: 'logs.transcript_generated.color' },
      { key: 'logs.ticket_renamed', label: 'Log: ticket renamed', type: 'title_color', titlePath: 'logs.ticket_renamed.title', colorPath: 'logs.ticket_renamed.color' },
      { key: 'logs.blacklist_added', label: 'Log: user blacklisted', type: 'title_color', titlePath: 'logs.blacklist_added.title', colorPath: 'logs.blacklist_added.color' },
      { key: 'logs.blacklist_removed', label: 'Log: user removed from blacklist', type: 'title_color', titlePath: 'logs.blacklist_removed.title', colorPath: 'logs.blacklist_removed.color' },
    ],
  },
  {
    key: 'colors',
    label: 'Colors',
    items: [
      { key: 'colors.default', label: 'Default color', type: 'text', path: 'colors.default' },
      { key: 'colors.success', label: 'Color: success', type: 'text', path: 'colors.success' },
      { key: 'colors.danger', label: 'Color: danger', type: 'text', path: 'colors.danger' },
      { key: 'colors.warning', label: 'Color: warning', type: 'text', path: 'colors.warning' },
      { key: 'colors.info', label: 'Color: info', type: 'text', path: 'colors.info' },
      { key: 'colors.neutral', label: 'Color: neutral', type: 'text', path: 'colors.neutral' },
    ],
  },
];

function getPath(obj, path) {
  return path.split('.').reduce((acc, part) => (acc == null ? undefined : acc[part]), obj);
}

function setPath(obj, path, value) {
  const parts = path.split('.');
  let node = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    node = node[parts[i]];
  }
  node[parts[parts.length - 1]] = value;
}

function findCategory(categoryKey) {
  return CATEGORIES.find((c) => c.key === categoryKey);
}

function findItem(itemKey) {
  for (const category of CATEGORIES) {
    const item = category.items.find((i) => i.key === itemKey);
    if (item) return { category, item };
  }
  return null;
}

function itemLeafPaths(item) {
  if (item.type === 'text') return [item.path];
  if (item.type === 'label_emoji') return [item.labelPath, item.emojiPath];
  if (item.type === 'title_color') return [item.titlePath, item.colorPath];
  return [];
}

function allItemKeys() {
  return CATEGORIES.flatMap((c) => c.items.map((i) => i.key));
}

function allLeafPaths() {
  return CATEGORIES.flatMap((c) => c.items.flatMap(itemLeafPaths));
}

module.exports = { CATEGORIES, getPath, setPath, findCategory, findItem, itemLeafPaths, allItemKeys, allLeafPaths };
