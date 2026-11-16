import { LexiconGroup, words } from './group';

/**
 * Discriminação (raça, orientação, gênero, deficiência, origem, corpo).
 *
 * Termos clínicos e de identidade ("homossexual", "transgênero", "autismo",
 * "deficiência") ficam de fora: a pessoa precisa poder nomear a própria
 * identidade ou condição. Só entram os pejorativos.
 */
export const hate: LexiconGroup[] = [
    {
        category: 'hate',
        severity: 'high',
        terms: words(`
            macac(o|a) pret(inho|inha) negr(ao|ona)
            crioul(o|a) mulat(o|a)
            japa japa(o|ona) chin(esinho|esinha)
            judeu safado
            viad(o|inho|inho|agem) veiac(o|a) baitola bichona
            sapat(ao|ona) sapatona
            travesti(o|) asqueroso
            retardad(o|a) mongoloide mongol(ao|ona) debil mental
            aleijad(o|a) paralitic(o|a)
            gordo nojent(o|a) gorducha
        `).concat([
            'preto (sujo|fedido|nojento)',
            'negro (sujo|fedido|nojento)',
            'volta (pro|para o|pro seu|para o seu) (pais|continente|matagal)',
            'v(ai|a) (pro|para o) (congo|haiti|africa)',
            'odeio (gay|gays|viado|viados|lesbica|lesbicas|trans|travesti)',
            'lugar de (mulher|viado|preto) e (na|no) (cozinha|inferno|gueto)',
            'extermin(ar|io) (de |dos |das |)(gays|viados|pretos|judeus|mulheres)',
        ]),
    },
    {
        category: 'hate',
        severity: 'high',
        ambiguous: true,
        // Também são insultos genéricos; no modo normal só entram quando
        // dirigidos ou disfarçados. Em hate o sentido pejorativo é o que conta.
        terms: words(`
            viado bicha bixa boiola sapatona travesti
            retardado mongoloide
        `),
    },
];
