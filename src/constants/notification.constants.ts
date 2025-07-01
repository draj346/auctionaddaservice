export const NOTIFICATIONS = {
  PROFILE_UPDATE: "profile_update",
  APPROVAL_REQUEST: "approval_request",
  UPDATE_APPROVED: "update_approved",
  UPDATE_REJECTED: "update_rejected",
  PROFILE_CREATED: "profile_created",
  PASSWORD_UPDATED: "password_updated",
  AUCTION_CREATED: "auction_created",
  TEAM_CREATED: "team_created",
  FEEDBACK: "feedback",
  GENERAL: "general",
} as const;

export type NotificationType = keyof typeof NOTIFICATIONS;

export const NOTIFICATION_TYPE_MESSAGE = {
    profile_update: '',
    approval_request: '',
    update_approved: 'updating your profile',
    update_rejected: 'your profile',
    profile_created: '',
    auction_created: '',
    team_created: '',
    feedback: '',
    general: ''
}


export const PENDING_UPDATES_STATUS = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected'
}

export type PendingUpdateStatusType = keyof typeof PENDING_UPDATES_STATUS;


export const AUDIT_CHANGED_TYPE = {
    CREATE: 'create',
    UPDATE: 'update',
    DELETE: 'delete',
}

export type AuditChangedType = keyof typeof AUDIT_CHANGED_TYPE;


export const NotificationMessage = {
    ACCOUNT_CREATE_BY_SELF: 'You have successfully created your account',
    ACCOUNT_CREATE_BY_ELSE: 'Your account successfully create by',
    PASSWORD_UPDATED: 'You have successfully updated your account password',
    ACCOUNT_UPDATE_BY_SELF: 'You have successfully updated your profile',
    ACCOUNT_UPDATE_BY_ELSE: 'Your profile successfully updated by',
    STATUS_CHANGE_TO_NON_PLAYER: 'Your profile successfully updated as non player by admin.',
    STATUS_CHANGE_TO_PLAYER: 'Your profile successfully updated as player from non player by admin.',
    CHANGE_ROLE_TO_ADMIN: 'Congratulation!!. Your role successfully updated to admin.',
    REMOVE_ROLE_FROM_ADMIN: 'Sorry to inform you that your admin role is removed from your profile.',
    APPROVED_PROFILE: 'Your profile successfully approved by',


}