/**
 * Leitura de caracteres: cada caractere do texto original vira um "glifo" com
 * a letra que ele representa, sem perder a posição de origem.
 */

export type GlyphKind = 'letter' | 'leet' | 'digit' | 'mask' | 'separator' | 'space' | 'ignore';

export interface Glyph {
    kind: GlyphKind;
    /** Letras a-z que o caractere representa. Vazio para máscara, separador e espaço. */
    letters: string;
    /** Segunda leitura possível ("1" pode ser "i" ou "l"; "@" pode ser "a" ou "o"). */
    alt?: string;
    /** Posição do caractere no texto original. */
    start: number;
    /** Posição final, exclusiva. */
    end: number;
}

/** Símbolos e dígitos usados no lugar de letras. */
const LEET: Record<string, { letters: string; alt?: string }> = {
    '4': { letters: 'a' },
    '@': { letters: 'a', alt: 'o' },
    '3': { letters: 'e' },
    '€': { letters: 'e' },
    '1': { letters: 'i', alt: 'l' },
    '!': { letters: 'i', alt: 'l' },
    '|': { letters: 'i', alt: 'l' },
    '0': { letters: 'o' },
    '5': { letters: 's' },
    $: { letters: 's' },
    '7': { letters: 't' },
};

/** Caracteres que escondem uma letra. */
const MASKS = new Set(['*', '#', '•', '∗', '＊']);

/** Letras de outros alfabetos com o mesmo desenho de uma letra latina. */
const HOMOGLYPHS: Record<string, string> = {
    // Cirílico
    а: 'a', в: 'b', е: 'e', к: 'k', м: 'm', н: 'h', о: 'o', р: 'p', с: 'c', т: 't', у: 'y', х: 'x',
    і: 'i', ј: 'j', ѕ: 's',
    // Grego
    α: 'a', β: 'b', ε: 'e', ι: 'i', κ: 'k', ν: 'v', ο: 'o', ρ: 'p', τ: 't', υ: 'u', χ: 'x',
    // Latinas que não se decompõem
    ø: 'o', đ: 'd', ł: 'l', æ: 'ae', œ: 'oe', ß: 'ss', ı: 'i',
};

const COMBINING = /\p{M}/gu;
const IGNORABLE = /[\u00AD\u034F\u061C\u115F\u1160\u17B4\u17B5\u180B-\u180E\u200B-\u200F\u202A-\u202E\u2060-\u206F\uFE00-\uFE0F\uFEFF]/u;
const ONLY_COMBINING = /^\p{M}+$/u;
const WHITESPACE = /\s/u;
const ASCII_LETTERS = /^[a-z]+$/;

function toLetters(char: string): string {
    const lower = char.toLowerCase();
    const mapped = HOMOGLYPHS[lower];
    if (mapped) return mapped;

    // NFKD separa acento da letra e desfaz letras estilizadas (𝓹 → p, ｐ → p).
    const base = lower.normalize('NFKD').replace(COMBINING, '');
    if (ASCII_LETTERS.test(base)) return base;

    let out = '';
    for (const piece of base) {
        const fallback = HOMOGLYPHS[piece];
        if (fallback) out += fallback;
        else if (ASCII_LETTERS.test(piece)) out += piece;
        else return '';
    }
    return out;
}

function classify(char: string, start: number): Glyph {
    const end = start + char.length;

    if (WHITESPACE.test(char)) return { kind: 'space', letters: '', start, end };
    if (IGNORABLE.test(char) || ONLY_COMBINING.test(char)) return { kind: 'ignore', letters: '', start, end };
    if (MASKS.has(char)) return { kind: 'mask', letters: '', start, end };

    const leet = LEET[char];
    if (leet) return { kind: 'leet', letters: leet.letters, alt: leet.alt, start, end };

    if (char >= '0' && char <= '9') return { kind: 'digit', letters: '', start, end };

    const letters = toLetters(char);
    if (letters) return { kind: 'letter', letters, start, end };

    return { kind: 'separator', letters: '', start, end };
}

/** Lê o texto caractere a caractere (por code point), guardando a posição de cada um. */
export function readGlyphs(text: string): Glyph[] {
    const glyphs: Glyph[] = [];
    let index = 0;
    for (const char of text) {
        glyphs.push(classify(char, index));
        index += char.length;
    }
    return glyphs;
}

/** Junta letras repetidas: "puuuta" → "puta", "porra" → "pora". */
export function squeeze(value: string): string {
    let out = '';
    let previous = '';
    for (const char of value) {
        if (char !== previous) out += char;
        previous = char;
    }
    return out;
}

/**
 * Forma canônica de uma palavra ou expressão: minúsculas, sem acento, com
 * símbolos lidos como letras, e só letras a-z separadas por espaço simples.
 * Útil para comparar texto digitado com listas próprias.
 */
export function normalize(text: string): string {
    let out = '';
    let pendingSpace = false;
    for (const glyph of readGlyphs(text)) {
        if (glyph.kind === 'ignore') continue;
        if (glyph.kind === 'letter' || glyph.kind === 'leet') {
            if (pendingSpace && out) out += ' ';
            pendingSpace = false;
            out += glyph.letters;
        } else if (glyph.kind === 'space') {
            pendingSpace = true;
        }
    }
    return out;
}

/**
 * Chave de dicionário de um termo escrito por quem mantém o léxico: só letras,
 * sem acento. Diferente de `normalize`, não lê dígito nem símbolo como letra.
 */
export function termKey(term: string): string {
    let out = '';
    for (const glyph of readGlyphs(term)) {
        if (glyph.kind === 'letter') out += glyph.letters;
    }
    return out;
}
