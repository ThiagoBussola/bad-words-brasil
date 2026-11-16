/**
 * Mini-sintaxe do léxico: alternativas entre parênteses, com aninhamento.
 *
 *   "otari(o|a)"             → otario, otaria
 *   "vai (se|te) foder"      → vai se foder, vai te foder
 *   "(muito |)gostosa"       → muito gostosa, gostosa
 *   "{vc} vai morrer"        → voce vai morrer, vc vai morrer, ...
 */

const MACROS: Record<string, string> = {
    // Segunda pessoa como sujeito.
    vc: '(voce|vc|ce|tu)',
    // Segunda pessoa como objeto.
    te: '(te|lhe)',
    // Possessivo de segunda pessoa.
    seu: '(seu|sua|teu|tua)',
    // "é" e "está", como se escreve em chat.
    e: '(e|eh|es|ta|tah|esta)',
    // Primeira pessoa indo fazer algo.
    vou: '(vou|vo|irei)',
};

const MAX_EXPANSIONS = 20_000;

function applyMacros(pattern: string): string {
    return pattern.replace(/\{(\w+)\}/g, (whole, name: string) => {
        const macro = MACROS[name];
        if (!macro) throw new Error(`bad-words-brasil: macro desconhecida "${whole}" em "${pattern}"`);
        return macro;
    });
}

function combine(left: string[], right: string[], pattern: string): string[] {
    if (left.length * right.length > MAX_EXPANSIONS) {
        throw new Error(`bad-words-brasil: o padrão "${pattern}" gera combinações demais`);
    }
    const out: string[] = [];
    for (const a of left) for (const b of right) out.push(a + b);
    return out;
}

/** Devolve todas as formas que o padrão descreve. */
export function expand(pattern: string): string[] {
    const source = applyMacros(pattern);
    let position = 0;

    // sequência := (literal | grupo)*
    function sequence(): string[] {
        let results = [''];
        while (position < source.length) {
            const char = source[position];
            if (char === '|' || char === ')') break;
            if (char === '(') {
                position += 1;
                results = combine(results, group(), pattern);
            } else {
                let literal = '';
                while (position < source.length && !'(|)'.includes(source[position])) {
                    literal += source[position];
                    position += 1;
                }
                results = combine(results, [literal], pattern);
            }
        }
        return results;
    }

    // grupo := sequência ('|' sequência)* ')'
    function group(): string[] {
        const options: string[] = [];
        for (;;) {
            options.push(...sequence());
            const char = source[position];
            position += 1;
            if (char === ')') return options;
            if (char !== '|') throw new Error(`bad-words-brasil: parêntese sem fechar em "${pattern}"`);
        }
    }

    const results = sequence();
    if (position < source.length) {
        throw new Error(`bad-words-brasil: "${source[position]}" fora de grupo em "${pattern}"`);
    }
    return Array.from(new Set(results.map(value => value.replace(/\s+/g, ' ').trim()).filter(Boolean)));
}
