/**Znaki zabronione w nazwach plików/folderów Windows*/
export const RESTRICTED_SYMBOLS = [
    '/', '\\', ':', '*', '?', '"', '<', '>', '|',
] as const;

/**Znaki kontrolne 0x00–0x1F*/
export const CONTROL_CHARS = Array.from(
    { length: 32 },
    (_, i) => String.fromCharCode(i)
);

/** Nazwy zarezerwowane przez Windows. */
export const RESERVED_NAMES = [
    'CON', 'PRN', 'AUX', 'NUL',
    'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9',
    'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9',
] as const;

/** Znaki niedozwolone na końcu nazwy*/
export const TRAILING_FORBIDDEN = ['.', ' '] as const;