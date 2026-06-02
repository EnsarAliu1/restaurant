import { UserRole } from "../db/schema";

const VALID: readonly UserRole[] = ["costumer", "support", "admin"];

export function parseRole(value: unknown) {
    if (typeof value === "string" && (VALID as readonly string[]).includes(value)) {
        return value as UserRole;
    }
    return "costumer";
}

export function isAdmin(role: UserRole) {
    return role === "admin";
}

export function isStaff(role: UserRole) {
    return role === "support" || role === "admin";
}