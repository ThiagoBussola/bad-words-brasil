import { LexiconGroup, words } from './group';

/**
 * Palavrão sem alvo. Plural, troca de "c" por "k" e de "ch" por "x" são
 * geradas na compilação, não precisam estar aqui.
 */
export const profanity: LexiconGroup[] = [
    {
        category: 'profanity',
        severity: 'low',
        terms: words(`
            merda merdinha merdao bosta bostinha cacete puto
            cag(ar|ada|ado|ando|ou|uei|ao|ona|alhao)
            peid(o|ar|ao|orreiro) mij(o|ar|ada|ao)
        `).concat([
            'puta merda',
            'que merda',
            'vai se (ferrar|lascar|catar)',
            'to cagando( e andando|)',
        ]),
    },
    {
        category: 'profanity',
        severity: 'low',
        ambiguous: true,
        // "fita cassete" existe; como palavrão é grafia errada de "cacete".
        terms: ['cassete'],
    },
    {
        category: 'profanity',
        severity: 'medium',
        terms: words(`
            caralh(o|a|udo|inho) caraio carai caraleo krl crl kct
            porra poha porran
            cu
            fod(a|e|er|eu|i|ido|ida|endo|ao|ona|astico|eram|am|emos|ase|asse|ace)
            fud(e|er|eu|i|ido|ida|endo|eram)
            pqp
        `).concat([
            'foda-se',
            'foda-c',
            'que se fod(a|am)',
            'se fod(er|e|eu)',
            'se fud(er|e|eu)',
            'nem fodendo',
            '(to|estou|tou) (pouco |)me fodendo',
            'puta que (o |me |te |)pariu',
            'puta q (o |)pariu',
            'casa do caralho',
            'caralho a quatro',
        ]),
    },
];
