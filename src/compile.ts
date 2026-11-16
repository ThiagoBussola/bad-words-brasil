import { expand } from './pattern';
import { squeeze, termKey } from './normalize';
import type { Category, Severity, TermInput } from './types';
import type { LexiconGroup } from './lexicon/group';

export interface CompiledTerm {
    /** Letras a-z sem espaço. Expressões de várias palavras viram uma sequência com `·`. */
    key: string;
    /** Tokens da expressão (uma palavra cada). */
    tokens: string[];
    category: Category;
    severity: Severity;
    ambiguous: boolean;
}

export interface CompiledLexicon {
    /** Índice por primeira letra do primeiro token. */
    byFirst: Map<string, CompiledTerm[]>;
    /** Todas as chaves, para `remove`. */
    keys: Set<string>;
}

const SEVERITY_RANK: Record<Severity, number> = { low: 1, medium: 2, high: 3 };

export function severityAtLeast(value: Severity, minimum: Severity): boolean {
    return SEVERITY_RANK[value] >= SEVERITY_RANK[minimum];
}

export function bumpSeverity(value: Severity): Severity {
    if (value === 'low') return 'medium';
    if (value === 'medium') return 'high';
    return 'high';
}

/**
 * Plural e grafias comuns do português. Só aplica a palavras soltas (sem
 * espaço no padrão original), para não distorcer expressões.
 */
function variantsOf(word: string): string[] {
    const out = new Set<string>([word]);
    if (word.length < 3) return [...out];

    // Plural simples.
    if (!word.endsWith('s') && !word.endsWith('x')) out.add(`${word}s`);
    if (word.endsWith('ao')) out.add(`${word.slice(0, -2)}oes`);
    if (word.endsWith('m')) out.add(`${word.slice(0, -1)}ns`);

    // Trocas de chat: c↔k, ch↔x no início.
    if (word.startsWith('c') && !word.startsWith('ch')) out.add(`k${word.slice(1)}`);
    if (word.startsWith('k')) out.add(`c${word.slice(1)}`);
    if (word.startsWith('ch')) out.add(`x${word.slice(2)}`);
    if (word.startsWith('x') && word.length > 3) out.add(`ch${word.slice(1)}`);

    // "rr"/"ss" já entram pela compressão no matcher; aqui só a forma base.
    return [...out];
}

function compileTerm(
    raw: string,
    category: Category,
    severity: Severity,
    ambiguous: boolean,
): CompiledTerm[] {
    const expanded = expand(raw);
    const out: CompiledTerm[] = [];

    for (const form of expanded) {
        const tokens = form
            .split(/\s+/)
            .map(part => termKey(part))
            .filter(Boolean);
        if (tokens.length === 0) continue;

        const variants = tokens.length === 1
            ? variantsOf(tokens[0]).map(token => [token])
            : [tokens];

        for (const variant of variants) {
            const key = variant.join('·');
            out.push({
                key,
                tokens: variant,
                category,
                severity,
                ambiguous,
            });
        }
    }

    return out;
}

function fromInput(input: string | TermInput): CompiledTerm[] {
    if (typeof input === 'string') {
        return compileTerm(input, 'profanity', 'medium', false);
    }
    return compileTerm(
        input.term,
        input.category ?? 'profanity',
        input.severity ?? 'medium',
        input.ambiguous ?? false,
    );
}

function fromGroup(group: LexiconGroup): CompiledTerm[] {
    const out: CompiledTerm[] = [];
    for (const term of group.terms) {
        out.push(...compileTerm(term, group.category, group.severity, group.ambiguous === true));
    }
    return out;
}

function indexTerms(terms: CompiledTerm[]): CompiledLexicon {
    const byFirst = new Map<string, CompiledTerm[]>();
    const keys = new Set<string>();
    const seen = new Set<string>();

    for (const term of terms) {
        const fingerprint = `${term.key}|${term.category}|${term.severity}|${term.ambiguous}`;
        if (seen.has(fingerprint)) continue;
        seen.add(fingerprint);
        keys.add(term.key);

        const first = term.tokens[0][0];
        const bucket = byFirst.get(first);
        if (bucket) bucket.push(term);
        else byFirst.set(first, [term]);
    }

    // Termos mais longos primeiro: "filho da puta" ganha de "puta".
    for (const bucket of byFirst.values()) {
        bucket.sort((a, b) => b.key.length - a.key.length || a.key.localeCompare(b.key));
    }

    return { byFirst, keys };
}

export function compileLexicon(
    groups: readonly LexiconGroup[],
    add: readonly (string | TermInput)[] = [],
    remove: readonly string[] = [],
): CompiledLexicon {
    const terms: CompiledTerm[] = [];
    for (const group of groups) terms.push(...fromGroup(group));
    for (const extra of add) terms.push(...fromInput(extra));

    const removed = new Set(remove.map(value => {
        const tokens = value.split(/\s+/).map(part => termKey(part)).filter(Boolean);
        return tokens.join('·');
    }));

    const kept = removed.size === 0
        ? terms
        : terms.filter(term => !removed.has(term.key) && !removed.has(squeeze(term.key.replace(/·/g, ''))));

    return indexTerms(kept);
}

/** Chave de uma allow-list: o que a pessoa escreveu, já canônico. */
export function allowKey(value: string): string {
    return termKey(value) || value.trim().toLowerCase();
}
