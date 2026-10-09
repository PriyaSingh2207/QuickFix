/**
 * QuickFix Custom Avatar System
 * 30 High-Quality Illustrated Character Avatars
 */

export const AVATAR_LIST: string[] = Array.from(
    { length: 30 },
    (_, i) => `/avatars/avatar-${i + 1}.png`
);

/**
 * Returns a deterministic avatar from the 30 custom avatars based on a string seed (e.g., username or user id).
 */
export function getDefaultAvatar(seed?: string): string {
    if (!seed || seed.trim().length === 0) {
        return AVATAR_LIST[0];
    }
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = (hash << 5) - hash + seed.charCodeAt(i);
        hash |= 0;
    }
    const index = Math.abs(hash) % AVATAR_LIST.length;
    return AVATAR_LIST[index];
}

/**
 * Resolves an avatar URL:
 * - If user chose one of the custom avatars (/avatars/avatar-X.png) or a valid non-dicebear URL, use it.
 * - If missing, empty, or using legacy dicebear URL, map deterministically to one of the 30 custom avatars.
 */
export function getAvatarUrl(avatarUrl?: string | null, seed?: string): string {
    if (avatarUrl && avatarUrl.trim() !== '' && !avatarUrl.includes('dicebear.com')) {
        return avatarUrl;
    }
    return getDefaultAvatar(seed);
}
