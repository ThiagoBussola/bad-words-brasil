/**
 * O que o termo é.
 *
 * - `profanity`: palavrão sem alvo ("merda", "caralho").
 * - `insult`: ofensa a uma pessoa ("idiota", "vagabunda").
 * - `sexual`: vocabulário sexual explícito.
 * - `hate`: discriminação (raça, orientação, gênero, deficiência, origem, corpo).
 * - `harassment`: investida sexual ou perseguição dirigida a alguém.
 * - `threat`: ameaça à integridade de alguém.
 */
export type Category = 'profanity' | 'insult' | 'sexual' | 'hate' | 'harassment' | 'threat';

/**
 * - `low`: vulgar, mas comum em conversa informal ("merda", "idiota" solto).
 * - `medium`: palavrão forte ou ofensa clara.
 * - `high`: insulto discriminatório, assédio, ameaça.
 */
export type Severity = 'low' | 'medium' | 'high';

/**
 * Como o termo apareceu no texto.
 *
 * - `exact`: escrito normalmente.
 * - `obfuscated`: letras trocadas por símbolos, repetidas ou separadas ("p.u.t.a", "m3rd@", "puuuta").
 * - `masked`: parte escondida por máscara ("fod***", "p*rra").
 * - `phrase`: expressão de várias palavras ("vai tomar no cu").
 */
export type MatchKind = 'exact' | 'obfuscated' | 'masked' | 'phrase';

export interface Match {
    /** Termo do léxico que casou, sem acento e em minúsculas. Serve de id da regra em logs. */
    term: string;
    category: Category;
    /** Gravidade já considerando `directed`. */
    severity: Severity;
    kind: MatchKind;
    /** Trecho original do texto. */
    raw: string;
    /** Posição inicial em `text` (unidades UTF-16, igual a `String.prototype.slice`). */
    start: number;
    /** Posição final, exclusiva. */
    end: number;
    /** O termo veio dirigido a alguém ("seu idiota", "você é uma vaca"). Sobe um nível de gravidade. */
    directed: boolean;
}

export interface Analysis {
    /** Há pelo menos um termo dentro dos filtros pedidos. */
    flagged: boolean;
    /** Maior gravidade encontrada, ou `null` sem ocorrências. */
    severity: Severity | null;
    /** Categorias encontradas, sem repetição, na ordem em que aparecem. */
    categories: Category[];
    /** Ocorrências em ordem de posição, sem sobreposição. */
    matches: Match[];
}

export interface TermInput {
    /**
     * Palavra ou expressão. Aceita alternativas entre parênteses:
     * `"otari(o|a)"`, `"vai (se|te) ferrar"`, `"filh(o|a) da puta"`.
     */
    term: string;
    category?: Category;
    severity?: Severity;
    /**
     * Palavra com sentido inocente comum ("pau", "vaca"). Só é apontada em modo
     * `strict`, quando dirigida a alguém ou quando vem disfarçada.
     */
    ambiguous?: boolean;
}

export interface FilterOptions {
    /** Restringe a análise a estas categorias. Padrão: todas. */
    categories?: readonly Category[];
    /** Ignora ocorrências abaixo desta gravidade. Padrão: `low`. */
    minSeverity?: Severity;
    /** Aponta também palavras ambíguas escritas normalmente. Padrão: `false`. */
    strict?: boolean;
    /** Termos extras. String simples entra como `profanity` de gravidade `medium`. */
    add?: readonly (string | TermInput)[];
    /** Termos do léxico padrão a desligar. */
    remove?: readonly string[];
    /** Palavras ou expressões que nunca devem ser apontadas, do jeito que aparecem no texto. */
    allow?: readonly string[];
}

export type CensorStyle = 'full' | 'keep-first' | 'keep-edges';

export interface CensorOptions {
    /** Caractere da máscara. Padrão: `*`. */
    mask?: string;
    /**
     * - `full`: `******`
     * - `keep-first`: `p***`
     * - `keep-edges`: `p**a`
     */
    style?: CensorStyle;
    /** Substituição própria. Tem precedência sobre `mask` e `style`. */
    replace?: (match: Match) => string;
}

export interface Filter {
    analyze(text: string): Analysis;
    isProfane(text: string): boolean;
    censor(text: string, options?: CensorOptions): string;
}
