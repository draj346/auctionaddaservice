export const ROLES = {
    SUPER_ADMIN: "SUPER_ADMIN",
    ADMIN: "ADMIN",
    ORGANISER: "ORGANISER",
    OWNER: "OWNER",
    PLAYER: "PLAYER",
} as const;

export type PlayerRole = keyof typeof ROLES;

export const FORMATTING_ROLE_FOR_NOTFICATION = {
    SUPER_ADMIN: 'Admin',
    ADMIN: 'Admin',
    ORGANISER: 'Organiser',
    OWNER: 'Owner',
    PLAYER: 'You'
}