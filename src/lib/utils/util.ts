export function getRandomEnumValue<T extends Record<string, string>>(enumData: T): T[keyof T] {
    const values = Object.values(enumData).filter(v => typeof v === 'string'); // avoid reverse numeric mappings
    const randomIndex = Math.floor(Math.random() * values.length);
    return values[randomIndex] as T[keyof T];
}