import type { Category, Severity } from '../types';

export interface LexiconGroup {
    category: Category;
    severity: Severity;
    /** Palavras com sentido inocente comum. Ver `TermInput.ambiguous`. */
    ambiguous?: boolean;
    terms: readonly string[];
}

/** Lista de palavras soltas separadas por espaço ou quebra de linha. */
export function words(list: string): string[] {
    return list.split(/\s+/).filter(Boolean);
}
