export const ROLES = {
    SUPER_ADMIN: "SUPER_ADMIN",
    ADMIN: "ADMIN",
    ORGANISER: "ORGANISER",
    OWNER: "OWNER",
    PLAYER: "PLAYER",
} as const;

export type PlayerRole = keyof typeof ROLES;
