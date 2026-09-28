// --------------------------------------------------
// NexusFlow RBAC Permissions
// --------------------------------------------------

export const ROLES = {
  OWNER: "owner",
  ADMIN: "admin",
  MANAGER: "manager",
  MEMBER: "member",
  VIEWER: "viewer",
};

export const PERMISSIONS = {
  VIEW_WORKSPACE: "view_workspace",

  INVITE_MEMBERS: "invite_members",
  MANAGE_MEMBERS: "manage_members",
  CHANGE_ROLES: "change_roles",
  REMOVE_MEMBERS: "remove_members",

  CREATE_PROJECT: "create_project",
  EDIT_PROJECT: "edit_project",
  DELETE_PROJECT: "delete_project",

  CREATE_TASK: "create_task",
  EDIT_TASK: "edit_task",
  DELETE_TASK: "delete_task",

  VIEW_ANALYTICS: "view_analytics",
  MANAGE_BILLING: "manage_billing",

  MANAGE_SETTINGS: "manage_settings",
};

// --------------------------------------------------
// Permission matrix
// --------------------------------------------------

const ROLE_PERMISSIONS = {
  [ROLES.OWNER]: [
    PERMISSIONS.VIEW_WORKSPACE,

    PERMISSIONS.INVITE_MEMBERS,
    PERMISSIONS.MANAGE_MEMBERS,
    PERMISSIONS.CHANGE_ROLES,
    PERMISSIONS.REMOVE_MEMBERS,

    PERMISSIONS.CREATE_PROJECT,
    PERMISSIONS.EDIT_PROJECT,
    PERMISSIONS.DELETE_PROJECT,

    PERMISSIONS.CREATE_TASK,
    PERMISSIONS.EDIT_TASK,
    PERMISSIONS.DELETE_TASK,

    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.MANAGE_BILLING,
    PERMISSIONS.MANAGE_SETTINGS,
  ],

  [ROLES.ADMIN]: [
    PERMISSIONS.VIEW_WORKSPACE,

    PERMISSIONS.INVITE_MEMBERS,
    PERMISSIONS.MANAGE_MEMBERS,
    PERMISSIONS.CHANGE_ROLES,
    PERMISSIONS.REMOVE_MEMBERS,

    PERMISSIONS.CREATE_PROJECT,
    PERMISSIONS.EDIT_PROJECT,
    PERMISSIONS.DELETE_PROJECT,

    PERMISSIONS.CREATE_TASK,
    PERMISSIONS.EDIT_TASK,
    PERMISSIONS.DELETE_TASK,

    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.MANAGE_SETTINGS,
  ],

  [ROLES.MANAGER]: [
    PERMISSIONS.VIEW_WORKSPACE,

    PERMISSIONS.CREATE_PROJECT,
    PERMISSIONS.EDIT_PROJECT,

    PERMISSIONS.CREATE_TASK,
    PERMISSIONS.EDIT_TASK,
    PERMISSIONS.DELETE_TASK,

    PERMISSIONS.VIEW_ANALYTICS,
  ],

  [ROLES.MEMBER]: [
    PERMISSIONS.VIEW_WORKSPACE,

    PERMISSIONS.CREATE_PROJECT,
    PERMISSIONS.EDIT_PROJECT,

    PERMISSIONS.CREATE_TASK,
    PERMISSIONS.EDIT_TASK,

    PERMISSIONS.VIEW_ANALYTICS,
  ],

  [ROLES.VIEWER]: [
    PERMISSIONS.VIEW_WORKSPACE,

    PERMISSIONS.VIEW_ANALYTICS,
  ],
};

// --------------------------------------------------
// Check permission
// --------------------------------------------------

export const hasPermission = (role, permission) => {
  if (!role) {
    return false;
  }

  const permissions = ROLE_PERMISSIONS[role] || [];

  return permissions.includes(permission);
};

// --------------------------------------------------
// Get all permissions for a role
// --------------------------------------------------

export const getRolePermissions = (role) => {
  return ROLE_PERMISSIONS[role] || [];
};

// --------------------------------------------------
// Check whether role is valid
// --------------------------------------------------

export const isValidRole = (role) => {
  return Object.values(ROLES).includes(role);
};