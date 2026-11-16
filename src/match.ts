import type { CompiledLexicon, CompiledTerm } from './compile';
import { bumpSeverity } from './compile';
import { Glyph, readGlyphs, squeeze } from './normalize';
import type { Match, MatchKind } from './types';

interface WordSpan {
    /** Letras lidas (leet já virado letra). */
    letters: string;
    /** Letras comprimidas (sem repetição). */
    squeezed: string;
    /** Teve máscara (* #) no meio ou no fim. */
    masked: boolean;
    /** Teve leet, separador entre letras, ou letra repetida demais. */
    obfuscated: boolean;
    start: number;
    end: number;
    /** Índice do primeiro glifo desta palavra. */
    from: number;
    /** Índice do glifo depois da palavra. */
    to: number;
}

const DIRECTED_PREFIX = /^(seu|sua|teu|tua|voce\s+e\s+(um|uma)|vc\s+e\s+(um|uma)|tu\s+e\s+(um|uma)|voce\s+eh\s+(um|uma)|e\s+(um|uma)|sua\s+cara\s+de)$/;

function isLetterLike(glyph: Glyph): boolean {
    return glyph.kind === 'letter' || glyph.kind === 'leet';
}

/**
 * Parte o texto em "palavras" tolerantes: letras e leet contam; separadores e
 * máscaras no meio não quebram a palavra ("p.u.t.a", "f*d*"); espaço e dígito
 * solto quebram.
 */
export function scanWords(text: string): { glyphs: Glyph[]; words: WordSpan[] } {
    const glyphs = readGlyphs(text);
    const words: WordSpan[] = [];
    let i = 0;

    while (i < glyphs.length) {
        while (i < glyphs.length && !isLetterLike(glyphs[i]) && glyphs[i].kind !== 'mask') i += 1;
        if (i >= glyphs.length) break;

        // Máscara sozinha no começo não inicia palavra.
        if (glyphs[i].kind === 'mask') {
            const next = glyphs[i + 1];
            if (!next || !isLetterLike(next)) {
                i += 1;
                continue;
            }
        }

        const from = i;
        const start = glyphs[i].start;
        let letters = '';
        let masked = false;
        let obfuscated = false;
        let lastWasLetter = false;
        let gap = 0;

        while (i < glyphs.length) {
            const glyph = glyphs[i];

            if (isLetterLike(glyph)) {
                if (gap > 0) obfuscated = true;
                if (glyph.kind === 'leet') obfuscated = true;
                letters += glyph.letters;
                lastWasLetter = true;
                gap = 0;
                i += 1;
                continue;
            }

            if (glyph.kind === 'mask') {
                masked = true;
                obfuscated = true;
                gap = 0;
                i += 1;
                continue;
            }

            if (glyph.kind === 'ignore') {
                i += 1;
                continue;
            }

            // Separador entre letras: "p.u.t.a", "f-o-d-a".
            if (glyph.kind === 'separator' && lastWasLetter) {
                const look = glyphs[i + 1];
                if (look && (isLetterLike(look) || look.kind === 'mask')) {
                    obfuscated = true;
                    gap += 1;
                    i += 1;
                    continue;
                }
            }

            break;
        }

        const end = glyphs[i - 1]?.end ?? start;
        if (letters.length === 0 && !masked) continue;

        // Compressão: "puuuta" → "puta". Se encolheu, contou como disfarce.
        const squeezed = squeeze(letters);
        if (squeezed.length < letters.length) obfuscated = true;

        words.push({
            letters,
            squeezed,
            masked,
            obfuscated,
            start,
            end,
            from,
            to: i,
        });
    }

    return { glyphs, words: collapseSpacedLetters(words, glyphs) };
}

/**
 * "f o d a" e "p u t a" viram uma palavra só. Só junta corridas de letras
 * soltas (1 caractere) separadas só por espaço — não mistura com palavra maior.
 */
function collapseSpacedLetters(words: WordSpan[], glyphs: Glyph[]): WordSpan[] {
    if (words.length < 2) return words;

    const out: WordSpan[] = [];
    let i = 0;

    while (i < words.length) {
        if (words[i].squeezed.length !== 1 && words[i].letters.length !== 1) {
            out.push(words[i]);
            i += 1;
            continue;
        }

        let j = i;
        while (
            j + 1 < words.length
            && (words[j + 1].squeezed.length === 1 || words[j + 1].letters.length === 1)
            && onlySpaceBetween(glyphs, words[j].to, words[j + 1].from)
        ) {
            j += 1;
        }

        if (j === i) {
            out.push(words[i]);
            i += 1;
            continue;
        }

        const slice = words.slice(i, j + 1);
        const letters = slice.map(word => word.letters || word.squeezed).join('');
        out.push({
            letters,
            squeezed: squeeze(letters),
            masked: slice.some(word => word.masked),
            obfuscated: true,
            start: slice[0].start,
            end: slice[slice.length - 1].end,
            from: slice[0].from,
            to: slice[slice.length - 1].to,
        });
        i = j + 1;
    }

    return out;
}

function onlySpaceBetween(glyphs: Glyph[], from: number, to: number): boolean {
    for (let i = from; i < to; i += 1) {
        const kind = glyphs[i].kind;
        if (kind !== 'space' && kind !== 'ignore') return false;
    }
    return true;
}

function wordMatchesToken(word: WordSpan, token: string): { ok: boolean; kind: MatchKind } | null {
    if (word.letters === token) {
        return { ok: true, kind: word.obfuscated ? 'obfuscated' : 'exact' };
    }
    if (word.squeezed === token) {
        return { ok: true, kind: 'obfuscated' };
    }

    // Máscara: "fod***", "p*rra". Usa as letras visíveis sem comprimir —
    // comprimir "prra" → "pra" faria "porca" casar no lugar de "porra".
    if (word.masked && lettersFitMask(word.letters, token)) {
        return { ok: true, kind: 'masked' };
    }

    return null;
}

/**
 * Máscara só casa com termo "parecido", não com qualquer palavra que contenha
 * as letras em ordem ("fod***" não pode virar "fornicando").
 *
 * - `fod***` → termo começa com `fod`
 * - `***alho` → termo termina com `alho`
 * - `p*rra` → letras visíveis com no máximo o número de buracos compatível
 */
function lettersFitMask(visible: string, token: string): boolean {
    if (visible.length === 0) return false;
    if (visible.length > token.length) return false;
    if (token.length - visible.length > Math.max(3, visible.length)) return false;

    if (token.startsWith(visible) && token.length > visible.length) return true;
    if (token.endsWith(visible) && token.length > visible.length) return true;

    // Meio: percorre o termo; cada letra visível tem de aparecer em ordem,
    // e pelo menos um caractere do termo fica sem letra visível (o buraco).
    let ti = 0;
    let gaps = 0;
    for (let vi = 0; vi < visible.length; vi += 1) {
        const start = ti;
        while (ti < token.length && token[ti] !== visible[vi]) ti += 1;
        if (ti >= token.length) return false;
        gaps += ti - start;
        ti += 1;
    }
    gaps += token.length - ti;
    return gaps >= 1 && gaps <= Math.max(2, Math.ceil(visible.length / 2));
}

function isDirectedBefore(words: WordSpan[], index: number): boolean {
    // Olha até 4 palavras antes e monta um prefixo canônico.
    const from = Math.max(0, index - 4);
    const prefix = words.slice(from, index).map(word => word.squeezed).join(' ');
    if (!prefix) return false;

    // Casos curtos: "seu", "sua", "teu", "tua".
    const last = words[index - 1]?.squeezed;
    if (last && /^(seu|sua|teu|tua)$/.test(last)) return true;

    // "voce e um", "vc e uma", "e um", "e uma".
    if (/(^|\s)(voce|vc|tu)\s+(e|eh)\s+(um|uma)$/.test(prefix)) return true;
    if (/(^|\s)(e|eh)\s+(um|uma)$/.test(prefix)) return true;

    return DIRECTED_PREFIX.test(prefix);
}

function kindForPhrase(parts: { kind: MatchKind }[]): MatchKind {
    if (parts.some(part => part.kind === 'masked')) return 'masked';
    if (parts.some(part => part.kind === 'obfuscated')) return 'obfuscated';
    return 'phrase';
}

interface RawHit {
    term: CompiledTerm;
    start: number;
    end: number;
    kind: MatchKind;
    directed: boolean;
    wordFrom: number;
    wordTo: number;
}

const KIND_RANK: Record<MatchKind, number> = {
    exact: 0,
    phrase: 1,
    obfuscated: 2,
    masked: 3,
};

/** Menor = melhor. Prefere casa limpa; em máscara, o termo mais curto. */
function preferHit(a: RawHit, b: RawHit): number {
    const kind = KIND_RANK[a.kind] - KIND_RANK[b.kind];
    if (kind !== 0) return kind;
    if (a.kind === 'masked') return a.term.key.length - b.term.key.length;
    return b.term.key.length - a.term.key.length;
}

function tryMatchAt(
    words: WordSpan[],
    index: number,
    term: CompiledTerm,
): Omit<RawHit, 'term' | 'directed'> | null {
    if (index + term.tokens.length > words.length) return null;

    const parts: { kind: MatchKind }[] = [];
    for (let t = 0; t < term.tokens.length; t += 1) {
        const hit = wordMatchesToken(words[index + t], term.tokens[t]);
        if (!hit) return null;
        parts.push(hit);
    }

    const first = words[index];
    const last = words[index + term.tokens.length - 1];
    const kind = term.tokens.length === 1 ? parts[0].kind : kindForPhrase(parts);

    return {
        start: first.start,
        end: last.end,
        kind: kind === 'exact' && term.tokens.length > 1 ? 'phrase' : kind,
        wordFrom: index,
        wordTo: index + term.tokens.length,
    };
}

/**
 * Encontra ocorrências sem sobreposição, preferindo o termo mais longo e a
 * posição mais à esquerda.
 */
export function findMatches(
    text: string,
    lexicon: CompiledLexicon,
    options: { strict: boolean },
): Match[] {
    const { words } = scanWords(text);
    if (words.length === 0) return [];

    const hits: RawHit[] = [];

    for (let i = 0; i < words.length; i += 1) {
        const firstLetter = words[i].squeezed[0] || words[i].letters[0];
        if (!firstLetter) continue;
        const bucket = lexicon.byFirst.get(firstLetter);
        if (!bucket) continue;

        let best: RawHit | null = null;

        for (const term of bucket) {
            const found = tryMatchAt(words, i, term);
            if (!found) continue;

            const directed = isDirectedBefore(words, i);
            const obfuscated = found.kind === 'obfuscated' || found.kind === 'masked';

            // Ambíguo só entra se strict, dirigido ou disfarçado.
            if (term.ambiguous && !options.strict && !directed && !obfuscated) continue;

            const hit: RawHit = { term, directed, ...found };
            if (!best || preferHit(hit, best) < 0) best = hit;

            // Casa exata/frase longa: pode parar (bucket já é do maior para o menor).
            if (found.kind === 'exact' || found.kind === 'phrase') break;
        }

        if (best) hits.push(best);
    }

    // Resolve sobreposições: ganha quem começa antes; empate, o mais longo.
    hits.sort((a, b) => a.start - b.start || (b.end - b.start) - (a.end - a.start));

    const chosen: RawHit[] = [];
    let cursor = -1;
    for (const hit of hits) {
        if (hit.start < cursor) continue;
        chosen.push(hit);
        cursor = hit.end;
    }

    return chosen.map(hit => {
        let severity = hit.term.severity;
        if (hit.directed) severity = bumpSeverity(severity);

        return {
            term: hit.term.tokens.join(' '),
            category: hit.term.category,
            severity,
            kind: hit.kind,
            raw: text.slice(hit.start, hit.end),
            start: hit.start,
            end: hit.end,
            directed: hit.directed,
        };
    });
}
