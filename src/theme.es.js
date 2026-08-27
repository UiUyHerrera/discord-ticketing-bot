'use strict';

const embeds = {
  successTitle: 'Listo',
  errorTitle: 'Error',
  warningTitle: 'Atención',
  infoTitle: 'Información',
};

const common = {
  notConfigured: '*Sin configurar*',
  noCategory: 'Sin categoría',
  unclaimed: 'Sin reclamar',
  unassigned: 'Sin asignar',
  noData: 'Sin datos',
  unknown: 'Desconocido',
};

const status = {
  open: 'Abierto',
  locked: 'Bloqueado',
  closed: 'Cerrado',
};

const ticket = {
  defaultPanelTitle: 'Sistema de Tickets',
  defaultPanelDescription: 'Selecciona una opción a continuación o pulsa el botón para abrir un ticket con nuestro equipo.',
  panelFooter: 'Sistema de Tickets',
  categorySelectPlaceholder: 'Selecciona el motivo de tu ticket',

  embedTitleTemplate: 'Ticket #{number}',
  embedDescriptionTemplate: 'Hola {user}\nGracias por contactar con nuestro equipo.\nUn miembro del staff te atenderá lo antes posible.',
  embedFooterTemplate: 'Ticket #{number}',

  fields: {
    user: 'Usuario',
    category: 'Categoría',
    createdAt: 'Creado',
    responsible: 'Responsable',
    state: 'Estado',
  },

  buttons: {
    close: { label: 'Cerrar Ticket', emoji: null },
    unclaim: { label: 'Liberar Ticket', emoji: null },
    claim: { label: 'Reclamar Ticket', emoji: null },
    unlock: { label: 'Desbloquear', emoji: null },
    lock: { label: 'Bloquear Ticket', emoji: null },
    transcript: { label: 'Transcript', emoji: null },
    addUser: { label: 'Agregar Usuario', emoji: null },
    removeUser: { label: 'Quitar Usuario', emoji: null },
    createTicket: { label: 'Crear Ticket', emoji: null },
    confirmClose: { label: 'Confirmar', emoji: null },
    cancelClose: { label: 'Cancelar', emoji: null },
    goToTicket: { label: 'Ir al Ticket', emoji: null },
    deleteTicket: { label: 'Eliminar Ticket', emoji: null },
    reopenTicket: { label: 'Reabrir Ticket', emoji: null },
  },
};

const userModals = {
  addTitle: 'Agregar usuario al ticket',
  removeTitle: 'Quitar usuario del ticket',
  inputLabel: 'ID o mención del usuario',
  inputPlaceholder: 'Ej: 123456789012345678',
};

const userInfo = {
  title: 'Información del Ticket',
  fields: {
    number: 'Número',
    user: 'Usuario',
    category: 'Categoría',
    staff: 'Staff',
    state: 'Estado',
    createdAt: 'Creado',
    closedAt: 'Cerrado',
    closedBy: 'Cerrado por',
  },
};

module.exports = { embeds, common, status, ticket, userModals, userInfo };
