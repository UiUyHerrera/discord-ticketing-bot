'use strict';

const { PermissionsBitField } = require('discord.js');

function isStaff(member, guildConfig, extraRoleIds = []) {
  if (!member || !guildConfig) return false;
  if (member.permissions.has(PermissionsBitField.Flags.Administrator)) return true;
  if (member.permissions.has(PermissionsBitField.Flags.ManageGuild)) return true;

  const roleIds = new Set(extraRoleIds.filter(Boolean));
  if (guildConfig.staff_role_id) roleIds.add(guildConfig.staff_role_id);

  for (const roleId of roleIds) {
    if (member.roles.cache.has(roleId)) return true;
  }
  return false;
}

function botHasPermissions(guild, permissionsArray) {
  const me = guild.members.me;
  if (!me) return false;
  return me.permissions.has(permissionsArray);
}

function isAdmin(member) {
  if (!member) return false;
  return (
    member.permissions.has(PermissionsBitField.Flags.Administrator) ||
    member.permissions.has(PermissionsBitField.Flags.ManageGuild)
  );
}

module.exports = { isStaff, botHasPermissions, isAdmin };
