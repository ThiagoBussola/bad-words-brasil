import { allowKey, compileLexicon, severityAtLeast } from './compile';
import { defaultLexicon } from './lexicon';
import { findMatches } from './match';
import { normalize } from './normalize';
import type {
    Analysis,
    Category,
    CensorOptions,
    Filter,
    FilterOptions,
    Match,
    Severity,
} from './types';

const ALL_CATEGORIES: readonly Category[] = [
    'profanity',
    'insult',
    'sexual',
    'hate',
    'harassment',
    'threat',
];

function maskFor(raw: string, mask: string, style: 'full' | 'keep-first' | 'keep-edges'): string {
    const chars = Array.from(raw);
    if (chars.length === 0) return '';
    if (style === 'full') return mask.repeat(chars.length);
    if (style === 'keep-first') {
        return chars[0] + mask.repeat(Math.max(0, chars.length - 1));
    }
    if (chars.length === 1) return chars[0];
    if (chars.length === 2) return chars[0] + mask;
    return chars[0] + mask.repeat(chars.length - 2) + chars[chars.length - 1];
}

/** `allow: ['merda']` também libera "que merda" e "puta merda". */
function isAllowed(match: Match, allow: Set<string>): boolean {
    if (allow.size === 0) return false;
    if (allow.has(allowKey(match.raw)) || allow.has(allowKey(match.term))) return true;
    if (allow.has(normalize(match.raw))) return true;
    for (const token of match.term.split(/\s+/)) {
        if (allow.has(token)) return true;
    }
    return false;
}

function uniqueCategories(matches: Match[]): Category[] {
    const seen = new Set<Category>();
    const out: Category[] = [];
    for (const match of matches) {
        if (seen.has(match.category)) continue;
        seen.add(match.category);
        out.push(match.category);
    }
    return out;
}

function maxSeverity(matches: Match[]): Severity | null {
    if (matches.length === 0) return null;
    let best: Severity = 'low';
    for (const match of matches) {
        if (severityAtLeast(match.severity, best) && match.severity !== best) {
            best = match.severity;
        } else if (match.severity === 'high') {
            best = 'high';
        } else if (match.severity === 'medium' && best === 'low') {
            best = 'medium';
        }
    }
    return best;
}

export function createFilter(options: FilterOptions = {}): Filter {
    const categories = new Set(options.categories ?? ALL_CATEGORIES);
    const minSeverity = options.minSeverity ?? 'low';
    const strict = options.strict === true;
    const allow = new Set((options.allow ?? []).map(allowKey).filter(Boolean));
    const lexicon = compileLexicon(defaultLexicon, options.add ?? [], options.remove ?? []);

    function analyze(text: string): Analysis {
        if (typeof text !== 'string') {
            throw new TypeError('bad-words-brasil: analyze() espera uma string');
        }
        if (text.length === 0) {
            return { flagged: false, severity: null, categories: [], matches: [] };
        }

        const matches = findMatches(text, lexicon, { strict }).filter(match => {
            if (!categories.has(match.category)) return false;
            if (!severityAtLeast(match.severity, minSeverity)) return false;
            if (isAllowed(match, allow)) return false;
            return true;
        });

        return {
            flagged: matches.length > 0,
            severity: maxSeverity(matches),
            categories: uniqueCategories(matches),
            matches,
        };
    }

    function isProfane(text: string): boolean {
        return analyze(text).flagged;
    }

    function censor(text: string, censorOptions: CensorOptions = {}): string {
        if (typeof text !== 'string') {
            throw new TypeError('bad-words-brasil: censor() espera uma string');
        }
        const { matches } = analyze(text);
        if (matches.length === 0) return text;

        const mask = censorOptions.mask ?? '*';
        const style = censorOptions.style ?? 'full';
        const replace = censorOptions.replace;

        // De trás para frente, para não deslocar índices.
        const ordered = [...matches].sort((a, b) => b.start - a.start);
        let out = text;
        for (const match of ordered) {
            const piece = replace
                ? replace(match)
                : maskFor(match.raw, mask, style);
            out = out.slice(0, match.start) + piece + out.slice(match.end);
        }
        return out;
    }

    return { analyze, isProfane, censor };
}

/** Instância padrão, criada na primeira chamada. */
let shared: Filter | null = null;

function getShared(): Filter {
    if (!shared) shared = createFilter();
    return shared;
}

export function analyze(text: string): Analysis {
    return getShared().analyze(text);
}

export function isProfane(text: string): boolean {
    return getShared().isProfane(text);
}

export function censor(text: string, options?: CensorOptions): string {
    return getShared().censor(text, options);
}

/**
 * Compatível com a v1: devolve `true` se o texto tiver termo apontado.
 * Aceita só string (a v1 lançava string em tipo errado; aqui é TypeError).
 */
export function preventableWord(word: string): boolean {
    if (typeof word !== 'string') {
        throw new TypeError('É necessário que o parametro seja um String');
    }
    if (word.length < 1) return false;
    return isProfane(word);
}
